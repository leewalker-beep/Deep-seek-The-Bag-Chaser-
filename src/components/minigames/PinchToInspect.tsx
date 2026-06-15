import React, { useState, useRef, useCallback } from 'react';

interface PinchToInspectProps {
  onComplete: (multiplier: number) => void;
}

export const PinchToInspect: React.FC<PinchToInspectProps> = ({ onComplete }) => {
  const [zoom, setZoom] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const lastDistanceRef = useRef<number | null>(null);
  const [inspected, setInspected] = useState(false);

  const handleComplete = useCallback(() => {
    setGameActive(false);
    onComplete(3.0);
  }, [onComplete]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameActive) return;

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );

      if (lastDistanceRef.current !== null) {
        const delta = (distance - lastDistanceRef.current) * 0.01;
        const newZoom = Math.max(1, Math.min(5, zoom + delta));
        setZoom(newZoom);

        if (newZoom >= 4 && !inspected) {
          setInspected(true);
          setTimeout(handleComplete, 1000);
        }
      }
      lastDistanceRef.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistanceRef.current = null;
  };

  return (
    <div
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="bg-slate-900 p-6 rounded-2xl border border-amber-500/30 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div className="absolute top-4 text-[10px] text-amber-400 font-bold uppercase tracking-widest">
        VINTAGE INSPECTION
      </div>

      <div
        className="transition-transform duration-100 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="text-6xl mb-2">🧥</div>
        <div className="w-16 h-1 border border-dashed border-amber-500/50 mx-auto" />
      </div>

      <div className="mt-12 text-[10px] text-slate-500 uppercase font-bold">
        {inspected ? 'AUTHENTICATED!' : 'PINCH TO ZOOM & INSPECT STITCHING'}
      </div>

      <div className="absolute bottom-4 w-full px-8">
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-100"
            style={{ width: `${(zoom - 1) / 4 * 100}%` }}
          />
        </div>
      </div>

      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-10">
          <div className="text-2xl font-black text-white italic">CERTIFIED VINTAGE</div>
        </div>
      )}
    </div>
  );
};
