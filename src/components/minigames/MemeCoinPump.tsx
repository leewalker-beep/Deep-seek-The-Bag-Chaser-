import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MemeCoinPumpProps {
  onComplete: (multiplier: number) => void;
}

export const MemeCoinPump: React.FC<MemeCoinPumpProps> = ({ onComplete }) => {
  const [value, setValue] = useState(1.0);
  const [isDumping, setIsDumping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const lastShake = useRef(0);

  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const total = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);

      if (total > 20 && Date.now() - lastShake.current > 100) {
        lastShake.current = Date.now();
        setValue(prev => prev + 0.1);
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    // Fallback for desktop: Mouse movement
    const handleMouse = () => {
      setValue(prev => prev + 0.05);
    };
    window.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 || isDumping) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleDump();
          return 0;
        }
        return prev - 0.1;
      });
      // Natural decay
      setValue(prev => Math.max(0.1, prev - 0.02));
    }, 100);
    return () => clearInterval(timer);
  }, [timeLeft, isDumping]);

  const handleDump = () => {
    if (isDumping) return;
    setIsDumping(true);

    let multiplier = value;
    // Cap and scale multiplier
    if (multiplier > 5) multiplier = 5;
    if (multiplier < 0.5) multiplier = 0.5;

    setTimeout(() => onComplete(multiplier), 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center pointer-events-none">
        <h2 className="text-3xl font-black text-slate-100 italic tracking-tighter">MEME COIN PUMP</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Shake to pump the coin!</p>
      </div>

      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{
            scale: 1 + (value * 0.1),
            rotate: isDumping ? [0, 10, -10, 0] : 0
          }}
          className="text-[120px] mb-4"
        >
          🪙
        </motion.div>

        <div className="text-4xl font-black text-emerald-400 font-mono italic">
          ${value.toFixed(2)}
        </div>
        <div className="text-[10px] text-slate-500 uppercase font-bold mt-2">Current Market Value</div>
      </div>

      <div className="w-full max-w-xs mt-12 space-y-4">
        <button
          onClick={handleDump}
          disabled={isDumping}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-95 disabled:opacity-50"
        >
          DUMP THE BAG
        </button>
      </div>

      <div className="absolute bottom-12 text-slate-500 font-bold uppercase text-[10px]">
        RUG PULL IN: {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};
