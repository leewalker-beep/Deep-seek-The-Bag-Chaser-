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
  const activeLevel = useGameStore(state => state.pl.hustleLevels[hustle.id] || 1);

  const handleComplete = (multiplier: number) => {
    const result = executeHustle(hustle.id, multiplier);
    if (result.success) {
      onComplete();
    }
  };

  const getLevelInfo = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          title: "Screenprint Tees",
          desc: "Small-batch printing. Match the target colors of parts and tags before the timer runs out.",
        };
      case 2:
        return {
          title: "Pop-Up Tour",
          desc: "Rush Service: serve customers in queue rapidly. Redirection to substitutes is required when requested items run out of stock!",
        };
      case 3:
      default:
        return {
          title: "Flagship Store",
          desc: "Inventory Forecast: allocate your 100 units of collection budget based on expected demand, then resolve sales sell-through.",
        };
    }
  };

  const levelInfo = getLevelInfo(activeLevel);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{hustle.icon}</div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              {hustle.name} - {levelInfo.title}
            </h3>
            <p className="text-slate-500 text-xs font-bold uppercase">{hustle.description}</p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">DESIGN STRATEGY</div>
          <p className="text-slate-300 text-sm">
            {levelInfo.desc}
          </p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Initializing Design Studio...</div>}>
          <StreetwearMatch
            level={activeLevel}
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
