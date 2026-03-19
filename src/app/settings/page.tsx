'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Key, Mail, Bell, Database, Shield, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure your S&OP platform preferences</p>
      </motion.div>

      {/* API Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20">
            <Key className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">API Configuration</h3>
            <p className="text-xs text-slate-500">Gemini AI integration settings</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Gemini API Key</label>
            <input type="password" placeholder="Enter your Gemini API key" className="glass-input w-full text-sm" defaultValue="••••••••••••••••" />
            <p className="mt-1 text-xs text-slate-600">Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Google AI Studio</a></p>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">AI Model</label>
            <select className="glass-input w-full text-sm">
              <option>gemini-2.0-flash</option>
              <option>gemini-1.5-pro</option>
              <option>gemini-1.5-flash</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Email Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/20">
            <Mail className="h-5 w-5 text-accent-cyan" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Email Settings</h3>
            <p className="text-xs text-slate-500">SMTP configuration for report delivery</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">SMTP Host</label>
            <input type="text" placeholder="smtp.gmail.com" className="glass-input w-full text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Port</label>
            <input type="number" placeholder="587" className="glass-input w-full text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Username</label>
            <input type="text" placeholder="your@email.com" className="glass-input w-full text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Password</label>
            <input type="password" placeholder="App password" className="glass-input w-full text-sm" />
          </div>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-amber/20">
            <Bell className="h-5 w-5 text-accent-amber" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">Notifications</h3>
            <p className="text-xs text-slate-500">Alert thresholds and notification preferences</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Stockout Risk Alert', desc: 'Notify when risk exceeds threshold', defaultChecked: true },
            { label: 'Forecast Deviation Alert', desc: 'Alert on significant forecast misses', defaultChecked: true },
            { label: 'Low Stock Warning', desc: 'Warn when stock falls below safety level', defaultChecked: true },
            { label: 'Email Notifications', desc: 'Send alerts via email', defaultChecked: false },
            { label: 'Auto-Replenishment', desc: 'Automatically generate POs', defaultChecked: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked={item.defaultChecked} />
                <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-brand-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-end pb-6">
        <button onClick={handleSave} className="gradient-button flex items-center gap-2">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </motion.div>
    </div>
  );
}
