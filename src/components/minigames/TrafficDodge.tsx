import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

import { PROGRESSION_ORDER } from '../../config/tiers';
import type { Tier } from '../../types/game';

interface TrafficDodgeProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const TrafficDodge: React.FC<TrafficDodgeProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [lane, setLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState<{ id: number; y: number; lane: number; type: string }[]>([]);
  const [feedback, setFeedback] = useState<'hit' | 'score' | null>(null);
  const scoredObstacles = useRef<Set<number>>(new Set());
  const touchStart = useRef<number | null>(null);
  const obstacleId = useRef(0);

  // Difficulty scaling
  const tierIndex = PROGRESSION_ORDER.indexOf(tier);
  const spawnInterval = Math.max(300, 1200 - (level - 1) * 150 - (tierIndex * 100));
  const moveSpeed = 3 + (level - 1) * 0.8 + (tierIndex * 0.5);

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

    const obstacleSpawner = setInterval(() => {
      const types = ['🚗', '🚙', '🚕', '🚌', '🏎️', '🚛'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomLane = Math.floor(Math.random() * 3);
      setObstacles(prev => [...prev, { id: obstacleId.current++, y: -20, lane: randomLane, type: randomType }]);
    }, spawnInterval);

    return () => {
      clearInterval(timer);
      clearInterval(obstacleSpawner);
    };
  }, [gameActive, spawnInterval]);

  useEffect(() => {
    if (!gameActive) return;

    const movement = setInterval(() => {
      setObstacles(prev => {
        const next = prev.map(o => ({ ...o, y: o.y + moveSpeed }));

        // Collision detection: player is at y ~80%
        // We check if an obstacle is in range [70, 90] and in the same lane
        const collision = next.find(o => o.y > 70 && o.y < 90 && o.lane === lane);
        if (collision && !scoredObstacles.current.has(collision.id)) {
          setScore(s => Math.max(0, s - 5));
          setFeedback('hit');
          scoredObstacles.current.add(collision.id);
          setTimeout(() => setFeedback(null), 300);
          if (navigator.vibrate) navigator.vibrate(100);
        }

        // Scoring for successful dodge
        next.forEach(o => {
          if (o.y > 95 && !scoredObstacles.current.has(o.id)) {
            scoredObstacles.current.add(o.id);
            setScore(s => s + 10);
            setFeedback('score');
            setTimeout(() => setFeedback(null), 300);
          }
        });

        return next.filter(o => o.y < 120);
      });
    }, 50);

    return () => clearInterval(movement);
  }, [gameActive, lane, moveSpeed]);

  const handleMove = (dir: 'left' | 'right') => {
    if (!gameActive) return;
    if (dir === 'left') setLane(prev => Math.max(0, prev - 1));
    if (dir === 'right') setLane(prev => Math.min(2, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = touchStart.current - endX;
    if (Math.abs(diff) > 30) {
      if (diff > 0) handleMove('left');
      else handleMove('right');
    }
    touchStart.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'ArrowRight') handleMove('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 100) multiplier = 4.0;
      else if (score >= 60) multiplier = 2.5;
      else if (score >= 20) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, onComplete]);

  const lanePositions = ['20%', '50%', '80%'];

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center touch-none select-none z-[100] transition-colors duration-300 ${
        feedback === 'hit' ? 'bg-red-900/60' : feedback === 'score' ? 'bg-emerald-900/40' : 'bg-slate-950'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-12 text-center w-full px-8 z-20">
        <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-2xl">
          DELIVERY GIGS <span className="text-emerald-500 text-xl">L{level}</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <motion.span animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-400">↔</motion.span>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">SWIPE LEFT/RIGHT TO DODGE!</p>
        </div>
        <div className="mt-6 flex justify-center items-baseline gap-2">
          <span className="text-slate-500 text-xs font-black uppercase">Earnings:</span>
          <span className="text-emerald-400 font-mono font-black text-4xl tabular-nums">${score * 10}</span>
        </div>
      </div>

      <div className="relative w-full h-[70vh] max-w-md bg-slate-900 border-x-8 border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Road Background Effects */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

        {/* Lane Markings */}
        <div className="absolute inset-0 flex justify-around pointer-events-none">
          <div className="w-px h-full border-l-2 border-dashed border-slate-700/50" />
          <div className="w-px h-full border-l-2 border-dashed border-slate-700/50" />
        </div>

        {/* Player */}
        <motion.div
          animate={{
            x: `calc(${lanePositions[lane]} - 50%)`,
            rotate: (lane - 1) * 10
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 150
          }}
          className="absolute bottom-[15%] left-0 text-8xl z-30 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] flex justify-center w-full"
          style={{ transform: 'translateX(-50%)' }}
        >
          <span className="inline-block">🛵</span>
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <motion.div
              key={o.id}
              initial={{ y: '-20%', x: `calc(${lanePositions[o.lane]} - 50%)` }}
              animate={{ y: `${o.y}%`, x: `calc(${lanePositions[o.lane]} - 50%)` }}
              className="absolute left-0 text-8xl z-20 drop-shadow-xl flex justify-center w-full"
            >
              <span className="inline-block">{o.type}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-4 z-20">
        <ProgressBar
          value={timeLeft}
          max={15}
          label={`SHIFT ENDS IN: ${timeLeft.toFixed(1)}s`}
          colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}
        />
        <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            <span>Level {level}</span>
            <span>Speed: {moveSpeed.toFixed(1)}x</span>
            <span>Density: {(1200/spawnInterval).toFixed(1)}x</span>
        </div>
      </div>

      {/* Speed Lines Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ y: '-20%', x: `${20 * i}%` }}
                animate={{ y: '120%' }}
                transition={{ repeat: Infinity, duration: 0.3 + Math.random() * 0.4, ease: "linear" }}
                className="absolute w-px h-60 bg-white"
            />
        ))}
      </div>

      {/* Simple Control Overlay for desktop */}
      <div className="absolute bottom-4 flex gap-4 opacity-20 hover:opacity-100 transition-opacity">
          <button onClick={() => handleMove('left')} className="p-4 bg-slate-800 rounded-full text-2xl">⬅️</button>
          <button onClick={() => handleMove('right')} className="p-4 bg-slate-800 rounded-full text-2xl">➡️</button>
      </div>
    </div>
  );
};
