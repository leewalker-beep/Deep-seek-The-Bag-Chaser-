import React, { useState, useEffect } from 'react';

export const ClickbaitGame: React.FC<{ level: number; onComplete: (success: boolean) => void }> = ({ level, onComplete }) => {
  const [gridSize, setGridSize] = useState(16);
  const [oddIndex, setOddIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(5);
  const targetsNeeded = 4 + level;

  const generateQuizLayout = () => {
    const dimensions = level === 1 ? 16 : level === 2 ? 36 : 64; // Grid scales with level
    setGridSize(dimensions);
    setOddIndex(Math.floor(Math.random() * dimensions));
    setTimer(level === 1 ? 4.5 : level === 2 ? 3.5 : 2.5);
  };

  useEffect(() => { generateQuizLayout(); }, []);

  useEffect(() => {
    if (timer <= 0) { onComplete(false); return; }
    const cd = setTimeout(() => setTimer(t => t - 0.1), 100);
    return () => clearTimeout(cd);
  }, [timer]);

  const handleGridTap = (clickedIdx: number) => {
    if (clickedIdx === oddIndex) {
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore >= targetsNeeded) onComplete(true); else generateQuizLayout();
    } else {
      onComplete(false);
    }
  };

  const getGridColsClass = () => level === 1 ? 'grid-cols-4' : level === 2 ? 'grid-cols-6' : 'grid-cols-8';

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col items-center space-y-3 select-none relative text-white">
      <div className="w-full flex justify-between font-mono text-[9px] text-blue-400 font-bold">
        <span>🧠 BRAIN-ROT ARBITRAGE NETWORK</span>
        <span>CONVERSIONS: {score}/{targetsNeeded}</span>
        <span className="text-amber-400 font-mono">{timer.toFixed(1)}s</span>
      </div>
      <div className="text-center">
        <h3 className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">Tap the item that doesn't match</h3>
      </div>
      <div className={`grid ${getGridColsClass()} gap-1 max-w-[260px] w-full aspect-square bg-zinc-900 p-2 rounded-xl border border-zinc-800`}>
        {Array.from({ length: gridSize }).map((_, idx) => (
          <button key={idx} onClick={() => handleGridTap(idx)} className={`flex items-center justify-center text-sm font-bold transition-all rounded active:scale-90 ${idx === oddIndex ? 'font-serif text-slate-300 font-black tracking-tight scale-105 border border-zinc-700/30' : 'font-sans text-slate-500'}`}>F</button>
        ))}
      </div>
    </div>
  );
};
