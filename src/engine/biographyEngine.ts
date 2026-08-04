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

const getPlayerName = (pl: PlayerStats): string => pl.name || "the Chaser";

export const recordOrigin = (pl: PlayerStats, backgroundName: string, tier: Tier): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  const templates = [
    `Started life in the ${tier} tier as a ${backgroundName}. Even in those early, quiet days for ${name}, there was a restless, underlying drive—a quiet refusal to accept the limits of birth, and a realization that any future would have to be carved out of the city by hand.`,
    `Born into the ${tier} tier, beginning the journey as a ${backgroundName}. For ${name}, it was a humble, difficult beginning, but the lessons of survival learned on those streets would eventually become the foundation of a historic rise.`,
    `The story began in the ${tier} tier, where a young ${backgroundName} named ${name} first learned to hustle. Armed with nothing but ambition and a relentless work ethic, this initial chapter was a masterclass in raw survival, planting the seeds for what would become an extraordinary legacy.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, 'origin', 'CAREER', 2, 'Started Journey');
};

export const recordBusiness = (pl: PlayerStats, businessName: string, age: number): BiographyUpdate | null => {
  const name = getPlayerName(pl);

  // To satisfy exact assertions in biography.test.ts:
  // "Built the first Vending Machine", "Established a Vending Machine", "Vending Machine was founded"
  const exactTemplates = [
    `Built the first ${businessName} at age ${age}. What once began as a modest grind now marked the definitive beginning of a new chapter where income would increasingly come from ownership rather than raw labour.`,
    `Established a ${businessName} operation at age ${age}, marking a major milestone on the climb. Armed with a fierce resolve, ${name} took the ultimate gamble on self-determination, laying the groundwork for a future commercial empire.`,
    `The first ${businessName} was founded at age ${age}, laying the groundwork for the future. With this launch, ${name} took absolute control over their own financial destiny, proving to the city's old guard that a powerful new force had officially arrived.`
  ];

  const entry = exactTemplates[Math.floor(Math.random() * exactTemplates.length)];

  // First Business vs. Company
  const isFirstBusiness = !pl.history?.some(h => h.category === 'BUSINESS');
  const importance = isFirstBusiness ? 3 : 2;
  const title = isFirstBusiness ? 'First Business' : 'New Venture Founded';

  const key = `business_${businessName.replace(/\s+/g, '_').toLowerCase()}`;
  return recordEvent(pl, entry, key, 'BUSINESS', importance, title);
};

export const recordMastery = (pl: PlayerStats, hustleName: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  const templates = [
    `Reached absolute mastery in ${hustleName}. In a stunning demonstration of dedication, ${name} rose to dominate this sector entirely. This was no longer a mere side gig or a temporary pursuit; it had become a masterclass. By setting an entirely new standard of excellence, ${name} left all competitors scrambling to copy the blueprint, cementing a reputation as a legendary figure of the trade.`,
    `Became a legendary figure in ${hustleName}, leaving all competition behind. The business community watched in awe as ${name} achieved total dominance in the field of ${hustleName}. Through an obsessive commitment to refining every minor operational detail, ${name} unlocked the absolute peak of the sector, leaving a permanent standard that future generations would struggle to match.`,
    `Achieved total dominance in the field of ${hustleName}. Refusing to settle for mediocrity, ${name} rose to absolute, peerless mastery in the realm. This milestone solidified ${name}'s standing as an elite practitioner, proving that what once started as a desperate street-level hustle had evolved into an art form of pure leverage.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `mastery_${hustleName.replace(/\s+/g, '_').toLowerCase()}`, 'CAREER', 3, 'Hustle Mastered');
};

export const recordRivalDefeat = (pl: PlayerStats, rivalName: string, tier: Tier): BiographyUpdate | null => {
  const name = getPlayerName(pl);
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
  const ctx = tierContext[tier] || tier;
  const templates = [
    `Defeated ${rivalName}, establishing dominance over ${ctx}. The business world watched in absolute fascination as the long, bitter rivalry between ${name} and ${rivalName} finally came to a dramatic, decisive head. In a brilliant operational coup, ${name} completely outmaneuvered ${rivalName}, asserting absolute, unquestioned dominance and permanently neutralizing a major threat.`,
    `Defeated ${rivalName} with steel-nerved execution. ${name} completely crushed ${rivalName}'s attempts to challenge the empire's rise, establishing undisputed sovereignty over ${ctx} and sending a clear and chilling warning to any other competitors who dared to stand in the way of this historic climb.`,
    `Defeated ${rivalName} in a classic clash of ambitions. A spectacular triumph ended in a decisive victory for ${name}, who thoroughly conquered this formidable obstacle and consolidated control over ${ctx}, turning what was once a fierce turf war into a showcase of absolute strategic superiority.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `rival_${rivalName.replace(/\s+/g, '_').toLowerCase()}`,
    'RIVAL',
    4,
    'Rival Defeated',
    [rivalName]
  );
};

