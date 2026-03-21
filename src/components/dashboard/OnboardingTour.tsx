'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target,
  CheckCircle2,
  Lightbulb,
  Compass
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Tenchi S&OP',
    description: 'Your intelligent supply chain optimization platform. Let\'s take a quick tour of the key features.',
    target: '',
    position: 'bottom',
  },
  {
    id: 'kpi-cards',
    title: 'Key Performance Indicators',
    description: 'Track your most important metrics at a glance. Click any card to see detailed breakdowns.',
    target: '[data-tour="kpi"]',
    position: 'bottom',
  },
  {
    id: 'modules',
    title: 'Quick Access Modules',
    description: 'Jump directly to ABC Analysis, Forecasting, Order Optimization, and more from here.',
    target: '[data-tour="modules"]',
    position: 'top',
  },
  {
    id: 'command-palette',
    title: 'Command Palette',
    description: 'Press Cmd+K (or Ctrl+K) anytime to search and navigate quickly.',
    target: '[data-tour="command"]',
    position: 'bottom',
  },
  {
    id: 'activity',
    title: 'Live Activity Feed',
    description: 'Stay updated with real-time notifications and system events.',
    target: '[data-tour="activity"]',
    position: 'left',
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('tenchi-tour-completed');
    const dismissed = localStorage.getItem('tenchi-tour-dismissed');
    if (!completed && !dismissed) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('tenchi-tour-completed', 'true');
    setHasCompleted(true);
    setIsOpen(false);
  };

  const dismissTour = () => {
    localStorage.setItem('tenchi-tour-dismissed', 'true');
    setIsOpen(false);
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!isOpen) {
    // Show restart button if tour was completed
    if (hasCompleted || localStorage.getItem('tenchi-tour-completed')) {
      return (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={restartTour}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span className="text-sm font-medium">Restart Tour</span>
        </motion.button>
      );
    }
    return null;
  }

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={dismissTour}
      />

      {/* Tour Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden m-4">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100 dark:bg-slate-700">
            <motion.div
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                {currentStep === 0 ? (
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                ) : currentStep === tourSteps.length - 1 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <button
                onClick={dismissTour}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              {step.description}
            </p>

            {/* Step Counter */}
            <p className="text-sm text-gray-400 mb-6">
              Step {currentStep + 1} of {tourSteps.length}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                  currentStep === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-1">
                {tourSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spotlight (if targeting an element) */}
      {step.target && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-40 pointer-events-none"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
