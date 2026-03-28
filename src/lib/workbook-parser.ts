import * as XLSX from "xlsx";

export type WorkbookType =
  | "transaction-report"
  | "sales-report"
  | "inventory-report"
  | "unknown";

export type ParseMode = "table" | "pivot";

export interface ParsedWorkbookPreview {
  workbookType: WorkbookType;
  parseMode: ParseMode;
  selectedSheet: string;
  availableSheets: string[];
  headers: string[];
  rows: Record<string, unknown>[];
  warnings: string[];
  summary: {
    rowCount: number;
    uniqueProducts: number;
    uniqueCustomers: number;
    numericColumns: string[];
  };
}

type Candidate = ParsedWorkbookPreview & { score: number };

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s_./()-]+/g, "");
}

function cleanCell(value: unknown): string | number | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = String(value ?? "").trim();
  return text ? text : null;
}

function parseNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = String(value ?? "")
    .trim()
    .replace(/,/g, "")
    .replace(/\$/g, "");

  if (!text) {
    return null;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function isMonthHeader(value: unknown): boolean {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) {
    return false;
  }

  if (MONTH_NAMES.some((month) => text.startsWith(month) && /\d/.test(text))) {
    return true;
  }

  return false;
}

function isEmptyRow(row: unknown[]): boolean {
  return row.every((cell) => cell === null || cell === "");
}

function dedupeHeaders(row: unknown[]): string[] {
  const counts = new Map<string, number>();

  return row.map((cell, index) => {
    const base = String(cell ?? "").trim() || `Column ${index + 1}`;
    const nextCount = (counts.get(base) ?? 0) + 1;
    counts.set(base, nextCount);
    return nextCount === 1 ? base : `${base} ${nextCount}`;
  });
}

function sheetToMatrix(sheet: XLSX.WorkSheet): unknown[][] {
  return (XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: null,
    blankrows: false,
  }) as unknown[][]).map((row) => row.map(cleanCell));
}

function detectTransactionHeader(matrix: unknown[][]): { rowIndex: number; score: number } | null {
  let best: { rowIndex: number; score: number } | null = null;

  for (let rowIndex = 0; rowIndex < Math.min(matrix.length, 25); rowIndex += 1) {
    const row = matrix[rowIndex];
    const normalizedCells = row.map(normalize).filter(Boolean);
    if (normalizedCells.length < 5) {
      continue;
    }

    let score = 0;
    const requiredHints = [
      "date",
      "month",
      "customer",
      "product",
      "qty",
      "altqty",
      "rate",
      "totalamount",
      "invno",
    ];

    for (const hint of requiredHints) {
      if (normalizedCells.some((cell) => cell.includes(hint))) {
        score += 4;
      }
    }

    if (normalizedCells.some((cell) => cell.includes("subtotal") || cell.includes("grandtotal"))) {
      score -= 8;
    }

    score += normalizedCells.length;

    if (!best || score > best.score) {
      best = { rowIndex, score };
    }
  }

  return best && best.score >= 18 ? best : null;
}

function detectPivotHeader(matrix: unknown[][]): { rowIndex: number; monthIndexes: number[]; score: number } | null {
  let best: { rowIndex: number; monthIndexes: number[]; score: number } | null = null;

  for (let rowIndex = 0; rowIndex < Math.min(matrix.length, 20); rowIndex += 1) {
    const row = matrix[rowIndex];
    const normalizedCells = row.map(normalize);
    const monthIndexes = row
      .map((cell, index) => (isMonthHeader(cell) ? index : -1))
      .filter((index) => index >= 0);

    if (!normalizedCells.includes("rowlabels") || monthIndexes.length < 2) {
      continue;
    }

    const score = 12 + monthIndexes.length * 3;
    if (!best || score > best.score) {
      best = { rowIndex, monthIndexes, score };
    }
  }

  return best;
}

function detectStructuredHeader(matrix: unknown[][]): { rowIndex: number; score: number } | null {
  let best: { rowIndex: number; score: number } | null = null;

  for (let rowIndex = 0; rowIndex < Math.min(matrix.length, 25); rowIndex += 1) {
    const row = matrix[rowIndex];
    const normalizedCells = row.map(normalize).filter(Boolean);
    if (normalizedCells.length < 5) {
      continue;
    }

    let score = normalizedCells.length;
    const hints = ["product", "customer", "opening", "closing", "purchase", "salesreturn", "amount", "stock"];
    for (const hint of hints) {
      if (normalizedCells.some((cell) => cell.includes(hint))) {
        score += 2;
      }
    }

    if (normalizedCells.includes("rowlabels")) {
      score -= 4;
    }

    if (!best || score > best.score) {
      best = { rowIndex, score };
    }
  }

  return best && best.score >= 10 ? best : null;
}

