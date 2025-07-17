require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    InteractionType,
} = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    getVoiceConnection,
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const playdl = require('play-dl');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// --- Constants ---
const BUTTON_IDS = {
    PAUSE: 'pause',
    RESUME: 'resume',
    SKIP: 'skip',
    QUEUE: 'queue',
    CLEAR_QUEUE: 'clearqueue',
    PLAY: 'play',
};
const BUTTON_LABELS = {
    PAUSE: '⏸ Pause',
    RESUME: '🔁 Resume',
    SKIP: '⏭ Skip',
    QUEUE: '🎶 Queue List',
    CLEAR_QUEUE: '🗑️ Clear Queue',
};
const BUTTON_STYLES = {
    PRIMARY: ButtonStyle.Primary,
    SECONDARY: ButtonStyle.Secondary,
    DANGER: ButtonStyle.Danger,
};
const MESSAGES = {
    NO_QUEUE: '📭 ไม่มีเพลงในคิว',
    NO_QUEUE_NOW: '📭 ไม่มีเพลงในคิวตอนนี้',
    NO_SONG_PLAYING: '⛔ ไม่มีเพลงที่เล่นอยู่',
    NO_SONG_PAUSED: '⛔ ไม่มีเพลงที่หยุดอยู่',
    NO_SONG_IN_QUEUE: '❌ หาเพลงจาก YouTube ไม่เจอ',
    NO_VOICE_CHANNEL: '❌ เข้าห้องเสียงก่อนครับ',
    NO_YOUTUBE_LINK: '❌ ใส่ลิงก์ YouTube มาด้วย',
    PLAYLIST_ADDED: (title, count) => `📃 เพิ่ม Playlist: ${title} (${count} เพลง)`,
    SONG_PLAYING: (title, url) => `🎶 กำลังเล่น: ${title}\n${url}`,
    SONG_ADDED: '✅ เพิ่มเพลงในคิว',
    SONG_SKIP: '⏭ ข้ามเพลงแล้ว',
    SONG_PAUSE: '⏸ หยุดเพลงชั่วคราว',
    SONG_RESUME: '▶️ เล่นเพลงต่อ',
    QUEUE_LIST: '📋 คิวเพลง:',
    QUEUE_CLEARED: '🗑️ ล้างคิวแล้วครับ',
    NO_SONG_PLAYING_PAUSE: '⏸ ไม่มีเพลงที่กำลังเล่นอยู่',
    SONG_NOT_PAUSED: '▶️ เพลงไม่ได้หยุดอยู่',
    NO_SONG_LEFT: '📭 ไม่มีเพลงในคิวแล้ว ออกจากห้องนะครับ',
    INVALID_LINK: '⚠️ ลิงก์ไม่ถูกต้อง หรือไม่ใช่ YouTube ข้ามเพลงนี้',
    ERROR_PROCESSING: '❌ มีปัญหาในการประมวลผลเพลงหรือ playlist',
    ERROR_LOADING: '❌ เล่นเพลงนี้ไม่ได้ ข้ามไปเพลงถัดไป',
    MUSIC_CONTROLS: '🎵 ควบคุมเพลงที่นี่:',
    PLAY_COMMAND: 'ใช้คำสั่ง !play ตามด้วยลิงก์ หรือชื่อเพลง เพื่อเล่นเพลงใหม่นะครับ',
};

const queueMap = new Map(); // Map<GuildId, [url]>
const playerMap = new Map(); // Map<GuildId, player>

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// --- Utility Functions ---
function getQueue(guildId) {
    if (!queueMap.has(guildId)) queueMap.set(guildId, []);
    return queueMap.get(guildId);
}

function getPlayer(guildId) {
    return playerMap.get(guildId);
}

function setPlayer(guildId, player) {
    playerMap.set(guildId, player);
}

function clearQueue(guildId) {
    queueMap.set(guildId, []);
}

