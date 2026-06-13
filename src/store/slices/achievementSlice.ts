import type { StateCreator } from 'zustand';
import type { GameState } from '../../types/game';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  reward?: {
    cash?: number;
    clout?: number;
    aura?: number;
  };
}

export interface AchievementSlice {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_HUSTLE', name: 'The First Grind', description: 'Complete your very first hustle.', isUnlocked: false },
  { id: 'CASH_10K', name: 'Ten Bands', description: 'Accumulate $10,000 in your bag.', isUnlocked: false },
  { id: 'CASH_100K', name: 'Six Figures', description: 'Accumulate $100,000 in your bag.', isUnlocked: false },
  { id: 'CASH_1M', name: 'Millionaire Club', description: 'Accumulate $1,000,000 in your bag.', isUnlocked: false },
  { id: 'CLOUT_100', name: 'Rising Star', description: 'Reach 100 Clout.', isUnlocked: false },
  { id: 'AURA_100', name: 'Mysterious Figure', description: 'Reach 100 Aura.', isUnlocked: false },
];

export const createAchievementSlice: StateCreator<GameState, [], [], AchievementSlice> = (set) => ({
  achievements: INITIAL_ACHIEVEMENTS,

  unlockAchievement: (id) => {
    set((state) => {
      const currentAchievements = (state as any).achievements as Achievement[];
      const achievement = currentAchievements.find((a) => a.id === id);

      if (achievement && !achievement.isUnlocked) {
        const updatedAchievements = currentAchievements.map((a) =>
          a.id === id ? { ...a, isUnlocked: true, unlockedAt: Date.now() } : a
        );

        const tickerMessage = `🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}`;

        return {
          achievements: updatedAchievements,
          news: [tickerMessage, ...state.news.slice(0, 49)],
          pl: {
            ...state.pl,
            bag: state.pl.bag + (achievement.reward?.cash || 0),
            clout: state.pl.clout + (achievement.reward?.clout || 0),
            aura: state.pl.aura + (achievement.reward?.aura || 0),
          }
        };
      }
      return state;
    });
  },
});
