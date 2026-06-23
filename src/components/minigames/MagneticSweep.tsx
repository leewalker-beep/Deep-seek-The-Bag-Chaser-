import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROGRESSION_ORDER } from '../../config/tiers';
import type { Tier } from '../../types/game';

interface MagneticSweepResult {
  multiplier: number;
  isRare: boolean;
  speedMult: number;
  outcomeMult: number;
  isSuccess: boolean;
}

interface ScrapItem {
  id: number;
  type: string;
  x: number;
  y: number;
  isRare: boolean;
}

interface MagneticSweepProps {
  onComplete: (result: MagneticSweepResult) => void;
  title?: string;
  instruction?: string;
  icon?: string;
  level?: number;
  tier?: Tier;
}

export const MagneticSweep: React.FC<MagneticSweepProps> = ({
  onComplete,
  title = "MAGNETIC SWEEP",
  instruction = "Drag magnet to collect scrap!",
  icon: _icon = "🧲",
  level = 1,
  tier = 'MUD'
}) => {
  const [items, setItems] = useState<ScrapItem[]>([]);
  const [score, setScore] = useState(0);
  const [rareCount, setRareCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [magnetPos, setMagnetPos] = useState({ x: 50, y: 80 });
  const magnetRef = useRef({ x: 50, y: 80 });
  const containerRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Difficulty scaling
  const tierIndex = PROGRESSION_ORDER.indexOf(tier);
  const spawnRate = Math.max(250, 1000 - (level - 1) * 150 - (tierIndex * 50));
  const itemLifespan = Math.max(600, 2000 - (level - 1) * 250 - (tierIndex * 100));
  const rareChance = 0.05 + tierIndex * 0.02;

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
      const isRare = Math.random() < rareChance;
      const newItem: ScrapItem = {
        id: nextId.current++,
        type: isRare ? '💎' : ['🔧', '⚙️', '🔩', '📎', '⛓️'][Math.floor(Math.random() * 5)],
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        isRare
      };
      setItems(prev => [...prev, newItem]);

      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== newItem.id));
      }, itemLifespan);
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, itemLifespan, rareChance]);

  // Handle magnet movement and collection
  useEffect(() => {
    if (!gameActive) return;

    const checkCollision = () => {
      const currentPos = magnetRef.current;
      setItems(prev => {
        const toCollect = prev.filter(item => {
          const dx = item.x - currentPos.x;
          const dy = item.y - currentPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 10; // Collection radius
        });

        if (toCollect.length > 0) {
          toCollect.forEach(item => {
            if (item.isRare) {
              setRareCount(r => r + 1);
              if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            } else {
              setScore(s => s + 1);
              if (navigator.vibrate) navigator.vibrate(20);
            }
          });
          return prev.filter(item => !toCollect.includes(item));
        }
        return prev;
      });
    };

    const collisionInterval = setInterval(checkCollision, 50);
    return () => clearInterval(collisionInterval);
  }, [gameActive]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gameActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newPos = { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
    setMagnetPos(newPos);
    magnetRef.current = newPos;
  };

  useEffect(() => {
    if (!gameActive) {
      const outcomeMult = score > 15 ? 2.0 : score > 8 ? 1.2 : 0.5;
      const rareBonus = rareCount * 2.0;
      const finalMultiplier = outcomeMult + rareBonus;

      onComplete({
        multiplier: finalMultiplier,
        isRare: rareCount > 0,
        speedMult: 1.0,
        outcomeMult: finalMultiplier,
        isSuccess: score > 5
      });
    }
  }, [gameActive, score, rareCount, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center touch-none select-none overflow-hidden p-6">
      <div className="absolute top-12 text-center px-6 z-10 w-full">
        <h2 className="text-3xl font-black text-slate-100 mb-2 italic tracking-tighter uppercase">{title} <span className="text-cyan-500">L{level}</span></h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{instruction}</p>
        <div className="flex justify-center gap-6 mt-4">
            <div className="text-emerald-400 font-mono font-black">SCRAP: {score}</div>
            <div className="text-amber-400 font-mono font-black">RARE: {rareCount}</div>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative w-full h-[400px] bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-2xl cursor-none"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        {/* Magnet */}
        <motion.div
          animate={{ x: `${magnetPos.x}%`, y: `${magnetPos.y}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="absolute w-16 h-16 -ml-8 -mt-8 flex items-center justify-center text-5xl z-40 pointer-events-none"
        >
          🧲
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-cyan-500 rounded-full blur-xl -z-10"
          />
        </motion.div>

        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute text-5xl z-20"
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                {item.type}
                {item.isRare && (
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute inset-0 bg-amber-400 rounded-full blur-xl"
                    />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Scan line effect */}
        <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 pointer-events-none"
        />
      </div>

      <div className="mt-8 w-full max-w-[300px]">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SCANNING...</span>
            <span className="text-cyan-500 font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
                className="h-full bg-cyan-500"
                animate={{ width: `${(timeLeft / 10) * 100}%` }}
            />
        </div>
      </div>
    </div>
  );
};
