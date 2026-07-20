import type { Tier, PlayerStats } from '../types/game';
import { recordHistoryEvent, type HistoryEvent } from './historyEngine';

export interface BiographyUpdate {
  entry: string;
  key?: string;
}

/**
 * Checks if a biography entry with a specific key has already been recorded.
 * If a key is provided and already exists in recordedBioKeys, returns null.
 * Otherwise records it in the history engine and returns the formatted entry and the key.
 */
export const recordEvent = (
  pl: PlayerStats,
  entry: string,
  key?: string,
  category: HistoryEvent['category'] = 'CAREER',
  importance: HistoryEvent['importance'] = 3,
  title?: string,
  participants?: string[]
): BiographyUpdate | null => {
  if (key && pl.recordedBioKeys?.includes(key)) {
    return null;
  }

  if (key) {
    const computedTitle = title || formatTitleFromKey(key);
    recordHistoryEvent(pl, {
      id: key,
      title: computedTitle,
      description: entry,
      category,
      importance,
      participants,
      month: pl.month,
      excludeFromBiography: true // Let caller append to pl.biography to prevent double-appends
    });
  }

  return { entry, key };
};

function formatTitleFromKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const recordOrigin = (pl: PlayerStats, backgroundName: string, tier: Tier): BiographyUpdate | null => {
  const templates = [
    `Started life in the ${tier} tier as a ${backgroundName}.`,
    `Born into the ${tier} tier, beginning the journey as a ${backgroundName}.`,
    `The story began in the ${tier} tier, where a young ${backgroundName} first learned to hustle.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, 'origin', 'CAREER', 2, 'Started Journey');
};

export const recordBusiness = (pl: PlayerStats, businessName: string, age: number): BiographyUpdate | null => {
  const templates = [
    `Built the first ${businessName} at age ${age}.`,
    `Established a ${businessName} operation at ${age}, marking a major milestone.`,
    `The first ${businessName} was founded at age ${age}, laying the groundwork for the future.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];

  // First Business vs. Company
  const isFirstBusiness = !pl.history?.some(h => h.category === 'BUSINESS');
  const importance = isFirstBusiness ? 3 : 2;
  const title = isFirstBusiness ? 'First Business' : 'New Venture Founded';

  const key = `business_${businessName.replace(/\s+/g, '_').toLowerCase()}`;
  return recordEvent(pl, entry, key, 'BUSINESS', importance, title);
};

export const recordMastery = (pl: PlayerStats, hustleName: string): BiographyUpdate | null => {
  const templates = [
    `Reached absolute mastery in ${hustleName}.`,
    `Became a legendary figure in ${hustleName}, leaving all competition behind.`,
    `Achieved total dominance in the field of ${hustleName}.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `mastery_${hustleName.replace(/\s+/g, '_').toLowerCase()}`, 'CAREER', 3, 'Hustle Mastered');
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
  return recordEvent(
    pl,
    `Defeated ${rivalName}, establishing dominance over ${tierContext[tier] || tier}.`,
    `rival_${rivalName.replace(/\s+/g, '_').toLowerCase()}`,
    'RIVAL',
    4,
    'Rival Defeated',
    [rivalName]
  );
};

export const recordRivalRecruitment = (pl: PlayerStats, rivalName: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Turned longtime rival ${rivalName} into a business partner.`,
    `recruit_${rivalName.replace(/\s+/g, '_').toLowerCase()}`,
    'RIVAL',
    3,
    'Rival Recruited',
    [rivalName]
  );
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

  let importance: HistoryEvent['importance'] = 4;
  let title = 'Advanced Tier';
  if (tier === 'PRESIDENT') {
    importance = 5;
    title = 'Became President';
  } else if (tier === 'OPEN') {
    importance = 5;
    title = 'Entered OPEN';
  }

  return recordEvent(pl, entry, `tier_${tier}`, 'CAREER', importance, title);
};

export const recordWorldEventSurvival = (pl: PlayerStats, eventName: string): BiographyUpdate | null => {
  return recordEvent(pl, `Survived the ${eventName}.`, `world_event_${eventName.replace(/\s+/g, '_').toLowerCase()}`, 'WORLD', 2, 'Survived Event');
};

export const recordScandal = (pl: PlayerStats, scandalType: string): BiographyUpdate | null => {
  const entry = scandalType === 'DATA_BREACH'
    ? `Managed to navigate a major data breach that threatened the entire operation.`
    : scandalType === 'POLICE_RAID_RISK'
    ? `Narrowly avoided a massive federal crackdown during a high-stakes period.`
    : scandalType === 'ARREST'
    ? `His ambitions were interrupted by a spell behind bars, a setback that tested his resolve.`
    : `Weathered a major scandal that would have ended a lesser career.`;

  const title = scandalType === 'ARREST' ? 'Prison Sentence' : 'Scandal Triggered';
  return recordEvent(pl, entry, `scandal_${scandalType}`, 'CRIME', 4, title);
};

