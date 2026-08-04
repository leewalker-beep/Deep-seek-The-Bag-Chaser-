import type { PlayerStats, GameAction, HistoryEvent } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import {
  evaluateIdentityDimensions,
  determineDominantIdentityArchetype,
  detectIdentityEvolution
} from './identitySystem';

export interface AnnualReviewData {
  yearNumber: number;
  chapterTitle: string; // e.g., "The Year of Expansion"

  // Financial
  startNetWorth: number;
  endNetWorth: number;
  netWorthChange: number;
  activeIncome: number;
  passiveIncome: number;
  bestInvestment: string;
  biggestPurchase: string;
  financialTurningPoint: string;

  // Career
  startTier: string;
  endTier: string;
  businessesAcquiredCount: number;
  employeesHiredCount: number;
  majorExpansions: string[];
  leadershipMilestones: string[];

  // The Cost
  totalMentalHit: number;
  totalHeatHit: number;
  totalUpkeepPaid: number;

  // The Defining Moment
  definingMomentTitle: string;
  definingMomentDescription: string;

  // Emotional Signature
  emotionalSignature: string;

  // Public
  startReputation: string;
  endReputation: string;
  cloutChange: number;
  auraChange: number;
  mediaTone: string;
  publicPerception: string;

  // Relationship
  rivalOfTheYear: string;
  newAlliances: string[];
  brokenPartnerships: string[];
  returningCharacters: string[];
  communityStanding: string;

  // World
  biggestHeadline: string;
  majorWorldEvents: string[];
  politicalDevelopments: string[];
  historicalMilestones: string[];

  // Identity
  identityArchetype: string;
  identitySummary: string;
  dimensionChanges: { name: string; change: number; text: string }[];

  // Advisor
  advisorReflection: string;

  // Legacy
  legacyMoment: string;
}

export function calculateNetWorth(pl: PlayerStats): number {
  const cash = pl.bag || 0;
  let flexValue = 0;
  if (pl.flexAssets) {
    for (const [id, count] of Object.entries(pl.flexAssets)) {
      const asset = FLEX_ASSETS.find(a => a.id === id);
      if (asset) {
        flexValue += asset.cost * (Number(count) || 0);
      }
    }
  }
  return cash + flexValue;
}

