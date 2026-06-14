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
    title: 'Welcome to Bag Chaser V2',
    content: "You're starting in the MUD. The goal is simple: chase the bag, build your legacy, and climb the tiers to the Presidency.",
  },
  {
    title: 'Step 1: Pick a Hustle',
    content: "Tap any available hustle card to see its requirements. Each tier has a unique visual identity and set of mechanics. MUD is gritty and monospace; STREET is neon and vibrant.",
  },
  {
    title: 'Step 2: Play the Minigame',
    content: "Hustles aren't free money. You'll need to complete a minigame. MUD uses simple swipes and taps. STREET requires holding and dragging for momentum. High performance means high yields.",
  },
  {
    title: 'Step 3: Collect Rewards',
    content: "Success grants Cash, Clout, and Aura. If you max out all levels of a hustle, you'll earn a Mastery Badge—a permanent buff that follows you through the tiers.",
  },
  {
    title: 'Step 4: Advance Tiers',
    content: "Once you hit the cash and clout requirements, an ADVANCE TIER button will appear. Moving up unlocks better hustles, higher limits, and a completely new look for the game.",
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
