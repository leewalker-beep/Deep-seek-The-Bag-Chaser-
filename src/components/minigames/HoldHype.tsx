import React, { useState, useEffect, useRef } from 'react';

interface HoldHypeProps {
  onComplete: (multiplier: number) => void;
}

export const HoldHype: React.FC<HoldHypeProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHolding = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0);
      const newProgress = Math.min(100, (elapsed / 3000) * 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        // Automatically release if held too long
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
    // Perfect range: 1.8s (1800ms) to 2.2s (2200ms)
    let multiplier = 0.5;

    if (elapsed >= 1800 && elapsed <= 2200) {
      multiplier = 2.0;
    }

    onComplete(multiplier);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none h-64 flex flex-col justify-center items-center relative">
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-4">
        HOLD FOR EXACTLY 2 SECONDS TO BUILD HYPE
      </div>

      <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mb-8 border border-slate-700">
        <div
          className={`h-full transition-all duration-75 ${progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        onMouseDown={startHolding}
        onMouseUp={() => handleRelease()}
        onMouseLeave={() => isHolding && handleRelease()}
        onTouchStart={(e) => { e.preventDefault(); startHolding(); }}
        onTouchEnd={(e) => { e.preventDefault(); handleRelease(); }}
        className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all active:scale-90 ${isHolding ? 'bg-emerald-500 scale-110' : 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-700'}`}
      >
        🔥
      </button>

      <div className="mt-6 text-[10px] text-orange-400 font-mono">
        PERFECT RELEASE = 2X YIELD
      </div>
    </div>
  );
};
