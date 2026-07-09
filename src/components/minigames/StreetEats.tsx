import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PerfectFlow } from '../effects/PerfectFlow';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface Ingredient {
  id: number;
  icon: string;
  side: 'left' | 'right' | 'top' | 'bottom';
  level: number;
}

const ALL_INGREDIENTS: Ingredient[] = [
  // L1
  { id: 1, icon: '🥩', side: 'left', level: 1 },
  { id: 2, icon: '🥬', side: 'right', level: 1 },
  { id: 3, icon: '🧅', side: 'right', level: 1 },
  { id: 4, icon: '🌶️', side: 'left', level: 1 },
  // L2
  { id: 5, icon: '🧄', side: 'left', level: 2 },
  { id: 6, icon: '🍅', side: 'right', level: 2 },
  { id: 7, icon: '🧀', side: 'right', level: 2 },
  { id: 8, icon: '🥓', side: 'left', level: 2 },
  // L3+ 4-way sorting
  { id: 9, icon: '🍤', side: 'top', level: 3 },
  { id: 10, icon: '🍍', side: 'top', level: 3 },
  { id: 11, icon: '🥑', side: 'bottom', level: 3 },
  { id: 12, icon: '🍄', side: 'bottom', level: 3 },
  // L4+
  { id: 13, icon: '🍣', side: 'top', level: 4 },
  { id: 14, icon: '🥡', side: 'right', level: 4 },
  { id: 15, icon: '🥗', side: 'bottom', level: 4 },
  { id: 16, icon: '🍳', side: 'left', level: 4 },
];

