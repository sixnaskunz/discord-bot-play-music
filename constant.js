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
    PRIMARY: 1, // ButtonStyle.Primary
    SECONDARY: 2, // ButtonStyle.Secondary
    DANGER: 4, // ButtonStyle.Danger
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

module.exports = {
    BUTTON_IDS,
    BUTTON_LABELS,
    BUTTON_STYLES,
    MESSAGES,
};
