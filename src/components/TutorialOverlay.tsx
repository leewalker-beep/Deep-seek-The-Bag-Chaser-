import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseButton } from './ui/BaseButton';
import type { Tier } from '../types/game';

interface TutorialStep {
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  type: 'action' | 'explanation';
}

const STEPS: TutorialStep[] = [
  {
    title: 'Earn Bag',
    content: 'Start your journey in the MUD. First, you need some cash. Tap on Delivery Gigs to see more.',
    target: '#hustle-card-r_delivery',
    type: 'action',
  },
  {
    title: 'Play Minigame',
    content: 'Hustles require effort. Tap PLAY to start the delivery minigame.',
    target: '#hustle-execute-button',
    type: 'action',
  },
  {
    title: 'Bag Explained',
    content: "You just earned ${REWARD}. This is your BAG. You'll use it to buy upgrades and progress.",
    type: 'explanation',
  },
  {
    title: 'Earn Clout',
    content: 'Cash is not enough. You need reputation. Tap on Content Creation.',
    target: '#hustle-card-cc',
    type: 'action',
  },
  {
    title: 'Play Minigame',
    content: 'Build your audience. Tap PLAY to start creating content.',
    target: '#hustle-execute-button',
    type: 'action',
  },
  {
    title: 'Clout Explained',
    content: 'You just earned Clout. CLOUT unlocks new hustles and tiers.',
    type: 'explanation',
  },
  {
    title: 'Earn Aura',
    content: 'Some operations require a certain... vibe. Tap on Ghost Mode.',
    target: '#hustle-card-r_ghost_mode',
    type: 'action',
  },
  {
    title: 'Play Minigame',
    content: 'Stay under the radar. Tap PLAY to enter Ghost Mode.',
    target: '#hustle-execute-button',
    type: 'action',
  },
  {
    title: 'Aura Explained',
    content: 'You just earned Aura. AURA gives you access to special hustles and boosts your reputation.',
    type: 'explanation',
  },
  {
    title: 'Rest & Recover',
    content: 'The grind takes a toll. You need to manage your mental health. Tap on Rest & Recover.',
    target: '#hustle-card-r_sleep',
    type: 'action',
  },
  {
    title: 'Execute Rest',
    content: 'Take a break. Tap EXECUTE to recover.',
    target: '#hustle-execute-button',
    type: 'action',
  },
  {
    title: 'Health & Heat Explained',
    content: 'You just recovered Mental Health. MENTAL HEALTH and HEAT are your risk layers. Keep them balanced.',
    type: 'explanation',
  },
  {
    title: 'Advance Tier',
    content: 'You have what it takes to move up. Tap the ADVANCE button to leave the MUD behind.',
    target: '#advance-tier-button',
    type: 'action',
  },
  {
    title: 'Tiers Explained',
    content: 'You just advanced to STREET tier. TIERS unlock new hustles and bigger rewards.',
    type: 'explanation',
  },
];

interface TutorialOverlayProps {
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
  setActiveHustleView: (view: string | null) => void;
  setActiveHustleResult: (result: any | null) => void;
  activeHustleView: string | null;
  activeHustleResult: any | null;
  currentTier: Tier;
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  tutorialStep,
  setTutorialStep,
  setActiveHustleView,
  setActiveHustleResult,
  activeHustleView,
  activeHustleResult,
  currentTier,
  onComplete,
}) => {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStepData = STEPS[tutorialStep];

  useEffect(() => {
    if (currentStepData.target) {
      const updateRect = () => {
        const el = document.querySelector(currentStepData.target!);
        if (el) {
          setHighlightRect(el.getBoundingClientRect());
        } else {
          setHighlightRect(null);
        }
      };

      updateRect();
      const timer = setInterval(updateRect, 100);
      return () => clearInterval(timer);
    } else {
      setHighlightRect(null);
    }
  }, [currentStepData.target, activeHustleView, tutorialStep]);

  useEffect(() => {
    // Automatic transitions for action steps
    if (currentStepData.type === 'action') {
      if (tutorialStep === 0 && activeHustleView === 'r_delivery') {
        setActiveHustleResult(null);
        setTutorialStep(1);
      }
      if (tutorialStep === 3 && activeHustleView === 'cc') {
        setActiveHustleResult(null);
        setTutorialStep(4);
      }
      if (tutorialStep === 6 && activeHustleView === 'r_ghost_mode') {
        setActiveHustleResult(null);
        setTutorialStep(7);
      }
      if (tutorialStep === 9 && activeHustleView === 'r_sleep') {
        setActiveHustleResult(null);
        setTutorialStep(10);
      }

      if (tutorialStep === 1 && activeHustleResult) {
        // Reset result when moving to explanation
        setTimeout(() => setTutorialStep(2), 50);
      }
      if (tutorialStep === 4 && activeHustleResult) {
        setTimeout(() => setTutorialStep(5), 50);
      }
      if (tutorialStep === 7 && activeHustleResult) {
        setTimeout(() => setTutorialStep(8), 50);
      }
      if (tutorialStep === 10 && activeHustleResult) {
        setTimeout(() => setTutorialStep(11), 50);
      }

      if (tutorialStep === 12 && currentTier === 'STREET') setTutorialStep(13);
    }
  }, [tutorialStep, activeHustleView, activeHustleResult, currentTier, setTutorialStep, currentStepData.type, setActiveHustleResult]);

  const next = () => {
    if (tutorialStep < STEPS.length - 1) {
      setActiveHustleView(null);
      setActiveHustleResult(null);
      setTutorialStep(tutorialStep + 1);
    } else {
      localStorage.setItem('bag-chaser-tutorial-complete', 'true');
      onComplete();
    }
  };

  const backdropStyle = useMemo(() => {
    if (!highlightRect) return { display: 'none' };
    const margin = 12;
    return {
      clipPath: `polygon(
        0% 0%,
        0% 100%,
        ${highlightRect.left - margin}px 100%,
        ${highlightRect.left - margin}px ${highlightRect.top - margin}px,
        ${highlightRect.right + margin}px ${highlightRect.top - margin}px,
        ${highlightRect.right + margin}px ${highlightRect.bottom + margin}px,
        ${highlightRect.left - margin}px ${highlightRect.bottom + margin}px,
        ${highlightRect.left - margin}px 100%,
        100% 100%,
        100% 0%
      )`,
    };
  }, [highlightRect]);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      >
        {/* Backdrop with hole */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] pointer-events-auto"
          style={backdropStyle}
        />

        {/* Content Box */}
        <div className={`absolute inset-0 flex flex-col items-center p-6 pointer-events-none ${currentStepData.type === 'action' ? 'justify-end pb-24' : 'justify-center'}`}>
          <motion.div
            key={tutorialStep}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-sm w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl pointer-events-auto relative z-10"
          >
            <div className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-2">
              {currentStepData.type === 'action' ? 'Next Action' : 'Insight Earned'}
            </div>
            <h2 className="text-xl font-black mb-2 tracking-tight">{currentStepData.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {currentStepData.content.replace('${REWARD}', activeHustleResult ? `$${(activeHustleResult.yieldCash - activeHustleResult.cost).toLocaleString()}` : 'money')}
            </p>
            {currentStepData.type === 'explanation' && (
              <BaseButton onClick={next} className="w-full">
                {tutorialStep === STEPS.length - 1 ? "Let's Go" : "Next"}
              </BaseButton>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
