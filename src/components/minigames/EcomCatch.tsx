import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface EcomCatchProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const EcomCatch: React.FC<EcomCatchProps> = ({ onComplete, level = 1 }) => {
  const [items, setItems] = useState<{ id: number; icon: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'catch' | 'miss' | null>(null);
  const nextId = useRef(0);
  const ICONS = ['👟', '👕', '📱', '👜', '🎧', '⌚', '💎', '💻'];

  // Difficulty scaling
  const spawnRate = Math.max(250, 700 - (level - 1) * 80);
  const fallSpeed = 2 + (level - 1) * 0.5;
  const targetScore = 50 + (level - 1) * 10;
  const maxMissed = Math.max(5, 12 - (level - 1));

  useEffect(() => {
    if (!gameActive) return;

    const spawner = setInterval(() => {
      setItems(prev => [...prev, {
        id: nextId.current++,
        icon: ICONS[Math.floor(Math.random() * Math.min(ICONS.length, 4 + level))],
        x: Math.random() * 80 + 10,
        y: -10
      }]);
    }, spawnRate);

    return () => clearInterval(spawner);
  }, [gameActive, spawnRate, level]);

  useEffect(() => {
    if (!gameActive) return;

    const gravity = setInterval(() => {
      setItems(prev => {
        const next = prev.map(item => ({ ...item, y: item.y + fallSpeed }));

        // Count missed items
        const out = next.filter(item => item.y > 105);
        if (out.length > 0) {
          setMissed(m => m + out.length);
          setFeedback('miss');
          setTimeout(() => setFeedback(null), 200);
          if (navigator.vibrate) navigator.vibrate([30, 30]);
        }

        return next.filter(item => item.y <= 105);
      });
    }, 30);

    return () => clearInterval(gravity);
  }, [gameActive, fallSpeed]);

  const handleCatch = (id: number) => {
    if (!gameActive) return;
    setScore(s => s + 1);
    setItems(prev => prev.filter(i => i.id !== id));
    setFeedback('catch');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (missed >= maxMissed || score >= targetScore) {
      setGameActive(false);
      let multiplier = 0.5;
      if (score >= targetScore * 0.8) multiplier = 4.0;
      else if (score >= targetScore * 0.5) multiplier = 2.5;
      else if (score >= targetScore * 0.2) multiplier = 1.2;

      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [missed, score, targetScore, maxMissed, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback === 'catch' ? 'bg-emerald-950/40' : feedback === 'miss' ? 'bg-red-950/40' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center pointer-events-none w-full px-8 z-20">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">E-COM BRAND <span className="text-emerald-500 text-sm">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-400 font-black">⬆️</motion.span>
            <p className="text-slate-300 text-xs font-black uppercase tracking-widest">TAP TO FULFILL!</p>
        </div>
        <div className="flex gap-12 justify-center mt-6 font-mono font-black text-3xl tabular-nums drop-shadow-xl">
          <div className="text-emerald-400 flex flex-col items-center">
              <span className="text-[10px] text-slate-500">ORDERS</span>
              {score}
          </div>
          <div className="text-red-500 flex flex-col items-center">
              <span className="text-[10px] text-slate-500">MISSED</span>
              {missed}/{maxMissed}
          </div>
        </div>
      </div>

      <div className="relative w-full h-full overflow-hidden border-x-8 border-slate-900 bg-slate-900/10">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1, y: `${item.y}%`, x: `${item.x}%` }}
              exit={{ scale: 2.5, opacity: 0 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleCatch(item.id)}
              className="absolute p-4 drop-shadow-2xl active:scale-125 transition-transform"
              style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
            >
              <div className="text-6xl">{item.icon}</div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-6 z-20">
        <ProgressBar
          value={score}
          max={targetScore}
          label=""
          colorClass="bg-emerald-500"
        />
        <div className="mt-2 flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-widest">
            <span>Quota: {targetScore}</span>
            <span>Speed: {fallSpeed.toFixed(1)}x</span>
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[110] p-6"
          >
            <div className="text-8xl mb-6 drop-shadow-2xl">{score >= targetScore ? '🚚' : '📉'}</div>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">SHIPMENT READY</div>
            <div className="text-emerald-400 font-black font-mono text-2xl mt-2 uppercase tracking-widest">{score} ORDERS FULFILLED</div>
            <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-6 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                {score >= targetScore ? 'PERFECT FULFILLMENT' : score >= targetScore * 0.5 ? 'VOLUME HANDLED' : 'PARTIAL SHIPMENT'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