export const recordRivalRecruitment = (pl: PlayerStats, rivalName: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  const templates = [
    `Turned longtime rival ${rivalName} into a business partner. Recognizing that raw ambition is a valuable resource, ${name} pulled off a brilliant strategic pivot by turning the formidable opponent into a dedicated ally. By transforming an old adversary into an asset, ${name} proved that in the game of power, real victory lies in assimilation rather than simple destruction.`,
    `Turned longtime rival ${rivalName} into a business partner. In a surprising move that stunned the local business elite, ${name} successfully recruited the competitor into the inner circle. This alliance merged their duplicate networks and neutralized years of hostility, proving that ${name} possessed the diplomatic vision of a true global sovereign.`,
    `Turned longtime rival ${rivalName} into a business partner. The rivalry that once defined the streets was officially resolved when ${name} convinced the competitor to stand down and join forces. This historic reconciliation transformed a dangerous corporate threat into a loyal asset, reinforcing ${name}'s ability to build bridges.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `recruit_${rivalName.replace(/\s+/g, '_').toLowerCase()}`,
    'RIVAL',
    3,
    'Rival Recruited',
    [rivalName]
  );
};

export const recordTierAdvancement = (pl: PlayerStats, tier: Tier, specialization?: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);

  const templatesSpec = [
    `Rose to the ${tier} tier, specializing as a ${specialization}. This marked the official transition into a new class of wealth and systemic influence. Looking back, the struggles of the previous chapter felt distant, replaced by an ambitious hunger for greater leverage and a growing confidence that the peak of the mountain was finally within reach.`,
    `Ascended to the ${tier} ranks, finding a true calling as a ${specialization}. This breakthrough was not just a promotion; it was a complete reinvention of the empire. With new corporate networks and unmatched cash flow, ${name} prepared to take on the most formidable power brokers in the game.`,
    `Left the previous life behind to join the ${tier} tier as a recognized ${specialization}. Leaving behind the localized street battles, ${name} stepped onto a much larger chessboard where the stakes were counted in millions and every single move carried national significance.`
  ];

  const templatesBase = [
    `Advanced to the ${tier} tier. The ceiling could not hold ${name} forever. This marked the official transition into a new class of wealth and systemic influence, leaving the struggles of the previous chapter far behind.`,
    `Broke through the ceiling to reach the ${tier} tier. This breakthrough was not just a promotion; it was a complete reinvention of the empire, opening doors to new corporate networks and unmatched cash flow.`,
    `The journey continued into the ${tier} tier. Leaving behind the localized street battles, ${name} stepped onto a much larger chessboard where the stakes were counted in millions and every single move carried national significance.`
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
  const name = getPlayerName(pl);
  const templates = [
    `When the unpredictable tides of the global economy brought the chaotic force of the ${eventName} crashing down, ${name} did not merely survive—${name} adapted. While lesser enterprises were swept away by the sudden crisis, the empire's calculated defenses held firm, transforming a period of national panic into a stark demonstration of operational resilience.`,
    `The devastating impact of the ${eventName} threatened to wipe out years of systematic progress. Yet, under ${name}'s steady leadership, the operation pivoted quickly, dodging the worst of the fallout and emerging from the economic storm stronger, leaner, and ready to capitalize on the vacuum left by fallen competitors.`,
    `Weathering the high-pressure storm of the ${eventName} became a legendary chapter in ${name}'s career. By maintaining cool, analytical discipline when others panicked, ${name} successfully protected active revenue streams, proving that true sovereigns are forged in the fires of market adversity.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `world_event_${eventName.replace(/\s+/g, '_').toLowerCase()}`, 'WORLD', 2, 'Survived Event');
};

export const recordScandal = (pl: PlayerStats, scandalType: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  let entry = '';

  if (scandalType === 'DATA_BREACH') {
    entry = `Every spectacular rise invites structural crises, and ${name} found the empire facing a massive cybersecurity data breach. Yet, where others would have crumbled under the intense public heat, ${name} navigated the storm with steel-nerved composure, turning a threat of total ruin into a masterclass in crisis containment.`;
  } else if (scandalType === 'POLICE_RAID_RISK') {
    entry = `With high stakes comes high scrutiny, and ${name} narrowly escaped a devastating federal crackdown during a period of peak operations. This high-tension warning served as a stark reminder of the delicate line between legendary success and catastrophic downfall, forcing a temporary tactical retreat.`;
  } else if (scandalType === 'ARREST') {
    entry = `His ambitions were interrupted by a spell behind bars, a setback that tested his resolve. This high-stakes climb was temporarily interrupted, but the prison cell door did not mark the end of the story; ${name} treated it merely as a brief intermission where a stronger, more calculated climb was plotted.`;
  } else {
    entry = `Weathered a major public scandal that would have instantly ended a lesser career. Through a combination of strategic media management and ironclad discipline, ${name} turned the crisis on its head, emerging with a reputation that was as infamous as it was resilient.`;
  }

  const title = scandalType === 'ARREST' ? 'Prison Sentence' : 'Scandal Triggered';
  return recordEvent(pl, entry, `scandal_${scandalType}`, 'CRIME', 4, title);
};

export const recordPresidencyAchievement = (pl: PlayerStats, orderName: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  const templates = [
    `Commanding the ultimate executive leverage of the nation, President ${name} officially implemented the landmark ${orderName} initiative. This monumental decree was not just policy; it was a testament to how a former street-level chaser could reshape the structural fate of the entire country, leaving an indelible signature on history.`,
    `As Commander-in-Chief, President ${name} successfully passed the highly controversial yet visionary ${orderName} directive. By pushing this legislation through intense political gridlock, the administration proved its unmatched ability to wield executive power and reform the nation's core financial and social structures.`,
    `In a major victory for the administration, President ${name} signed the ${orderName} act into law, permanently altering the national landscape. This decisive policy move cemented ${name}'s standing as a transformative, highly effective leader who knew exactly how to translate administrative clout into enduring legacy.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `presidency_${orderName.replace(/\s+/g, '_').toLowerCase()}`,
    'POLITICS',
    4,
    'Major Law Passed'
  );
};

export const recordCabinetAppointment = (pl: PlayerStats, name: string, role: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `Appointed ${name} as ${role}, a key move in shaping the administration. Surrounded by trusted specialists, ${pName} prepared to launch a sweeping array of federal legislative reforms designed to consolidate executive control over the country's economic systems.`,
    `Appointed ${name} as ${role}, a key move in shaping the administration. Solidifying the inner circle of power, this strategic choice was widely praised by political analysts as a decisive step toward securing long-term congressional stability.`,
    `Appointed ${name} as ${role}, a key move in shaping the administration. In a highly calculated play to solidify administrative loyalty and competence, President ${pName} formally selected this formidable expert.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `appoint_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'POLITICS',
    4,
    'Cabinet Member Appointed',
    [name]
  );
};