export const recordPresidencyAchievement = (pl: PlayerStats, orderName: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `As President, successfully implemented the ${orderName} initiative.`,
    `presidency_${orderName.replace(/\s+/g, '_').toLowerCase()}`,
    'POLITICS',
    4,
    'Major Law Passed'
  );
};

export const recordCabinetAppointment = (pl: PlayerStats, name: string, role: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Appointed ${name} as ${role}, a key move in shaping the administration.`,
    `appoint_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'POLITICS',
    4,
    'Cabinet Member Appointed',
    [name]
  );
};

export const recordCelebrityMarriage = (pl: PlayerStats, name: string, relationship: number): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Married the renowned celebrity ${name} (Chemistry: ${relationship}/100) in a lavish high-society wedding, solidifying an elite power couple status.`,
    `marry_celebrity_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Married Celebrity',
    [name]
  );
};

export const recordCabinetDismissal = (pl: PlayerStats, name: string, role: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Dismissed ${name} from the role of ${role} following a cabinet shakeup.`,
    `dismiss_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'POLITICS',
    3,
    'Cabinet Member Dismissed',
    [name]
  );
};

export const recordSpecialization = (pl: PlayerStats, specializationName: string): BiographyUpdate | null => {
  const templates = [
    `Doubled down on the path of the ${specializationName}.`,
    `Committed fully to the way of the ${specializationName}.`,
    `The ${specializationName} path became the primary focus, shaping all future moves.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `spec_focus_${specializationName.replace(/\s+/g, '_').toLowerCase()}`, 'CAREER', 3, 'Specialization Chosen');
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

  return recordEvent(pl, entry, 'arrest_summary', 'CRIME', 4, 'Arrest Summary');
};

export const recordDeath = (pl: PlayerStats, endingTitle: string, deathCause: string): BiographyUpdate | null => {
  return recordEvent(pl, `Remembered as ${endingTitle}. ${deathCause}`, 'death', 'LEGACY', 5, 'Life Ended');
};

export const recordLegacyUnlock = (pl: PlayerStats, upgradeName: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Left a lasting legacy by unlocking ${upgradeName}.`,
    `legacy_${upgradeName.replace(/\s+/g, '_').toLowerCase()}`,
    'LEGACY',
    5,
    'Monument Built'
  );
};

export const recordArtistBooking = (pl: PlayerStats, name: string, level: number): BiographyUpdate | null => {
  const venues = ['Club Tour', 'Headline Stadium'];
  const venue = venues[level - 1] || 'Festival Circuit';
  return recordEvent(
    pl,
    `Booked ${name} for a live performance at the ${venue}, driving massive grassroots fan engagement.`,
    `book_artist_${name.replace(/\s+/g, '_').toLowerCase()}_lvl_${level}`,
    'CAREER',
    3,
    'Artist Booked for Gig',
    [name]
  );
};

export const recordArtistSigning = (pl: PlayerStats, name: string, tier: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Signed ${tier} artist ${name} to a music label contract, expanding the creative roster.`,
    `sign_artist_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Artist Signed to Label',
    [name]
  );
};

export const recordTalentSigning = (pl: PlayerStats, name: string, relationship: number): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Signed high-profile talent ${name} to the agency roster with an initial chemistry rating of ${relationship}/100.`,
    `sign_talent_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Talent Signed',
    [name]
  );
};

export const recordMovieCasting = (pl: PlayerStats, actorName: string, movieTitle: string, rating: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Cast ${actorName} in "${movieTitle}", which went on to become a ${rating.toLowerCase()} at the box office.`,
    `cast_movie_${movieTitle.replace(/\s+/g, '_').toLowerCase()}_${actorName.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Movie Cast & Released',
    [actorName]
  );
};

export const recordFounderBacked = (pl: PlayerStats, name: string, companyName: string): BiographyUpdate | null => {
  return recordEvent(
    pl,
    `Invested venture capital into backed founder ${name}, seeding the growth of ${companyName}.`,
    `back_founder_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'BUSINESS',
    3,
    'Founder Backed',
    [name]
  );
};

export const recordCEOAppointment = (pl: PlayerStats, name: string, division: string): BiographyUpdate | null => {
  const divisionNames: Record<string, string> = {
    'na_tech': 'North America Technology',
    'eu_mfg': 'Europe Manufacturing',
    'apac_retail': 'Asia-Pacific Retail',
    'latam_log': 'Latin America Logistics'
  };
  const divisionName = divisionNames[division] || division;
  return recordEvent(
    pl,
    `Appointed ${name} as Regional CEO of the ${divisionName} division.`,
    `appoint_ceo_${name.replace(/\s+/g, '_').toLowerCase()}_${division}`,
    'BUSINESS',
    3,
    'Regional CEO Appointed',
    [name]
  );
};
