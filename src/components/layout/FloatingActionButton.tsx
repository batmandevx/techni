'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, FileUp, Package, X } from 'lucide-react';
import Link from 'next/link';

const actions = [
  { icon: MessageSquare, label: 'AI Assistant', href: '/ai-assistant', color: 'bg-violet-500' },
  { icon: FileUp, label: 'Upload Data', href: '/upload', color: 'bg-blue-500' },
  { icon: Package, label: 'New Order', href: '/orders', color: 'bg-emerald-500' },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="absolute bottom-16 right-0 mb-2"
                style={{ bottom: `${(index + 1) * 64}px` }}
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <span className="px-3 py-1.5 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {action.label}
                    </span>
                    <div className={`w-12 h-12 ${action.color} rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-rose-500 rotate-45' : 'bg-gradient-to-r from-indigo-500 to-violet-600'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}