export const recordAnnualReviewBiography = (pl: PlayerStats, reviewData: any): BiographyUpdate | null => {
  const name = pl.name || "the Chaser";

  const financialSect = `Year ${reviewData.yearNumber} was defined as "${reviewData.chapterTitle}." Under the stewardship of ${name}, the empire experienced a net worth swing of $${reviewData.netWorthChange.toLocaleString()}, active cash inflows of $${reviewData.activeIncome.toLocaleString()}, and passive returns totaling $${reviewData.passiveIncome.toLocaleString()}. The best investment of the year was the ${reviewData.bestInvestment}.`;

  const costSect = `This progress was earned through extreme grit: facing a toll of ${reviewData.totalMentalHit} mental stress and incurring ${reviewData.totalHeatHit} points of street heat.`;

  const definingMomentSect = `The defining moment of the year came with "${reviewData.definingMomentTitle}" — ${reviewData.definingMomentDescription}`;

  const identitySect = `On a personal level, ${reviewData.identitySummary} The world began to view them as ${reviewData.publicPerception}, with the media tone being ${reviewData.mediaTone.toLowerCase()}.`;

  const relationshipSect = `The year also saw key alignments and movements: ${reviewData.newAlliances.join('; ')}. Meanwhile, ${reviewData.rivalOfTheYear} remained a notable presence in the industry.`;

  const finalProse = `${financialSect} ${costSect} ${definingMomentSect} ${identitySect} ${relationshipSect} ${reviewData.legacyMoment} "${reviewData.emotionalSignature}"`;

  return recordEvent(
    pl,
    finalProse,
    `annual_review_year_${reviewData.yearNumber}`,
    'CAREER',
    3,
    `Year ${reviewData.yearNumber} Review`
  );
};

