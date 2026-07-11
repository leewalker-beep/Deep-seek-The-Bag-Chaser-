import React, { lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';

const CrowdSurge = lazy(() =>
  import('../../minigames/CrowdSurge')
  .then(m => ({ default: m.CrowdSurge })));

interface FestivalCrowdSurgeProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
}

export const FestivalCrowdSurge: React.FC<FestivalCrowdSurgeProps> = ({ onComplete, level, tier }) => {
  return (
    <div data-tier={tier} className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 font-mono text-white text-xs flex flex-col justify-between h-80 select-none text-left">
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Setting up the stage...</div>}>
        <CrowdSurge
          level={level}
          onComplete={(score) => {
            // Map sequential loop score to a balanced performance multiplier
            const multiplier = Math.max(0.5, Math.min(2.0, score / 60));
            onComplete(multiplier);
          }}
        />
      </Suspense>
    </div>
  );
};
