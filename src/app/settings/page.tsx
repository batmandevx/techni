'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Key,
  Mail,
  Bell,
  Database,
  Shield,
  Save,
  Check,
  Clock,
  Package,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Sliders,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// Inventory Age Master Configuration Interface
interface InventoryAgeMasterConfig {
  goodMinMonths: number;
  goodMaxMonths: number;
  goodLabel: string;
  goodColor: string;
  slowMinMonths: number;
  slowMaxMonths: number;
  slowLabel: string;
  slowColor: string;
  badMinMonths: number;
  badLabel: string;
  badColor: string;
}

// Industry Presets for Inventory Ageing
const INDUSTRY_PRESETS: Record<string, InventoryAgeMasterConfig> = {
  default: {
    goodMinMonths: 0,
    goodMaxMonths: 6,
    goodLabel: 'Good',
    goodColor: '#10b981',
    slowMinMonths: 6,
    slowMaxMonths: 12,
    slowLabel: 'Slow Moving',
    slowColor: '#f59e0b',
    badMinMonths: 12,
    badLabel: 'Bad Inventory',
    badColor: '#ef4444',
  },
  fmcg: {
    goodMinMonths: 0,
    goodMaxMonths: 3,
    goodLabel: 'Fresh',
    goodColor: '#10b981',
    slowMinMonths: 3,
    slowMaxMonths: 6,
    slowLabel: 'Slow',
    slowColor: '#f59e0b',
    badMinMonths: 6,
    badLabel: 'Expiring Soon',
    badColor: '#ef4444',
  },
  pharmaceutical: {
    goodMinMonths: 0,
    goodMaxMonths: 12,
    goodLabel: 'Good',
    goodColor: '#10b981',
    slowMinMonths: 12,
    slowMaxMonths: 18,
    slowLabel: 'Check Expiry',
    slowColor: '#f59e0b',
    badMinMonths: 18,
    badLabel: 'Near Expiry',
    badColor: '#ef4444',
  },
  electronics: {
    goodMinMonths: 0,
    goodMaxMonths: 12,
    goodLabel: 'Current',
    goodColor: '#10b981',
    slowMinMonths: 12,
    slowMaxMonths: 24,
    slowLabel: 'Slow Moving',
    slowColor: '#f59e0b',
    badMinMonths: 24,
    badLabel: 'Obsolete',
    badColor: '#ef4444',
  },
  automotive: {
    goodMinMonths: 0,
    goodMaxMonths: 24,
    goodLabel: 'Current',
    goodColor: '#10b981',
    slowMinMonths: 24,
    slowMaxMonths: 36,
    slowLabel: 'Slow Moving',
    slowColor: '#f59e0b',
    badMinMonths: 36,
    badLabel: 'Obsolete',
    badColor: '#ef4444',
  },
};

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [inventoryAgeConfig, setInventoryAgeConfig] = useState<InventoryAgeMasterConfig>(INDUSTRY_PRESETS.default);

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('inventoryAgeConfig');
    const savedPreset = localStorage.getItem('inventoryAgePreset');
    if (savedConfig) {
      setInventoryAgeConfig(JSON.parse(savedConfig));
    }
    if (savedPreset) {
      setSelectedPreset(savedPreset);
    }
  }, []);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setInventoryAgeConfig(INDUSTRY_PRESETS[preset]);
  };

  const handleConfigChange = (field: keyof InventoryAgeMasterConfig, value: string | number) => {
    setInventoryAgeConfig(prev => ({
      ...prev,
      [field]: value,
    }));
    setSelectedPreset('custom');
  };

  const handleSave = () => {
    // Save inventory age config
    localStorage.setItem('inventoryAgeConfig', JSON.stringify(inventoryAgeConfig));
    localStorage.setItem('inventoryAgePreset', selectedPreset);

    // Dispatch event for other components to update
    window.dispatchEvent(new CustomEvent('inventory-age-config-changed', {
      detail: inventoryAgeConfig
    }));

    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSelectedPreset('default');
    setInventoryAgeConfig(INDUSTRY_PRESETS.default);
    toast.success('Reset to default configuration');
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 overflow-auto" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-slate-400">Configure your S&OP platform preferences and master data</p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto space-y-6">
        {/* API Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
          <div className="relative mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">API Configuration</h3>
              <p className="text-xs text-slate-400">Gemini AI integration settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Gemini API Key</label>
              <input
                type="password"
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                defaultValue="••••••••••••••••"
              />
              <p className="mt-1.5 text-xs text-slate-500">Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a></p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">AI Model</label>
              <select className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                <option style={{ background: '#1e293b' }}>gemini-2.0-flash</option>
                <option style={{ background: '#1e293b' }}>gemini-1.5-pro</option>
                <option style={{ background: '#1e293b' }}>gemini-1.5-flash</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Inventory Age Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
          <div className="relative mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Inventory Age Configuration</h3>
                <p className="text-xs text-slate-400">Master-driven classification for inventory ageing</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Industry Presets */}
          <div className="mb-6">
            <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">Industry Preset</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(INDUSTRY_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key)}
                  className={`p-2 rounded-xl text-xs font-medium transition-all ${selectedPreset === key
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-300">Custom Configuration</span>
            </div>

            {/* Good Inventory Config */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-emerald-400">Good Inventory</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Label</label>
                  <input
                    type="text"
                    value={inventoryAgeConfig.goodLabel}
                    onChange={(e) => handleConfigChange('goodLabel', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Min (Months)</label>
                  <input
                    type="number"
                    value={inventoryAgeConfig.goodMinMonths}
                    onChange={(e) => handleConfigChange('goodMinMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Max (Months)</label>
                  <input
                    type="number"
                    value={inventoryAgeConfig.goodMaxMonths}
                    onChange={(e) => handleConfigChange('goodMaxMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Color</label>
                  <input
                    type="color"
                    value={inventoryAgeConfig.goodColor}
                    onChange={(e) => handleConfigChange('goodColor', e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Slow Moving Config */}
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-medium text-orange-400">Slow Moving Inventory</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Label</label>
                  <input
                    type="text"
                    value={inventoryAgeConfig.slowLabel}
                    onChange={(e) => handleConfigChange('slowLabel', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Min (Months)</label>
                  <input
                    type="number"
                    value={inventoryAgeConfig.slowMinMonths}
                    onChange={(e) => handleConfigChange('slowMinMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Max (Months)</label>
                  <input
                    type="number"
                    value={inventoryAgeConfig.slowMaxMonths}
                    onChange={(e) => handleConfigChange('slowMaxMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Color</label>
                  <input
                    type="color"
                    value={inventoryAgeConfig.slowColor}
                    onChange={(e) => handleConfigChange('slowColor', e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Bad Inventory Config */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium text-red-400">Bad / Obsolete Inventory</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Label</label>
                  <input
                    type="text"
                    value={inventoryAgeConfig.badLabel}
                    onChange={(e) => handleConfigChange('badLabel', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Min (Months)</label>
                  <input
                    type="number"
                    value={inventoryAgeConfig.badMinMonths}
                    onChange={(e) => handleConfigChange('badMinMonths', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-slate-400">Color</label>
                  <input
                    type="color"
                    value={inventoryAgeConfig.badColor}
                    onChange={(e) => handleConfigChange('badColor', e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-300">Classification Preview</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: inventoryAgeConfig.goodColor }} />
                <span className="text-sm text-slate-300">
                  {inventoryAgeConfig.goodLabel}: 0-{inventoryAgeConfig.goodMaxMonths} months
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: inventoryAgeConfig.slowColor }} />
                <span className="text-sm text-slate-300">
                  {inventoryAgeConfig.slowLabel}: {inventoryAgeConfig.slowMinMonths}-{inventoryAgeConfig.slowMaxMonths} months
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: inventoryAgeConfig.badColor }} />
                <span className="text-sm text-slate-300">
                  {inventoryAgeConfig.badLabel}: {inventoryAgeConfig.badMinMonths}+ months
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Email Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
          <div className="relative mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Email Settings</h3>
              <p className="text-xs text-slate-400">SMTP configuration for report delivery</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">SMTP Host</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Port</label>
              <input
                type="number"
                placeholder="587"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Username</label>
              <input
                type="text"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-400">Password</label>
              <input
                type="password"
                placeholder="App password"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl transform translate-x-16 -translate-y-16" />
          <div className="relative mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Notifications</h3>
              <p className="text-xs text-slate-400">Alert thresholds and notification preferences</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Stockout Risk Alert', desc: 'Notify when risk exceeds threshold', defaultChecked: true },
              { label: 'Forecast Deviation Alert', desc: 'Alert on significant forecast misses', defaultChecked: true },
              { label: 'Low Stock Warning', desc: 'Warn when stock falls below safety level', defaultChecked: true },
              { label: 'Email Notifications', desc: 'Send alerts via email', defaultChecked: false },
              { label: 'Auto-Replenishment', desc: 'Automatically generate POs', defaultChecked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked={item.defaultChecked} />
                  <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-indigo-500 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end pb-6"
        >
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95"
          >
            {saved ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
