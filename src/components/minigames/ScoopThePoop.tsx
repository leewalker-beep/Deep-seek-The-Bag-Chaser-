import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface ScoopThePoopProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

type TileType = '💩' | '✨' | '☣️' | null;

export const ScoopThePoop: React.FC<ScoopThePoopProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD'
}) => {
  const [tiles, setTiles] = useState<Record<string, TileType>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnRate = useMemo(() => Math.max(300, 1200 - (level - 1) * 200), [level]);

  // Initial tiles
  useEffect(() => {
    const initial: Record<string, TileType> = {};
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        initial[`${i}-${j}`] = null;
      }
    }
    setTiles(initial);
  }, []);

  const scoop = useCallback((key: string) => {
    if (!gameActive) return;
    const current = tiles[key];

    if (current === '☣️') {
        // Penalty for tapping biohazard
        setTimeLeft(prev => Math.max(0, prev - 2));
        setTiles(prev => ({ ...prev, [key]: null }));
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return;
    }

    if (current !== '💩') return;

    setTiles(prev => ({ ...prev, [key]: '✨' }));
    setScore(s => s + 1);
    if (navigator.vibrate) navigator.vibrate(20);

    setTimeout(() => {
      setTiles(prev => ({ ...prev, [key]: null }));
    }, 300);
  }, [gameActive, tiles]);

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
      setTiles(prev => {
        const nullTiles = Object.keys(prev).filter(k => prev[k] === null);
        if (nullTiles.length === 0) return prev;

        const randomKey = nullTiles[Math.floor(Math.random() * nullTiles.length)];
        const isBio = level >= 3 && Math.random() < 0.15;

        return { ...prev, [randomKey]: isBio ? '☣️' : '💩' };
      });
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, level]);

  useEffect(() => {
    const poopCount = Object.values(tiles).filter(v => v === '💩').length;
    if (poopCount >= 10) { // Slightly more lenient pile up
      setGameActive(false);
    }
  }, [tiles]);

  useEffect(() => {
    if (!gameActive) {
      let base = 0.5;
      if (score >= 25) base = 4.0;
      else if (score >= 18) base = 2.5;
      else if (score >= 10) base = 1.5;
      else if (score >= 5) base = 1.0;

      const multiplier = base * (0.8 + scaling * 0.2);
      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, onComplete, scaling]);

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border-4 border-slate-900 shadow-2xl text-center max-w-sm w-full mx-auto relative overflow-hidden">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-amber-500 uppercase tracking-tighter italic">SCOOP THE POOP 💩</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {level >= 3 ? "AVOID BIOHAZARDS ☣️" : "TAP FAST — DON'T LET IT PILE UP"}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-[300px] mx-auto mt-6">
        {Object.entries(tiles).map(([key, val]) => (
          <button
            key={key}
            onPointerDown={(e) => { e.preventDefault(); scoop(key); }}
            className={`aspect-square rounded-xl flex items-center justify-center text-3xl border transition-all active:scale-90 touch-none ${
              val === '💩' ? 'bg-slate-800 border-slate-700' :
              val === '✨' ? 'bg-amber-500/20 border-amber-500/50' :
              val === '☣️' ? 'bg-red-900/40 border-red-500 animate-pulse' :
              'bg-slate-900/50 border-slate-800'
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      <div className="mt-8 px-4">
        <div className="flex justify-between items-end mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>SCOOPED: {score}</span>
          <span className="text-white font-mono text-base">{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            animate={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20"
          >
            <div className="text-6xl mb-4">🧹</div>
            <div className="text-3xl font-black text-white italic uppercase tracking-tighter">JOB DONE</div>
            <div className="text-amber-500 font-black font-mono text-xl mt-2">{score} SCOOPED</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
