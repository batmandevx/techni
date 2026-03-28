import { NextRequest, NextResponse } from 'next/server';
import { createBatch } from '@/lib/smart-order/store';
import { parseExcelFile, getSampleDataForAI } from '@/lib/smart-order/excel-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .xlsx, .xls, .csv files are allowed' },
        { status: 400 }
      );
    }
    
    // Parse the Excel file with intelligent detection
    const parsed = await parseExcelFile(file);
    
    if (parsed.rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid data rows found in the file' },
        { status: 400 }
      );
    }
    
    // Get sample data for AI mapping
    const { headers, sampleRow } = getSampleDataForAI(parsed);
    
    return NextResponse.json({
      success: true,
      batchName: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      headers,
      previewRows: parsed.rows.slice(0, 10),
      allRows: parsed.rows,
      totalRows: parsed.totalRows,
      sampleData: sampleRow,
      detectedFormat: parsed.detectedFormat,
      sheetName: parsed.sheetName,
      headerRowIndex: parsed.headerRowIndex,
      dataStartRowIndex: parsed.dataStartRowIndex
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process file',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Return empty data structure
    return NextResponse.json({
      success: true,
      orders: [],
      customers: [],
      smartOrderBatches: []
    });
  } catch (error) {
    console.error('upload GET error', error);
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Data cleared successfully'
    });
  } catch (error) {
    console.error('upload DELETE error', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
