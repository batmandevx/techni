/**
 * Test script for Excel parsing
 * Run: node scripts/test-excel-parsing.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const testFiles = [
  'public/Bisk Farm Sales report (Sales Trend ) till Feb 2026.xlsx',
  'public/NILONS SNS REPORT FEB-26 (2).xlsx',
  'public/Sales report -Catch (Sales Trend ) till FEB-2026 (2).xlsx',
  'public/SNS WEIKFIELD TILL FEB - 2026 (1).xlsx'
];

console.log('=== Excel Parser Test ===\n');

testFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const fileName = path.basename(filePath);
  
  console.log(`\n--- Testing: ${fileName} ---`);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(`  ❌ File not found: ${filePath}`);
      return;
    }
    
    const workbook = XLSX.readFile(fullPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`  ✅ Successfully parsed`);
    console.log(`  📊 Total rows: ${jsonData.length}`);
    console.log(`  📑 Sheet name: ${sheetName}`);
    
    // Detect format
    const firstRowStr = JSON.stringify(jsonData[0] || '').toLowerCase();
    let format = 'flat';
    if (firstRowStr.includes('sum of') || firstRowStr.includes('row labels')) {
      format = 'pivot';
    } else if (firstRowStr.includes('opening') || firstRowStr.includes('purchase')) {
      format = 'stock';
    } else if (firstRowStr.includes('customer')) {
      format = 'customer';
    }
    console.log(`  🏷️  Detected format: ${format}`);
    
    // Show first few rows
    console.log(`  📋 First 3 data rows:`);
    jsonData.slice(0, 3).forEach((row, i) => {
      const preview = row.slice(0, 4).map(cell => {
        if (cell === undefined || cell === null) return '[empty]';
        const str = String(cell).substring(0, 30);
        return str.length > 30 ? str + '...' : str;
      }).join(' | ');
      console.log(`     Row ${i}: ${preview}`);
    });
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
});

console.log('\n=== Test Complete ===');
