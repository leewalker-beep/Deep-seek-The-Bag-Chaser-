import type { PlayerStats } from '../types/game';
import { HUSTLES } from '../config/hustles/base';

export const getInitialStats = (difficulty: 1 | 2 | 3): PlayerStats => {
  const baseStats: PlayerStats = {
    bag: 0,
    clout: 0,
    aura: 0,
    mentalHealth: 100,
    heat: 0,
    month: 0,
    currentTier: 'MUD',
    hustleLevels: {},
    hustleBranchIds: {},
    flexAssets: {},
    unlockedAchievements: [],
    rentalCount: 0,
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
    actionLog: [],
    milestones: [],
    stats: {
      totalHustles: 0,
      successfulHustles: 0,
      lifetimeEarnings: 0,
    },
  };

  if (difficulty === 1) { // Trust Fund
    return {
      ...baseStats,
      bag: 25000,
      clout: 30,
      aura: 30,
      currentTier: 'STREET',
    };
  } else if (difficulty === 2) { // Middle Grind
    return {
      ...baseStats,
      bag: 5000,
      clout: 15,
      aura: 15,
      currentTier: 'MUD',
    };
  } else { // Grinder (default)
    return {
      ...baseStats,
      bag: 1000,
      clout: 5,
      aura: 5,
      currentTier: 'MUD',
    };
  }
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
  ];

  if (difficulty === 1) {
    // Trust Fund: all hustles unlocked
    return Object.keys(HUSTLES).reduce((acc, id) => ({ ...acc, [id]: true }), {});
  } else {
    // Both Middle Grind and Grinder now get all MUD hustles
    return allMud.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  }
};
