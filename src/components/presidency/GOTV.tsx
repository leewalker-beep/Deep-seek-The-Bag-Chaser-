import React from 'react';
import { StruggleMash } from '../minigames/StruggleMash';

interface GOTVProps {
  onComplete: (multiplier: number) => void;
}

export const GOTV: React.FC<GOTVProps> = ({ onComplete }) => {
  return (
    <StruggleMash
      title="GET OUT THE VOTE"
      instruction="Mash to mobilize volunteers!"
      mashLabel="MOBILIZE!!!"
      targetLabel="TARGET: 90% TURNOUT"
      onComplete={onComplete}
    />
  );
};
