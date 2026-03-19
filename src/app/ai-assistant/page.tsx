'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Package, 
  Database,
  AlertTriangle,
  CheckCircle,
  Zap,
  Download,
  Globe
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useData } from '@/lib/DataContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: TrendingUp, text: 'What is our current forecast accuracy?' },
  { icon: Package, text: 'Which products are at risk of stockout?' },
  { icon: Database, text: 'Summarize our inventory position' },
  { icon: Sparkles, text: 'Recommend replenishment quantities for next month' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 **Hello! I'm your Tenchi S&OP AI Assistant** powered by Google Gemini.

I can help you with:
- 📊 **Data Analysis** — Ask about your inventory, sales, and forecasts
- 🔮 **Predictions** — Get demand forecasts and trend insights
- 📦 **Replenishment** — Calculate optimal order quantities
- ⚠️ **Risk Assessment** — Identify stockout risks

How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [language, setLanguage] = useState('English');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const { kpis, orders, historicalData, materials, customers } = useData();

  useEffect(() => {
    setIsMounted(true);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: language,
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
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsOnline(true);
    } catch (err) {
      console.error('Chat error:', err);
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

  const downloadChat = () => {
    const chatText = messages.map(m => `[${m.timestamp.toLocaleString()}] ${m.role.toUpperCase()}:\n${m.content}\n`).join('\n----------------------------------------\n');
    const blob = new Blob([`Tenchi S&OP AI Chat Report\nGenerated: ${new Date().toLocaleString()}\nUser: Tenchi Admin\nLanguage: ${language}\n\n========================================\n\n${chatText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tenchi_AI_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 8rem)', 
      display: 'flex', 
      flexDirection: 'column',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #f8fafc, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Assistant
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              Powered by Google Gemini • S&OP Domain Expert
            </p>
          </div>
        </div>
        <div className="glass-strong" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isOnline ? '#34d399' : '#f87171',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isOnline ? '#10b981' : '#ef4444',
            animation: isOnline ? 'pulse 2s infinite' : 'none',
            boxShadow: `0 0 10px ${isOnline ? '#10b981' : '#ef4444'}`
          }} />
          {isOnline ? 'System Online' : 'System Offline'}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} style={{ color: 'var(--text-muted)' }} />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="input-modern"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto', background: 'rgba(15, 23, 42, 0.6)' }}
          >
            <option value="English">🇬🇧 English</option>
            <option value="Spanish">🇪🇸 Spanish</option>
            <option value="French">🇫🇷 French</option>
            <option value="German">🇩🇪 German</option>
            <option value="Japanese">🇯🇵 Japanese</option>
            <option value="Mandarin">🇨🇳 Mandarin</option>
          </select>
        </div>
        
        <button 
          onClick={downloadChat}
          className="btn-modern btn-secondary-modern hover-lift"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', height: 'auto' }}
        >
          <Download size={16} />
          Download Report
        </button>
      </div>

      {/* Chat Area */}
      <div className="card-modern" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0
      }}>
        {/* Messages */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'linear-gradient(135deg, var(--success), #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: msg.role === 'assistant' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}>
                {msg.role === 'assistant' ? 
                  <Bot size={20} style={{ color: 'white' }} /> : 
                  <User size={20} style={{ color: 'white' }} />
                }
              </div>
              <div style={{
                maxWidth: '75%',
                padding: '1.25rem',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 0.9))' 
                  : 'rgba(30, 41, 59, 0.8)',
                color: 'var(--text)',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                boxShadow: msg.role === 'user' ? '0 10px 25px rgba(99, 102, 241, 0.2)' : '0 4px 15px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  <ReactMarkdown components={{
                    p: ({ children }) => <p style={{ margin: '0.5rem 0' }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ color: msg.role === 'user' ? '#fff' : '#818cf8', fontWeight: 600 }}>{children}</strong>,
                    ul: ({ children }) => <ul style={{ paddingLeft: '1.5rem', margin: '0.75rem 0', listStyleType: 'disc' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ margin: '0.25rem 0' }}>{children}</li>,
                  }}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  marginTop: '0.75rem',
                  textAlign: msg.role === 'user' ? 'left' : 'right',
                  fontWeight: 500
                }}>
                  {isMounted ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '1rem', animation: 'fadeIn 0.4s' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}>
                <Bot size={20} style={{ color: 'white' }} />
              </div>
              <div style={{
                padding: '1.25rem',
                borderRadius: '20px 20px 20px 4px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backdropFilter: 'blur(10px)'
              }}>
                <RefreshCw size={18} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Synthesizing S&OP insights...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="glass" style={{ 
            padding: '1.5rem', 
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)'
          }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Suggested Inquiries
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {suggestedQuestions.map((q, i) => {
                const Icon = q.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--primary)' }} />
                    {q.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about your S&OP data..."
              disabled={isLoading}
              className="input-modern"
              style={{ flex: 1, padding: '1rem 1.5rem', fontSize: '1rem', borderRadius: '16px' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: !input.trim() || isLoading ? 'rgba(51, 65, 85, 0.5)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: !input.trim() || isLoading ? 'var(--text-muted)' : 'white',
                border: !input.trim() || isLoading ? '1px solid rgba(255,255,255,0.1)' : 'none',
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: !input.trim() || isLoading ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Send size={20} style={{ marginLeft: !input.trim() || isLoading ? '0' : '2px' }} />
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            AI responses are generated based on your uploaded data and may require verification for critical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
