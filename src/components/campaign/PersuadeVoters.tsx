import React from 'react';
import { GhostMode } from '../minigames/GhostMode';

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
      default: return '👥';
    }
  };

  return (
    <GhostMode
      title="PERSUADE VOTERS"
      instruction={`Win over ${demographic}!`}
      targetEmoji={getDemographicEmoji(demographic)}
      onComplete={onComplete}
    />
  );
};
