const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
  'Bisk Farm Sales report (Sales Trend ) till Feb 2026.xlsx',
  'NILONS SNS REPORT FEB-26 (2).xlsx',
  'Sales report -Catch (Sales Trend ) till FEB-2026 (2).xlsx',
  'Sales report-Nilons (Sales Trend ) till FEB 2026.xlsx',
  'SNS WEIKFIELD TILL FEB - 2026 (1).xlsx',
  'WeikField Sales Trend report Till  Feb-26.xlsx'
];

files.forEach(filename => {
  console.log('\n========================================');
  console.log('FILE:', filename);
  console.log('========================================');
  
  try {
    const filePath = path.join(__dirname, '..', 'public', filename);
    if (!fs.existsSync(filePath)) {
      console.log('File not found!');
      return;
    }
    
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
    console.log('Total Rows:', data.length);
    console.log('\nFirst 10 rows (first 10 columns):');
    data.slice(0, 10).forEach((row, i) => {
      console.log(`Row ${i}:`, row.slice(0, 10).map(cell => 
        cell === undefined ? '-' : String(cell).substring(0, 30)
      ));
    });
    
    // Detect headers
    console.log('\n--- Header Analysis ---');
    if (data.length > 0) {
      // Find first non-empty row
      let headerRow = 0;
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        if (row && row.some(cell => cell !== undefined && cell !== '' && cell !== null)) {
          headerRow = i;
          console.log('Header Row Index:', i);
          console.log('Headers:', row.slice(0, 15).map(h => 
            h === undefined ? '-' : String(h).substring(0, 25)
          ));
          break;
        }
      }
      
      // Sample data row
      if (data.length > headerRow + 1) {
        console.log('\nSample Data Row:');
        console.log(data[headerRow + 1].slice(0, 10).map(cell => 
          cell === undefined ? '-' : String(cell).substring(0, 30)
        ));
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
});