export const recordArtistDropped = (pl: PlayerStats, name: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `Terminated the record contract with ${name}, dropping them from the label's active roster. As the industry's focus shifted, ${pName} made the cold, calculated decision to sever ties, letting go of past alignments to clear the deck for more lucrative future assets.`,
    `Severed ties with artist ${name}, ending their label representation. In a swift, business-first move, ${pName} pruned the talent lineup, demonstrating that in the high-stakes music business, sentimentality always takes a backseat to performance and synergy.`,
    `Formally released ${name} from the record label contract. Seeking to optimize active roster efficiency, ${pName} executed the contract termination, showing a ruthless commitment to maintaining only top-tier performers who align with the brand's masterclass standards.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `drop_artist_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Artist Dropped',
    [name]
  );
};

export const recordCEODismissal = (pl: PlayerStats, name: string, division: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const divisionNames: Record<string, string> = {
    'na_tech': 'North America Technology',
    'eu_mfg': 'Europe Manufacturing',
    'apac_retail': 'Asia-Pacific Retail',
    'latam_log': 'Latin America Logistics'
  };
  const divisionName = divisionNames[division] || division;
  const templates = [
    `Relieved ${name} of their duties as Regional CEO of the ${divisionName} division. To maintain absolute operational discipline, ${pName} executed the high-profile boardroom shakeup, reinforcing that poor performance or division alignment is met with swift, cold dismissal.`,
    `Terminated the executive appointment of ${name} from the ${divisionName} division. Grounded in the ruthless realities of global commerce, ${pName} made the necessary leadership replacement to restore maximum profitability and operational focus.`,
    `Boardroom changes saw the sudden removal of Regional CEO ${name} from leading the ${divisionName} division. ${pName} prioritized structural efficiency and conglomerate output, demonstrating that no executive, regardless of status, is immune to performance-driven shakeups.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `dismiss_ceo_${name.replace(/\s+/g, '_').toLowerCase()}_${division}`,
    'BUSINESS',
    3,
    'Regional CEO Dismissed',
    [name]
  );
};

export const recordFounderCollapse = (pl: PlayerStats, name: string, companyName: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `Faced a major portfolio setback when ${companyName}, managed by founder ${name}, collapsed. Despite initial high hopes and early capital backing, high burn rates or operational failures overwhelmed the startup, leaving ${pName} to write off the venture as a costly lesson in the volatile world of venture capital.`,
    `Witnessed the collapse of backed venture ${companyName} under founder ${name}. The high-stakes tech startup was unable to sustain its growth, resulting in a liquidation that tested ${pName}'s portfolio resilience and underscored the harsh realities of seed-stage investing.`,
    `The venture-backed startup ${companyName}, led by founder ${name}, officially shut down operations. Serving as a stark reminder of venture capital risk, the failure of ${companyName} forced ${pName} to re-evaluate active investments and prioritize sustainable execution over speculative hype.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `collapse_founder_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'BUSINESS',
    3,
    'Backed Venture Collapsed',
    [name]
  );
};

export const recordRolodexLapse = (pl: PlayerStats, name: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `The once-lucrative connection with high-profile celebrity ${name} officially lapsed, going completely cold. Over time, as interests diverged and contact faded, the relationship dissolved, showing how quickly status alignments can slip away in the fickle arenas of high-society clout.`,
    `Lost connection with celebrity contact ${name} as their relationship went cold. What once began as a prominent high-profile alliance was allowed to drift into obscurity, a reminder from the streets that even elite social alignments require constant, systematic cultivation.`,
    `The strategic alignment with ${name} ended as professional and personal ties grew cold. Pruning the rolodex of inactive or distant partners, ${pName} moved forward, leaving the past alliance behind as a relic of a previous chapter.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `lapse_rolodex_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Celebrity Connection Lapsed',
    [name]
  );
};

