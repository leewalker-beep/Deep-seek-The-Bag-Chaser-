import type { Tier, PlayerStats } from '../types/game';

export interface BiographyUpdate {
  entry: string;
  key?: string;
}

/**
 * Checks if a biography entry with a specific key has already been recorded.
 * If a key is provided and already exists in recordedBioKeys, returns null.
 * Otherwise returns the formatted entry and the key to be recorded.
 */
export const recordEvent = (
  pl: PlayerStats,
  entry: string,
  key?: string
): BiographyUpdate | null => {
  if (key && pl.recordedBioKeys?.includes(key)) {
    return null;
  }
  return { entry, key };
};

export const recordOrigin = (pl: PlayerStats, backgroundName: string, tier: Tier): BiographyUpdate | null => {
  const templates = [
    `Started life in the ${tier} tier as a ${backgroundName}.`,
    `Born into the ${tier} tier, beginning the journey as a ${backgroundName}.`,
    `The story began in the ${tier} tier, where a young ${backgroundName} first learned to hustle.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, 'origin');
};

export const recordBusiness = (pl: PlayerStats, businessName: string, age: number): BiographyUpdate | null => {
  const templates = [
    `Built the first ${businessName} at age ${age}.`,
    `Established a ${businessName} operation at ${age}, marking a major milestone.`,
    `The first ${businessName} was founded at age ${age}, laying the groundwork for the future.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `business_${businessName.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordMastery = (pl: PlayerStats, hustleName: string): BiographyUpdate | null => {
  const templates = [
    `Reached absolute mastery in ${hustleName}.`,
    `Became a legendary figure in ${hustleName}, leaving all competition behind.`,
    `Achieved total dominance in the field of ${hustleName}.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `mastery_${hustleName.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordRivalDefeat = (pl: PlayerStats, rivalName: string, tier: Tier): BiographyUpdate | null => {
  const tierContext: Record<string, string> = {
    'MUD': 'the gutters',
    'STREET': 'the block',
    'STARTUP': 'the tech scene',
    'CORPORATE': 'the boardroom',
    'ELITE': 'high society',
    'MOGUL': 'global markets',
    'PRESIDENT': 'the capital',
    'OPEN': 'the world stage'
  };
  return recordEvent(pl, `Defeated ${rivalName}, establishing dominance over ${tierContext[tier] || tier}.`, `rival_${rivalName.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordTierAdvancement = (pl: PlayerStats, tier: Tier, specialization?: string): BiographyUpdate | null => {
  const templatesSpec = [
    `Rose to the ${tier} tier, specializing as a ${specialization}.`,
    `Ascended to the ${tier} ranks, finding a true calling as a ${specialization}.`,
    `Left the previous life behind to join the ${tier} tier as a recognized ${specialization}.`
  ];
  const templatesBase = [
    `Advanced to the ${tier} tier.`,
    `Broke through the ceiling to reach the ${tier} tier.`,
    `The journey continued into the ${tier} tier.`
  ];
  const entry = specialization
    ? templatesSpec[Math.floor(Math.random() * templatesSpec.length)]
    : templatesBase[Math.floor(Math.random() * templatesBase.length)];
  return recordEvent(pl, entry, `tier_${tier}`);
};

export const recordWorldEventSurvival = (pl: PlayerStats, eventName: string): BiographyUpdate | null => {
  return recordEvent(pl, `Survived the ${eventName}.`, `world_event_${eventName.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordScandal = (pl: PlayerStats, scandalType: string): BiographyUpdate | null => {
  const entry = scandalType === 'DATA_BREACH'
    ? `Managed to navigate a major data breach that threatened the entire operation.`
    : scandalType === 'POLICE_RAID_RISK'
    ? `Narrowly avoided a massive federal crackdown during a high-stakes period.`
    : scandalType === 'ARREST'
    ? `His ambitions were interrupted by a spell behind bars, a setback that tested his resolve.`
    : `Weathered a major scandal that would have ended a lesser career.`;

  return recordEvent(pl, entry, `scandal_${scandalType}`);
};

export const recordPresidencyAchievement = (pl: PlayerStats, orderName: string): BiographyUpdate | null => {
  return recordEvent(pl, `As President, successfully implemented the ${orderName} initiative.`, `presidency_${orderName.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordCabinetAppointment = (pl: PlayerStats, name: string, role: string): BiographyUpdate | null => {
  return recordEvent(pl, `Appointed ${name} as ${role}, a key move in shaping the administration.`, `appoint_${name.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordCabinetDismissal = (pl: PlayerStats, name: string, role: string): BiographyUpdate | null => {
  return recordEvent(pl, `Dismissed ${name} from the role of ${role} following a cabinet shakeup.`, `dismiss_${name.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordSpecialization = (pl: PlayerStats, specializationName: string): BiographyUpdate | null => {
  const templates = [
    `Doubled down on the path of the ${specializationName}.`,
    `Committed fully to the way of the ${specializationName}.`,
    `The ${specializationName} path became the primary focus, shaping all future moves.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `spec_focus_${specializationName.replace(/\s+/g, '_').toLowerCase()}`);
};

export const recordArrestSummary = (pl: PlayerStats): BiographyUpdate | null => {
  if (!pl.arrestCount || pl.arrestCount <= 1) return null;

  let entry = '';
  if (pl.arrestCount === 2) {
    entry = `Throughout his rise he was arrested twice, each setback becoming another chapter in his climb back.`;
  } else if (pl.arrestCount === 3) {
    entry = `Throughout his rise he was arrested three times, each setback becoming another chapter in his climb back.`;
  } else {
    entry = `Despite ${pl.arrestCount} arrests, he repeatedly rebuilt his empire, becoming as infamous as he was successful.`;
  }

  return recordEvent(pl, entry, 'arrest_summary');
};

export const recordDeath = (pl: PlayerStats, endingTitle: string, deathCause: string): BiographyUpdate | null => {
  return recordEvent(pl, `Remembered as ${endingTitle}. ${deathCause}`, 'death');
};

export const recordLegacyUnlock = (pl: PlayerStats, upgradeName: string): BiographyUpdate | null => {
  return recordEvent(pl, `Left a lasting legacy by unlocking ${upgradeName}.`, `legacy_${upgradeName.replace(/\s+/g, '_').toLowerCase()}`);
};
