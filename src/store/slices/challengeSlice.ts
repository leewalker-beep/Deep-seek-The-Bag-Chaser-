import type { StateCreator } from 'zustand';
import type { GameState } from '../../types/game';

export interface DailyChallenge {
  id: string;
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

const CHALLENGE_POOL = [
  { id: 'hustle_count', description: 'Complete 5 hustles', target: 5, reward: { cash: 2000 } },
  { id: 'hustle_count_high', id_actual: 'hustle_count', description: 'Complete 15 hustles', target: 15, reward: { cash: 10000 } },
  { id: 'earn_cash', description: 'Earn $25,000', target: 25000, reward: { cash: 5000 } },
  { id: 'earn_cash_high', id_actual: 'earn_cash', description: 'Earn $1,000,000', target: 1000000, reward: { cash: 50000 } },
  { id: 'clout_gain', description: 'Gain 50 Clout', target: 50, reward: { cash: 2000, clout: 20 } },
  { id: 'aura_gain', description: 'Gain 50 Aura', target: 50, reward: { cash: 2000, aura: 20 } },
  { id: 'big_win', description: 'Get a Big Win', target: 1, reward: { cash: 20000 } },
];

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

    // Generate 3 random challenges
    const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map(c => ({
      ...c,
      id: (c as any).id_actual || c.id,
      current: 0,
      isCompleted: false
    }));

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
          completedDailyChallengesCount: (state.pl.completedDailyChallengesCount || 0) + completedChallenges.length
        },
        news: [`🎁 CHALLENGE COMPLETE: +$${bonusCash.toLocaleString()}`, ...state.news.slice(0, 49)]
      } as any);

      get().logEvent('SPECIAL_EVENT', { type: 'DAILY_CHALLENGE_COMPLETED', count: completedChallenges.length });
    }
  },

  updateChallengeProgress: (id, amount) => {
    const state = get() as any;
    const updatedChallenges = state.dailyChallenges.map((c: any) =>
        c.id === id ? { ...c, current: c.current + amount } : c
    );

    set({ dailyChallenges: updatedChallenges } as any);
    (get() as any).checkChallenges();
  }
});
