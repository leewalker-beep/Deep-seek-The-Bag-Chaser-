import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MagneticSweepResult {
  multiplier: number;
  isRare: boolean;
  speedMult: number;
  outcomeMult: number;
  isSuccess: boolean;
}

interface MagneticSweepProps {
  onComplete: (result: MagneticSweepResult) => void;
  title?: string;
  instruction?: string;
  icon?: string;
}

export const MagneticSweep: React.FC<MagneticSweepProps> = ({
  onComplete,
  title = "MAGNETIC SWEEP",
  instruction = "Move magnet to collect scrap!",
  icon = "🧲"
}) => {
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: string; isRare: boolean }[]>([]);
  const [collected, setScore] = useState(0);
  const [rareCollected, setRareCollected] = useState(0);
  const [currentX, setCurrentX] = useState(50); // 0-100%
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'collect' | 'rare' | null>(null);

  const nextId = useRef(0);
  const SCRAP_TYPES = ['🔩', '⚙️', '🖇️', '⛓️', '🔧'];
  const RARE_TYPES = ['💎', '💍', '🏆'];

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
      const isRare = Math.random() < 0.1;
      setItems(prev => [...prev, {
        id: nextId.current++,
        x: Math.random() * 80 + 10,
        y: -10,
        type: isRare ? RARE_TYPES[Math.floor(Math.random() * RARE_TYPES.length)] : SCRAP_TYPES[Math.floor(Math.random() * SCRAP_TYPES.length)],
        isRare
      }]);
    }, 600);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;

    const movement = setInterval(() => {
      setItems(prev => {
        const next = prev.map(item => ({ ...item, y: item.y + 2.5 }));

        // Collision detection with magnet at bottom
        // Magnet is at bottom-ish, width approx 20%
        const caught = next.filter(item => {
            const dx = Math.abs(item.x - currentX);
            return item.y > 75 && item.y < 90 && dx < 10;
        });

        if (caught.length > 0) {
            caught.forEach(item => {
                if (item.isRare) {
                    setRareCollected(r => r + 1);
                    setFeedback('rare');
                    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                } else {
                    setScore(s => s + 1);
                    setFeedback('collect');
                    if (navigator.vibrate) navigator.vibrate(10);
                }
            });
            setTimeout(() => setFeedback(null), 200);
        }

        return next.filter(item => item.y <= 100 && !caught.find(c => c.id === item.id));
      });
    }, 40);

    return () => clearInterval(movement);
  }, [gameActive, currentX]);

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!gameActive) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = (x / window.innerWidth) * 100;
    setCurrentX(Math.max(10, Math.min(90, percent)));
  };

  useEffect(() => {
    if (!gameActive) {
      const isRare = rareCollected > 0;
      const outcomeMult = collected >= 15 ? 3.0 : collected >= 8 ? 1.5 : 0.6;
      const rareBonus = 1 + (rareCollected * 2);

      onComplete({
        multiplier: outcomeMult * rareBonus,
        isRare,
        speedMult: 1.0,
        outcomeMult,
        isSuccess: collected >= 8
      });
    }
  }, [gameActive, collected, rareCollected, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-colors duration-300 flex flex-col items-center justify-center touch-none select-none overflow-hidden ${
          feedback === 'rare' ? 'bg-amber-950/40' : feedback === 'collect' ? 'bg-emerald-950/20' : 'bg-slate-950'
      }`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute top-12 text-center px-6 z-10 w-full">
        <h2 className="text-3xl font-black text-slate-100 mb-2 italic tracking-tighter uppercase">{title}</h2>
        <div className="flex items-center justify-center gap-4">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{instruction}</p>
        </div>
        <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
                <div className="text-[10px] text-slate-500 font-black uppercase">COLLECTED</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{collected}</div>
            </div>
            {rareCollected > 0 && (
                <div className="text-center animate-bounce">
                    <div className="text-[10px] text-amber-500 font-black uppercase">RARE FOUND</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">{rareCollected}</div>
                </div>
            )}
        </div>
      </div>

      <div className="relative w-full h-full">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                  scale: 1,
                  opacity: 1,
                  y: `${item.y}%`,
                  x: `${item.x}%`,
                  rotate: item.y * 2
              }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute text-4xl filter ${item.isRare ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]' : ''}`}
              style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
            >
              {item.type}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* The Magnet */}
        <motion.div
            className="absolute bottom-10 w-24 h-24 border-4 rounded-3xl flex items-center justify-center transition-colors"
            style={{ left: `${currentX}%`, transform: 'translateX(-50%)' }}
            animate={{
                borderColor: feedback === 'rare' ? '#fbbf24' : '#22d3ee',
                boxShadow: feedback === 'rare'
                    ? '0 0 40px rgba(251,191,36,0.6)'
                    : '0 0 20px rgba(34,211,238,0.3)',
                scale: feedback ? 1.2 : 1
            }}
        >
            <div className="text-5xl">{icon}</div>
            <div className="absolute -top-4 w-full h-4 bg-gradient-to-t from-cyan-500/20 to-transparent blur-sm" />
        </motion.div>
      </div>

      <div className="absolute bottom-12 w-full max-w-[280px] px-6">
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <motion.div
                className="h-full bg-cyan-500"
                animate={{ width: `${(timeLeft / 15) * 100}%` }}
            />
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[200] p-8 text-center"
          >
            <div className="text-8xl mb-6">{rareCollected > 0 ? '💎' : '🔩'}</div>
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">SWEEP COMPLETE</h3>
            <div className="text-emerald-400 font-black font-mono text-2xl mt-4">{collected} UNITS SALVAGED</div>
            {rareCollected > 0 && <div className="text-amber-400 font-black text-sm uppercase mt-2">+{rareCollected} RARE ITEMS FOUND</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
