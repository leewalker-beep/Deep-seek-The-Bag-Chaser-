import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface TrafficDodgeProps {
  onComplete: (multiplier: number) => void;
}

export const TrafficDodge: React.FC<TrafficDodgeProps> = ({ onComplete }) => {
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState<{ id: number; x: number; type: string }[]>([]);
  const [feedback, setFeedback] = useState<'hit' | 'score' | null>(null);
  const scoredObstacles = useRef<Set<number>>(new Set());
  const touchStart = useRef<number | null>(null);
  const obstacleId = useRef(0);

  const VEHICLES = ['🚗', '🚙', '🚕', '🏎️', '🚐'];

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

    const spawnObstacle = () => {
        if (!gameActive) return;
        setObstacles(prev => [...prev, {
            id: obstacleId.current++,
            x: 120,
            type: VEHICLES[Math.floor(Math.random() * VEHICLES.length)]
        }]);

        // Random next spawn time
        const nextSpawn = 1200 + Math.random() * 1500;
        setTimeout(spawnObstacle, nextSpawn);
    };

    spawnObstacle();

    return () => {
      clearInterval(timer);
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const movement = setInterval(() => {
      setObstacles(prev => {
        const next = prev.map(o => ({ ...o, x: o.x - 3.5 }));

        // Collision detection (approximate player box: x=10-25%, y=base)
        const collision = next.find(o => o.x > 8 && o.x < 22 && !isJumping);
        if (collision && !scoredObstacles.current.has(collision.id)) {
          // Penalize and mark as "processed"
          scoredObstacles.current.add(collision.id);
          setScore(s => Math.max(0, s - 15));
          setFeedback('hit');
          setTimeout(() => setFeedback(null), 300);
          if (navigator.vibrate) navigator.vibrate(50);
        }

        // Scoring for successful dodge
        next.forEach(o => {
          if (o.x < 5 && !scoredObstacles.current.has(o.id)) {
            scoredObstacles.current.add(o.id);
            setScore(s => s + 10);
            setFeedback('score');
            setTimeout(() => setFeedback(null), 300);
          }
        });

        return next.filter(o => o.x > -20);
      });
    }, 30);

    return () => clearInterval(movement);
  }, [gameActive, isJumping]);

  const handleJump = () => {
    if (isJumping || !gameActive) return;
    setIsJumping(true);
    if (navigator.vibrate) navigator.vibrate(10);
    setTimeout(() => setIsJumping(false), 700);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endY = e.changedTouches[0].clientY;
    // Any upward movement or tap counts as jump for better UX
    if (touchStart.current - endY > 10 || Math.abs(touchStart.current - endY) < 5) {
      handleJump();
    }
    touchStart.current = null;
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 60) multiplier = 3.0;
      else if (score >= 40) multiplier = 2.0;
      else if (score >= 20) multiplier = 1.2;
      else multiplier = 0.8;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-end touch-none select-none z-[100] transition-colors duration-300 pb-20 ${
        feedback === 'hit' ? 'bg-red-950/40' : feedback === 'score' ? 'bg-emerald-950/20' : 'bg-slate-950'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleJump}
    >
      <div className="absolute top-12 text-center w-full px-8 z-50">
        <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">DELIVERY GIGS</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">👆</motion.div>
          <p className="text-slate-300 text-sm font-black uppercase tracking-[0.2em]">TAP TO JUMP TRAFFIC</p>
        </div>
        <div className="mt-6 text-emerald-400 font-mono font-black text-4xl drop-shadow-md">
            ${(score * 100).toLocaleString()}
        </div>
      </div>

      {/* Full Screen Road */}
      <div className="absolute inset-x-0 bottom-0 h-64 overflow-hidden pointer-events-none">
        {/* Road Surface */}
        <div className="absolute inset-0 bg-slate-900 border-t-4 border-slate-800" />

        {/* Road Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-2 flex gap-12 px-4 opacity-20">
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ x: [-100, 400] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-20 h-full bg-white rounded-full"
                />
            ))}
        </div>

        {/* Ground/Sidewalk */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-800 border-t-2 border-slate-700" />
      </div>

      <div className="relative w-full max-w-lg h-64 pointer-events-none">
        {/* Player */}
        <motion.div
          animate={{
            y: isJumping ? -140 : 0,
            rotate: isJumping ? -10 : 0
          }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100
          }}
          className="absolute bottom-12 left-10 text-7xl z-20 filter drop-shadow-2xl"
        >
          🛵
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <motion.div
              key={o.id}
              initial={{ x: '120%' }}
              animate={{ x: `${o.x}%` }}
              exit={{ opacity: 0 }}
              className="absolute bottom-12 text-6xl z-10 filter drop-shadow-lg"
            >
              {o.type}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-10 w-full max-w-[320px] px-6 z-50">
        <ProgressBar
          value={timeLeft}
          max={15}
          label={`SHIFT ENDS IN: ${timeLeft.toFixed(1)}s`}
          colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}
        />
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[200] p-8"
          >
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">SHIFT COMPLETE</h3>
            <div className="text-emerald-400 font-black font-mono text-2xl mt-4">DELIVERED: {score} UNITS</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
