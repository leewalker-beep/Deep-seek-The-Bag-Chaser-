import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

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
      console.log("💎 RARE METAL DISCOVERED!");
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Speed multiplier: 0.5x to 2.0x
    let speedMult = 1.0;
    if (velocity < 1) speedMult = 0.5;
    else if (velocity > 4) speedMult = 2.0;
    else speedMult = 1.0 + (velocity - 1) / 3;
    speedMult = Math.min(2.0, Math.max(0.5, speedMult));

    // Payout based on pre-determined outcome
    let outcomeMult = 0.75;
    let isRare = false;
    let isSuccess = true;

    if (outcome === 'RARE') {
      outcomeMult = 30.0;
      isRare = true;
    } else if (outcome === 'WIN') {
      outcomeMult = 0.75;
    } else {
      outcomeMult = -0.05;
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
      {rareFound && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-500/10 pointer-events-none z-0"
        />
      )}

      <div className="absolute top-12 text-center px-6 z-10">
        <h2 className="text-3xl font-black text-slate-100 mb-2 italic tracking-tighter">MAGNETIC SWEEP</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Drag your magnet across the yard!</p>
      </div>

      {/* Visual Magnet/Scanner */}
      <motion.div
        className="w-40 h-40 border-4 border-cyan-500 rounded-full flex items-center justify-center relative z-10"
        style={{ x: currentX - (window.innerWidth / 2) }}
        animate={{
          scale: isDragging ? 1.2 : 1,
          borderColor: rareFound ? '#fbbf24' : '#06b6d4',
          boxShadow: rareFound
            ? '0 0 60px rgba(251,191,36,0.8), inset 0 0 20px rgba(251,191,36,0.4)'
            : '0 0 30px rgba(6,182,212,0.5)'
        }}
      >
        <div className="text-6xl">🧲</div>
        {isDragging && (
          <motion.div
            className="absolute inset-[-20px] rounded-full border-2 border-dashed border-cyan-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Speed Indicator */}
      <div className="absolute bottom-24 w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"
          style={{ width: `${Math.min(100, (velocity / 6) * 100)}%` }}
        />
      </div>
      <p className="absolute bottom-16 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] z-10">
        Collection Speed: <span className={velocity > 4 ? 'text-amber-400' : velocity > 1 ? 'text-emerald-400' : 'text-blue-400'}>
          {velocity > 4 ? 'MAXIMUM' : velocity > 1 ? 'OPTIMAL' : 'SLOW'}
        </span>
      </p>

      {rareFound && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute top-1/4 text-amber-400 text-4xl font-black italic drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10 text-center px-4"
        >
          💎 RARE METAL DETECTED!
        </motion.div>
      )}
    </div>
  );
};
