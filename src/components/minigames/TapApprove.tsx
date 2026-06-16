import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HEADLINES = [
  "ECONOMY BOOMING: STOCKS HIT ALL TIME HIGH",
  "TECH GIANT ANNOUNCES REVOLUTIONARY AI",
  "LOCAL HERO SAVES KITTEN FROM TREE",
  "NEW LUXURY RESORT OPENS IN BAHAMAS",
  "CLIMATE ACCORD SIGNED BY WORLD LEADERS",
  "BREAKTHROUGH IN RENEWABLE ENERGY",
  "SPACE X LANDS ON MARS",
  "CURE FOR COMMON COLD DISCOVERED",
  "GLOBAL POVERTY RATES DROP SIGNIFICANTLY",
  "NEW ART EXHIBIT WOWS CRITICS"
];

interface TapApproveProps {
  onComplete: (multiplier: number) => void;
}

export const TapApprove: React.FC<TapApproveProps> = ({ onComplete }) => {
  const [headlines, setHeadlines] = useState<{ id: number, text: string, y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const newHeadline = {
        id: nextId,
        text: HEADLINES[Math.floor(Math.random() * HEADLINES.length)],
        y: 100
      };
      setHeadlines(prev => [...prev, newHeadline]);
      setNextId(id => id + 1);
    }, 800);

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(spawnInterval);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timer);
    };
  }, [nextId]);

  useEffect(() => {
    if (timeLeft === 0) {
      const multiplier = Math.min(2.5, 0.5 + (score * 0.1));
      onComplete(multiplier);
    }
  }, [timeLeft, score, onComplete]);

  const handleApprove = (id: number) => {
    setScore(s => s + 1);
    setHeadlines(prev => prev.filter(h => h.id !== id));
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-emerald-400 font-black text-xl">SCORE: {score}</div>
        <div className="text-red-400 font-black text-xl">{timeLeft}s</div>
      </div>

      <div className="absolute inset-0 pt-16">
        <AnimatePresence>
          {headlines.map((h) => (
            <motion.button
              key={h.id}
              initial={{ y: 350, opacity: 0 }}
              animate={{ y: -50, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              onAnimationComplete={() => {
                setHeadlines(prev => prev.filter(item => item.id !== h.id));
              }}
              onClick={() => handleApprove(h.id)}
              className="absolute left-4 right-4 bg-slate-800 border-2 border-emerald-500/50 rounded-lg p-3 text-white font-bold text-xs shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
            >
              {h.text}
              <div className="text-[8px] text-emerald-400 mt-1">TAP TO APPROVE</div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 text-center pointer-events-none">
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Approve positive headlines!
        </div>
      </div>
    </div>
  );
};
