import type { PlayerStats, MarketType } from '../types/game';
import type { HustleLevel } from '../config/hustles/base';
import { calculateHustleMath, getEffectiveHustleStats } from '../engine/mathEngine';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface RiskAssessment {
  level: RiskLevel;
  reasons: string[];
  canBeFatal: boolean;
}

export const assessHustleRisk = (
  pl: PlayerStats,
  hustleId: string,
  levelData: HustleLevel,
  currentLevel: number,
  _market: MarketType
): RiskAssessment => {
  const reasons: string[] = [];
  let isExtreme = false;
  let isHigh = false;

  // 1. Calculate potential outcomes (Success and Failure)
  // Use 1.0 for minigame multiplier for baseline risk assessment
  const successMath = calculateHustleMath(hustleId, levelData, currentLevel, 1, 1, 1, 1, true, pl.mentalShieldTurns);
  const failureMath = calculateHustleMath(hustleId, levelData, currentLevel, 1, 1, 1, 1, false, pl.mentalShieldTurns);

  const effectiveSuccess = getEffectiveHustleStats(hustleId, levelData, pl, currentLevel, successMath);
  const effectiveFailure = getEffectiveHustleStats(hustleId, levelData, pl, currentLevel, failureMath);

  // 2. Mental Health Risk
  const failMentalHit = Math.abs(effectiveFailure.mentalHit);
  if (pl.mentalHealth <= failMentalHit) {
    isExtreme = true;
    reasons.push(`Failure would reduce Mental Health below zero (-${failMentalHit}% hit).`);
  } else if (pl.mentalHealth <= failMentalHit + 20) {
    isHigh = true;
    reasons.push(`Mental Health is low. A failure would leave you critically vulnerable.`);
  }

  // 3. Bankruptcy Risk
  const totalCost = effectiveSuccess.cost; // Cost is the same for success/fail in most cases
  if (pl.bag < totalCost) {
    isExtreme = true;
    reasons.push(`You cannot afford this action. You will enter debt (-$${(totalCost - pl.bag).toLocaleString()}).`);
  } else if (pl.bag < totalCost * 1.5) {
    isHigh = true;
    reasons.push(`Your cash reserves are thin. This investment leaves little room for error.`);
  }

  // 4. Heat / Arrest Risk
  const projectedHeat = pl.heat + effectiveSuccess.heatHit;
  if (projectedHeat >= 100) {
    isExtreme = true;
    reasons.push(`This action will trigger an immediate police raid (100% Heat).`);
  } else if (projectedHeat >= 80) {
    isHigh = true;
    reasons.push(`Heat is reaching critical levels (${Math.round(projectedHeat)}%). Arrest is highly likely.`);
  }

  // 5. Reputation Risk
  if (pl.clout < 10) {
    isHigh = true;
    reasons.push(`Your Clout is dangerously low. Further loss may end your career.`);
  }
  if (pl.aura < 10) {
    isHigh = true;
    reasons.push(`Your Reputation (Aura) is failing. One more scandal could be fatal.`);
  }

  // Determine Final Level
  let level: RiskLevel = 'LOW';
  if (isExtreme) level = 'EXTREME';
  else if (isHigh) level = 'HIGH';
  else if (failMentalHit > 30 || totalCost > 500000) level = 'MODERATE';

  return {
    level,
    reasons,
    canBeFatal: isExtreme
  };
};
