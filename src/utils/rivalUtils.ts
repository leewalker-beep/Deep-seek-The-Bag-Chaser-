import type { Rival } from '../types/game';

export interface RivalRosterProfile {
  execution: number;
  vision: number;
  burnDiscipline: number;
  competence: number;
  loyalty: number;
  riskTolerance: number;
}

/**
 * Maps a Rival's existing personality stats onto the stat shapes used by Founder and RegionalExecutive.
 * All personality stats on Rival (riskTolerance, aggression, intelligence, ambition, ethics) range from 0 to 1,
 * and if undefined default to 0.5.
 * Output stats are in the range of 0 to 100 inclusive.
 */
export const getRivalRosterProfile = (rival: Rival): RivalRosterProfile => {
  // Extract traits with standard simulation-aligned defaults (0.5)
  const rt = rival.riskTolerance ?? 0.5;
  const agg = rival.aggression ?? 0.5;
  const intel = rival.intelligence ?? 0.5;
  const amb = rival.ambition ?? 0.5;
  const eth = rival.ethics ?? 0.5;
  const rel = rival.relationshipWithPlayer ?? 0; // Ranges from -100 to 100

  // 1. Founder stats: execution, vision, burnDiscipline (0-100 scale)
  // execution: high intelligence, driven by ambition
  const execution = Math.max(0, Math.min(100, Math.round(((intel * 0.6) + (amb * 0.4)) * 100)));

  // vision: high ambition, supported by riskTolerance and intelligence
  const vision = Math.max(0, Math.min(100, Math.round(((amb * 0.5) + (rt * 0.3) + (intel * 0.2)) * 100)));

  // burnDiscipline: high ethics, controlled/lower aggression, intelligent spending
  const burnDiscipline = Math.max(0, Math.min(100, Math.round(((eth * 0.5) + ((1 - agg) * 0.3) + (intel * 0.2)) * 100)));

  // 2. RegionalExecutive stats: competence, loyalty, riskTolerance (0-100 scale)
  // competence: high intelligence, seasoned with ambition
  const competence = Math.max(0, Math.min(100, Math.round(((intel * 0.7) + (amb * 0.3)) * 100)));

  // loyalty: high ethics, lower aggression, and scaled relationship with player
  // Normalize relationship from [-100, 100] to [0, 1] range
  const normRel = (rel + 100) / 200;
  const loyalty = Math.max(0, Math.min(100, Math.round(((eth * 0.4) + ((1 - agg) * 0.3) + (normRel * 0.3)) * 100)));

  // riskTolerance: direct 1:1 map of rival's riskTolerance
  const riskTolerance = Math.max(0, Math.min(100, Math.round(rt * 100)));

  return {
    execution,
    vision,
    burnDiscipline,
    competence,
    loyalty,
    riskTolerance,
  };
};
