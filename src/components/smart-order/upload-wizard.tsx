"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { EmptyState, PageHero, Panel, StatusBadge } from "@/components/smart-order/ui";
import {
  SmartMappingResult,
  SmartOrderField,
  SmartOrderLine,
  SmartValidationRow,
  SmartValidationSummary,
} from "@/lib/smart-order/types";
import { FIELD_LABELS, SMART_ORDER_FIELDS } from "@/lib/smart-order/utils";
import { parseWorkbookPreview } from "@/lib/workbook-parser";

type ParsedFile = {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  selectedSheet: string;
  workbookType: string;
  parseMode: string;
  warnings: string[];
};

const steps = [
  "File Upload",
  "AI Mapping",
  "Validation",
  "Confirmation",
];

function confidenceClass(value: number) {
  if (value >= 0.9) return "bg-emerald-100 text-emerald-700";
  if (value >= 0.7) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function mappingSelectionsFromResult(headers: string[], mapping?: SmartMappingResult | null) {
  const record: Record<string, SmartOrderField | "UNMAPPED"> = {};
  headers.forEach((header) => {
    const mapped = mapping?.mappings.find((item) => item.sourceColumn === header);
    record[header] = mapped?.targetField ?? "UNMAPPED";
  });
  return record;
}

function buildMappingConfig(
  headers: string[],
  selections: Record<string, SmartOrderField | "UNMAPPED">,
  base?: SmartMappingResult | null,
): SmartMappingResult {
  const baseByColumn = new Map(base?.mappings.map((mapping) => [mapping.sourceColumn, mapping]));

  const mappings = headers
    .filter((header) => selections[header] && selections[header] !== "UNMAPPED")
    .map((header) => {
      const existing = baseByColumn.get(header);
      const targetField = selections[header] as SmartOrderField;
      return {
        sourceColumn: header,
        targetField,
        confidence: existing?.targetField === targetField ? existing.confidence : 0.82,
        rationale:
          existing?.targetField === targetField
            ? existing.rationale
            : "Mapping manually confirmed by operator.",
      };
    });

  const unmappedColumns = headers.filter((header) => selections[header] === "UNMAPPED");
  const overallConfidence = mappings.length
    ? mappings.reduce((sum, mapping) => sum + mapping.confidence, 0) / mappings.length
    : 0;

  return {
    mappings,
    unmappedColumns,
    warnings: mappings
      .filter((mapping) => mapping.confidence < 0.75)
      .map((mapping) => `${mapping.sourceColumn} mapped to ${mapping.targetField} with medium confidence.`),
    overallConfidence,
    provider: base?.provider ?? "heuristic",
  };
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

export function UploadWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [mappingResult, setMappingResult] = useState<SmartMappingResult | null>(null);
  const [mappingSelections, setMappingSelections] = useState<Record<string, SmartOrderField | "UNMAPPED">>({});
  const [validationRows, setValidationRows] = useState<SmartValidationRow[]>([]);
  const [validationSummary, setValidationSummary] = useState<SmartValidationSummary | null>(null);
  const [editableLines, setEditableLines] = useState<Array<Partial<SmartOrderLine> & { rowIndex: number }>>([]);
  const [skippedRows, setSkippedRows] = useState<number[]>([]);
  const [batchName, setBatchName] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "parsing" | "mapping" | "validating" | "saving">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const currentMapping = useMemo(() => {
    if (!parsedFile) return null;
    return buildMappingConfig(parsedFile.headers, mappingSelections, mappingResult);
  }, [parsedFile, mappingSelections, mappingResult]);

  async function parseWorkbook(file: File) {
    setLoadingState("parsing");
    setMessage(null);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array", cellDates: true });
    const parsed = parseWorkbookPreview(workbook, { preferTransactional: true });

    const nextParsedFile = {
      fileName: file.name,
      headers: parsed.headers,
      rows: parsed.rows,
      selectedSheet: parsed.selectedSheet,
      workbookType: parsed.workbookType,
      parseMode: parsed.parseMode,
      warnings: parsed.warnings,
    };

    setParsedFile(nextParsedFile);
    setBatchName(`${sanitizeFileName(file.name)} batch`);
    setStep(2);
    setLoadingState("idle");
    setMessage(parsed.warnings[0] ?? null);

    await runMapping(nextParsedFile);
  }

  const onDrop = async (files: File[]) => {
    const [file] = files;
    if (!file) return;
    await parseWorkbook(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
  });

  async function runMapping(file = parsedFile) {
    if (!file) return;

    setLoadingState("mapping");
    setMessage(null);

    const response = await fetch("/api/ai/map-columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headers: file.headers,
        sampleRows: file.rows.slice(0, 2),
      }),
    });

    if (!response.ok) {
      setMessage("AI mapping failed. You can still map fields manually.");
      setLoadingState("idle");
      return;
    }

    const result = (await response.json()) as SmartMappingResult;
    setMappingResult(result);
    setMappingSelections(mappingSelectionsFromResult(file.headers, result));
    setLoadingState("idle");
  }

  async function runValidation(nextRows?: Array<Partial<SmartOrderLine> & { rowIndex: number }>) {
    if (!parsedFile || !currentMapping) return;

    setLoadingState("validating");
    setMessage(null);

    const response = await fetch("/api/ai/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        nextRows
          ? { normalizedRows: nextRows }
          : {
              rows: parsedFile.rows,
              mapping: currentMapping,
            },
      ),
    });

    if (!response.ok) {
      setMessage("Validation failed. Please try again.");
      setLoadingState("idle");
      return;
    }

    const result = (await response.json()) as {
      rows: SmartValidationRow[];
      summary: SmartValidationSummary;
    };

    setValidationRows(result.rows);
    setValidationSummary(result.summary);
    setEditableLines(result.rows.map((row) => ({ ...row.line })));
    setSkippedRows(result.rows.filter((row) => !row.valid).map((row) => row.line.rowIndex));
    setStep(3);
    setLoadingState("idle");
  }

  function updateLine(rowIndex: number, key: keyof SmartOrderLine, value: string) {
    setEditableLines((current) =>
      current.map((row) =>
        row.rowIndex === rowIndex
          ? {
              ...row,
              [key]:
                key === "quantity" || key === "price"
                  ? Number(value)
                  : value,
            }
          : row,
      ),
    );
  }

  async function createBatchAndProcess() {
    if (!parsedFile || !currentMapping) return;
    const includedLines = validationRows
      .filter((row) => row.valid && !skippedRows.includes(row.line.rowIndex))
      .map((row) => row.line);

    if (!includedLines.length) {
      setMessage("There are no valid rows to process. Fix or skip invalid rows first.");
      return;
    }

    setLoadingState("saving");
    setMessage(null);

    const createResponse = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchName,
        fileName: parsedFile.fileName,
        uploadedBy: "usr_admin",
        filePreview: parsedFile.rows.slice(0, 5),
        mappingConfig: currentMapping,
        lines: includedLines,
      }),
    });

    if (!createResponse.ok) {
      setMessage("Batch creation failed.");
      setLoadingState("idle");
      return;
    }

    const { batch } = (await createResponse.json()) as { batch: { id: string } };

    await fetch(`/api/batches/${batch.id}/process`, { method: "POST" });
    router.push(`/dashboard/orders?batchId=${batch.id}`);
  }

  const unresolvedInvalidRows = validationRows.filter(
    (row) => !row.valid && !skippedRows.includes(row.line.rowIndex),
  );

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Upload Wizard"
        title="Map unpredictable order files into a clean SAP-ready batch."
        description="The engine parses external spreadsheets locally in the browser, proposes SAP field mappings, validates each line against cached master data, then queues only the valid rows for SmartOrder processing."
      />

      <Panel title="Progress" subtitle="Four-step workflow from raw spreadsheet to SAP batch">
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((label, index) => {
            const current = index + 1;
            const active = current === step;
            const completed = current < step;

            return (
              <div
                key={label}
                className={`rounded-2xl border px-4 py-4 ${
                  active
                    ? "border-[#e89a2d] bg-[#fff3df]"
                    : completed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step {current}</p>
                <p className="mt-2 font-semibold text-slate-950">{label}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      {message ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="1. Upload Source File" subtitle="Accepts .xlsx, .xls, and .csv">
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-[28px] border-2 border-dashed px-6 py-12 text-center transition ${
              isDragActive ? "border-[#e89a2d] bg-[#fff7ea]" : "border-slate-300 bg-slate-50 hover:border-slate-400"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a2e] text-white">
              {loadingState === "parsing" ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <p className="mt-5 text-lg font-semibold text-slate-950">
              {isDragActive ? "Drop the order file here" : "Drag and drop an order file"}
            </p>
            <p className="mt-2 text-sm text-slate-500">or click to browse from your machine</p>
          </div>

          {parsedFile ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FileSpreadsheet className="h-5 w-5 text-[#1a1a2e]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{parsedFile.fileName}</p>
                  <p className="text-sm text-slate-500">
                    {parsedFile.rows.length} rows, {parsedFile.headers.length} columns
                  </p>
                  <p className="text-xs text-slate-400">
                    {parsedFile.selectedSheet || "Unknown sheet"} · {parsedFile.workbookType} · {parsedFile.parseMode}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel title="Source Preview" subtitle="First few rows from the uploaded file">
          {parsedFile ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    {parsedFile.headers.map((header) => (
                      <th key={header} className="pb-3 pr-4 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedFile.rows.slice(0, 6).map((row, index) => (
                    <tr key={index}>
                      {parsedFile.headers.map((header) => (
                        <td key={header} className="py-3 pr-4 text-slate-700">
                          {String(row[header] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No file uploaded yet"
              description="Upload a spreadsheet to preview raw order rows before AI mapping begins."
            />
          )}
        </Panel>
      </div>

      {parsedFile ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel
            title="2. AI Column Mapping"
            subtitle="Review and override the suggested SAP field mapping"
            action={
              <button
                type="button"
                onClick={() => runMapping()}
                className="inline-flex items-center gap-2 rounded-full bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white"
              >
                {loadingState === "mapping" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                Run Mapping
              </button>
            }
          >
            {currentMapping ? (
              <div className="space-y-3">
                {parsedFile.headers.map((header) => {
                  const currentSelection = mappingSelections[header] ?? "UNMAPPED";
                  const existing = currentMapping.mappings.find((mapping) => mapping.sourceColumn === header);

                  return (
                    <div key={header} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Source Column</p>
                        <p className="mt-2 font-semibold text-slate-950">{header}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                      <select
                        value={currentSelection}
                        onChange={(event) =>
                          setMappingSelections((current) => ({
                            ...current,
                            [header]: event.target.value as SmartOrderField | "UNMAPPED",
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="UNMAPPED">Leave Unmapped</option>
                        {SMART_ORDER_FIELDS.map((field) => (
                          <option key={field} value={field}>
                            {FIELD_LABELS[field]}
                          </option>
                        ))}
                      </select>
                      {currentSelection !== "UNMAPPED" ? (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${confidenceClass(existing?.confidence ?? 0.82)}`}>
                          {Math.round((existing?.confidence ?? 0.82) * 100)}%
                        </span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Skipped</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Mapping not generated yet"
                description="Upload a file and run AI mapping to align external headers with SAP sales order fields."
              />
            )}
          </Panel>

          <Panel
            title="Mapping Summary"
            subtitle="Confidence and workflow actions"
            action={
              currentMapping ? (
                <button
                  type="button"
                  onClick={() => runValidation()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  {loadingState === "validating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Validate Rows
                </button>
              ) : null
            }
          >
            {currentMapping ? (
              <div className="space-y-5">
                <div className="rounded-3xl bg-[#1a1a2e] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-[#f6bf72]" />
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f4d9b1]">
                      {currentMapping.provider === "gemini" ? "Gemini mapping" : "Heuristic mapping"}
                    </p>
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{Math.round(currentMapping.overallConfidence * 100)}%</p>
                  <p className="mt-2 text-sm text-slate-300">Overall confidence across mapped headers.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Mapped Columns</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{currentMapping.mappings.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Unmapped Columns</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{currentMapping.unmappedColumns.length}</p>
                  </div>
                </div>

                {currentMapping.warnings.length ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div className="space-y-2 text-sm text-amber-700">
                        {currentMapping.warnings.map((warning) => (
                          <p key={warning}>{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                title="Waiting for mapping"
                description="Confidence scoring and warnings will appear here after the AI mapping step runs."
              />
            )}
          </Panel>
        </div>
      ) : null}

      {validationRows.length ? (
        <div className="space-y-6">
          <Panel
            title="3. Validation Results"
            subtitle="Fix rows inline or leave invalid rows skipped from the final batch"
            action={
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => runValidation(editableLines)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {loadingState === "validating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                  Revalidate Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (unresolvedInvalidRows.length) {
                      setMessage("Fix invalid rows or keep them skipped before moving to confirmation.");
                      return;
                    }
                    setStep(4);
                    setMessage(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            }
          >
            {validationSummary ? (
              <div className="mb-6 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Valid Rows</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{validationSummary.validRows}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Invalid Rows</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{validationSummary.invalidRows}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Warnings</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{validationSummary.warningRows}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Duplicates</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{validationSummary.duplicates}</p>
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Skip</th>
                    <th className="pb-3 pr-4 font-medium">Row</th>
                    <th className="pb-3 pr-4 font-medium">Sold-To</th>
                    <th className="pb-3 pr-4 font-medium">Material</th>
                    <th className="pb-3 pr-4 font-medium">Qty</th>
                    <th className="pb-3 pr-4 font-medium">Price</th>
                    <th className="pb-3 pr-4 font-medium">Req Date</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationRows.map((row, index) => {
                    const editable = editableLines[index];
                    return (
                      <tr key={row.line.rowIndex}>
                        <td className="py-3 pr-4">
                          <input
                            type="checkbox"
                            checked={skippedRows.includes(row.line.rowIndex)}
                            onChange={(event) =>
                              setSkippedRows((current) =>
                                event.target.checked
                                  ? [...current, row.line.rowIndex]
                                  : current.filter((value) => value !== row.line.rowIndex),
                              )
                            }
                          />
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{row.line.rowIndex}</td>
                        <td className="py-3 pr-4">
                          <input
                            value={String(editable?.soldTo ?? "")}
                            onChange={(event) => updateLine(row.line.rowIndex, "soldTo", event.target.value)}
                            className="w-28 rounded-xl border border-slate-200 px-3 py-2"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            value={String(editable?.material ?? "")}
                            onChange={(event) => updateLine(row.line.rowIndex, "material", event.target.value)}
                            className="w-32 rounded-xl border border-slate-200 px-3 py-2"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            value={String(editable?.quantity ?? "")}
                            onChange={(event) => updateLine(row.line.rowIndex, "quantity", event.target.value)}
                            className="w-24 rounded-xl border border-slate-200 px-3 py-2"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            value={String(editable?.price ?? "")}
                            onChange={(event) => updateLine(row.line.rowIndex, "price", event.target.value)}
                            className="w-24 rounded-xl border border-slate-200 px-3 py-2"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            value={String(editable?.requestedDeliveryDate ?? "")}
                            onChange={(event) => updateLine(row.line.rowIndex, "requestedDeliveryDate", event.target.value)}
                            className="w-32 rounded-xl border border-slate-200 px-3 py-2"
                          />
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={row.line.status} />
                        </td>
                        <td className="py-3 text-slate-600">
                          <div className="space-y-1">
                            {row.line.validationErrors.map((error) => (
                              <p key={error}>{error}</p>
                            ))}
                            {row.line.warnings.map((warning) => (
                              <p key={warning} className="text-amber-700">
                                {warning}
                              </p>
                            ))}
                            {row.suggestions.soldTo.concat(row.suggestions.material).slice(0, 2).map((suggestion) => (
                              <p key={`${suggestion.value}-${suggestion.label}`} className="text-sky-700">
                                Suggestion: {suggestion.value} - {suggestion.label}
                              </p>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      ) : null}

      {step === 4 && validationRows.length ? (
        <Panel
          title="4. Confirmation & Processing"
          subtitle="Only valid rows will be saved into the final batch and submitted for SAP creation"
          action={
            <button
              type="button"
              onClick={createBatchAndProcess}
              className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950"
            >
              {loadingState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Create Orders in SAP
            </button>
          }
        >
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1fr]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Batch Name</span>
                <input
                  value={batchName}
                  onChange={(event) => setBatchName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-950">Batch file</p>
                <p className="mt-2">{parsedFile?.fileName}</p>
                <p className="mt-4 font-semibold text-slate-950">Included rows</p>
                <p className="mt-2">
                  {validationRows.filter((row) => row.valid && !skippedRows.includes(row.line.rowIndex)).length} valid rows will be processed.
                </p>
                <p className="mt-3">{skippedRows.length} rows remain skipped and excluded from SAP processing.</p>
              </div>
            </div>
            <div className="space-y-3">
              {validationRows
                .filter((row) => row.valid && !skippedRows.includes(row.line.rowIndex))
                .map((row) => (
                  <div key={row.line.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {row.line.soldTo} / {row.line.material}
                      </p>
                      <p className="text-sm text-slate-500">
                        Qty {row.line.quantity} · Req {row.line.requestedDeliveryDate}
                      </p>
                    </div>
                    <StatusBadge status={row.line.status} />
                  </div>
                ))}
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
