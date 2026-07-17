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

interface Vehicle {
  id: number;
  x: number;
  y: number;
  type: string;
}

export const getElasticVehicleSpawn = (currentVehicles: Vehicle[], speedMultiplier: number): Vehicle | null => {
  const sortedByY = [...currentVehicles].sort((a, b) => b.y - a.y);
  const highestVehicle = sortedByY[sortedByY.length - 1];
  const requiredVerticalGap = 200 * Math.max(1.0, speedMultiplier * 0.45);

  if (highestVehicle && highestVehicle.y < requiredVerticalGap) {
    return null;
  }

  return {
    id: Math.random(),
    x: Math.floor(Math.random() * 3),
    y: -60,
    type: Math.random() > 0.75 ? '🛢️' : '🚗'
  };
};

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

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const gameSpeed = (3.5 + (level - 1) * 0.8) * Math.sqrt(scaling);
  const spawnRate = Math.max(280, (1100 - (level - 1) * 180) / spawnFactor);

  // Target values: Level 1 = 700, Level 2 = 1000, Level 3 = 1500
  const baseTarget = level === 1 ? 700 : level === 2 ? 1000 : level === 3 ? 1500 : (1500 + (level - 3) * 500);
  const targetDistance = Math.floor(baseTarget * scaling);
  const targetPackages = 4 + level;

  // Refs to avoid resetting intervals continuously
  const laneRef = useRef(lane);
  useEffect(() => { laneRef.current = lane; }, [lane]);

  const scoreRef = useRef(score);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const distanceRef = useRef(distance);
  useEffect(() => { distanceRef.current = distance; }, [distance]);

  const controlDelayRef = useRef(controlDelay);
  useEffect(() => { controlDelayRef.current = controlDelay; }, [controlDelay]);

  const gameActiveRef = useRef(gameActive);
  useEffect(() => { gameActiveRef.current = gameActive; }, [gameActive]);

  const handleLaneChange = (dir: 'left' | 'right') => {
    if (!gameActiveRef.current || controlDelayRef.current > 0) return;
    setLane(prev => {
      if (dir === 'left') return Math.max(0, prev - 1);
      return Math.min(2, prev + 1);
    });
    if (navigator.vibrate) navigator.vibrate(12);
  };

  // 1. Keyboard event listener for instantaneous arrow controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActiveRef.current || controlDelayRef.current > 0) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleLaneChange('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleLaneChange('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 2. Stable Game Loop Interval
  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = setInterval(() => {
      if (controlDelayRef.current > 0) {
        setControlDelay(prev => Math.max(0, prev - 50));
      }

      let currentDistance = 0;
      setDistance(prev => {
        const next = prev + Math.floor(gameSpeed);
        if (next >= targetDistance) {
          clearInterval(gameLoop);
          setGameActive(false);

          // Standardized Payout Multiplier matching formula:
          // multiplier = performanceBase * (0.8 + scaling * 0.2)
          // On win, performanceBase starts at 1.0, scales with packages collected up to 3.0 maximum
          const packageBonus = Math.min(2.0, (scoreRef.current / targetPackages) * 2.0);
          const performanceBase = 1.0 + packageBonus;
          const finalMultiplier = performanceBase * (0.8 + scaling * 0.2);

          if (navigator.vibrate) navigator.vibrate(100);
          setTimeout(() => onComplete(finalMultiplier), 1000);
          return targetDistance;
        }
        currentDistance = next;
        return next;
      });

      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, y: o.y + (o.isPickup ? gameSpeed * 0.8 : gameSpeed) }));

        // Collision detection (🛵 lane width and vertical window checking)
        const collision = updated.find(o => {
          if (o.lane !== laneRef.current) return false;
          if (o.isPickup) {
            // Generous hitbox for collecting package cargo!
            return o.y > 68 && o.y < 98;
          } else {
            // Slightly tighter / fairer hitbox for avoiding standard hazards (cars/oil spills)
            return o.y > 76 && o.y < 92;
          }
        });
        if (collision) {
          if (collision.isPickup) {
            setScore(s => s + 1);
            if (navigator.vibrate) navigator.vibrate(25);
            return updated.filter(o => o.id !== collision.id);
          } else if (collision.isNegative) {
            setControlDelay(1500); // 1.5s delay stall
            if (navigator.vibrate) navigator.vibrate([60, 60, 60]);
            return updated.filter(o => o.id !== collision.id);
          } else {
            clearInterval(gameLoop);
            setGameActive(false);
            if (navigator.vibrate) navigator.vibrate([120, 60, 120]);

            // Crashed / Failure standardized payout calculation:
            // scales proportionally to progress completed
            const progress = Math.min(0.95, currentDistance / targetDistance);
            const performanceBase = progress * (1.0 + Math.min(1.0, scoreRef.current / 10));
            const finalMultiplier = performanceBase * (0.8 + scaling * 0.2);

            setTimeout(() => onComplete(finalMultiplier), 1000);
          }
        }

        return updated.filter(o => o.y < 105);
      });
    }, 50);

    return () => {
      clearInterval(gameLoop);
    };
  }, [gameActive, gameSpeed, targetDistance, scaling, onComplete, targetPackages]);

  // 3. Stable Spawner Interval
  useEffect(() => {
    if (!gameActive) return;

    const spawner = setInterval(() => {
      setObstacles(prev => {
        // Prevent obstacle cluttering
        if (prev.length > 5) return prev;

        let type = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
        let isPickup = false;
        let isNegative = false;

        const roll = Math.random();
        if (level >= 3 && roll < 0.16) {
          type = '📦';
          isPickup = true;
        } else if (level >= 4 && roll < 0.26) {
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
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, level]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
    return () => {
      if (element) {
        element.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
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
            <div className="text-xl font-black text-blue-400 font-mono">{score} / {targetPackages}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">GOAL</div>
            <div className="text-xl font-black text-white font-mono">{targetDistance}m</div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden w-full bg-slate-900 border-x-4 border-slate-800 shadow-[inset_0_0_100px_rgba(0,0,0,1)] rounded-3xl" style={{ height: '380px' }}>
        {/* Lane Dividers */}
        <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-slate-800" />
        <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-slate-800" />

        {/* Player Scooter */}
        <motion.div
          className={`absolute w-24 h-24 flex items-center justify-center text-6xl z-20 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] ${controlDelay > 0 ? 'opacity-50 grayscale animate-pulse' : ''}`}
          animate={{ left: LANES[lane] }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          style={{ position: 'absolute', bottom: '12px', transform: 'translateX(-50%)' }}
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

      {/* Responsive Lane Control Buttons */}
      <div className="mt-8 flex gap-4 w-full max-w-xs">
        <button
          onPointerDown={() => handleLaneChange('left')}
          disabled={controlDelay > 0}
          className={`flex-1 py-6 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-white rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-4xl ${controlDelay > 0 ? 'opacity-30' : ''}`}
        >
          ⬅️
        </button>
        <button
          onPointerDown={() => handleLaneChange('right')}
          disabled={controlDelay > 0}
          className={`flex-1 py-6 bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-white rounded-2xl border-b-8 border-slate-950 active:border-b-0 active:translate-y-1 transition-all text-4xl ${controlDelay > 0 ? 'opacity-30' : ''}`}
        >
          ➡️
        </button>
      </div>

      <div className="mt-6 text-[9px] text-slate-500 font-black uppercase tracking-widest text-center opacity-40">
        {level >= 3 ? "COLLECT PACKAGES • DODGE OIL SPILLS" : "DODGE TRAFFIC • KEYBOARD ARROWS OR BUTTONS"}
      </div>
    </div>
  );
};
