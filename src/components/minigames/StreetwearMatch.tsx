import React from 'react';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';
import { ScreenprintMinigame } from './ScreenprintMinigame';
import { PopUpFrenzyMinigame } from './PopUpFrenzyMinigame';
import { WindowDisplayMinigame } from './WindowDisplayMinigame';

interface StreetwearMatchProps {
  level?: number;
  tier?: Tier;
  onComplete: (multiplier: number) => void;
}

export const StreetwearMatch: React.FC<StreetwearMatchProps> = ({ level = 1, tier = 'STARTUP', onComplete }) => {
  const scaling = getScalingMultiplier(level, tier);

  // Route to level-specific minigame mechanics
  if (level === 1) {
    return (
      <ScreenprintMinigame
        scaling={scaling}
        onComplete={onComplete}
      />
    );
  }

  if (level === 2) {
    return (
      <PopUpFrenzyMinigame
        scaling={scaling}
        onComplete={onComplete}
      />
    );
  }

  // level >= 3 (Flagship Store)
  return (
    <WindowDisplayMinigame
      scaling={scaling}
      onComplete={onComplete}
    />
  );
};
