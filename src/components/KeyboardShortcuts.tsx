'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'G D', description: 'Go to Dashboard' },
  { key: 'G U', description: 'Go to Upload' },
  { key: 'G O', description: 'Go to Orders' },
  { key: 'G A', description: 'Go to AI Assistant' },
  { key: 'R', description: 'Refresh data' },
  { key: 'N', description: 'New upload' },
  { key: 'F', description: 'Search / Filter' },
  { key: 'Esc', description: 'Close modal / Cancel' },
];

interface KeyboardShortcutsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function KeyboardShortcuts({ isOpen: externalIsOpen, onClose: externalOnClose }: KeyboardShortcutsProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (!val && externalOnClose) externalOnClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts on '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Navigation shortcuts
      if (e.key.toLowerCase() === 'g') {
        const nextKey = (e: KeyboardEvent) => {
          const key = e.key.toLowerCase();
          if (key === 'd') window.location.href = '/';
          if (key === 'u') window.location.href = '/upload';
          if (key === 'o') window.location.href = '/orders';
          if (key === 'a') window.location.href = '/ai-assistant';
          document.removeEventListener('keydown', nextKey);
        };
        document.addEventListener('keydown', nextKey);
      }

      // Refresh on 'R'
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        window.location.reload();
      }

      // New upload on 'N'
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        window.location.href = '/upload';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          padding: '10px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          color: '#64748b',
          transition: 'all 0.2s',
          zIndex: 100,
        }}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={20} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          animation: 'scaleIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Keyboard size={24} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{shortcut.description}</span>
              <kbd
                style={{
                  padding: '6px 12px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  color: '#818cf8',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
          Press <kbd style={{ padding: '2px 6px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '4px', color: '#818cf8' }}>?</kbd> anytime to show this help
        </p>
      </div>
    </div>
  );
}
