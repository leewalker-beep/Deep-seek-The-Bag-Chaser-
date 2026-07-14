import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
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
  subscribeWithSelector(persist(
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
          seenFlexThresholds: state.pl.seenFlexThresholds,
          pendingFlexOffer: state.pl.pendingFlexOffer,
          flexOfferCooldown: state.pl.flexOfferCooldown,
          avatarId: state.pl.avatarId,
          deathContext: state.pl.deathContext,
          activeLiveEvent: state.pl.activeLiveEvent,
          completedLiveEvents: state.pl.completedLiveEvents,
          inJail: state.pl.inJail,
          jailMonthsRemaining: state.pl.jailMonthsRemaining,
          jailSentenceTotal: state.pl.jailSentenceTotal,
          jailCharge: state.pl.jailCharge,
          backgroundId: state.pl.backgroundId,
          categoryId: state.pl.categoryId,
          variationId: state.pl.variationId,
          consequences: state.pl.consequences,
          ambitions: state.pl.ambitions,
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
        originBonus: state.pl.originBonus,
        bankedLegacyPoints: state.bankedLegacyPoints,
        unlockedLegacyUpgradeIds: state.unlockedLegacyUpgradeIds,
      }),
    }
  ))
);

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).useGameStore = useGameStore;
}
