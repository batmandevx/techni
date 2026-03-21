'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Package,
  Bot
} from 'lucide-react';

interface Feature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: BarChart3,
    title: 'ABC Analysis',
    description: 'Classify your inventory by value contribution and optimize stock levels.',
    color: 'indigo',
  },
  {
    icon: TrendingUp,
    title: 'AI Forecasting',
    description: 'Get accurate demand predictions with machine learning algorithms.',
    color: 'emerald',
  },
  {
    icon: Package,
    title: 'Order Optimization',
    description: 'Calculate optimal order quantities and reorder points automatically.',
    color: 'amber',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Ask questions and get intelligent insights about your supply chain.',
    color: 'rose',
  },
];

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('tenchi-welcome-seen');
    if (!hasSeenWelcome) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('tenchi-welcome-seen', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const currentFeature = features[currentStep];
  const Icon = currentFeature.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute -bottom-8 left-6">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-12 pb-6 px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-${currentFeature.color}-100 dark:bg-${currentFeature.color}-500/10 mb-4`}>
                  <Icon className={`w-6 h-6 text-${currentFeature.color}-500`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentStep === 0 ? 'Welcome to Tenchi!' : currentFeature.title}
                </h2>
                <p className="text-gray-600 dark:text-slate-400">
                  {currentStep === 0 
                    ? 'Your intelligent S&OP platform for supply chain optimization.' 
                    : currentFeature.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {features.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep 
                      ? 'w-8 bg-indigo-500' 
                      : i < currentStep 
                        ? 'w-1.5 bg-indigo-300' 
                        : 'w-1.5 bg-gray-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1 py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {currentStep === features.length - 1 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Skip */}
            <button
              onClick={handleClose}
              className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
