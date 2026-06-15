import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GhostTapProps {
  onComplete: (multiplier: number) => void;
}

export const GhostTap: React.FC<GhostTapProps> = ({ onComplete }) => {
  const [targets, setTargets] = useState<{ id: number; top: number; left: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const targetId = React.useRef(0);

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setGameActive(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    const spawner = setInterval(() => {
      setTargets(prev => {
        if (prev.length > 5) return prev;
        return [...prev, {
          id: targetId.current++,
          top: Math.random() * 70 + 15,
          left: Math.random() * 70 + 15
        }];
      });
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive]);

  const handleTap = (id: number) => {
    if (!gameActive) return;
    setScore(s => s + 1);
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 12) multiplier = 3.0;
      else if (score >= 8) multiplier = 2.0;
      else if (score >= 4) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center z-20">
        <h2 className="text-3xl font-black text-purple-500 italic tracking-tighter">GHOST MODE</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tap the ghosts before they vanish!</p>
        <div className="mt-4 text-emerald-400 font-mono font-black text-2xl">REMOVED: {score}</div>
      </div>

      <div className="relative w-full h-[400px] bg-slate-950 rounded-3xl border-2 border-purple-900/30 overflow-hidden shadow-[inset_0_0_100px_rgba(88,28,135,0.2)]">
        <AnimatePresence>
          {targets.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              onClick={() => handleTap(t.id)}
              className="absolute w-16 h-16 flex items-center justify-center text-4xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ top: `${t.top}%`, left: `${t.left}%` }}
            >
              👻
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-20 text-slate-600 font-bold uppercase text-[10px]">
        TIME REMAINING: {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};
