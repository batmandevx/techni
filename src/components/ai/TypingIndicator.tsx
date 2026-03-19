'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-fit">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-indigo-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-slate-400">AI is thinking...</span>
    </div>
  );
}
