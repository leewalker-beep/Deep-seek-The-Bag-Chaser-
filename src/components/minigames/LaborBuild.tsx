import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface LaborBuildProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const LaborBuild: React.FC<LaborBuildProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<'tap' | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  const decayRate = useMemo(() => (0.4 + (level - 1) * 0.5) * scaling, [level, scaling]); // Decay per 100ms
  const tapPower = useMemo(() => Math.max(1.5, 5 - (level - 1) * 0.3) * (1 / Math.sqrt(scaling)), [level, scaling]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setIsActive(false);
          return 0;
        }
        return prev - 0.1;
      });

      // Decay
      setProgress(prev => Math.max(0, prev - decayRate));
    }, 100);

    return () => clearInterval(timer);
  }, [isActive, decayRate]);

  const handleTap = () => {
    if (!isActive) return;
    setProgress(prev => Math.min(100, prev + tapPower));
    setFeedback('tap');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (!isActive) {
      let base = 0.5;
      if (progress > 70) base = 3.0;
      else if (progress > 50) base = 2.0;
      else if (progress > 30) base = 1.2;
      else if (progress > 15) base = 0.8;

      const multiplier = base * (0.8 + scaling * 0.2);

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, progress, onComplete, scaling]);

  return (
    <div className={`bg-stone-950 p-8 rounded-3xl border-4 border-stone-800 shadow-2xl text-center max-w-sm w-full mx-auto transition-colors duration-100 ${feedback ? 'bg-stone-900' : 'bg-stone-950'}`}>
      <h2 className="text-2xl font-black text-stone-400 mb-2 uppercase tracking-tighter italic">MANUAL LABOR <span className="text-orange-600 text-sm">L{level}</span></h2>
      <div className="flex items-center justify-center gap-2 mb-6">
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-orange-500">👆</motion.span>
        <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">Tap FAST to build the foundations</p>
      </div>

      <div className="relative h-48 w-full bg-stone-900 rounded-2xl border-2 border-stone-800 overflow-hidden mb-6 flex flex-col justify-end">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="bg-stone-700 rounded-sm" />
          ))}
        </div>
        <motion.div
          animate={{ height: `${progress}%` }}
          className={`w-full border-t-4 relative z-10 transition-colors duration-300 ${
            progress > 90 ? 'bg-emerald-900/60 border-emerald-500' :
            progress > 70 ? 'bg-orange-900/60 border-orange-500' :
            'bg-stone-700/60 border-stone-500'
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span className="text-6xl font-black text-white/10">{Math.floor(progress)}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onPointerDown={handleTap}
          className={`py-6 rounded-2xl font-black text-2xl transition-all active:scale-95 touch-none ${
            isActive ? 'bg-orange-600 text-white border-b-8 border-orange-900 shadow-lg' : 'bg-stone-900 text-stone-700'
          }`}
        >
          {isActive ? 'BUILD!!!' : 'COMPLETE'}
        </button>

        <div className="flex justify-between items-center text-[10px] font-bold text-stone-500 uppercase">
          <span>Time: {timeLeft.toFixed(1)}s</span>
          <span className={progress >= 70 ? 'text-emerald-500' : 'text-orange-500/50'}>Target: 70%+</span>
        </div>
      </div>
    </div>
  );
};
