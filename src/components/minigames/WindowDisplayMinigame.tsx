import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WindowDisplayMinigameProps {
  onComplete: (multiplier: number) => void;
  scaling: number;
}

interface SKUStyle {
  key: string;
  name: string;
  emoji: string;
  hypeText: string;
  trend: 'UP' | 'DOWN' | 'STABLE' | 'ROCKET';
  estimatedRange: string;
}

const STYLE_TEMPLATES: SKUStyle[] = [
  {
    key: 'windbreaker',
    name: 'Retro Windbreaker',
    emoji: '🧥',
    hypeText: '🔥 High-street subculture adoption is growing rapidly.',
    trend: 'UP',
    estimatedRange: '',
  },
  {
    key: 'hoodie',
    name: 'Deconstructed Hoodie',
    emoji: '👕',
    hypeText: '✨ Spotted on a prominent supermodel during fashion week.',
    trend: 'ROCKET',
    estimatedRange: '',
  },
  {
    key: 'cargo',
    name: 'Distressed Cargoes',
    emoji: '👖',
    hypeText: '📉 Market is over-saturated with generic utility wear.',
    trend: 'DOWN',
    estimatedRange: '',
  },
  {
    key: 'sneakers',
    name: 'Luxury Sneakers',
    emoji: '👟',
    hypeText: '🚀 Online sub-forums are hyping up a rumored collaboration.',
    trend: 'ROCKET',
    estimatedRange: '',
  },
];

