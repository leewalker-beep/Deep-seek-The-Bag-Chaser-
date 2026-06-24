import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface SweepItem {
  id: number;
  top: number;
  left: number;
  isRare: boolean;
  emoji: string;
}

interface MagneticSweepProps {
  onComplete: (res: { multiplier: number; isRare: boolean }) => void;
  level?: number;
  tier?: Tier;
  itemEmojis?: string[];
  rareEmoji?: string;
  title?: string;
  instruction?: string;
  scoreLabel?: string;
  rareLabel?: string;
  icon?: string;
}

export const MagneticSweep: React.FC<MagneticSweepProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  itemEmojis = ['🔩', '⚙️', '🖇️', '📎', '🔑'],
  rareEmoji = '🪙',
  scoreLabel = "SCRAP COLLECTED",
  rareLabel = "RARE FIND!",
  icon = "🧲"
}) => {
  const [items, setItems] = useState<SweepItem[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [magnetPos, setMagnetPos] = useState({ x: 50, y: 50 });
  const [isRareFound, setIsRareFound] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const targetScore = Math.floor((15 + (level - 1) * 3) * spawnFactor);
  const spawnRate = Math.max(200, (600 - (level - 1) * 100) / spawnFactor);
  const itemLifespan = Math.max(1000, (3000 - (level - 1) * 400) / Math.sqrt(scaling));

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
      setItems(prev => {
        if (prev.length > 10 + level) return prev;
        const isRare = Math.random() < (0.05 + level * 0.01);
        const newItem = {
          id: itemId.current++,
          top: Math.random() * 80 + 10,
          left: Math.random() * 80 + 10,
          isRare,
          emoji: isRare ? rareEmoji : itemEmojis[Math.floor(Math.random() * itemEmojis.length)]
        };

        // Auto-remove item after lifespan
        setTimeout(() => {
          setItems(p => p.filter(i => i.id !== newItem.id));
        }, itemLifespan);

        return [...prev, newItem];
      });
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, itemLifespan, level, itemEmojis, rareEmoji]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gameActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnetPos({ x, y });

    // Check collision with items
    setItems(prev => {
      const remaining = prev.filter(item => {
        const dist = Math.sqrt(Math.pow(item.left - x, 2) + Math.pow(item.top - y, 2));
        if (dist < 10) {
          if (item.isRare) setIsRareFound(true);
          setCollected(c => c + (item.isRare ? 5 : 1));
          if (navigator.vibrate) navigator.vibrate(item.isRare ? 50 : 10);
          return false;
        }
        return true;
      });
      return remaining;
    });
  };

  useEffect(() => {
    if (!gameActive) {
      let multiplier = 0.5;
      if (collected >= targetScore) multiplier = 3.5;
      else if (collected >= targetScore * 0.6) multiplier = 2.0;
      else if (collected >= targetScore * 0.3) multiplier = 1.0;

      onComplete({ multiplier, isRare: isRareFound });
    }
  }, [gameActive, collected, targetScore, onComplete, isRareFound]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none z-[100]"
    >
      <div className="absolute top-12 text-center w-full z-20">
        <h2 className="text-3xl font-black text-slate-400 italic tracking-tighter uppercase">MAGNETIC SWEEP <span className="text-white text-xs">L{level}</span></h2>
        <div className="mt-2 text-emerald-400 font-mono font-black text-2xl">{scoreLabel}: {collected}</div>
      </div>

      <div className="relative w-full h-full bg-slate-950 overflow-hidden">
        {/* Magnet Visual */}
        <motion.div
          className="absolute w-20 h-20 flex items-center justify-center text-5xl z-30 pointer-events-none drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          animate={{ left: `${magnetPos.x}%`, top: `${magnetPos.y}%` }}
          transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {icon}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -inset-4 border-2 border-red-500/50 rounded-full"
          />
        </motion.div>

        {/* Items */}
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-12 h-12 flex items-center justify-center text-3xl z-10"
              style={{ top: `${item.top}%`, left: `${item.left}%`, transform: 'translate(-50%, -50%)' }}
            >
              {item.emoji}
              {item.isRare && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute inset-0 bg-yellow-400/20 rounded-full"
                  />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[300px] px-8 z-20">
          <div className="flex justify-between items-end mb-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">BATTERY</span>
              <span className="text-white font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
             <motion.div
                className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                animate={{ width: `${(timeLeft / 10) * 100}%` }}
             />
          </div>
          {isRareFound && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-4 text-center text-yellow-400 font-black text-[10px] uppercase tracking-[0.3em]"
              >
                  ✨ {rareLabel} ✨
              </motion.div>
          )}
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
    </div>
  );
};
