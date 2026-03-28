import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable: { finalY: number };
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
}

interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

// TenchiOne Brand Colors
const COLORS = {
  primary: [99, 102, 241], // Indigo-500
  secondary: [139, 92, 246], // Violet-500
  accent: [232, 154, 45], // Tenchi Orange
  success: [34, 197, 94], // Emerald-500
  warning: [245, 158, 11], // Amber-500
  danger: [239, 68, 68], // Rose-500
  dark: [26, 26, 46], // Navy Dark
  text: [51, 65, 85], // Slate-700
  textLight: [100, 116, 139], // Slate-500
  border: [226, 232, 240], // Slate-200
  background: [248, 250, 252], // Slate-50
};

// Add custom fonts and styling
const addHeader = (doc: jsPDFWithAutoTable, options: ExportOptions) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Header background gradient effect (simulated with rectangles)
  doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Accent line
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 50, pageWidth, 3, 'F');
  
  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TenchiOne', 20, 28);
  
  doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SCOTT - Smart Commerce Operations Transformation & Technology', 20, 38);
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, pageWidth - 20, 28, { align: 'right' });
  
  if (options.subtitle) {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, pageWidth - 20, 38, { align: 'right' });
  }
  
  return 65; // Return Y position after header
};

const addFooter = (doc: jsPDFWithAutoTable, pageNumber: number, totalPages: number) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
  
  // Footer text
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  doc.text(`Generated: ${timestamp}`, 20, pageHeight - 15);
  doc.text(`Confidential - TenchiOne S&OP Platform`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
};

