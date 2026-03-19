const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('Tenchi order engine test case for order entry.xlsx');
  const result = { sheetNames: workbook.SheetNames, sheets: {} };
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (json.length > 0) {
      result.sheets[sheetName] = json[0];
    }
  });
  
  fs.writeFileSync('tmp_out.json', JSON.stringify(result, null, 2));
} catch (err) {
  console.error("Error reading file:", err);
}
