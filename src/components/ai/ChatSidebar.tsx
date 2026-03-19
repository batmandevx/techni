'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Clock,
  MoreVertical,
  Edit3,
  Share2,
  Download
} from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:static inset-y-0 left-0 w-72 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative rounded-xl transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentSessionId === session.id
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                    }`}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === session.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRename(session.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(session.id);
                            if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditTitle('');
                            }
                          }}
                          autoFocus
                          className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-indigo-500 rounded focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {session.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                            {session.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatTime(session.timestamp)}
                            </span>
                            <span className="text-xs text-gray-400">
                              • {session.messageCount} messages
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {/* Actions */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative group/menu">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-1 min-w-[140px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Export functionality
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-slate-700" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="text-xs text-gray-500 dark:text-slate-500 text-center">
            <p>Tenchi AI Assistant</p>
            <p className="mt-0.5">Powered by Google Gemini</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