// Export ABC Analysis to PDF
export const exportABCToPDF = (
  data: any[],
  summary: any,
  options: ExportOptions = { title: 'ABC Analysis Report' }
) => {
  const doc = new jsPDF('landscape') as jsPDFWithAutoTable;
  const filename = options.filename || `ABC_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
  
  let currentY = addHeader(doc, options);
  
  // Summary Section
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, currentY);
  currentY += 10;
  
  // Summary cards
  const summaryData = [
    ['Total SKUs', data.length.toString()],
    ['Class A SKUs', `${summary.a.count} (${((summary.a.count / data.length) * 100).toFixed(1)}%)`],
    ['Class B SKUs', `${summary.b.count} (${((summary.b.count / data.length) * 100).toFixed(1)}%)`],
    ['Class C SKUs', `${summary.c.count} (${((summary.c.count / data.length) * 100).toFixed(1)}%)`],
    ['Low Coverage', summary.lowCoverage.count.toString()],
  ];
  
  (doc as any).autoTable({
    startY: currentY,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.text },
      1: { textColor: COLORS.primary },
    },
    margin: { left: 20 },
    tableWidth: 200,
  });
  
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Main Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed ABC Analysis', 20, currentY);
  currentY += 10;
  
  const tableHeaders = [
    'ABC',
    'SKU ID',
    'Description',
    'Category',
    'Avg Monthly Value',
    'Contribution %',
    'Stock Value',
    'Coverage',
    'Status',
  ];
  
  const tableData = data.map((item) => [
    item.classification,
    item.materialId,
    item.materialName,
    item.category,
    `$${item.avgMonthlySalesValue.toLocaleString()}`,
    `${item.salesValueContribution.toFixed(1)}%`,
    `$${(item.stockValue || 0).toLocaleString()}`,
    `${item.stockCoverageMonths.toFixed(1)} mo`,
    item.stockCoverageMonths < 1 ? 'Critical' : item.stockCoverageMonths < 2 ? 'Warning' : 'Healthy',
  ]);
  
  // Color coding for ABC classes
  const didDrawCell = (data: any) => {
    if (data.column.index === 0) {
      const value = data.cell.raw;
      if (value === 'A') {
        data.cell.styles.textColor = COLORS.success;
        data.cell.styles.fontStyle = 'bold';
      } else if (value === 'B') {
        data.cell.styles.textColor = COLORS.warning;
      } else if (value === 'C') {
        data.cell.styles.textColor = COLORS.danger;
      }
    }
    if (data.column.index === 8) {
      const value = data.cell.raw;
      if (value === 'Critical') {
        data.cell.styles.textColor = COLORS.danger;
      } else if (value === 'Warning') {
        data.cell.styles.textColor = COLORS.warning;
      } else {
        data.cell.styles.textColor = COLORS.success;
      }
    }
  };
  
  (doc as any).autoTable({
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    didDrawCell,
    margin: { left: 20, right: 20 },
  });
  
  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(filename);
  return filename;
};

// Export Inventory Report to PDF
export const exportInventoryToPDF = (
  data: any[],
  options: ExportOptions = { title: 'Inventory Health Report' }
) => {
  const doc = new jsPDF('landscape') as jsPDFWithAutoTable;
  const filename = options.filename || `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  let currentY = addHeader(doc, options);
  
  // Calculate summary
  const totalValue = data.reduce((sum, item) => sum + (item.stockValue || 0), 0);
  const lowCoverage = data.filter((item) => item.stockCoverageMonths < 1).length;
  const avgCoverage = data.reduce((sum, item) => sum + item.stockCoverageMonths, 0) / data.length;
  
  // Summary section
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Summary', 20, currentY);
  currentY += 10;
  
  const summaryData = [
    ['Total Stock Value', `$${totalValue.toLocaleString()}`],
    ['Total SKUs', data.length.toString()],
    ['Average Coverage', `${avgCoverage.toFixed(1)} months`],
    ['Low Coverage SKUs', lowCoverage.toString()],
    ['Healthy SKUs', (data.length - lowCoverage).toString()],
  ];
  
  (doc as any).autoTable({
    startY: currentY,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { textColor: COLORS.primary },
    },
    margin: { left: 20 },
    tableWidth: 200,
  });
  
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Inventory table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Details', 20, currentY);
  currentY += 10;
  
  const tableHeaders = [
    'SKU',
    'Description',
    'Current Stock',
    'In Transit',
    'Safety Stock',
    'Stock Value',
    'Coverage',
    'Age Status',
    'Order Prompt',
  ];
  
  const tableData = data.map((item) => [
    item.id || item.materialId,
    item.description || item.materialName,
    item.currentStock?.toLocaleString() || '0',
    item.transitStock?.toLocaleString() || '0',
    item.safetyStock?.toLocaleString() || '0',
    `$${(item.stockValue || 0).toLocaleString()}`,
    `${(item.coverageMonths || item.stockCoverageMonths || 0).toFixed(1)} mo`,
    item.inventoryAgeStatus === 'good' ? 'Good' : item.inventoryAgeStatus === 'slow' ? 'Slow' : 'Bad',
    item.orderPrompt?.toLocaleString() || '0',
  ]);
  
  (doc as any).autoTable({
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(filename);
  return filename;
};

// Export Order Report to PDF
export const exportOrdersToPDF = (
  orders: any[],
  options: ExportOptions = { title: 'Order Summary Report' }
) => {
  const doc = new jsPDF('landscape') as jsPDFWithAutoTable;
  const filename = options.filename || `Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  let currentY = addHeader(doc, options);
  
  // Status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((order) => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Status Breakdown', 20, currentY);
  currentY += 10;
  
  const statusData = Object.entries(statusCounts).map(([status, count]) => [
    status,
    count.toString(),
    `${((count / orders.length) * 100).toFixed(1)}%`,
  ]);
  
  (doc as any).autoTable({
    startY: currentY,
    head: [['Status', 'Count', 'Percentage']],
    body: statusData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: 255,
    },
    margin: { left: 20 },
    tableWidth: 200,
  });
  
  currentY = doc.lastAutoTable.finalY + 15;
  
  // Orders table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Details', 20, currentY);
  currentY += 10;
  
  const tableHeaders = [
    'Order #',
    'Customer',
    'Date',
    'RSD',
    'Status',
    'Items',
    'Total',
    'Credit',
  ];
  
  const tableData = orders.map((order) => [
    order.orderNumber || order.id,
    order.customer?.name || order.customerId,
    new Date(order.orderDate).toLocaleDateString(),
    order.requiredShipDate ? new Date(order.requiredShipDate).toLocaleDateString() : '-',
    order.status,
    order.lines?.length?.toString() || '0',
    `$${(order.totalAmount || 0).toLocaleString()}`,
    order.creditReleased ? 'Released' : 'Hold',
  ]);
  
  (doc as any).autoTable({
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(filename);
  return filename;
};

// Export Chat History to PDF
export const exportChatToPDF = (
  messages: any[],
  options: ExportOptions = { title: 'AI Assistant Conversation' }
) => {
  const doc = new jsPDF('portrait') as jsPDFWithAutoTable;
  const filename = options.filename || `Chat_History_${new Date().toISOString().split('T')[0]}.pdf`;
  
  let currentY = addHeader(doc, options);
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(10);
  
  messages.forEach((message, index) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    const isUser = message.role === 'user';
    const prefix = isUser ? 'You:' : 'TenchiOne AI:';
    const timestamp = new Date(message.timestamp).toLocaleString();
    
    // Role label
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isUser ? COLORS.primary[0] : COLORS.accent[0], 
                     isUser ? COLORS.primary[1] : COLORS.accent[1], 
                     isUser ? COLORS.primary[2] : COLORS.accent[2]);
    doc.text(`${prefix} (${timestamp})`, 20, currentY);
    currentY += 8;
    
    // Message content (wrapped)
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    
    const lines = doc.splitTextToSize(message.content, 170);
    doc.text(lines, 25, currentY);
    currentY += lines.length * 5 + 10;
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(filename);
  return filename;
};

// Generic data export to PDF
export const exportDataToPDF = (
  data: any[],
  columns: TableColumn[],
  options: ExportOptions = { title: 'Report' }
) => {
  const doc = new jsPDF('landscape') as jsPDFWithAutoTable;
  const filename = options.filename || `Report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  let currentY = addHeader(doc, options);
  
  const tableHeaders = columns.map((col) => col.header);
  const tableData = data.map((row) => columns.map((col) => row[col.dataKey] ?? ''));
  
  (doc as any).autoTable({
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    margin: { left: 20, right: 20 },
  });
  
  // Add footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  doc.save(filename);
  return filename;
};

export default {
  exportABCToPDF,
  exportInventoryToPDF,
  exportOrdersToPDF,
  exportChatToPDF,
  exportDataToPDF,
};
