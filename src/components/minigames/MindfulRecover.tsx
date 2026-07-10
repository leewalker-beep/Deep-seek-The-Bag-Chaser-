import React, { useState, useEffect } from 'react';

interface MindfulRecoverProps {
  onComplete: (mhBonus: number) => void;
}

export const MindfulRecover: React.FC<MindfulRecoverProps> = ({ onComplete }) => {
  const [radius, setRadius] = useState(50);
  const [expanding, setExpanding] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadius(prev => {
        if (prev >= 95) setExpanding(false);
        if (prev <= 45) setExpanding(true);
        return expanding ? prev + 1.5 : prev - 1.5;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [expanding]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-xl border border-zinc-800 w-full select-none">
      <p className="text-xs font-black text-emerald-400 mb-8 uppercase tracking-[0.2em] h-6 text-center">
        {expanding ? "💨 Inhale: Expand the lungs" : "😮 Exhale: Release the stress"}
      </p>
      <div className="h-48 w-48 flex items-center justify-center relative">
        <div
          style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
          className="rounded-full bg-emerald-500/10 border-2 border-emerald-400 transition-all duration-75 flex items-center justify-center cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          onPointerDown={() => onComplete(expanding ? 12 : 35)}
        >
          <span className="text-xs font-black text-white pointer-events-none">TAP MATCH</span>
        </div>
      </div>
    </div>
  );
};
