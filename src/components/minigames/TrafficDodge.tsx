import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrafficDodgeProps {
  onComplete: (multiplier: number) => void;
}

export const TrafficDodge: React.FC<TrafficDodgeProps> = ({ onComplete }) => {
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState<{ id: number; x: number }[]>([]);
  const scoredObstacles = useRef<Set<number>>(new Set());
  const touchStart = useRef<number | null>(null);
  const obstacleId = useRef(0);

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
      setObstacles(prev => [...prev, { id: obstacleId.current++, x: 100 }]);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(obstacleSpawner);
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const movement = setInterval(() => {
      setObstacles(prev => {
        const next = prev.map(o => ({ ...o, x: o.x - 2.5 }));

        // Collision detection
        const collision = next.find(o => o.x > 10 && o.x < 25 && !isJumping);
        if (collision) {
          setScore(s => Math.max(0, s - 1)); // Reduced penalty
        }

        // Scoring for successful dodge
        next.forEach(o => {
          if (o.x < 5 && !scoredObstacles.current.has(o.id)) {
            scoredObstacles.current.add(o.id);
            setScore(s => s + 10);
          }
        });

        return next.filter(o => o.x > -20);
      });
    }, 50);

    return () => clearInterval(movement);
  }, [gameActive, isJumping]);

  const handleJump = () => {
    if (isJumping || !gameActive) return;
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endY = e.changedTouches[0].clientY;
    if (touchStart.current - endY > 30) {
      handleJump();
    }
    touchStart.current = null;
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 50) multiplier = 3.0;
      else if (score >= 30) multiplier = 2.0;
      else if (score >= 10) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleJump}
    >
      <div className="absolute top-12 text-center">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">DELIVERY GIGS</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Swipe UP to dodge traffic!</p>
        <div className="mt-4 text-emerald-400 font-mono font-black text-2xl">SCORE: {score}</div>
      </div>

      <div className="relative w-full h-64 bg-slate-900 rounded-3xl border-b-8 border-slate-800 overflow-hidden">
        {/* Road Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-2 border-y-2 border-dashed border-slate-700 opacity-30" />

        {/* Player */}
        <motion.div
          animate={{ y: isJumping ? -80 : 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="absolute bottom-12 left-10 text-5xl z-20"
        >
          🛵
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <motion.div
              key={o.id}
              initial={{ x: '100%' }}
              animate={{ x: `${o.x}%` }}
              className="absolute bottom-12 text-4xl z-10"
            >
              🚗
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-800" />
      </div>

      <div className="absolute bottom-20 text-slate-500 font-bold uppercase text-[10px]">
        TIME REMAINING: {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};
