import React from 'react';
import { SequenceRecall } from '../minigames/SequenceRecall';

interface LegislativeAgendaProps {
  onComplete: (multiplier: number) => void;
}

export const LegislativeAgenda: React.FC<LegislativeAgendaProps> = ({ onComplete }) => {
  return (
    <SequenceRecall
      title="LEGISLATIVE AGENDA"
      instruction="Recall bill order!"
      onComplete={onComplete}
    />
  );
};
