import type { PlayerStats } from '../types/game';
import { analyzeBehavior } from './personalityAnalyzer';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';
import { determineDominantIdentityArchetype } from './identitySystem';

export interface CompiledChapter {
  id: string;
  title: string;
  icon: string;
  intro: string;
  entries: string[];
  transition?: string;
  isUnlocked: boolean;
}

export function compileBiographyChapters(pl: PlayerStats): CompiledChapter[] {
  const name = pl.name || "the Chaser";

  // 1. Resolve Background context
  let originCategoryName = "humble origins";
  let backgroundVariationName = "Hustler";

  const cat = BACKGROUND_CATEGORIES.find(c => c.id === pl.categoryId);
  if (cat) {
    originCategoryName = cat.name;
    const variation = cat.variations.find(v => v.id === pl.variationId);
    if (variation) {
      backgroundVariationName = variation.name;
    }
  }

  // 2. Resolve Reputation and Playstyle Archetype
  const activeRep = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";
  const behavior = analyzeBehavior(pl);
  const colorArchetype = behavior.primaryColor; // CRIMSON, GOLD, COBALT, VIOLET

  // Playstyle classification criteria
  const isCrimeBoss = activeRep === 'The Crime Boss' || !!(pl.arrestCount && pl.arrestCount > 0) || pl.heat > 75;
  const isCharitable = activeRep === 'The Philanthropist' || (pl.hustleLevels?.['philanthropy_empire'] || 0) > 0;
  const isInvestor = activeRep === 'The Investor' || activeRep === 'The Billionaire' || !!(pl.lastPassiveBreakdown?.finalTotal && pl.lastPassiveBreakdown.finalTotal > 50000) || pl.rentalCount > 0;
  const isRiskTaker = activeRep === 'The Controversial Tycoon' || behavior.riskCadenceRatio > 0.4 || pl.heat > 60;

  let playstyleAdjective = "ambitious";
  if (isCrimeBoss) playstyleAdjective = "ruthless and calculated";
  else if (isRiskTaker) playstyleAdjective = "daring and volatile";
  else if (isInvestor) playstyleAdjective = "highly analytical and patient";
  else if (isCharitable) playstyleAdjective = "principled and altruistic";
  else if (colorArchetype === 'COBALT') playstyleAdjective = "coldly strategic";
  else if (colorArchetype === 'VIOLET') playstyleAdjective = "charismatic and fast-moving";

  // 3. Chapter allocation logic
  const originalEntries = pl.biography || [];

  // Parse history to find dynamic earlier milestones
  const firstBusiness = pl.history?.find(h => h.id.startsWith('business_') || h.title === 'First Business' || h.id === 'first_hustle');
  const firstBusinessName = firstBusiness
    ? firstBusiness.title.replace('Mastered ', '').replace('First Business', 'Vending Machine')
    : '';

  const humbleBeginningsEntries: string[] = [];
  const firstSuccessEntries: string[] = [];
  const buildingAnEmpireEntries: string[] = [];
  const publicRecognitionEntries: string[] = [];
  const trialsAndSetbacksEntries: string[] = [];
  const reinventionEntries: string[] = [];
  const leadershipEntries: string[] = [];
  const legacyEntries: string[] = [];

  originalEntries.forEach(entry => {
    const entryLower = entry.toLowerCase();

    // Trials & Setbacks
    if (
      entryLower.includes('scandal') ||
      entryLower.includes('arrest') ||
      entryLower.includes('behind bars') ||
      entryLower.includes('crackdown') ||
      entryLower.includes('data breach') ||
      entryLower.includes('jail') ||
      entryLower.includes('federal surveillance')
    ) {
      trialsAndSetbacksEntries.push(entry);
    }
    // Leadership
    else if (
      entryLower.includes('president') ||
      entryLower.includes('presidency') ||
      entryLower.includes('cabinet') ||
      entryLower.includes('appointed') ||
      entryLower.includes('dismissed') ||
      entryLower.includes('decree') ||
      entryLower.includes('executive order') ||
      entryLower.includes('ceo appointment') ||
      entryLower.includes('conglomerate ceos') ||
      entryLower.includes('regional ceo')
    ) {
      leadershipEntries.push(entry);
    }
    // Reinvention
    else if (
      entryLower.includes('specialization') ||
      entryLower.includes('specializing') ||
      entryLower.includes('spec_focus') ||
      entryLower.includes('rebounded') ||
      entryLower.includes('comeback') ||
      entryLower.includes('rebound') ||
      entryLower.includes('phoenix') ||
      entryLower.includes('reborn')
    ) {
      reinventionEntries.push(entry);
    }
    // Legacy
    else if (
      entryLower.includes('death') ||
      entryLower.includes('life ended') ||
      entryLower.includes('legacy') ||
      entryLower.includes('monument') ||
      entryLower.includes('lasting legacy') ||
      entryLower.includes('dynasty') ||
      entryLower.includes('immortal signature') ||
      entryLower.includes('[legacy milestone]')
    ) {
      legacyEntries.push(entry);
    }
    // Public Recognition
    else if (
      entryLower.includes('mastery') ||
      entryLower.includes('mastered') ||
      entryLower.includes('pr campaign') ||
      entryLower.includes('celebrity') ||
      entryLower.includes('married') ||
      entryLower.includes('marriage') ||
      entryLower.includes('talent') ||
      entryLower.includes('cast') ||
      entryLower.includes('movie') ||
      entryLower.includes('artist') ||
      entryLower.includes('singing') ||
      entryLower.includes('booked')
    ) {
      publicRecognitionEntries.push(entry);
    }
    // Humble Beginnings
    else if (
      entryLower.includes('origin') ||
      entryLower.includes('started life') ||
      entryLower.includes('born into') ||
      entryLower.includes('the story began') ||
      entryLower.includes('manual labor') ||
      entryLower.includes('bike delivery') ||
      entryLower.includes('plasma donation') ||
      entryLower.includes('scavenger') ||
      entryLower.includes('rest') ||
      entryLower.includes('taco cart') ||
      entryLower.includes('dog walker') ||
      entryLower.includes('human billboard')
    ) {
      humbleBeginningsEntries.push(entry);
    }
    // First Success
    else if (
      entryLower.includes('built the first') ||
      entryLower.includes('established a') ||
      entryLower.includes('was founded') ||
      entryLower.includes('vending machine') ||
      entryLower.includes('house flip') ||
      entryLower.includes('rent portfolio') ||
      entryLower.includes('car delivery') ||
      entryLower.includes('stealth ops') ||
      entryLower.includes('yard owner') ||
      entryLower.includes('therapy') ||
      entryLower.includes('food truck') ||
      entryLower.includes('bedroom producer') ||
      entryLower.includes('home cleaner') ||
      entryLower.includes('thrift flip') ||
      entryLower.includes('basic refurb')
    ) {
      firstSuccessEntries.push(entry);
    }
    // Default to Building an Empire
    else {
      buildingAnEmpireEntries.push(entry);
    }
  });

  // Ensure Humble Beginnings always has at least the default origin if none is routed there
  if (humbleBeginningsEntries.length === 0 && originalEntries.length > 0) {
    // Fallback safeguard to keep chapter active
    const originEntry = originalEntries.find(e => e.includes('Started life') || e.includes('Born into') || e.includes('The story began'));
    if (originEntry) {
      humbleBeginningsEntries.push(originEntry);
    }
  }

  // 4. Character Formation dynamic behavior passage
  const charityChoices = Number(pl.narrativeFlags?.charity_choices_count || 0);
  const unethicalChoices = Number(pl.narrativeFlags?.unethical_choices_count || 0);
  const educationChoices = Number(pl.narrativeFlags?.education_choices_count || 0);
  const employeeSupportChoices = Number(pl.narrativeFlags?.employee_support_choices_count || 0);
  const employeeExploitChoices = Number(pl.narrativeFlags?.employee_exploit_choices_count || 0);

  let formationPassage = "";
  if (charityChoices >= 3) {
    formationPassage = ` Their ascent was marked by a deep, unwavering commitment to philanthropy and communal welfare, consistently choosing compassion and public support over raw corporate greed.`;
  } else if (unethicalChoices >= 3) {
    formationPassage = ` Throughout their rise, they frequently operated in legal grey areas and made calculated, high-risk compromises, building an empire that prioritized margins over traditional ethics.`;
  } else if (educationChoices >= 3) {
    formationPassage = ` Their strategic climb was characterized by immense patience and a commitment to structured, academic pedigree, choosing education and expertise as the ultimate form of leverage.`;
  } else if (employeeSupportChoices >= 3) {
    formationPassage = ` As a leader, they demonstrated exceptional care for their workforce, consistently supporting, rewarding, and hiring staff to forge an organization built on fierce, mutual loyalty.`;
  } else if (employeeExploitChoices >= 3) {
    formationPassage = ` In the pursuit of pure velocity, they treated efficiency as a cold science, aggressively optimizing operational margins and pushing their workforce to the limit.`;
  }

  const dominantArchetype = determineDominantIdentityArchetype(pl);

  // Determine chapter lock statuses
  const chapters: CompiledChapter[] = [
    {
      id: "beginnings",
      title: "Humble Beginnings",
      icon: "🌱",
      intro: `Every monument starts in the dirt. Long before the headlines and the sovereign bank vaults, ${name} was merely another face in the crowd, navigating life in the ${pl.prePresidencyTier || pl.currentTier} tier as a ${backgroundVariationName}. This was a chapter written in the quiet vocabulary of raw survival, where ${name}'s ${playstyleAdjective} nature was first tested and forged against the cold indifference of ${originCategoryName}.${formationPassage}`,
      entries: humbleBeginningsEntries,
      transition: `With some cash saved and a deep, intuitive understanding of the street's levers, ${name} realized that raw physical labour as a ${backgroundVariationName} would never buy freedom. It was time to stop working for the system, and start making the system work for them.`,
      isUnlocked: true // Always unlocked
    },
    {
      id: "first_success",
      title: "First Success",
      icon: "⚡",
      intro: `The first taste of leverage is both intoxicating and defining. Breaking free from simple survival and building directly on the lessons of ${originCategoryName}, ${name} took the ultimate gamble of self-reliance, funding early commercial ventures${firstBusinessName ? ` like their first ${firstBusinessName}` : ''}. These initial steps proved to the local neighborhood that a new, highly competitive force was actively rising. ${name} was no longer just running; they were building.`,
      entries: firstSuccessEntries,
      transition: `No longer bound by immediate survival, ${name}'s gaze expanded past that first ${firstBusinessName || 'success'}. A single shop or asset was merely a proof of concept. The true game demanded a sweeping, interconnected corporate network.`,
      isUnlocked: firstSuccessEntries.length > 0 || pl.currentTier !== 'MUD'
    },
    {
      id: "building_empire",
      title: dominantArchetype,
      icon: "🏢",
      intro: `One venture became two; two became a synchronized network. Starting from that initial ${firstBusinessName || 'venture'}, ${name} laid waste to localized competitors, building a formidable operational presence. Moving with ${playstyleAdjective} momentum, the empire expanded across diverse sectors, transforming raw cash flow into massive structural leverage.`,
      entries: buildingAnEmpireEntries,
      transition: `As the bank balances grew past the first hard-earned million to astronomical heights, the city's old elite could no longer ignore the rising giant. It was time to step out of the office and claim a seat in high society.`,
      isUnlocked: buildingAnEmpireEntries.length > 0 || !['MUD', 'STREET'].includes(pl.currentTier)
    },
    {
      id: "public_recognition",
      title: "Public Recognition",
      icon: "👑",
      intro: `Absolute mastery commands absolute attention. Having successfully broken past the million-dollar milestone, ${name} transitioned fully into the public spotlight. The cultural elite, national media outlets, and premier creators began gravitating toward the empire. Officially recognized as ${activeRep}, ${name}’s name became synonymous with unmatched influence and high-society prestige.`,
      entries: publicRecognitionEntries,
      transition: `But the spotlight is a double-edged sword. With national adoration comes national envy, and those who rule from the shadows rarely welcome a self-made sovereign.`,
      isUnlocked: publicRecognitionEntries.length > 0 || pl.clout >= 150
    },
    {
      id: "setbacks",
      title: "Trials & Setbacks",
      icon: "⚖️",
      intro: `The climb is never a straight line, and the tax of high-stakes play is counted in conflict. In this turbulent period, ${name} faced intense opposition. Regulatory crackdowns, public controversies, and the constant, bitter threats of rival forces threatened to undo years of systematic empire-building, testing ${name}'s mental and financial resolve to the absolute limit.`,
      entries: trialsAndSetbacksEntries,
      transition: `Where lesser chasers would have surrendered to the pressure of federal surveillance or their ${pl.arrestCount || 0} arrests, ${name} found clarity in the crisis. Ruin was merely a blank canvas.`,
      isUnlocked: trialsAndSetbacksEntries.length > 0 || !!(pl.arrestCount && pl.arrestCount > 0)
    },
    {
      id: "reinvention",
      title: "Reinvention & Comebacks",
      icon: "🔥",
      intro: `True power is defined not by how you stand, but by how you rise after a fall. Refusing to let setbacks define their story—such as their past ${pl.arrestCount ? 'legal battles' : 'Chapter 11 liquidity crunches'}—${name} orchestrated a series of brilliant structural pivots and specializations. Rebounding with the legendary resilience of a phoenix, ${name} adapted the entire empire's focus, turning old crises into the launchpad for a stronger, more disciplined climb.`,
      entries: reinventionEntries,
      transition: `Reborn and untargetable, ${name} emerged with a pristine, elite reputation. The commercial boardrooms had been conquered. Only the executive command of the nation remained.`,
      isUnlocked: reinventionEntries.length > 0 || !!(pl.specializationHistory && pl.specializationHistory.length > 0) || !!pl.narrativeFlags?.rebounded_bankruptcy_millionaire || !!pl.narrativeFlags?.rebounded_bankruptcy_billionaire || !!pl.narrativeFlags?.rebounded_prison
    },
    {
      id: "leadership",
      title: "Sovereign Leadership",
      icon: "🏛️",
      intro: `The ultimate boardroom is the office of statecraft. Stepping onto the national stage, President ${name} commanded the ultimate executive and legislative leverage of the country. For a former ${backgroundVariationName} who started in the ${originCategoryName}, surrounding the chief executive with a hand-picked, highly aligned federal cabinet was the ultimate culmination of power.`,
      entries: leadershipEntries,
      transition: `The offices of state are temporary, but the structural signatures left on the laws of the land are completely eternal.`,
      isUnlocked: leadershipEntries.length > 0 || pl.currentTier === 'PRESIDENT' || !!(pl.campaignStage && pl.campaignStage > 0)
    },
    {
      id: "legacy",
      title: "Dynasty & Legacy",
      icon: "🗿",
      intro: `As the daily noise of the market and the capital fades into history, an immortal dynasty remains. No longer a story of survival, this final chapter is a chronicle for the history books. From a humble ${backgroundVariationName} to an immortal sovereign, the colossal footprint of ${name} is permanently etched into the city's lineage—a testament to a lifetime of flawless execution and absolute mastery.`,
      entries: legacyEntries,
      isUnlocked: legacyEntries.length > 0 || !!(pl.unlockedLegacyUpgradeIds && pl.unlockedLegacyUpgradeIds.length > 0) || !!(pl.legacyPoints && pl.legacyPoints > 0)
    }
  ];

  // If the player has no entries at all (highly unlikely but possible as a safeguard),
  // return only the active/unlocked chapters.
  return chapters.filter(ch => ch.isUnlocked);
}