function sendQueue(channel, queue) {
    if (!queue || queue.length === 0) return channel.send(MESSAGES.NO_QUEUE);
    const list = queue.map((song, i) => `${i + 1}. ${song.title} (${song.url})`).join('\n');
    channel.send(`${MESSAGES.QUEUE_LIST}\n${list}`);
}

function sendMusicControls(channel) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(BUTTON_IDS.PAUSE).setLabel(BUTTON_LABELS.PAUSE).setStyle(BUTTON_STYLES.SECONDARY),
        new ButtonBuilder().setCustomId(BUTTON_IDS.RESUME).setLabel(BUTTON_LABELS.RESUME).setStyle(BUTTON_STYLES.PRIMARY),
        new ButtonBuilder().setCustomId(BUTTON_IDS.SKIP).setLabel(BUTTON_LABELS.SKIP).setStyle(BUTTON_STYLES.SECONDARY),
        new ButtonBuilder().setCustomId(BUTTON_IDS.QUEUE).setLabel(BUTTON_LABELS.QUEUE).setStyle(BUTTON_STYLES.PRIMARY),
        new ButtonBuilder().setCustomId(BUTTON_IDS.CLEAR_QUEUE).setLabel(BUTTON_LABELS.CLEAR_QUEUE).setStyle(BUTTON_STYLES.DANGER),
    );
    channel.send({
        content: MESSAGES.MUSIC_CONTROLS,
        components: [row],
    });
}

async function addToQueue(guildId, query, channel) {
    let songsToPlay = [];
    try {
        if (playdl.yt_validate(query) === 'playlist') {
            const playlist = await playdl.playlist_info(query, { incomplete: true });
            const videos = await playlist.all_videos();
            songsToPlay = videos.map(video => ({ url: video.url, title: video.title }));
            channel.send(MESSAGES.PLAYLIST_ADDED(playlist.title, songsToPlay.length));
        } else if (ytdl.validateURL(query)) {
            const info = await playdl.video_basic_info(query);
            songsToPlay.push({ url: query, title: info.video_details.title });
        } else {
            const results = await playdl.search(query, { limit: 1 });
            if (!results.length || !results[0].url)
                return channel.send(MESSAGES.NO_SONG_IN_QUEUE);
            songsToPlay.push({ url: results[0].url, title: results[0].title });
        }
    } catch (err) {
        console.error('🎵 Error while processing query:', err);
        return channel.send(MESSAGES.ERROR_PROCESSING);
    }
    const queue = getQueue(guildId);
    queue.push(...songsToPlay);
    return queue;
}

async function playNext(guildId, textChannel) {
    const queue = getQueue(guildId);
    const player = getPlayer(guildId);
    const connection = getVoiceConnection(guildId);

    if (!queue || queue.length === 0) {
        player?.stop();
        connection?.destroy();
        queueMap.delete(guildId);
        playerMap.delete(guildId);
        return textChannel.send(MESSAGES.NO_SONG_LEFT);
    }

    const song = queue.shift();
    if (!song || !song.url || !ytdl.validateURL(song.url)) {
        textChannel.send(MESSAGES.INVALID_LINK);
        return playNext(guildId, textChannel);
    }
    console.log('Playing URL from queue:', song.url, '| Title:', song.title);
    try {
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            opusEncoded: true,
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
        });
        const resource = createAudioResource(stream);
        player.play(resource);
        connection.subscribe(player);
        textChannel.send(MESSAGES.SONG_PLAYING(song.title, song.url));
        sendMusicControls(textChannel);
    } catch (error) {
        console.error('⛔ Error loading stream:', error);
        textChannel.send(MESSAGES.ERROR_LOADING);
        return playNext(guildId, textChannel);
    }
}

