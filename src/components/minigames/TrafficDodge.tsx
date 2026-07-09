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
  isPickup?: boolean;
  isNegative?: boolean;
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
  const [score, setScore] = useState(0);
  const [controlDelay, setControlDelay] = useState(0);
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
    if (!gameActive || controlDelay > 0) return;
    setLane(prev => {
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(2, prev + 1);
    });
    if (navigator.vibrate) navigator.vibrate(10);
  };

  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = setInterval(() => {
      if (controlDelay > 0) {
          setControlDelay(prev => Math.max(0, prev - 50));
      }

      setDistance(prev => {
        const next = prev + Math.floor(gameSpeed);
        if (next >= targetDistance) {
            setGameActive(false);
            const accuracyMult = 1 + (score * 0.1);
            const multiplier = 4.0 * (0.8 + scaling * 0.2) * accuracyMult;
            if (navigator.vibrate) navigator.vibrate(100);
            setTimeout(() => onComplete(multiplier), 1000);
            return targetDistance;
        }
        return next;
      });

      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, y: o.y + (o.isPickup ? gameSpeed * 0.8 : gameSpeed) }));

        // Collision detection
        const collision = updated.find(o => o.lane === laneRef.current && o.y > 75 && o.y < 95);
        if (collision) {
          if (collision.isPickup) {
             setScore(s => s + 1);
             if (navigator.vibrate) navigator.vibrate(20);
             return updated.filter(o => o.id !== collision.id);
          } else if (collision.isNegative) {
             setControlDelay(1500); // 1.5s delay
             if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
             return updated.filter(o => o.id !== collision.id);
          } else {
             setGameActive(false);
             if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
             // Penalty based on how far they got
             const progress = distance / targetDistance;
             let base = 0.5;
             if (progress >= 0.75) base = 2.5;
             else if (progress >= 0.4) base = 1.2;

             const multiplier = base * (1 + score * 0.05);
             setTimeout(() => onComplete(multiplier), 1000);
          }
        }

        return updated.filter(o => o.y < 105);
      });
    }, 50);

    const spawner = setInterval(() => {
      setObstacles(prev => {
          let type = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
          let isPickup = false;
          let isNegative = false;

          const roll = Math.random();
          if (level >= 3 && roll < 0.15) {
              type = '📦';
              isPickup = true;
          } else if (level >= 4 && roll < 0.25) {
              type = '🛢️';
              isNegative = true;
          }

          return [
            ...prev,
            {
              id: obstacleId.current++,
              lane: Math.floor(Math.random() * 3),
              y: 0,
              type,
              isPickup,
              isNegative
            }
          ];
      });
    }, spawnRate);

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawner);
    };
  }, [gameActive, gameSpeed, targetDistance, spawnRate, scaling, onComplete, score, distance, level, controlDelay]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <PerfectFlow isActive={gameActive && distance > targetDistance * 0.5} intensity={Math.min(5, Math.floor(distance / (targetDistance * 0.2)))} />
      <div className="absolute top-12 text-center w-full z-20">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{title} <span className="text-emerald-500">L{level}</span></h2>
        <div className="mt-2 flex justify-center gap-6">
            <div className="text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">DISTANCE</div>
                <div className="text-xl font-black text-emerald-400 font-mono">{distance}m</div>
            </div>
            <div className="text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">PACKAGES</div>
                <div className="text-xl font-black text-blue-400 font-mono">{score}</div>
            </div>
            <div className="text-center">
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">GOAL</div>
                <div className="text-xl font-black text-white font-mono">{targetDistance}m</div>
            </div>
        </div>
      </div>

      <div className="relative overflow-hidden w-full bg-slate-900 border-x-4 border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" style={{ height: '380px' }}>
        {/* Lane Dividers */}
        <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-slate-800" />
        <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-slate-800" />

        {/* Player */}
        <motion.div
          className={`absolute w-24 h-24 flex items-center justify-center text-6xl z-20 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] ${controlDelay > 0 ? 'opacity-50 grayscale animate-pulse' : ''}`}
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
              className={`absolute w-24 h-24 flex items-center justify-center z-10 ${o.isPickup ? 'text-4xl' : 'text-5xl'}`}
              style={{
                position: 'absolute',
                left: LANES[o.lane],
                top: `${o.y}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {o.type}
              {o.isPickup && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
                  />
              )}
              {o.isNegative && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-red-500/10 rounded-full blur-md"
                  />
              )}
            </div>
          ))}
        </AnimatePresence>

        {controlDelay > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black text-xl italic uppercase tracking-widest z-30 animate-bounce">
                ENGINE STALLED!
            </div>
        )}

        {!gameActive && (
             <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
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
            disabled={controlDelay > 0}
            className={`flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-4xl ${controlDelay > 0 ? 'opacity-30' : ''}`}
          >
              ⬅️
          </button>
          <button
            onPointerDown={() => handleLaneChange('right')}
            disabled={controlDelay > 0}
            className={`flex-1 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-4xl ${controlDelay > 0 ? 'opacity-30' : ''}`}
          >
              ➡️
          </button>
      </div>

      <div className="mt-6 text-[8px] text-slate-600 font-black uppercase tracking-widest text-center opacity-30">
          {level >= 3 ? "COLLECT PACKAGES • DODGE OIL SPILLS" : "USE BUTTONS TO DODGE TRAFFIC"}
      </div>
    </div>
  );
};
