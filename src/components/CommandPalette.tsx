'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Package, 
  Upload, 
  FileSpreadsheet, 
  Bot,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href?: string;
  shortcut?: string;
  category: string;
}

const commands: CommandItem[] = [
  { id: 'dashboard', title: 'Dashboard', description: 'Go to main dashboard', icon: LayoutDashboard, href: '/', shortcut: 'G D', category: 'Navigation' },
  { id: 'abc', title: 'ABC Analysis', description: 'Inventory classification and analysis', icon: BarChart3, href: '/abc-dashboard', shortcut: 'G A', category: 'Navigation' },
  { id: 'forecast', title: 'Demand Forecasting', description: 'AI-powered demand predictions', icon: TrendingUp, href: '/forecasting', shortcut: 'G F', category: 'Navigation' },
  { id: 'optimizer', title: 'Order Optimizer', description: 'EOQ and reorder optimization', icon: Package, href: '/optimizer', shortcut: 'G O', category: 'Navigation' },
  { id: 'upload', title: 'Data Import', description: 'Import Excel and CSV files', icon: Upload, href: '/upload', shortcut: 'G U', category: 'Navigation' },
  { id: 'reports', title: 'Reports', description: 'Generate and export reports', icon: FileSpreadsheet, href: '/reports', shortcut: 'G R', category: 'Navigation' },
  { id: 'ai-assistant', title: 'AI Assistant', description: 'Get intelligent insights', icon: Bot, href: '/ai-assistant', shortcut: 'G I', category: 'Navigation' },
  { id: 'settings', title: 'Settings', description: 'Configure application', icon: Settings, href: '/settings', shortcut: 'G S', category: 'Preferences' },
  { id: 'profile', title: 'Profile', description: 'View and edit your profile', icon: User, href: '/profile', category: 'Preferences' },
  { id: 'logout', title: 'Logout', description: 'Sign out of your account', icon: LogOut, category: 'Preferences' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open with Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    // Close with Escape
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (command: CommandItem) => {
    if (command.href) {
      window.location.href = command.href;
    }
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Search className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Search...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600">
          ⌘K
        </kbd>
      </button>

      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-slate-400" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search commands, pages, or actions..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                />
                <kbd className="hidden sm:block px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                ) : (
                  Object.entries(
                    filteredCommands.reduce((acc, cmd) => {
                      if (!acc[cmd.category]) acc[cmd.category] = [];
                      acc[cmd.category].push(cmd);
                      return acc;
                    }, {} as Record<string, CommandItem[]>)
                  ).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {items.map((command, index) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const Icon = command.icon;
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <Link
                            key={command.id}
                            href={command.href || '#'}
                            onClick={(e) => {
                              if (!command.href) e.preventDefault();
                              setIsOpen(false);
                            }}
                          >
                            <motion.div
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-indigo-50 dark:bg-indigo-500/20' 
                                  : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                              }`}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <div className={`p-2 rounded-lg ${
                                isSelected 
                                  ? 'bg-indigo-500 text-white' 
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                  {command.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                                  {command.description}
                                </p>
                              </div>
                              {command.shortcut && (
                                <div className="hidden sm:flex items-center gap-1">
                                  {command.shortcut.split(' ').map((key, i) => (
                                    <kbd key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                                      {key}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                              <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`} />
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border">↑↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border">↵</kbd>
                    to select
                  </span>
                </div>
                <span>{filteredCommands.length} results</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
