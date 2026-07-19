import type { PlayerStats, GameAction } from '../types/game';
import { HUSTLES } from '../config/hustles/base';

export interface BehavioralProfile {
  paceSeconds: number;
  paceLabel: 'Fast' | 'Deliberate';
  adviceGiven: number;
  adviceFollowed: number;
  adviceRatio: number;
  setbackEscalations: number;
  setbackRetreats: number;
  setbackRatio: number;
  riskCadenceRatio: number;
  orientationScore: number; // -100 to +100
  orientationLabel: 'Power & Self' | 'Others & Principles';
  primaryColor: 'CRIMSON' | 'GOLD' | 'COBALT' | 'VIOLET';
  colorHex: string;
  colorDescription: string;
  dominantPersona: string;
  synthesisLines: string[];
}

export function calculateAveragePace(actionLog: GameAction[]): number {
  if (!actionLog || actionLog.length < 2) {
    return 5.0; // Standard fallback
  }

  // Sort chronologically ascending
  const sorted = [...actionLog].sort((a, b) => a.timestamp - b.timestamp);
  let totalClippedSeconds = 0;
  let intervalCount = 0;

  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].timestamp - sorted[i - 1].timestamp;
    if (diffMs > 0) {
      // Clip intervals to 60 seconds (60,000 ms) to avoid AFK distortion
      const clippedMs = Math.min(diffMs, 60000);
      totalClippedSeconds += clippedMs / 1000;
      intervalCount++;
    }
  }

  return intervalCount > 0 ? parseFloat((totalClippedSeconds / intervalCount).toFixed(2)) : 5.0;
}

