import React from 'react';
import { PatternMemory } from '../minigames/PatternMemory';

interface NegotiateTreatyProps {
  onComplete: (multiplier: number) => void;
}

export const NegotiateTreaty: React.FC<NegotiateTreatyProps> = ({ onComplete }) => {
  return (
    <PatternMemory
      title="NEGOTIATE TREATY"
      instruction="DIPLOMATIC SEQUENCE"
      onComplete={onComplete}
    />
  );
};
