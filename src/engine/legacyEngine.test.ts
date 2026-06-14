import { describe, it, expect, vi } from 'vitest';
import { calculateLegacyScore } from './legacyEngine';
import type { PlayerStats } from '../types/game';

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
    // hustlePoints: 20 * 10 = 200
    // achievementPoints: 2 * 100 = 200
    // endingPoints: 0 (no window/localStorage in test)
    // deathBadgePoints: 1 * 50 = 50
    // timePoints: 12 * 10 = 120
    // baseScore = 500,000 + 200 + 200 + 50 + 120 = 500,570
    // streakBonus = 5 * 100 = 500
    // multiplier = 1
    // Total = 501,070

    const score = calculateLegacyScore(baseStats);
    expect(score).toBe(501070);
  });

  it('applies tier multipliers', () => {
    const eliteStats = { ...baseStats, currentTier: 'ELITE' as const };
    // multiplier = 5
    // (500,570 + 500) * 5 = 2,505,350
    const score = calculateLegacyScore(eliteStats);
    expect(score).toBe(2505350);
  });

  it('caps profit points at 1M', () => {
    const richStats = {
      ...baseStats,
      stats: { ...baseStats.stats!, lifetimeEarnings: 2000000 }
    };
    // profitPoints: 1,000,000 (capped)
    // others: 200 + 200 + 50 + 120 = 570
    // baseScore = 1,000,570
    // streakBonus = 500
    // Total = 1,001,070
    const score = calculateLegacyScore(richStats);
    expect(score).toBe(1001070);
  });
});
