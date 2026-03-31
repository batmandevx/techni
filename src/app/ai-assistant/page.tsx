'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Loader2, FileText, BarChart3, 
  TrendingUp, Target, Package, Globe, DollarSign, Calendar,
  Download, RefreshCw, AlertCircle, CheckCircle, Brain,
  ChevronRight, LayoutDashboard, PieChart, Ship, Store,
  Languages, Menu, X
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { generateGeminiResponse, isGeminiConfigured, ChatMessage } from '@/lib/geminiService';
import { getUploadedData } from '@/lib/uploadDataStore';
import Link from 'next/link';
import AgentPlan from '@/components/ui/agent-plan';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const TRANSLATIONS: Translations = {
  welcomeTitle: {
    en: '**Welcome to Tenchi AI Assistant!**',
    ar: '**مرحباً بك في مساعد تنشي الذكي!**'
  },
  welcomeSubtitle: {
    en: "I'm powered by **Gemini 3 Flash** and can analyze your S&OP data to answer complex business questions.",
    ar: 'أعمل بتقنية **جيميناي 3 فلاش** ويمكنني تحليل بيانات S&OP الخاصة بك للإجابة على الأسئلة التجارية المعقدة.'
  },
  whatCanHelp: {
    en: '## What I Can Help You With:',
    ar: '## كيف يمكنني مساعدتك:'
  },
  salesOrders: {
    en: '### Sales & Orders',
    ar: '### المبيعات والطلبات'
  },
  salesOrdersDesc: {
    en: '• Total order value (monthly & YTD)\n• Order vs profit analysis\n• Full year forecasts\n• Target vs actual performance',
    ar: '• إجمالي قيمة الطلبات (شهري وسنوي)\n• تحليل الطلبات مقابل الأرباح\n• التوقعات السنوية\n• الأداء الفعلي مقابل المستهدف'
  },
  geographic: {
    en: '### Geographic Analysis',
    ar: '### التحليل الجغرافي'
  },
  geographicDesc: {
    en: '• Country-wise profit & sales\n• Regional performance gaps\n• Market penetration analysis',
    ar: '• الأرباح والمبيعات حسب الدولة\n• فجوات الأداء الإقليمية\n• تحليل اختراق السوق'
  },
  inventory: {
    en: '### Inventory & Supply Chain',
    ar: '### المخزون وسلسلة التوريد'
  },
  inventoryDesc: {
    en: '• Inventory value & classification\n• Good/bad/slow inventory split\n• Container tracking (in-transit)\n• Port congestion & freight forecasts',
    ar: '• قيمة المخزون والتصنيف\n• تقسيم المخزون (جيد/سيئ/بطيء)\n• تتبع الحاويات (في النقل)\n• ازدحام الموانئ وتوقعات الشحن'
  },
  financial: {
    en: '### Financial Analysis',
    ar: '### التحليل المالي'
  },
  financialDesc: {
    en: '• P&L breakdown by market\n• Profit margin analysis\n• Cost structure insights',
    ar: '• تفصيل الأرباح والخسائر حسب السوق\n• تحليل هامش الربح\n• رؤى هيكل التكاليف'
  },
  forecasting: {
    en: '### Forecasting & Planning',
    ar: '### التوقعات والتخطيط'
  },
  forecastingDesc: {
    en: '• Demand forecasts\n• Forecast accuracy analysis\n• 3-year sales comparisons',
    ar: '• توقعات الطلب\n• تحليل دقة التوقعات\n• مقارنات المبيعات لمدة 3 سنوات'
  },
  getStarted: {
    en: '**To get started:** Upload your Excel/CSV data and ask me anything about your business!',
    ar: '**للبدء:** قم بتحميل بيانات Excel/CSV واسألني أي شيء عن عملك!'
  },
  tryExamples: {
    en: '*Try: "Show me total order value YTD" or "What\'s my country-wise profit?"*',
    ar: '*جرب: "أرني إجمالي قيمة الطلبات السنوية" أو "ما هو ربحي حسب الدولة؟"*'
  },
  aiAssistant: {
    en: 'AI Assistant',
    ar: 'المساعد الذكي'
  },
  poweredBy: {
    en: 'Powered by Gemini 3 Flash',
    ar: 'مدعوم بجيميناي 3 فلاش'
  },
  connected: {
    en: 'Connected',
    ar: 'متصل'
  },
  demoMode: {
    en: 'Demo Mode',
    ar: 'وضع العرض'
  },
  export: {
    en: 'Export',
    ar: 'تصدير'
  },
  clear: {
    en: 'Clear',
    ar: 'مسح'
  },
  noDataWarning: {
    en: 'No data uploaded yet. Upload Excel/CSV files to enable AI analysis.',
    ar: 'لم يتم تحميل أي بيانات بعد. قم بتحميل ملفات Excel/CSV لتمكين التحليل الذكي.'
  },
  uploadData: {
    en: 'Upload Data',
    ar: 'تحميل البيانات'
  },
  suggestedQuestions: {
    en: 'Suggested Questions',
    ar: 'أسئلة مقترحة'
  },
  currentData: {
    en: 'Current Data',
    ar: 'البيانات الحالية'
  },
  revenue: {
    en: 'Revenue',
    ar: 'الإيرادات'
  },
  orders: {
    en: 'Orders',
    ar: 'الطلبات'
  },
  products: {
    en: 'Products',
    ar: 'المنتجات'
  },
  accuracy: {
    en: 'Accuracy',
    ar: 'الدقة'
  },
  analyzing: {
    en: 'AI is analyzing your data...',
    ar: 'جاري تحليل بياناتك...'
  },
  placeholder: {
    en: 'Ask about your S&OP data, forecasts, inventory, or any business question...',
    ar: 'اسأل عن بيانات S&OP الخاصة بك، أو التوقعات، أو المخزون، أو أي سؤال تجاري...'
  },
  errorTitle: {
    en: 'I apologize, but I encountered an error processing your request.',
    ar: 'أعتذر، ولكن حدث خطأ أثناء معالجة طلبك.'
  },
  errorPleaseTry: {
    en: '**Please try:**\n1. Refreshing the page\n2. Re-uploading your data\n3. Asking a more specific question',
    ar: '**يرجى المحاولة:**\n1. تحديث الصفحة\n2. إعادة تحميل بياناتك\n3. طرح سؤال أكثر تحديداً'
  },
  sales: { en: 'Sales', ar: 'مبيعات' },
  geo: { en: 'Geo', ar: 'جغرافي' },
  inventoryShort: { en: 'Inventory', ar: 'مخزون' },
  logistics: { en: 'Logistics', ar: 'لوجستيات' },
  market: { en: 'Market', ar: 'سوق' },
  language: { en: 'Language', ar: 'اللغة' },
  close: { en: 'Close', ar: 'إغلاق' },
  menu: { en: 'Menu', ar: 'القائمة' },
};

