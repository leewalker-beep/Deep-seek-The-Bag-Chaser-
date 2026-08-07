import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface GhostModeProps {
  level?: number;
  tier?: Tier;
  onComplete: (multiplier: number) => void;
  title?: string;
  instruction?: string;
  targetEmoji?: string;
  scoreLabel?: string;
}

const DECOY_EMOJIS = ["🎃", "🦇", "🕷️", "🕸️", "💀"];

export const GhostMode: React.FC<GhostModeProps> = ({
  level = 1,
  tier = 'MUD',
  onComplete,
  title = "GHOST MODE",
  instruction = "TAP THE GHOSTS!",
  targetEmoji = "👻",
  scoreLabel = "SCORE"
}) => {
  const [targets, setTargets] = useState<{ id: number; top: number; left: number; isDecoy: boolean; emoji: string }[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'tap' | null>(null);
  const targetId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  const [timeLeft, setTimeLeft] = useState(10);

  // Difficulty scaling
  const targetScore = Math.floor((12 + (level - 1) * 2) * spawnFactor);
  const spawnRate = Math.max(200, (800 - (level - 1) * 150) / spawnFactor);
  const itemLifespan = Math.max(600, (2000 - (level - 1) * 300) / Math.sqrt(scaling));
  const decoyChance = Math.min(0.5, 0.2 + (level - 1) * 0.05);

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
        if (prev.length > 5 + level) return prev;
        const isDecoy = Math.random() < decoyChance;
        const newItem = {
          id: targetId.current++,
          top: Math.random() * 70 + 15,
          left: Math.random() * 70 + 15,
          isDecoy,
          emoji: isDecoy ? DECOY_EMOJIS[Math.floor(Math.random() * DECOY_EMOJIS.length)] : targetEmoji
        };

        setTimeout(() => {
          setTargets(p => p.filter(t => t.id !== newItem.id));
        }, itemLifespan);

        return [...prev, newItem];
      });
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, itemLifespan, level, targetEmoji, decoyChance]);

  const handleTap = (id: number, isDecoy: boolean) => {
    if (!gameActive) return;

    if (isDecoy) {
      setGameActive(false);
      setFeedback('tap');
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      onComplete(0.5);
      return;
    }

    setScore(s => s + 1);
    setTargets(prev => prev.filter(t => t.id !== id));
    setFeedback('tap');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (!gameActive && score > 0) { // Ensure we don't complete immediately on mount
      let multiplier = 0.5;
      if (score >= targetScore) multiplier = 1.0 + (scaling * 2.0);
      else if (score >= targetScore * 0.6) multiplier = 0.8 + (scaling * 1.0);
      else if (score >= targetScore * 0.3) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, targetScore, onComplete, scaling]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${feedback ? 'bg-purple-950/20' : 'bg-black'}`}>
      <div className="absolute top-12 text-center z-20">
        <h2 className="text-3xl font-black text-purple-500 italic tracking-tighter uppercase">{title} <span className="text-white text-xs">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2">
           <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-purple-700 uppercase">{instruction}</motion.span>
        </div>
        <div className="mt-4 text-emerald-400 font-mono font-black text-2xl">{scoreLabel}: {score}</div>
      </div>

      <div className="relative w-full flex-1 min-h-[300px] max-h-[400px] bg-slate-950 rounded-3xl border-2 border-purple-900/30 overflow-hidden shadow-[inset_0_0_100px_rgba(88,28,135,0.2)]">
        <AnimatePresence>
          {targets.map(t => (
            <motion.button
              key={t.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              onPointerDown={() => handleTap(t.id, t.isDecoy)}
              className={`absolute w-16 h-16 flex items-center justify-center text-4xl filter active:scale-125 transition-transform ${
                t.isDecoy ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]'
              }`}
              style={{ top: `${t.top}%`, left: `${t.left}%` }}
            >
              {t.emoji}
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
        <div className="mt-2 text-center text-[8px] text-slate-600 font-black uppercase">
          Target: {targetScore}+ for { (1.0 + scaling * 2.0).toFixed(1) }x Yield
        </div>
      </div>
    </div>
  );
};
