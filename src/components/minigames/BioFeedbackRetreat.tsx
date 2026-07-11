import React, { useState, useEffect } from 'react';

export const BioFeedbackRetreat: React.FC<{ level: number; onComplete: (healAmount: number) => void }> = ({ level, onComplete }) => {
  const [dripRate, setDripRate] = useState(50);
  const [detoxProgress, setDetoxProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);

  // Static configuration bounds for the emerald target matrix zone
  const targetMin = 40;
  const targetMax = 60;

  useEffect(() => {
    // Simulated physiological heart-rate/cortisol drift
    const drift = setInterval(() => {
      setDripRate(d => Math.max(0, Math.min(100, d + (Math.random() * 12 - 6))));
    }, 150);
    return () => clearInterval(drift);
  }, []);

  useEffect(() => {
    const ticker = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(ticker);
          // Callback calculates the baseline health recovery pool
          onComplete(Math.min(100, Math.floor(detoxProgress * 1.5)));
          return 0;
        }
        return t - 0.1;
      });

      // Accumulate progress exclusively if player stays within target zone bounds
      setDripRate(currentRate => {
        if (currentRate >= targetMin && currentRate <= targetMax) {
          setDetoxProgress(p => Math.min(100, p + 2));
        }
        return currentRate;
      });
    }, 100);

    return () => clearInterval(ticker);
  }, [timeLeft, detoxProgress, onComplete]);

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-white select-none text-xs space-y-4 text-left">
      <div className="flex justify-between text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
        <span>🧪 EXECUTIVE CELLULAR DETOX L{level}</span>
        <span>CORTISOL FLUSH: {detoxProgress}%</span>
        <span>{timeLeft.toFixed(1)}s</span>
      </div>

      {/* Biometric Slider Matrix Track */}
      <div className="relative w-full h-8 bg-zinc-900 border border-zinc-850 rounded-lg overflow-hidden flex items-center">
        {/* Target Emerald Area Layer */}
        <div
          className="absolute h-full bg-emerald-500/25 border-x border-emerald-400/40"
          style={{ left: `${targetMin}%`, width: `${targetMax - targetMin}%` }}
        />
        {/* Dynamic Player Indicator Pulse */}
        <div
          className="absolute w-1 h-full bg-emerald-400 shadow-[0_0_8px_#34d399] transition-all duration-75"
          style={{ left: `${dripRate}%` }}
        />
      </div>

      {/* Manual Valve Regulators */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setDripRate(d => Math.max(0, d - 8))}
          className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold tracking-wide uppercase active:scale-95 text-zinc-300 hover:border-emerald-500/30 transition-all"
        >
          ⬇ INFUSION PRESSURE
        </button>
        <button
          onClick={() => setDripRate(d => Math.min(100, d + 8))}
          className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold tracking-wide uppercase active:scale-95 text-zinc-300 hover:border-emerald-500/30 transition-all"
        >
          ⬆ OXYGEN FLOW
        </button>
      </div>
      <p className="text-[8px] text-zinc-600 text-center uppercase tracking-widest">Regulate metabolic flow. Maintain systemic alignment within the emerald bounds.</p>
    </div>
  );
};
