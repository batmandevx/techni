'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Mail,
  Calendar,
  FileSpreadsheet,
  Send,
  Check,
  Loader2,
  X,
  AlertCircle,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Printer,
  Share2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { processInventoryRecord, calculateEOQ, calculateReorderPoint } from '@/lib/forecasting';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';
import toast from 'react-hot-toast';

// Report types configuration
const REPORT_TYPES = [
  {
    id: 'pdf',
    title: 'PDF Report',
    description: 'Comprehensive S&OP report with KPIs, inventory analysis, and order summary.',
    icon: FileText,
    color: 'from-red-500 to-rose-600',
    features: ['Executive KPI summary', 'Inventory & Order Prompt data', 'Order tracking table', 'Branded layout'],
  },
  {
    id: 'excel',
    title: 'Excel Export',
    description: 'Complete data export with multiple sheets for detailed analysis.',
    icon: FileSpreadsheet,
    color: 'from-emerald-500 to-teal-600',
    features: ['KPIs sheet', 'Customer & Material masters', 'Order data', 'Inventory & Forecast calculations'],
  },
  {
    id: 'email',
    title: 'Email Report',
    description: 'Send S&OP summary directly to stakeholders via email.',
    icon: Mail,
    color: 'from-indigo-500 to-violet-600',
    features: ['HTML formatted email', 'KPI dashboard summary', 'Critical alerts', 'Action items'],
  },
];

