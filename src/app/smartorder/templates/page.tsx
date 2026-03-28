'use client';

import React from 'react';
import { Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TemplateField {
  name: string;
  description: string;
  required: boolean;
  example: string;
  type: 'text' | 'number' | 'date';
}

const templateFields: TemplateField[] = [
  { name: 'OrderType', description: 'SAP Order Type', required: true, example: 'OR', type: 'text' },
  { name: 'SalesOrg', description: 'Sales Organization', required: true, example: '1000', type: 'text' },
  { name: 'DistChannel', description: 'Distribution Channel', required: true, example: '10', type: 'text' },
  { name: 'Division', description: 'Product Division', required: true, example: '00', type: 'text' },
  { name: 'SoldTo', description: 'Customer/Sold-to Party', required: true, example: '100001', type: 'text' },
  { name: 'ShipTo', description: 'Ship-to Party (optional)', required: false, example: '100001', type: 'text' },
  { name: 'Material', description: 'Material/SKU Number', required: true, example: 'MAT001', type: 'text' },
  { name: 'Qty', description: 'Order Quantity', required: true, example: '100', type: 'number' },
  { name: 'Price', description: 'Unit Price (optional)', required: false, example: '99.99', type: 'number' },
  { name: 'ReqDate', description: 'Requested Delivery Date', required: true, example: '2026-03-30', type: 'date' },
  { name: 'PONumber', description: 'Purchase Order Number', required: false, example: 'PO-12345', type: 'text' },
  { name: 'Currency', description: 'Currency Code', required: false, example: 'USD', type: 'text' },
];

const sampleData = [
  { OrderType: 'OR', SalesOrg: '1000', DistChannel: '10', Division: '00', SoldTo: '100001', ShipTo: '100001', Material: 'MAT001', Qty: 100, Price: 99.99, ReqDate: '2026-03-30', PONumber: 'PO-12345', Currency: 'USD' },
  { OrderType: 'OR', SalesOrg: '1000', DistChannel: '10', Division: '00', SoldTo: '100002', ShipTo: '100002', Material: 'MAT002', Qty: 50, Price: 49.99, ReqDate: '2026-04-05', PONumber: 'PO-12346', Currency: 'USD' },
  { OrderType: 'OR', SalesOrg: '1000', DistChannel: '10', Division: '00', SoldTo: '100003', ShipTo: '100003', Material: 'MAT003', Qty: 200, Price: 150.00, ReqDate: '2026-04-10', PONumber: 'PO-12347', Currency: 'USD' },
];

export default function TemplatesPage() {
  const downloadTemplate = () => {
    const headers = templateFields.map(f => f.name);
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    
    // Set column widths
    const colWidths = templateFields.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Order Template');
    
    // Add instructions sheet
    const instructionsData = templateFields.map(f => ({
      'Field Name': f.name,
      'Description': f.description,
      'Required': f.required ? 'Yes' : 'No',
      'Example': f.example,
      'Data Type': f.type,
    }));
    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');
    
    XLSX.writeFile(wb, 'Tenchi_SmartOrder_Template.xlsx');
  };

  const downloadCSVTemplate = () => {
    const headers = templateFields.map(f => f.name).join(',');
    const rows = sampleData.map(row => 
      templateFields.map(f => row[f.name as keyof typeof row] || '').join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tenchi_SmartOrder_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Excel Templates</h1>
          <p className="text-gray-600 mt-2">
            Download pre-formatted templates for uploading orders to SmartOrder Engine
          </p>
        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#1a1a2e]">Excel Template (.xlsx)</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Full-featured template with data validation, instructions sheet, and sample data.
                  Recommended for most users.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#e89a2d] text-white rounded-lg hover:bg-[#d48a1d] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#1a1a2e]">CSV Template (.csv)</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Simple CSV format for bulk data preparation. Compatible with all spreadsheet applications.
                </p>
                <button
                  onClick={downloadCSVTemplate}
                  className="mt-4 flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Field Reference */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-lg text-[#1a1a2e]">Field Reference</h2>
            <p className="text-sm text-gray-500">Required and optional fields for order upload</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Field Name</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Description</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-700">Required</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Example</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {templateFields.map((field) => (
                  <tr key={field.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6 font-medium">{field.name}</td>
                    <td className="py-3 px-6 text-gray-600">{field.description}</td>
                    <td className="py-3 px-6 text-center">
                      {field.required ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <CheckCircle className="w-4 h-4" />
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 font-mono text-sm text-gray-600">{field.example}</td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        field.type === 'text' ? 'bg-gray-100 text-gray-700' :
                        field.type === 'number' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {field.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for Success</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              Ensure customer and material codes exist in the master data before uploading
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              Use YYYY-MM-DD format for dates (e.g., 2026-03-30)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              Quantities should be positive numbers without commas
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5" />
              The AI mapping engine will attempt to match your column names automatically
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
