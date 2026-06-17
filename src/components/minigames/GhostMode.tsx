import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface GhostModeProps {
  level?: number;
  onComplete: (multiplier: number) => void;
}

export const GhostMode: React.FC<GhostModeProps> = ({ level = 1, onComplete }) => {
  const [targets, setTargets] = useState<{ id: number; top: number; left: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'tap' | null>(null);
  const targetId = React.useRef(0);

  useEffect(() => {
    if (!gameActive) return;

    const speedMultiplier = 1 + (level - 1) * 0.3;
    const spawnRate = 800 / speedMultiplier;

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
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, level]);

  const handleTap = (id: number) => {
    if (!gameActive) return;
    setScore(s => s + 1);
    setTargets(prev => prev.filter(t => t.id !== id));
    setFeedback('tap');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (!gameActive) {
      const targetScore = 12 + (level - 1) * 2;
      let multiplier = 0.5;
      if (score >= targetScore) multiplier = 3.0;
      else if (score >= targetScore * 0.6) multiplier = 2.0;
      else if (score >= targetScore * 0.3) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, level, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${feedback ? 'bg-purple-950/20' : 'bg-black'}`}>
      <div className="absolute top-12 text-center z-20">
        <h2 className="text-3xl font-black text-purple-500 italic tracking-tighter">GHOST MODE</h2>
        <div className="flex items-center justify-center gap-2">
           <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-purple-700">TAP THE GHOSTS!</motion.span>
        </div>
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
              className="absolute w-16 h-16 flex items-center justify-center text-4xl filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] active:scale-125 transition-transform"
              style={{ top: `${t.top}%`, left: `${t.left}%` }}
            >
              👻
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[300px] px-4">
        <ProgressBar
          value={timeLeft}
          max={10}
          label={`SIGNAL TIME: ${timeLeft.toFixed(1)}s`}
          colorClass="bg-purple-500"
        />
        <div className="mt-2 text-center text-[10px] text-slate-600 font-black uppercase">
          Target: {12 + (level - 1) * 2}+ for 3x Yield
        </div>
      </div>
    </div>
  );
};
