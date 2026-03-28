'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Search, Filter, RefreshCw, ArrowLeft, FileText, AlertTriangle,
  Download, MoreHorizontal, Trash2, Eye
} from 'lucide-react';
import { SmartOrderBatch, SmartOrderLine } from '@/lib/smart-order/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function OrdersPage() {
  const [batches, setBatches] = useState<SmartOrderBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [batchDetails, setBatchDetails] = useState<SmartOrderBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchDetails(selectedBatch);
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/batches');
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId: string) => {
    try {
      const response = await fetch(`/api/batches/${batchId}`);
      if (!response.ok) throw new Error('Failed to fetch batch details');
      const data = await response.json();
      setBatchDetails(data.batch);
    } catch (error) {
      console.error('Failed to fetch batch details:', error);
    }
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    
    try {
      const response = await fetch(`/api/batches/${batchId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete batch');
      await fetchBatches();
      if (selectedBatch === batchId) setSelectedBatch(null);
    } catch (error) {
      console.error('Failed to delete batch:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PARTIAL_SUCCESS': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'PROCESSING': return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'CREATED': 'bg-green-100 text-green-800 border-green-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'VALID': 'bg-blue-100 text-blue-800 border-blue-200',
      'INVALID': 'bg-red-100 text-red-800 border-red-200',
      'PENDING': 'bg-gray-100 text-gray-800 border-gray-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBatchStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'PARTIAL_SUCCESS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
      'VALIDATED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'UPLOADED': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredBatches = batches.filter(batch => {
    if (filter !== 'all' && batch.status !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return batch.batchName.toLowerCase().includes(searchLower) ||
             batch.fileName.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link href="/smartorder" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">Order History</h1>
            <p className="text-gray-500 mt-1">View and manage processed order batches</p>
          </div>
        </div>
        <Link
          href="/smartorder/upload"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e89a2d] to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all"
        >
          <Package className="w-5 h-5" />
          New Upload
        </Link>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#e89a2d] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#e89a2d] focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="PARTIAL_SUCCESS">Partial Success</option>
            <option value="VALIDATED">Validated</option>
          </select>
          <button 
            onClick={fetchBatches}
            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Batches Table */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Batch</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Total</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Success</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Failed</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No batches found</p>
                    <Link href="/smartorder/upload" className="text-[#e89a2d] hover:underline mt-2 inline-block">
                      Upload your first batch
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch, index) => (
                  <React.Fragment key={batch.id}>
                    <motion.tr
                      variants={itemVariants}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedBatch(selectedBatch === batch.id ? null : batch.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            batch.status === 'COMPLETED' ? 'bg-green-100' :
                            batch.status === 'FAILED' ? 'bg-red-100' :
                            batch.status === 'PROCESSING' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {getStatusIcon(batch.status)}
                          </div>
                          <div>
                            <p className="font-medium text-[#1a1a2e]">{batch.batchName}</p>
                            <p className="text-xs text-gray-500">{batch.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBatchStatusBadge(batch.status)}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-medium">{batch.totalOrders}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-green-600 font-medium">{batch.successCount}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-red-600 font-medium">{batch.failedCount}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBatch(selectedBatch === batch.id ? null : batch.id);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {selectedBatch === batch.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(batch.id);
                            }}
                            className="p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedBatch === batch.id && batchDetails && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="p-0">
                            <div className="bg-gray-50 p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[#1a1a2e]">Order Lines</h3>
                                {batchDetails.report && (
                                  <div className="text-sm text-gray-500">
                                    Progress: {batchDetails.report.progressPercent}%
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="max-h-96 overflow-y-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr>
                                        <th className="text-left py-3 px-4 text-sm font-semibold">Row</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold">Material</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold">Qty</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold">Price</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold">SAP Order</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {batchDetails.lines.map((line: SmartOrderLine) => (
                                        <tr key={line.id} className="hover:bg-gray-50">
                                          <td className="py-3 px-4 text-sm">{line.rowIndex}</td>
                                          <td className="py-3 px-4 text-sm">
                                            <div>
                                              <p className="font-medium">{line.soldTo}</p>
                                              {line.shipTo !== line.soldTo && (
                                                <p className="text-xs text-gray-500">Ship: {line.shipTo}</p>
                                              )}
                                            </div>
                                          </td>
                                          <td className="py-3 px-4 text-sm">
                                            <div>
                                              <p className="font-medium">{line.material}</p>
                                              <p className="text-xs text-gray-500">{line.plant}</p>
                                            </div>
                                          </td>
                                          <td className="py-3 px-4 text-sm text-right">{line.quantity}</td>
                                          <td className="py-3 px-4 text-sm text-right">
                                            {line.price ? `$${line.price.toFixed(2)}` : '-'}
                                          </td>
                                          <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(line.status)}`}>
                                              {line.status}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-sm font-mono">
                                            {line.sapOrderNumber || '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