const SUGGESTED_QUESTIONS = {
  sales: {
    en: [
      'Show me total order value for the month and YTD',
      'Show me order versus profit graph',
      'What will be my full year order forecast?',
      'Show me target versus sales YTD',
      'Show me target versus sales MTD',
    ],
    ar: [
      'أرني إجمالي قيمة الطلبات للشهر والسنة',
      'أرني رسم بياني للطلبات مقابل الأرباح',
      'ما هي توقعات طلباتي للسنة الكاملة؟',
      'أرني المستهدف مقابل المبيعات السنوية',
      'أرني المستهدف مقابل المبيعات الشهرية',
    ]
  },
  geographic: {
    en: [
      'Show me country wise Profit YTD',
      'Show me the order gap versus target YTD country wise',
      'What is the Nepal market sales for my product?',
      'Show me S&OP outlook for market "x"',
      'Show me P&L breakup for market "x"',
    ],
    ar: [
      'أرني الأرباح حسب الدولة للسنة',
      'أرني فجوة الطلبات مقابل المستهدف حسب الدولة',
      'ما هي مبيعات سوق نيبال لمنتجي؟',
      'أرني نظرة S&OP لسوق "x"',
      'أرني تفصيل الأرباح والخسائر لسوق "x"',
    ]
  },
  inventory: {
    en: [
      'How much inventory am I holding?',
      'Show me split of good, bad and slow inventory',
      'Show me Forecast Accuracy Quarter wise',
      'Show me Forecast Accuracy category wise',
    ],
    ar: [
      'كم مخزون أحتفظ به؟',
      'أرني تقسيم المخزون الجيد والسيئ والبطيء',
      'أرني دقة التوقعات حسب الربع',
      'أرني دقة التوقعات حسب الفئة',
    ]
  },
  logistics: {
    en: [
      'How many containers are in transit?',
      'Show me containers in transit destination wise with ETA',
      'Show me forecast of ocean freight for next 3 months',
      'Show me port congestion for my destination',
    ],
    ar: [
      'كم عدد الحاويات في النقل؟',
      'أرني الحاويات في النقل حسب الوجهة مع وقت الوصول',
      'أرني توقعات شحن المحيط للأشهر الثلاثة القادمة',
      'أرني ازدحام الموانئ لوجهتي',
    ]
  },
  market: {
    en: [
      'Show me past 3 years sales versus current year',
      'Any new launches by competition?',
      'What is the current commodity price for RM/PM?',
      'Where is the current maximum demand for my product?',
    ],
    ar: [
      'أرني مبيعات آخر 3 سنوات مقابل السنة الحالية',
      'هل هناك إطلاقات جديدة من المنافسين؟',
      'ما هو سعر السلع الحالي للمواد الخام؟',
      'أين هو الطلب الأقصى لمنتجي حالياً؟',
    ]
  },
};

