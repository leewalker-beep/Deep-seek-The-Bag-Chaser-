import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Crisis {
  id: number;
  x: number;
  y: number;
  type: string;
  resolved: boolean;
}

const CRISIS_TYPES = [
  { icon: '🔥', name: 'Fire', color: 'from-red-500 to-orange-500' },
  { icon: '💧', name: 'Flood', color: 'from-blue-500 to-cyan-500' },
  { icon: '🏚️', name: 'Collapse', color: 'from-gray-500 to-slate-500' },
  { icon: '💥', name: 'Explosion', color: 'from-orange-500 to-red-600' },
  { icon: '🚑', name: 'Injured', color: 'from-green-500 to-emerald-500' },
  { icon: '⚡', name: 'Power Out', color: 'from-yellow-500 to-amber-500' },
  { icon: '🌊', name: 'Tsunami', color: 'from-cyan-500 to-blue-600' },
  { icon: '🌪️', name: 'Tornado', color: 'from-gray-400 to-gray-700' },
];

interface PinchToZoomProps {
  onComplete: (multiplier: number) => void; level?: number;
}

export const PinchToZoom: React.FC<PinchToZoomProps> = ({ onComplete, level: _level = 1 }) => {
  const [crises, setCrises] = useState<Crisis[]>(() => {
    const newCrises: Crisis[] = [];
    for (let i = 0; i < 12; i++) {
      newCrises.push({
        id: i,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70,
        type: CRISIS_TYPES[Math.floor(Math.random() * CRISIS_TYPES.length)].icon,
        resolved: false,
      });
    }
    return newCrises;
  });
  const [resolvedCount, setResolvedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<'resolve' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDistanceRef = useRef<number | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const resolvedCountRef = useRef(resolvedCount);

  useEffect(() => {
    resolvedCountRef.current = resolvedCount;
  }, [resolvedCount]);

  const endGame = useCallback(() => {
    setGameActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const count = resolvedCountRef.current;
    let multiplier = 0.5;
    if (count >= 12) multiplier = 4.0;
    else if (count >= 10) multiplier = 3.0;
    else if (count >= 8) multiplier = 2.0;
    else if (count >= 6) multiplier = 1.5;
    else if (count >= 4) multiplier = 1.0;
    else multiplier = 0.5;

    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => {
      onComplete(multiplier);
    }, 1500);
  }, [onComplete]);

  // Timer
  useEffect(() => {
    if (!gameActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          endGame();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, endGame]);

  const handleTap = (crisisId: number) => {
    if (!gameActive) return;
    setCrises(prev => {
      const crisis = prev.find(c => c.id === crisisId);
      if (crisis?.resolved) return prev;
      setResolvedCount(c => c + 1);
      setFeedback('resolve');
      setTimeout(() => setFeedback(null), 150);
      if (navigator.vibrate) navigator.vibrate(15);
      return prev.map(c => c.id === crisisId ? { ...c, resolved: true } : c);
    });
  };

  // Pinch to zoom + Pan
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
        setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
      }
      lastDistanceRef.current = distance;
      lastTouchRef.current = null;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (lastTouchRef.current) {
        const deltaX = touch.clientX - lastTouchRef.current.x;
        const deltaY = touch.clientY - lastTouchRef.current.y;
        setPan(prev => ({
          x: Math.max(-400, Math.min(400, prev.x + deltaX * (1 / zoom))),
          y: Math.max(-400, Math.min(400, prev.y + deltaY * (1 / zoom)))
        }));
      }
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      lastDistanceRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    lastDistanceRef.current = null;
    lastTouchRef.current = null;
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-200 bg-slate-950 flex flex-col items-center justify-center touch-none select-none z-[100] ${
        feedback ? 'bg-emerald-950/20' : 'bg-slate-950'
    }`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 text-center z-20 bg-slate-900/60 backdrop-blur-md py-6 border-b border-white/5">
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">DISASTER RESPONSE</h2>
        <div className="flex justify-center gap-10 mt-2">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">LIMIT</div>
            <div className={`text-2xl font-mono font-black ${timeLeft < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft.toFixed(1)}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">RESOLVED</div>
            <div className="text-2xl font-mono font-black text-emerald-400">
              {resolvedCount}/12
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="relative w-[300%] h-[300%] cursor-crosshair"
          animate={{
            x: pan.x - (window.innerWidth),
            y: pan.y - (window.innerHeight),
            scale: zoom
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Map Background */}
          <div className="absolute inset-0 bg-slate-950 shadow-inner">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
              backgroundSize: '100px 100px'
            }} />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Crises */}
          {crises.map(crisis => (
            !crisis.resolved && (
              <motion.button
                key={crisis.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onPointerDown={() => handleTap(crisis.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${crisis.x}%`, top: `${crisis.y}%` }}
              >
                <div className="text-5xl drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-125 transition-transform active:scale-75">
                  {crisis.type}
                </div>
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -inset-8 bg-red-500/20 rounded-full border border-red-500/30"
                />
              </motion.button>
            )
          ))}
        </motion.div>
      </div>

      {/* Action Hints */}
      {gameActive && (
        <div className="absolute bottom-6 left-0 right-0 text-center z-10 px-8">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>✌️</motion.span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ZOOM</span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2">
                <motion.span animate={{ scale: [1.2, 1, 1.2] }} transition={{ repeat: Infinity, duration: 1 }}>👆</motion.span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RESOLVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      <AnimatePresence>
        {!gameActive && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-8 text-center"
            >
                <div className="text-8xl mb-6">
                    {resolvedCount >= 10 ? '🎖️' : resolvedCount >= 6 ? '✅' : '🚨'}
                </div>
                <h3 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">RESPONSE CONCLUDED</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                    {resolvedCount >= 10 ? 'Catastrophe averted with precision.' :
                     resolvedCount >= 6 ? 'Managed the situation effectively.' :
                     'Minimal intervention achieved.'}
                </p>
                <div className="bg-black/50 p-6 rounded-2xl border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">FINAL PERFORMANCE</div>
                    <div className="text-emerald-500 text-5xl font-black font-mono italic">
                        {resolvedCount >= 12 ? '4.00' :
                        resolvedCount >= 10 ? '3.00' :
                        resolvedCount >= 8 ? '2.00' :
                        resolvedCount >= 6 ? '1.50' :
                        resolvedCount >= 4 ? '1.00' : '0.50'}X
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom Indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-30 z-10 pointer-events-none">
          <div className="text-[8px] font-black text-white uppercase vertical-rl">MAGNIFICATION</div>
          <div className="w-1.5 h-32 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="w-full bg-blue-500"
                animate={{ height: `${((zoom - 1) / 2) * 100}%` }}
              />
          </div>
      </div>
    </div>
  );
};
