import React, { useState, useEffect } from 'react';

export const DreamWeaver: React.FC<{ onComplete: (success: boolean) => void }> = ({ onComplete }) => {
  const [connected, setConnected] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(7);

  // Calming countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          clearInterval(timer);
          onComplete(false); // Graceful timeout, awards baseline
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  // Handle mobile-friendly node sequencing clicks/touches safely
  const handleNodeTouch = (id: number) => {
    if (connected.includes(id)) return;

    // Enforce sequential trace ordering (1 -> 2 -> 3 -> 4)
    if (id === 1 && connected.length === 0) setConnected([1]);
    if (id === 2 && connected.includes(1) && connected.length === 1) setConnected([1, 2]);
    if (id === 3 && connected.includes(2) && connected.length === 2) setConnected([1, 2, 3]);
    if (id === 4 && connected.includes(3) && connected.length === 3) {
      setConnected([1, 2, 3, 4]);
      setTimeout(() => onComplete(true), 300); // Complete success bonus!
    }
  };

  return (
    <div className="w-full h-64 bg-zinc-950/80 rounded-xl relative overflow-hidden border border-purple-900/30 select-none touch-none flex flex-col items-center justify-between p-4">
      <div className="w-full flex justify-between items-center text-[10px] text-purple-400/70 font-mono tracking-widest uppercase">
        <span>🌌 Trace the Dream</span>
        <span>{timeLeft.toFixed(1)}s</span>
      </div>

      {/* Grid of Nodes mapped safely for mobile fingers */}
      <div className="grid grid-cols-2 gap-8 w-48 h-48 relative my-auto justify-center items-center">
        {[1, 2, 3, 4].map((num) => {
          const isHit = connected.includes(num);
          return (
            <div
              key={num}
              onPointerDown={() => handleNodeTouch(num)}
              onPointerEnter={(e) => {
                // Allows fluid drag-selection behavior across surfaces
                if (e.buttons === 1) handleNodeTouch(num);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-500 cursor-pointer ${
                isHit
                  ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-110'
                  : 'bg-zinc-900 text-purple-400 border border-purple-500/30'
              }`}
            >
              ✨ {num}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-zinc-500 font-sans italic text-center">Drag or tap in order without letting go.</p>
    </div>
  );
};
