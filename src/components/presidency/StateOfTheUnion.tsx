import React from 'react';
import { HoldHype } from '../minigames/HoldHype';

interface StateOfTheUnionProps {
  onComplete: (multiplier: number) => void;
}

export const StateOfTheUnion: React.FC<StateOfTheUnionProps> = ({ onComplete }) => {
  return (
    <HoldHype
      title="STATE OF THE UNION"
      instruction="Hold to build applause, release perfectly!"
      onComplete={onComplete}
    />
  );
};
