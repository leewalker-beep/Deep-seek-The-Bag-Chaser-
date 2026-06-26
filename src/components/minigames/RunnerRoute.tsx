import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface RunnerRouteProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

const LANE_POSITIONS = ['16%', '50%', '84%'];

export const RunnerRoute: React.FC<RunnerRouteProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [lane, setLane] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState<{ id: number; y: number; lane: number }[]>([]);
  const nextId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const moveSpeed = (3 + (level - 1) * 0.5) * Math.sqrt(scaling);
  const spawnRate = Math.max(300, (1000 - (level - 1) * 100) / spawnFactor);

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
      setObstacles(prev => [...prev, {
        id: nextId.current++,
        y: -20,
        lane: Math.floor(Math.random() * 3)
      }]);
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate]);

  useEffect(() => {
    if (!gameActive) return;

    const gravity = setInterval(() => {
      setObstacles(prev => {
        const next = prev.map(o => ({ ...o, y: o.y + moveSpeed }));

        // Collision detection
        const collision = next.find(o => o.y > 75 && o.y < 90 && o.lane === lane);
        if (collision) {
          setScore(s => Math.max(0, s - 5));
          if (navigator.vibrate) navigator.vibrate(100);
          return next.filter(o => o.id !== collision.id);
        }

        // Scoring
        const passed = next.filter(o => o.y > 95);
        if (passed.length > 0) {
            setScore(s => s + 1);
        }

        return next.filter(o => o.y <= 100);
      });
    }, 30);

    return () => clearInterval(gravity);
  }, [gameActive, lane, moveSpeed]);

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 20) multiplier = 4.0;
      else if (score >= 12) multiplier = 2.5;
      else if (score >= 5) multiplier = 1.2;

      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, onComplete]);

  const handleLane = (newLane: number) => {
    if (!gameActive) return;
    setLane(newLane);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center w-full px-8 z-20">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">RUNNER ROUTE <span className="text-orange-500 text-sm">L{level}</span></h2>
        <div className="mt-6 text-orange-500 font-mono font-black text-4xl drop-shadow-xl tabular-nums">
            DELIVERIES: {score}
        </div>
      </div>

      <div className="relative w-full max-w-xs h-[400px] bg-slate-900 border-x-4 border-slate-800 items-end overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

        {/* Lane markers */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-slate-800" />
        <div className="absolute inset-y-0 right-1/3 w-px bg-slate-800" />

        {/* Player */}
        <div
          style={{ position: 'absolute', left: LANE_POSITIONS[lane], transform: 'translateX(-50%)' }}
          className="w-16 h-16 bg-orange-500 rounded-xl mb-4 z-10 flex items-center justify-center text-3xl shadow-lg border-t-2 border-white/20 bottom-0 transition-all duration-150"
        >
          🚚
        </div>

        {/* Obstacles */}
        {obstacles.map(o => (
          <motion.div
            key={o.id}
            initial={{ y: '-20%' }}
            animate={{ y: `${o.y}%` }}
            style={{ position: 'absolute', left: LANE_POSITIONS[o.lane], transform: 'translateX(-50%)' }}
            className="absolute top-0 w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center text-3xl"
          >
            🚧
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs z-20">
        {[0, 1, 2].map(l => (
          <button
            key={l}
            onPointerDown={() => handleLane(l)}
            className={`py-6 rounded-2xl font-black text-xl transition-all ${
              lane === l ? 'bg-orange-500 text-white scale-95' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {l === 0 ? 'L' : l === 1 ? 'C' : 'R'}
          </button>
        ))}
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-6">
        <ProgressBar
          value={timeLeft}
          max={15}
          label={`ROUTE CLEARANCE: ${timeLeft.toFixed(1)}s`}
          colorClass="bg-orange-500"
        />
      </div>
    </div>
  );
};
