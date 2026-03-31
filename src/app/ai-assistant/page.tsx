'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Loader2, FileText, BarChart3, 
  TrendingUp, Target, Package, Globe, DollarSign, Calendar,
  Download, RefreshCw, AlertCircle, CheckCircle, Brain,
  ChevronRight, LayoutDashboard, PieChart, Ship, Store
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { generateGeminiResponse, isGeminiConfigured, ChatMessage } from '@/lib/geminiService';
import { getUploadedData } from '@/lib/uploadDataStore';
import Link from 'next/link';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  content: `**Welcome to Tenchi AI Assistant!**

I'm powered by **Gemini 3 Flash** and can analyze your S&OP data to answer complex business questions.

## What I Can Help You With:

### Sales & Orders
- Total order value (monthly & YTD)
- Order vs profit analysis
- Full year forecasts
- Target vs actual performance

### Geographic Analysis
- Country-wise profit & sales
- Regional performance gaps
- Market penetration analysis

### Inventory & Supply Chain
- Inventory value & classification
- Good/bad/slow inventory split
- Container tracking (in-transit)
- Port congestion & freight forecasts

### Financial Analysis
- P&L breakdown by market
- Profit margin analysis
- Cost structure insights

### Forecasting & Planning
- Demand forecasts
- Forecast accuracy analysis
- 3-year sales comparisons

**To get started:** Upload your Excel/CSV data and ask me anything about your business!

*Try: "Show me total order value YTD" or "What's my country-wise profit?"*`,
  timestamp: new Date(),
};

// Suggested questions organized by category
const SUGGESTED_QUESTIONS = {
  sales: [
    'Show me total order value for the month and YTD',
    'Show me order versus profit graph',
    'What will be my full year order forecast?',
    'Show me target versus sales YTD',
    'Show me target versus sales MTD',
  ],
  geographic: [
    'Show me country wise Profit YTD',
    'Show me the order gap versus target YTD country wise',
    'What is the Nepal market sales for my product?',
    'Show me S&OP outlook for market "x"',
    'Show me P&L breakup for market "x"',
  ],
  inventory: [
    'How much inventory am I holding?',
    'Show me split of good, bad and slow inventory',
    'Show me Forecast Accuracy Quarter wise',
    'Show me Forecast Accuracy category wise',
  ],
  logistics: [
    'How many containers are in transit?',
    'Show me containers in transit destination wise with ETA',
    'Show me forecast of ocean freight for next 3 months',
    'Show me port congestion for my destination',
  ],
  market: [
    'Show me past 3 years sales versus current year',
    'Any new launches by competition?',
    'What is the current commodity price for RM/PM?',
    'Where is the current maximum demand for my product?',
  ],
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('sales');
  const [showDataWarning, setShowDataWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadedFiles, currentData, hasRealData, dashboardData } = useData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if data is available
    if (!hasRealData && uploadedFiles.length === 0) {
      setShowDataWarning(true);
    } else {
      setShowDataWarning(false);
    }
  }, [hasRealData, uploadedFiles]);

  const handleSend = useCallback(async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from uploaded data
      const context = {
        uploadedFiles,
        currentData,
        summary: undefined as any,
        dashboardData,
        storeData: getUploadedData(),
      };

      const response = await generateGeminiResponse(
        messageText,
        context,
        messages
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `I apologize, but I encountered an error processing your request. 

**Error:** ${error instanceof Error ? error.message : 'Unknown error'}

**Please try:**
1. Refreshing the page
2. Re-uploading your data
3. Asking a more specific question

If the problem persists, please check that your data is properly formatted.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, uploadedFiles, currentData, messages, dashboardData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const exportChat = () => {
    const chatContent = messages.map(m => 
      `${m.role === 'model' ? 'AI' : 'User'} (${m.timestamp.toLocaleString()}):\n${m.content}\n\n`
    ).join('---\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenchi-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#080d1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#080d1a]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Powered by Gemini 3 Flash</span>
              {isGeminiConfigured() ? (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  Demo Mode
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasRealData && currentData && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mr-4">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">
                {currentData.name} • {currentData.rows.length.toLocaleString()} rows
              </span>
            </div>
          )}
          <button
            onClick={exportChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Data Warning Banner */}
      <AnimatePresence>
        {showDataWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-sm">
                  No data uploaded yet. Upload Excel/CSV files to enable AI analysis.
                </span>
              </div>
              <Link
                href="/upload"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Upload Data
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Suggested Questions */}
        <div className="hidden lg:flex w-80 flex-col border-r border-white/6 bg-white/[0.02]">
          <div className="p-4 border-b border-white/6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Suggested Questions
            </h3>
          </div>
          
          {/* Category Tabs */}
          <div className="flex border-b border-white/6 overflow-x-auto">
            {[
              { id: 'sales', icon: TrendingUp, label: 'Sales' },
              { id: 'geographic', icon: Globe, label: 'Geo' },
              { id: 'inventory', icon: Package, label: 'Inventory' },
              { id: 'logistics', icon: Ship, label: 'Logistics' },
              { id: 'market', icon: Store, label: 'Market' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {SUGGESTED_QUESTIONS[activeCategory as keyof typeof SUGGESTED_QUESTIONS]?.map((question, i) => (
              <button
                key={i}
                onClick={() => handleSend(question)}
                className="w-full text-left p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          {hasRealData && (
            <div className="p-4 border-t border-white/6 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Current Data</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Revenue
                  </div>
                  <p className="text-white font-semibold text-sm">
                    ${formatNumber(dashboardData.revenue)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Target className="w-3 h-3" />
                    Orders
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {formatNumber(dashboardData.totalOrders)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Package className="w-3 h-3" />
                    Products
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {formatNumber(dashboardData.products)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <BarChart3 className="w-3 h-3" />
                    Accuracy
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {dashboardData.forecastAccuracy?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                    }`}>
                      <div className="prose prose-sm max-w-none prose-invert">
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                          {message.content.split('\n').map((line, i) => {
                            // Handle headers
                            if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={i} className="text-base font-semibold text-white mt-3 mb-2">{line.replace('### ', '')}</h3>;
                            }
                            // Handle bold
                            if (line.includes('**')) {
                              const parts = line.split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={i} className="mb-2">
                                  {parts.map((part, j) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                  })}
                                </p>
                              );
                            }
                            // Handle bullet points
                            if (line.startsWith('• ')) {
                              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
                            }
                            if (line.startsWith('- ')) {
                              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
                            }
                            // Handle tables (simplified)
                            if (line.startsWith('|')) {
                              return <div key={i} className="font-mono text-xs bg-white/5 p-1 rounded">{line}</div>;
                            }
                            if (line.trim() === '') {
                              return <br key={i} />;
                            }
                            return <p key={i} className="mb-2">{line}</p>;
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-md">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-sm text-slate-400">AI is analyzing your data...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 sm:px-6 py-4 border-t border-white/6 bg-[#080d1a]/80 backdrop-blur">
            {/* Mobile Category Selector */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-3">
              {['sales', 'geographic', 'inventory', 'logistics', 'market'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your S&OP data, forecasts, inventory, or any business question..."
                  rows={1}
                  className="w-full px-4 py-3.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all resize-none min-h-[50px] max-h-[150px]"
                  style={{ height: 'auto' }}
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              <motion.button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-14 h-[50px] bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {SUGGESTED_QUESTIONS[activeCategory as keyof typeof SUGGESTED_QUESTIONS]?.slice(0, 4).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors border border-white/5 hover:border-white/10"
                >
                  {suggestion.length > 40 ? suggestion.slice(0, 40) + '...' : suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
