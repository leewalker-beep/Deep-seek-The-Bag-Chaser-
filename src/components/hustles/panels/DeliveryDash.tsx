import React, { lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';

const RunnerRoute = lazy(() =>
  import('../../minigames/RunnerRoute')
  .then(m => ({ default: m.RunnerRoute })));

interface DeliveryDashProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
}

export const DeliveryDash: React.FC<DeliveryDashProps> = ({ onComplete, level, tier }) => {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Calculating Route...</div>}>
      <RunnerRoute
        onComplete={onComplete}
        level={level}
        tier={tier}
        title="DELIVERY DASH"
        instruction="Dodge the traffic — every collision is a late delivery penalty"
        icon="🛵"
        obstacleEmoji="🚗"
        playerEmoji="🛵"
        scoreLabel="DELIVERIES"
      />
    </Suspense>
  );
};
