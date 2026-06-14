import type { GameState, GameEvent } from '../types/game';

export type AchievementCategory = 'PROGRESSION' | 'HUSTLE MASTERY' | 'EARNINGS' | 'MINIGAME SKILL' | 'COLLECTION' | 'STREAKS' | 'DAILY CHALLENGES' | 'LEGACY' | 'ENDINGS';

export interface AchievementRequirement {
  check: (state: GameState, event?: GameEvent) => boolean;
  progress: (state: GameState) => { current: number; target: number };
}

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  reward?: {
    cash?: number;
    clout?: number;
    aura?: number;
    buff?: string;
  };
}

const TIER_ORDER = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];

export const ACHIEVEMENTS: AchievementConfig[] = [
  // PROGRESSION (8)
  ...TIER_ORDER.map((tier, index) => ({
    id: `PROG_${tier}`,
    name: `${tier} Bound`,
    description: `Reach the ${tier} tier.`,
    category: 'PROGRESSION' as AchievementCategory,
    requirement: {
      check: (state: GameState) => TIER_ORDER.indexOf(state.pl.currentTier) >= index,
      progress: (state: GameState) => ({
        current: TIER_ORDER.indexOf(state.pl.currentTier) >= index ? 1 : 0,
        target: 1
      })
    },
    reward: {
      clout: 10 * (index + 1),
      aura: 5 * (index + 1)
    }
  })),

  // HUSTLE MASTERY (12)
  {
    id: 'MASTERY_ANY_1',
    name: 'Jack of One Trade',
    description: 'Max level any hustle.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.length >= 1,
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.length, target: 1 })
    },
    reward: { cash: 1000, clout: 20 }
  },
  {
    id: 'MASTERY_ANY_5',
    name: 'Versatile Grinder',
    description: 'Max level 5 different hustles.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.length >= 5,
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.length, target: 5 })
    },
    reward: { cash: 10000, clout: 100 }
  },
  {
    id: 'MASTERY_ANY_10',
    name: 'Master of Many',
    description: 'Max level 10 different hustles.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.length >= 10,
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.length, target: 10 })
    },
    reward: { cash: 100000, clout: 500 }
  },
  {
    id: 'MASTERY_ANY_20',
    name: 'Unstoppable Polymath',
    description: 'Max level 20 different hustles.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.length >= 20,
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.length, target: 20 })
    },
    reward: { cash: 1000000, clout: 2000, aura: 1000 }
  },
  {
    id: 'MASTERY_TECH_FLIPPING',
    name: 'Silicon Valley Flip',
    description: 'Max level Tech Flipping.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('techFlip'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('techFlip') ? 1 : 0, target: 1 })
    },
    reward: { cash: 5000 }
  },
  {
    id: 'MASTERY_DROPSHIPPING',
    name: 'Logistics Wizard',
    description: 'Max level Dropshipping.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('drop'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('drop') ? 1 : 0, target: 1 })
    },
    reward: { cash: 5000 }
  },
  {
    id: 'MASTERY_STREET_EATS',
    name: 'Michelin Street Star',
    description: 'Max level Street Eats.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('street_eats'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('street_eats') ? 1 : 0, target: 1 })
    },
    reward: { aura: 50 }
  },
  {
    id: 'MASTERY_VENDING',
    name: 'Passive King',
    description: 'Master the Vending Machine business.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('r_vending'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('r_vending') ? 1 : 0, target: 1 })
    },
    reward: { cash: 2000 }
  },
  {
    id: 'MASTERY_CRYPTO',
    name: 'Network Architect',
    description: 'Max level Crypto Mining.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('crypto_mining'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('crypto_mining') ? 1 : 0, target: 1 })
    },
    reward: { aura: 200 }
  },
  {
    id: 'MASTERY_REAL_ESTATE',
    name: 'Skyline Owner',
    description: 'Max level Real Estate Empire.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('real_estate_empire'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('real_estate_empire') ? 1 : 0, target: 1 })
    },
    reward: { clout: 500 }
  },
  {
    id: 'MASTERY_LOBBYING',
    name: 'Shadow Government',
    description: 'Max level Lobbying Firm.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('lobbying'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('lobbying') ? 1 : 0, target: 1 })
    },
    reward: { aura: 1000 }
  },
  {
    id: 'MASTERY_PRIVATE_EQUITY',
    name: 'Corporate Raider',
    description: 'Max level Private Equity.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('privateequity'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('privateequity') ? 1 : 0, target: 1 })
    },
    reward: { cash: 1000000 }
  },

  // EARNINGS (7)
  {
    id: 'EARN_1M',
    name: 'Million Dollar Milestone',
    description: 'Earn $1,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 1000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 1000000 })
    },
    reward: { aura: 100 }
  },
  {
    id: 'EARN_10M',
    name: 'Eight Figure Club',
    description: 'Earn $10,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 10000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 10000000 })
    },
    reward: { clout: 200 }
  },
  {
    id: 'EARN_100M',
    name: 'Centimillionaire',
    description: 'Earn $100,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 100000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 100000000 })
    },
    reward: { clout: 500, aura: 500 }
  },
  {
    id: 'EARN_1B',
    name: 'The B-Word',
    description: 'Earn $1,000,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 1000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 1000000000 })
    },
    reward: { clout: 1000, aura: 1000 }
  },
  {
    id: 'EARN_10B',
    name: 'Economic Force',
    description: 'Earn $10,000,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 10000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 10000000000 })
    },
    reward: { clout: 5000, aura: 5000 }
  },
  {
    id: 'EARN_100B',
    name: 'Titan of Industry',
    description: 'Earn $100,000,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 100000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 100000000000 })
    },
    reward: { clout: 10000, aura: 10000 }
  },
  {
    id: 'EARN_1T',
    name: 'The First Trillion',
    description: 'Earn $1,000,000,000,000 total profit.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 1000000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 1000000000000 })
    },
    reward: { clout: 50000, aura: 50000 }
  },

  // MINIGAME SKILL (8)
  {
    id: 'SKILL_MASHER',
    name: 'Button Masher Elite',
    description: 'Get a perfect score in StruggleMash.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'StruggleMash' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_REACTION',
    name: 'Light Speed Reflexes',
    description: 'Perfect score in QuickReaction.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'QuickReaction' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_SWIPE',
    name: 'Smooth Swiper',
    description: 'Perfect score in SwipeOrder.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'SwipeOrder' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_TAP',
    name: 'Rhythm Master',
    description: 'Perfect score in TapRhythm.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'TapRhythm' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_SEQUENCE',
    name: 'Eidetic Memory',
    description: 'Perfect score in SequenceRecall.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'SequenceRecall' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_PATTERN',
    name: 'Pattern Recognition',
    description: 'Perfect score in PatternMemory.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'PatternMemory' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_BALANCE',
    name: 'Zen Master',
    description: 'Perfect score in BalanceScale.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'BalanceScale' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_GRID',
    name: 'Grid Overlord',
    description: 'Perfect score in ReactionGrid.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'HUSTLE_COMPLETED' && event.metadata.miniGame === 'ReactionGrid' && event.metadata.multiplier >= 2.0,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },

  // COLLECTION (7)
  {
    id: 'COLL_FLEX',
    name: 'Diamond Encrusted',
    description: 'Own all flex assets.',
    category: 'COLLECTION',
    requirement: {
      check: (state: GameState) => Object.keys(state.pl.flexAssets).length >= 10,
      progress: (state: GameState) => ({ current: Object.keys(state.pl.flexAssets).length, target: 10 })
    },
    reward: { aura: 1000 }
  },
  {
    id: 'COLL_DEATH_5',
    name: 'Morbid Curiosity',
    description: 'Collect 5 unique death badges.',
    category: 'COLLECTION',
    requirement: {
      check: (state: GameState) => state.pl.collectedDeathBadges.length >= 5,
      progress: (state: GameState) => ({ current: state.pl.collectedDeathBadges.length, target: 5 })
    },
    reward: { aura: 500 }
  },
  {
    id: 'COLL_DEATH_10',
    name: 'Death Defier',
    description: 'Collect 10 unique death badges.',
    category: 'COLLECTION',
    requirement: {
      check: (state: GameState) => state.pl.collectedDeathBadges.length >= 10,
      progress: (state: GameState) => ({ current: state.pl.collectedDeathBadges.length, target: 10 })
    },
    reward: { aura: 2000 }
  },
  {
    id: 'COLL_END_1',
    name: 'First Closure',
    description: 'Unlock your first ending.',
    category: 'COLLECTION',
    requirement: {
      check: (_state: GameState) => {
          const savedEndings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
          return savedEndings.length >= 1;
      },
      progress: (_state: GameState) => {
          const savedEndings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
          return { current: savedEndings.length, target: 1 };
      }
    },
    reward: { cash: 10000 }
  },
  {
    id: 'COLL_END_6',
    name: 'Halfway There',
    description: 'Unlock 6 endings.',
    category: 'COLLECTION',
    requirement: {
      check: (_state: GameState) => {
          const savedEndings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
          return savedEndings.length >= 6;
      },
      progress: (_state: GameState) => {
          const savedEndings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
          return { current: savedEndings.length, target: 6 };
      }
    },
    reward: { cash: 100000 }
  },
  {
    id: 'COLL_END_12',
    name: 'Storyteller',
    description: 'Unlock 12 endings.',
    category: 'COLLECTION',
    requirement: {
      check: (_state: GameState) => {
          const savedEndings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
          return savedEndings.length >= 12;
      },
      progress: (_state: GameState) => {
          const savedEndings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]') : [];
          return { current: savedEndings.length, target: 12 };
      }
    },
    reward: { cash: 1000000 }
  },
  {
    id: 'PLATINUM',
    name: 'Bag Chaser Platinum',
    description: 'Complete all other achievements.',
    category: 'COLLECTION',
    requirement: {
      check: (state: GameState) => state.achievements.filter((a: any) => a.id !== 'PLATINUM').every((a: any) => a.isUnlocked),
      progress: (state: GameState) => ({
          current: state.achievements.filter((a: any) => a.id !== 'PLATINUM' && a.isUnlocked).length,
          target: state.achievements.length - 1
      })
    },
    reward: { cash: 100000000, clout: 10000, aura: 10000 }
  },

  // STREAKS (3)
  {
    id: 'STREAK_7',
    name: 'Weekly Habit',
    description: '7 day login streak.',
    category: 'STREAKS',
    requirement: {
      check: (state: GameState) => (state.pl.loginStreak || 0) >= 7,
      progress: (state: GameState) => ({ current: state.pl.loginStreak || 0, target: 7 })
    },
    reward: { cash: 7000 }
  },
  {
    id: 'STREAK_30',
    name: 'Dedicated Chaser',
    description: '30 day login streak.',
    category: 'STREAKS',
    requirement: {
      check: (state: GameState) => (state.pl.loginStreak || 0) >= 30,
      progress: (state: GameState) => ({ current: state.pl.loginStreak || 0, target: 30 })
    },
    reward: { cash: 30000 }
  },
  {
    id: 'STREAK_100',
    name: 'Bag Chaser Forever',
    description: '100 day login streak.',
    category: 'STREAKS',
    requirement: {
      check: (state: GameState) => (state.pl.loginStreak || 0) >= 100,
      progress: (state: GameState) => ({ current: state.pl.loginStreak || 0, target: 100 })
    },
    reward: { cash: 1000000 }
  },

  // DAILY CHALLENGES (3)
  {
    id: 'DAILY_7',
    name: 'Consistent Contributor',
    description: 'Complete 7 daily challenges.',
    category: 'DAILY CHALLENGES',
    requirement: {
      check: (state: GameState) => (state.pl.completedDailyChallengesCount || 0) >= 7,
      progress: (state: GameState) => ({ current: state.pl.completedDailyChallengesCount || 0, target: 7 })
    },
    reward: { cash: 5000 }
  },
  {
    id: 'DAILY_30',
    name: 'Challenge Veteran',
    description: 'Complete 30 daily challenges.',
    category: 'DAILY CHALLENGES',
    requirement: {
      check: (state: GameState) => (state.pl.completedDailyChallengesCount || 0) >= 30,
      progress: (state: GameState) => ({ current: state.pl.completedDailyChallengesCount || 0, target: 30 })
    },
    reward: { cash: 25000 }
  },
  {
    id: 'DAILY_100',
    name: 'Master of Routine',
    description: 'Complete 100 daily challenges.',
    category: 'DAILY CHALLENGES',
    requirement: {
      check: (state: GameState) => (state.pl.completedDailyChallengesCount || 0) >= 100,
      progress: (state: GameState) => ({ current: state.pl.completedDailyChallengesCount || 0, target: 100 })
    },
    reward: { cash: 500000 }
  },

  // LEGACY (4)
  {
    id: 'LEGACY_1K',
    name: 'Name to Remember',
    description: 'Legacy score 1,000.',
    category: 'LEGACY',
    requirement: {
      check: (state: GameState) => (state.pl.legacyPoints || 0) >= 1000,
      progress: (state: GameState) => ({ current: state.pl.legacyPoints || 0, target: 1000 })
    },
    reward: { aura: 1000 }
  },
  {
    id: 'LEGACY_5K',
    name: 'Generational Wealth',
    description: 'Legacy score 5,000.',
    category: 'LEGACY',
    requirement: {
      check: (state: GameState) => (state.pl.legacyPoints || 0) >= 5000,
      progress: (state: GameState) => ({ current: state.pl.legacyPoints || 0, target: 5000 })
    },
    reward: { aura: 5000 }
  },
  {
    id: 'LEGACY_10K',
    name: 'Historical Figure',
    description: 'Legacy score 10,000.',
    category: 'LEGACY',
    requirement: {
      check: (state: GameState) => (state.pl.legacyPoints || 0) >= 10000,
      progress: (state: GameState) => ({ current: state.pl.legacyPoints || 0, target: 10000 })
    },
    reward: { aura: 10000 }
  },
  {
    id: 'LEGACY_50K',
    name: 'Eternal Mogul',
    description: 'Legacy score 50,000.',
    category: 'LEGACY',
    requirement: {
      check: (state: GameState) => (state.pl.legacyPoints || 0) >= 50000,
      progress: (state: GameState) => ({ current: state.pl.legacyPoints || 0, target: 50000 })
    },
    reward: { aura: 50000 }
  },

  // ENDINGS (4)
  {
    id: 'END_LOW',
    name: 'Humble Beginnings',
    description: 'Unlock low legacy ending.',
    category: 'ENDINGS',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'SPECIAL_EVENT' && event.metadata.type === 'ENDING_UNLOCKED' && event.metadata.legacyPoints < 100,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 5000 }
  },
  {
    id: 'END_MED',
    name: 'Respected Figure',
    description: 'Unlock medium legacy ending.',
    category: 'ENDINGS',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'SPECIAL_EVENT' && event.metadata.type === 'ENDING_UNLOCKED' && event.metadata.legacyPoints >= 100 && event.metadata.legacyPoints < 1000,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 50000 }
  },
  {
    id: 'END_HIGH',
    name: 'Legendary Status',
    description: 'Unlock high legacy ending.',
    category: 'ENDINGS',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'SPECIAL_EVENT' && event.metadata.type === 'ENDING_UNLOCKED' && event.metadata.legacyPoints >= 1000 && event.metadata.legacyPoints < 5000,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 500000 }
  },
  {
    id: 'END_LEGEND',
    name: 'God Tier Mogul',
    description: 'Unlock legendary legacy ending.',
    category: 'ENDINGS',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'SPECIAL_EVENT' && event.metadata.type === 'ENDING_UNLOCKED' && event.metadata.legacyPoints >= 5000,
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 5000000 }
  }
];
