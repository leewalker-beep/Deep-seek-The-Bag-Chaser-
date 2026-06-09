import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface MagneticSweepProps {
  onComplete: (multiplier: number, isRare: boolean) => void;
}

export const MagneticSweep: React.FC<MagneticSweepProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentX, setCurrentX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [rareFound, setRareFound] = useState(false);
  const [lastTime, setLastTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Rare metal chance (5% during sweep)
    if (!rareFound && Math.random() < 0.001) {
      setRareFound(true);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Calculate speed multiplier: slow=0.5x, medium=1.0x, fast=2.0x
    // v is px/ms. Let's say 0.5 is slow, 2 is medium, 5+ is fast
    let multiplier = 1.0;
    if (velocity < 1) multiplier = 0.5;
    else if (velocity > 4) multiplier = 2.0;
    else multiplier = 1.0 + (velocity - 1) / 3;

    multiplier = Math.min(2.0, Math.max(0.5, multiplier));

    // Rare metal logic
    const finalRare = rareFound || Math.random() < 0.05;

    onComplete(multiplier, finalRare);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center touch-none select-none"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="absolute top-12 text-center px-6">
        <h2 className="text-3xl font-black text-slate-100 mb-2">MAGNETIC SWEEP</h2>
        <p className="text-slate-400">Drag your magnet across the scrap yard!</p>
      </div>

      {/* Visual Magnet/Scanner */}
      <motion.div
        className="w-32 h-32 border-4 border-cyan-500 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.5)]"
        style={{ x: currentX - (window.innerWidth / 2) }}
        animate={{
          scale: isDragging ? 1.2 : 1,
          borderColor: rareFound ? '#fbbf24' : '#06b6d4',
          boxShadow: rareFound ? '0 0 50px rgba(251,191,36,0.8)' : '0 0 30px rgba(6,182,212,0.5)'
        }}
      >
        <div className="text-5xl">🧲</div>
        {isDragging && (
          <motion.div
            className="absolute inset-[-20px] rounded-full border-2 border-dashed border-cyan-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Speed Indicator */}
      <div className="absolute bottom-24 w-64 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
          style={{ width: `${Math.min(100, (velocity / 6) * 100)}%` }}
        />
      </div>
      <p className="absolute bottom-16 text-slate-500 font-bold uppercase tracking-widest text-xs">
        Collection Speed: {velocity > 4 ? 'MAX' : velocity > 1 ? 'OPTIMAL' : 'SLOW'}
      </p>

      {rareFound && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/3 text-amber-400 text-4xl font-black italic drop-shadow-lg"
        >
          RARE METAL DETECTED!
        </motion.div>
      )}
    </div>
  );
};
