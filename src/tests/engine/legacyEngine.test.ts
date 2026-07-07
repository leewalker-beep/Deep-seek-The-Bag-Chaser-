import { describe, it, expect } from 'vitest';
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
    legacyPoints: 100, // Mid-run points
    stats: {
      lifetimeEarnings: 500000,
      successfulHustles: 20,
      totalHustles: 25
    }
  };

  it('calculates score correctly for MUD tier', () => {
    // profitPoints: 500,000 / 1000 = 500
    // hustlePoints: 25 * 2 = 50
    // achievementPoints: 2 * 75 = 150
    // endingPoints: 0
    // deathBadgePoints: 1 * 20 = 20
    // timePoints: 12 * 5 = 60
    // midRunPoints: 100
    // baseScore = 500 + 50 + 150 + 20 + 60 + 100 = 880
    // streakBonus = 5 * 50 = 250
    // multiplier = 1
    // Total = 1130

    const score = calculateLegacyScore(baseStats);
    expect(score).toBe(1130);
  });

  it('applies tier multipliers', () => {
    const eliteStats = { ...baseStats, currentTier: 'ELITE' as const };
    // multiplier = 4
    // (880 + 250) * 4 = 4520
    const score = calculateLegacyScore(eliteStats);
    expect(score).toBe(4520);
  });

  it('handles bracketed profit points', () => {
    const richStats = {
      ...baseStats,
      stats: { ...baseStats.stats!, lifetimeEarnings: 2000000 }
    };
    // profitPoints: 1000 + (2,000,000 - 1,000,000) / 10000 = 1000 + 100 = 1100
    // others: 50 + 150 + 20 + 60 + 100 = 380
    // baseScore = 1480
    // streakBonus = 250
    // Total = 1730
    const score = calculateLegacyScore(richStats);
    expect(score).toBe(1730);
  });

  it('handles extremely high profit points', () => {
    const ultraRichStats = {
      ...baseStats,
      stats: { ...baseStats.stats!, lifetimeEarnings: 150000000 }
    };
    // profitPoints: 1000 + 9900 + (150,000,000 - 100,000,000) / 1000000 = 10900 + 50 = 10950
    // others: 380
    // baseScore = 11330
    // streakBonus = 250
    // Total = 11580
    const score = calculateLegacyScore(ultraRichStats);
    expect(score).toBe(11580);
  });
});
