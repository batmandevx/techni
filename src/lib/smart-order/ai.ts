import { GoogleGenerativeAI } from '@google/generative-ai';
import { SmartOrderField } from './types';

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface SmartMappingResult {
  mappings: Record<string, string>;
  confidence: number;
  unmapped_columns: string[];
  warnings: string[];
  suggestions?: Record<string, string[]>;
}

// Extended field list for real-world Excel files (extended from SmartOrderField)
export const SAP_FIELDS = [
  'ORDER_TYPE', 'SOLD_TO', 'SHIP_TO', 'MATERIAL', 'QTY',
  'UOM', 'PRICE', 'CURRENCY', 'REQ_DEL_DATE', 'PO_NUMBER',
  'SALES_ORG', 'DIST_CHANNEL', 'DIVISION', 'PLANT',
  // Additional fields for real-world files
  'QUANTITY', 'REQ_DATE', 'UOM', 'PLANT'
] as const;

export type SAPFieldType = typeof SAP_FIELDS[number];

// Additional field aliases for common report formats
const FIELD_ALIASES: Record<string, string[]> = {
  'ORDER_TYPE': ['order type', 'order_type', 'doc_type', 'document type', 'sale type'],
  'SOLD_TO': ['sold to', 'customer', 'customer code', 'customer name', 'party', 'party code', 'party name', 'dealer', 'retailer'],
  'SHIP_TO': ['ship to', 'delivery to', 'consignee', 'shipping address'],
  'MATERIAL': ['material', 'product', 'item', 'sku', 'article', 'product code', 'product name', 'item code', 'item name', 'goods', 'material code', 'material description'],
  'QUANTITY': ['qty', 'quantity', 'ordered qty', 'order qty', 'alt qty', 'primary', 'sale', 'sales', 'primary sales', 'target', 'opening', 'closing'],
  'UOM': ['uom', 'unit', 'unit of measure', 'base uom'],
  'PRICE': ['price', 'rate', 'value', 'amount', 'net value', 'total amount', 'cif rate', 'rate rs'],
  'CURRENCY': ['currency', 'curr', 'currency key'],
  'REQ_DATE': ['req date', 'requested delivery date', 'delivery date', 'date', 'order date', 'month', 'period'],
  'PO_NUMBER': ['po number', 'po', 'purchase order', 'reference', 'ref', 'your reference'],
  'SALES_ORG': ['sales org', 'sales organization', 'sales_office'],
  'DIST_CHANNEL': ['dist channel', 'distribution channel', 'dc'],
  'DIVISION': ['division', 'div', 'sector'],
  'PLANT': ['plant', 'supplying plant', 'warehouse', 'location']
};

/**
 * Calculate string similarity for fuzzy matching
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Find the best matching SAP field for a column header
 */
function findBestFieldMatch(header: string): { field: string; confidence: number } | null {
  const normalizedHeader = header.toLowerCase().trim();
  let bestMatch: { field: string; confidence: number } | null = null;
  
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    // Direct match with aliases
    for (const alias of aliases) {
      const similarity = calculateSimilarity(normalizedHeader, alias);
      if (similarity >= 0.7 && (!bestMatch || similarity > bestMatch.confidence)) {
        bestMatch = { field, confidence: similarity };
      }
    }
    
    // Check if header contains the alias or vice versa
    if (normalizedHeader.includes(field.toLowerCase()) || 
        field.toLowerCase().includes(normalizedHeader)) {
      const confidence = 0.8;
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { field, confidence };
      }
    }
  }
  
  return bestMatch;
}

/**
 * Heuristic mapping fallback when AI is unavailable
 */
