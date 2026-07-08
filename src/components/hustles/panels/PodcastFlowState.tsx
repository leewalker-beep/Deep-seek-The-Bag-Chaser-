import React, { lazy, Suspense } from 'react';
import type { Tier } from '../../../types/game';

const ContentCreation = lazy(() =>
  import('../../minigames/ContentCreation')
  .then(m => ({ default: m.ContentCreation })));

interface PodcastFlowStateProps {
  onComplete: (result: any) => void;
  level: number;
  tier: Tier;
}

export const PodcastFlowState: React.FC<PodcastFlowStateProps> = ({ onComplete, level, tier }) => {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Mic Check 1, 2...</div>}>
      <ContentCreation
        onComplete={onComplete}
        level={level}
        tier={tier}
        title="FLOW STATE"
        instruction="Hit the topics before the audience switches off — stay sharp"
        icon="🎙️"
        scoreLabel="LISTENERS"
        accentColor="blue"
      />
    </Suspense>
  );
};
