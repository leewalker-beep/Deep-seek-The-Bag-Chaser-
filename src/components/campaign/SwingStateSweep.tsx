import React from 'react';
import { MagneticSweep } from '../minigames/MagneticSweep';

interface SwingStateSweepProps {
  onComplete: (res: { multiplier: number; isRare: boolean }) => void;
}

export const SwingStateSweep: React.FC<SwingStateSweepProps> = ({ onComplete }) => {
  return (
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
  );
};
