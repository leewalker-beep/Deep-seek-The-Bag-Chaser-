import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StruggleMashProps {
  onComplete: (multiplier: number) => void;
}

export const StruggleMash: React.FC<StruggleMashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setIsActive(false);
          return 0;
        }
        return prev - 0.1;
      });

      // Decay progress
      setProgress(prev => Math.max(0, prev - 1.5));
    }, 100);

    return () => clearInterval(timer);
  }, [isActive]);

  const handleMash = () => {
    if (!isActive) return;
    setProgress(prev => Math.min(100, prev + 6));
  };

  useEffect(() => {
    if (!isActive) {
      let multiplier = 0.5;
      if (progress > 90) multiplier = 3.0;
      else if (progress > 70) multiplier = 2.0;
      else if (progress > 40) multiplier = 1.0;
      else if (progress > 20) multiplier = 0.7;

      const timeout = setTimeout(() => onComplete(multiplier), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, progress, onComplete]);

  return (
    <div className="bg-zinc-950 p-8 rounded-3xl border-4 border-zinc-800 shadow-2xl text-center">
      <h2 className="text-2xl font-black text-zinc-400 mb-2 uppercase tracking-tighter">The Struggle</h2>
      <p className="text-[10px] text-zinc-600 mb-6 uppercase tracking-widest">Mash to survive the grind</p>

      <div className="relative h-48 w-full bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden mb-6 flex items-end">
        <motion.div
          animate={{ height: `${progress}%` }}
          className="w-full bg-emerald-900/50 border-t-2 border-emerald-500"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl font-black text-white/10">{Math.floor(progress)}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onPointerDown={handleMash}
          className={`py-6 rounded-2xl font-black text-2xl transition-all active:scale-95 touch-none ${
            isActive ? 'bg-zinc-800 text-white border-b-4 border-zinc-900' : 'bg-zinc-900 text-zinc-700'
          }`}
        >
          {isActive ? 'MASH!!!' : 'TIME UP'}
        </button>

        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
          <span>Time: {timeLeft.toFixed(1)}s</span>
          <span>Target: 90% for Max Yield</span>
        </div>
      </div>
    </div>
  );
};