export function heuristicMapping(headers: string[]): SmartMappingResult {
  const mappings: Record<string, string> = {};
  const unmapped: string[] = [];
  let totalConfidence = 0;
  let mappedCount = 0;
  
  for (const header of headers) {
    const match = findBestFieldMatch(header);
    
    if (match && match.confidence >= 0.7) {
      // Don't overwrite if we already have a mapping for this field
      const alreadyMapped = Object.values(mappings).includes(match.field);
      if (!alreadyMapped) {
        mappings[header] = match.field;
        totalConfidence += match.confidence;
        mappedCount++;
      } else {
        unmapped.push(header);
      }
    } else {
      unmapped.push(header);
    }
  }
  
  // Post-processing: Map known patterns
  for (const header of headers) {
    const normalized = header.toLowerCase();
    
    // Month columns -> REQ_DATE
    if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-\s]?\d{2,4}$/i.test(normalized)) {
      if (!mappings[header]) {
        mappings[header] = 'REQ_DATE';
        mappedCount++;
      }
    }
    
    // Remove from unmapped if mapped
    const idx = unmapped.indexOf(header);
    if (idx > -1 && mappings[header]) {
      unmapped.splice(idx, 1);
    }
  }
  
  return {
    mappings,
    confidence: mappedCount > 0 ? totalConfidence / mappedCount : 0,
    unmapped_columns: unmapped,
    warnings: unmapped.length > 0 ? [`${unmapped.length} columns could not be mapped`] : [],
    suggestions: generateSuggestions(unmapped)
  };
}

/**
 * Generate suggestions for unmapped columns
 */
function generateSuggestions(unmapped: string[]): Record<string, string[]> {
  const suggestions: Record<string, string[]> = {};
  
  for (const col of unmapped) {
    suggestions[col] = SAP_FIELDS.slice(0, 5); // Top 5 most common fields
  }
  
  return suggestions;
}

/**
 * AI-powered column mapping using Gemini
 */
