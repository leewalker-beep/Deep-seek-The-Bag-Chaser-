import React, { useState, useEffect } from 'react';

export const CrowdSurge: React.FC<{ level: number; onComplete: (score: number) => void }> = ({ level, onComplete }) => {
  // Level 1 = 2 rhythm pads, Level 2 = 3 rhythm pads, Level 3+ = 4 pads
  const padCount = level === 1 ? 2 : level === 2 ? 3 : 4;
  const [expectedNext, setExpectedNext] = useState(1);
  const [crowdEnergy, setCrowdEnergy] = useState(50);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(timer);
          // Return the accumulated payload metrics to the App container switch
          onComplete(Math.floor(crowdEnergy + streak * 0.5));
          return 0;
        }
        return t - 0.1;
      });
      // Natural passive decay factor scaling based on active level difficulty
      setCrowdEnergy(e => Math.max(0, e - (1.5 + level * 0.5)));
    }, 100);
    return () => clearInterval(timer);
  }, [crowdEnergy, streak, level, onComplete]);

  const handlePadTap = (padNum: number) => {
    if (padNum === expectedNext) {
      // Hit correct numerical pad in the active sequence array
      setCrowdEnergy(e => Math.min(100, e + 4));
      setStreak(s => s + 1);
      // Advance loop pointer: if max pad hit, cycle right back to pad 1
      setExpectedNext(curr => curr === padCount ? 1 : curr + 1);
    } else {
      // Out-of-sequence entry broken penalty layer
      setCrowdEnergy(e => Math.max(0, e - 12));
      setStreak(0);
      setExpectedNext(1); // Force sequence restart from step 1
    }
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-white text-xs flex flex-col justify-between h-80 select-none text-left">
      <div className="flex justify-between text-[9px] text-purple-400 font-bold uppercase tracking-wider">
        <span>🎪 LIVE SEQUENCE DECK L{level}</span>
        <span>STREAK: {streak} 🔥</span>
        <span>{timeLeft.toFixed(1)}s</span>
      </div>

      {/* Live Active Hype Monitor */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase">
          <span>Crowd Hype Gauge</span>
          <span className={crowdEnergy > 70 ? "text-emerald-400" : crowdEnergy > 30 ? "text-amber-400" : "text-red-500 animate-pulse"}>
            {crowdEnergy.toFixed(0)}% ENERGY
          </span>
        </div>
        <div className="w-full bg-zinc-900 h-2 rounded-full border border-zinc-850 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${crowdEnergy > 70 ? 'bg-purple-500' : 'bg-purple-600/60'}`}
            style={{ width: `${crowdEnergy}%` }}
          />
        </div>
      </div>

      {/* Target Active Step Prompt HUD */}
      <div className="text-center bg-zinc-900/40 p-2 rounded-lg border border-zinc-900 text-[10px]">
        TAP RUNNING LOOP: <span className="text-purple-400 font-black text-xs animate-pulse">PAD [{expectedNext}]</span> NEXT
      </div>

      {/* Sequential Multi-Pad Layout Interactive Grid */}
      <div className={`grid gap-2.5 my-2 ${padCount === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {Array.from({ length: padCount }).map((_, idx) => {
          const padNum = idx + 1;
          const isTarget = padNum === expectedNext;
          return (
            <button
              key={padNum}
              onClick={() => handlePadTap(padNum)}
              className={`p-4 rounded-xl text-center font-black transition-all text-sm active:scale-95 border ${
                isTarget
                  ? 'bg-purple-950/40 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)] text-purple-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {padNum}
            </button>
          );
        })}
      </div>
      <p className="text-[7px] text-center text-zinc-600 uppercase tracking-widest">Out of sequence manual entries break momentum and flush active score multipliers.</p>
    </div>
  );
};
