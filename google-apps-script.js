const SHEET_NAME = "Employee Information";
const SPREADSHEET_ID = "18L1-iwZW1AjPkavxrXA6EJ2xgU_5RQRm2n-PaqUdTBc";

const HEADERS = [
  "Timestamp",
  "ชื่อ - นามสกุล (ภาษาไทย)",
  "ชื่อ - นามสกุล (ภาษาอังกฤษ)",
  "วัน เดือน ปีเกิด",
  "เลขบัตรประชาชน",
  "หมายเลขโทรศัพท์",
  "เลขบัญชีธนาคาร (ที่ใช้ในบริษัทฯ)",
  "อีเมล (ที่ใช้ในบริษัทฯ)",
  "ชื่อผู้ติดต่อ (กรณีฉุกเฉิน)",
  "เบอร์ผู้ติดต่อ (กรณีฉุกเฉิน)",
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = getSheet();
    ensurePhoneColumnsAsTenDigits(sheet);

    sheet.appendRow([
      new Date(),
      cleanText(payload.fullNameTh),
      cleanText(payload.fullNameEn),
      cleanText(payload.birthDate),
      cleanText(payload.nationalId),
      phoneFormula(payload.phone),
      phoneFormula(payload.bankAccount),
      cleanText(payload.companyEmail),
      cleanText(payload.emergencyContactName),
      phoneFormula(payload.emergencyContactPhone),
    ]);

    return jsonResponse({ ok: true, message: "Saved" });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "Employee information endpoint is ready." });
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function ensurePhoneColumnsAsTenDigits(sheet) {
  sheet.getRange("F:F").setNumberFormat("0000000000");
  sheet.getRange("G:G").setNumberFormat("0000000000");
  sheet.getRange("J:J").setNumberFormat("0000000000");
}

function numericIdFormula(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return `=TEXT("${digits}", "0000000000")`;
}

function phoneFormula(value) {
  return numericIdFormula(value);
}

function cleanText(value) {
  return String(value || "").trim();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
