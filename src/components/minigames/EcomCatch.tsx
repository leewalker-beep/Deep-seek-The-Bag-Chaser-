import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EcomCatchProps {
  onComplete: (multiplier: number) => void;
}

export const EcomCatch: React.FC<EcomCatchProps> = ({ onComplete }) => {
  const [items, setItems] = useState<{ id: number; icon: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
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
        }

        return next.filter(item => item.y <= 100);
      });
    }, 30);

    return () => clearInterval(gravity);
  }, [gameActive]);

  const handleCatch = (id: number) => {
    setScore(s => s + 1);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    if (missed >= 10 || score >= 50) {
      setGameActive(false);
      let multiplier = 0.5;
      if (score >= 40) multiplier = 3.0;
      else if (score >= 20) multiplier = 1.5;
      else if (score >= 10) multiplier = 1.0;

      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [missed, score, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center pointer-events-none">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">E-COM FLASH SALE</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tap items to add to cart!</p>
        <div className="flex gap-4 justify-center mt-4 font-mono font-black text-xl">
          <div className="text-emerald-400">CART: {score}</div>
          <div className="text-red-500">MISSED: {missed}/10</div>
        </div>
      </div>

      <div className="relative w-full h-full overflow-hidden border-x-2 border-slate-900">
        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: `${item.y}%`, x: `${item.x}%` }}
              exit={{ scale: 1.2, opacity: 0 }}
              onClick={() => handleCatch(item.id)}
              className="absolute text-4xl p-2"
            >
              {item.icon}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 flex items-center gap-4 text-slate-500 font-bold uppercase text-[10px]">
        🛒 CART CAPACITY: {score}/50
      </div>
    </div>
  );
};
