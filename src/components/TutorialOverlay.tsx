import React, { useState, useEffect } from 'react';

interface TutorialOverlayProps {
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Welcome to Bag Chaser', message: 'Escape the mud. Build the empire. Don\'t lose your soul.', position: 'center' },
    { title: 'Pick a Hustle', message: 'Tap any hustle card to start making money.', position: 'center', highlight: '.grid-cols-2 button:first-child' },
    { title: 'Play the Minigame', message: 'Each hustle has a unique touch-based minigame. Follow the instructions.', position: 'center' },
    { title: 'Collect Your Reward', message: 'Your bag, clout, and aura will increase. Watch for big wins!', position: 'center' },
    { title: 'Manage Your Stats', message: 'Keep mental health high and heat low. Use recovery hustles if needed.', position: 'center', highlight: '.grid-cols-4' },
    { title: 'Advance to Next Tier', message: 'Meet the requirements and tap the purple button to level up.', position: 'center', highlight: '.bg-purple-600' },
  ];

  useEffect(() => {
    if (step < steps.length) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
      localStorage.setItem('bag-chaser-tutorial-complete', 'true');
    }
  }, [step, steps.length, onComplete]);

  if (step >= steps.length) return null;

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-emerald-500 p-6 max-w-sm text-center">
        <div className="text-4xl mb-3">{step === 0 ? '💰' : step === 1 ? '🎮' : step === 2 ? '🎯' : step === 3 ? '📈' : step === 4 ? '🛡️' : '⭐'}</div>
        <h3 className="text-xl font-black text-white mb-2">{currentStep.title}</h3>
        <p className="text-slate-300 text-sm mb-6">{currentStep.message}</p>
        <div className="flex justify-between">
          <button onClick={() => { localStorage.setItem('bag-chaser-tutorial-complete', 'true'); onComplete(); }} className="text-[10px] text-slate-500 uppercase">Skip Tutorial</button>
          <div className="text-[10px] text-slate-500">Step {step + 1}/{steps.length}</div>
        </div>
      </div>
    </div>
  );
};
