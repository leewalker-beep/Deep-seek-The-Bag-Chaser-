import React, { useState, useRef } from 'react';
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
}

export const MagneticSweep: React.FC<MagneticSweepProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [rareFound, setRareFound] = useState(false);
  const [lastTime, setLastTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine outcome at start to sync visual feedback with final payout
  const [outcome] = useState(() => {
    const rand = Math.random();
    if (rand < 0.10) return 'RARE';
    if (rand < 0.60) return 'WIN';
    return 'LOSS';
  });

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setCurrentX(x);
    setLastTime(Date.now());
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const now = Date.now();
    const dt = now - lastTime;

    if (dt > 0) {
      const dx = Math.abs(x - currentX);
      const v = dx / dt;
      setVelocity(prev => (prev * 0.8) + (v * 0.2));
    }

    setCurrentX(x);
    setLastTime(now);

    // Rare metal visual trigger (only if outcome is RARE)
    if (outcome === 'RARE' && !rareFound && Math.random() < 0.05) {
      setRareFound(true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    let speedMult: number;
    if (velocity < 1) speedMult = 0.5;
    else if (velocity > 4) speedMult = 2.0;
    else speedMult = 1.0 + ((velocity - 1) / 3);
    speedMult = Math.min(2.0, Math.max(0.5, speedMult));

    let outcomeMult: number;
    let isRare = false;
    let isSuccess = true;

    if (outcome === 'RARE') {
      outcomeMult = 5.0;
      isRare = true;
    } else if (outcome === 'WIN') {
      outcomeMult = 1.5;
    } else {
      outcomeMult = 0.3;
      isSuccess = false;
    }

    const finalMultiplier = outcomeMult * speedMult;

    onComplete({
      multiplier: finalMultiplier,
      isRare,
      speedMult,
      outcomeMult,
      isSuccess
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center touch-none select-none overflow-hidden"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* Gold Flash Effect when rare found */}
      <AnimatePresence>
        {rareFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-500 pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className="absolute top-12 text-center px-6 z-10 w-full">
        <h2 className="text-3xl font-black text-slate-100 mb-2 italic tracking-tighter">MAGNETIC SWEEP</h2>
        <div className="flex items-center justify-center gap-4">
          <motion.span animate={{ x: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 2 }} className="text-cyan-500">←</motion.span>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Drag magnet to collect scrap!</p>
          <motion.span animate={{ x: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 2 }} className="text-cyan-500">→</motion.span>
        </div>
      </div>

      {/* Visual Magnet/Scanner */}
      <motion.div
        className="w-40 h-40 border-4 rounded-full flex items-center justify-center relative z-10"
        style={{ x: currentX - (window.innerWidth / 2) }}
        animate={{
          scale: isDragging ? 1.2 : 1,
          borderColor: rareFound ? '#fbbf24' : isDragging ? '#22d3ee' : '#0891b2',
          boxShadow: rareFound
            ? '0 0 60px rgba(251,191,36,0.8), inset 0 0 20px rgba(251,191,36,0.4)'
            : isDragging ? '0 0 40px rgba(34,211,238,0.4)' : '0 0 20px rgba(8,145,178,0.2)'
        }}
      >
        <div className="text-6xl">🧲</div>
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              className="absolute inset-[-20px] rounded-full border-2 border-dashed border-cyan-400/30"
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Speed Indicator */}
      <div className="absolute bottom-24 w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"
          animate={{ width: `${Math.min(100, (velocity / 6) * 100)}%` }}
        />
      </div>
      <p className="absolute bottom-16 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] z-10">
        SCAN SPEED: <span className={velocity > 4 ? 'text-amber-400' : velocity > 1 ? 'text-emerald-400' : 'text-blue-400'}>
          {velocity > 4 ? 'MAXIMUM' : velocity > 1 ? 'OPTIMAL' : 'SLOW'}
        </span>
      </p>

      {rareFound && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: [1, 1.1, 1], y: 0 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute top-1/4 text-amber-400 text-4xl font-black italic drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10 text-center px-4"
        >
          💎 RARE METAL!
        </motion.div>
      )}
    </div>
  );
};