export const WindowDisplayMinigame: React.FC<WindowDisplayMinigameProps> = ({ onComplete, scaling }) => {
  const [targetDemands, setTargetDemands] = useState<number[]>([]);
  const [allocations, setAllocations] = useState<number[]>([0, 0, 0, 0]);
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  // Generate target demands summing to exactly 100
  useEffect(() => {
    const raw = [
      Math.random() * 0.3 + 0.1, // windbreaker
      Math.random() * 0.4 + 0.2, // hoodie
      Math.random() * 0.15 + 0.05, // cargo
      Math.random() * 0.25 + 0.1, // sneakers
    ];
    const sum = raw.reduce((a, b) => a + b, 0);
    const normalized = raw.map((v) => Math.round((v / sum) * 100));

    // Ensure sum is exactly 100
    const finalSum = normalized.reduce((a, b) => a + b, 0);
    const diff = 100 - finalSum;
    normalized[0] += diff;

    setTargetDemands(normalized);
  }, []);

  // Compute total allocated units
  const totalAllocated = allocations.reduce((a, b) => a + b, 0);
  const remainingBudget = 100 - totalAllocated;

  const handleAdjust = (index: number, amount: number) => {
    if (isResolved || isResolving) return;

    setAllocations((prev) => {
      const next = [...prev];
      const newAllocation = next[index] + amount;

      // Bound checks: cannot go below 0, cannot exceed remaining budget
      if (newAllocation < 0) return prev;
      if (amount > 0 && remainingBudget - amount < 0) {
        // adjust to exactly remaining budget if too high
        next[index] += remainingBudget;
        return next;
      }

      next[index] = newAllocation;
      return next;
    });

    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleResolve = () => {
    if (totalAllocated !== 100) return;
    setIsResolving(true);

    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      setIsResolving(false);
      setIsResolved(true);

      // Compute total error and accuracy
      let totalError = 0;
      allocations.forEach((alloc, i) => {
        totalError += Math.abs(alloc - targetDemands[i]);
      });

      const matchedAccuracy = Math.max(0, 100 - totalError / 2);
      setAccuracy(matchedAccuracy);

      // Score Mapping
      let baseMult = 0.5;
      if (matchedAccuracy >= 90) baseMult = 3.0;
      else if (matchedAccuracy >= 75) baseMult = 2.0;
      else if (matchedAccuracy >= 50) baseMult = 1.3;
      else if (matchedAccuracy >= 30) baseMult = 0.8;
      else baseMult = 0.5;

      const finalMultiplier = Math.max(0.5, Math.min(3.0, baseMult * (0.8 + scaling * 0.2)));

      setTimeout(() => {
        onComplete(finalMultiplier);
      }, 2500);
    }, 2000);
  };

  const getHypeColorClass = (trend: string) => {
    switch (trend) {
      case 'ROCKET': return 'text-purple-400 font-extrabold';
      case 'UP': return 'text-emerald-400 font-bold';
      case 'DOWN': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-4 bg-slate-950 text-white rounded-3xl border-2 border-slate-800 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
      {/* Top Header */}
      <div className="text-center mb-2 pb-2 border-b border-slate-900 flex justify-between items-center">
        <div className="text-left">
          <h3 className="text-lg font-black text-purple-400 tracking-tight italic">FLAGSHIP STORE: INVENTORY FORECAST</h3>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Pre-allocate your 100 units of collection budget based on market sentiment</p>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-slate-500 font-bold uppercase block">BUDGET LEFT</span>
          <span className={`text-base font-mono font-black ${remainingBudget === 0 ? 'text-emerald-400' : 'text-amber-500'}`}>
            {remainingBudget} / 100
          </span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 my-3 space-y-3">
        {STYLE_TEMPLATES.map((style, i) => {
          // Generate a helpful estimated range centered near target demand
          const demand = targetDemands[i] || 25;
          const rangeOffset = 8;
          const minRange = Math.max(0, demand - rangeOffset);
          const maxRange = Math.min(100, demand + rangeOffset);

          return (
            <div key={style.key} className="bg-slate-900/60 border border-slate-900 p-3 rounded-2xl flex flex-col justify-between">
              {/* Style Info */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{style.emoji}</span>
                  <div>
                    <span className="text-xs font-black uppercase text-white">{style.name}</span>
                    <p className="text-[8.5px] text-slate-400 leading-tight mt-0.5">{style.hypeText}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[7.5px] text-slate-500 font-bold block uppercase">EXPECTED TARGET</span>
                  <span className={`text-[10px] font-bold ${getHypeColorClass(style.trend)}`}>
                    {minRange}% - {maxRange}%
                  </span>
                </div>
              </div>

              {/* Slider Allocation Adjuster */}
              <div className="mt-3 flex items-center justify-between bg-slate-950/80 p-2 rounded-xl border border-slate-900">
                <div className="text-left">
                  <span className="text-[8px] text-slate-500 font-bold uppercase block">ALLOCATED</span>
                  <span className="text-xs font-mono font-black text-white">{allocations[i]} units</span>
                </div>

                {!isResolved && !isResolving ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAdjust(i, -10)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-black rounded-lg transition-colors border border-slate-800"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleAdjust(i, -5)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-black rounded-lg transition-colors border border-slate-800"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleAdjust(i, 5)}
                      className="px-2 py-1 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-[10px] font-black rounded-lg transition-colors border border-purple-900/20"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleAdjust(i, 10)}
                      className="px-2.5 py-1 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-[10px] font-black rounded-lg transition-colors border border-purple-900/20"
                    >
                      +10
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center font-mono">
                    <div className="text-right">
                      <span className="text-[7px] text-slate-500 uppercase block">ACTUAL DEMAND</span>
                      <span className="text-xs font-black text-indigo-400">{demand}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] text-slate-500 uppercase block">SELL-THROUGH</span>
                      <span className={`text-xs font-black ${allocations[i] <= demand ? 'text-emerald-400' : 'text-yellow-500'}`}>
                        {Math.min(100, Math.round((Math.min(allocations[i], demand) / (allocations[i] || 1)) * 100))}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Resolve Area */}
      <div>
        {isResolving && (
          <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 text-center animate-pulse">
            <span className="text-xl mr-2">📊</span>
            <span className="text-xs font-black uppercase text-purple-400 tracking-wider">RUNNING REVENUE SELL-THROUGH FORECASTS...</span>
          </div>
        )}

        {isResolved && (
          <div className="w-full bg-slate-900/90 border border-purple-900/40 p-4 rounded-xl text-center">
            <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider italic">FORECAST COMPLETE</h4>
            <p className="text-xs text-slate-300 mt-1">
              Your Allocation matched actual demand with <strong className="text-indigo-400 font-mono text-sm">{accuracy.toFixed(1)}%</strong> accuracy!
            </p>
          </div>
        )}

        {!isResolving && !isResolved && (
          <button
            onClick={handleResolve}
            disabled={totalAllocated !== 100}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all border-b-4 ${
              totalAllocated === 100
                ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white border-purple-800 active:translate-y-0.5 active:border-b-0 shadow-lg'
                : 'bg-slate-800 text-slate-600 border-slate-950 cursor-not-allowed'
            }`}
          >
            {totalAllocated === 100 ? 'RESOLVE SALES WINDOW' : `ALLOCATE ${remainingBudget} MORE UNITS`}
          </button>
        )}
      </div>
    </div>
  );
};
