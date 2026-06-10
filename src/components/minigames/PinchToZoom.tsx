import React, { useState, useEffect, useRef } from 'react';

interface PinchToZoomProps {
  onComplete: (multiplier: number) => void;
}

export const PinchToZoom: React.FC<PinchToZoomProps> = ({ onComplete }) => {
  const [zoom, setZoom] = useState(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [targetDamage] = useState(() => Math.random() * 0.8 + 0.1); // 10% to 90%
  const [timeLeft, setTimeLeft] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDistanceRef = useRef<number | null>(null);

  const handleFinish = React.useCallback(() => {
    // Zoom 1-5 maps to 0-100% assessment
    const assessment = (zoom - 1) / 4;
    const accuracy = 1 - Math.abs(assessment - targetDamage);
    onComplete(accuracy);
  }, [zoom, targetDamage, onComplete]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleFinish]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        (touch1.clientX - touch2.clientX) ** 2 +
        (touch1.clientY - touch2.clientY) ** 2
      );

      if (lastDistanceRef.current !== null) {
        const delta = (distance - lastDistanceRef.current) * 0.01;
        setZoom((prev) => Math.max(1, Math.min(5, prev + delta)));
        setHasInteracted(true);
      }
      lastDistanceRef.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistanceRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500">
        TIMEOUT: {timeLeft}s
      </div>

      <div className="text-[10px] text-slate-500 uppercase font-bold mb-6">
        PINCH TO ASSESS CRISIS DAMAGE
      </div>

      <div className="relative w-full aspect-square max-w-[280px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
        {/* Stylized Crisis Map */}
        <div
          className="absolute inset-0 transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${zoom})`,
            backgroundImage: `radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)`,
          }}
        >
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Simulated damage spots */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-red-600/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500/40 rounded-full blur-lg animate-ping" />
        </div>

        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Zoom Level</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">{zoom.toFixed(2)}x</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${((zoom - 1) / 4) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 w-full max-w-[280px] space-y-4">
        <div className="text-[10px] text-slate-500 italic">
          "Zoom in to reveal hidden casualties and infrastructure damage. Accuracy is everything."
        </div>

        {/* Desktop fallback slider */}
        <div className="w-full">
            <input
              type="range"
              min="1"
              max="5"
              step="0.01"
              value={zoom}
              onChange={(e) => {
                setZoom(parseFloat(e.target.value));
                setHasInteracted(true);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
        </div>

        {hasInteracted && (
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest text-xs animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            SUBMIT ASSESSMENT
          </button>
        )}
      </div>

      {/* Target hint (hidden in real game, but showing for player slightly via 'thermal scan' message) */}
      <div className="mt-4 text-[9px] text-slate-600 uppercase font-mono">
        Scanning for thermal signatures...
      </div>
    </div>
  );
};