function classifyHeaders(headers: string[], parseMode: ParseMode): WorkbookType {
  const normalizedHeaders = headers.map(normalize);

  const hasTransactionShape =
    normalizedHeaders.some((header) => header.includes("customer")) &&
    normalizedHeaders.some((header) => header.includes("product")) &&
    normalizedHeaders.some((header) => header.includes("date") || header.includes("month")) &&
    normalizedHeaders.some((header) => header.includes("qty") || header.includes("amount"));

  if (hasTransactionShape) {
    return "transaction-report";
  }

  if (
    normalizedHeaders.some((header) => header.includes("opening")) &&
    normalizedHeaders.some((header) => header.includes("closing"))
  ) {
    return "inventory-report";
  }

  if (parseMode === "pivot" || normalizedHeaders.some((header) => header.includes("month"))) {
    return "sales-report";
  }

  return "unknown";
}

function normalizeTableRows(matrix: unknown[][], headerRowIndex: number): { headers: string[]; rows: Record<string, unknown>[] } {
  const headers = dedupeHeaders(matrix[headerRowIndex] ?? []);
  const rows = matrix
    .slice(headerRowIndex + 1)
    .filter((row) => !isEmptyRow(row))
    .map((row) => {
      const record: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        record[header] = cleanCell(row[index] ?? null);
      });

      return record;
    })
    .filter((row) => Object.values(row).some((value) => value !== null && value !== ""));

  return { headers, rows };
}

function detectMetric(sheetName: string, matrix: unknown[][]): string {
  const leadingText = matrix
    .slice(0, 3)
    .flat()
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  const sheetLabel = sheetName.toLowerCase();
  if (leadingText.includes("total amount") || sheetLabel.includes("value")) {
    return "Sales Value";
  }

  if (leadingText.includes("alt qty") || sheetLabel.includes("case") || sheetLabel.includes("cas")) {
    return "Quantity";
  }

  if (leadingText.includes("stock") || leadingText.includes("closing")) {
    return "Inventory";
  }

  return "Metric";
}

function isCategoryLabel(label: string): boolean {
  const trimmed = label.trim();
  if (!trimmed) {
    return true;
  }

  const normalizedLabel = normalize(trimmed);
  if (normalizedLabel === "grandtotal" || normalizedLabel.endsWith("total")) {
    return true;
  }

  const hasDigit = /\d/.test(trimmed);
  const hasPack = /\*/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;
  const letters = trimmed.replace(/[^a-z]/gi, "");
  const upperRatio = letters ? trimmed.replace(/[^A-Z]/g, "").length / letters.length : 0;

  return !hasDigit && !hasPack && wordCount <= 3 && upperRatio >= 0.65;
}

function normalizePivotRows(
  matrix: unknown[][],
  headerRowIndex: number,
  monthIndexes: number[],
  sheetName: string,
): { headers: string[]; rows: Record<string, unknown>[] } {
  const headerRow = matrix[headerRowIndex] ?? [];
  const metric = detectMetric(sheetName, matrix);
  const rows: Record<string, unknown>[] = [];

  for (const rawRow of matrix.slice(headerRowIndex + 1)) {
    const product = String(rawRow[0] ?? "").trim();
    if (!product || isCategoryLabel(product)) {
      continue;
    }

    for (const monthIndex of monthIndexes) {
      const month = String(headerRow[monthIndex] ?? "").trim();
      const value = parseNumeric(rawRow[monthIndex]);

      if (!month || value === null) {
        continue;
      }

      rows.push({
        Product: product,
        Month: month,
        Value: value,
        Metric: metric,
        Sheet: sheetName,
      });
    }
  }

  return {
    headers: ["Product", "Month", "Value", "Metric", "Sheet"],
    rows,
  };
}

