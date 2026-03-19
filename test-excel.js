const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('Tenchi order engine test case for order entry.xlsx', { cellDates: true });
  
  let sheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    if (name.toLowerCase().includes('order')) {
      sheetName = name;
      break;
    }
  }

  console.log('Selected sheet:', sheetName);
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length > 0) {
    const headers = jsonData[0];
    console.log('\n--- HEADERS ---');
    headers.forEach((h, i) => console.log(`[${i}] "${h}"`));
    
    if (jsonData.length > 1) {
      console.log('\n--- SAMPLE ROW ---');
      const row = jsonData[1];
      row.forEach((v, i) => console.log(`[${i}] ${v}`));
    }
  } else {
    console.log('Sheet is empty');
  }
} catch (e) {
  console.error('Error reading file:', e.message);
}
