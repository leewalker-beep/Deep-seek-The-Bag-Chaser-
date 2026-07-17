import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface TapAssignProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const TapAssign: React.FC<TapAssignProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [tasks, setTasks] = useState<{ id: number; type: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [lastTappedType, setLastTappedType] = useState<number | null>(null);
  const nextId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const spawnRate = Math.max(200, (800 - (level - 1) * 100) / spawnFactor);
  const targetScore = Math.floor((15 + (level - 1) * 5) * spawnFactor);
  const lifespan = Math.max(1000, (3000 - (level - 1) * 200) / Math.sqrt(scaling));

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
      const id = nextId.current++;
      setTasks(prev => [...prev, {
        id,
        type: Math.floor(Math.random() * 3),
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 50
      }]);

      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== id));
      }, lifespan);
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, lifespan]);

  const handleTask = (id: number) => {
    if (!gameActive) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (lastTappedType === task.type) {
      setScore(s => s + 1);
      setLastTappedType(null); // Match found, clear selection
    } else {
      setLastTappedType(task.type); // No match, set current as active selection
    }

    setTasks(prev => prev.filter(t => t.id !== id));
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (!gameActive) {
      const accuracy = score / targetScore;
      let multiplier = 0.5;
      if (accuracy >= 1.0) multiplier = 4.0;
      else if (accuracy >= 0.7) multiplier = 2.5;
      else if (accuracy >= 0.4) multiplier = 1.2;

      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, targetScore, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center w-full px-8">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">AGENCY SCALE <span className="text-emerald-500 text-sm">L{level}</span></h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
          Consecutively tap two of the same icon to score a match!
        </p>
        <div className="mt-4 text-emerald-400 font-mono font-black text-4xl drop-shadow-xl tabular-nums">
            MATCHES: {score}
        </div>
        <div className="text-xs text-slate-300 font-semibold mt-1">
          Active Selection: {lastTappedType === 0 ? '✉️' : lastTappedType === 1 ? '📞' : lastTappedType === 2 ? '🛠️' : 'None'}
        </div>
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {tasks.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileTap={{ scale: 0.8 }}
              onPointerDown={() => handleTask(t.id)}
              className={`absolute w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl border-t-2 border-white/20 ${
                t.type === 0 ? 'bg-blue-600' : t.type === 1 ? 'bg-purple-600' : 'bg-orange-600'
              }`}
              style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {t.type === 0 ? '✉️' : t.type === 1 ? '📞' : '🛠️'}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-6">
        <ProgressBar
          value={timeLeft}
          max={15}
          label={`CAPACITY: ${timeLeft.toFixed(1)}s`}
          colorClass="bg-blue-500"
        />
        <div className="mt-2 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">
            QUOTA: {targetScore} FOR MAX SCALE
        </div>
      </div>
    </div>
  );
};
