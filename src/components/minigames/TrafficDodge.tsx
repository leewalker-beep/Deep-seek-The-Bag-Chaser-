import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PerfectFlow } from '../effects/PerfectFlow';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: string;
}

interface TrafficDodgeProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

const VEHICLES = ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'];

export const TrafficDodge: React.FC<TrafficDodgeProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [distance, setDistance] = useState(0);
  const obstacleId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const gameSpeed = (3 + (level - 1) * 0.8) * Math.sqrt(scaling);
  const spawnRate = Math.max(300, (1200 - (level - 1) * 200) / spawnFactor);
  const targetDistance = Math.floor((1000 + (level - 1) * 500) * scaling);

  const handleLaneChange = (dir: 'left' | 'right') => {
    if (!gameActive) return;
    setLane(prev => {
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(2, prev + 1);
    });
    if (navigator.vibrate) navigator.vibrate(10);
  };

  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = setInterval(() => {
      setDistance(prev => {
        const next = prev + Math.floor(gameSpeed);
        if (next >= targetDistance) {
            setGameActive(false);
            const multiplier = 1.0 + (scaling * 2.0);
            if (navigator.vibrate) navigator.vibrate(100);
            setTimeout(() => onComplete(multiplier), 1000);
            return targetDistance;
        }
        return next;
      });

      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, y: o.y + gameSpeed }));

        // Check collisions
        const collision = updated.find(o => o.lane === lane && o.y > 75 && o.y < 90);
        if (collision) {
          setGameActive(false);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          const multiplier = Math.max(0.5, (distance / targetDistance) * 1.5);
          setTimeout(() => onComplete(multiplier), 1000);
        }

        return updated.filter(o => o.y < 120);
      });
    }, 50);

    const spawner = setInterval(() => {
      setObstacles(prev => [
        ...prev,
        {
          id: obstacleId.current++,
          lane: Math.floor(Math.random() * 3),
          y: -20,
          type: VEHICLES[Math.floor(Math.random() * VEHICLES.length)]
        }
      ]);
    }, spawnRate);

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawner);
    };
  }, [gameActive, gameSpeed, lane, distance, targetDistance, spawnRate, scaling, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <PerfectFlow isActive={gameActive && distance > targetDistance * 0.5} intensity={Math.min(5, Math.floor(distance / (targetDistance * 0.2)))} />
      <div className="absolute top-12 text-center w-full z-20">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">TRAFFIC DODGE <span className="text-emerald-500">L{level}</span></h2>
        <div className="mt-2 flex justify-center gap-10">
            <div className="text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">DISTANCE</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{distance}m</div>
            </div>
            <div className="text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">GOAL</div>
                <div className="text-2xl font-black text-white font-mono">{targetDistance}m</div>
            </div>
        </div>
      </div>

      <div className="relative w-72 h-[70vh] bg-slate-900 border-x-4 border-slate-800 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
        {/* Road Lines */}
        <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-slate-800 border-r border-slate-700/50 dashed" style={{ backgroundImage: 'linear-gradient(to bottom, #1e293b 50%, transparent 50%)', backgroundSize: '1px 40px' }} />
        <div className="absolute left-2/3 top-0 bottom-0 w-1 bg-slate-800 border-r border-slate-700/50 dashed" style={{ backgroundImage: 'linear-gradient(to bottom, #1e293b 50%, transparent 50%)', backgroundSize: '1px 40px' }} />

        {/* Player */}
        <motion.div
          className="absolute bottom-10 w-24 h-24 flex items-center justify-center text-6xl z-20 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]"
          animate={{ left: `${(lane * 33.33) + 16.66}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ transform: 'translateX(-50%)' }}
        >
          🚲
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <div
              key={o.id}
              className="absolute w-24 h-24 flex items-center justify-center text-6xl z-10"
              style={{ top: `${o.y}%`, left: `${(o.lane * 33.33) + 16.66}%`, transform: 'translateX(-50%)' }}
            >
              {o.type}
            </div>
          ))}
        </AnimatePresence>

        {!gameActive && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    {distance >= targetDistance ? 'GOAL REACHED!' : 'CRASHED!'}
                </div>
             </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-4 w-full max-w-xs">
          <button
            onPointerDown={() => handleLaneChange('left')}
            className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-4xl"
          >
              ⬅️
          </button>
          <button
            onPointerDown={() => handleLaneChange('right')}
            className="flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-4xl"
          >
              ➡️
          </button>
      </div>

      <div className="mt-6 text-[8px] text-slate-600 font-black uppercase tracking-widest text-center opacity-30">
          SWIPE OR USE BUTTONS TO DODGE TRAFFIC
      </div>
    </div>
  );
};
