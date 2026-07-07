import React, { lazy, Suspense } from 'react';
const MagneticSweep = lazy(() => import('../minigames/MagneticSweep').then(m => ({ default: m.MagneticSweep })));

interface SwingStateSweepProps {
  onComplete: (result: { multiplier: number; isRare: boolean }) => void;
}

export const SwingStateSweep: React.FC<SwingStateSweepProps> = ({ onComplete }) => {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Scanning the Electorate...</div>}>
      <MagneticSweep
      title="SWING STATE SWEEP"
      instruction="Drag to collect electoral votes!"
      icon="🗳️"
      itemEmojis={['🇺🇸', '🟦', '🟥', '🗳️']}
      rareEmoji="✨"
      scoreLabel="VOTES"
      rareLabel="MOMENTUM"
        onComplete={onComplete}
      />
    </Suspense>
  );
};
