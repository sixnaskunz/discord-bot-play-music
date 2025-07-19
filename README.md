# Discord Music Bot

บอทนี้ช่วยให้คุณเล่นเพลงจาก YouTube ในห้องเสียงของ Discord ได้อย่างง่ายดาย

## วิธีใช้งาน

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
