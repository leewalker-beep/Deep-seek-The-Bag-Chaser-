import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  onComplete: (multiplier: number) => void;
}

export const PinchToZoom: React.FC<PinchToZoomProps> = ({ onComplete }) => {
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

    setTimeout(() => {
      onComplete(multiplier);
    }, 800);
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
      return prev.map(c => c.id === crisisId ? { ...c, resolved: true } : c);
    });
    setResolvedCount(prev => prev + 1);
  };

  // Pinch to zoom + Pan
  const handleTouchMove = (e: React.TouchEvent) => {
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
          x: Math.max(-300, Math.min(300, prev.x + deltaX * (1 / zoom))),
          y: Math.max(-300, Math.min(300, prev.y + deltaY * (1 / zoom)))
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
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none z-[100]">
      {/* Header */}
      <div className="absolute top-4 left-0 right-0 text-center z-10 bg-slate-950/80 backdrop-blur-sm py-3">
        <h2 className="text-xl font-black text-white">DISASTER RECOVERY</h2>
        <div className="flex justify-center gap-6 mt-1">
          <div>
            <div className="text-[8px] text-slate-500 uppercase">TIME</div>
            <div className={`text-2xl font-mono font-bold ${timeLeft < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft.toFixed(1)}s
            </div>
          </div>
          <div>
            <div className="text-[8px] text-slate-500 uppercase">RESOLVED</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {resolvedCount} / 12
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
        <div
          className="relative w-[200%] h-[200%] transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900">
            {/* Grid lines for map feel */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Crises */}
          {crises.map(crisis => (
            !crisis.resolved && (
              <button
                key={crisis.id}
                onClick={() => handleTap(crisis.id)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ left: `${crisis.x}%`, top: `${crisis.y}%` }}
              >
                <div className="text-3xl drop-shadow-lg hover:scale-125 transition-transform active:scale-90">
                  {crisis.type}
                </div>
                <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />
              </button>
            )
          ))}
        </div>
      </div>

      {/* Instructions */}
      {gameActive && (
        <div className="absolute bottom-4 left-0 right-0 text-center z-10">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            <p className="text-[10px] text-slate-400">
              ✌️ Pinch to zoom • 👆 Tap to resolve crises
            </p>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center z-20 animate-in fade-in duration-300">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">
              {resolvedCount >= 10 ? '🏆' : resolvedCount >= 6 ? '👍' : '😰'}
            </div>
            <h3 className="text-2xl font-black text-white mb-2">MISSION COMPLETE</h3>
            <p className="text-slate-400 text-sm mb-1">Crises Resolved: {resolvedCount}/12</p>
            <p className="text-emerald-400 text-lg font-bold mt-2">
              {resolvedCount >= 12 ? '4.0x PERFECT!' :
               resolvedCount >= 10 ? '3.0x EXCELLENT!' :
               resolvedCount >= 8 ? '2.0x GREAT!' :
               resolvedCount >= 6 ? '1.5x GOOD' :
               resolvedCount >= 4 ? '1.0x PASSABLE' :
               '0.5x NEEDS IMPROVEMENT'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
