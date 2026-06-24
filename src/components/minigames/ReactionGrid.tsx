import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface ReactionGridProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const ReactionGrid: React.FC<ReactionGridProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isStarted, setIsStarted] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  // Difficulty scaling
  const targetHits = Math.floor((15 + (level - 1) * 3) * Math.sqrt(scaling));
  const activeDuration = Math.max(400, (1200 - (level - 1) * 100) * timerFactor);

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

  const handleHit = (index: number) => {
    if (activeCell === index) {
      setHits(h => h + 1);
      setFeedback('hit');
      setActiveCell(null);
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      setFeedback('miss');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTimeout(() => setFeedback(null), 150);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      const score = hits / targetHits;
      let multiplier = 0.5;
      if (score >= 1.0) multiplier = 4.0;
      else if (score >= 0.7) multiplier = 2.5;
      else if (score >= 0.4) multiplier = 1.2;

      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [timeLeft, hits, targetHits, onComplete]);

  if (!isStarted) {
    return (
      <div className="h-[450px] w-full bg-slate-950 border-4 border-indigo-900 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
        <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-6"
        >
            🎯
        </motion.div>
        <h2 className="text-3xl font-black text-indigo-400 mb-2 italic tracking-tighter uppercase">HEDGE FUND TRADING <span className="text-white text-xs">L{level}</span></h2>
        <p className="text-slate-500 mb-10 uppercase text-[10px] font-black tracking-widest leading-relaxed">
            Rapidly execute trades on active nodes<br/>to dominate the market
        </p>
        <button
          onClick={() => setIsStarted(true)}
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 shadow-[0_0_40px_rgba(79,70,229,0.4)] uppercase tracking-widest italic"
        >
          START TRADING SESSION
        </button>
      </div>
    );
  }

  return (
    <div className={`h-[450px] w-full transition-colors duration-200 bg-slate-900 border-4 rounded-3xl flex flex-col items-center justify-center p-8 relative shadow-2xl ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'miss' ? 'border-red-500 bg-red-950/20' :
        'border-indigo-900'
    }`}>
      <div className="absolute top-6 left-0 right-0 px-8 flex justify-between items-end">
        <div className="text-left flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">EXECUTIONS</span>
            <span className="text-2xl font-black text-indigo-400 font-mono tracking-tighter">{hits}</span>
        </div>
        <div className="text-center pb-1">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">ACTIVE NODE</div>
        </div>
        <div className="text-right flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">SESSION</span>
            <span className={`text-2xl font-black font-mono tracking-tighter ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[300px] mt-8">
        {[...Array(9)].map((_, i) => (
          <button
            key={i}
            onPointerDown={() => handleHit(i)}
            className={`aspect-square rounded-2xl transition-all duration-100 relative overflow-hidden border-2 ${
              activeCell === i
                ? 'bg-indigo-500 border-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.6)] scale-105 z-10'
                : 'bg-slate-950 border-slate-800 active:bg-slate-800'
            }`}
          >
              {activeCell === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute inset-0 bg-white"
                  />
              )}
          </button>
        ))}
      </div>

      <div className="absolute bottom-6 w-full px-8">
          <ProgressBar
            value={timeLeft}
            max={15}
            colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-indigo-500'}
          />
          <div className="mt-2 text-center text-[8px] text-slate-600 font-black uppercase tracking-widest">
              QUOTA: {targetHits} EXECUTIONS FOR MAX YIELD
          </div>
      </div>

      <AnimatePresence>
        {timeLeft === 0 && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-8"
            >
                <div className="text-8xl mb-4 drop-shadow-2xl">{hits >= targetHits ? '📈' : '📉'}</div>
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter">SESSION ENDED</div>
                <div className="text-indigo-400 font-black font-mono text-2xl mt-2 uppercase tracking-widest">{hits} TRADES EXECUTED</div>
                <div className="text-slate-500 text-[10px] font-black mt-6 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 uppercase tracking-widest">
                    TARGET WAS {targetHits}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
