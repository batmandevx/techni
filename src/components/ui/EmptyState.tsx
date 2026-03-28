'use client';

import { motion } from 'framer-motion';
import { PackageX, Search, FileX, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type?: 'data' | 'search' | 'file' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const icons = {
  data: PackageX,
  search: Search,
  file: FileX,
  generic: Inbox,
};

const defaultMessages = {
  data: {
    title: 'No data available',
    description: 'There is no data to display at the moment.',
  },
  search: {
    title: 'No results found',
    description: 'We couldn\'t find any matches for your search.',
  },
  file: {
    title: 'No files uploaded',
    description: 'Upload a file to get started with the analysis.',
  },
  generic: {
    title: 'Nothing to show',
    description: 'There are no items to display here.',
  },
};

export default function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const Icon = icons[type];
  const defaults = defaultMessages[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 mb-6 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
        <Icon className="w-10 h-10 text-gray-400 dark:text-slate-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title || defaults.title}
      </h3>
      <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-6">
        {description || defaults.description}
      </p>

      {(actionLabel || actionHref || onAction) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              {actionLabel || 'Get Started'}
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              {actionLabel || 'Get Started'}
            </button>
          ) : null}
        </>
      )}
    </motion.div>
  );
}
