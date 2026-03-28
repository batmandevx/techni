'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command, FileText, Package, Users, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  category: string;
}

const mockResults: SearchResult[] = [
  { id: '1', title: 'ABC Analysis', description: 'View inventory classification', href: '/abc-dashboard', icon: BarChart3, category: 'Analytics' },
  { id: '2', title: 'Order Management', description: 'Manage orders and allocations', href: '/orders', icon: Package, category: 'Operations' },
  { id: '3', title: 'Container Tracking', description: 'Track shipments in real-time', href: '/containers', icon: TrendingUp, category: 'Logistics' },
  { id: '4', title: 'Forecasting', description: 'Demand forecasting dashboard', href: '/forecasting', icon: TrendingUp, category: 'Analytics' },
  { id: '5', title: 'Reports', description: 'Generate and export reports', href: '/reports', icon: FileText, category: 'Analytics' },
  { id: '6', title: 'Customers', description: 'Customer management', href: '/customers', icon: Users, category: 'Master Data' },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockResults.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        window.location.href = results[selectedIndex].href;
      }
    },
    [results, selectedIndex]
  );

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-sm text-gray-500 dark:text-slate-400 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded text-xs font-mono">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <kbd className="hidden sm:inline-block px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <Link
                          key={result.id}
                          href={result.href}
                          onClick={() => setIsOpen(false)}
                        >
                          <div
                            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors ${
                              index === selectedIndex
                                ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {result.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                {result.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-400">{result.category}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : query ? (
                  <div className="py-8 text-center text-gray-500 dark:text-slate-400">
                    No results found for &quot;{query}&quot;
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-slate-400">
                    Start typing to search...
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded">↑↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded">↵</kbd>
                    to select
                  </span>
                </div>
                <span>{results.length} results</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
