import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { headers, sampleRow } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      // Return mock mapping if no API key
      return NextResponse.json({
        mappings: generateMockMapping(headers),
        unmapped_columns: [],
        warnings: [],
        confidence: 0.92,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an SAP S/4HANA order data mapping expert.
Given these Excel column headers and sample values, map each column to the correct SAP Sales Order field.

SAP Target Fields:
- ORDER_TYPE (Standard order type, e.g., "OR")
- SALES_ORG (Sales organization code)
- DIST_CHANNEL (Distribution channel)
- DIVISION (Product division)
- SOLD_TO (Customer/Sold-to party number)
- SHIP_TO (Ship-to party number)
- MATERIAL (Material/SKU number)
- QTY (Order quantity)
- PRICE (Unit price)
- REQ_DEL_DATE (Requested delivery date)

Input columns: ${JSON.stringify(headers)}
Sample data row: ${JSON.stringify(sampleRow)}

Return ONLY a JSON object with this exact structure:
{
  "mappings": [
    {"source_column": "original column name", "target_field": "SAP_FIELD", "confidence": 0.95}
  ],
  "unmapped_columns": ["column names that don't match any SAP field"],
  "warnings": ["any warnings about data quality"],
  "confidence": 0.92
}

Be precise. Map only if confidence is above 0.7. Use your best judgment for similar-sounding fields.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const mapping = JSON.parse(jsonMatch[0]);
      return NextResponse.json(mapping);
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    console.error('AI mapping error:', error);
    return NextResponse.json(
      { error: 'Failed to map columns', mappings: [], confidence: 0 },
      { status: 500 }
    );
  }
}

function generateMockMapping(headers: string[]) {
  const mappings: Array<{ source_column: string; target_field: string; confidence: number }> = [];
  
  const fieldMappings: Record<string, string> = {
    'order': 'ORDER_TYPE',
    'type': 'ORDER_TYPE',
    'sales org': 'SALES_ORG',
    'salesorg': 'SALES_ORG',
    'channel': 'DIST_CHANNEL',
    'dist': 'DIST_CHANNEL',
    'division': 'DIVISION',
    'sold': 'SOLD_TO',
    'customer': 'SOLD_TO',
    'ship': 'SHIP_TO',
    'delivery': 'SHIP_TO',
    'material': 'MATERIAL',
    'sku': 'MATERIAL',
    'product': 'MATERIAL',
    'qty': 'QTY',
    'quantity': 'QTY',
    'price': 'PRICE',
    'unit': 'PRICE',
    'amount': 'PRICE',
    'date': 'REQ_DEL_DATE',
    'delivery date': 'REQ_DEL_DATE',
    'req': 'REQ_DEL_DATE',
  };

  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();
    for (const [key, value] of Object.entries(fieldMappings)) {
      if (lowerHeader.includes(key)) {
        mappings.push({ source_column: header, target_field: value, confidence: 0.9 });
        break;
      }
    }
  });

  return mappings;
}
