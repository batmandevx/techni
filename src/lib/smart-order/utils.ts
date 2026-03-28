import { SmartOrderField, SmartSuggestion } from "@/lib/smart-order/types";

export const SMART_ORDER_FIELDS: SmartOrderField[] = [
  "ORDER_TYPE",
  "SALES_ORG",
  "DIST_CHANNEL",
  "DIVISION",
  "SOLD_TO",
  "SHIP_TO",
  "MATERIAL",
  "QTY",
  "PRICE",
  "REQ_DEL_DATE",
  "PLANT",
  "PO_NUMBER",
  "CURRENCY",
];

export const FIELD_LABELS: Record<SmartOrderField, string> = {
  ORDER_TYPE: "Order Type",
  SALES_ORG: "Sales Org",
  DIST_CHANNEL: "Dist Channel",
  DIVISION: "Division",
  SOLD_TO: "Sold-To",
  SHIP_TO: "Ship-To",
  MATERIAL: "Material",
  QTY: "Quantity",
  PRICE: "Price",
  REQ_DEL_DATE: "Requested Delivery Date",
  PLANT: "Plant",
  PO_NUMBER: "PO Number",
  CURRENCY: "Currency",
};

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s_\-.]+/g, "");
}

export function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const cleaned = String(value ?? "")
    .trim()
    .replace(/,/g, "")
    .replace(/\$/g, "");

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const converted = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    return toIsoDate(converted);
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const dotMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, first, second, yyyy] = slashMatch;
    const firstNum = Number(first);

    if (firstNum > 12) {
      return `${yyyy}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`;
    }

    return `${yyyy}-${first.padStart(2, "0")}-${second.padStart(2, "0")}`;
  }

  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) {
    return toIsoDate(iso);
  }

  return null;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[rows - 1][cols - 1];
}

export function similarity(a: string, b: string): number {
  const normalizedA = normalizeText(a);
  const normalizedB = normalizeText(b);

  if (!normalizedA || !normalizedB) {
    return 0;
  }

  if (normalizedA === normalizedB) {
    return 1;
  }

  const distance = levenshtein(normalizedA, normalizedB);
  return clamp(1 - distance / Math.max(normalizedA.length, normalizedB.length), 0, 1);
}

export function topSuggestions(
  input: string,
  candidates: Array<{ value: string; label: string }>,
  limit = 3,
): SmartSuggestion[] {
  return candidates
    .map((candidate) => ({
      ...candidate,
      score: similarity(input, `${candidate.value} ${candidate.label}`),
    }))
    .filter((candidate) => candidate.score > 0.25)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const groupKey = key(item);
    accumulator[groupKey] ??= [];
    accumulator[groupKey].push(item);
    return accumulator;
  }, {});
}

export function hashCode(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}
