'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, X, Send, Sparkles, Bot, User, 
  TrendingUp, Package, Truck, FileText, BarChart3,
  MoreHorizontal, Loader2, ChevronDown, ChevronUp,
  Download, Copy, CheckCircle2, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Message types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  actions?: MessageAction[];
  data?: any;
}

interface MessageAction {
  label: string;
  icon: any;
  action: () => void;
}

// Quick action suggestions
const QUICK_ACTIONS = [
  { label: 'Show ABC Analysis', icon: BarChart3, query: 'Show me the ABC analysis dashboard' },
  { label: 'Stock Coverage', icon: Package, query: 'What is my current stock coverage?' },
  { label: 'Order Status', icon: Truck, query: 'Show pending orders' },
  { label: 'Forecast Accuracy', icon: TrendingUp, query: 'Show forecast accuracy report' },
];

// FAQ suggestions
const FAQ_SUGGESTIONS = [
  'What is my total inventory value?',
  'Show me orders with low coverage',
  'Generate order prompt report',
  'What containers are in transit?',
  'Show production plan for next month',
  'List kits ready for assembly',
];

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-1">
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
      className="w-2 h-2 rounded-full bg-indigo-500"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
      className="w-2 h-2 rounded-full bg-indigo-500"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
      className="w-2 h-2 rounded-full bg-indigo-500"
    />
  </div>
);

// Message bubble component
const MessageBubble = ({ message, onAction }: { message: Message; onAction?: (action: any) => void }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600' 
          : 'bg-gradient-to-br from-amber-500 to-orange-600'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`relative group rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-br-md'
            : 'bg-slate-800 text-gray-100 rounded-bl-md border border-slate-700'
        }`}>
          {message.isTyping ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Copy button for assistant messages */}
          {!isUser && !message.isTyping && (
            <button
              onClick={handleCopy}
              className="absolute -right-2 -top-2 p-1.5 rounded-lg bg-slate-700 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Message actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map((action, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction?.(action)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-gray-300 transition-colors"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Data visualization */}
        {message.data && (
          <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
            <pre className="text-xs text-gray-400 overflow-auto">
              {JSON.stringify(message.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Export chat modal
const ExportModal = ({ isOpen, onClose, messages }: { isOpen: boolean; onClose: () => void; messages: Message[] }) => {
  if (!isOpen) return null;

  const handleExportPDF = () => {
    // Trigger PDF export
    window.dispatchEvent(new CustomEvent('export-chat-pdf', { detail: messages }));
    onClose();
  };

  const handleExportText = () => {
    const text = messages.map(m => 
      `${m.role.toUpperCase()} (${m.timestamp.toLocaleString()}):\n${m.content}\n\n`
    ).join('---\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenchi-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-64"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-white font-semibold mb-4">Export Chat</h3>
          <div className="space-y-2">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export as PDF
            </button>
            <button
              onClick={handleExportText}
              className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export as Text
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I'm your TenchiOne AI Assistant. I can help you with:\n\n• **Inventory Analysis** - ABC classification, stock coverage\n• **Order Management** - View orders, allocations, status\n• **Forecasting** - Check forecast accuracy, trends\n• **Container Tracking** - Track shipments in real-time\n• **Production Planning** - BOM, MRP, vendor ETAs\n• **Reports** - Generate and export reports\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'abc': 'Here\'s your ABC Analysis summary:\n\n**Class A (Top 80% value):** 8 SKUs\n**Class B (Next 15%):** 12 SKUs\n**Class C (Bottom 5%):** 5 SKUs\n\n⚠️ **Alert:** 3 Class A SKUs have less than 1 month coverage.\n\nWould you like me to show the detailed report?',
        'stock': 'Your current stock metrics:\n\n• **Total Stock Value:** $68.4K\n• **Coverage < 1 month:** 4 SKUs (action needed)\n• **Coverage 1-2 months:** 6 SKUs\n• **Coverage > 2 months:** 15 SKUs (healthy)\n\n**Recommendation:** Place orders for SKUs with coverage below safety stock.',
        'order': 'You have **12 orders** in the system:\n\n• Created: 3\n• Confirmed: 4\n• Allocated: 2\n• Shipped: 2\n• Delivered: 1\n\n2 orders are on credit hold and require approval.',
        'forecast': 'Forecast Accuracy Report (M-1):\n\n• **Overall Accuracy:** 94.2%\n• **Best Category:** Coffee Candy (98.5%)\n• **Needs Attention:** Jelly Candy (87.3%)\n\nThe model is performing well within target range (>90%).',
        'container': '**Containers in Transit:** 3\n\n| Container | Origin | ETA | Status |\n|-----------|--------|-----|--------|\n| MSKU1234567 | Shanghai | 2026-03-28 | In Transit |\n| MSCU7654321 | Rotterdam | 2026-03-30 | At Port |\n| HLCU9876543 | Dubai | 2026-04-02 | Loading |',
        'production': '**Production Plan - April 2026:**\n\n• SKU-A001: 5,000 units (Materials OK)\n• SKU-B002: 3,000 units (Awaiting PM delivery)\n• SKU-C003: 2,500 units (Delayed - RM shortage)\n\nNext material arrival: March 26, 2026',
        'kit': '**Kitting Status:**\n\n• Promo Kit A: 150 units ready\n• Combo Pack B: 75 units (awaiting component)\n• Gift Set C: 200 units ready\n\n2 kits can be allocated to pending orders.',
      };

      // Find matching response
      const query = userMessage.content.toLowerCase();
      let response = 'I understand you\'re asking about ' + userMessage.content + '. Let me fetch the latest data for you...\n\nIn the meantime, you can try asking about:\n• ABC Analysis\n• Stock Coverage\n• Orders\n• Forecast Accuracy\n• Container Tracking';

      for (const [key, value] of Object.entries(responses)) {
        if (query.includes(key)) {
          response = value;
          break;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions: [
          { label: 'View Details', icon: BarChart3, action: () => window.location.href = '/abc-dashboard' },
          { label: 'Export Report', icon: Download, action: () => setShowExport(true) },
        ],
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setInputValue(action.query);
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Chat cleared. How can I help you today?',
      timestamp: new Date(),
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-500 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center group"
          >
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              AI
            </span>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 'auto' : '600px',
              width: isMinimized ? '300px' : '400px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            {/* Export Modal */}
            <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} messages={messages} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">TenchiOne AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 transition-colors"
                >
                  {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowExport(true)}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isTyping && (
                    <MessageBubble 
                      message={{ 
                        id: 'typing', 
                        role: 'assistant', 
                        content: '', 
                        timestamp: new Date(),
                        isTyping: true 
                      }} 
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 border-t border-slate-800">
                  <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction(action)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-gray-300 transition-colors"
                      >
                        <action.icon className="w-3 h-3" />
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* FAQ Suggestions */}
                <div className="px-4 py-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-gray-500">Try asking:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {FAQ_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="px-2 py-0.5 bg-slate-800/50 hover:bg-slate-800 text-[10px] text-gray-400 hover:text-gray-300 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything about your S&OP data..."
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
