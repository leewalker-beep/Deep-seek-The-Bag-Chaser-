import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface HashtagTapProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

const HASHTAGS = [
  '#Viral', '#Trending', '#Fyp', '#Growth', '#Hustle', '#BagChaser',
  '#Startup', '#Tech', '#AI', '#Vibe', '#Aura', '#Clout', '#Scaling',
  '#Monetize', '#Engagement', '#Retention'
];

export const HashtagTap: React.FC<HashtagTapProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [activeHashtags, setActiveHashtags] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'tap' | null>(null);
  const nextId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const spawnRate = Math.max(200, (800 - (level - 1) * 100) / spawnFactor);
  const lifespan = Math.max(800, (3000 - (level - 1) * 300) / Math.sqrt(scaling));
  const targetScore = Math.floor((15 + (level - 1) * 5) * spawnFactor);

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

    const spawnInterval = setInterval(() => {
      const newHashtag = {
        id: nextId.current++,
        text: HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)],
        x: Math.random() * 70 + 15,
        y: Math.random() * 50 + 25,
      };

      setActiveHashtags(prev => [...prev, newHashtag]);

      setTimeout(() => {
        setActiveHashtags(prev => prev.filter(h => h.id !== newHashtag.id));
      }, lifespan * (0.8 + Math.random() * 0.4));
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameActive, spawnRate, lifespan]);

  const handleTap = (id: number) => {
    if (!gameActive) return;
    setScore(prev => prev + 1);
    setActiveHashtags(prev => prev.filter(h => h.id !== id));
    setFeedback('tap');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= targetScore) multiplier = 4.0;
      else if (score >= targetScore * 0.6) multiplier = 2.5;
      else if (score >= targetScore * 0.3) multiplier = 1.2;

      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, targetScore, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback ? 'bg-blue-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center pointer-events-none w-full px-8">
        <h2 className="text-4xl font-black text-slate-100 italic tracking-tighter uppercase drop-shadow-lg">SMM AGENCY <span className="text-blue-500 text-sm">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-400 font-black text-xl">⬆️</motion.span>
            <p className="text-slate-300 text-xs font-black uppercase tracking-widest">CAPTURE TRENDS!</p>
        </div>
        <div className="mt-6 text-blue-400 font-mono font-black text-4xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] tabular-nums">
            HITS: {score}
        </div>
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {activeHashtags.map(h => (
            <motion.button
              key={h.id}
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.8, opacity: 0, rotate: 10 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleTap(h.id)}
              className="absolute px-5 py-2.5 bg-blue-600/20 border-2 border-blue-500/50 rounded-xl text-blue-300 font-black text-sm shadow-[0_0_20px_rgba(59,130,246,0.2)] active:bg-blue-500 active:text-white transition-colors"
              style={{ left: `${h.x}%`, top: `${h.y}%`, x: '-50%', y: '-50%' }}
            >
              {h.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-6">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CLIENT ENGAGEMENT</span>
            <span className="text-blue-400 font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
        </div>
        <ProgressBar
          value={timeLeft}
          max={15}
          label=""
          colorClass="bg-blue-500"
        />
        <div className="mt-2 text-center text-[8px] text-slate-600 font-black uppercase tracking-widest">
            QUOTA: {targetScore} FOR MAX YIELD
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
          >
            <div className="text-8xl mb-4 drop-shadow-2xl">📈</div>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">AGENCY RESULTS</div>
            <div className="text-blue-400 font-black font-mono text-2xl mt-2 uppercase tracking-widest">{score} TRENDS CAPTURED</div>
            <div className="text-slate-500 text-[10px] font-black mt-4 uppercase">TARGET WAS {targetScore}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
