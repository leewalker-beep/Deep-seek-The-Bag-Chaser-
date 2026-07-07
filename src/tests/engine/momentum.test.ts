import { describe, it, expect } from 'vitest';
import { calculateLegacyScore } from '../../engine/legacyEngine';
import type { PlayerStats } from '../../types/game';

describe('Legacy Momentum', () => {
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
    unlockedAchievements: [],
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
    collectedDeathBadges: [],
    completedDailyChallengesCount: 0,
    totalChallengesCompleted: 0,
    loginStreak: 0,
    stats: {
      lifetimeEarnings: 100000,
      successfulHustles: 10,
      totalHustles: 10
    }
  };

  it('calculates score with 0 momentum boost', () => {
    // profitPoints: 100,000 / 1000 = 100
    // hustlePoints: 10 * 2 = 20
    // timePoints: 12 * 5 = 60
    // baseScore = 180
    // streakBonus = 0
    // multiplier = 1
    // momentumBoost = 0
    // Total = 180
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 5 });
    expect(score).toBe(180);
  });

  it('applies 0.1% boost for 10 challenges', () => {
    // baseScore = 180
    // momentumBoost = 10 / 10 * 0.001 = 0.001
    // Total = 180 * 1.001 = 180.18 -> 180
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 10 });
    expect(score).toBe(180);
  });

  it('applies 0.2% boost for 20 challenges', () => {
    // baseScore = 180
    // momentumBoost = 20 / 10 * 0.001 = 0.002
    // Total = 180 * 1.002 = 180.36 -> 180
    const score = calculateLegacyScore({ ...baseStats, totalChallengesCompleted: 20 });
    expect(score).toBe(180);
  });

  it('applies visible boost with higher base score', () => {
    const highStats = {
        ...baseStats,
        stats: { ...baseStats.stats!, lifetimeEarnings: 10000000 }, // 1000 + 900 = 1900 pts
        totalChallengesCompleted: 1000 // 10% boost
    };
    // profit: 1900
    // hustle: 20
    // time: 60
    // base: 1980
    // boost: 1000/10 * 0.001 = 0.1
    // Total: 1980 * 1.1 = 2178
    const score = calculateLegacyScore(highStats);
    expect(score).toBe(2178);
  });
});
