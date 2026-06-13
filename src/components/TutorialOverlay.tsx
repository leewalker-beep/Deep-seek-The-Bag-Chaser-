import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseButton } from './ui/BaseButton';

interface TutorialStep {
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
}

const STEPS: TutorialStep[] = [
  {
    title: 'Welcome to the Grind',
    content: "You're starting at the bottom. The goal is simple: chase the bag, build your clout, and become a legend.",
  },
  {
    title: 'The Essentials',
    content: "Keep an eye on your stats. BAG is your cash, CLOUT is your reputation, and AURA is your street cred. Don't let your MENTAL HEALTH drop too low, or it's game over.",
  },
  {
    title: 'Hustles & Minigames',
    content: "Every hustle is different. Some are simple taps, others require precision sensors. Master them all to maximize your yields.",
  },
  {
    title: 'Market Conditions',
    content: "The world changes. BULL markets make everything easy, but a CRACKDOWN can freeze your assets. Adapt or starve.",
  },
  {
    title: 'Ready?',
    content: "The first hustle is waiting. Get to work.",
  },
];

export const TutorialOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('bag-chaser-tutorial-complete', 'true');
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"
        >
          <div className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-2">
            Tutorial Step {currentStep + 1} of {STEPS.length}
          </div>
          <h2 className="text-2xl font-black mb-4 tracking-tight">{STEPS[currentStep].title}</h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            {STEPS[currentStep].content}
          </p>
          <BaseButton onClick={next} className="w-full">
            {currentStep === STEPS.length - 1 ? "Let's Go" : "Next"}
          </BaseButton>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
