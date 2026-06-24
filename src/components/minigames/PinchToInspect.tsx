import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface PinchToInspectProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const PinchToInspect: React.FC<PinchToInspectProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [startTime] = useState(() => Date.now());
  const [zoom, setZoom] = useState(1);
  const [gameActive, setGameActive] = useState(true);
  const lastDistanceRef = useRef<number | null>(null);
  const [inspected, setInspected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  // Difficulty scaling
  const zoomTarget = 3.5 + (level * 0.5) + (scaling * 0.2);
  const maxTime = Math.max(3, (12 - (level * 2)) * timerFactor);

  useEffect(() => {
    setTimeLeft(maxTime);
  }, [maxTime]);

  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setGameActive(false);
          setTimeout(() => onComplete(0.5), 1000);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameActive, onComplete]);

  const handleComplete = useCallback(() => {
    setGameActive(false);
    const elapsed = (Date.now() - startTime) / 1000;

    let multiplier = 1.0;
    if (elapsed < maxTime * 0.3) multiplier = 4.0;
    else if (elapsed < maxTime * 0.6) multiplier = 2.5;
    else if (elapsed <= maxTime) multiplier = 1.2;

    if (navigator.vibrate) navigator.vibrate(100);
    onComplete(multiplier);
  }, [onComplete, startTime, maxTime]);

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
        const newZoom = Math.max(1, Math.min(8, zoom + delta));
        setZoom(newZoom);

        if (newZoom >= zoomTarget && !inspected) {
          setInspected(true);
          if (navigator.vibrate) navigator.vibrate(50);
          setTimeout(handleComplete, 800);
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
      onMouseDown={(e) => {
          // Fallback for mouse/testing: mouse wheel can zoom
          e.preventDefault();
      }}
      onWheel={(e) => {
          if (!gameActive) return;
          const delta = e.deltaY * -0.005;
          const newZoom = Math.max(1, Math.min(8, zoom + delta));
          setZoom(newZoom);
          if (newZoom >= zoomTarget && !inspected) {
            setInspected(true);
            setTimeout(handleComplete, 800);
          }
      }}
      className={`transition-colors duration-500 bg-slate-950 p-8 rounded-3xl border-4 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden ${
        inspected ? 'border-emerald-500 bg-emerald-950/20' : 'border-amber-500/30'
      }`}
    >
      <div className="absolute top-6 text-center w-full z-10">
        <h2 className="text-xl font-black text-amber-500 uppercase tracking-widest italic">VINTAGE INSPECTION <span className="text-white text-xs">L{level}</span></h2>
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

      <div className="absolute top-[20%] right-6 text-right">
          <div className="text-[10px] font-black text-amber-500 uppercase">TIME</div>
          <div className={`font-mono text-xl font-black ${timeLeft < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft.toFixed(1)}s</div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2 z-10">
        <div className={`text-xs font-black uppercase tracking-tighter transition-colors duration-300 ${inspected ? 'text-emerald-500' : 'text-slate-400'}`}>
          {inspected ? 'AUTHENTICATED!' : 'PINCH TO ZOOM & INSPECT STITCHING'}
        </div>
        <div className="flex items-center gap-4 opacity-40">
           <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🤏</motion.span>
           <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <motion.div
                    className="h-full bg-amber-500"
                    animate={{ width: `${Math.min(100, ((zoom - 1) / (zoomTarget - 1)) * 100)}%` }}
                />
           </div>
           <motion.span animate={{ scale: [1.2, 1, 1.2] }} transition={{ repeat: Infinity, duration: 1 }}>👐</motion.span>
        </div>
        <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">
            TARGET ZOOM: {zoomTarget.toFixed(1)}x
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && inspected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 p-6"
          >
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-3xl font-black text-white italic uppercase tracking-tighter">CERTIFIED VINTAGE</div>
            <div className="text-emerald-500 font-black text-[10px] uppercase tracking-widest mt-2">AUTHENTICATION COMPLETE</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
