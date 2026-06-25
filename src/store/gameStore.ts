import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '../types/game';
import { GAME_CONSTANTS } from '../config/gameConstants';
import { createUISlice } from './slices/uiSlice';
import { createMarketSlice } from './slices/marketSlice';
import { createPlayerStatsSlice } from './slices/playerStatsSlice';
import { createHustleSlice } from './slices/hustleSlice';
import { createAchievementSlice } from './slices/achievementSlice';
import { createChallengeSlice } from './slices/challengeSlice';
import { createPresidentSlice } from './slices/presidentSlice';

export const useGameStore = create<GameState>()(
  persist(
    (...a) => ({
      ...createUISlice(...a),
      ...createMarketSlice(...a),
      ...createPlayerStatsSlice(...a),
      ...createHustleSlice(...a),
      ...createAchievementSlice(...a),
      ...createChallengeSlice(...a),
      ...createPresidentSlice(...a),
    }),
    {
      name: 'bag-chaser-save',
      partialize: (state) => ({
        pl: {
          ...state.pl,
          actionLog: state.pl.actionLog?.slice(0, GAME_CONSTANTS.ACTION_LOG_MAX_SIZE),
        },
        rivals: state.pl.rivals,
        ph: state.ph,
        currentMarket: state.currentMarket,
        unlockedHustles: state.unlockedHustles,
        activeTab: state.activeTab,
        difficulty: state.difficulty,
        chosenBackground: state.chosenBackground,
        tutorialStep: state.tutorialStep,
        isTutorialSkipped: state.isTutorialSkipped,
        achievements: state.achievements,
        loginStreak: state.loginStreak,
        lastLoginDate: state.lastLoginDate,
        dailyChallenges: state.dailyChallenges,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}
