import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface EcomCatchProps {
  level?: number;
  onComplete: (multiplier: number) => void;
}

export const EcomCatch: React.FC<EcomCatchProps> = ({ level = 1, onComplete }) => {
  const [items, setItems] = useState<{ id: number; icon: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'catch' | 'miss' | null>(null);
  const nextId = useRef(0);
  const ICONS = ['👟', '👕', '📱', '👜', '🎧', '⌚'];

  // Scaling: 50 items target stays same, but speed and missed limit changes
  const targetScore = 30 + (level * 5);
  const allowedMisses = Math.max(3, 12 - level);

  useEffect(() => {
    if (!gameActive) return;

    const spawner = setInterval(() => {
      // Spawn frequency increases with level
      setItems(prev => [...prev, {
        id: nextId.current++,
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        x: Math.random() * 80 + 10,
        y: -10
      }]);
    }, Math.max(300, 600 - (level * 60)));

    return () => clearInterval(spawner);
  }, [gameActive, level]);

  useEffect(() => {
    if (!gameActive) return;

    const gravity = setInterval(() => {
      setItems(prev => {
        // Speed increases with level
        const speed = 1.5 + (level * 0.4);
        const next = prev.map(item => ({ ...item, y: item.y + speed }));

        // Count missed items
        const out = next.filter(item => item.y > 100);
        if (out.length > 0) {
          setMissed(m => m + out.length);
          setFeedback('miss');
          setTimeout(() => setFeedback(null), 200);
          if (navigator.vibrate) navigator.vibrate([30, 30]);
        }

        return next.filter(item => item.y <= 100);
      });
    }, 30);

    return () => clearInterval(gravity);
  }, [gameActive, level]);

  const handleCatch = (id: number) => {
    if (!gameActive) return;
    setScore(s => s + 1);
    setItems(prev => prev.filter(i => i.id !== id));
    setFeedback('catch');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (missed >= allowedMisses || score >= targetScore) {
      setGameActive(false);
      let multiplier = 0.5;
      const accuracy = score / targetScore;

      if (accuracy >= 1.0) multiplier = 4.0; // Perfect batch
      else if (accuracy >= 0.7) multiplier = 2.0;
      else if (accuracy >= 0.4) multiplier = 1.2;
      else multiplier = 0.8;

      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [missed, score, targetScore, allowedMisses, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback === 'catch' ? 'bg-emerald-950/20' : feedback === 'miss' ? 'bg-red-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center pointer-events-none w-full px-8 z-10">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter uppercase drop-shadow-lg">E-COM FLASH SALE</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl">🛒</motion.div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">TAP ITEMS TO FULFILL ORDERS</p>
        </div>
        <div className="flex gap-8 justify-center mt-6 font-mono font-black text-2xl">
          <div className="text-emerald-400">FILLED: {score}/{targetScore}</div>
          <div className="text-red-500">MISSED: {missed}/{allowedMisses}</div>
        </div>
      </div>

      <div className="relative w-full h-full overflow-hidden border-x-4 border-slate-900/50 bg-slate-900/20">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                  scale: 1,
                  opacity: 1,
                  y: `${item.y}%`,
                  x: `${item.x}%`,
                  rotate: item.y * 2
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileTap={{ scale: 1.3 }}
              onPointerDown={() => handleCatch(item.id)}
              className="absolute text-6xl p-4 drop-shadow-2xl active:scale-150 transition-transform z-20"
              style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
            >
              {item.icon}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Background visual detail */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-12 gap-4 opacity-5 pointer-events-none">
            {[...Array(72)].map((_, i) => (
                <div key={i} className="border border-white/20 rounded-sm" />
            ))}
        </div>
      </div>

      <div className="absolute bottom-12 w-full max-w-[300px] px-6 z-10">
        <ProgressBar
          value={score}
          max={targetScore}
          label="WAREHOUSE FULFILLMENT"
          colorClass="bg-emerald-500"
        />
        <div className="mt-2 text-center text-[8px] text-slate-600 font-black uppercase tracking-widest">
            LVL {level} • SPEED: {1.5 + (level * 0.4)}X
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[100] p-8 text-center"
          >
            <div className="text-8xl mb-6">{score >= targetScore ? '📦' : '📉'}</div>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">
                {score >= targetScore ? 'SHIPMENT DISPATCHED' : 'QUOTA NOT MET'}
            </div>
            <div className="text-emerald-400 font-black font-mono text-2xl mt-4">{score} ITEMS IN BATCH</div>
            <div className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mt-6 leading-relaxed">
                {score >= targetScore ? 'ALL ORDERS FULFILLED ON TIME' : `MISSED ${missed} CRITICAL SHIPMENTS`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
