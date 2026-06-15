import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HashtagTapProps {
  onComplete: (multiplier: number) => void;
}

const HASHTAGS = [
  '#Viral', '#Trending', '#Fyp', '#Growth', '#Hustle', '#BagChaser',
  '#Startup', '#Tech', '#AI', '#Vibe', '#Aura', '#Clout'
];

export const HashtagTap: React.FC<HashtagTapProps> = ({ onComplete }) => {
  const [activeHashtags, setActiveHashtags] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const nextId = useRef(0);

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
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
      };

      setActiveHashtags(prev => [...prev, newHashtag]);

      // Remove after 3-5 seconds
      setTimeout(() => {
        setActiveHashtags(prev => prev.filter(h => h.id !== newHashtag.id));
      }, 3000 + Math.random() * 2000);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameActive]);

  const handleTap = (id: number) => {
    setScore(prev => prev + 1);
    setActiveHashtags(prev => prev.filter(h => h.id !== id));
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (score >= 12) multiplier = 3.0;
      else if (score >= 8) multiplier = 2.0;
      else if (score >= 4) multiplier = 1.0;

      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center pointer-events-none">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">SMM AGENCY</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tap the trending hashtags!</p>
        <div className="mt-4 text-blue-400 font-mono font-black text-2xl">SCORE: {score}</div>
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {activeHashtags.map(h => (
            <motion.button
              key={h.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              onClick={() => handleTap(h.id)}
              className="absolute px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-full text-blue-400 font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              {h.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 text-slate-500 font-bold uppercase text-[10px]">
        TREND EXPIRES IN: {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};
