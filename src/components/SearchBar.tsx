'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Filter,
  ChevronDown,
  Sparkles,
  History,
  TrendingUp,
  Package,
  User,
  FileText,
  BarChart3
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'recent' | 'trending' | 'order' | 'customer' | 'product';
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  showFilters?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SearchBar({ 
  placeholder = 'Search orders, customers, products...', 
  onSearch,
  onFilter,
  showFilters = true,
  className = '',
  size = 'md'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tenchi_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Save recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('tenchi_recent_searches', JSON.stringify(updated));
  };

  // Handle search submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      saveSearch(query);
      onSearch?.(query);
      setShowSuggestions(false);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch?.(suggestion);
    setShowSuggestions(false);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-sm',
    lg: 'h-14 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div
          className={`
            relative flex items-center gap-3 
            bg-white dark:bg-slate-800 
            border border-gray-200 dark:border-slate-700 
            rounded-2xl 
            transition-all duration-200
            ${isFocused ? 'ring-2 ring-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'hover:border-gray-300 dark:hover:border-slate-600'}
            ${sizeClasses[size]}
          `}
        >
          {/* Search Icon */}
          <div className="pl-4">
            {isFocused ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Sparkles className={`${iconSizes[size]} text-indigo-500`} />
              </motion.div>
            ) : (
              <Search className={`${iconSizes[size]} text-gray-400`} />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="
              flex-1 
              bg-transparent 
              border-none 
              outline-none 
              text-gray-900 dark:text-white 
              placeholder-gray-400 dark:placeholder-slate-500
            "
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Filter Button */}
          {showFilters && (
            <button
              type="button"
              onClick={() => onFilter?.({})}
              className="
                flex items-center gap-2 px-3 py-1.5 mr-2
                text-gray-600 dark:text-slate-400
                hover:bg-gray-100 dark:hover:bg-slate-700
                rounded-xl transition-colors
              "
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Filters</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          )}

          {/* Search Button (lg size only) */}
          {size === 'lg' && (
            <button
              type="submit"
              className="
                h-full px-6 
                bg-gradient-to-r from-indigo-500 to-purple-600
                hover:from-indigo-600 hover:to-purple-700
                text-white font-medium
                rounded-r-2xl
                transition-all
                flex items-center gap-2
              "
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (recentSearches.length > 0 || query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="
              absolute top-full left-0 right-0 mt-2
              bg-white dark:bg-slate-800
              border border-gray-200 dark:border-slate-700
              rounded-2xl
              shadow-xl
              overflow-hidden
              z-50
            "
          >
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="
                      w-full flex items-center gap-3 px-3 py-2.5
                      text-left text-gray-700 dark:text-slate-300
                      hover:bg-gray-50 dark:hover:bg-slate-700/50
                      rounded-xl transition-colors
                    "
                  >
                    <History className="w-4 h-4 text-gray-400" />
                    <span className="flex-1">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {!query && (
              <div className="p-2 border-t border-gray-100 dark:border-slate-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleSuggestionClick('orders today')}
                    className="flex items-center gap-2 px-3 py-2 text-left text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    <Package className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm">Today's Orders</span>
                  </button>
                  <button
                    onClick={() => handleSuggestionClick('low stock')}
                    className="flex items-center gap-2 px-3 py-2 text-left text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Low Stock</span>
                  </button>
                  <button
                    onClick={() => handleSuggestionClick('customers')}
                    className="flex items-center gap-2 px-3 py-2 text-left text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">Customers</span>
                  </button>
                  <button
                    onClick={() => handleSuggestionClick('reports')}
                    className="flex items-center gap-2 px-3 py-2 text-left text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Reports</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
