import React from 'react';
import { HoldHype } from '../../minigames/HoldHype';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';

interface StreetwearPanelProps {
  hustle: Hustle;
  onComplete: () => void;
}

export const StreetwearPanel: React.FC<StreetwearPanelProps> = ({ hustle, onComplete }) => {
  const { executeHustle } = useGameStore();

  const handleComplete = (multiplier: number) => {
    executeHustle(hustle.id, multiplier);
    onComplete();
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
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">HYPE STRATEGY</div>
          <p className="text-slate-300 text-sm">
            Timing the release is everything. Hold the button to build hype. Release within the
            <span className="text-emerald-400 font-bold mx-1">2.0s window</span> for maximum viral impact.
          </p>
        </div>

        <HoldHype onComplete={handleComplete} />
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