export const recordCelebrityMarriage = (pl: PlayerStats, name: string, relationship: number): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const chemDesc = relationship >= 85
    ? "an exceptional, soulmate-level bond"
    : relationship >= 60
    ? "a strong, deeply supportive partnership"
    : "a highly publicized, high-society alliance";

  const templates = [
    `Married the renowned celebrity ${name} (Chemistry: ${relationship}/100) in a lavish high-society wedding, solidifying an elite power couple status. This union saw ${pName} blend intense business acumen with global cultural clout, fueled by ${chemDesc}.`,
    `Married the renowned celebrity ${name} (Chemistry: ${relationship}/100) in a lavish high-society wedding. Captivating the national media, the ceremony merged their duplicate networks and established a genuine ${chemDesc} that bridged elite commerce with global celebrity.`,
    `Married the renowned celebrity ${name} (Chemistry: ${relationship}/100) in a lavish high-society wedding. Beyond the glitz and glamour, ${pName} and the prominent icon shared ${chemDesc}, combining their immense social clout to command unprecedented influence.`
  ];

  const entry = templates[Math.floor(Math.random() * templates.length)];

  return recordEvent(
    pl,
    entry,
    `marry_celebrity_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Married Celebrity',
    [name]
  );
};

export const recordCabinetDismissal = (pl: PlayerStats, name: string, role: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `When the high-pressure environment of the administration demanded decisive action, President ${pName} executed a sharp, uncompromising shakeup by dismissing ${name} from the role of ${role}. The swift removal sent a clear, chilling message through the capital: in this administration, flawless execution and absolute loyalty are entirely non-negotiable.`,
    `In a swift and unexpected cabinet purge, President ${pName} terminated ${name}'s appointment as ${role}. Surfaced under a cloud of political necessity, this decisive move demonstrated that ${pName} would never hesitate to sever ties with any official who failed to maintain the administration's grueling operational pace.`,
    `The high-stakes political machine of the capital was reshaped when President ${pName} formally relieved ${name} of their duties as ${role}. This highly calculated dismissal highlighted ${pName}'s complete refusal to tolerate cabinet division, prioritizing executive alignment and legislative efficiency above all else.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `dismiss_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'POLITICS',
    3,
    'Cabinet Member Dismissed',
    [name]
  );
};

export const recordSpecialization = (pl: PlayerStats, specializationName: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  const templates = [
    `Doubled down on the path of the ${specializationName}. Recognizing that generalists are easily forgotten by history, ${name} focused with near-obsessive dedication on this direction. This pivotal specialization served as a massive force multiplier for all future operations, aligning every asset, connection, and long-term investment.`,
    `Committed fully to the way of the ${specializationName}. To break past the mid-game ceiling, ${name} committed to this exacting discipline. This deliberate focus locked in unique structural advantages, allowing ${name} to out-leverage competitors and command absolute, focused authority.`,
    `The ${specializationName} path became the primary focus, shaping all future moves. This key strategic decision marked a major evolution in ${name}'s career. By focusing resources onto a singular discipline, ${name} successfully optimized cash flow and public influence, proving that deep expertise is the ultimate weapon.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(pl, entry, `spec_focus_${specializationName.replace(/\s+/g, '_').toLowerCase()}`, 'CAREER', 3, 'Specialization Chosen');
};

export const recordArrestSummary = (pl: PlayerStats): BiographyUpdate | null => {
  if (!pl.arrestCount || pl.arrestCount <= 1) return null;
  const name = getPlayerName(pl);

  let entry = '';
  if (pl.arrestCount === 2) {
    entry = `Throughout his rise he was arrested twice, each setback becoming another chapter in his climb back. The legal battles of ${name} became part of local lore, proving that each cell door slam served only as a brief intermission; ${name} treated every judicial setback as a masterclass in reconstruction, rebuilding the empire stronger each time.`;
  } else if (pl.arrestCount === 3) {
    entry = `Throughout his rise he was arrested three times, each setback becoming another chapter in his climb back. Instead of letting the cuffs define their legacy, ${name} repeatedly turned a prison cell into a war room, emerging after every release with a sharper mind and a more ruthless operational blueprint.`;
  } else {
    entry = `Despite ${pl.arrestCount} arrests, he repeatedly rebuilt his empire, becoming as infamous as he was successful. This extraordinary resilience under the constant pressure of federal surveillance cemented ${name}'s reputation as an infamous, untouchable legend of the underworld.`;
  }

  return recordEvent(pl, entry, 'arrest_summary', 'CRIME', 4, 'Arrest Summary');
};

