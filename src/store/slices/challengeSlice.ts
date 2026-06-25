import type { StateCreator } from 'zustand';
import type { GameState, Tier } from '../../types/game';

export interface DailyChallenge {
  id: string;
  type?: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  reward: { cash: number; aura?: number; clout?: number };
}

export interface ChallengeSlice {
  dailyChallenges: DailyChallenge[];
  loginStreak: number;
  lastLoginDate: string | null;

  checkChallenges: () => void;
  updateChallengeProgress: (type: string, amount: number) => void;
  processLogin: () => void;
  getStreakReward: (streak: number) => { cash: number; aura?: number; clout?: number };
}

const CHALLENGE_POOL: Record<Tier, Partial<DailyChallenge>[]> = {
  MUD: [
    { id: 'mud_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 2000 } },
    { id: 'mud_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 10000 } },
    { id: 'mud_earn_25k', type: 'earn_cash', description: 'Earn $25,000', target: 25000, reward: { cash: 5000 } },
    { id: 'mud_earn_100k', type: 'earn_cash', description: 'Earn $100,000', target: 100000, reward: { cash: 25000 } },
    { id: 'mud_clout_50', type: 'clout_gain', description: 'Gain 50 Clout', target: 50, reward: { cash: 2000, clout: 20 } },
    { id: 'mud_aura_50', type: 'aura_gain', description: 'Gain 50 Aura', target: 50, reward: { cash: 2000, aura: 20 } },
    { id: 'mud_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 20000 } },
  ],
  STREET: [
    { id: 'street_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 10000 } },
    { id: 'street_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 25000 } },
    { id: 'street_earn_100k', type: 'earn_cash', description: 'Earn $100,000', target: 100000, reward: { cash: 15000 } },
    { id: 'street_earn_500k', type: 'earn_cash', description: 'Earn $500,000', target: 500000, reward: { cash: 50000 } },
    { id: 'street_clout_150', type: 'clout_gain', description: 'Gain 150 Clout', target: 150, reward: { cash: 10000, clout: 50 } },
    { id: 'street_aura_150', type: 'aura_gain', description: 'Gain 150 Aura', target: 150, reward: { cash: 10000, aura: 50 } },
    { id: 'street_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 50000 } },
  ],
  STARTUP: [
    { id: 'startup_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 50000 } },
    { id: 'startup_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 150000 } },
    { id: 'startup_earn_500k', type: 'earn_cash', description: 'Earn $500,000', target: 500000, reward: { cash: 100000 } },
    { id: 'startup_earn_2M', type: 'earn_cash', description: 'Earn $2,000,000', target: 2000000, reward: { cash: 250000 } },
    { id: 'startup_clout_400', type: 'clout_gain', description: 'Gain 400 Clout', target: 400, reward: { cash: 50000, clout: 150 } },
    { id: 'startup_aura_400', type: 'aura_gain', description: 'Gain 400 Aura', target: 400, reward: { cash: 50000, aura: 150 } },
    { id: 'startup_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 200000 } },
  ],
  CORPORATE: [
    { id: 'corp_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 250000 } },
    { id: 'corp_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 750000 } },
    { id: 'corp_earn_5M', type: 'earn_cash', description: 'Earn $5,000,000', target: 5000000, reward: { cash: 500000 } },
    { id: 'corp_earn_25M', type: 'earn_cash', description: 'Earn $25,000,000', target: 25000000, reward: { cash: 1500000 } },
    { id: 'corp_clout_1000', type: 'clout_gain', description: 'Gain 1,000 Clout', target: 1000, reward: { cash: 250000, clout: 400 } },
    { id: 'corp_aura_1000', type: 'aura_gain', description: 'Gain 1,000 Aura', target: 1000, reward: { cash: 250000, aura: 400 } },
    { id: 'corp_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 1000000 } },
  ],
  ELITE: [
    { id: 'elite_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 500000 } },
    { id: 'elite_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 1500000 } },
    { id: 'elite_earn_25M', type: 'earn_cash', description: 'Earn $25,000,000', target: 25000000, reward: { cash: 1000000 } },
    { id: 'elite_earn_100M', type: 'earn_cash', description: 'Earn $100,000,000', target: 100000000, reward: { cash: 2000000 } },
    { id: 'elite_clout_2500', type: 'clout_gain', description: 'Gain 2,500 Clout', target: 2500, reward: { cash: 500000, clout: 500 } },
    { id: 'elite_aura_2500', type: 'aura_gain', description: 'Gain 2,500 Aura', target: 2500, reward: { cash: 500000, aura: 500 } },
    { id: 'elite_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 2000000 } },
  ],
  MOGUL: [
    { id: 'mogul_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 10000000 } },
    { id: 'mogul_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 25000000 } },
    { id: 'mogul_earn_250M', type: 'earn_cash', description: 'Earn $250,000,000', target: 250000000, reward: { cash: 20000000 } },
    { id: 'mogul_earn_1B', type: 'earn_cash', description: 'Earn $1,000,000,000', target: 1000000000, reward: { cash: 50000000 } },
    { id: 'mogul_clout_10k', type: 'clout_gain', description: 'Gain 10,000 Clout', target: 10000, reward: { cash: 15000000, clout: 2000 } },
    { id: 'mogul_aura_10k', type: 'aura_gain', description: 'Gain 10,000 Aura', target: 10000, reward: { cash: 15000000, aura: 2000 } },
    { id: 'mogul_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 50000000 } },
  ],
  PRESIDENT: [
    { id: 'pres_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 100000000 } },
    { id: 'pres_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 300000000 } },
    { id: 'pres_earn_5B', type: 'earn_cash', description: 'Earn $5,000,000,000', target: 5000000000, reward: { cash: 100000000 } },
    { id: 'pres_earn_25B', type: 'earn_cash', description: 'Earn $25,000,000,000', target: 25000000000, reward: { cash: 500000000 } },
    { id: 'pres_clout_50k', type: 'clout_gain', description: 'Gain 50,000 Clout', target: 50000, reward: { cash: 100000000, clout: 5000 } },
    { id: 'pres_aura_50k', type: 'aura_gain', description: 'Gain 50,000 Aura', target: 50000, reward: { cash: 100000000, aura: 5000 } },
    { id: 'pres_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 500000000 } },
  ],
  OPEN: [
    { id: 'open_hustle_5', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 10000000 } },
    { id: 'open_hustle_15', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 50000000 } },
    { id: 'open_earn_500M', type: 'earn_cash', description: 'Earn $500,000,000', target: 500000000, reward: { cash: 25000000 } },
    { id: 'open_earn_2B', type: 'earn_cash', description: 'Earn $2,000,000,000', target: 2000000000, reward: { cash: 100000000 } },
    { id: 'open_clout_5000', type: 'clout_gain', description: 'Gain 5,000 Clout', target: 5000, reward: { cash: 5000000, clout: 1000 } },
    { id: 'open_aura_5000', type: 'aura_gain', description: 'Gain 5,000 Aura', target: 5000, reward: { cash: 5000000, aura: 1000 } },
    { id: 'open_big_win', type: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 50000000 } },
  ],
};

export const createChallengeSlice: StateCreator<GameState, [], [], ChallengeSlice> = (set, get) => ({
  dailyChallenges: [],
  loginStreak: 0,
  lastLoginDate: null,

  getStreakReward: (streak) => {
    if (streak >= 30) return { cash: 1000000, aura: 500, clout: 500 };
    if (streak >= 21) return { cash: 500000, aura: 200 };
    if (streak >= 14) return { cash: 250000, clout: 200 };
    if (streak >= 10) return { cash: 100000 };
    if (streak >= 7) return { cash: 50000, aura: 50 };
    if (streak >= 5) return { cash: 25000 };
    if (streak >= 3) return { cash: 10000 };
    if (streak >= 2) return { cash: 5000 };
    return { cash: 1000 };
  },

  processLogin: () => {
    const today = new Date().toISOString().split('T')[0];
    const state = get() as any;

    if (state.lastLoginDate === today) return;

    let newStreak = 1;
    let resetStreak = false;
    if (state.lastLoginDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (state.lastLoginDate === yesterdayStr) {
        newStreak = (state.loginStreak || 0) + 1;
      } else {
        resetStreak = true;
      }
    }

    // Generate 3 random challenges from tier-appropriate pool
    const tier = (state.pl?.currentTier as Tier) || 'MUD';
    const pool = CHALLENGE_POOL[tier] || CHALLENGE_POOL.MUD;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map(c => ({
      ...c,
      current: 0,
      isCompleted: false
    })) as DailyChallenge[];

    const reward = (get() as any).getStreakReward(newStreak);

    set({
      loginStreak: newStreak,
      lastLoginDate: today,
      dailyChallenges: selected,
      pl: {
        ...state.pl,
        bag: state.pl.bag + (reward.cash || 0),
        clout: state.pl.clout + (reward.clout || 0),
        aura: state.pl.aura + (reward.aura || 0),
        loginStreak: newStreak,
      },
      news: [
        `📅 Welcome back! Day ${newStreak} Login Streak.`,
        `🎁 Streak Reward: +$${reward.cash.toLocaleString()}${reward.aura ? `, +${reward.aura} Aura` : ''}`,
        ...(resetStreak ? ['⚠️ Streak reset! You missed a day.'] : []),
        ...state.news
      ]
    } as any);
  },

  checkChallenges: () => {
    const state = get() as any;
    const completedChallenges = state.dailyChallenges.filter((c: any) => !c.isCompleted && c.current >= c.target);

    if (completedChallenges.length > 0) {
      let bonusCash = 0;
      const updatedChallenges = state.dailyChallenges.map((c: any) => {
        if (!c.isCompleted && c.current >= c.target) {
          bonusCash += c.reward.cash;
          return { ...c, isCompleted: true };
        }
        return c;
      });

      set({
        dailyChallenges: updatedChallenges,
        pl: {
          ...state.pl,
          bag: state.pl.bag + bonusCash,
          completedDailyChallengesCount: (state.pl.completedDailyChallengesCount || 0) + completedChallenges.length,
          totalChallengesCompleted: (state.pl.totalChallengesCompleted || 0) + completedChallenges.length
        },
        news: [`🎁 CHALLENGE COMPLETE: +$${bonusCash.toLocaleString()}`, ...state.news.slice(0, 49)]
      } as any);

      get().logEvent('SPECIAL_EVENT', { type: 'DAILY_CHALLENGE_COMPLETED', count: completedChallenges.length });
    }
  },

  updateChallengeProgress: (idOrType, amount) => {
    const state = get() as any;
    const updatedChallenges = state.dailyChallenges.map((c: any) =>
        (c.id === idOrType || c.type === idOrType) ? { ...c, current: c.current + amount } : c
    );

    set({ dailyChallenges: updatedChallenges } as any);
    (get() as any).checkChallenges();
  }
});
