import * as XLSX from 'xlsx';

export interface ParsedExcel {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
  sheetName: string;
  rawData: unknown[][];
  detectedFormat: 'pivot' | 'stock' | 'customer' | 'flat' | 'unknown';
  headerRowIndex: number;
  dataStartRowIndex: number;
}

/**
 * Detect the format of the Excel file based on its structure
 */
function detectFormat(data: unknown[][]): ParsedExcel['detectedFormat'] {
  if (data.length < 2) return 'unknown';

  const firstRow = data[0];
  const firstRowStr = JSON.stringify(firstRow).toLowerCase();
  const secondRow = data[1] || [];
  const secondRowStr = JSON.stringify(secondRow).toLowerCase();

  // Pivot table: Excel pivot tables specifically have "Row Labels" and "Column Labels"
  // OR have "Sum of" as the FIRST cell text (not embedded in other headers)
  const firstCell = String(firstRow[0] ?? '').toLowerCase().trim();
  const isPivot = firstCell.includes('sum of') ||
    firstRowStr.includes('row labels') ||
    firstRowStr.includes('column labels');
  if (isPivot) return 'pivot';

  // Stock/SNS report: has product column + opening/purchase/closing columns
  if (firstRowStr.includes('opening') || firstRowStr.includes('purchase') || firstRowStr.includes('primary')) {
    return 'stock';
  }

  // Wide SNS format (WeikField style) - very wide with date-based columns
  if (secondRowStr.includes('opening') || secondRowStr.includes('purchases')) {
    return 'stock';
  }

  // Customer sales indicators
  if (firstRowStr.includes('customer') || firstRowStr.includes('store') || firstRowStr.includes('total amount')) {
    return 'customer';
  }

  return 'flat';
}

/**
 * Find the actual header row in the data
 */
function findHeaderRow(data: unknown[][]): { headerIndex: number; dataStartIndex: number } {
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (!row || !Array.isArray(row)) continue;
    
    // Check if this row contains headers (has meaningful text cells)
    const nonEmptyCells = row.filter(cell => 
      cell !== undefined && 
      cell !== null && 
      cell !== '' &&
      typeof cell === 'string' &&
      cell.length > 0
    );
    
    // If row has meaningful headers, use it
    if (nonEmptyCells.length >= 2) {
      // Check if next row has data (numbers or product names)
      const nextRow = data[i + 1];
      if (nextRow && Array.isArray(nextRow)) {
        const hasData = nextRow.some(cell => 
          typeof cell === 'number' || 
          (typeof cell === 'string' && cell.length > 0 && !cell.startsWith('Sum of'))
        );
        if (hasData) {
          return { headerIndex: i, dataStartIndex: i + 1 };
        }
      }
    }
  }
  
  return { headerIndex: 0, dataStartIndex: 1 };
}

/**
 * Clean and normalize header names
 */
function normalizeHeader(header: unknown): string {
  if (header === undefined || header === null) return '';
  const str = String(header).trim();
  
  // Remove Excel's "Sum of" prefix
  if (str.startsWith('Sum of ')) {
    return str.replace('Sum of ', '').trim();
  }
  
  // Clean up other common prefixes
  return str
    .replace(/^Row Labels$/i, 'Product')
    .replace(/^Column Labels$/i, 'Period')
    .trim();
}

/**
 * Parse pivot table format (like Bisk Farm, Catch)
 */
