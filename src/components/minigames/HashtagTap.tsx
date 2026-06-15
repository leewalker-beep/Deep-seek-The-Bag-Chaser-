import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

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
  const [feedback, setFeedback] = useState<'tap' | null>(null);
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
        x: Math.random() * 70 + 15,
        y: Math.random() * 50 + 25,
      };

      setActiveHashtags(prev => [...prev, newHashtag]);

      // Remove after 3-5 seconds
      setTimeout(() => {
        setActiveHashtags(prev => prev.filter(h => h.id !== newHashtag.id));
      }, 2500 + Math.random() * 1500);
    }, 700);

    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameActive]);

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
      if (score >= 15) multiplier = 3.0;
      else if (score >= 10) multiplier = 2.0;
      else if (score >= 5) multiplier = 1.0;

      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [gameActive, score, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback ? 'bg-blue-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center pointer-events-none w-full px-8">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter uppercase">SMM AGENCY</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-500">👆</motion.span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tap the trending hashtags!</p>
        </div>
        <div className="mt-6 text-blue-400 font-mono font-black text-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            HITS: {score}
        </div>
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {activeHashtags.map(h => (
            <motion.button
              key={h.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTap(h.id)}
              className="absolute px-6 py-3 bg-blue-600/10 border-2 border-blue-500/30 rounded-2xl text-blue-400 font-black text-sm shadow-[0_0_20px_rgba(59,130,246,0.15)] active:bg-blue-600 active:text-white transition-colors"
              style={{ left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {h.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[300px] px-6">
        <ProgressBar
          value={timeLeft}
          max={15}
          label={`TREND LIFESPAN: ${timeLeft.toFixed(1)}s`}
          colorClass="bg-blue-500"
        />
        <div className="mt-2 text-center text-[10px] text-slate-500 font-black uppercase tracking-widest">
            TARGET: 15+ FOR MAX YIELD
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
          >
            <div className="text-6xl mb-4">📈</div>
            <div className="text-3xl font-black text-white italic uppercase tracking-tighter">AGENCY SCALE</div>
            <div className="text-blue-400 font-black font-mono text-xl mt-2">{score} TRENDS CAPTURED</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
