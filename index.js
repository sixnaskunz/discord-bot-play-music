require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    getVoiceConnection,
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('ffmpeg-static');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const queueMap = new Map(); // Map<GuildId, [url]>
const playerMap = new Map(); // Map<GuildId, player>

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

async function playNext(guildId, textChannel) {
    const queue = queueMap.get(guildId);
    const player = playerMap.get(guildId);
    const connection = getVoiceConnection(guildId);

    if (!queue || queue.length === 0) {
        player?.stop();
        connection?.destroy();
        queueMap.delete(guildId);
        playerMap.delete(guildId);
        return textChannel.send('📭 ไม่มีเพลงในคิวแล้ว ออกจากห้องนะครับ');
    }

    const url = queue.shift();
    console.log('[DEBUG] Playing URL from queue:', url);

    if (!url || !ytdl.validateURL(url)) {
        textChannel.send('⚠️ ลิงก์ไม่ถูกต้อง หรือไม่ใช่ YouTube ข้ามเพลงนี้');
        return playNext(guildId, textChannel);
    }

    try {
        // ใช้ ytdl แบบ stream ผ่าน FFmpeg path
        const stream = ytdl(url, {
            filter: 'audioonly',
            highWaterMark: 1 << 25,
            dlChunkSize: 0,
            ffmpegPath: ffmpeg, // ชี้ path ไปที่ binary
        });

        const resource = createAudioResource(stream);

        player.play(resource);
        connection.subscribe(player);

        textChannel.send(`🎶 กำลังเล่น: ${url}`);
    } catch (error) {
        console.error('⛔ Error loading stream:', error);
        textChannel.send('❌ เล่นเพลงนี้ไม่ได้ ข้ามไปเพลงถัดไป');
        return playNext(guildId, textChannel);
    }
}

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const args = message.content.trim().split(' ');
    const command = args[0].toLowerCase();
    const guildId = message.guild.id;
    const voiceChannel = message.member.voice.channel;

    switch (command) {
        case '!play': {
            if (!voiceChannel) return message.reply('❌ เข้าห้องเสียงก่อนครับ');

            const query = args.slice(1).join(' ');
            if (!query) return message.reply('❌ ใส่ลิงก์ YouTube มาด้วย');

            if (!ytdl.validateURL(query)) {
                return message.reply('❌ กรุณาใส่ลิงก์ YouTube ที่ถูกต้อง');
            }

            if (!queueMap.has(guildId)) queueMap.set(guildId, []);
            const queue = queueMap.get(guildId);
            queue.push(query);

            if (!getVoiceConnection(guildId)) {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guildId,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer();
                playerMap.set(guildId, player);

                player.on(AudioPlayerStatus.Idle, () => {
                    playNext(guildId, message.channel);
                });

                player.on('error', (error) => {
                    console.error('Player error:', error);
                    playNext(guildId, message.channel);
                });

                await playNext(guildId, message.channel);
            } else {
                message.channel.send(`✅ เพิ่มเพลงในคิว: ${query}`);
            }
            break;
        }

        case '!skip': {
            const player = playerMap.get(guildId);
            if (!player) return message.reply('❌ ยังไม่มีเพลงที่เล่นอยู่');
            player.stop(true);
            message.reply('⏭ ข้ามเพลงแล้ว');
            break;
        }

        case '!pause': {
            const player = playerMap.get(guildId);
            if (!player || player.state.status !== AudioPlayerStatus.Playing)
                return message.reply('⏸ ไม่มีเพลงที่กำลังเล่นอยู่');
            player.pause();
            message.reply('⏸ หยุดเพลงชั่วคราว');
            break;
        }

        case '!resume': {
            const player = playerMap.get(guildId);
            if (!player || player.state.status !== AudioPlayerStatus.Paused)
                return message.reply('▶️ เพลงไม่ได้หยุดอยู่');
            player.unpause();
            message.reply('▶️ เล่นเพลงต่อ');
            break;
        }

        case '!queue': {
            const queue = queueMap.get(guildId);
            if (!queue || queue.length === 0) return message.reply('📭 ไม่มีเพลงในคิว');
            const list = queue.map((url, i) => `${i + 1}. ${url}`).join('\n');
            message.reply(`📋 คิวเพลง:\n${list}`);
            break;
        }

        case '!clearqueue': {
            queueMap.set(guildId, []);
            message.reply('🗑️ ล้างคิวแล้วครับ');
            break;
        }

        default:
            break;
    }
});

client.login(process.env.DISCORD_TOKEN);
