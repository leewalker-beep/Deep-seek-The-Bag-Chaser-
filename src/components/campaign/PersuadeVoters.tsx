import React, { lazy, Suspense } from 'react';
const GhostMode = lazy(() => import('../minigames/GhostMode').then(m => ({ default: m.GhostMode })));

interface PersuadeVotersProps {
  demographic: string;
  onComplete: (multiplier: number) => void;
}

export const PersuadeVoters: React.FC<PersuadeVotersProps> = ({ demographic, onComplete }) => {
  const getDemographicEmoji = (dem: string) => {
    switch (dem.toLowerCase()) {
      case 'latinos': return '🤝';
      case 'seniors': return '👴';
      case 'veterans': return '🎖️';
      case 'youth': return '🎮';
      case 'suburban': return '🏡';
      case 'rural': return '🚜';
      case 'urban': return '🏙️';
      default: return '👥';
    }
  };

  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Launching Ground Game...</div>}>
      <GhostMode
        title="PERSUADE VOTERS"
        instruction={`Win over ${demographic}!`}
        targetEmoji={getDemographicEmoji(demographic)}
        scoreLabel="APPROVAL"
        onComplete={onComplete}
      />
    </Suspense>
  );
};
