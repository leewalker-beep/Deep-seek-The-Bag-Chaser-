import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HoldHypeProps {
  onComplete: (multiplier: number) => void; level?: number;
  title?: string;
  instruction?: string;
}

export const HoldHype: React.FC<HoldHypeProps> = ({
  onComplete,
  title = "BUILD HYPE",
  instruction = "Hold for exactly 2.0 seconds"
}) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHolding = () => {
    if (feedback) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.min(100, (elapsed / 3000) * 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        handleRelease(3000);
      }
    }, 20);
  };

  const handleRelease = (forcedElapsed?: number) => {
    if (!isHolding && !forcedElapsed) return;

    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = forcedElapsed || (Date.now() - (startTimeRef.current || 0));
    setIsHolding(false);

    // Target is exactly 2000ms (2 seconds)
    const diff = Math.abs(2000 - elapsed);
    let multiplier = 0.5;

    if (diff <= 50) {
      multiplier = 4.0;
      setFeedback('success');
      if (navigator.vibrate) navigator.vibrate(100);
    } else if (diff <= 100) {
      multiplier = 2.5;
      setFeedback('success');
      if (navigator.vibrate) navigator.vibrate(50);
    } else if (diff <= 300) {
      multiplier = 1.5;
      setFeedback('success');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setFeedback('fail');
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }

    setTimeout(() => onComplete(multiplier), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`transition-colors duration-300 bg-slate-900 p-8 rounded-3xl border-2 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative ${
      feedback === 'success' ? 'border-emerald-500 bg-emerald-950/20' :
      feedback === 'fail' ? 'border-red-500 bg-red-950/20' :
      'border-slate-800'
    }`}>
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-4 tracking-widest">
        {title}
      </div>

      <div className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-tighter">
        {instruction}
      </div>

      <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden mb-8 border border-slate-700 relative">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-2 bg-emerald-500/40 z-0" style={{ marginLeft: '33%' }} /> {/* 2s is 66% of 3s */}
        </div>
        <motion.div
          className={`h-full z-10 transition-colors duration-200 ${
            progress > 60 && progress < 73 ? 'bg-emerald-500' :
            progress > 90 ? 'bg-red-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-black mb-4 ${feedback === 'success' ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {feedback === 'success' ? 'PERFECT TIMING!' : 'OFF BEAT!'}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onPointerDown={startHolding}
        onPointerUp={() => handleRelease()}
        onPointerLeave={() => isHolding && handleRelease()}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl transition-all active:scale-90 border-4 ${
          isHolding ? 'bg-emerald-500 border-emerald-400 scale-110' :
          feedback ? 'bg-slate-800 border-slate-700 grayscale' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
        }`}
      >
        <span className={isHolding ? 'animate-bounce' : ''}>🔥</span>
        <span className="text-[10px] font-black uppercase mt-1">{isHolding ? 'RELEASING...' : 'HOLD'}</span>
      </button>

      <div className="mt-6 text-[10px] text-orange-400 font-mono font-bold animate-pulse">
        PERFECT RELEASE = 2X YIELD
      </div>
    </div>
  );
};
