'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          We apologize for the inconvenience. An error occurred while processing your request.
        </p>

        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-6 text-left">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
            <Bug className="w-4 h-4" />
            <span className="text-sm font-medium">Error Details</span>
          </div>
          <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
            {error.message || 'Unknown error'}
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
