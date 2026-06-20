import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PinchToInspectProps {
  level?: number;
  onComplete: (multiplier: number) => void;
}

const ITEMS = [
  { icon: '🧥', name: 'Vintage Trench' },
  { icon: '👜', name: 'Archival Bag' },
  { icon: '👟', name: '80s Sneakers' },
  { icon: '⌚', name: 'Heirloom Watch' },
  { icon: '💎', name: 'Estate Jewelry' }
];

export const PinchToInspect: React.FC<PinchToInspectProps> = ({ level = 1, onComplete }) => {
  const [startTime] = useState(() => Date.now());
  const [zoom, setZoom] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const lastDistanceRef = useRef<number | null>(null);
  const [inspected, setInspected] = useState(false);

  // Randomly select item based on level
  const [item] = useState(() => ITEMS[(level - 1) % ITEMS.length]);

  // Scaling: Target zoom level increases from 4.0 to 8.0
  const targetZoom = 3.5 + (level * 0.5);
  // Scaling: Inspection time allowed decreases
  const timeLimit = 10 - (level * 1);

  const handleComplete = useCallback((success: boolean) => {
    setGameActive(false);
    const elapsed = (Date.now() - startTime) / 1000;

    let multiplier = 0.5;
    if (success) {
        if (elapsed < (timeLimit * 0.4)) multiplier = 4.0;
        else if (elapsed < (timeLimit * 0.7)) multiplier = 2.5;
        else multiplier = 1.5;
    } else {
        multiplier = 0.3;
    }

    if (navigator.vibrate) navigator.vibrate(success ? 100 : [50, 50]);
    onComplete(multiplier);
  }, [onComplete, startTime, timeLimit]);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= timeLimit && !inspected) {
            handleComplete(false);
        }
    }, 100);
    return () => clearInterval(timer);
  }, [gameActive, startTime, timeLimit, inspected, handleComplete]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameActive || inspected) return;

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );

      if (lastDistanceRef.current !== null) {
        const delta = (distance - lastDistanceRef.current) * 0.015;
        const newZoom = Math.max(1, Math.min(10, zoom + delta));
        setZoom(newZoom);

        if (newZoom >= targetZoom && !inspected) {
          setInspected(true);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(() => handleComplete(true), 800);
        }
      }
      lastDistanceRef.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistanceRef.current = null;
  };

  // For Desktop Testing: Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
      if (!gameActive || inspected) return;
      const delta = e.deltaY * -0.01;
      const newZoom = Math.max(1, Math.min(10, zoom + delta));
      setZoom(newZoom);
      if (newZoom >= targetZoom && !inspected) {
        setInspected(true);
        setTimeout(() => handleComplete(true), 800);
      }
  };

  const progress = Math.min(100, (zoom - 1) / (targetZoom - 1) * 100);

  return (
    <div
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className={`transition-colors duration-500 bg-slate-900 p-8 rounded-3xl border-4 text-center select-none touch-none min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden ${
        inspected ? 'border-emerald-500 bg-emerald-950/20' : 'border-amber-500/30'
      }`}
    >
      <div className="absolute top-6 text-center w-full z-20">
        <h2 className="text-xl font-black text-amber-500 uppercase tracking-widest italic">VINTAGE AUTHENTICATION</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">LVL {level} • {item.name}</div>
      </div>

      <div
        className="transition-transform duration-100 ease-out relative z-10"
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="text-9xl mb-4 drop-shadow-2xl">{item.icon}</div>
        <AnimatePresence>
            {!inspected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-16 h-16 border-2 border-dashed border-amber-500/50 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            )}
        </AnimatePresence>
      </div>

      <div className="mt-16 flex flex-col items-center gap-3 w-full max-w-xs z-20">
        <div className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${inspected ? 'text-emerald-400' : 'text-slate-400'}`}>
          {inspected ? 'STITCHING VERIFIED!' : 'PINCH TO ZOOM ON THE LOGO'}
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
            <motion.div
                className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                animate={{ width: `${progress}%` }}
            />
        </div>

        <div className="flex items-center justify-between w-full px-2 opacity-50">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">MIN ZOOM</div>
            <div className="text-[8px] font-black text-amber-500 uppercase tracking-widest">TARGET: {targetZoom.toFixed(1)}X</div>
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[100] p-6 text-center"
          >
            <div className="text-8xl mb-6">{inspected ? '🏆' : '❌'}</div>
            <div className="text-3xl font-black text-white italic uppercase tracking-tighter">
                {inspected ? 'ITEM CERTIFIED' : 'INSPECTION FAILED'}
            </div>
            <div className={`font-black text-xl mt-4 ${inspected ? 'text-emerald-400' : 'text-red-500'}`}>
                {inspected ? 'AUTHENTIC ARCHIVAL PIECE' : 'TOO SLOW / COUNTERFEIT'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
