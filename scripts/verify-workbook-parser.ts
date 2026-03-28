import * as XLSX from "xlsx";
import { parseWorkbookPreview } from "../src/lib/workbook-parser";

const files = [
  "public/Bisk Farm Sales report (Sales Trend ) till Feb 2026.xlsx",
  "public/NILONS SNS REPORT FEB-26 (2).xlsx",
  "public/Sales report -Catch (Sales Trend ) till FEB-2026 (2).xlsx",
  "public/Sales report-Nilons (Sales Trend ) till FEB 2026.xlsx",
  "public/SNS WEIKFIELD TILL FEB - 2026 (1).xlsx",
  "public/WeikField Sales Trend report Till  Feb-26.xlsx",
];

for (const file of files) {
  const workbook = XLSX.readFile(file, { cellDates: true });
  const parsed = parseWorkbookPreview(workbook, { preferTransactional: true });

  if (!parsed.headers.length || !parsed.rows.length) {
    throw new Error(`Parser returned no usable rows for ${file}`);
  }

  console.log(
    [
      file,
      `sheet=${parsed.selectedSheet}`,
      `type=${parsed.workbookType}`,
      `mode=${parsed.parseMode}`,
      `rows=${parsed.rows.length}`,
      `cols=${parsed.headers.length}`,
    ].join(" | "),
  );
}

console.log("Workbook parser verification completed successfully.");
