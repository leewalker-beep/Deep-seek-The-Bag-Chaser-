import React, { lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';

const LaborBuild = lazy(() =>
  import('../../minigames/LaborBuild')
  .then(m => ({ default: m.LaborBuild })));

interface FestivalCrowdSurgeProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
}

export const FestivalCrowdSurge: React.FC<FestivalCrowdSurgeProps> = ({ onComplete, level, tier }) => {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Setting up the stage...</div>}>
      <LaborBuild
        onComplete={onComplete}
        level={level}
        tier={tier}
        title="CROWD SURGE"
        instruction="Build the energy — keep the crowd moving or they walk"
        icon="🎪"
        fillLabel="CROWD ENERGY"
        scoreLabel="ENERGY"
        accentColor="purple"
      />
    </Suspense>
  );
};
