import type { PlayerStats } from '../types/game';
import { HUSTLES } from '../config/hustles/base';
import { BACKGROUNDS } from '../config/backgrounds';

export const getInitialStats = (difficulty: 1 | 2 | 3, backgroundId?: string, categoryId?: string, variationId?: string): PlayerStats => {
  const baseStats: PlayerStats = {
    runId: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
    bag: 0,
    clout: 0,
    aura: 0,
    chosenBackground: undefined,
    chosenBackgroundCategory: categoryId,
    chosenBackgroundVariation: variationId,
    mentalHealth: 100,
    heat: 0,
    month: 0,
    currentTier: 'MUD',
    hustleLevels: {},
    hustleBranchIds: {},
    masteredHustles: [],
    flexAssets: {},
    unlockedAchievements: [],
    rentalCount: 0,
    rentPortfolioCount: 0,
    flipCount: 0,
    vendingCount: 0,
    passiveLaborYield: 0,
    mentalShieldTurns: 0,
    artists: [],
    grammyCount: 0,
    recordLabelLevel: 1,
    festivalChoices: {
      headliner: 'budget',
      venue: 'small',
      marketing: 'basic',
      insurance: false,
    },
    dataAnalyticsChoice: 'consumer',
    cryptoStrategy: 'solo',
    vaStaff: 5,
    vaTraining: 'none',
    vaClient: 'small',
    realEstateType: 'residential',
    realEstateLeverage: 0,
    realEstateStrategy: 'hold',
    vcStage: 'seed',
    vcSector: 'tech',
    vcInvestment: 1,
    legacyPoints: 0,
    filmGenre: 'action',
    filmBudget: 'medium',
    spaceCompany: 'asteroid',
    philanthropyDonation: 10000000,
    electoralVotes: 0,
    foreignRelations: 50,
    worldPeace: 50,
    voterTurnout: 50,
    campaignStage: 1,
    campaignPlatform: 'economy',
    campaignVP: '',
    campaignDelegates: 0,
    approvalRating: 50,
    gdp: 100,
    inflation: 2,
    nationalDebt: 60,
    federalBudget: 50000000,
    congressSupport: 50,
    demographicApproval: {
      'Economy': 50,
      'Healthcare': 50,
      'Foreign Policy': 50,
      'National Security': 50,
      'Civil Rights': 50,
      'Latinos': 50,
      'Seniors': 50,
      'Veterans': 50
    },
    regionalApproval: {
      'Northeast': 50,
      'South': 50,
      'Midwest': 50,
      'West': 50
    },
    prePresidencyTier: null,
    crushedRivals: [],
    marketLeaderTiers: [],
    approvalFloor: 0,
    scandalRiskBonus: 0,
    sotuHistory: [],
    presidentialDiary: [],
    presidentMonth: 0,
    isSecondTerm: false,
    isReElectionPhase: false,
    cabinet: {},
    activeCrises: [],
    presidentialMarketControl: null,
    pendingPresidentialImpacts: [],
    marketCycle: {
      realEstate: 'normal',
      vc: {
        tech: 'normal',
        biotech: 'normal',
        energy: 'normal',
      },
    },
    monthsSinceCycleChange: 0,
    dynamicPassives: {},
    lastPassiveBreakdown: undefined,
    activeSpecializationId: null,
    specializationHistory: [],
    rivals: [
      { id: 'rival_mud', name: 'Salty Dog', netWorth: 5000, currentBid: 0, isNpc: true, tier: 'MUD', vengeance: 1 },
      { id: 'rival_street', name: 'Flex Hamilton', netWorth: 50000, currentBid: 0, isNpc: true, tier: 'STREET', vengeance: 1 },
      { id: 'rival_startup', name: 'Chadwick VC', netWorth: 500000, currentBid: 0, isNpc: true, tier: 'STARTUP', vengeance: 1 },
      { id: 'rival_corp', name: 'Bezos Billions', netWorth: 5000000, currentBid: 0, isNpc: true, tier: 'CORPORATE', vengeance: 1 },
      { id: 'rival_1', name: 'Sterling Vane', netWorth: 50000000, currentBid: 0, isNpc: true, tier: 'ELITE', vengeance: 1 },
      { id: 'rival_2', name: 'Morgan Thorne', netWorth: 75000000, currentBid: 0, isNpc: true, tier: 'MOGUL', vengeance: 1 },
      { id: 'rival_3', name: 'Elena Rosso', netWorth: 120000000, currentBid: 0, isNpc: true, tier: 'PRESIDENT', vengeance: 1 },
      { id: 'rival_4', name: 'Victor Draken', netWorth: 250000000, currentBid: 0, isNpc: true, tier: 'OPEN', vengeance: 1 },
    ],
    rivalThreats: {},
    activeChallenges: [],
    activeSentiment: null,
    completedNarrativeEvents: [],
    activeNarrative: null,
    narrativeFlags: {},
    originBonus: null,
    actionLog: [],
    milestones: [],
    events: [],
    collectedDeathBadges: [],
    deathCount: 0,
    tierBadges: [],
    tierStats: {},
    hustlePlays: {},
    completedDailyChallengesCount: 0,
    totalChallengesCompleted: 0,
    totalHustlesCompleted: 0,
    stats: {
      totalHustles: 0,
      successfulHustles: 0,
      lifetimeEarnings: 0,
    },
  };

  let stats: PlayerStats;

  if (difficulty === 1) { // Trust Fund
    stats = {
      ...baseStats,
      bag: 25000,
      clout: 30,
      aura: 30,
      currentTier: 'STREET',
    };
  } else if (difficulty === 2) { // Middle Grind
    stats = {
      ...baseStats,
      bag: 5000,
      clout: 15,
      aura: 15,
      currentTier: 'MUD',
    };
  } else { // Grinder (default)
    stats = {
      ...baseStats,
      bag: 1000,
      clout: 5,
      aura: 5,
      currentTier: 'MUD',
    };
  }

  if (backgroundId) {
    const bg = BACKGROUNDS.find(b => b.id === backgroundId);
    if (bg) {
      stats.bag += bg.starterBag;
      stats.clout += bg.starterClout;
      stats.aura += bg.starterAura;
      stats.chosenBackground = bg.id;
      stats.originBonus = bg.originBonus;
    }
  }

  return stats;
};

export const getUnlockedHustles = (difficulty: 1 | 2 | 3): Record<string, boolean> => {
  const allMud = [
    'r_labor',
    'r_delivery',
    'r_plasma',
    'r_ghost_mode',
    'r_scrap',
    'r_flyers',
    'r_sleep',
    'r_vending',
    'street_eats',
  ];

  if (difficulty === 1) {
    // Trust Fund: all hustles unlocked
    return Object.keys(HUSTLES).reduce((acc, id) => ({ ...acc, [id]: true }), {});
  } else {
    // Both Middle Grind and Grinder now get all MUD hustles
    return allMud.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  }
};
