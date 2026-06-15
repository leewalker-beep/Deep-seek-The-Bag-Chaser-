import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlasmaDonationProps {
  onComplete: (multiplier: number) => void;
}

export const PlasmaDonation: React.FC<PlasmaDonationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);
  const timerRef = useRef<number | null>(null);

  const startHolding = () => {
    if (!gameActive) return;
    setIsHolding(true);
    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
            handleRelease(100);
            return 100;
        }
        return prev + 1;
      });
    }, 30);
  };

  const handleRelease = (finalProgress?: number) => {
    if (!isHolding && finalProgress === undefined) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsHolding(false);
    setGameActive(false);

    const actualProgress = finalProgress !== undefined ? finalProgress : progress;

    // Sweet spot is 80-90
    let multiplier = 0.5;
    if (actualProgress >= 80 && actualProgress <= 90) {
      multiplier = 3.0;
      setFeedback('success');
    } else {
      setFeedback('fail');
      if (actualProgress >= 60 && actualProgress <= 95) multiplier = 1.5;
      else if (actualProgress >= 40 && actualProgress <= 98) multiplier = 1.0;
    }

    if (navigator.vibrate) navigator.vibrate(actualProgress >= 80 && actualProgress <= 90 ? 100 : 50);
    setTimeout(() => onComplete(multiplier), 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`transition-colors duration-300 p-8 rounded-3xl border-4 shadow-2xl text-center max-w-sm w-full mx-auto flex flex-col items-center ${
      feedback === 'success' ? 'bg-emerald-950/40 border-emerald-500' :
      feedback === 'fail' ? 'bg-red-950/40 border-red-900/50' :
      'bg-red-950/20 border-red-900/50'
    }`}>
      <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tighter italic">PLASMA DONATION</h2>
      <p className="text-[10px] text-red-700 mb-8 uppercase tracking-widest font-bold">Hold to fill, release in the ZONE</p>

      <div className="relative w-24 h-64 bg-slate-900 rounded-full border-4 border-slate-800 p-1 mb-8 overflow-hidden">
        {/* Sweet Spot Zone */}
        <div className="absolute bottom-[80%] top-[10%] left-0 right-0 bg-emerald-500/20 border-y-2 border-emerald-500/50 z-0">
          <div className="absolute inset-0 flex items-center justify-center opacity-30 text-[10px] font-black text-emerald-500">ZONE</div>
        </div>

        {/* Progress Fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          className={`absolute bottom-0 left-0 right-0 rounded-b-full z-10 transition-colors duration-200 ${
            progress >= 80 && progress <= 90 ? 'bg-emerald-500' : 'bg-gradient-to-t from-red-800 to-red-500'
          }`}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="text-2xl font-black text-white/20">{Math.floor(progress)}%</span>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-black text-2xl mb-4 ${feedback === 'success' ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {feedback === 'success' ? 'PERFECT!' : 'MISSED!'}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onPointerDown={startHolding}
        onPointerUp={() => handleRelease()}
        disabled={!gameActive}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90 touch-none border-4 ${
          !gameActive ? 'bg-slate-900 border-slate-800 text-slate-700' :
          isHolding ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-red-900 border-red-800 text-red-100'
        }`}
      >
        <span className="text-4xl mb-1">🩸</span>
        <span className="text-[10px] font-black uppercase tracking-tighter">{isHolding ? 'DONATING...' : 'HOLD'}</span>
      </button>

      <div className="mt-8 text-[10px] text-emerald-500 font-bold uppercase tracking-widest animate-bounce">
        TARGET: 80% - 90%
      </div>
    </div>
  );
};
