import React, { useEffect, useState } from 'react';

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
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-2xl border-2 border-slate-800 animate-in zoom-in duration-300">
      <div className="text-4xl mb-4 animate-bounce">⚡</div>
      <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">{name}</h2>
      <p className="text-slate-400 text-sm text-center mb-6">
        Minigame in development...<br/>
        Auto-completing in <span className="text-emerald-400 font-mono font-bold">{timeLeft}s</span>
      </p>

      <button
        onClick={() => onComplete(1.0)}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      >
        SKIP TO RESULTS (1.0x)
      </button>
    </div>
  );
};