export async function aiMapColumns(
  headers: string[],
  sampleData: Record<string, unknown>,
  batchName?: string,
  detectedFormat?: string
): Promise<SmartMappingResult> {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  const prompt = `You are an expert in SAP S/4HANA Sales Order data mapping and Excel/CSV file parsing.

Your task is to analyze the column headers from a sales/order report and map them to SAP S/4HANA order fields.

FILE INFORMATION:
- File name/batch: "${batchName || 'Unknown'}"
- Detected format: ${detectedFormat || 'unknown'}

AVAILABLE SAP FIELDS:
${SAP_FIELDS.join(', ')}

COLUMN ALIASES GUIDE:
- ORDER_TYPE: order type, doc type, sale type
- SOLD_TO: customer, customer code, customer name, party, dealer, retailer
- MATERIAL: product, item, sku, article, product code, product name, item code
- QUANTITY: qty, quantity, ordered qty, alt qty, primary, sales, target
- PRICE: price, rate, amount, value, cif rate
- UOM: unit, unit of measure
- REQ_DATE: date, delivery date, month columns (Jan-2026, Feb-2026, etc.)

INPUT DATA:
Headers: ${JSON.stringify(headers)}
Sample Row: ${JSON.stringify(sampleData)}

SPECIAL HANDLING:
1. For pivot table data with "Sum of..." headers, strip the "Sum of" prefix
2. For month columns (e.g., "Jan-2026", "Feb-2026"), map to REQ_DATE
3. If customer info is missing, SOLD_TO will be derived from row context
4. If product codes are missing, MATERIAL will be derived from product descriptions
5. Stock report columns like "Opening", "Closing", "Primary" may contain quantity data

RESPONSE FORMAT (JSON only):
{
  "mappings": {"Original Column Name": "SAP_FIELD", ...},
  "unmapped_columns": ["column1", "column2"],
  "confidence": 0.85,
  "warnings": ["any warnings or notes"],
  "suggestions": {"unmapped_column": ["suggested_field1", "suggested_field2"]}
}

Return ONLY the JSON object, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }
  
  const parsed = JSON.parse(jsonMatch[0]) as SmartMappingResult;
  
  return {
    ...parsed,
    confidence: parsed.confidence || 0.7
  };
}

/**
 * Suggest closest matching customer
 */
export function suggestClosestCustomers(
  input: string,
  customerNames: string[],
  limit: number = 3
): string[] {
  const scores = customerNames.map(name => ({
    name,
    score: calculateSimilarity(input, name)
  }));
  
  scores.sort((a, b) => b.score - a.score);
  return scores
    .filter(s => s.score >= 0.4)
    .slice(0, limit)
    .map(s => s.name);
}

/**
 * Suggest closest matching material
 */
export function suggestClosestMaterials(
  input: string,
  materialNames: string[],
  limit: number = 3
): string[] {
  const scores = materialNames.map(name => ({
    name,
    score: calculateSimilarity(input, name)
  }));
  
  scores.sort((a, b) => b.score - a.score);
  return scores
    .filter(s => s.score >= 0.4)
    .slice(0, limit)
    .map(s => s.name);
}

/**
 * Generate normalized orders from parsed data using AI mapping
 */
export function generateNormalizedOrders(
  rows: Record<string, unknown>[],
  mapping: Record<string, string>
): Array<{
  orderType: string;
  salesOrg: string;
  distChannel: string;
  division: string;
  soldTo: string;
  shipTo: string;
  material: string;
  quantity: number;
  uom: string;
  price: number | null;
  currency: string;
  reqDate: string;
  poNumber: string;
}> {
  return rows.map((row, index) => {
    const getValue = (field: string): unknown => {
      const col = Object.entries(mapping).find(([_, f]) => f === field)?.[0];
      return col ? row[col] : undefined;
    };
    
    // Extract customer
    let soldTo = String(getValue('SOLD_TO') || '');
    if (!soldTo) {
      // Try to find customer name in any column
      for (const [col, val] of Object.entries(row)) {
        if (col.toLowerCase().includes('customer') || col.toLowerCase().includes('party')) {
          soldTo = String(val || '');
          break;
        }
      }
    }
    
    // Extract material
    let material = String(getValue('MATERIAL') || '');
    if (!material) {
      // Try to find product name in any column
      for (const [col, val] of Object.entries(row)) {
        if (col.toLowerCase().includes('product') || 
            col.toLowerCase().includes('item') ||
            col.toLowerCase().includes('material')) {
          material = String(val || '');
          break;
        }
      }
    }
    
    // Extract quantity
    let quantity = 0;
    const qtyVal = getValue('QUANTITY');
    if (typeof qtyVal === 'number') {
      quantity = qtyVal;
    } else if (typeof qtyVal === 'string') {
      quantity = parseFloat(qtyVal) || 0;
    }
    
    // Extract price
    let price: number | null = null;
    const priceVal = getValue('PRICE');
    if (typeof priceVal === 'number') {
      price = priceVal;
    } else if (typeof priceVal === 'string') {
      price = parseFloat(priceVal) || null;
    }
    
    // Extract UOM
    const uom = String(getValue('UOM') || 'PC');
    
    // Extract date
    let reqDate = String(getValue('REQ_DATE') || '');
    if (!reqDate) {
      reqDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    return {
      orderType: String(getValue('ORDER_TYPE') || 'OR'),
      salesOrg: String(getValue('SALES_ORG') || '1000'),
      distChannel: String(getValue('DIST_CHANNEL') || '10'),
      division: String(getValue('DIVISION') || '00'),
      soldTo: soldTo || `CUST${String(index + 1).padStart(3, '0')}`,
      shipTo: soldTo || `CUST${String(index + 1).padStart(3, '0')}`,
      material: material || `MAT${String(index + 1).padStart(4, '0')}`,
      quantity,
      uom,
      price,
      currency: String(getValue('CURRENCY') || 'USD'),
      reqDate,
      poNumber: String(getValue('PO_NUMBER') || `PO-${Date.now()}-${index}`)
    };
  }).filter(o => o.quantity > 0);
}
