'use client';

import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { isDark, toggleTheme, mounted } = useTheme();

  // Return placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div style={{
        width: '60px',
        height: '32px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        opacity: 0.5,
      }} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'relative',
        width: '60px',
        height: '32px',
        borderRadius: '16px',
        border: 'none',
        background: isDark 
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
          : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        transition: 'all 0.3s ease',
        boxShadow: isDark 
          ? '0 4px 15px rgba(0, 0, 0, 0.3)' 
          : '0 4px 15px rgba(0, 0, 0, 0.15)',
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun/Moon icons */}
      <div
        style={{
          position: 'absolute',
          left: isDark ? '6px' : 'auto',
          right: isDark ? 'auto' : '6px',
          opacity: isDark ? 0.5 : 1,
          transition: 'all 0.3s',
        }}
      >
        <Sun size={14} style={{ color: 'white' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: isDark ? '6px' : 'auto',
          left: isDark ? 'auto' : '6px',
          opacity: isDark ? 1 : 0.5,
          transition: 'all 0.3s',
        }}
      >
        <Moon size={14} style={{ color: 'white' }} />
      </div>

      {/* Toggle circle */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'white',
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDark ? (
          <Moon size={14} style={{ color: '#6366f1' }} />
        ) : (
          <Sun size={14} style={{ color: '#f59e0b' }} />
        )}
      </div>
    </button>
  );
}