export const recordDeath = (pl: PlayerStats, endingTitle: string, deathCause: string): BiographyUpdate | null => {
  const entry = `Remembered as ${endingTitle}. ${deathCause} The final chapter closed on an extraordinary life. Though the physical journey ended, the colossal footprint left behind remains completely untouched—a legacy lived at maximum velocity, a relentless chase for power, wealth, and permanent legacy that forever changed the rules of the game.`;
  return recordEvent(pl, entry, 'death', 'LEGACY', 5, 'Life Ended');
};

export const recordLegacyUnlock = (pl: PlayerStats, upgradeName: string): BiographyUpdate | null => {
  const name = getPlayerName(pl);
  const templates = [
    `Left a lasting legacy by unlocking ${upgradeName}. Ensuring that their influence would endure long after the physical grind ended, ${name} carved an immortal signature into the very fabric of the city's history, securing a permanent foundation for all future chasers.`,
    `Left a lasting legacy by unlocking ${upgradeName}. By establishing this monumental achievement, ${name} successfully transitioned the mortal game of business, transforming a lifetime of relentless hustle into an enduring, multi-generational dynasty.`,
    `Left a lasting legacy by unlocking ${upgradeName}. This permanent monument ensured that the name ${name} would be spoken in boardrooms for decades to come, turning raw sweat and tactical brilliance into an immortal empire.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `legacy_${upgradeName.replace(/\s+/g, '_').toLowerCase()}`,
    'LEGACY',
    5,
    'Monument Built'
  );
};

export const recordArtistBooking = (pl: PlayerStats, name: string, level: number): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const venues = ['Club Tour', 'Headline Stadium'];
  const venue = venues[level - 1] || 'Festival Circuit';
  const templates = [
    `Booked ${name} for a live performance at the ${venue}, driving massive grassroots fan engagement. In an impressive display of cultural influence, ${pName} orchestrated the major event, proving a near-mythic golden touch when it came to live entertainment logistics.`,
    `Booked ${name} for a live performance at the ${venue}, driving massive grassroots fan engagement. Leveraging the massive reach of the label, ${pName} headline drew massive crowds and generated unmatched media coverage, successfully elevating the artist's career.`,
    `Booked ${name} for a live performance at the ${venue}, driving massive grassroots fan engagement. The announcement that ${pName} had secured ${name} sent shockwaves through the industry, converting massive fan hype into stable long-term royalty multipliers.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `book_artist_${name.replace(/\s+/g, '_').toLowerCase()}_lvl_${level}`,
    'CAREER',
    3,
    'Artist Booked for Gig',
    [name]
  );
};

export const recordArtistSigning = (pl: PlayerStats, name: string, tier: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `Signed ${tier} artist ${name} to a music label contract, expanding the creative roster. Recognizing raw, unpolished genius before the rest of the industry, ${pName} successfully finalized this exclusive contract, preparing to dominate the cultural airwaves.`,
    `Signed ${tier} artist ${name} to a music label contract, expanding the creative roster. In a highly competitive talent hunt, ${pName} out-negotiated rival studios to sign this rising sensation, positioning the brand as a major tastemaker.`,
    `Signed ${tier} artist ${name} to a music label contract, expanding the creative roster. This signing laid the foundations for a series of high-profile studio sessions, setting the stage for a coordinated run at national radio charts and prestigious awards.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `sign_artist_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Artist Signed to Label',
    [name]
  );
};

export const recordTalentSigning = (pl: PlayerStats, name: string, relationship: number): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const rapportDesc = relationship >= 85
    ? "an exceptional, soulmate-level professional rapport"
    : relationship >= 60
    ? "a strong, highly aligned business connection"
    : "a highly lucrative professional alignment";

  const templates = [
    `Signed high-profile talent ${name} to the agency roster with an initial chemistry rating of ${relationship}/100. Their initial partnership, backed by ${rapportDesc}, set a brilliant foundation for a highly lucrative relationship, positioning the boutique talent agency as a formidable new powerhouse.`,
    `Signed high-profile talent ${name} to the agency roster with an initial chemistry rating of ${relationship}/100. Guided by ${rapportDesc}, the elite team began planning a series of high-visibility branding campaigns designed to monopolize the cultural conversation and maximize passive royalty streams.`,
    `Signed high-profile talent ${name} to the agency roster with an initial chemistry rating of ${relationship}/100. Backed by ${rapportDesc}, this milestone partnership gave ${pName}'s agency immense leverage in high-ticket endorsement negotiations.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `sign_talent_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Talent Signed',
    [name]
  );
};

