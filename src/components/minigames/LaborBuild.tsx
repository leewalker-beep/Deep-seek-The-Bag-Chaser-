import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface LaborBuildProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instruction?: string;
  icon?: string;
  fillLabel?: string;
  scoreLabel?: string;
  accentColor?: string;
}

export const LaborBuild: React.FC<LaborBuildProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title = "MANUAL LABOR",
  instruction = "Tap FAST to build the foundations",
  icon = "👆",
  fillLabel = "PROGRESS",
  scoreLabel = "%",
  accentColor = "orange"
}) => {
  // Timing curve: Level 1 = 5.0s, Level 2 = 4.0s, Level 3 = 3.0s, clamped to min 3.0s
  const initialTime = useMemo(() => Math.max(3.0, 5.0 - (level - 1) * 1.0), [level]);

  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);
  const [feedback, setFeedback] = useState<'tap' | 'perfect' | 'miss' | null>(null);
  const [targetPos, setTargetPos] = useState(50);
  const [targetDir, setTargetDir] = useState(1);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  const isSweetSpot = level >= 3;
  const targetSize = useMemo(() => Math.max(10, 30 - (level - 3) * 5), [level]);
  const targetSpeed = useMemo(() => (1 + (level - 3) * 0.5) * scaling, [level, scaling]);

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

      if (isSweetSpot) {
          // Move target
          setTargetPos(prev => {
              let next = prev + targetSpeed * targetDir;
              if (next > 90) { next = 90; setTargetDir(-1); }
              if (next < 10) { next = 10; setTargetDir(1); }
              return next;
          });

          // Check if in sweet spot
          const inZone = progress >= (targetPos - targetSize / 2) && progress <= (targetPos + targetSize / 2);
          if (inZone) {
              setFeedback('perfect');
          } else {
              setFeedback(null);
          }
      }

      // Decay
      setProgress(prev => Math.max(0, prev - decayRate));
    }, 100);

    return () => clearInterval(timer);
  }, [isActive, decayRate, isSweetSpot, targetSpeed, targetDir, progress, targetPos, targetSize]);

  const handleTap = () => {
    if (!isActive) return;

    if (isSweetSpot) {
        const inZone = progress >= (targetPos - targetSize / 2) && progress <= (targetPos + targetSize / 2);
        if (inZone) {
            setProgress(prev => Math.min(100, prev + tapPower * 1.5));
            setFeedback('perfect');
        } else {
            setProgress(prev => Math.min(100, prev + tapPower * 0.5));
            setFeedback('miss');
        }
    } else {
        setProgress(prev => Math.min(100, prev + tapPower));
        setFeedback('tap');
    }

    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const colorMap: Record<string, string> = {
    purple: 'text-purple-500 border-purple-500 bg-purple-900/60 bg-purple-600 border-purple-900 text-purple-400',
    orange: 'text-orange-500 border-orange-500 bg-orange-900/60 bg-orange-600 border-orange-900 text-orange-400',
    blue: 'text-blue-500 border-blue-500 bg-blue-900/60 bg-blue-600 border-blue-900 text-blue-400',
    emerald: 'text-emerald-500 border-emerald-500 bg-emerald-900/60 bg-emerald-600 border-emerald-900 text-emerald-400',
  };

  useEffect(() => {
    if (!isActive) {
      let base = 0.5;
      if (progress > 85) base = 4.0;
      else if (progress > 70) base = 3.0;
      else if (progress > 50) base = 2.0;
      else if (progress > 30) base = 1.2;
      else if (progress > 15) base = 0.8;

      const multiplier = base * (0.8 + scaling * 0.2);

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, progress, onComplete, scaling]);

  const colors = colorMap[accentColor] || colorMap.orange;
  const [cText, cBorder, cBg, cBtn, cBtnBorder, cSubText] = colors.split(' ');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`bg-stone-950 p-8 rounded-3xl border-4 border-stone-800 shadow-2xl text-center max-w-sm w-full mx-auto transition-colors duration-100 touch-none select-none ${
        feedback === 'perfect' ? 'bg-emerald-950/20' :
        feedback === 'miss' ? 'bg-red-950/10' :
        feedback === 'tap' ? 'bg-stone-900' : 'bg-stone-950'
    }`}>
      <h2 className="text-2xl font-black text-stone-400 mb-2 uppercase tracking-tighter italic">{title} <span className={`${cText} text-sm`}>L{level}</span></h2>
      <div className="flex items-center justify-center gap-2 mb-6">
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className={cText}>{icon}</motion.span>
        <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">
            {isSweetSpot ? "MAINTAIN PRESSURE IN THE TARGET ZONE" : instruction}
        </p>
      </div>

      <div className="relative h-48 w-full bg-stone-900 rounded-2xl border-2 border-stone-800 overflow-hidden mb-6 flex flex-col justify-end">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="bg-stone-700 rounded-sm" />
          ))}
        </div>

        {/* Sweet Spot Target Zone */}
        {isSweetSpot && (
            <motion.div
                className="absolute left-0 right-0 border-y-2 border-emerald-500/50 bg-emerald-500/10 z-10"
                style={{
                    bottom: `${targetPos - targetSize / 2}%`,
                    height: `${targetSize}%`
                }}
            >
                <div className="absolute top-0 left-0 text-[6px] font-black text-emerald-500 uppercase px-1">TARGET</div>
            </motion.div>
        )}

        <motion.div
          animate={{ height: `${progress}%` }}
          className={`w-full border-t-4 relative z-20 transition-colors duration-300 ${
            feedback === 'perfect' ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]' :
            progress > 90 ? 'bg-emerald-900/60 border-emerald-500' :
            progress > 70 ? `${cBg} ${cBorder}` :
            'bg-stone-700/60 border-stone-500'
          }`}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="flex flex-col items-center">
            <span className={`text-6xl font-black transition-colors duration-300 ${feedback === 'perfect' ? 'text-emerald-400' : 'text-white/10'}`}>
                {Math.floor(progress)}{scoreLabel}
            </span>
            <span className="text-[10px] font-bold text-white/5 tracking-[0.2em]">{fillLabel}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onPointerDown={handleTap}
          className={`py-6 rounded-2xl font-black text-2xl transition-all active:scale-95 touch-none z-40 ${
            isActive ? `${cBtn} text-white border-b-8 ${cBtnBorder} shadow-lg` : 'bg-stone-900 text-stone-700'
          } ${feedback === 'perfect' ? 'ring-4 ring-emerald-500/50' : ''}`}
        >
          {isActive ? (isSweetSpot ? 'MAINTAIN' : 'BUILD!!!') : 'COMPLETE'}
        </button>

        <div className="flex justify-between items-center text-[10px] font-bold text-stone-500 uppercase">
          <span>Time: {timeLeft.toFixed(1)}s</span>
          <span className={progress >= 70 ? 'text-emerald-500' : `${cSubText}/50`}>
              {isSweetSpot ? 'ELITE STABILITY' : 'Target: 70%+'}
          </span>
        </div>
      </div>

      <AnimatePresence>
          {feedback === 'perfect' && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -20 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 text-emerald-400 font-black italic text-xl z-50 pointer-events-none"
              >
                  PERFECT
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
