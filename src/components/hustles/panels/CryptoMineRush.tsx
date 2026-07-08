import React, { lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';

const MemeCoinPump = lazy(() =>
  import('../../minigames/MemeCoinPump')
  .then(m => ({ default: m.MemeCoinPump })));

interface CryptoMineRushProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
}

export const CryptoMineRush: React.FC<CryptoMineRushProps> = ({ onComplete, level, tier }) => {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Blockchain...</div>}>
      <MemeCoinPump
        onComplete={onComplete}
        level={level}
        tier={tier}
        title="MINING RUSH"
        instruction="Shake to mine — every block counts before the difficulty spikes"
        icon="⛏️"
        scoreLabel="BLOCKS"
        accentColor="amber"
      />
    </Suspense>
  );
};
