'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, FileText, BarChart3, Download } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hello! I'm your AI Supply Chain Assistant.

I can help you with:
• 📊 Analyzing sales and inventory data
• 📈 Generating forecasts and predictions
• 📄 Creating reports and summaries
• 🔍 Finding insights in your data
• 📥 Exporting data to Excel/PDF

What would you like to know about your business today?`,
  timestamp: new Date(),
  actions: [
    { label: 'Show ABC Analysis', action: 'abc' },
    { label: 'Generate Forecast', action: 'forecast' },
    { label: 'Export Report', action: 'export' },
    { label: 'Inventory Status', action: 'inventory' },
  ],
};

// Mock AI responses
function getAIResponse(input: string): { content: string; actions?: { label: string; action: string }[] } {
  const lower = input.toLowerCase();
  
  if (lower.includes('abc') || lower.includes('analysis')) {
    return {
      content: `📊 **ABC Analysis Results**

Based on your inventory data:

**A-Class Items (20%)** - High Value
• 156 products generating 80% of revenue
• Top performers: Electronics, Premium SKUs
• Recommendation: Strict inventory control

**B-Class Items (30%)** - Medium Value  
• 234 products generating 15% of revenue
• Moderate monitoring required

**C-Class Items (50%)** - Low Value
• 390 products generating 5% of revenue
• Consider bulk ordering to reduce costs`,
      actions: [
        { label: 'View ABC Dashboard', action: 'abc-dashboard' },
        { label: 'Export Report', action: 'export-abc' },
      ],
    };
  }
  
  if (lower.includes('forecast') || lower.includes('prediction')) {
    return {
      content: `📈 **Demand Forecast - Next Quarter**

Based on historical trends and AI analysis:

| Category | Current | Forecast | Change |
|----------|---------|----------|--------|
| Electronics | 1,245 | 1,420 | +14% |
| Clothing | 892 | 956 | +7% |
| Home & Garden | 645 | 720 | +12% |
| Sports | 432 | 480 | +11% |

**Key Insights:**
• Overall demand expected to grow by 11%
• Electronics showing strongest growth
• Seasonal factors indicate Q4 spike`,
      actions: [
        { label: 'View Forecasting', action: 'forecasting' },
        { label: 'Export CSV', action: 'export-forecast' },
      ],
    };
  }
  
  if (lower.includes('inventory') || lower.includes('stock')) {
    return {
      content: `📦 **Current Inventory Status**

**Stock Levels:**
• ✅ Healthy: 412 SKUs (65%)
• ⚠️ Low Stock: 89 SKUs (14%)
• 🚨 Critical: 34 SKUs (5%)
• 📤 Overstock: 101 SKUs (16%)

**Recommendations:**
1. Reorder 34 critical items immediately
2. Reduce orders for overstocked items
3. Consider promotion for slow-moving inventory

Would you like me to generate a purchase order?`,
      actions: [
        { label: 'View Details', action: 'inventory' },
        { label: 'Generate PO', action: 'generate-po' },
      ],
    };
  }
  
  if (lower.includes('export') || lower.includes('excel') || lower.includes('pdf')) {
    return {
      content: `📥 **Export Options**

I can export your data in multiple formats:

• **Excel (.xlsx)** - Full data with formulas
• **CSV** - Raw data for analysis
• **PDF Report** - Formatted summary
• **JSON** - API-compatible format

Which would you like to download?`,
      actions: [
        { label: 'Export Excel', action: 'export-excel' },
        { label: 'Export PDF', action: 'export-pdf' },
        { label: 'Export CSV', action: 'export-csv' },
      ],
    };
  }
  
  if (lower.includes('order') || lower.includes('sales')) {
    return {
      content: `📋 **Order Summary - Last 30 Days**

**Key Metrics:**
• Total Orders: 1,247 (+12.5%)
• Revenue: $84,250 (+8.2%)
• Average Order Value: $67.50
• Fulfillment Rate: 94.3%

**Top Customers:**
1. ABC Retailers - $12,450
2. Fresh Mart - $11,230
3. Super Store - $9,840

**Status Breakdown:**
• Completed: 1,180 (95%)
• Processing: 42 (3%)
• Pending: 25 (2%)`,
      actions: [
        { label: 'View Orders', action: 'orders' },
        { label: 'Export Report', action: 'export-orders' },
      ],
    };
  }
  
  return {
    content: `I understand you're asking about "${input}".

I can help you with:
• Sales and order analysis
• Inventory management
• Demand forecasting
• ABC classification
• Data export and reporting

Could you please be more specific about what you'd like to know? For example:
- "Show me ABC analysis"
- "Generate forecast for next month"
- "What's my inventory status?"`,
    actions: [
      { label: 'ABC Analysis', action: 'abc' },
      { label: 'Forecast', action: 'forecast' },
      { label: 'Inventory', action: 'inventory' },
    ],
  };
}

function exportToCSV() {
  const data = [
    { metric: 'Total Orders', value: 1247, change: '+12.5%' },
    { metric: 'Revenue', value: 84250, change: '+8.2%' },
    { metric: 'Customers', value: 48, change: '+5.3%' },
  ];
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai-export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = getAIResponse(userMessage.content);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      actions: response.actions,
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleAction = (action: string) => {
    if (action.startsWith('export')) {
      exportToCSV();
      return;
    }
    
    // Handle navigation actions
    const responses: Record<string, string> = {
      'abc': 'Opening ABC Analysis dashboard for you...',
      'forecast': 'Navigating to forecasting page...',
      'inventory': 'Loading inventory details...',
      'orders': 'Opening orders page...',
    };
    
    const actionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: responses[action] || `Navigating to ${action}...`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, actionMessage]);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#080d1a]/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
            <p className="text-xs text-slate-400">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                  : 'bg-gradient-to-br from-indigo-500 to-violet-600'
              }`}>
                {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={`max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-md'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                }`}>
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                
                {/* Action buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action) => (
                      <button
                        key={action.action}
                        onClick={() => handleAction(action.action)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
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
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-bl-md">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-white/6 bg-[#080d1a]/50 backdrop-blur">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your data, forecasts, or request reports..."
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all"
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-12 h-12 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-center gap-2 mt-3">
          {['ABC Analysis', 'Forecast', 'Export Report', 'Inventory'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
