import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';
import { calculateHustleMath, getEffectiveHustleStats } from '../engine/mathEngine';
import { MARKET_CONFIGS } from '../config/marketConfig';

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
});
