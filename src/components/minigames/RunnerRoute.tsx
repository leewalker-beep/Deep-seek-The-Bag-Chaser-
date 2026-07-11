import React, { useState, useEffect } from 'react';

interface ItemNode {
  id: string;
  lane: number;
  yPosition: number;
  type: 'OBSTACLE' | 'CARGO';
}

interface RunnerRouteProps {
  level?: number;
  onComplete: (payoutBonus: number) => void;
  tier?: string;
}

export const RunnerRoute: React.FC<RunnerRouteProps> = ({ level = 1, onComplete }) => {
  const [truckLane, setTruckLane] = useState(1);
  const [items, setItems] = useState<ItemNode[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);

  useEffect(() => {
    const engineInterval = setInterval(() => {
      setItems(prevItems => {
        return prevItems
          .map(item => {
            let currentLane = item.lane;
            // Level 3: Dynamic horizontal drift (Lane Swapping hazards)
            if (level === 3 && item.type === 'OBSTACLE' && item.yPosition > 30 && item.yPosition < 35 && Math.random() < 0.15) {
              const directions = currentLane === 1 ? [-1, 1] : currentLane === 0 ? [1] : [-1];
              currentLane += directions[Math.floor(Math.random() * directions.length)];
            }
            return { ...item, yPosition: item.yPosition + 3.5, lane: currentLane };
          })
          // FIX MOBILE CLIPPING PLANE: Keep processing physics until 92% depth before evaluating collisions
          .filter(item => {
            if (item.yPosition >= 92) {
              if (item.lane === truckLane) {
                if (item.type === 'OBSTACLE') setScore(s => Math.max(0, s - 3));
                else if (item.type === 'CARGO') setScore(s => s + 5);
              } else if (item.type === 'CARGO' && level >= 2) {
                setScore(s => Math.max(0, s - 1));
              }
              return false;
            }
            return true;
          });
      });
    }, 40);

    const spawnerInterval = setInterval(() => {
      const targetLane = Math.floor(Math.random() * 3);
      const spawnType = (level >= 2 && Math.random() > 0.6) ? 'CARGO' : 'OBSTACLE';
      setItems(prev => [...prev, { id: Math.random().toString(), lane: targetLane, yPosition: 0, type: spawnType }]);
    }, level === 1 ? 900 : level === 2 ? 700 : 500);

    return () => {
      clearInterval(engineInterval);
      clearInterval(spawnerInterval);
    };
  }, [truckLane, level]);

  useEffect(() => {
    if (timeLeft <= 0.1) {
      // Map final score to standard multiplier range
      let multiplier = 0.5;
      if (score >= 20) multiplier = 4.0;
      else if (score >= 12) multiplier = 2.5;
      else if (score >= 5) multiplier = 1.2;
      onComplete(multiplier);
      return;
    }
    const cd = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
    return () => clearTimeout(cd);
  }, [timeLeft, score, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="w-full max-w-md bg-zinc-950 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-2xl border border-zinc-800">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-orange-400 mb-2">
          <span>🚚 RUNNER LOGISTICS L{level}</span>
          <span>FLOW OUTFLOW: {score} PTS</span>
          <span>{timeLeft.toFixed(1)}s</span>
        </div>

        {/* Track container explicitly encloses the truck asset at the true visual floor */}
        <div className="w-full h-52 bg-zinc-900 border border-zinc-800 relative flex justify-between rounded-lg overflow-hidden mb-3">
          <div className="absolute inset-y-0 left-1/3 border-r border-zinc-800/40 border-dashed pointer-events-none" />
          <div className="absolute inset-y-0 right-1/3 border-l border-zinc-800/40 border-dashed pointer-events-none" />
          {items.map(item => (
            <div
              key={item.id}
              className="absolute text-sm transition-all duration-75 ease-linear -translate-x-1/2"
              style={{ left: `${item.lane * 33.33 + 16.66}%`, top: `${item.yPosition}%` }}
            >
              {item.type === 'OBSTACLE' ? '🚧' : '📦'}
            </div>
          ))}
          {/* Aligned structurally inside the track relative canvas at bottom-2 */}
          <div
            className="absolute bottom-2 text-xl transition-all duration-100 ease-out -translate-x-1/2 bg-orange-600/20 p-1.5 rounded-lg border border-orange-500/40 shadow-glow"
            style={{ left: `${truckLane * 33.33 + 16.66}%` }}
          >
            盒子 🚛
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['L', 'C', 'R'].map((label, index) => (
            <button
              key={label}
              onClick={() => setTruckLane(index)}
              className={`p-2 rounded font-mono font-bold text-xs ${
                truckLane === index ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