// --- Command Handlers ---
async function handlePlay(message, args) {
    const guildId = message.guild.id;
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply(MESSAGES.NO_VOICE_CHANNEL);
    const query = args.slice(1).join(' ');
    if (!query) return message.reply(MESSAGES.NO_YOUTUBE_LINK);
    await addToQueue(guildId, query, message.channel);

    if (!getVoiceConnection(guildId)) {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        setPlayer(guildId, player);

        player.on(AudioPlayerStatus.Idle, () => playNext(guildId, message.channel));
        player.on('error', (error) => {
            console.error('Player error:', error);
            playNext(guildId, message.channel);
        });

        await playNext(guildId, message.channel);
    } else {
        message.channel.send(MESSAGES.SONG_ADDED);
    }
}

function handleSkip(message) {
    const guildId = message.guild.id;
    const player = getPlayer(guildId);
    if (!player) return message.reply(MESSAGES.NO_SONG_PLAYING);
    player.stop(true);
    message.reply(MESSAGES.SONG_SKIP);
}

function handlePause(message) {
    const guildId = message.guild.id;
    const player = getPlayer(guildId);
    if (!player || player.state.status !== AudioPlayerStatus.Playing)
        return message.reply(MESSAGES.NO_SONG_PLAYING_PAUSE);
    player.pause();
    message.reply(MESSAGES.SONG_PAUSE);
}

function handleResume(message) {
    const guildId = message.guild.id;
    const player = getPlayer(guildId);
    if (!player || player.state.status !== AudioPlayerStatus.Paused)
        return message.reply(MESSAGES.SONG_NOT_PAUSED);
    player.unpause();
    message.reply(MESSAGES.SONG_RESUME);
}

function handleQueue(message) {
    const guildId = message.guild.id;
    const queue = getQueue(guildId);
    sendQueue(message.channel, queue);
}

function handleClearQueue(message) {
    const guildId = message.guild.id;
    clearQueue(guildId);
    message.reply(MESSAGES.QUEUE_CLEARED);
}

// --- Discord Events ---
client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
    const args = message.content.trim().split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
        case '!play': await handlePlay(message, args); break;
        case '!skip': handleSkip(message); break;
        case '!pause': handlePause(message); break;
        case '!resume': handleResume(message); break;
        case '!queue': handleQueue(message); break;
        case '!clearqueue': handleClearQueue(message); break;
        default: break;
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.type !== InteractionType.MessageComponent) return;
    const guildId = interaction.guildId;
    const player = getPlayer(guildId);
    const queue = getQueue(guildId);

    async function reply(content) {
        await interaction.reply({
            content,
            ephemeral: true,
        });
    }

    switch (interaction.customId) {
        case BUTTON_IDS.PLAY:
            await reply(MESSAGES.PLAY_COMMAND);
            break;
        case BUTTON_IDS.PAUSE:
            if (player?.state.status === AudioPlayerStatus.Playing) {
                player.pause();
                await reply(MESSAGES.SONG_PAUSE);
            } else {
                await reply(MESSAGES.NO_SONG_PLAYING);
            }
            break;
        case BUTTON_IDS.RESUME:
            if (player?.state.status === AudioPlayerStatus.Paused) {
                player.unpause();
                await reply(MESSAGES.SONG_RESUME);
            } else {
                await reply(MESSAGES.NO_SONG_PAUSED);
            }
            break;
        case BUTTON_IDS.SKIP:
            if (player) {
                player.stop(true);
                await reply(MESSAGES.SONG_SKIP);
            } else {
                await reply(MESSAGES.NO_SONG_PLAYING);
            }
            break;
        case BUTTON_IDS.QUEUE:
            if (!queue || queue.length === 0) {
                await reply(MESSAGES.NO_QUEUE_NOW);
            } else {
                const list = queue.map((song, i) => `${i + 1}. ${song.title}`).join('\n');
                await reply(`${MESSAGES.QUEUE_LIST}\n${list}`);
            }
            break;
        case BUTTON_IDS.CLEAR_QUEUE:
            clearQueue(guildId);
            await reply(MESSAGES.QUEUE_CLEARED);
            break;
        default:
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);
