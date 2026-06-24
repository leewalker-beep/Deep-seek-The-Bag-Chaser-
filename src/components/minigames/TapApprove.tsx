import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

const POSITIVE_HEADLINES = [
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

const NEGATIVE_HEADLINES = [
  "MARKET CRASH: BILLIONS WIPED OUT",
  "SCANDAL ROCKS MEDIA EMPIRE",
  "SUPPLY CHAIN COLLAPSE LOOMING",
  "INFLATION HITS 40 YEAR HIGH",
  "CYBER ATTACK DISRUPTS NATIONAL GRID",
  "POLITICAL TURMOIL IN CAPITAL",
  "NEW VIRUS VARIANT DETECTED",
  "DROUGHT THREATENS FOOD SECURITY",
  "TECH MONOPOLY UNDER INVESTIGATION",
  "HOUSING BUBBLE ABOUT TO BURST"
];

interface TapApproveProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const TapApprove: React.FC<TapApproveProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [headlines, setHeadlines] = useState<{ id: number, text: string, isPositive: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [_missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [nextId, setNextId] = useState(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  // Difficulty scaling
  const spawnRate = Math.max(200, (1000 - (level - 1) * 150) / Math.sqrt(scaling));
  const scrollSpeed = Math.max(1.0, (4.5 - (level - 1) * 0.5) * timerFactor); // duration in seconds, lower is faster
  const targetScore = Math.floor((10 + (level - 1) * 5) * Math.sqrt(scaling));

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const isPositive = Math.random() > (0.1 + (level - 1) * 0.05);
      const text = isPositive
        ? POSITIVE_HEADLINES[Math.floor(Math.random() * POSITIVE_HEADLINES.length)]
        : NEGATIVE_HEADLINES[Math.floor(Math.random() * NEGATIVE_HEADLINES.length)];

      const newHeadline = {
        id: nextId,
        text,
        isPositive
      };
      setHeadlines(prev => [...prev, newHeadline]);
      setNextId(id => id + 1);
    }, spawnRate);

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
  }, [nextId, level, spawnRate]);

  useEffect(() => {
    if (timeLeft === 0) {
      const multiplier = Math.max(0.5, Math.min(4.0, (score / targetScore) * 3.0));
      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [timeLeft, score, onComplete, targetScore]);

  const handleAction = (id: number, isApprove: boolean) => {
    const headline = headlines.find(h => h.id === id);
    if (!headline) return;

    if (isApprove === headline.isPositive) {
      setScore(s => s + 1);
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      setScore(s => Math.max(0, s - 2));
      setMissed(m => m + 1);
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setHeadlines(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="relative w-full h-[500px] bg-slate-950 rounded-3xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-900 shadow-2xl">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-end z-20">
        <div className="text-left flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">NETWORK CLOUT</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{score}</span>
        </div>
        <div className="text-center pb-1">
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">MEDIA EMPIRE <span className="text-emerald-500 text-xs">L{level}</span></h3>
        </div>
        <div className="text-right flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">BROADCAST</span>
            <span className={`text-2xl font-black font-mono tabular-nums ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
        </div>
      </div>

      <div className="absolute inset-0 pt-24 pb-32">
        <AnimatePresence>
          {headlines.map((h) => (
            <motion.div
              key={h.id}
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: -100, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: scrollSpeed, ease: "linear" }}
              onAnimationComplete={() => {
                if (h.isPositive) setMissed(m => m + 1);
                setHeadlines(prev => prev.filter(item => item.id !== h.id));
              }}
              className="absolute left-6 right-6 bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3"
            >
              <div className="text-white font-black text-xs leading-tight">{h.text}</div>
              <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(h.id, true)}
                    className="flex-1 py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-lg text-emerald-400 font-black text-[10px] uppercase tracking-widest active:bg-emerald-600 active:text-white"
                  >
                      APPROVE
                  </button>
                  <button
                    onClick={() => handleAction(h.id, false)}
                    className="flex-1 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 font-black text-[10px] uppercase tracking-widest active:bg-red-600 active:text-white"
                  >
                      KILL
                  </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 w-full px-8 z-20">
          <ProgressBar
            value={timeLeft}
            max={15}
            colorClass={timeLeft < 5 ? 'bg-red-500' : 'bg-blue-600'}
          />
          <div className="mt-2 text-center text-[8px] text-slate-500 font-black uppercase tracking-[0.3em]">
              FILTER THE FEED • QUOTA: {targetScore}
          </div>
      </div>

      <AnimatePresence>
        {timeLeft === 0 && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-8"
            >
                <div className="text-8xl mb-6 drop-shadow-2xl">{score >= targetScore ? '📺' : '📉'}</div>
                <div className="text-4xl font-black text-white italic uppercase tracking-tighter">BROADCAST OVER</div>
                <div className="text-emerald-400 font-black font-mono text-2xl mt-2 uppercase tracking-widest">{score} POSITIVE HITS</div>
                <div className="text-slate-500 text-[10px] font-black mt-6 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 uppercase tracking-widest">
                    QUOTA WAS {targetScore}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
