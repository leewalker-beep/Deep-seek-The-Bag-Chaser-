import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface ReactionGridProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instructions?: string;
}

export const ReactionGrid: React.FC<ReactionGridProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title,
  instructions
}) => {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isStarted, setIsStarted] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  // Difficulty scaling
  const targetHits = Math.floor((12 + (level - 1) * 3) * Math.sqrt(scaling));
  const activeDuration = Math.max(380, (1100 - (level - 1) * 90) * timerFactor);

  const displayTitle = title || (tier === 'CORPORATE' ? 'CRISIS DISASTER RECOVERY' : 'HEDGE FUND TRADING SESSION');
  const displayInstructions = instructions || 'Rapidly execute nodes to control exposure and maximize returns';

  useEffect(() => {
    if (!isStarted || timeLeft === 0) return;

    const spawn = () => {
      const randomCell = Math.floor(Math.random() * 9);
      setActiveCell(randomCell);

      setTimeout(() => {
        setActiveCell(null);
      }, activeDuration);
    };

    const interval = setInterval(() => {
      if (activeCell === null) spawn();
    }, 100);

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isStarted, activeCell, timeLeft, activeDuration]);

  const handleHit = (index: number, e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (activeCell === index) {
      setHits(h => h + 1);
      setStreak(s => {
        const next = s + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      setFeedback('hit');
      setActiveCell(null);
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
    } else {
      setMisses(m => m + 1);
      setStreak(0);
      setFeedback('miss');
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([30, 30]);
      }
    }
    setTimeout(() => setFeedback(null), 150);
  };

  const scoreRatio = Math.min(1.5, (hits + Math.floor(bestStreak / 3)) / Math.max(1, targetHits));
  const calculatedMultiplier = Math.max(0, Math.min(4.0, Number((scoreRatio * 2.5).toFixed(2))));

  useEffect(() => {
    if (timeLeft === 0) {
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate(100);
      }
      const timer = setTimeout(() => onComplete(calculatedMultiplier), 1800);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, calculatedMultiplier, onComplete]);

  if (!isStarted) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl mb-4"
        >
          ⚡
        </motion.div>
        <h2 className="text-2xl font-black text-indigo-400 mb-2 uppercase italic tracking-tighter">
          {displayTitle} <span className="text-white text-xs">L{level}</span>
        </h2>
        <p className="text-slate-400 mb-6 uppercase text-[10px] font-black tracking-widest leading-relaxed max-w-xs">
          {displayInstructions}
        </p>
        <button
          onClick={() => setIsStarted(true)}
          onTouchStart={() => setIsStarted(true)}
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 shadow-[0_0_40px_rgba(79,70,229,0.4)] uppercase tracking-widest italic"
        >
          START EXECUTION
        </button>
      </div>
    );
  }

  const getFailureReason = () => {
    if (hits === 0) return 'Complete execution failure — zero nodes activated.';
    if (misses > hits) return 'Excessive misfires drained execution speed.';
    if (hits < targetHits * 0.5) return 'Execution quota missed due to slow response times.';
    return 'Target target quota partially met. Push for higher streak streaks.';
  };

  return (
    <div
      className={`w-full transition-colors duration-200 flex flex-col items-center justify-center p-2 relative min-h-[420px] ${
        feedback === 'hit'
          ? 'bg-emerald-950/20'
          : feedback === 'miss'
          ? 'bg-red-950/20'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 flex justify-between items-end mb-4">
        <div className="text-left flex flex-col">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">HITS / STREAK</span>
          <span className="text-xl font-black text-indigo-400 font-mono tracking-tighter">
            {hits} <span className="text-xs text-amber-400">({streak}🔥)</span>
          </span>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">ACTIVE NODE</div>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">SESSION</span>
          <span
            className={`text-xl font-black font-mono tracking-tighter ${
              timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {[...Array(9)].map((_, i) => (
          <button
            key={i}
            onPointerDown={(e) => handleHit(i, e)}
            onTouchStart={(e) => handleHit(i, e)}
            className={`aspect-square rounded-2xl transition-all duration-100 relative overflow-hidden border-2 touch-manipulation ${
              activeCell === i
                ? 'bg-indigo-500 border-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.6)] scale-105 z-10'
                : 'bg-slate-950 border-slate-800 active:bg-slate-800'
            }`}
          >
            {activeCell === i && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
                className="absolute inset-0 bg-white"
              />
            )}
          </button>
        ))}
      </div>

      <div className="w-full px-4 mt-6">
        <ProgressBar value={timeLeft} max={15} colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-indigo-500'} />
        <div className="mt-2 text-center text-[8px] text-slate-500 font-black uppercase tracking-widest">
          QUOTA: {targetHits} EXECUTIONS | BEST STREAK: {bestStreak}
        </div>
      </div>

      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center z-30 p-6 text-center"
          >
            <div className="text-6xl mb-3 drop-shadow-2xl">{calculatedMultiplier >= 1.0 ? '📈' : '📉'}</div>
            <div className="text-2xl font-black text-white italic uppercase tracking-tighter">SESSION CONCLUDED</div>
            <div className="text-indigo-400 font-black font-mono text-xl mt-1 uppercase tracking-widest">
              {hits} EXECUTIONS ({hits >= targetHits ? 'QUOTA MET' : 'QUOTA MISSED'})
            </div>

            <div className="text-emerald-400 font-mono text-sm font-bold mt-2">
              YIELD MULTIPLIER: {calculatedMultiplier.toFixed(2)}x
            </div>

            <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3 max-w-xs text-left">
              <div className="text-[9px] text-red-400 font-black uppercase tracking-wider mb-1">ANALYSIS & DIAGNOSTIC:</div>
              <p className="text-[10px] text-slate-300 leading-tight">{getFailureReason()}</p>
              <div className="text-[9px] text-indigo-300 font-bold mt-2">
                💡 NEXT RUN: Focus on node center targets to build a streak multiplier.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
