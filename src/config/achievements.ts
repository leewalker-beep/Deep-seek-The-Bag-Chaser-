import type { GameState, GameEvent, HustleCompletedMetadata, SpecialEventMetadata } from '../types/game';

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

const PROGRESSION_STRINGS: Record<string, { name: string; description: string }> = {
  MUD: { name: "Crawling Out", description: "You made it out of the mud. Barely." },
  STREET: { name: "Off the Block", description: "The streets know your name now." },
  STARTUP: { name: "In the Game", description: "You're building something. Don't blow it." },
  CORPORATE: { name: "Suit Up", description: "Corner office. Glass ceiling. Break it." },
  ELITE: { name: "Different League", description: "Most people never get here." },
  MOGUL: { name: "Untouchable", description: "You own the game now." },
  PRESIDENT: { name: "The Real Power", description: "They all answer to you." },
  OPEN: { name: "God Mode", description: "There are no more rules." },
};

export const ACHIEVEMENTS: AchievementConfig[] = [
  // PROGRESSION (8)
  ...TIER_ORDER.map((tier, index) => ({
    id: `PROG_${tier}`,
    name: PROGRESSION_STRINGS[tier].name,
    description: PROGRESSION_STRINGS[tier].description,
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
    name: 'First Blood',
    description: 'Maxed your first hustle. Now do it again.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.length >= 1,
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.length, target: 1 })
    },
    reward: { cash: 1000, clout: 20 }
  },
  {
    id: 'MASTERY_ANY_5',
    name: 'Serial Grinder',
    description: "Five hustles mastered. You don't stop.",
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
    description: 'Ten hustles mastered. Respect the grind.',
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
    description: 'Twenty hustles mastered. You own every trade.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.length >= 20,
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.length, target: 20 })
    },
    reward: { cash: 1000000, clout: 2000, aura: 1000 }
  },
  {
    id: 'MASTERY_TECH_FLIPPING',
    name: 'Silicon Flip',
    description: 'Market moved. You profited.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('techFlip'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('techFlip') ? 1 : 0, target: 1 })
    },
    reward: { cash: 5000 }
  },
  {
    id: 'MASTERY_DROPSHIPPING',
    name: 'Logistics King',
    description: 'Supply met demand. You took the cut.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('drop'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('drop') ? 1 : 0, target: 1 })
    },
    reward: { cash: 5000 }
  },
  {
    id: 'MASTERY_STREET_EATS',
    name: 'Street Elite',
    description: 'Five stars on the pavement.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('street_eats'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('street_eats') ? 1 : 0, target: 1 })
    },
    reward: { aura: 50 }
  },
  {
    id: 'MASTERY_VENDING',
    name: 'Passive Power',
    description: 'Money while you sleep.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('r_vending'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('r_vending') ? 1 : 0, target: 1 })
    },
    reward: { cash: 2000 }
  },
  {
    id: 'MASTERY_CRYPTO',
    name: 'Chain Master',
    description: 'Mining the future.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('crypto_mining'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('crypto_mining') ? 1 : 0, target: 1 })
    },
    reward: { aura: 200 }
  },
  {
    id: 'MASTERY_REAL_ESTATE',
    name: 'Skyline Legend',
    description: 'The city is your portfolio.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('real_estate_empire'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('real_estate_empire') ? 1 : 0, target: 1 })
    },
    reward: { clout: 500 }
  },
  {
    id: 'MASTERY_LOBBYING',
    name: 'Puppet Master',
    description: 'Laws are just suggestions.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('lobbying'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('lobbying') ? 1 : 0, target: 1 })
    },
    reward: { aura: 1000 }
  },
  {
    id: 'MASTERY_PRIVATE_EQUITY',
    name: 'Asset Stripper',
    description: 'Buy, gut, flip, repeat.',
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
    name: 'The Million',
    description: 'Different breed.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 1000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 1000000 })
    },
    reward: { aura: 100 }
  },
  {
    id: 'EARN_10M',
    name: 'Eight Zeros',
    description: 'They study you now.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 10000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 10000000 })
    },
    reward: { clout: 200 }
  },
  {
    id: 'EARN_100M',
    name: 'Nine Figures',
    description: 'A global player.',
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
    description: 'You own the board.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 1000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 1000000000 })
    },
    reward: { clout: 1000, aura: 1000 }
  },
  {
    id: 'EARN_10B',
    name: 'Decabillionaire',
    description: 'Economic force.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 10000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 10000000000 })
    },
    reward: { clout: 5000, aura: 5000 }
  },
  {
    id: 'EARN_100B',
    name: 'Centibillionaire',
    description: 'Titan of industry.',
    category: 'EARNINGS',
    requirement: {
      check: (state: GameState) => (state.pl.stats?.lifetimeEarnings || 0) >= 100000000000,
      progress: (state: GameState) => ({ current: state.pl.stats?.lifetimeEarnings || 0, target: 100000000000 })
    },
    reward: { clout: 10000, aura: 10000 }
  },
  {
    id: 'EARN_1T',
    name: 'The Trillionaire',
    description: 'First of your kind.',
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
    name: 'Mash King',
    description: 'Fingers of fury. Perfect score.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'StruggleMash' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_REACTION',
    name: 'Light Speed',
    description: 'Frame-perfect reflexes.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'QuickReaction' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_SWIPE',
    name: 'Clean Sweep',
    description: 'Zero friction. Total control.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return (m.miniGame === 'SwipeOrder' || m.miniGame === 'FamilyDeli') && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_TAP',
    name: 'Perfect Rhythm',
    description: 'In the pocket. Every time.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'TapRhythm' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_SEQUENCE',
    name: 'Steel Trap',
    description: 'You forget nothing.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'SequenceRecall' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_PATTERN',
    name: 'The Architect',
    description: 'You see the code.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'PatternMemory' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_BALANCE',
    name: 'Zen State',
    description: 'Perfectly centered.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'BalanceScale' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },
  {
    id: 'SKILL_GRID',
    name: 'Grid Ghost',
    description: 'Moving faster than the eye.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.miniGame === 'ReactionGrid' && m.multiplier >= 2.0;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 1000 }
  },

  // COLLECTION (7)
  {
    id: 'COLL_FLEX',
    name: 'Iced Out',
    description: 'Every flex asset owned. Pure dominance.',
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
    name: 'Weekly Grinder',
    description: 'Seven days straight. Respect.',
    category: 'STREAKS',
    requirement: {
      check: (state: GameState) => (state.pl.loginStreak || 0) >= 7,
      progress: (state: GameState) => ({ current: state.pl.loginStreak || 0, target: 7 })
    },
    reward: { cash: 7000 }
  },
  {
    id: 'STREAK_30',
    name: 'No Days Off',
    description: 'A month. No excuses.',
    category: 'STREAKS',
    requirement: {
      check: (state: GameState) => (state.pl.loginStreak || 0) >= 30,
      progress: (state: GameState) => ({ current: state.pl.loginStreak || 0, target: 30 })
    },
    reward: { cash: 30000 }
  },
  {
    id: 'STREAK_100',
    name: 'Century Club',
    description: '100 days straight. Untouchable.',
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
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'SPECIAL_EVENT') return false;
        const m = event.metadata as SpecialEventMetadata;
        if (m.type !== 'ENDING_UNLOCKED') return false;
        return m.legacyPoints < 100;
      },
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
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'SPECIAL_EVENT') return false;
        const m = event.metadata as SpecialEventMetadata;
        if (m.type !== 'ENDING_UNLOCKED') return false;
        return m.legacyPoints >= 100 && m.legacyPoints < 1000;
      },
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
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'SPECIAL_EVENT') return false;
        const m = event.metadata as SpecialEventMetadata;
        if (m.type !== 'ENDING_UNLOCKED') return false;
        return m.legacyPoints >= 1000 && m.legacyPoints < 5000;
      },
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
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'SPECIAL_EVENT') return false;
        const m = event.metadata as SpecialEventMetadata;
        if (m.type !== 'ENDING_UNLOCKED') return false;
        return m.legacyPoints >= 5000;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 5000000 }
  },

  // RIVALS
  {
    id: 'RIVAL_CRUSHED',
    name: 'Smoke Cleared',
    description: 'Rival buried. Market secured.',
    category: 'PROGRESSION',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => event?.type === 'RIVAL_DEFEATED',
      progress: (state: GameState) => {
        const defeatEvents = state.pl.events.filter(e => e.type === 'RIVAL_DEFEATED').length;
        return { current: defeatEvents, target: 1 };
      }
    },
    reward: { aura: 100 }
  },

  // FAMILY DELI SPECIFIC
  {
    id: 'DELI_LUNCH_RUSH',
    name: 'Lunch Rush',
    description: 'Handled the midday chaos at the deli.',
    category: 'MINIGAME SKILL',
    requirement: {
      check: (_state: GameState, event?: GameEvent) => {
        if (event?.type !== 'HUSTLE_COMPLETED') return false;
        const m = event.metadata as HustleCompletedMetadata;
        return m.hustleId === 'unique_hustle_deli' && m.multiplier >= 1.5;
      },
      progress: (_state: GameState) => ({ current: 0, target: 1 })
    },
    reward: { cash: 500 }
  },
  {
    id: 'DELI_COMMUNITY_FAVE',
    name: 'Community Favourite',
    description: 'Everyone in the neighborhood knows your sandwiches.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => (state.pl.hustleLevels['unique_hustle_deli'] || 0) >= 2,
      progress: (state: GameState) => ({ current: state.pl.hustleLevels['unique_hustle_deli'] || 0, target: 2 })
    },
    reward: { aura: 50 }
  },
  {
    id: 'DELI_LOCAL_LEGEND',
    name: 'Local Legend',
    description: 'The Family Deli is now a city institution.',
    category: 'HUSTLE MASTERY',
    requirement: {
      check: (state: GameState) => state.pl.masteredHustles.includes('unique_hustle_deli'),
      progress: (state: GameState) => ({ current: state.pl.masteredHustles.includes('unique_hustle_deli') ? 1 : 0, target: 1 })
    },
    reward: { clout: 100, aura: 100 }
  }
];