function parsePivotTable(data: unknown[][]): ParsedExcel {
  // Find header row - usually has month names
  let headerRowIndex = 0;
  let dataStartRowIndex = 1;
  
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i];
    if (!row || !Array.isArray(row)) continue;
    
    // Look for row with month patterns or "Row Labels"
    const hasRowLabels = row.some(cell => 
      typeof cell === 'string' && 
      (cell.toLowerCase().includes('row labels') || /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(cell))
    );
    
    if (hasRowLabels) {
      headerRowIndex = i;
      dataStartRowIndex = i + 1;
      break;
    }
  }
  
  // Extract headers
  const rawHeaders = data[headerRowIndex] as unknown[];
  const headers = rawHeaders.map(normalizeHeader).filter(h => h !== '');
  
  // Extract data rows
  const rows: Record<string, unknown>[] = [];
  for (let i = dataStartRowIndex; i < data.length; i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;
    
    // Skip empty rows or total rows
    const firstCell = String(row[0] || '').toLowerCase();
    if (!firstCell || firstCell.includes('total') || firstCell.includes('grand')) continue;
    
    const rowObj: Record<string, unknown> = {};
    rawHeaders.forEach((header, index) => {
      const normalizedHeader = normalizeHeader(header);
      if (normalizedHeader) {
        rowObj[normalizedHeader] = row[index];
      }
    });
    
    // Only add if we have a product name
    if (rowObj['Product'] && String(rowObj['Product']).trim() !== '') {
      rows.push(rowObj);
    }
  }
  
  return {
    headers,
    rows,
    totalRows: rows.length,
    sheetName: 'Sheet1',
    rawData: data,
    detectedFormat: 'pivot',
    headerRowIndex,
    dataStartRowIndex
  };
}

/**
 * Parse stock report format (like NILONS)
 */
function parseStockReport(data: unknown[][]): ParsedExcel {
  // Stock reports usually have headers in row 0
  const headerRowIndex = 0;
  const dataStartRowIndex = 1;
  
  const rawHeaders = data[headerRowIndex] as unknown[];
  const headers = rawHeaders.map(normalizeHeader).filter(h => h !== '');
  
  const rows: Record<string, unknown>[] = [];
  for (let i = dataStartRowIndex; i < data.length; i++) {
    const row = data[i];
    if (!Array.isArray(row)) continue;
    
    // Skip empty rows
    const hasData = row.some(cell => cell !== undefined && cell !== null && cell !== '');
    if (!hasData) continue;
    
    const rowObj: Record<string, unknown> = {};
    rawHeaders.forEach((header, index) => {
      const normalizedHeader = normalizeHeader(header);
      if (normalizedHeader) {
        rowObj[normalizedHeader] = row[index];
      }
    });
    
    // Only add if we have a product name
    if (rowObj['Product-1'] || rowObj['Product']) {
      rows.push(rowObj);
    }
  }
  
  return {
    headers,
    rows,
    totalRows: rows.length,
    sheetName: 'Sheet1',
    rawData: data,
    detectedFormat: 'stock',
    headerRowIndex,
    dataStartRowIndex
  };
}

/**
 * Parse Excel file with intelligent format detection (Node.js compatible)
 */
export async function parseExcelFile(file: File): Promise<ParsedExcel> {
  try {
    // Use ArrayBuffer which works in both browser and Node.js environments
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

    // Get the first sheet with data
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array format
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    if (jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    // Detect format
    const detectedFormat = detectFormat(jsonData);

    // Use specialized parser based on format
    if (detectedFormat === 'pivot') {
      const result = parsePivotTable(jsonData);
      result.sheetName = sheetName;
      return result;
    }

    if (detectedFormat === 'stock') {
      const result = parseStockReport(jsonData);
      result.sheetName = sheetName;
      return result;
    }

    // Default flat format parsing
    const { headerIndex, dataStartIndex } = findHeaderRow(jsonData);
    const rawHeaders = jsonData[headerIndex] as unknown[];
    const headers = rawHeaders.map(normalizeHeader).filter(h => h !== '');

    const rows: Record<string, unknown>[] = [];
    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!Array.isArray(row)) continue;

      const hasData = row.some(cell => cell !== undefined && cell !== null && cell !== '');
      if (!hasData) continue;

      const rowObj: Record<string, unknown> = {};
      rawHeaders.forEach((header, index) => {
        const normalizedHeader = normalizeHeader(header);
        if (normalizedHeader) {
          rowObj[normalizedHeader] = row[index];
        }
      });

      if (Object.keys(rowObj).length > 0) {
        rows.push(rowObj);
      }
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
      sheetName,
      rawData: jsonData,
      detectedFormat,
      headerRowIndex: headerIndex,
      dataStartRowIndex: dataStartIndex
    };
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to parse Excel file');
  }
}

/**
 * Get sample data for AI mapping preview
 */
export function getSampleDataForAI(parsed: ParsedExcel): {
  headers: string[];
  sampleRow: Record<string, unknown>;
} {
  return {
    headers: parsed.headers,
    sampleRow: parsed.rows[0] || {}
  };
}
