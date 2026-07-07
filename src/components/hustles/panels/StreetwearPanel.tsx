import React, { lazy, Suspense } from 'react';
const StreetwearMatch = lazy(() => import('../../minigames/StreetwearMatch').then(m => ({ default: m.StreetwearMatch })));
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';

interface StreetwearPanelProps {
  hustle: Hustle;
  onComplete: () => void;
}

export const StreetwearPanel: React.FC<StreetwearPanelProps> = ({ hustle, onComplete }) => {
  const { executeHustle } = useGameStore();

  const handleComplete = (multiplier: number) => {
    const result = executeHustle(hustle.id, multiplier);
    if (result.success) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{hustle.icon}</div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              {hustle.name}
            </h3>
            <p className="text-slate-500 text-xs font-bold uppercase">{hustle.description}</p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">DESIGN STRATEGY</div>
          <p className="text-slate-300 text-sm">
            Consistency is key. Match the color swatches to the target outfit parts for maximum hype.
          </p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Initializing Design Studio...</div>}>
          <StreetwearMatch
            level={useGameStore.getState().pl.hustleLevels[hustle.id] || 1}
            onComplete={handleComplete}
          />
        </Suspense>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-3 text-[10px] font-bold text-slate-500 uppercase hover:text-white transition-colors"
      >
        ← Cancel Operation
      </button>
    </div>
  );
};