function buildSummary(headers: string[], rows: Record<string, unknown>[]) {
  const numericColumns = headers.filter((header) =>
    rows.some((row) => typeof row[header] === "number" || parseNumeric(row[header]) !== null),
  );

  const productKey = headers.find((header) => normalize(header).includes("product")) ?? "Product";
  const customerKey = headers.find((header) => normalize(header).includes("customer")) ?? "Customer";

  return {
    rowCount: rows.length,
    uniqueProducts: new Set(rows.map((row) => String(row[productKey] ?? "")).filter(Boolean)).size,
    uniqueCustomers: new Set(rows.map((row) => String(row[customerKey] ?? "")).filter(Boolean)).size,
    numericColumns,
  };
}

function createCandidate(
  sheetName: string,
  workbookType: WorkbookType,
  parseMode: ParseMode,
  headers: string[],
  rows: Record<string, unknown>[],
  score: number,
  warnings: string[] = [],
  availableSheets: string[],
): Candidate {
  return {
    workbookType,
    parseMode,
    selectedSheet: sheetName,
    availableSheets,
    headers,
    rows,
    warnings,
    summary: buildSummary(headers, rows),
    score,
  };
}

export function parseWorkbookPreview(
  workbook: XLSX.WorkBook,
  options: { preferTransactional?: boolean } = {},
): ParsedWorkbookPreview {
  const candidates: Candidate[] = [];
  const availableSheets = workbook.SheetNames;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      continue;
    }

    const matrix = sheetToMatrix(sheet);
    if (!matrix.length) {
      continue;
    }

    const nameBonus = /main/i.test(sheetName) ? 15 : 0;
    const transactionHeader = detectTransactionHeader(matrix);
    if (transactionHeader) {
      const normalized = normalizeTableRows(matrix, transactionHeader.rowIndex);
      candidates.push(
        createCandidate(
          sheetName,
          classifyHeaders(normalized.headers, "table"),
          "table",
          normalized.headers,
          normalized.rows,
          100 + transactionHeader.score + nameBonus,
          [],
          availableSheets,
        ),
      );
      continue;
    }

    const pivotHeader = detectPivotHeader(matrix);
    if (pivotHeader) {
      const normalized = normalizePivotRows(matrix, pivotHeader.rowIndex, pivotHeader.monthIndexes, sheetName);
      candidates.push(
        createCandidate(
          sheetName,
          classifyHeaders(normalized.headers, "pivot"),
          "pivot",
          normalized.headers,
          normalized.rows,
          60 + pivotHeader.score + nameBonus,
          [
            "Detected a summarized month-wise sheet and normalized it into Product / Month / Value rows.",
          ],
          availableSheets,
        ),
      );
      continue;
    }

    const structuredHeader = detectStructuredHeader(matrix);
    if (structuredHeader) {
      const normalized = normalizeTableRows(matrix, structuredHeader.rowIndex);
      candidates.push(
        createCandidate(
          sheetName,
          classifyHeaders(normalized.headers, "table"),
          "table",
          normalized.headers,
          normalized.rows,
          40 + structuredHeader.score + nameBonus,
          [],
          availableSheets,
        ),
      );
    }
  }

  const fallbackSheet = workbook.SheetNames[0];
  if (!candidates.length && fallbackSheet) {
    const normalized = normalizeTableRows(sheetToMatrix(workbook.Sheets[fallbackSheet]), 0);
    candidates.push(
      createCandidate(
        fallbackSheet,
        classifyHeaders(normalized.headers, "table"),
        "table",
        normalized.headers,
        normalized.rows,
        1,
        ["Used the first sheet because no stronger workbook pattern was detected."],
        availableSheets,
      ),
    );
  }

  const sorted = candidates.sort((left, right) => {
    if (options.preferTransactional) {
      if (left.workbookType === "transaction-report" && right.workbookType !== "transaction-report") {
        return -1;
      }
      if (right.workbookType === "transaction-report" && left.workbookType !== "transaction-report") {
        return 1;
      }
    }

    return right.score - left.score;
  });

  const [winner] = sorted;
  if (!winner) {
    return {
      workbookType: "unknown",
      parseMode: "table",
      selectedSheet: "",
      availableSheets,
      headers: [],
      rows: [],
      warnings: ["No readable data was found in the workbook."],
      summary: {
        rowCount: 0,
        uniqueProducts: 0,
        uniqueCustomers: 0,
        numericColumns: [],
      },
    };
  }

  return {
    workbookType: winner.workbookType,
    parseMode: winner.parseMode,
    selectedSheet: winner.selectedSheet,
    availableSheets: winner.availableSheets,
    headers: winner.headers,
    rows: winner.rows,
    warnings: winner.warnings,
    summary: winner.summary,
  };
}
