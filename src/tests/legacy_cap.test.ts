import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';
import { calculateHustleMath, getEffectiveHustleStats, getLegacyBonus } from '../engine/mathEngine';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { HUSTLE_REGISTRY } from '../engine/hustleEngine';

describe('Legacy Multiplier Capping Regression Test Suite', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame('dropout', 3, 'Dropout', 'dropout_default');
  });

  const getDeliYieldForLegacy = (legacyPoints: number) => {
    const state = useGameStore.getState();
    const pl = {
      ...state.pl,
      bag: 100000,
      currentTier: 'STREET' as const,
      clout: 500,
      aura: 500,
      hustleLevels: { unique_hustle_deli: 1 },
      hustleBranchIds: { unique_hustle_deli: 'l1' },
      legacyPoints
    };

    const hustle = HUSTLES.unique_hustle_deli;
    const levelData = hustle.branches!.l1;
    const market = MARKET_CONFIGS['NORMAL'];

    const baseMath = calculateHustleMath(
      hustle.id,
      levelData,
      1,
      market.expenseMultiplier,
      market.yieldMultiplier,
      market.heatMultiplier,
      1.0,
      true,
      pl.mentalShieldTurns,
      'NEUTRAL'
    );

    const effective = getEffectiveHustleStats(hustle.id, levelData, pl, 1, baseMath);
    return effective.yieldCash;
  };

  it('correctly maps scaling across target legacy levels with caps', () => {
    // 1. Below Cap (produces identical payouts to legacyBonus = legacyPoints * 0.001)
    const yieldAt0 = getDeliYieldForLegacy(0);
    const yieldAt100 = getDeliYieldForLegacy(100);
    const yieldAt500 = getDeliYieldForLegacy(500);
    const yieldAt1000 = getDeliYieldForLegacy(1000);
    const yieldAt1500 = getDeliYieldForLegacy(1500);

    // Verify progression is linear below 2,000 points
    expect(yieldAt100).toBeGreaterThan(yieldAt0);
    expect(yieldAt500).toBeGreaterThan(yieldAt100);
    expect(yieldAt1000).toBeGreaterThan(yieldAt500);
    expect(yieldAt1500).toBeGreaterThan(yieldAt1000);

    // 2. Beyond/At Cap (capped at legacyBonus = 2.0)
    const yieldAt2000 = getDeliYieldForLegacy(2000);
    const yieldAt5000 = getDeliYieldForLegacy(5000);
    const yieldAt50000 = getDeliYieldForLegacy(50000);
    const yieldAt200000 = getDeliYieldForLegacy(200000);

    // Yields above 2000 should be exactly identical to the yield at 2000
    expect(yieldAt5000).toBe(yieldAt2000);
    expect(yieldAt50000).toBe(yieldAt2000);
    expect(yieldAt200000).toBe(yieldAt2000);
  });

  it('shares identical behavior for getLegacyBonus across call sites', () => {
    expect(getLegacyBonus(0)).toBe(0);
    expect(getLegacyBonus(500)).toBe(0.5);
    expect(getLegacyBonus(1000)).toBe(1.0);
    expect(getLegacyBonus(2000)).toBe(2.0);
    expect(getLegacyBonus(5000)).toBe(2.0);
  });

  it('caps philanthropy legacy gain to a safe bound', () => {
    // Test a normal donation of $10M
    const normalState = { philanthropyDonation: 10_000_000 } as any;
    const normalRes = HUSTLE_REGISTRY.philanthropy_empire('philanthropy_empire', normalState, 'NORMAL', {} as any, 1, 1.0, false);
    // baseLegacyGain = 50. legacyGain = 50 + 50 = 100
    expect(normalRes.legacyGain).toBe(100);

    // Test a large donation of $1B
    const largeState = { philanthropyDonation: 1_000_000_000 } as any;
    const largeRes = HUSTLE_REGISTRY.philanthropy_empire('philanthropy_empire', largeState, 'NORMAL', {} as any, 1, 1.0, false);
    // baseLegacyGain is diminished to 401. legacyGain = 401 + 401 = 802.
    expect(largeRes.legacyGain).toBeLessThan(1000);
    expect(largeRes.legacyGain).toBe(802);

    // Test an extreme donation of $100B ($100,000,000,000)
    const extremeState = { philanthropyDonation: 100_000_000_000 } as any;
    const extremeRes = HUSTLE_REGISTRY.philanthropy_empire('philanthropy_empire', extremeState, 'NORMAL', {} as any, 1, 1.0, false);
    // baseLegacyGain is capped at 500. legacyGain = 500 + 500 = 1000.
    expect(extremeRes.legacyGain).toBeLessThanOrEqual(1000);
    expect(extremeRes.legacyGain).toBe(1000);
  });
});
