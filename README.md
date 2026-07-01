# Employee Annual Information Form

เว็บฟอร์มสำหรับกรอกข้อมูลประจำปีของพนักงาน และส่งข้อมูลเข้า Google Sheet ผ่าน Google Apps Script

Google Sheet ฐานข้อมูล:
https://docs.google.com/spreadsheets/d/18L1-iwZW1AjPkavxrXA6EJ2xgU_5RQRm2n-PaqUdTBc

## ไฟล์หลัก

- `index.html` หน้าเว็บฟอร์ม
- `style.css` หน้าตาเว็บ
- `app.js` ตรวจข้อมูลและส่งข้อมูลไป Apps Script
- `google-apps-script.js` โค้ดฝั่ง Google Sheet

## วิธีตั้งค่า Google Sheet

1. สร้าง Google Sheet ใหม่
2. ไปที่ Extensions > Apps Script
3. วางโค้ดจาก `google-apps-script.js`
4. กด Deploy > New deployment
5. เลือกประเภท Web app
6. ตั้งค่า Execute as เป็น Me
7. ตั้งค่า Who has access เป็น Anyone
8. Deploy แล้วคัดลอก Web app URL
9. เปิด `app.js` แล้วใส่ URL ในบรรทัดนี้

```js
const APPS_SCRIPT_URL = "PASTE_WEB_APP_URL_HERE";
```

หลังจากนั้นเปิด `index.html` เพื่อใช้งานฟอร์มได้เลย
