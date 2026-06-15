import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HUSTLES } from '../src/config/hustles/base';
import { useGameStore } from '../src/store/gameStore';

// Mock browser globals
global.document = {
  body: {
    className: ''
  }
} as any;

global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
} as any;

// Mock confetti
vi.mock('../src/components/effects/Confetti', () => ({
  showConfetti: vi.fn(),
}));

describe('Hustle Event and Scoring Audit', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame(3); // Start as Grinder
  });

  const allHustles = Object.keys(HUSTLES);

  allHustles.forEach((hustleId) => {
    const hustle = HUSTLES[hustleId];

    it(`should fire events and update stats for hustle: ${hustleId}`, async () => {
      const state = useGameStore.getState();

      // Setup state to ensure we can execute the hustle
      useGameStore.setState({
        pl: {
          ...state.pl,
          bag: 100000000000, // 100 Billion
          clout: 1000000,
          aura: 1000000,
          currentTier: hustle.tier as any, // Match tier
          hustleBranchIds: hustle.branches ? { [hustleId]: Object.keys(hustle.branches)[0] } : {},
        }
      });

      const initialTotalHustles = useGameStore.getState().pl.stats.totalHustles;

      // Execute hustle
      // For hustles with panels, we might need special handling if they don't use defaultStrategy
      // But executeHustle calls strategy, so it should still work.
      const result = useGameStore.getState().executeHustle(hustleId, 1, true);

      if (!result.success && hustle.branches) {
          // If it's a branching hustle and executeHustle failed, try executeBranch
          const branchId = Object.keys(hustle.branches)[0];
          useGameStore.getState().executeBranch(hustleId, branchId);
      }

      // Verify stats updated
      const updatedPl = useGameStore.getState().pl;
      expect(updatedPl.stats.totalHustles, `Hustle ${hustleId} did not increment totalHustles.`).toBeGreaterThan(initialTotalHustles);
      expect(updatedPl.stats.successfulHustles).toBeGreaterThan(0);

      // Verify event logged
      // Note: HUSTLE_COMPLETED events are now logged.
      const hasEvent = updatedPl.events.some(e => e.type === 'HUSTLE_COMPLETED' && e.metadata.hustleId === hustleId);
      expect(hasEvent).toBe(true);

      // Verify legacy score updated (or at least calculated)
      expect(updatedPl.legacyScore).toBeDefined();
    });
  });

  it('should unlock achievements and update legacy score', () => {
    const state = useGameStore.getState();

    // Reset achievements in state to ensure we're testing the unlock
    useGameStore.setState({
        achievements: useGameStore.getState().achievements.map(a => ({ ...a, isUnlocked: false }))
    });

    // EARN_1M achievement requires 1,000,000 lifetime earnings
    useGameStore.setState({
        pl: {
            ...useGameStore.getState().pl,
            stats: {
                totalHustles: 10,
                successfulHustles: 10,
                lifetimeEarnings: 1000000
            }
        }
    });

    // logEvent triggers checkAchievements
    useGameStore.getState().logEvent('HUSTLE_COMPLETED', {
        hustleId: 'r_scrap',
        success: true,
        profit: 1000000
    });

    const updatedPl = useGameStore.getState().pl;
    const currentAchievements = useGameStore.getState().achievements;

    const isUnlocked = currentAchievements.find(a => a.id === 'EARN_1M')?.isUnlocked;
    expect(isUnlocked, "EARN_1M should be marked as unlocked in store").toBe(true);

    const hasAchievementEvent = updatedPl.events.some(e =>
        e.type === 'SPECIAL_EVENT' &&
        e.metadata.type === 'ACHIEVEMENT_UNLOCKED' &&
        e.metadata.achievementId === 'EARN_1M'
    );

    expect(hasAchievementEvent, "Achievement unlock event should be present").toBe(true);
    expect(updatedPl.legacyScore, "Legacy score should be updated").toBeGreaterThan(0);
  });
});
