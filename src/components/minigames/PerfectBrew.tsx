import React, { useState, useEffect } from 'react';

export const PerfectBrew: React.FC<{ onComplete: (success: boolean) => void }> = ({ onComplete }) => {
  const [isPouring, setIsPouring] = useState(false);
  const [waterLevel, setWaterLevel] = useState(0);
  const [gameDone, setGameDone] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPouring && !gameDone) {
      interval = setInterval(() => {
        setWaterLevel(prev => {
          if (prev >= 100) {
            setIsPouring(false);
            handleFinish(100);
            return 100;
          }
          return prev + 1.5;
        });
      }, 25);
    }
    return () => clearInterval(interval);
  }, [isPouring, gameDone]);

  const handleFinish = (level: number) => {
    setGameDone(true);
    // Ideal sweet spot is between 70% and 90% container capacity
    const isPerfect = level >= 70 && level <= 90;
    setTimeout(() => onComplete(isPerfect), 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center select-none touch-none">
      <div className="text-[10px] text-amber-400 font-mono tracking-widest uppercase font-bold">
        {gameDone
          ? (waterLevel >= 70 && waterLevel <= 90 ? '✨ PERFECT STEEP (+50%)' : '🍵 WARM & SOOTHING (BASELINE)')
          : '🍵 HOLD SCREEN TO POUR HOT WATER'}
      </div>

      <div
        onPointerDown={() => !gameDone && setIsPouring(true)}
        onPointerUp={() => { if (isPouring) { setIsPouring(false); handleFinish(waterLevel); } }}
        className="w-24 h-40 bg-zinc-950 border-2 border-zinc-800 rounded-b-xl relative cursor-pointer overflow-hidden flex flex-col justify-end shadow-inner"
      >
        {/* Dynamic target calibration line boundary guides */}
        <div className="absolute bottom-[70%] left-0 right-0 h-[20%] bg-emerald-500/10 border-y border-dashed border-emerald-500/40 flex items-center justify-center pointer-events-none">
          <span className="text-[7px] text-emerald-400/60 uppercase font-black tracking-tighter">STEEP ZONE</span>
        </div>

        <div
          className="w-full bg-amber-700/40 border-t-2 border-amber-500/60 transition-all duration-75 ease-out"
          style={{ height: `${waterLevel}%` }}
        />
      </div>

      <p className="text-[9px] text-zinc-500 italic">Release within the target lines. Missing preserves full baseline recovery.</p>
    </div>
  );
};