export function analyzeBehavior(pl: PlayerStats): BehavioralProfile {
  // 1. Compute Pace
  const actionLog = pl.actionLog || [];
  const paceSeconds = calculateAveragePace(actionLog);
  const paceLabel = paceSeconds <= 6.0 ? 'Fast' : 'Deliberate';

  // 2. Compute Advice Compliance
  const adviceGiven = pl.adviceGivenCount || 0;
  const adviceFollowed = pl.adviceFollowedCount || 0;
  const adviceRatio = adviceGiven > 0 ? parseFloat((adviceFollowed / adviceGiven).toFixed(2)) : 1.0;

  // 3. Compute Setback Response
  const setbackEscalations = pl.escalationCount || 0;
  const setbackRetreats = pl.retreatCount || 0;
  const setbackTotal = setbackEscalations + setbackRetreats;
  const setbackRatio = setbackTotal > 0 ? parseFloat((setbackRetreats / setbackTotal).toFixed(2)) : 0.5;

  // 4. Compute Risk Cadence Ratio
  // Ratio of risky actions (where heatHit > 0 or has heat) to total actions
  const totalActionsCount = actionLog.length;
  const riskyActionsCount = actionLog.filter(a => {
    // If it has a heat hit or increases heat in level/branch definition
    const h = HUSTLES[a.hustleId];
    let isRisky = false;
    if (h) {
      if (h.branches && a.branchId) {
        const br = h.branches[a.branchId];
        isRisky = (br && br.heatHit && br.heatHit > 0) ? true : false;
      } else if (h.levels) {
        const lvl = h.levels.find(l => l.level === a.level);
        isRisky = (lvl && lvl.heatHit && lvl.heatHit > 0) ? true : false;
      }
    }
    return isRisky || (a.yieldCash > 0 && a.hustleId !== 'r_sleep' && a.hustleId !== 'power_nap');
  }).length;
  const riskCadenceRatio = totalActionsCount > 0 ? parseFloat((riskyActionsCount / totalActionsCount).toFixed(2)) : 0.2;

  // 5. Compute Orientation Score (-100 to +100)
  let orientationScore = 0;

  // Advice compliance component (-30 to +30)
  if (adviceGiven > 0) {
    orientationScore += (adviceRatio * 60) - 30;
  } else {
    orientationScore += 10; // Neutral-positive starting credit
  }

  // Setback response component (-25 to +25)
  if (setbackTotal > 0) {
    orientationScore += ((setbackRetreats / setbackTotal) * 50) - 25;
  }

  // Risk cadence component (-20 to +20)
  orientationScore += (1.0 - riskCadenceRatio * 2) * 20;

  // Philanthropy component (+20)
  const isPhilanthropist = pl.philanthropyDonation && pl.philanthropyDonation > 100000;
  const ownsPhilanthropy = (pl.hustleLevels?.['philanthropy_empire'] || 0) > 0;
  if (isPhilanthropist || ownsPhilanthropy) {
    orientationScore += 20;
  }

  // Public Persona/Reputation component (-35 to +35)
  const currentRep = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";
  const positiveReps = ["The Philanthropist", "The Reformer", "The People's Champion"];
  const negativeReps = ["The Crime Boss", "The Controversial Tycoon", "The Shadow Broker"];
  const neutralSelfReps = ["The Billionaire", "The Kingmaker"];

  if (positiveReps.includes(currentRep)) {
    orientationScore += 35;
  } else if (negativeReps.includes(currentRep)) {
    orientationScore -= 35;
  } else if (neutralSelfReps.includes(currentRep)) {
    orientationScore -= 15;
  }

  // Clamp Orientation Score
  orientationScore = Math.max(-100, Math.min(100, Math.round(orientationScore)));
  const orientationLabel = orientationScore < 0 ? 'Power & Self' : 'Others & Principles';

  // 6. Assign Primary Color
  let primaryColor: 'CRIMSON' | 'GOLD' | 'COBALT' | 'VIOLET' = 'GOLD';
  let colorHex = '#Eab308'; // Gold
  let colorDescription = '';

  if (paceLabel === 'Fast') {
    if (orientationScore < 0) {
      primaryColor = 'CRIMSON';
      colorHex = '#Ef4444';
      colorDescription = 'Fast-paced, aggressive, and power-focused. You move like a storm, taking high risks and pushing forward regardless of warnings.';
    } else {
      primaryColor = 'VIOLET';
      colorHex = '#8b5cf6';
      colorDescription = 'Fast-paced, charismatic, and principle-focused. You make decisions quickly but manage to bring others along with you, building massive public appeal.';
    }
  } else { // Deliberate
    if (orientationScore < 0) {
      primaryColor = 'COBALT';
      colorHex = '#3b82f6';
      colorDescription = 'Deliberate, calculated, and power-focused. You plan multiple moves ahead, carefully avoiding unforced errors while quietly amassing leverage and control.';
    } else {
      primaryColor = 'GOLD';
      colorHex = '#eab308';
      colorDescription = 'Deliberate, methodical, and principle-focused. You are the rock of stability, adhering to recommendations, prioritizing recovery, and protecting your network.';
    }
  }

  // 7. Select Synthesis Lines (Voice of the Advisor)
  const synthesisLines: string[] = [];

  // TENSION 1: Fast + Low Advice + Risky + Successful
  if (paceLabel === 'Fast' && adviceRatio < 0.4 && riskCadenceRatio > 0.4 && pl.bag >= 10000000) {
    synthesisLines.push(
      "You moved fast, ignored my recommendations, and played with fire the whole way—and somehow, you won. That's either raw, unfiltered instinct or pure devil's luck, and at your current net worth, I've stopped being able to tell the difference. Just remember: the jail cell door only needs to catch you being careless once."
    );
  }

  // TENSION 2: Deliberate + High Advice + Retreats
  if (paceLabel === 'Deliberate' && adviceRatio >= 0.7 && setbackRatio >= 0.6) {
    synthesisLines.push(
      "You played the long game exactly by the book. Every time the sirens started singing or the market dipped, you pulled back, took a breath, and listened to my advice. It cost you some early upside, sure, but you built a fortress that nobody could break. A clean, untouchable legacy."
    );
  }

  // TENSION 3: Deliberate + Low Advice + Self-focused
  if (paceLabel === 'Deliberate' && adviceRatio < 0.5 && orientationScore < 0) {
    synthesisLines.push(
      "You are a calculated machine. You didn't listen to me because you already had your own cold, methodical plan. You waited, you watched, and you struck only when the margins were absolute. It's not a warm legacy, but nobody can argue with the size of your empire."
    );
  }

  // TENSION 4: Fast + High Advice + High Risk
  if (paceLabel === 'Fast' && adviceRatio >= 0.6 && riskCadenceRatio > 0.5) {
    synthesisLines.push(
      "You lived in the fast lane but still kept your ear to the ground. You trusted my guidance when the heat was peaking, balancing high-stakes publicity stunts with calculated survival moves. You're a showman who knows exactly when to play the crowd and when to pay the taxman."
    );
  }

  // TENSION 5: High Diversity + Fast Pace (Restless/Generalist)
  const uniqueHustlesCount = Object.keys(pl.hustleLevels || {}).length;
  if (uniqueHustlesCount >= 6 && paceLabel === 'Fast') {
    synthesisLines.push(
      "You've got a restless spirit, Chaser. You jumped from streetwear drops to record labels, from real estate flips to crypto mining, never staying in one sector long enough to let the dust settle. You wanted to own the whole city at once, and you nearly did."
    );
  }

  // TENSION 6: Low Diversity + Deliberate Pace (Specialist/Obsessive)
  if (uniqueHustlesCount > 0 && uniqueHustlesCount <= 3 && paceLabel === 'Deliberate') {
    synthesisLines.push(
      "You have a near-obsessive focus. While others scrambled to diversify, you locked onto a single target and upgraded it to the absolute heavens. It's a heavy, singular gamble, but you proved that mastering one corner of the board beats spreading yourself thin."
    );
  }

  // TENSION 7: Fast + Others-focused + Low Risk
  if (paceLabel === 'Fast' && orientationScore >= 20 && riskCadenceRatio < 0.3) {
    synthesisLines.push(
      "You ran at a breakneck pace but kept your hands remarkably clean. You managed to build massive public admiration and keep your mental health intact without resorting to shady underground deals. That's a rare feat in a city this dirty."
    );
  }

  // TENSION 8: Deliberate + High Risk + Low Advice
  if (paceLabel === 'Deliberate' && riskCadenceRatio > 0.4 && adviceRatio < 0.5) {
    synthesisLines.push(
      "You took your time to plan the most dangerous plays. You didn't rush, but you repeatedly ignored my warnings to pursue high-heat, high-risk corporate battles. It was a stressful, volatile climb, but you clearly thrive in the chaos."
    );
  }

  // TENSION 9: Neutral / Balance fallback
  if (synthesisLines.length === 0) {
    if (orientationScore >= 0) {
      synthesisLines.push(
        "You maintained a highly balanced profile throughout the run. By combining a steady pace with selective risk management and consistent consultation, you established a respectable footprint without risking ruin."
      );
    } else {
      synthesisLines.push(
        "Your run was defined by pragmatic self-reliance. You paced your expansions carefully, capitalizing on lucrative opportunities while selectively ignoring warnings whenever the cash potential justified the heat."
      );
    }
  }

  return {
    paceSeconds,
    paceLabel,
    adviceGiven,
    adviceFollowed,
    adviceRatio,
    setbackEscalations,
    setbackRetreats,
    setbackRatio,
    riskCadenceRatio,
    orientationScore,
    orientationLabel,
    primaryColor,
    colorHex,
    colorDescription,
    dominantPersona: currentRep,
    synthesisLines
  };
}
