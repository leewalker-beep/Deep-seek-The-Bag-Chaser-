import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SimpleFallbackProps {
  name: string;
  onComplete: (multiplier: number) => void;
}

export const SimpleFallback: React.FC<SimpleFallbackProps> = ({ name, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(1.0);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl max-w-sm mx-auto">
      <motion.div
        animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-6xl mb-6 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
      >
          🛠️
      </motion.div>

      <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest italic">{name}</h2>
      <div className="h-1 w-20 bg-emerald-500 mb-6 rounded-full" />

      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center leading-relaxed mb-8">
        This hustle environment is<br/>
        <span className="text-white">UNDER CONSTRUCTION</span>
      </p>

      <div className="w-full bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 mb-8 flex items-center justify-center gap-3">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">AUTO-INITIATE IN</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{timeLeft}s</div>
      </div>

      <button
        onClick={() => {
            if (navigator.vibrate) navigator.vibrate(20);
            onComplete(1.0);
        }}
        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)] border-b-4 border-emerald-800 uppercase tracking-tighter"
      >
        SKIP TO RESULTS (1.0x)
      </button>

      <p className="mt-6 text-[8px] text-slate-600 uppercase font-black tracking-widest text-center">
          Bag Chaser Engine V2 • Beta Minigame Module
      </p>
    </div>
  );
};
