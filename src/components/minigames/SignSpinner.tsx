import React, { useState, useEffect } from 'react';

export const SignSpinner: React.FC<{ level: number; onComplete: (win: boolean) => void }> = ({ level, onComplete }) => {
  const [balance, setBalance] = useState(50);
  const [ticksLeft, setTicksLeft] = useState(40);

  useEffect(() => {
    const loop = setInterval(() => {
      const windDrift = (Math.random() - 0.5) * (4 + level * 3);
      setBalance(b => Math.min(100, Math.max(0, b + windDrift)));
      setTicksLeft(t => t - 1);
    }, 150);
    return () => clearInterval(loop);
  }, [level]);

  useEffect(() => {
    if (balance <= 10 || balance >= 90) { onComplete(false); return; }
    if (ticksLeft <= 0) onComplete(true);
  }, [balance, ticksLeft]);

  return (
    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 text-center text-white font-mono text-xs select-none">
      <div className="w-full flex justify-between text-[9px] text-zinc-500">
        <span>💃 HUMAN BILLBOARD LOGS</span>
        <span>STAMINA: {ticksLeft} TICKS</span>
      </div>
      <p className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider">Keep the sign centered!</p>
      <div className="w-full bg-zinc-800 h-6 rounded-full relative overflow-hidden border border-zinc-700">
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/60 left-[15%]" />
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/60 right-[15%]" />
        <div className="absolute h-full w-6 bg-orange-500 rounded-full flex items-center justify-center text-xs transition-all duration-75 shadow-glow" style={{ left: `${balance}%`, transform: 'translateX(-50%)' }}>🪧</div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button onClick={() => setBalance(b => Math.max(0, b - 12))} className="p-2 bg-zinc-900 border border-zinc-800 rounded font-black text-amber-400 active:scale-95">◀ LEAN LEFT</button>
        <button onClick={() => setBalance(b => Math.min(100, b + 12))} className="p-2 bg-zinc-900 border border-zinc-800 rounded font-black text-amber-400 active:scale-95">LEAN RIGHT ▶</button>
      </div>
    </div>
  );
};
