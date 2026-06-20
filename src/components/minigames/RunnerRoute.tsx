import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface RunnerRouteProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const RunnerRoute: React.FC<RunnerRouteProps> = ({ onComplete, level = 1 }) => {
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; type: string }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'hit' | 'score' | null>(null);
  const touchStart = useRef<number | null>(null);
  const nextId = useRef(0);
  const hitObstacles = useRef<Set<number>>(new Set());

  // Difficulty scaling
  const spawnRate = Math.max(400, 1200 - (level - 1) * 200);
  const moveSpeed = 3 + (level - 1) * 0.8;
  const targetScore = 80 + (level - 1) * 40;

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
      const types = ['🚧', '🚗', '📦', '🛢️'];
      setObstacles(prev => [...prev, {
        id: nextId.current++,
        lane: Math.floor(Math.random() * 3),
        y: -20,
        type: types[Math.floor(Math.random() * types.length)]
      }]);
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate]);

  useEffect(() => {
    if (!gameActive) return;

    const movement = setInterval(() => {
      setObstacles(prev => {
        const next = prev.map(o => ({ ...o, y: o.y + moveSpeed }));

        // Collision detection
        const collision = next.find(o => o.lane === lane && o.y > 70 && o.y < 85 && !hitObstacles.current.has(o.id));
        if (collision) {
          hitObstacles.current.add(collision.id);
          setScore(s => Math.max(0, s - 5));
          setFeedback('hit');
          setTimeout(() => setFeedback(null), 300);
          if (navigator.vibrate) navigator.vibrate(100);
        }

        // Scoring
        next.forEach(o => {
          if (o.y > 90 && !prev.find(po => po.id === o.id && po.y > 90)) {
            setScore(s => s + 10);
            setFeedback('score');
            setTimeout(() => setFeedback(null), 300);
          }
        });

        return next.filter(o => o.y < 110);
      });
    }, 50);

    return () => clearInterval(movement);
  }, [gameActive, lane, moveSpeed]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStart.current;
    if (diff > 30) setLane(prev => Math.min(2, prev + 1));
    else if (diff < -30) setLane(prev => Math.max(0, prev - 1));
    touchStart.current = null;
  };

  // Keyboard fallbacks for testing
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft') setLane(prev => Math.max(0, prev - 1));
          if (e.key === 'ArrowRight') setLane(prev => Math.min(2, prev + 1));
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= targetScore) multiplier = 4.0;
      else if (score >= targetScore * 0.6) multiplier = 2.5;
      else if (score >= targetScore * 0.2) multiplier = 1.2;
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, targetScore, onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] transition-colors duration-300 ${
        feedback === 'hit' ? 'bg-red-900/40' : feedback === 'score' ? 'bg-emerald-900/40' : 'bg-slate-950'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-12 text-center pointer-events-none w-full px-8 z-20">
        <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-2xl">RUNNER FLEET <span className="text-emerald-500 text-sm">L{level}</span></h2>
        <div className="flex items-center justify-center gap-4 mt-1">
          <motion.span animate={{ x: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-emerald-400 font-black">⬅️</motion.span>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">SWIPE TO NAVIGATE!</p>
          <motion.span animate={{ x: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-emerald-400 font-black">➡️</motion.span>
        </div>
        <div className="mt-6 text-emerald-400 font-mono font-black text-4xl tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
            ${score * 100}
        </div>
      </div>

      <div className="relative w-full max-w-[320px] h-[450px] bg-slate-900 rounded-[2rem] border-8 border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

        {/* Lanes */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r-2 border-slate-800/50" />
          <div className="flex-1 border-r-2 border-slate-800/50" />
          <div className="flex-1" />
        </div>

        {/* Player Van */}
        <motion.div
          animate={{ x: (lane - 1) * 100 }}
          transition={{ type: 'spring', damping: 15, stiffness: 120 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-6xl z-20 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
        >
          🚚
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 blur-md rounded-full"
          />
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <motion.div
              key={o.id}
              initial={{ y: '-20%' }}
              animate={{ y: `${o.y}%`, x: (o.lane - 1) * 100 }}
              className="absolute left-1/2 -translate-x-1/2 text-5xl z-10 drop-shadow-lg"
            >
              {o.type}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-6 z-20">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">DELIVERY WINDOW</span>
            <span className="text-emerald-400 font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
        </div>
        <ProgressBar
          value={timeLeft}
          max={15}
          label=""
          colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}
        />
        <div className="mt-2 flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <span>Quota: {targetScore}</span>
            <span>Speed: {moveSpeed.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};
