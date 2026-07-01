import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "file:///C:/Users/Laser%20Pui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const outputDir = "outputs/employee-information";
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Employee Information");

const headers = [
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

sheet.getRange("A1:J1").values = [headers];
sheet.getRange("A1:J1").format = {
  fill: "#E8EAED",
  font: { bold: true, color: "#202124" },
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#DADCE0" },
};

sheet.getRange("A:J").format = {
  font: { color: "#202124" },
};
sheet.getRange("A:A").format.numberFormat = "yyyy-mm-dd hh:mm";
sheet.getRange("D:D").format.numberFormat = "yyyy-mm-dd";
sheet.getRange("E:G").format.numberFormat = "@";
sheet.getRange("J:J").format.numberFormat = "@";

sheet.getRange("A1:J500").format.borders = {
  insideHorizontal: { style: "thin", color: "#ECEFF1" },
  insideVertical: { style: "thin", color: "#ECEFF1" },
};

sheet.getRange("A1:J500").format.wrapText = true;
sheet.getRange("A1:J1").format.rowHeightPx = 48;
sheet.getRange("A:J").format.columnWidthPx = 170;
sheet.getRange("A:A").format.columnWidthPx = 150;
sheet.getRange("B:C").format.columnWidthPx = 220;
sheet.getRange("G:G").format.columnWidthPx = 230;
sheet.getRange("H:H").format.columnWidthPx = 230;
sheet.getRange("I:I").format.columnWidthPx = 220;

sheet.freezePanes.freezeRows(1);
sheet.tables.add("A1:J500", true, "EmployeeInformationTable");

const inspect = await workbook.inspect({
  kind: "table",
  range: "Employee Information!A1:J3",
  include: "values",
  tableMaxRows: 3,
  tableMaxCols: 10,
});
console.log(inspect.ndjson);

const preview = await workbook.render({
  sheetName: "Employee Information",
  range: "A1:J10",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/employee_information_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/employee_information_database.xlsx`);
console.log(`${outputDir}/employee_information_database.xlsx`);
