import type { StateCreator } from 'zustand';
import type { GameState, Achievement } from '../../types/game';
import { ACHIEVEMENTS } from '../../config/achievements';

export interface AchievementSlice {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = ACHIEVEMENTS.map(a => ({
  id: a.id,
  name: a.name,
  description: a.description,
  category: a.category,
  isUnlocked: false,
  reward: a.reward,
}));

export const createAchievementSlice: StateCreator<GameState, [], [], AchievementSlice> = (set, get) => ({
  achievements: INITIAL_ACHIEVEMENTS,

  unlockAchievement: (id) => {
    set((state) => {
      const currentAchievements = (state as GameState).achievements;
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
            heat: Math.max(0, state.pl.heat + (achievement.reward?.heat || 0)),
            mentalHealth: Math.min(100, state.pl.mentalHealth + (achievement.reward?.mentalHealth || 0)),
            legacyPoints: (state.pl.legacyPoints || 0) + (achievement.reward?.legacyPoints || 0),
            unlockedAchievements: Array.from(new Set([...(state.pl.unlockedAchievements || []), id])),
          }
        };
      }
      return state;
    });

    get().logEvent('SPECIAL_EVENT', { type: 'ACHIEVEMENT_UNLOCKED', achievementId: id });
  },
});