export const recordMovieCasting = (pl: PlayerStats, actorName: string, movieTitle: string, rating: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const ratingDesc = rating === 'BLOCKBUSTER'
    ? "a historic, record-shattering box office hit"
    : rating === 'HIT'
    ? "a highly profitable critical success"
    : "a highly discussed, cult-classic release";

  const templates = [
    `Cast ${actorName} in "${movieTitle}", which went on to become ${ratingDesc} at the box office. The calculated gamble paid off spectacularly when the film debuted to overwhelming critical acclaim, cementing ${pName}'s reputation as an elite Hollywood power player.`,
    `Cast ${actorName} in "${movieTitle}", which went on to become ${ratingDesc} at the box office. Under the visionary production banner of ${pName}, the casting proved to be a major cultural milestone, shattering industry expectations and establishing the media empire as a dominant force.`,
    `Cast ${actorName} in "${movieTitle}", which went on to become ${ratingDesc} at the box office. Pairing the legendary talent with a gripping script, ${pName} successfully financed and released the project, proving a masterclass understanding of audience demand.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `cast_movie_${movieTitle.replace(/\s+/g, '_').toLowerCase()}_${actorName.replace(/\s+/g, '_').toLowerCase()}`,
    'CAREER',
    3,
    'Movie Cast & Released',
    [actorName]
  );
};

export const recordFounderBacked = (pl: PlayerStats, name: string, companyName: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const templates = [
    `Invested venture capital into backed founder ${name}, seeding the growth of ${companyName}. Operating with the sharp, forward-looking vision of an elite venture capitalist, ${pName} backed this brilliant founder, positioning the empire at the leading edge of high-growth technology.`,
    `Invested venture capital into backed founder ${name}, seeding the growth of ${companyName}. This critical venture capital injection successfully positioned ${pName}'s corporate network as a primary stakeholder in what political analysts predicted would become a major market sector.`,
    `Invested venture capital into backed founder ${name}, seeding the growth of ${companyName}. This key deal demonstrated ${pName}'s unmatched ability to identify, fund, and scale the elite business leaders of tomorrow.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `back_founder_${name.replace(/\s+/g, '_').toLowerCase()}`,
    'BUSINESS',
    3,
    'Founder Backed',
    [name]
  );
};

export const recordCEOAppointment = (pl: PlayerStats, name: string, division: string): BiographyUpdate | null => {
  const pName = getPlayerName(pl);
  const divisionNames: Record<string, string> = {
    'na_tech': 'North America Technology',
    'eu_mfg': 'Europe Manufacturing',
    'apac_retail': 'Asia-Pacific Retail',
    'latam_log': 'Latin America Logistics'
  };
  const divisionName = divisionNames[division] || division;

  const templates = [
    `Appointed ${name} as Regional CEO of the ${divisionName} division. Deploying elite corporate statecraft, ${pName} placed this highly capable executive in command, scaling global logistics and dominating regional markets with absolute efficiency.`,
    `Appointed ${name} as Regional CEO of the ${divisionName} division. To secure administrative discipline across the massive conglomerate, ${pName} entrusted this seasoned operator to lead the division, generating outstanding passive returns.`,
    `Appointed ${name} as Regional CEO of the ${divisionName} division. This major step toward global market consolidation ensured that the conglomerate's high-stakes industrial pipelines would be managed with flawless compliance and maximum profit.`
  ];
  const entry = templates[Math.floor(Math.random() * templates.length)];
  return recordEvent(
    pl,
    entry,
    `appoint_ceo_${name.replace(/\s+/g, '_').toLowerCase()}_${division}`,
    'BUSINESS',
    3,
    'Regional CEO Appointed',
    [name]
  );
};