function useTranslations(lang: Language) {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  return { t };
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('sales');
  const [showDataWarning, setShowDataWarning] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadedFiles, currentData, hasRealData, dashboardData } = useData();
  const { t } = useTranslations(language);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize welcome message when language changes
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'model',
      content: `${t('welcomeTitle')}

${t('welcomeSubtitle')}

${t('whatCanHelp')}

${t('salesOrders')}
${t('salesOrdersDesc')}

${t('geographic')}
${t('geographicDesc')}

${t('inventory')}
${t('inventoryDesc')}

${t('financial')}
${t('financialDesc')}

${t('forecasting')}
${t('forecastingDesc')}

${t('getStarted')}

${t('tryExamples')}`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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
      const context = {
        uploadedFiles,
        currentData,
        summary: undefined as any,
        dashboardData,
        storeData: getUploadedData(),
        language,
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
        content: `${t('errorTitle')}

**${language === 'ar' ? 'خطأ:' : 'Error:'}** ${error instanceof Error ? error.message : language === 'ar' ? 'خطأ غير معروف' : 'Unknown error'}

${t('errorPleaseTry')}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, uploadedFiles, currentData, messages, dashboardData, language, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'model',
      content: `${t('welcomeTitle')}

${t('welcomeSubtitle')}

${t('whatCanHelp')}

${t('salesOrders')}
${t('salesOrdersDesc')}

${t('geographic')}
${t('geographicDesc')}

${t('inventory')}
${t('inventoryDesc')}

${t('financial')}
${t('financialDesc')}

${t('forecasting')}
${t('forecastingDesc')}

${t('getStarted')}

${t('tryExamples')}`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const exportChat = () => {
    const chatContent = messages.map(m => 
      `${m.role === 'model' ? 'AI' : 'User'} (${m.timestamp?.toLocaleString() ?? 'Unknown time'}):\n${m.content}\n\n`
    ).join('---\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenchi-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Categories with translations
  const categories = [
    { id: 'sales', icon: TrendingUp, label: t('sales') },
    { id: 'geographic', icon: Globe, label: t('geo') },
    { id: 'inventory', icon: Package, label: t('inventoryShort') },
    { id: 'logistics', icon: Ship, label: t('logistics') },
    { id: 'market', icon: Store, label: t('market') },
  ];

  const isRTL = language === 'ar';

  return (
    <div className="h-[calc(100dvh-3.5rem)] flex flex-col bg-[#080d1a]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-white/6 bg-[#080d1a]/80 backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">{t('aiAssistant')}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-slate-400">{t('poweredBy')}</span>
              {isGeminiConfigured() ? (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  {t('connected')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-400">
                  <AlertCircle className="w-3 h-3" />
                  {t('demoMode')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title={t('language')}
          >
            <Languages className="w-4 h-4" />
            <span className="font-semibold">{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
          
          {hasRealData && currentData && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mr-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">
                {currentData.name} • {currentData.rows.length.toLocaleString()} rows
              </span>
            </div>
          )}
          
          <button
            onClick={exportChat}
            className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('export')}</span>
          </button>
          
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('clear')}</span>
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
            className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-6 py-2 sm:py-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-amber-400 text-xs sm:text-sm">
                  {t('noDataWarning')}
                </span>
              </div>
              <Link
                href="/upload"
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
              >
                {t('uploadData')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Suggested Questions - Desktop */}
        <div className="hidden lg:flex w-80 flex-col border-r border-white/6 bg-white/[0.02]">
          <div className="p-4 border-b border-white/6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {t('suggestedQuestions')}
            </h3>
          </div>
          
          {/* Category Tabs */}
          <div className="flex border-b border-white/6 overflow-x-auto">
            {categories.map((cat) => (
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
            {SUGGESTED_QUESTIONS[activeCategory as keyof typeof SUGGESTED_QUESTIONS]?.[language].map((question, i) => (
              <button
                key={i}
                onClick={() => handleSend(question)}
                className="w-full text-left p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
              >
                {question}
              </button>
            ))}
          </div>

          {/* AI Agent Plan */}
          <div className="flex-1 overflow-hidden border-t border-white/6">
            <AgentPlan />
          </div>

          {/* Quick Stats */}
          {hasRealData && (
            <div className="p-4 border-t border-white/6 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">{t('currentData')}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    {t('revenue')}
                  </div>
                  <p className="text-white font-semibold text-sm">
                    ${formatNumber(dashboardData.revenue)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Target className="w-3 h-3" />
                    {t('orders')}
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {formatNumber(dashboardData.totalOrders)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Package className="w-3 h-3" />
                    {t('products')}
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {formatNumber(dashboardData.products)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <BarChart3 className="w-3 h-3" />
                    {t('accuracy')}
                  </div>
                  <p className="text-white font-semibold text-sm">
                    {dashboardData.forecastAccuracy?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <motion.div
                initial={{ x: isRTL ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRTL ? '100%' : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 bottom-0 w-80 bg-[#080d1a] border-r border-white/6"
                style={{ [isRTL ? 'right' : 'left']: 0 }}
                onClick={(e) => e.stopPropagation()}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center justify-between p-4 border-b border-white/6">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    {t('suggestedQuestions')}
                  </h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div className="flex border-b border-white/6 overflow-x-auto">
                  {categories.map((cat) => (
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
                  {SUGGESTED_QUESTIONS[activeCategory as keyof typeof SUGGESTED_QUESTIONS]?.[language].map((question, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handleSend(question);
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                      : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  
                  <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-3 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-md'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                    }`}>
                      <div className="prose prose-sm max-w-none prose-invert">
                        <div className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                          {message.content.split('\n').map((line, i) => {
                            if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-base sm:text-lg font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={i} className="text-sm sm:text-base font-semibold text-white mt-3 mb-2">{line.replace('### ', '')}</h3>;
                            }
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
                            if (line.startsWith('• ')) {
                              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
                            }
                            if (line.startsWith('- ')) {
                              return <li key={i} className="ml-4 mb-1">{line.slice(2)}</li>;
                            }
                            if (line.startsWith('|')) {
                              return <div key={i} className="font-mono text-[10px] sm:text-xs bg-white/5 p-1 rounded overflow-x-auto">{line}</div>;
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
                      {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? ''}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="px-3 sm:px-5 py-3 sm:py-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-md">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-spin" />
                    <span className="text-xs sm:text-sm text-slate-400">{t('analyzing')}</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-white/6 bg-[#080d1a]/80 backdrop-blur">
            {/* Mobile Category Selector */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 sm:pb-3 mb-2 sm:mb-3 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('placeholder')}
                  rows={1}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 pr-10 sm:pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all resize-none text-sm min-h-[44px] sm:min-h-[50px] max-h-[100px] sm:max-h-[150px]"
                  style={{ height: 'auto' }}
                />
                <Sparkles className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              <motion.button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} />
                )}
              </motion.button>
            </div>
            
            {/* Mobile Suggestions */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 flex-wrap">
              {SUGGESTED_QUESTIONS[activeCategory as keyof typeof SUGGESTED_QUESTIONS]?.[language].slice(0, 3).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors border border-white/5 hover:border-white/10"
                >
                  {suggestion.length > (isMobile ? 25 : 40) ? suggestion.slice(0, isMobile ? 25 : 40) + '...' : suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