export function compileAnnualReview(pl: PlayerStats): AnnualReviewData {
  const yearNumber = Math.max(1, Math.floor(pl.month / 12));

  // Filter actions for the last 12 months (current year)
  const currentYearActions = (pl.actionLog || []).filter(
    (action: GameAction) => action.month >= pl.month - 12 && action.month < pl.month
  );

  // Filter history events for the last 12 months
  const currentYearHistory = (pl.history || []).filter(
    (event: HistoryEvent) => event.month >= pl.month - 12 && event.month < pl.month
  );

  // 1. FINANCIAL STORY
  const endNetWorth = calculateNetWorth(pl);
  const startNetWorth = Number(pl.narrativeFlags?.year_start_net_worth ??
    Math.max(0, endNetWorth - pl.annualCashEarned + pl.annualCashSpent));
  const netWorthChange = endNetWorth - startNetWorth;

  const activeIncome = pl.annualCashEarned || 0;
  const passiveIncome = Number(pl.narrativeFlags?.annualPassiveEarned || 0);

  // Best investment
  let bestInvestment = "Organic growth & learning";
  let maxPassiveAdded = 0;
  let maxInvestmentCost = 0;

  for (const act of currentYearActions) {
    if (act.passiveAdded && act.passiveAdded > maxPassiveAdded) {
      maxPassiveAdded = act.passiveAdded;
      bestInvestment = `Acquisition of ${act.branchName || act.hustleName}`;
    } else if (act.cost > maxInvestmentCost && (act.hustleId === 'venture_capital' || act.hustleId === 'real_estate_empire' || act.hustleId === 'r_scout')) {
      maxInvestmentCost = act.cost;
      bestInvestment = `Investment in ${act.hustleName} ($${act.cost.toLocaleString()})`;
    }
  }

  // Biggest purchase
  let biggestPurchase = "Daily upkeeps and standard operations";
  let maxCost = 0;
  for (const act of currentYearActions) {
    if (act.cost > maxCost) {
      maxCost = act.cost;
      biggestPurchase = `${act.branchName || act.hustleName} ($${act.cost.toLocaleString()})`;
    }
  }

  // Financial turning point
  let financialTurningPoint = "Steady accumulation of capital and resource management.";
  if (pl.narrativeFlags?.rebounded_bankruptcy_millionaire) {
    financialTurningPoint = "A spectacular recovery from liquidity squeeze, rebuilding your empire to millions.";
  } else if (pl.narrativeFlags?.leverage_squeeze) {
    financialTurningPoint = "A high-tension fight against debt pressure and creditor constraints.";
  } else if (endNetWorth >= 1000000000 && startNetWorth < 1000000000) {
    financialTurningPoint = "Crossing the billion-dollar threshold, entering the realm of the city's global elite.";
  } else if (endNetWorth >= 1000000 && startNetWorth < 1000000) {
    financialTurningPoint = "Achieving the seven-figure milestone, permanently separating yourself from street-level operators.";
  } else if (maxPassiveAdded > 5000) {
    financialTurningPoint = "Scaling massive passive yields, letting your assets work for you instead of your hands.";
  }

  // 2. CAREER STORY
  const startTier = (pl.narrativeFlags?.year_start_tier as string) || pl.currentTier;
  const endTier = pl.currentTier;

  // Businesses acquired
  const businessesAcquiredCount = currentYearHistory.filter(h => h.category === 'BUSINESS' && h.title.includes('New Venture')).length ||
    currentYearActions.filter(act => act.passiveAdded && act.passiveAdded > 0).length;

  // Employees hired (counts of cabinet, regional CEOs, founders, artists)
  let employeesHiredCount = 0;
  if (pl.cabinet) {
    employeesHiredCount += Object.keys(pl.cabinet).length;
  }
  if (pl.conglomerateCEOs) {
    employeesHiredCount += Object.entries(pl.conglomerateCEOs).length;
  }
  employeesHiredCount += (pl.artists || []).length;
  employeesHiredCount += (pl.foundersBacked || []).length;

  // Major expansions
  const majorExpansions: string[] = [];
  currentYearHistory.forEach(h => {
    if (h.category === 'CAREER' || h.category === 'BUSINESS') {
      if (h.title.includes('Specialization') || h.title.includes('Advanced Tier') || h.title.includes('Gigs') || h.title.includes('New Venture')) {
        majorExpansions.push(h.description);
      }
    }
  });
  if (majorExpansions.length === 0) {
    majorExpansions.push("Maintained operational efficiency of core holdings and side ventures.");
  }

  // Leadership milestones
  const leadershipMilestones: string[] = [];
  if (pl.currentTier === 'PRESIDENT') {
    leadershipMilestones.push("Mobilized federal agencies and led cabinet briefings as President.");
  }
  const allyCount = (pl.rivals || []).filter(r => r.status === 'ally').length;
  if (allyCount > 0) {
    leadershipMilestones.push(`Maintained strategic alignments with ${allyCount} recruited rival allies.`);
  }
  currentYearHistory.forEach(h => {
    if (h.title.includes('CEO Appointed') || h.title.includes('Rival Recruited') || h.title.includes('Cabinet Member Appointed')) {
      leadershipMilestones.push(h.description);
    }
  });
  if (leadershipMilestones.length === 0) {
    leadershipMilestones.push("Established absolute executive authority over localized operational systems.");
  }

  // 3. THE COST
  let totalMentalHit = 0;
  let totalHeatHit = 0;
  currentYearActions.forEach(act => {
    // Only sum negative mentalHits (which are drains)
    if (act.mentalHit && act.mentalHit < 0) {
      totalMentalHit += Math.abs(act.mentalHit);
    }
    if (act.heatHit && act.heatHit > 0) {
      totalHeatHit += act.heatHit;
    }
  });
  const totalUpkeepPaid = Number(pl.narrativeFlags?.annualPassiveSpent || 0);

  // 4. THE DEFINING MOMENT (Logical Priority Selector)
  let definingMomentTitle = "The Grind Unbroken";
  let definingMomentDescription = "A series of quiet, deliberate active runs. Day by day, hustle by hustle, you constructed a fortress of cash flow.";

  const hasComeback = pl.narrativeFlags?.rebounded_bankruptcy_millionaire || pl.narrativeFlags?.rebounded_bankruptcy_billionaire || pl.narrativeFlags?.rebounded_prison;
  const hasArrest = currentYearHistory.some(h => h.title.includes('Prison') || h.title.includes('Busted') || h.description.includes('arrest'));
  const hasElection = pl.currentTier === 'PRESIDENT' && (startTier !== 'PRESIDENT' || currentYearHistory.some(h => h.title.includes('Cabinet') || h.title.includes('Law Passed')));
  const hasRivalNeutralized = currentYearHistory.some(h => h.title.includes('Rival Defeated') || h.title.includes('Rival Recruited'));
  const hasCharityHigh = (pl.philanthropyDonation && pl.philanthropyDonation >= 500000) || (pl.hustleLevels?.['philanthropy_empire'] && pl.hustleLevels?.['philanthropy_empire'] > 0);
  const hasBigInvestment = currentYearActions.some(act => act.cost >= 1000000 || act.hustleId === 'venture_capital' || act.hustleId === 'real_estate_empire');

  if (hasComeback) {
    definingMomentTitle = "The Phoenix Ascendant";
    definingMomentDescription = "Rebounding from near-ruin, you turned bankruptcy or confinement into a historic lesson in absolute resilience.";
  } else if (hasArrest || pl.heat >= 80) {
    definingMomentTitle = "The Public Reckoning";
    definingMomentDescription = "Surviving federal scrutiny, media scandals, or handcuffs, you navigated the high-stakes razor-edge of the law.";
  } else if (hasElection) {
    definingMomentTitle = "The Sovereign Ascent";
    definingMomentDescription = "Conquering the ultimate political arena, you claimed the Oval Office and reshaped the nation's executive landscape.";
  } else if (hasRivalNeutralized) {
    definingMomentTitle = "The Neutralized Nemesis";
    definingMomentDescription = "Directly outmaneuvering or recruiting your primary market competitor, you proved that power belongs entirely to those with superior leverage.";
  } else if (hasCharityHigh) {
    definingMomentTitle = "The Community Sanctuary";
    definingMomentDescription = "Choosing compassion over cold profits, you injected historic funds into grassroots development and district protection.";
  } else if (hasBigInvestment) {
    definingMomentTitle = "The Generational Acquisition";
    definingMomentDescription = "You locked in high-society flex assets or backed high-vision startups, cementing your place as an elite capital allocator.";
  }

  // 5. EMOTIONAL SIGNATURE
  let emotionalSignature = "This was the year you stopped surviving and started building.";
  if (pl.mentalHealth <= 30 && pl.annualCashEarned >= 500000) {
    emotionalSignature = "You gained wealth, but lost peace.";
  } else if (pl.currentTier === 'PRESIDENT' || pl.currentTier === 'MOGUL') {
    emotionalSignature = "Power became more important than profit.";
  } else if (pl.clout >= 6000) {
    emotionalSignature = "The world began watching your decisions.";
  } else if (passiveIncome >= 40000) {
    emotionalSignature = "Your consistency has become your greatest competitive advantage.";
  }

  // 6. PUBLIC STORY
  const startReputation = (pl.narrativeFlags?.year_start_reputation as string) || "The Hustler";
  const endReputation = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";
  const startClout = Number(pl.narrativeFlags?.year_start_clout ?? pl.clout);
  const startAura = Number(pl.narrativeFlags?.year_start_aura ?? pl.aura);
  const cloutChange = pl.clout - startClout;
  const auraChange = pl.aura - startAura;

  let mediaTone = "Cautious. Mainstream boards trace your climb with growing, calculated interest.";
  if (pl.heat >= 70) {
    mediaTone = "Sensationally hostile. Tabloids and regulatory bulletins dissect your grey-market vulnerabilities.";
  } else if (endReputation === 'The Crime Boss') {
    mediaTone = "Whispered and fearful. Outlets treat your shadow operations with careful distance.";
  } else if (pl.clout > 8000) {
    mediaTone = "Exuberant obsession. The media chronicles your high-society appearances as a national trendsetter.";
  } else if (endReputation === 'The Philanthropist' || endReputation === "The People's Champion") {
    mediaTone = "Glowingly altruistic. Local papers celebrate your community backing as a beacon of reform.";
  }

  let publicPerception = "A self-made, independent operator climbing the urban hierarchy.";
  if (endReputation === 'The Crime Boss') {
    publicPerception = "An elite underworld architect who commands fear and obedience.";
  } else if (endReputation === 'The Investor') {
    publicPerception = "A cold, highly calculated venture master backing key tech and logistics sectors.";
  } else if (endReputation === 'The Celebrity') {
    publicPerception = "A glamorous icon of high-society, widely adored by the public.";
  } else if (endReputation === "The People's Champion") {
    publicPerception = "A beloved reformer championing grassroots development and labor support.";
  }

  // 7. RELATIONSHIP STORY
  let rivalOfTheYear = "No active competitors dared to compromise your operations.";
  const activeRivals = (pl.rivals || []).filter(r => r.status === 'rival');
  if (activeRivals.length > 0) {
    // Pick the most aggressive/high vengeance rival
    const primeRival = activeRivals.reduce((prev, curr) =>
      ((curr.vengeance || 0) > (prev.vengeance || 0)) ? curr : prev, activeRivals[0]
    );
    rivalOfTheYear = `${primeRival.name} (Aggression: ${Math.round((primeRival.aggression || 0) * 100)}%)`;
  }

  const newAlliances: string[] = [];
  const brokenPartnerships: string[] = [];
  const returningCharacters: string[] = [];

  currentYearHistory.forEach(h => {
    if (h.category === 'RIVAL' || h.category === 'RELATIONSHIP') {
      if (h.title.includes('Recruited') || h.title.includes('Married')) {
        newAlliances.push(h.description);
      } else if (h.title.includes('Lapsed') || h.title.includes('Dismissed') || h.title.includes('Dropped')) {
        brokenPartnerships.push(h.description);
      } else {
        returningCharacters.push(h.description);
      }
    }
  });

  if (newAlliances.length === 0) newAlliances.push("None. Relied fully on established inner circle.");
  if (brokenPartnerships.length === 0) brokenPartnerships.push("None. Maintained clean relationships with all rosters.");
  if (returningCharacters.length === 0) returningCharacters.push("No legacy contacts made unexpected interventions this year.");

  let communityStanding = "Respected. Local districts recognize your employment pipelines.";
  if (pl.approvalRating > 75) {
    communityStanding = "Uncontested icon. Grassroots organizations mobilize to support your initiatives.";
  } else if (pl.heat > 60) {
    communityStanding = "Deep suspicion. Neighborhood councils view your rapid expansion with concern.";
  }

  // 8. WORLD STORY
  let biggestHeadline = "STREET COALITION INTENSIFIES: LOCAL TRADE BOARDS MONITOR NEW CAPITAL FLUCTUATIONS.";
  const worldHistory = currentYearHistory.filter(h => h.category === 'WORLD' || h.category === 'POLITICS');
  if (worldHistory.length > 0) {
    const highestImp = worldHistory.reduce((prev, curr) => (curr.importance > prev.importance ? curr : prev), worldHistory[0]);
    biggestHeadline = highestImp.description.toUpperCase();
  }

  const majorWorldEvents: string[] = [];
  const politicalDevelopments: string[] = [];
  const historicalMilestones: string[] = [];

  currentYearHistory.forEach(h => {
    if (h.category === 'WORLD') {
      majorWorldEvents.push(h.description);
    } else if (h.category === 'POLITICS') {
      politicalDevelopments.push(h.description);
    } else if (h.importance >= 4) {
      historicalMilestones.push(h.description);
    }
  });

  if (majorWorldEvents.length === 0) majorWorldEvents.push(`The local markets remained in ${pl.narrativeFlags?.currentMarket || 'NORMAL'} state.`);
  if (politicalDevelopments.length === 0) politicalDevelopments.push("No major legislative or federal reshuffles occurred.");
  if (historicalMilestones.length === 0) historicalMilestones.push("Your operations continued along a steady, historical trajectory.");

  // 9. IDENTITY STORY (most important)
  const currentDim = evaluateIdentityDimensions(pl);
  let startDim = currentDim;
  if (pl.narrativeFlags?.year_start_dimensions) {
    try {
      startDim = JSON.parse(pl.narrativeFlags.year_start_dimensions as string);
    } catch (e) {
      // fallback
    }
  }
  const identityArchetype = determineDominantIdentityArchetype(pl);
  const _trajectory = detectIdentityEvolution(pl);

  const dimensionChanges: { name: string; change: number; text: string }[] = [];
  const dimNames = {
    compassion: 'Compassion',
    integrity: 'Integrity',
    ambition: 'Ambition',
    patience: 'Patience',
    riskTaking: 'Risk-taking',
    leadership: 'Leadership',
    fameSeeking: 'Fame-seeking',
    resilience: 'Resilience'
  };

  for (const [key, label] of Object.entries(dimNames)) {
    const cVal = currentDim[key as keyof typeof currentDim] || 0;
    const sVal = startDim[key] || 0;
    const diff = cVal - sVal;

    let text = "";
    if (diff > 5) {
      if (key === 'patience') text = "You became more patient, choosing systems over quick payoffs.";
      else if (key === 'riskTaking') text = "Risk defined your decisions, embracing market volatility.";
      else if (key === 'compassion') text = "You increasingly prioritised people over profit, funding grassroots trust.";
      else if (key === 'ambition') text = "Power became more important than wealth, seeking larger domains.";
      else if (key === 'integrity') text = "You locked in high integrity and ethical community support.";
      else if (key === 'leadership') text = "Your leadership flourished, expanding your supportive executive rosters.";
      else if (key === 'fameSeeking') text = "Reputation became your greatest asset, cultivating fame and spotlight.";
      else if (key === 'resilience') text = "Resilience became your sword, transforming setbacks into comebacks.";
    } else if (diff < -5) {
      if (key === 'integrity') text = "You became more pragmatic, adopting grey-market compromises.";
      else if (key === 'patience') text = "You grew more aggressive, accelerating your operational cadence.";
      else if (key === 'compassion') text = "Your choices grew colder and more transactional.";
    }

    dimensionChanges.push({ name: label, change: diff, text });
  }

  // Filter significant identity texts
  const identitySummaryList = dimensionChanges.filter(d => d.text !== "").map(d => d.text);
  let identitySummary = "Your core character remained incredibly stable and focused on steady wealth creation.";
  if (identitySummaryList.length > 0) {
    identitySummary = identitySummaryList.slice(0, 3).join(" ");
  }

  // 10. ADVISOR REFLECTION
  let advisorReflection = "Every year is a single brushstroke in a master portrait. You're writing a life story here, kid. Make sure the next chapter is even bolder.";
  if (pl.mentalHealth <= 35) {
    advisorReflection = "“You won financially this year, kid, but you neglected your wellbeing. Your mind is frayed. A broken operator can't manage a fortress.”";
  } else if (pl.heat >= 70) {
    advisorReflection = "“You played with absolute fire this year. The money is great, sure, but you're one bad audit or raid away from serving time. Cool it down.”";
  } else if (passiveIncome > 30000) {
    advisorReflection = "“This was the year you stopped chasing money and started building systems. You're transitioning from a simple chaser to a true architect.”";
  } else if (currentYearActions.length > 15 && pl.heat < 45) {
    advisorReflection = "“Your consistency has become your greatest competitive advantage. No flashes in the pan, just steady, relentless execution.”";
  }

  // 11. LEGACY INTEGRATION
  let legacyMoment = "Your rise is carving a deep groove into the history of this city. The stories they tell about you are just beginning.";
  if (pl.narrativeFlags?.crossroad_protected_employees) {
    legacyMoment = "“Your grandchildren still study the decisions you made during the recession, admiring how you protected your workforce.”";
  } else if (pl.currentTier === 'PRESIDENT') {
    legacyMoment = "“History classes will dissect your executive decrees and legislative achievements for generations.”";
  } else if (pl.currentTier === 'MOGUL' || pl.currentTier === 'ELITE') {
    legacyMoment = "“Your historic rise from the streets will be documented as a masterclass in economic mobility.”";
  } else if (pl.hustleLevels?.['philanthropy_empire'] && pl.hustleLevels?.['philanthropy_empire'] > 0) {
    legacyMoment = "“Local neighborhoods will name parks and community centers after you for a century.”";
  }

  // 12. DYNAMIC CHAPTER TITLE SELECTOR
  let chapterTitle = "The Foundation Years";
  if (pl.month <= 12) {
    chapterTitle = "The Awakening Grind";
  } else if (pl.narrativeFlags?.had_bankruptcy_crisis || pl.narrativeFlags?.leverage_squeeze) {
    chapterTitle = "The Crucible";
  } else if (pl.inJail || pl.arrestCount && pl.arrestCount > 0 && currentYearHistory.some(h => h.title.includes('Prison'))) {
    chapterTitle = "The Public Reckoning";
  } else if (startTier !== endTier) {
    chapterTitle = "The Reinvention";
  } else if (businessesAcquiredCount >= 2 || pl.foundersBacked?.length > 0) {
    chapterTitle = "The Year of Expansion";
  } else if (pl.currentTier === 'PRESIDENT') {
    chapterTitle = "The Era of Power";
  } else if (pl.currentTier === 'MOGUL') {
    chapterTitle = "The Global Chessboard";
  } else if (pl.currentTier === 'ELITE') {
    chapterTitle = "High Society Ascendancy";
  }

  return {
    yearNumber,
    chapterTitle,
    startNetWorth,
    endNetWorth,
    netWorthChange,
    activeIncome,
    passiveIncome,
    bestInvestment,
    biggestPurchase,
    financialTurningPoint,
    startTier,
    endTier,
    businessesAcquiredCount,
    employeesHiredCount,
    majorExpansions,
    leadershipMilestones,
    totalMentalHit,
    totalHeatHit,
    totalUpkeepPaid,
    definingMomentTitle,
    definingMomentDescription,
    emotionalSignature,
    startReputation,
    endReputation,
    cloutChange,
    auraChange,
    mediaTone,
    publicPerception,
    rivalOfTheYear,
    newAlliances,
    brokenPartnerships,
    returningCharacters,
    communityStanding,
    biggestHeadline,
    majorWorldEvents,
    politicalDevelopments,
    historicalMilestones,
    identityArchetype,
    identitySummary,
    dimensionChanges,
    advisorReflection,
    legacyMoment
  };
}
