'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Menu,
  X,
  Settings,
  Globe,
  Download,
  Share2,
  Trash2,
  Moon,
  Sun,
  Sparkles,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { 
  ChatMessage, 
  ChatInput, 
  ChatSidebar, 
  TypingIndicator, 
  WelcomeScreen,
  type Message,
  type ChatSession 
} from '@/components/ai';

const languages = [
  { code: 'English', name: 'English', flag: '🇬🇧' },
  { code: 'Spanish', name: 'Español', flag: '🇪🇸' },
  { code: 'French', name: 'Français', flag: '🇫🇷' },
  { code: 'German', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'Japanese', name: '日本語', flag: '🇯🇵' },
  { code: 'Mandarin', name: '中文', flag: '🇨🇳' },
  { code: 'Arabic', name: 'العربية', flag: '🇸🇦' },
  { code: 'Portuguese', name: 'Português', flag: '🇧🇷' },
];

export default function AIAssistantPage() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { kpis, orders, historicalData, materials, customers } = useData();
  const hasData = orders.length > 0 || customers.length > 0;

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tenchi_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('tenchi_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Create new session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: 'Start chatting...',
      timestamp: new Date(),
      messageCount: 0,
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setError(null);
  }, []);

  // Initialize first session
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  // Send message
  const sendMessage = async (text: string, attachments?: File[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text + (attachments?.length ? `\n\n*[${attachments.length} file(s) attached]*` : ''),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    // Update session
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { 
              ...s, 
              lastMessage: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
              timestamp: new Date(),
              messageCount: s.messageCount + 2
            }
          : s
      ));
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          userInfo: {
            name: 'Tenchi Admin',
            role: 'Supply Chain Manager',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currentTime: new Date().toLocaleString(),
          },
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          context: {
            kpis,
            orders: orders.slice(0, 100),
            historicalData,
            materials,
            customers
          }
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, I encountered an issue. Please try again.',
        timestamp: new Date(),
        metadata: {
          source: data.source,
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsOnline(true);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Unable to connect to the AI service. Please check your API configuration and try again.',
        timestamp: new Date(),
      }]);
      setIsOnline(false);
    }
    setIsLoading(false);
  };

  // Regenerate response
  const regenerateResponse = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove last assistant message
      setMessages(prev => prev.slice(0, -1));
      await sendMessage(lastUserMessage.content);
    }
  };

  // Delete session
  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
        setMessages([]);
      } else {
        createNewSession();
      }
    }
  };

  // Rename session
  const renameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, title: newTitle } : s
    ));
  };

  // Download chat
  const downloadChat = () => {
    const chatText = messages.map(m => 
      `[${m.timestamp.toLocaleString()}] ${m.role.toUpperCase()}:\n${m.content}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([
      `Tenchi S&OP AI Chat Report\n` +
      `Generated: ${new Date().toLocaleString()}\n` +
      `Language: ${language}\n` +
      `Messages: ${messages.length}\n\n` +
      `========================================\n\n${chatText}`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tenchi_AI_Chat_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messageCount: 0, lastMessage: 'Start chatting...' }
          : s
      ));
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewSession}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setMessages([]);
        }}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  AI Assistant
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {isOnline ? 'Online' : 'Offline'} • Powered by Gemini
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{languages.find(l => l.code === language)?.flag}</span>
                <span className="hidden sm:inline">{language}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-1 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                          language === lang.code
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Chat */}
            <button
              onClick={clearChat}
              disabled={messages.length === 0}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={downloadChat}
              disabled={messages.length === 0}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
              title="Download chat"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20"
            >
              <div className="flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen 
              onSuggestionClick={sendMessage}
              hasData={hasData}
            />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLast={index === messages.length - 1}
                    onRegenerate={regenerateResponse}
                  />
                ))}
              </AnimatePresence>

              {isLoading && !isStreaming && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <TypingIndicator />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              disabled={!currentSessionId}
              placeholder={hasData 
                ? "Ask about your S&OP data, forecasts, inventory..." 
                : "Upload data to get AI-powered insights"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
