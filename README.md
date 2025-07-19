# Discord Music Bot

บอทนี้ช่วยให้คุณเล่นเพลงจาก YouTube ในห้องเสียงของ Discord ได้อย่างง่ายดาย

## วิธีใช้งาน

## วิธีสร้าง Bot Discord

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. กด "New Application" เพื่อสร้างแอปใหม่ ตั้งชื่อและกด "Create"
3. ไปที่เมนู "Bot" แล้วกด "Add Bot" จากนั้นกด "Yes, do it!"
4. กด "Reset Token" เพื่อรับ Token แล้วคัดลอกไว้ (ใช้ในไฟล์ `.env`)
5. ไปที่ "OAuth2" > "URL Generator"
6. เลือก Scopes: `bot` และ Permissions: `Connect`, `Speak`, `Send Messages`, `Read Message History`
7. คัดลอกลิงก์ Invite แล้วนำไปเชิญบอทเข้ากลุ่ม Discord ของคุณ


### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Token

สร้างไฟล์ `.env` แล้วเพิ่มบรรทัดนี้:

```
DISCORD_TOKEN=ใส่โทเคนของคุณที่นี่
```

### 3. รันบอท

```bash
node index.js
```
หรือ
```bash
npm start
```

## คำสั่งที่รองรับ

- `!play <YouTube URL>`
  - เล่นเพลงจากลิงก์ YouTube ที่ระบุ
  - ตัวอย่าง: `!play https://www.youtube.com/watch?v=xxxxxx`
- `!skip`
  - ข้ามเพลงที่กำลังเล่นอยู่
- `!pause`
  - หยุดเพลงชั่วคราว
- `!resume`
  - เล่นเพลงต่อ
- `!queue`
  - แสดงคิวเพลงทั้งหมด
- `!clearqueue`
  - ล้างคิวเพลง

## หมายเหตุ
- ต้องเข้าห้องเสียงก่อนใช้คำสั่ง `!play`
- รองรับเฉพาะลิงก์ YouTube เท่านั้น

## การใช้งาน Docker (ถ้ามี Docker Desktop)

```bash
docker-compose up --build -d
```

## Donate ค่ากาแฟ ให้ Developer ได้ที่
- https://tipme.in.th/77976dad0a8493d03583e3ef

---

**ติดต่อ/แจ้งปัญหา:**
- เพิ่ม issue ใน repo หรือสอบถามผู้พัฒนา

Docker Hub
https://hub.docker.com/repository/docker/sixnaskunz/discord-bot-play-music