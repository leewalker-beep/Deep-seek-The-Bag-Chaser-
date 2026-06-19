import React from 'react';
import { RiskMeter } from '../minigames/RiskMeter';

interface CrisisRiskAssessmentProps {
  onComplete: (multiplier: number) => void;
}

export const CrisisRiskAssessment: React.FC<CrisisRiskAssessmentProps> = ({ onComplete }) => {
  return (
    <RiskMeter
      title="CRISIS RISK ASSESSMENT"
      instruction="Balance risk vs reward"
      onComplete={onComplete}
    />
  );
};
