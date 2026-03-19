'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  Sparkles
} from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    source?: string;
    confidence?: number;
    tokens?: number;
  };
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export function ChatMessage({ message, onRegenerate, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-4 ${isAssistant ? '' : 'flex-row-reverse'} group`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
            isAssistant
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}
        >
          {isAssistant ? (
            <Bot className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </motion.div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isAssistant ? '' : 'flex flex-col items-end'}`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 ${isAssistant ? '' : 'flex-row-reverse'}`}>
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {isAssistant ? 'Tenchi AI' : 'You'}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.metadata?.source && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              {message.metadata.source}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          className={`relative rounded-2xl px-5 py-4 shadow-sm ${
            isAssistant
              ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
              : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
          }`}
        >
          {/* Streaming Indicator */}
          {message.isStreaming && isAssistant && (
            <div className="flex items-center gap-2 mb-2 text-indigo-500">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-medium">AI is thinking...</span>
            </div>
          )}

          {/* Markdown Content */}
          <div className={`prose prose-sm max-w-none ${isAssistant ? 'dark:prose-invert' : 'prose-invert'}`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative group/code my-3">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t-lg border-b border-slate-700">
                        <span className="text-xs text-slate-400">{match[1]}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(String(children))}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-b-lg !m-0 !bg-slate-900"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={`${className} px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-sm font-mono`} {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 my-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-r">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse border border-gray-200 dark:border-slate-700 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50 dark:bg-slate-800">{children}</thead>,
                th: ({ children }) => <th className="px-4 py-2 text-left text-sm font-semibold border-b border-gray-200 dark:border-slate-700">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2 text-sm border-b border-gray-200 dark:border-slate-700">{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        {isAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'like' 
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'dislike' 
                  ? 'text-red-500 bg-red-50 dark:bg-red-500/10' 
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
