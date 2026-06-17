import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PinchToInspectProps {
  onComplete: (multiplier: number) => void;
}

export const PinchToInspect: React.FC<PinchToInspectProps> = ({ onComplete }) => {
  const [startTime] = useState(() => Date.now());
  const [zoom, setZoom] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const lastDistanceRef = useRef<number | null>(null);
  const [inspected, setInspected] = useState(false);

  const handleComplete = useCallback(() => {
    setGameActive(false);
    const elapsed = (Date.now() - startTime) / 1000;

    let multiplier = 1.0;
    if (elapsed < 3) multiplier = 4.0;
    else if (elapsed < 6) multiplier = 2.0;
    else multiplier = 1.0;

    if (navigator.vibrate) navigator.vibrate(100);
    onComplete(multiplier);
  }, [onComplete, startTime]);

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
          if (navigator.vibrate) navigator.vibrate(50);
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
      className={`transition-colors duration-500 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden ${
        inspected ? 'border-emerald-500 bg-emerald-950/20' : 'border-amber-500/30'
      }`}
    >
      <div className="absolute top-6 text-center w-full">
        <h2 className="text-xl font-black text-amber-500 uppercase tracking-widest italic">VINTAGE INSPECTION</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">QUALITY AUTHENTICATION</div>
      </div>

      <div
        className="transition-transform duration-100 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="text-8xl mb-4 drop-shadow-2xl">🧥</div>
        <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-1 border border-dashed border-amber-500/50 mx-auto"
        />
      </div>

      <div className="mt-12 flex flex-col items-center gap-2">
        <div className={`text-xs font-black uppercase tracking-tighter transition-colors duration-300 ${inspected ? 'text-emerald-500' : 'text-slate-400'}`}>
          {inspected ? 'AUTHENTICATED!' : 'PINCH TO ZOOM & INSPECT STITCHING'}
        </div>
        <div className="flex items-center gap-4 opacity-40">
           <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🤏</motion.span>
           <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-amber-500"
                    animate={{ width: `${((zoom - 1) / 4) * 100}%` }}
                />
           </div>
           <motion.span animate={{ scale: [1.2, 1, 1.2] }} transition={{ repeat: Infinity, duration: 1 }}>👐</motion.span>
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-10 p-6"
          >
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-3xl font-black text-white italic uppercase tracking-tighter">CERTIFIED VINTAGE</div>
            <div className="text-emerald-500 font-black text-[10px] uppercase tracking-widest mt-2">PERFECT INSPECTION</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