interface StreetEatsProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const StreetEats: React.FC<StreetEatsProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [currentOrder, setCurrentOrder] = useState<Ingredient[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  const [timeLeft, setTimeLeft] = useState(15);

  const availableIngredients = useMemo(() =>
    ALL_INGREDIENTS.filter(i => i.level <= level),
    [level]
  );

  const spawnOrder = useCallback(() => {
    const random = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
    setCurrentOrder([random]);
  }, [availableIngredients]);

  // Initial spawn
  useEffect(() => {
    spawnOrder();
  }, [spawnOrder]);

  // Timer logic
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setGameActive(false);
          return 0;
        }
        return prev - (0.1 * Math.sqrt(scaling));
      });
    }, 100);
    return () => clearInterval(timer);
  }, [gameActive, scaling]);

  const handleSwipe = (direction: 'left' | 'right' | 'top' | 'bottom') => {
    if (!gameActive || currentOrder.length === 0) return;

    const correctSide = currentOrder[0].side;
    if (direction === correctSide) {
      setScore(s => s + 1);
      setStreak(prev => prev + 1);
      setFeedback('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setStreak(0);
      setFeedback('wrong');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTotal(t => t + 1);
    setTimeout(() => setFeedback(null), 200);
    spawnOrder();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    const diffX = e.clientX - touchStart.current.x;
    const diffY = e.clientY - touchStart.current.y;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) < 30) return;

    if (absX > absY) {
        if (diffX > 50) handleSwipe('right');
        else if (diffX < -50) handleSwipe('left');
    } else if (level >= 3) {
        if (diffY > 50) handleSwipe('bottom');
        else if (diffY < -50) handleSwipe('top');
    }

    touchStart.current = null;
  };

  useEffect(() => {
    if (!gameActive) {
      setShowResults(true);
    }
  }, [gameActive]);

  const finalMultiplier = useMemo(() => {
    const accuracy = total > 0 ? score / total : 0;
    const base = accuracy >= 0.8 ? 2.5 : accuracy >= 0.5 ? 1.5 : 0.6;
    return base * (0.8 + scaling * 0.2);
  }, [score, total, scaling]);

  const menuTitle = level >= 5 ? "GOURMET FUSION" : level >= 3 ? "STREET DELUXE" : "STREET EATS";

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
      feedback === 'correct' ? 'bg-emerald-950/40' : feedback === 'wrong' ? 'bg-red-950/40' : 'bg-orange-950/20'
    } backdrop-blur-md`}>
      <PerfectFlow isActive={streak >= 5} intensity={Math.min(5, Math.floor(streak / 5))} />
      <div className="absolute top-12 text-center w-full px-6">
        <h2 className="text-4xl font-black text-orange-500 italic tracking-tighter uppercase drop-shadow-lg">{menuTitle} <span className="text-white text-sm">L{level}</span></h2>
        <div className="flex items-center justify-center gap-4 mt-1">
          <p className="text-slate-200 text-xs font-black uppercase tracking-widest">
              {level >= 3 ? "SORT 4-WAYS!" : "SORT LEFT/RIGHT!"}
          </p>
        </div>
        <div className="mt-6 text-emerald-400 font-mono font-black text-3xl tabular-nums">{score}/{total}</div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className={`relative w-full max-w-sm h-72 bg-slate-900 rounded-[3rem] border-8 transition-colors duration-200 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
          feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-orange-900/50'
        }`}
      >
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl opacity-10">⬅️</div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl opacity-10">➡️</div>
        {level >= 3 && (
            <>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl opacity-10">⬆️</div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl opacity-10">⬇️</div>
            </>
        )}

        <AnimatePresence mode="wait">
          {currentOrder.map(item => (
            <motion.div
              key={item.id + total}
              initial={{ scale: 0, y: 50, rotate: -45 }}
              animate={{ scale: 1.8, y: 0, rotate: 0 }}
              exit={{
                  x: item.side === 'left' ? -400 : item.side === 'right' ? 400 : 0,
                  y: item.side === 'top' ? -400 : item.side === 'bottom' ? 400 : 0,
                  opacity: 0,
                  rotate: item.side === 'left' ? -90 : 90
              }}
              transition={{ type: "spring", damping: 12 }}
              className="text-8xl z-10 drop-shadow-2xl"
            >
              {item.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm px-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="text-left flex flex-col gap-1">
          <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">LEFT</div>
          <div className="text-xl flex gap-1">{availableIngredients.filter(i => i.side === 'left').slice(-3).map(i => <span key={i.id}>{i.icon}</span>)}</div>
        </div>
        <div className="text-right flex flex-col gap-1">
          <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">RIGHT</div>
          <div className="text-xl flex gap-1 flex-row-reverse">{availableIngredients.filter(i => i.side === 'right').slice(-3).map(i => <span key={i.id}>{i.icon}</span>)}</div>
        </div>
        {level >= 3 && (
            <>
                <div className="text-left flex flex-col gap-1">
                  <div className="text-[8px] text-blue-500 font-black uppercase tracking-widest font-bold">TOP (PREMIUM)</div>
                  <div className="text-xl flex gap-1">{availableIngredients.filter(i => i.side === 'top').slice(-3).map(i => <span key={i.id}>{i.icon}</span>)}</div>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <div className="text-[8px] text-red-500 font-black uppercase tracking-widest font-bold">BOTTOM (TRASH)</div>
                  <div className="text-xl flex gap-1 flex-row-reverse">{availableIngredients.filter(i => i.side === 'bottom').slice(-3).map(i => <span key={i.id}>{i.icon}</span>)}</div>
                </div>
            </>
        )}
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-4">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">RUSH HOUR</span>
            <span className="text-orange-500 font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
           <motion.div
             className="h-full bg-orange-500"
             animate={{ width: `${(timeLeft / 15) * 100}%` }}
           />
        </div>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
          >
            <div className="w-full max-w-sm bg-slate-900 border-2 border-orange-500/50 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(249,115,22,0.2)]">
              <h3 className="text-3xl font-black text-orange-500 italic uppercase tracking-tighter mb-6">Service Over!</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold uppercase text-xs">Accuracy</span>
                  <span className="text-2xl font-black text-emerald-400">{total > 0 ? Math.round((score/total)*100) : 0}%</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-bold uppercase text-xs">Multiplier</span>
                  <span className="text-2xl font-black text-orange-400">{finalMultiplier.toFixed(2)}x</span>
                </div>
              </div>

              <button
                onPointerDown={(e) => { e.preventDefault(); onComplete(finalMultiplier); }}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-500/20 uppercase tracking-widest"
              >
                Collect Earnings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
