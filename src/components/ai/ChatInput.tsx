'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSend, 
  isLoading = false, 
  placeholder = "Ask about your S&OP data...",
  disabled = false 
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    onSend(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // In a real app, you'd send this to a speech-to-text API
        // For now, we'll just simulate
        setInput('Voice input: "Show me inventory status"');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setShowAttachmentMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      {/* Attachment Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                layout
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                ) : (
                  <FileText className="w-4 h-4 text-indigo-500" />
                )}
                <span className="max-w-[150px] truncate text-gray-700 dark:text-slate-300">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-16 left-0 right-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-4 py-2 bg-red-500 text-white rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
              <button
                onClick={stopRecording}
                className="p-1 hover:bg-red-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="relative flex items-end gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
        {/* Attachment Button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={disabled || isLoading}
            className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Attachment Menu */}
          <AnimatePresence>
            {showAttachmentMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-2 min-w-[160px]"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FileText className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <ImageIcon className="w-4 h-4" />
                  Upload Image
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt"
        />

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading || isRecording}
          rows={1}
          className="flex-1 bg-transparent border-0 resize-none py-3 px-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 min-h-[44px] max-h-[200px]"
          style={{ height: 'auto' }}
        />

        {/* Voice Input Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isLoading}
          className={`p-2.5 rounded-xl transition-colors disabled:opacity-50 ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'text-gray-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={(!input.trim() && attachments.length === 0) || isLoading || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-center text-gray-400 dark:text-slate-500 mt-2">
        Press Enter to send, Shift+Enter for new line • Supports markdown, code blocks, and file uploads
      </p>
    </div>
  );
}
