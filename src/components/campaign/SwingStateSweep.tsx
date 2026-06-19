import React from 'react';
import { MagneticSweep } from '../minigames/MagneticSweep';

interface SwingStateSweepProps {
  onComplete: (result: any) => void;
}

export const SwingStateSweep: React.FC<SwingStateSweepProps> = ({ onComplete }) => {
  return (
    <MagneticSweep
      title="SWING STATE SWEEP"
      instruction="Drag to collect electoral votes!"
      icon="🗳️"
      onComplete={onComplete}
    />
  );
};
