import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Mock batches data
const MOCK_BATCHES = [
  {
    id: 'batch-001',
    batchName: 'March Orders',
    fileName: 'march_orders.xlsx',
    totalOrders: 50,
    successCount: 48,
    failedCount: 2,
    pendingCount: 0,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'batch-002',
    batchName: 'April Intake',
    fileName: 'april_intake.xlsx',
    totalOrders: 120,
    successCount: 0,
    failedCount: 0,
    pendingCount: 120,
    status: 'UPLOADED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET() {
  try {
    return NextResponse.json({ batches: MOCK_BATCHES });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Read file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (jsonData.length < 2) {
      return NextResponse.json({ error: 'File is empty or invalid' }, { status: 400 });
    }

    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

    // Create new batch
    const newBatch = {
      id: 'batch-' + Date.now(),
      batchName: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      totalOrders: rows.length,
      successCount: 0,
      failedCount: 0,
      pendingCount: rows.length,
      status: 'UPLOADED',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      batch: newBatch,
      message: 'Batch uploaded successfully',
      orderCount: rows.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
