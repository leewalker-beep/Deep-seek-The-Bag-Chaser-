import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface TapAssignProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instructions?: string;
}

export const TapAssign: React.FC<TapAssignProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title,
  instructions
}) => {
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
  const targetScore = Math.floor((12 + (level - 1) * 4) * spawnFactor);
  const lifespan = Math.max(1000, (3000 - (level - 1) * 200) / Math.sqrt(scaling));

  const displayTitle = title || (tier === 'CORPORATE' ? 'GLOBAL FRANCHISE DISPATCH' : 'AGENCY TEAM DEPLOYMENT');
  const displayInstructions = instructions || 'Tap matching client orders to assign and complete tasks';

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

  const handleTask = (id: number, e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
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
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(20);
    }
  };

  const calculatedMultiplier = Math.max(0.2, Math.min(3.0, Number(((score / Math.max(1, targetScore)) * 2.5).toFixed(2))));

  useEffect(() => {
    if (!gameActive) {
      const timer = setTimeout(() => onComplete(calculatedMultiplier), 1800);
      return () => clearTimeout(timer);
    }
  }, [gameActive, calculatedMultiplier, onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 relative min-h-[420px]">
      <div className="text-center w-full px-4 mb-2">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">
          {displayTitle} <span className="text-emerald-500 text-xs">L{level}</span>
        </h2>
        <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-bold max-w-xs mx-auto">
          {displayInstructions}
        </p>
        <div className="mt-2 text-emerald-400 font-mono font-black text-2xl drop-shadow-xl tabular-nums">
          MATCHES: {score}
        </div>
        <div className="text-[10px] text-slate-300 font-semibold mt-1">
          Active Selection: {lastTappedType === 0 ? '✉️' : lastTappedType === 1 ? '📞' : lastTappedType === 2 ? '🛠️' : 'None'}
        </div>
      </div>

      <div className="relative w-full h-[220px] bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden my-2">
        <AnimatePresence>
          {tasks.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileTap={{ scale: 0.8 }}
              onPointerDown={(e) => handleTask(t.id, e)}
              onTouchStart={(e) => handleTask(t.id, e)}
              className={`absolute w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl border-t-2 border-white/20 touch-manipulation ${
                t.type === 0 ? 'bg-blue-600' : t.type === 1 ? 'bg-purple-600' : 'bg-orange-600'
              }`}
              style={{ left: `${t.x}%`, top: `${t.y}%`, x: '-50%', y: '-50%' }}
            >
              {t.type === 0 ? '✉️' : t.type === 1 ? '📞' : '🛠️'}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-[300px] px-2 mt-2">
        <ProgressBar
          value={timeLeft}
          max={15}
          label={`DISPATCH TIME: ${timeLeft.toFixed(1)}s`}
          colorClass="bg-blue-500"
        />
        <div className="mt-1 text-center text-[8px] text-slate-500 font-black uppercase tracking-widest">
          QUOTA: {targetScore} MATCHES | TARGET YIELD: {calculatedMultiplier.toFixed(2)}x
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center z-30 p-6 text-center"
          >
            <div className="text-5xl mb-2">{score >= targetScore ? '🎯' : '⚠️'}</div>
            <div className="text-xl font-black text-white italic uppercase tracking-tighter">DISPATCH CONCLUDED</div>
            <div className="text-emerald-400 font-mono font-black text-lg mt-1">{score} TOTAL MATCHES</div>
            <div className="text-sm font-mono text-indigo-300 mt-1">YIELD MULTIPLIER: {calculatedMultiplier.toFixed(2)}x</div>

            <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-3 max-w-xs text-left">
              <div className="text-[9px] text-amber-400 font-black uppercase tracking-wider mb-1">PERFORMANCE BREAKDOWN:</div>
              <p className="text-[10px] text-slate-300 leading-tight">
                {score === 0
                  ? 'Zero matches logged — clients fled to rival agencies.'
                  : score < targetScore
                  ? 'Fulfillment backlog overwhelmed available team capacity.'
                  : 'Exceptional assignment efficiency achieved.'}
              </p>
              <div className="text-[9px] text-indigo-300 font-bold mt-2">
                💡 TIP: Rapid double-taps on matching icons clear queues before expiration.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
