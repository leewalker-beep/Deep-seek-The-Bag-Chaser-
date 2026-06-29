import type { StateCreator } from 'zustand';
import type { GameState, Tier, DailyChallenge } from '../../types/game';
import { generateDynamicChallenges } from '../../engine/challengeEngine';

export interface ChallengeSlice {
  dailyChallenges: DailyChallenge[];
  loginStreak: number;
  lastLoginDate: string | null;

  checkChallenges: () => void;
  updateChallengeProgress: (type: string, amount: number) => void;
  processLogin: () => void;
  getStreakReward: (streak: number, tier?: Tier) => { cash: number; aura?: number; clout?: number };
}

export const createChallengeSlice: StateCreator<GameState, [], [], ChallengeSlice> = (set, get) => ({
  dailyChallenges: [],
  loginStreak: 0,
  lastLoginDate: null,

  getStreakReward: (streak, tier) => {
    const tierMultiplier = {
      MUD: 1,
      STREET: 5,
      STARTUP: 20,
      CORPORATE: 100,
      ELITE: 500,
      MOGUL: 5000,
      PRESIDENT: 50000,
      OPEN: 10000,
    }[tier || 'MUD'] || 1;

    let baseReward: { cash: number; aura?: number; clout?: number };
    if (streak >= 30) baseReward = { cash: 1000000, aura: 500, clout: 500 };
    else if (streak >= 21) baseReward = { cash: 500000, aura: 200 };
    else if (streak >= 14) baseReward = { cash: 250000, clout: 200 };
    else if (streak >= 10) baseReward = { cash: 100000 };
    else if (streak >= 7) baseReward = { cash: 50000, aura: 50 };
    else if (streak >= 5) baseReward = { cash: 25000 };
    else if (streak >= 3) baseReward = { cash: 10000 };
    else if (streak >= 2) baseReward = { cash: 5000 };
    else baseReward = { cash: 1000 };

    return {
      cash: baseReward.cash * tierMultiplier,
      aura: baseReward.aura ? baseReward.aura * tierMultiplier : undefined,
      clout: baseReward.clout ? baseReward.clout * tierMultiplier : undefined,
    };
  },

  processLogin: () => {
    const today = new Date().toISOString().split('T')[0];
    const state = get();

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

    // Generate 3 random challenges dynamically
    const selected = generateDynamicChallenges(state.pl, state.currentMarket);

    const reward = get().getStreakReward(newStreak, state.pl.currentTier);

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
    });
  },

  checkChallenges: () => {
    const state = get();
    const completedChallenges = state.dailyChallenges.filter((c) => !c.isCompleted && c.current >= c.target);

    if (completedChallenges.length > 0) {
      let bonusCash = 0;
      const updatedChallenges = state.dailyChallenges.map((c) => {
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
      });

      get().logEvent('SPECIAL_EVENT', { type: 'DAILY_CHALLENGE_COMPLETED', count: completedChallenges.length });
    }
  },

  updateChallengeProgress: (idOrType, amount) => {
    const state = get();
    const updatedChallenges = state.dailyChallenges.map((c) =>
        (c.id === idOrType || c.type === idOrType) ? { ...c, current: c.current + amount } : c
    );

    set({ dailyChallenges: updatedChallenges });
    get().checkChallenges();
  }
});
