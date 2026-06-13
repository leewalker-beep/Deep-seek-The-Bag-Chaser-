import type { StateCreator } from 'zustand';
import type { GameState } from '../../types/game';

export interface DailyChallenge {
  id: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  reward: { cash: number };
}

export interface ChallengeSlice {
  dailyChallenges: DailyChallenge[];
  loginStreak: number;
  lastLoginDate: string | null;

  checkChallenges: () => void;
  updateChallengeProgress: (type: string, amount: number) => void;
  processLogin: () => void;
}

export const createChallengeSlice: StateCreator<GameState, [], [], ChallengeSlice> = (set, get) => ({
  dailyChallenges: [
    { id: 'hustle_count', description: 'Complete 10 hustles today', target: 10, current: 0, isCompleted: false, reward: { cash: 5000 } },
    { id: 'earn_cash', description: 'Earn $50,000 in a single day', target: 50000, current: 0, isCompleted: false, reward: { cash: 10000 } },
    { id: 'clout_gain', description: 'Gain 100 Clout', target: 100, current: 0, isCompleted: false, reward: { cash: 5000 } },
  ],
  loginStreak: 0,
  lastLoginDate: null,

  processLogin: () => {
    const today = new Date().toISOString().split('T')[0];
    const state = get() as any;

    if (state.lastLoginDate === today) return;

    let newStreak = 1;
    if (state.lastLoginDate) {
      const lastDate = new Date(state.lastLoginDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        newStreak = (state.loginStreak || 0) + 1;
      }
    }

    set({
      loginStreak: newStreak,
      lastLoginDate: today,
      dailyChallenges: [
        { id: 'hustle_count', description: 'Complete 10 hustles today', target: 10, current: 0, isCompleted: false, reward: { cash: 5000 } },
        { id: 'earn_cash', description: 'Earn $50,000 in a single day', target: 50000, current: 0, isCompleted: false, reward: { cash: 10000 } },
        { id: 'clout_gain', description: 'Gain 100 Clout', target: 100, current: 0, isCompleted: false, reward: { cash: 5000 } },
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
        pl: { ...state.pl, bag: state.pl.bag + bonusCash },
        news: [`🎁 DAILY CHALLENGE COMPLETE: +$${bonusCash.toLocaleString()}`, ...state.news.slice(0, 49)]
      } as any);
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
