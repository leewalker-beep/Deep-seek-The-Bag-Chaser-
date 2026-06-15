import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ingredient {
  id: number;
  icon: string;
  side: 'left' | 'right';
}

const INGREDIENTS: Ingredient[] = [
  { id: 1, icon: '🥩', side: 'left' },
  { id: 2, icon: '🥬', side: 'right' },
  { id: 3, icon: '🧅', side: 'right' },
  { id: 4, icon: '🌶️', side: 'left' },
  { id: 5, icon: '🧄', side: 'left' },
  { id: 6, icon: '🍅', side: 'right' },
];

interface StreetEatsProps {
  onComplete: (multiplier: number) => void;
}

export const StreetEats: React.FC<StreetEatsProps> = ({ onComplete }) => {
  const [currentOrder, setCurrentOrder] = useState<Ingredient[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const touchStart = useRef<number | null>(null);

  const spawnOrder = useCallback(() => {
    const random = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
    setCurrentOrder([random]);
  }, []);

  useEffect(() => {
    spawnOrder();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setGameActive(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [spawnOrder]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!gameActive || currentOrder.length === 0) return;

    const correctSide = currentOrder[0].side;
    if (direction === correctSide) {
      setScore(s => s + 1);
    }
    setTotal(t => t + 1);
    spawnOrder();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStart.current;

    if (diff > 50) handleSwipe('right');
    else if (diff < -50) handleSwipe('left');

    touchStart.current = null;
  };

  useEffect(() => {
    if (!gameActive) {
      const accuracy = total > 0 ? score / total : 0;
      let multiplier = 0.5;
      if (accuracy >= 0.9 && total >= 10) multiplier = 3.0;
      else if (accuracy >= 0.7 && total >= 5) multiplier = 2.0;
      else if (accuracy >= 0.4) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, total, onComplete]);

  return (
    <div className="fixed inset-0 bg-orange-950/20 backdrop-blur-md flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center">
        <h2 className="text-3xl font-black text-orange-500 italic tracking-tighter">STREET EATS</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Swipe LEFT or RIGHT for ingredients!</p>
        <div className="mt-4 text-emerald-400 font-mono font-black text-2xl">PREPPED: {score}/{total}</div>
      </div>

      <div
        className="relative w-full max-w-sm h-64 bg-slate-900 rounded-3xl border-4 border-orange-900/50 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl opacity-20">⬅️</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-20">➡️</div>

        <AnimatePresence mode="wait">
          {currentOrder.map(item => (
            <motion.div
              key={item.id + total}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1.5, y: 0 }}
              exit={{ x: item.side === 'left' ? -200 : 200, opacity: 0 }}
              className="text-8xl"
            >
              {item.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-between w-full max-w-sm px-4">
        <div className="text-left">
          <div className="text-[10px] text-slate-500 font-bold uppercase">LEFT SIDE</div>
          <div className="text-2xl">🥩 🌶️ 🧄</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase">RIGHT SIDE</div>
          <div className="text-2xl">🥬 🧅 🍅</div>
        </div>
      </div>

      <div className="absolute bottom-20 text-slate-500 font-bold uppercase text-[10px]">
        SERVICE ENDS IN: {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};
