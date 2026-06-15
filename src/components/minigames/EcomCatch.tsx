import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';

interface EcomCatchProps {
  onComplete: (multiplier: number) => void;
}

export const EcomCatch: React.FC<EcomCatchProps> = ({ onComplete }) => {
  const [items, setItems] = useState<{ id: number; icon: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'catch' | 'miss' | null>(null);
  const nextId = useRef(0);
  const ICONS = ['👟', '👕', '📱', '👜', '🎧', '⌚'];

  useEffect(() => {
    if (!gameActive) return;

    const spawner = setInterval(() => {
      setItems(prev => [...prev, {
        id: nextId.current++,
        icon: ICONS[Math.floor(Math.random() * ICONS.length)],
        x: Math.random() * 80 + 10,
        y: -10
      }]);
    }, 600);

    return () => clearInterval(spawner);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const gravity = setInterval(() => {
      setItems(prev => {
        const next = prev.map(item => ({ ...item, y: item.y + 2 }));

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
  }, [gameActive]);

  const handleCatch = (id: number) => {
    if (!gameActive) return;
    setScore(s => s + 1);
    setItems(prev => prev.filter(i => i.id !== id));
    setFeedback('catch');
    setTimeout(() => setFeedback(null), 100);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  useEffect(() => {
    if (missed >= 10 || score >= 50) {
      setGameActive(false);
      let multiplier = 0.5;
      if (score >= 40) multiplier = 3.0;
      else if (score >= 20) multiplier = 1.5;
      else if (score >= 10) multiplier = 1.0;

      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [missed, score, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback === 'catch' ? 'bg-emerald-950/20' : feedback === 'miss' ? 'bg-red-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center pointer-events-none w-full px-8">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter uppercase">E-COM FLASH SALE</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-slate-500">🛒</motion.span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tap items to add to cart!</p>
        </div>
        <div className="flex gap-8 justify-center mt-6 font-mono font-black text-2xl">
          <div className="text-emerald-400">CART: {score}</div>
          <div className="text-red-500">MISSED: {missed}/10</div>
        </div>
      </div>

      <div className="relative w-full h-full overflow-hidden border-x-4 border-slate-900 bg-slate-900/20">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: `${item.y}%`, x: `${item.x}%` }}
              exit={{ scale: 1.5, opacity: 0 }}
              whileTap={{ scale: 1.2 }}
              onClick={() => handleCatch(item.id)}
              className="absolute text-5xl p-2 drop-shadow-2xl active:scale-125 transition-transform"
              style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
            >
              {item.icon}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[300px] px-6">
        <ProgressBar
          value={score}
          max={50}
          label="CART CAPACITY"
          colorClass="bg-emerald-500"
          showValue
        />
        <div className="mt-2 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">
            DON'T MISS THE INVENTORY
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
          >
            <div className="text-7xl mb-6">📦</div>
            <div className="text-3xl font-black text-white italic uppercase tracking-tighter">SHIPMENT READY</div>
            <div className="text-emerald-400 font-black font-mono text-xl mt-2">{score} ITEMS COLLECTED</div>
            <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-4">
                {score >= 40 ? 'ELITE FULFILLMENT' : score >= 20 ? 'HIGH VOLUME' : 'STANDARD ORDER'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
