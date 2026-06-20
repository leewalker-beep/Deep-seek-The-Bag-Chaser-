import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StruggleMashProps {
  onComplete: (multiplier: number) => void; level?: number;
  title?: string;
  instruction?: string;
}

export const StruggleMash: React.FC<StruggleMashProps> = ({
  onComplete,
  title = "THE STRUGGLE",
  instruction = "Mash to survive the grind"
}) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<'tap' | null>(null);

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
    setFeedback('tap');
    setTimeout(() => setFeedback(null), 50);
    if (navigator.vibrate) navigator.vibrate(20);
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
    <div className={`transition-colors duration-100 p-8 rounded-3xl border-4 shadow-2xl text-center ${feedback ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-zinc-800'}`}>
      <h2 className="text-2xl font-black text-zinc-400 mb-2 uppercase tracking-tighter italic">{title}</h2>
      <div className="flex items-center justify-center gap-2 mb-6">
        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-emerald-500 text-xl">⚡</motion.span>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">{instruction}</p>
      </div>

      <div className="relative h-48 w-full bg-zinc-900 rounded-2xl border-2 border-zinc-800 overflow-hidden mb-6 flex items-end">
        <motion.div
          animate={{ height: `${progress}%` }}
          className={`w-full transition-colors duration-300 border-t-2 ${
            progress > 90 ? 'bg-emerald-500/60 border-emerald-400' :
            progress > 70 ? 'bg-emerald-700/50 border-emerald-500' :
            progress > 40 ? 'bg-zinc-700/40 border-zinc-500' :
            'bg-zinc-800/30 border-zinc-700'
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl font-black text-white/10">{Math.floor(progress)}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onPointerDown={handleMash}
          className={`py-6 rounded-2xl font-black text-3xl transition-all active:scale-90 touch-none ${
            isActive ? 'bg-zinc-100 text-zinc-950 border-b-8 border-zinc-400 shadow-xl' : 'bg-zinc-900 text-zinc-700'
          }`}
        >
          {isActive ? 'MASH!!!' : 'TIME UP'}
        </button>

        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <span className="text-zinc-600">TIME:</span>
            <span className={timeLeft < 3 ? 'text-red-500' : 'text-zinc-400'}>{timeLeft.toFixed(1)}s</span>
          </div>
          <span className={progress >= 90 ? 'text-emerald-500' : 'text-zinc-600'}>TARGET: 90%</span>
        </div>
      </div>
    </div>
  );
};
