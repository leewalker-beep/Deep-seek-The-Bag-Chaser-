import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RunnerRouteProps {
  onComplete: (multiplier: number) => void;
}

export const RunnerRoute: React.FC<RunnerRouteProps> = ({ onComplete }) => {
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const touchStart = useRef<number | null>(null);
  const nextId = useRef(0);
  const hitObstacles = useRef<Set<number>>(new Set());

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
        lane: Math.floor(Math.random() * 3),
        y: -20
      }]);
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const movement = setInterval(() => {
      setObstacles(prev => {
        const next = prev.map(o => ({ ...o, y: o.y + 3 }));

        // Collision detection
        const collision = next.find(o => o.lane === lane && o.y > 70 && o.y < 85 && !hitObstacles.current.has(o.id));
        if (collision) {
          hitObstacles.current.add(collision.id);
          setScore(s => Math.max(0, s - 5));
        }

        // Scoring
        next.forEach(o => {
          if (o.y > 90 && !prev.find(po => po.id === o.id && po.y > 90)) {
            setScore(s => s + 10);
          }
        });

        return next.filter(o => o.y < 110);
      });
    }, 50);

    return () => clearInterval(movement);
  }, [gameActive, lane]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 30) setLane(prev => Math.min(2, prev + 1));
    else if (diff < -30) setLane(prev => Math.max(0, prev - 1));
    touchStart.current = null;
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 80) multiplier = 3.0;
      else if (score >= 40) multiplier = 1.5;
      else if (score >= 10) multiplier = 1.0;
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-12 text-center pointer-events-none">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">RUNNER FLEET</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Swipe Left/Right to route!</p>
        <div className="mt-4 text-emerald-400 font-mono font-black text-2xl">DELIVERED: {score}</div>
      </div>

      <div className="relative w-full max-w-[300px] h-[400px] bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden">
        {/* Lanes */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-slate-800/50" />
          <div className="flex-1 border-r border-slate-800/50" />
          <div className="flex-1" />
        </div>

        {/* Player Van */}
        <motion.div
          animate={{ x: (lane - 1) * 100 }}
          transition={{ type: 'spring', damping: 20 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-4xl z-20"
        >
          🚚
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <motion.div
              key={o.id}
              initial={{ y: '-20%' }}
              animate={{ y: `${o.y}%`, x: (o.lane - 1) * 100 }}
              className="absolute left-1/2 -translate-x-1/2 text-4xl z-10"
            >
              🚧
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 text-slate-500 font-bold uppercase text-[10px]">
        FUEL REMAINING: {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};
