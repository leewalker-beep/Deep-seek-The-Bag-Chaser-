import type { Rival } from '../types/game';
import { WORLD_FEED_CONTENT } from './worldFeedLoader';

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

/**
 * Checks if a Rival is eligible to be recruited as an ally.
 * Eligibility requires the rival to not already be recruited, and to meet one of the following criteria:
 * - relationshipWithPlayer >= 40
 * - sabotagedCount >= 3
 * - helpedCount >= 3
 */
export const isRivalEligibleForRecruit = (rival: Rival): boolean => {
  if (rival.status === 'ally') {
    return false;
  }
  const rel = rival.relationshipWithPlayer ?? 0;
  const sab = rival.sabotagedCount ?? 0;
  const help = rival.helpedCount ?? 0;
  return rel >= 40 || sab >= 3 || help >= 3;
};

/**
 * Resolves a brief callback line referencing prior history of a character.
 */
export function getCharacterCallbackLine(player: any, characterId: string | undefined): string | null {
  if (!characterId) return null;

  const flags = player.narrativeFlags || {};
  const d = WORLD_FEED_CONTENT?.callbackTemplates || {};

  // Character-specific historical memory overrides
  if (characterId === 'char_cassie') {
    const isInvolved = player.completedNarrativeEvents?.some((e: string) => e.includes('char_cassie_intel')) || flags['cassie_buy_shares'] || flags['cassie_take_control'];
    if (isInvolved) {
      return d.char_cassie || "History: Cassie remembers the thrift shop exchanges and shipping merger details you traded with her.";
    }
  }

  if (characterId === 'char_marcus' || characterId === 'char_marcus_v2') {
    if (flags['cut_ties_marcus']) {
      return d.char_marcus_cut || "History: Tensions linger after you cut ties with Marcus to protect your public persona.";
    }
    const isAlly = player.npcs?.some((n: any) => n.id === 'char_marcus' && n.disposition > 60) || flags['marcus_help'];
    if (isAlly) {
      return d.char_marcus_ally || "History: Marcus Miller, your childhood confidant from the mud blocks. He still remembers when your biggest worry was paying rent.";
    }
  }

  if (characterId === 'char_pops') {
    if (flags['pops_give_back'] || flags['pops_fund_hub'] || flags['pops_reflect_roots']) {
      return d.char_pops_generosity || "History: Pops Jenkins remembers your promise to keep your feet on the dirt and your generosity to the old block.";
    }
    if (flags['pops_intimidate']) {
      return d.char_pops_disappointment || "History: Pops still looks at you with weary disappointment after you used raw intimidation on the neighborhood anchor.";
    }
  }

  if (characterId === 'char_slick') {
    if (flags['slick_consignment_accept'] || flags['slick_heist'] || flags['slick_accept']) {
      return d.char_slick || "History: Terrence 'Slick' Reed remembers the high-stakes consignments and heist schemes you shared.";
    }
  }

  if (characterId === 'char_rosa') {
    if (flags['rosa_concede'] || flags['rosa_fund_campaign'] || flags['rosa_help']) {
      return d.char_rosa_generosity || "History: Mama Rosa Mendez remembers your support for the neighborhood workers and clinic fundraiser.";
    }
    if (flags['rosa_break']) {
      return d.char_rosa_disappointment || "History: Rosa looks at you coldly, remembering how you prioritized corporate margins over neighborhood lives.";
    }
  }

  if (characterId === 'char_sofia') {
    if (flags['sofia_lead'] || flags['sofia_un_speech'] || flags['sofia_nobel']) {
      return d.char_sofia || "History: Sofia Ramirez remembers your key funding during her Mayor and UN speech campaigns.";
    }
  }

  if (characterId === 'char_victor' || characterId === 'char_victor_v2') {
    if (player.crushedRivals?.includes('char_victor') || player.crushedRivals?.includes('char_victor_v2')) {
      return d.char_victor_crushed || "History: Chairman Kane remembers when you seized his corporate sectors. He wants to erase your name from history.";
    }
  }

  // 1. crushedRivals
  if (player.crushedRivals?.includes(characterId)) {
    return d.fallback_crushed || `History: You crushed them as a rival, but they respect/fear your authority now.`;
  }

  // 2. completedNarrativeEvents
  if (player.completedNarrativeEvents?.some((e: string) => e.includes(characterId))) {
    return d.fallback_key_point || `History: You met during a prior key turning point in your journey.`;
  }

  // 3. rel_ flag
  const relFlag = player.narrativeFlags?.[`rel_${characterId}`];
  if (relFlag) {
    const relVal = Number(relFlag);
    if (relVal > 60) {
      return d.fallback_generosity || `History: They remember your past generosity and support.`;
    } else if (relVal < 40) {
      return d.fallback_tensions || `History: Past tensions still linger under the surface.`;
    }
  }

  // 4. persistent NPCs
  const matchingNpc = player.npcs?.find((n: any) => n.id === characterId);
  if (matchingNpc) {
    if (matchingNpc.disposition > 60) {
      return d.fallback_loyalty || `History: A close contact who remembers your loyalty.`;
    } else if (matchingNpc.disposition < 40) {
      return d.fallback_tense || `History: Tense past history. Watch your back.`;
    }
  }

  return null;
}
