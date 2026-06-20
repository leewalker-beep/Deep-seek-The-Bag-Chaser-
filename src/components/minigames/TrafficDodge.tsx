import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface TrafficDodgeProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const TrafficDodge: React.FC<TrafficDodgeProps> = ({ onComplete, level = 1 }) => {
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState<{ id: number; x: number; type: string }[]>([]);
  const [feedback, setFeedback] = useState<'hit' | 'score' | null>(null);
  const scoredObstacles = useRef<Set<number>>(new Set());
  const touchStart = useRef<number | null>(null);
  const obstacleId = useRef(0);

  // Difficulty scaling
  const spawnInterval = Math.max(600, 2000 - (level - 1) * 350);
  const moveSpeed = 2.5 + (level - 1) * 0.5;

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
      const types = ['🚗', '🚙', '🚕', '🚌', '🏎️'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setObstacles(prev => [...prev, { id: obstacleId.current++, x: 100, type: randomType }]);
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
        const next = prev.map(o => ({ ...o, x: o.x - moveSpeed }));

        // Collision detection: player is at left ~15%
        // We check if an obstacle is in range [10, 20] and player is NOT jumping
        const collision = next.find(o => o.x > 8 && o.x < 22 && !isJumping);
        if (collision && !scoredObstacles.current.has(collision.id)) {
          // If we hit it, we mark it as "scored" (so we don't hit it every frame)
          // but we actually penalize. Wait, better to just set a hit flag.
          setScore(s => Math.max(0, s - 5));
          setFeedback('hit');
          scoredObstacles.current.add(collision.id);
          setTimeout(() => setFeedback(null), 300);
          if (navigator.vibrate) navigator.vibrate(100);
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
    }, 50);

    return () => clearInterval(movement);
  }, [gameActive, isJumping, moveSpeed]);

  const handleJump = () => {
    if (isJumping || !gameActive) return;
    setIsJumping(true);
    // Jump duration
    setTimeout(() => setIsJumping(false), 700);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endY = e.changedTouches[0].clientY;
    // Swipe up
    if (touchStart.current - endY > 30) {
      handleJump();
    }
    touchStart.current = null;
  };

  useEffect(() => {
    if (!gameActive) {
      // Calculate multiplier based on score and level difficulty
      // Higher levels need higher scores for same multiplier?
      // Actually let's keep it simple: 100 score is 10 dodges.
      let multiplier = 0.5;
      if (score >= 80) multiplier = 4.0;
      else if (score >= 50) multiplier = 2.5;
      else if (score >= 20) multiplier = 1.0;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center touch-none select-none z-[100] transition-colors duration-300 ${
        feedback === 'hit' ? 'bg-red-900/60' : feedback === 'score' ? 'bg-emerald-900/40' : 'bg-slate-950'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleJump}
    >
      <div className="absolute top-12 text-center w-full px-8 z-20">
        <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-2xl">
          DELIVERY GIGS <span className="text-emerald-500 text-xl">L{level}</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-400">↑</motion.span>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">SWIPE UP TO JUMP OVER CARS!</p>
        </div>
        <div className="mt-6 flex justify-center items-baseline gap-2">
          <span className="text-slate-500 text-xs font-black uppercase">Earnings:</span>
          <span className="text-emerald-400 font-mono font-black text-4xl tabular-nums">${score * 10}</span>
        </div>
      </div>

      <div className="relative w-full h-80 bg-slate-900 border-y-8 border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Road Background Effects */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

        {/* Perspective Lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700/50" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50" />

        {/* Road Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 flex gap-12 items-center">
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ x: [-100, 1000] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-1 w-16 bg-yellow-500/30 shrink-0"
                />
            ))}
        </div>

        {/* Player */}
        <motion.div
          animate={{
            y: isJumping ? -140 : 0,
            rotate: isJumping ? -10 : 0,
            scale: isJumping ? 1.2 : 1
          }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100
          }}
          className="absolute bottom-16 left-[15%] text-7xl z-30 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
        >
          🛵
          {isJumping && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 0] }}
                className="absolute -bottom-4 left-0 right-0 h-2 bg-black/40 blur-md rounded-full"
            />
          )}
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <motion.div
              key={o.id}
              initial={{ x: '110%' }}
              animate={{ x: `${o.x}%` }}
              className="absolute bottom-16 text-6xl z-20 drop-shadow-xl"
            >
              {o.type}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Ground/Sidewalk */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-800 to-slate-900 border-t-4 border-slate-700" />
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
            <span>Density: {(2000/spawnInterval).toFixed(1)}x</span>
        </div>
      </div>

      {/* Speed Lines Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ x: '100%', y: `${20 * i}%` }}
                animate={{ x: '-100%' }}
                transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "linear" }}
                className="absolute h-px w-40 bg-white"
            />
        ))}
      </div>
    </div>
  );
};
