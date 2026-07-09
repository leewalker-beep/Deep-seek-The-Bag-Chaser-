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
  title?: string;
}

const VEHICLES = ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'];
const LANES = ['25%', '50%', '75%'];

export const TrafficDodge: React.FC<TrafficDodgeProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title = "DELIVERY GIGS"
}) => {
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [distance, setDistance] = useState(0);
  const obstacleId = useRef(0);

  // Ref-based lane for the interval closure
  const laneRef = useRef(lane);
  useEffect(() => { laneRef.current = lane; }, [lane]);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const gameSpeed = (3 + (level - 1) * 0.8) * Math.sqrt(scaling);
  const spawnRate = Math.max(300, (1200 - (level - 1) * 200) / spawnFactor);
  const targetDistance = Math.floor((400 + (level - 1) * 200) * scaling);

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
            const multiplier = 4.0 * (0.8 + scaling * 0.2); // Modern reward scaling
            if (navigator.vibrate) navigator.vibrate(100);
            setTimeout(() => onComplete(multiplier), 1000);
            return targetDistance;
        }
        return next;
      });

      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, y: o.y + gameSpeed }));

        // Collision detection: if any obstacle has y > 75 AND y < 90 AND obstacle.lane === lane, that's a hit.
        const collision = updated.find(o => o.lane === laneRef.current && o.y > 75 && o.y < 90);
        if (collision) {
          setGameActive(false);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setDistance(d => {
              // Penalty based on how far they got, modern scaling
              const progress = d / targetDistance;
              let multiplier = 0.5;
              if (progress >= 0.75) multiplier = 2.5;
              else if (progress >= 0.4) multiplier = 1.2;

              setTimeout(() => onComplete(multiplier), 1000);
              return d;
          });
        }

        return updated.filter(o => o.y < 105);
      });
    }, 50);

    const spawner = setInterval(() => {
      setObstacles(prev => [
        ...prev,
        {
          id: obstacleId.current++,
          lane: Math.floor(Math.random() * 3),
          y: 0,
          type: VEHICLES[Math.floor(Math.random() * VEHICLES.length)]
        }
      ]);
    }, spawnRate);

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawner);
    };
  }, [gameActive, gameSpeed, targetDistance, spawnRate, scaling, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <PerfectFlow isActive={gameActive && distance > targetDistance * 0.5} intensity={Math.min(5, Math.floor(distance / (targetDistance * 0.2)))} />
      <div className="absolute top-12 text-center w-full z-20">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{title} <span className="text-emerald-500">L{level}</span></h2>
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

      <div className="relative overflow-hidden w-full bg-slate-900 border-x-4 border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" style={{ height: '380px' }}>
        {/* Lane Dividers */}
        <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-slate-800" />
        <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-slate-800" />

        {/* Player */}
        <motion.div
          className="absolute w-24 h-24 flex items-center justify-center text-6xl z-20 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]"
          animate={{ left: LANES[lane] }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ position: 'absolute', bottom: '8px', transform: 'translateX(-50%)' }}
        >
          🛵
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <div
              key={o.id}
              className="absolute w-24 h-24 flex items-center justify-center text-6xl z-10"
              style={{
                position: 'absolute',
                left: LANES[o.lane],
                top: `${o.y}%`,
                transform: 'translateX(-50%)',
                fontSize: '2rem'
              }}
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
          USE BUTTONS TO DODGE TRAFFIC
      </div>
    </div>
  );
};