export default function ReportsPage() {
  const { materials, historicalData, kpis, customers, orders } = useData();

  const [generating, setGenerating] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Tenchi S&OP Report');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Generate PDF Report
  const generatePDF = async () => {
    setGenerating('pdf');
    try {
      const jsPDF = (await import('jspdf')).default;
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 50, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Tenchi S&OP Report', 20, 30);

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()} | Strategy. Scale. Success.`, 20, 42);

      // KPI Section
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Performance Indicators', 20, 65);

      autoTable(doc, {
        startY: 72,
        head: [['KPI', 'Value', 'Status', 'Trend']],
        body: [
          ['Forecast Accuracy', `${kpis.forecastAccuracy?.toFixed(1) ?? '92.5'}%`, kpis.forecastAccuracy >= 90 ? 'On Target' : 'Below Target', '+2.4%'],
          ['Inventory Turns', `${kpis.inventoryTurns?.toFixed(1) ?? '8.3'}x`, kpis.inventoryTurns >= 6 ? 'Good' : 'Review', '+0.5%'],
          ['Fill Rate', `${kpis.fillRate?.toFixed(1) ?? '96.8'}%`, kpis.fillRate >= 95 ? 'On Target' : 'Below Target', '+1.2%'],
          ['Stock Coverage', `${kpis.stockCoverage?.toFixed(0) ?? '18'} days`, '-', '-2 days'],
          ['Stockout Risk', `${kpis.stockoutRisk?.toFixed(1) ?? '12'}%`, kpis.stockoutRisk <= 10 ? 'Low Risk' : 'High Risk', '-1.5%'],
          ['Total Orders', `${orders.length || 12}`, '-', '+3'],
          ['Active Customers', `${customers.length || 7}`, '-', '+1'],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // Inventory & Order Prompt Section
      const currentY = (doc as any).lastAutoTable?.finalY || 120;
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Inventory & Order Prompt Summary', 20, currentY + 20);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Formula: Order Prompt = max(0, (Forecast + Safety Stock) - Current Stock)', 20, currentY + 28);

      const invData = MATERIALS.map(mat => {
        const latest = HISTORICAL_DATA[mat.id]?.[5];
        if (!latest) return [mat.id, mat.description, '-', '-', '-', '-', '-', '-'];
        const result = processInventoryRecord({
          materialId: mat.id,
          month: latest.month,
          openingStock: latest.openingStock,
          stockInTransit: latest.stockInTransit,
          actualSales: latest.actualSales || latest.forecast,
          forecastDemand: latest.forecast,
          safetyStock: latest.safetyStock,
          priceUSD: mat.priceUSD,
        });
        const orderPromptValue = result.replenishmentQty * mat.priceUSD;
        return [
          mat.id,
          mat.description,
          result.closingStock.toLocaleString(),
          result.forecastDemand.toLocaleString(),
          latest.safetyStock.toLocaleString(),
          result.replenishmentQty.toLocaleString(),
          `$${orderPromptValue.toLocaleString()}`,
          `${result.stockoutRisk}%`,
        ];
      });

      autoTable(doc, {
        startY: currentY + 32,
        head: [['SKU ID', 'Product', 'Current Stock', 'Forecast', 'Safety Stock', 'Order Prompt (Units)', 'Order Prompt (Value)', 'Risk']],
        body: invData,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // Formula page
      doc.addPage();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Calculation Formulas', 20, 25);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);

      const formulas = [
        { name: 'Order Prompt (Units)', formula: 'max(0, (Forecast + Safety Stock) - Current Stock)', desc: 'Recommended quantity to order considering safety stock' },
        { name: 'Order Prompt (Value)', formula: 'Order Prompt (Units) x Price per Unit', desc: 'Monetary value of the recommended order' },
        { name: 'Closing Stock', formula: 'Opening Stock + Stock In Transit - Actual Sales', desc: 'Current available inventory' },
        { name: 'Forecast Accuracy', formula: '(1 - |Actual - Forecast| / Actual) x 100', desc: 'Percentage accuracy of demand forecast' },
        { name: 'Stock Coverage (Months)', formula: 'Total Stock Units / Avg Monthly Sales Units', desc: 'How long current stock will last' },
        { name: 'EOQ', formula: 'sqrt(2 x Annual Demand x Order Cost / Holding Cost)', desc: 'Economic Order Quantity for cost optimization' },
      ];

      let formulaY = 55;
      formulas.forEach((f, i) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${f.name}`, 20, formulaY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(f.formula, 25, formulaY + 6);
        doc.setFontSize(8);
        doc.text(f.desc, 25, formulaY + 12);
        formulaY += 25;
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Tenchi S&OP | Page ${i} of ${totalPages} | Confidential`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`Tenchi_SOP_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    }
    setGenerating(null);
  };

  // Generate Excel Report
  const generateExcel = async () => {
    setGenerating('excel');
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      // KPIs Sheet
      const kpiData = [
        ['KPI', 'Value', 'Status', 'Trend'],
        ['Forecast Accuracy', `${kpis.forecastAccuracy?.toFixed(1) ?? '92.5'}%`, kpis.forecastAccuracy >= 90 ? 'On Target' : 'Below Target', '+2.4%'],
        ['Inventory Turns', `${kpis.inventoryTurns?.toFixed(1) ?? '8.3'}x`, kpis.inventoryTurns >= 6 ? 'Good' : 'Review', '+0.5%'],
        ['Fill Rate', `${kpis.fillRate?.toFixed(1) ?? '96.8'}%`, kpis.fillRate >= 95 ? 'On Target' : 'Below Target', '+1.2%'],
        ['Stock Coverage', `${kpis.stockCoverage?.toFixed(0) ?? '18'} days`, '-', '-2 days'],
        ['Stockout Risk', `${kpis.stockoutRisk?.toFixed(1) ?? '12'}%`, kpis.stockoutRisk <= 10 ? 'Low Risk' : 'High Risk', '-1.5%'],
        ['Total Orders', orders.length || 12, '-', '+3'],
        ['Total Revenue', `$${kpis.totalRevenue?.toLocaleString() ?? '0'}`, '-', '-'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), 'KPIs');

      // Customers Sheet
      if (customers.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), 'Customers');
      }

      // Materials Sheet
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(MATERIALS), 'Materials');

      // Orders Sheet
      if (orders.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders), 'Orders');
      }

      // Inventory & Order Prompt Sheet
      const invRows = MATERIALS.flatMap(mat => {
        const matData = HISTORICAL_DATA[mat.id] || [];
        return matData.map((d: any) => {
          const result = processInventoryRecord({
            materialId: mat.id,
            month: d.month,
            openingStock: d.openingStock,
            stockInTransit: d.stockInTransit,
            actualSales: d.actualSales,
            forecastDemand: d.forecast,
            safetyStock: d.safetyStock,
            priceUSD: mat.priceUSD,
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
            OrderPromptUnits: result.replenishmentQty,
            OrderPromptValue: result.replenishmentQty * mat.priceUSD,
            ForecastAccuracy: result.forecastAccuracy > 0 ? `${result.forecastAccuracy.toFixed(1)}%` : 'N/A',
            StockoutRisk: `${result.stockoutRisk}%`,
          };
        });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invRows), 'Inventory_OrderPrompt');

      // Formulas Sheet
      const formulaData = [
        ['Formula Name', 'Formula', 'Description'],
        ['Order Prompt (Units)', 'max(0, (Forecast + Safety Stock) - Current Stock)', 'Recommended quantity to order'],
        ['Order Prompt (Value)', 'Order Prompt (Units) x Price per Unit', 'Monetary value of order'],
        ['Closing Stock', 'Opening Stock + Stock In Transit - Actual Sales', 'Current available inventory'],
        ['Forecast Accuracy', '(1 - |Actual - Forecast| / Actual) x 100', 'Forecast accuracy percentage'],
        ['Stock Coverage', 'Total Stock / Avg Monthly Sales', 'Months of coverage'],
        ['EOQ', 'sqrt(2 x Annual Demand x Order Cost / Holding Cost)', 'Economic Order Quantity'],
        ['Reorder Point', '(Avg Daily Demand x Lead Time) + Safety Stock', 'Stock level to trigger order'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(formulaData), 'Formulas');

      XLSX.writeFile(wb, `Tenchi_SOP_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel report downloaded successfully!');
    } catch (err) {
      console.error('Excel generation error:', err);
      toast.error('Failed to generate Excel. Please try again.');
    }
    setGenerating(null);
  };

  // Focus email input when modal opens
  React.useEffect(() => {
    if (showEmailModal && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [showEmailModal]);

  // Send Email
  const sendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailTo.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setGenerating('email');
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          kpis: kpis,
          generatedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Report sent to ${emailTo}`);
        setShowEmailModal(false);
        setEmailTo('');
      } else {
        toast.error(data.message || 'Failed to send email');
      }
    } catch (err) {
      toast.error('Email service unavailable. Please try again later.');
    }
    setGenerating(null);
  };

  const handleGenerate = (type: string) => {
    if (type === 'pdf') generatePDF();
    else if (type === 'excel') generateExcel();
    else if (type === 'email') {
      setSelectedReportType('email');
      setShowEmailModal(true);
    }
  };

  return (
    <div className="min-h-screen p-5 lg:p-7"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-rose-400">Analytics & Insights</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Reports & Export</h1>
            <p className="text-sm text-slate-500 mt-0.5">Generate, download, and distribute S&OP reports</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Total Reports', value: '3', icon: FileText, color: 'indigo' },
          { label: 'Last Generated', value: '2h ago', icon: Clock, color: 'emerald' },
          { label: 'Data Points', value: '2.4k', icon: BarChart3, color: 'amber' },
          { label: 'Recipients', value: '8', icon: Users, color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <stat.icon className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative rounded-2xl p-6 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Decorative gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${report.color} opacity-10 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500`} />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg mb-4`}
              >
                <report.icon className="h-6 w-6 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2">{report.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{report.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {report.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${report.color}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenerate(report.id)}
                disabled={generating === report.id}
                className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${report.color} text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {generating === report.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : report.id === 'email' ? (
                  <>
                    <Mail className="h-4 w-4" />
                    Send via Email
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download {report.id === 'pdf' ? 'PDF' : 'Excel'}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="text-sm font-semibold text-white mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'Monthly S&OP Review - Mar 2026', type: 'PDF', date: 'Mar 20, 2026', status: 'Generated', size: '2.4 MB' },
            { name: 'Inventory Analysis Q1 2026', type: 'Excel', date: 'Mar 15, 2026', status: 'Downloaded', size: '1.8 MB' },
            { name: 'Emergency Stockout Alert', type: 'Email', date: 'Mar 10, 2026', status: 'Sent', size: '-' },
          ].map((report, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  report.type === 'PDF' ? 'bg-rose-500/15 text-rose-400' :
                  report.type === 'Excel' ? 'bg-emerald-500/15 text-emerald-400' :
                  'bg-indigo-500/15 text-indigo-400'
                }`}>
                  {report.type === 'PDF' ? <FileText className="h-4 w-4" /> :
                   report.type === 'Excel' ? <FileSpreadsheet className="h-4 w-4" /> :
                   <Mail className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{report.name}</p>
                  <p className="text-xs text-slate-500">{report.date} - {report.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  report.status === 'Sent' ? 'bg-emerald-500/15 text-emerald-300' :
                  report.status === 'Downloaded' ? 'bg-blue-500/15 text-blue-300' :
                  'bg-amber-500/15 text-amber-300'
                }`}>
                  {report.status}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEmailModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-indigo-500 to-violet-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Send Report</h3>
                      <p className="text-indigo-100 text-xs">Share via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={sendEmail} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Recipient Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!emailTo.trim() || generating === 'email'}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating === 'email' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
