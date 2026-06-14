import { describe, it, expect, vi } from 'vitest';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import type { PlayerStats } from '../../types/game';

describe('legacyEngine', () => {
  const baseStats: PlayerStats = {
    bag: 1000,
    clout: 100,
    aura: 100,
    mentalHealth: 100,
    heat: 0,
    month: 12,
    currentTier: 'MUD',
    hustleLevels: {},
    hustleBranchIds: {},
    masteredHustles: [],
    flexAssets: {},
    unlockedAchievements: ['ACH1', 'ACH2'],
    rentalCount: 0,
    flipCount: 0,
    vendingCount: 0,
    passiveLaborYield: 0,
    mentalShieldTurns: 0,
    artists: [],
    grammyCount: 0,
    recordLabelLevel: 1,
    realEstateType: 'residential',
    realEstateLeverage: 0,
    realEstateStrategy: 'hold',
    vcStage: 'seed',
    vcSector: 'tech',
    vcInvestment: 0,
    marketCycle: { realEstate: 'normal', vc: {} },
    monthsSinceCycleChange: 0,
    dynamicPassives: {},
    rivals: [],
    actionLog: [],
    milestones: [],
    events: [],
    collectedDeathBadges: ['BADGE1'],
    completedDailyChallengesCount: 0,
    loginStreak: 5,
    stats: {
      lifetimeEarnings: 500000,
      successfulHustles: 20,
      totalHustles: 25
    }
  };

  it('calculates score correctly for MUD tier', () => {
    // profitPoints: 500,000
    // hustlePoints: 25 * 10 = 250 (total hustles)
    // achievementPoints: 2 * 100 = 200
    // endingPoints: 0 (no window/localStorage in test)
    // deathBadgePoints: 1 * 50 = 50
    // timePoints: 12 * 10 = 120
    // baseScore = 500,000 + 250 + 200 + 50 + 120 = 500,620
    // streakBonus = 5 * 100 = 500
    // multiplier = 1
    // Total = 501,120

    const score = calculateLegacyScore(baseStats);
    expect(score).toBe(501120);
  });

  it('applies tier multipliers', () => {
    const eliteStats = { ...baseStats, currentTier: 'ELITE' as const };
    // multiplier = 5
    // (500,620 + 500) * 5 = 2,505,600
    const score = calculateLegacyScore(eliteStats);
    expect(score).toBe(2505600);
  });

  it('caps profit points at 1M', () => {
    const richStats = {
      ...baseStats,
      stats: { ...baseStats.stats!, lifetimeEarnings: 2000000 }
    };
    // profitPoints: 1,000,000 (capped)
    // others: 250 + 200 + 50 + 120 = 620
    // baseScore = 1,000,620
    // streakBonus = 500
    // Total = 1,001,120
    const score = calculateLegacyScore(richStats);
    expect(score).toBe(1001120);
  });
});
