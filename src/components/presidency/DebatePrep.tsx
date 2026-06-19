import React from 'react';
import { TapRhythm } from '../minigames/TapRhythm';

interface DebatePrepProps {
  onComplete: (multiplier: number) => void;
}

export const DebatePrep: React.FC<DebatePrepProps> = ({ onComplete }) => {
  return (
    <TapRhythm
      title="DEBATE PREP"
      instruction="ANSWER IN RHYTHM"
      icon="🎤"
      onComplete={onComplete}
    />
  );
};
