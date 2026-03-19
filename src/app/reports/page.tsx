'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Mail, Calendar, FileSpreadsheet, Send, Check, Loader2 } from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { processInventoryRecord } from '@/lib/forecasting';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { materials: MATERIALS, historicalData: HISTORICAL_DATA, kpis: DASHBOARD_KPI, customers: CUSTOMERS, orders: SAMPLE_ORDERS } = useData();
  
  const [generating, setGenerating] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const generatePDF = async () => {
    setGenerating('pdf');
    try {
      // Dynamic import for client-side only
      const jsPDF = (await import('jspdf')).default;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(10, 10, 26);
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setTextColor(241, 245, 249);
      doc.setFontSize(22);
      doc.text('Tenchi S&OP Report', 14, 25);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Strategy. Scale. Success.`, 14, 35);

      // KPIs
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.text('Key Performance Indicators', 14, 55);

      (doc as any).autoTable({
        startY: 60,
        head: [['KPI', 'Value', 'Status']],
        body: [
          ['Forecast Accuracy', `${DASHBOARD_KPI.forecastAccuracy?.toFixed(1) ?? '—'}%`, DASHBOARD_KPI.forecastAccuracy >= 90 ? '✓ On Target' : '⚠ Below Target'],
          ['Inventory Turns', `${DASHBOARD_KPI.inventoryTurns?.toFixed(1) ?? '—'}x`, DASHBOARD_KPI.inventoryTurns >= 6 ? '✓ Good' : '⚠ Review'],
          ['Fill Rate', `${DASHBOARD_KPI.fillRate?.toFixed(1) ?? '—'}%`, DASHBOARD_KPI.fillRate >= 95 ? '✓ On Target' : '⚠ Below Target'],
          ['Stock Coverage', `${DASHBOARD_KPI.stockCoverage?.toFixed(0) ?? '—'} days`, '—'],
          ['Stockout Risk', `${DASHBOARD_KPI.stockoutRisk?.toFixed(1) ?? '—'}%`, DASHBOARD_KPI.stockoutRisk <= 10 ? '✓ Low Risk' : '⚠ High Risk'],
          ['Total Orders', `${DASHBOARD_KPI.totalOrders ?? 0}`, '—'],
          ['Total Revenue', `$${DASHBOARD_KPI.totalRevenue?.toLocaleString() ?? 0}`, '—'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        styles: { fontSize: 10 },
      });

      // Inventory Summary
      doc.setFontSize(14);
      doc.text('Inventory & Replenishment Summary', 14, (doc as any).lastAutoTable.finalY + 15);

      const invData = MATERIALS.map(mat => {
        const latest = HISTORICAL_DATA[mat.id]?.[5];
        if (!latest) return [mat.id, mat.description, '—', '—', '—', '—'];
        const result = processInventoryRecord({
          materialId: mat.id,
          month: latest.month,
          openingStock: latest.openingStock,
          stockInTransit: latest.stockInTransit,
          actualSales: latest.actualSales || latest.forecast,
          forecastDemand: latest.forecast,
          safetyStock: latest.safetyStock,
        });
        return [
          mat.id,
          mat.description,
          result.closingStock.toLocaleString(),
          result.forecastDemand.toLocaleString(),
          result.replenishmentQty.toLocaleString(),
          `${result.stockoutRisk}%`,
        ];
      });

      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['ID', 'Product', 'Closing Stock', 'Forecast', 'Replenish', 'Risk']],
        body: invData,
        theme: 'grid',
        headStyles: { fillColor: [6, 182, 212], textColor: 255 },
        styles: { fontSize: 9 },
      });

      // Order Summary
      doc.addPage();
      doc.setFillColor(10, 10, 26);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(241, 245, 249);
      doc.setFontSize(16);
      doc.text('Order Summary', 14, 20);

      doc.setTextColor(30, 30, 30);
      (doc as any).autoTable({
        startY: 40,
        head: [['Order ID', 'Customer', 'Material', 'Qty', 'Date', 'Status']],
        body: SAMPLE_ORDERS.map(o => [o.orderId, o.customerId, o.materialId, o.quantity, o.orderDate, o.status]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { fontSize: 9 },
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Tenchi S&OP | Page ${i} of ${totalPages} | Confidential`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save('Tenchi_SOP_Report.pdf');
      toast.success('PDF report downloaded!');
    } catch (err) {
      toast.error('Failed to generate PDF');
      console.error(err);
    }
    setGenerating(null);
  };

  const generateExcel = async () => {
    setGenerating('excel');
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      // KPIs Sheet
      const kpiData = [
        ['KPI', 'Value', 'Status'],
        ['Forecast Accuracy', `${DASHBOARD_KPI.forecastAccuracy?.toFixed(1) ?? '—'}%`, DASHBOARD_KPI.forecastAccuracy >= 90 ? 'On Target' : 'Below Target'],
        ['Inventory Turns', `${DASHBOARD_KPI.inventoryTurns?.toFixed(1) ?? '—'}x`, DASHBOARD_KPI.inventoryTurns >= 6 ? 'Good' : 'Review'],
        ['Fill Rate', `${DASHBOARD_KPI.fillRate?.toFixed(1) ?? '—'}%`, DASHBOARD_KPI.fillRate >= 95 ? 'On Target' : 'Below Target'],
        ['Stock Coverage', `${DASHBOARD_KPI.stockCoverage?.toFixed(0) ?? '—'} days`, '—'],
        ['Stockout Risk', `${DASHBOARD_KPI.stockoutRisk?.toFixed(1) ?? '—'}%`, DASHBOARD_KPI.stockoutRisk <= 10 ? 'Low Risk' : 'High Risk'],
        ['Total Orders', DASHBOARD_KPI.totalOrders ?? 0, '—'],
        ['Total Revenue', `$${DASHBOARD_KPI.totalRevenue?.toLocaleString() ?? 0}`, '—'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), 'KPIs');

      // Customers Sheet
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(CUSTOMERS), 'Customers');

      // Materials Sheet
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(MATERIALS), 'Materials');

      // Orders Sheet
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(SAMPLE_ORDERS), 'Orders');

      // Inventory & Forecast Sheet
      const invRows = MATERIALS.flatMap(mat =>
        (HISTORICAL_DATA[mat.id] || []).map((d: any) => {
          const result = processInventoryRecord({
            materialId: mat.id,
            month: d.month,
            openingStock: d.openingStock,
            stockInTransit: d.stockInTransit,
            actualSales: d.actualSales,
            forecastDemand: d.forecast,
            safetyStock: d.safetyStock,
          });
          return {
            Material: mat.id,
            Product: mat.description,
            Month: d.month,
            OpeningStock: d.openingStock,
            StockInTransit: d.stockInTransit,
            ActualSales: d.actualSales,
            Forecast: d.forecast,
            SafetyStock: d.safetyStock,
            ClosingStock: result.closingStock,
            ReplenishmentQty: result.replenishmentQty,
            ForecastAccuracy: result.forecastAccuracy > 0 ? `${result.forecastAccuracy.toFixed(1)}%` : 'N/A',
            StockoutRisk: `${result.stockoutRisk}%`,
          };
        })
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invRows), 'Inventory_Forecast');

      XLSX.writeFile(wb, 'Tenchi_SOP_Data.xlsx');
      toast.success('Excel report downloaded!');
    } catch (err) {
      toast.error('Failed to generate Excel');
    }
    setGenerating(null);
  };

  const sendEmail = async () => {
    if (!emailTo.trim()) return;
    setGenerating('email');
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, subject: 'Tenchi S&OP Report', kpis: DASHBOARD_KPI }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Report sent to ${emailTo}`);
      } else {
        toast.error(data.message || 'Failed to send email');
      }
    } catch (err) {
      toast.error('Email service unavailable');
    }
    setGenerating(null);
    setShowEmailModal(false);
    setEmailTo('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-white">Reports & Export</h1>
        <p className="mt-1 text-sm text-slate-500">Generate, download, and distribute S&OP reports</p>
      </motion.div>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* PDF Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-hover p-6"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20">
            <FileText className="h-7 w-7 text-red-400" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-white">PDF Report</h3>
          <p className="mt-2 text-sm text-slate-400">
            Comprehensive S&OP report with KPIs, inventory analysis, and order summary.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li>• Executive KPI summary</li>
            <li>• Inventory & replenishment data</li>
            <li>• Order tracking table</li>
            <li>• Branded layout</li>
          </ul>
          <button
            onClick={generatePDF}
            disabled={generating === 'pdf'}
            className="gradient-button mt-4 flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generating === 'pdf' ? 'Generating...' : 'Download PDF'}
          </button>
        </motion.div>

        {/* Excel Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-hover p-6"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
            <FileSpreadsheet className="h-7 w-7 text-emerald-400" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-white">Excel Export</h3>
          <p className="mt-2 text-sm text-slate-400">
            Complete data export with multiple sheets for detailed analysis.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li>• KPIs sheet</li>
            <li>• Customer & Material masters</li>
            <li>• Order data</li>
            <li>• Inventory & Forecast calculations</li>
          </ul>
          <button
            onClick={generateExcel}
            disabled={generating === 'excel'}
            className="gradient-button mt-4 flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generating === 'excel' ? 'Generating...' : 'Download Excel'}
          </button>
        </motion.div>

        {/* Email Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-hover p-6"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/20">
            <Mail className="h-7 w-7 text-brand-400" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-white">Email Report</h3>
          <p className="mt-2 text-sm text-slate-400">
            Send S&OP summary directly to stakeholders via email.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li>• HTML formatted email</li>
            <li>• KPI dashboard summary</li>
            <li>• Critical alerts</li>
            <li>• Action items</li>
          </ul>
          <button
            onClick={() => setShowEmailModal(true)}
            className="gradient-button mt-4 flex w-full items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send via Email
          </button>
        </motion.div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowEmailModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card mx-4 w-full max-w-md p-6"
          >
            <h3 className="section-title mb-4">Send Report via Email</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="colleague@company.com"
                  className="glass-input w-full text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEmailModal(false)} className="glass-button flex-1">Cancel</button>
                <button
                  onClick={sendEmail}
                  disabled={!emailTo.trim() || generating === 'email'}
                  className="gradient-button flex flex-1 items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generating === 'email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="section-title mb-4">Report History</h3>
        <div className="space-y-2">
          {[
            { name: 'Monthly S&OP Review - Feb 2026', type: 'PDF', date: 'Feb 28, 2026', status: 'sent' },
            { name: 'Inventory Analysis Q4 2025', type: 'Excel', date: 'Jan 15, 2026', status: 'downloaded' },
            { name: 'Emergency Stockout Alert', type: 'Email', date: 'Jan 5, 2026', status: 'sent' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  report.type === 'PDF' ? 'bg-red-500/15' : report.type === 'Excel' ? 'bg-emerald-500/15' : 'bg-brand-500/15'
                }`}>
                  {report.type === 'PDF' ? <FileText className="h-4 w-4 text-red-400" /> :
                   report.type === 'Excel' ? <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> :
                   <Mail className="h-4 w-4 text-brand-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{report.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {report.date}
                  </div>
                </div>
              </div>
              <span className={report.status === 'sent' ? 'badge-success' : 'badge-info'}>
                <Check className="mr-1 h-3 w-3" />
                {report.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
