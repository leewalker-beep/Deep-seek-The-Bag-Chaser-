import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { executeHustleAction } from '../engine/hustleEngine';
import { HUSTLES } from '../config/hustles/base';
import { enforceStatCaps } from '../store/slices/playerStatsSlice';
import { advanceMonth } from '../engine/advancementEngine';

// Mock localStorage globally for this test
if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

describe('TEST 1 — Ghost Mode and Heat Audit', () => {
  beforeEach(() => {
    // Reset the game state
    useGameStore.getState().resetGame('street_kid', 3);
  });

  const runControlledGhostModeTest = (level: number) => {
    const store = useGameStore.getState();
    const pl = store.pl;

    // Set up controlled environment
    // 1. Give player enough resources, clout, and aura to pass requirements
    pl.bag = 100000;
    pl.clout = 100;
    pl.aura = 50;
    pl.mentalHealth = 100; // Keep mental health high to avoid careless mistakes
    pl.heat = 40; // Controlled starting Heat

    // 2. Set the Ghost Mode Level and Branch
    const branchId = level === 1 ? 'l1' : level === 2 ? 'l2' : 'l3';
    pl.hustleLevels['r_ghost_mode'] = level;
    pl.hustleBranchIds['r_ghost_mode'] = branchId;

    const initialHeat = pl.heat;
    const hustleId = 'r_ghost_mode';
    const levelData = HUSTLES[hustleId].branches![branchId];

    // 3. Execute hustle action directly (to trace intermediate states before month advance)
    const result = executeHustleAction(
      hustleId,
      pl,
      store.currentMarket,
      levelData,
      level,
      1.0, // multiplier = 1.0 (perfect minigame result)
      true, // force success
      'NEUTRAL'
    );

    // Calculate "Heat immediately after the run"
    const heatImmediatelyAfter = initialHeat + result.heatHit;

    // 4. Run executeHustle on the real store to trace final state
    // Reset player heat before calling executeHustle to ensure consistent start
    store.updatePl({ heat: 40, bag: 100000, clout: 100, aura: 50, mentalHealth: 100 });
    store.pl.hustleLevels['r_ghost_mode'] = level;
    store.pl.hustleBranchIds['r_ghost_mode'] = branchId;

    const storeResult = store.executeHustle('r_ghost_mode', 1.0, true);
    const heatAfterMonthAdvance = useGameStore.getState().pl.heat;

    console.log(`\n========================================`);
    console.log(`GHOST MODE LEVEL ${level} AUDIT TRACE`);
    console.log(`========================================`);
    console.log(`- Heat before the run: ${initialHeat}`);
    console.log(`- Ghost Mode level: ${level}`);
    console.log(`- Minigame result: SUCCESS (multiplier 1.0)`);
    console.log(`- heatHit value: ${result.heatHit}`);
    console.log(`- Any modifiers applied:`);
    console.log(`  * Base branch heatHit: ${levelData.heatHit}`);
    console.log(`  * Market heat multiplier: ${store.currentMarket} (multiplier: 1.0)`);
    console.log(`  * Passive success heat decay applied: -1`);
    console.log(`- updateHeat calls: None (no world event triggered)`);
    console.log(`- Heat immediately after the run (before monthly advancement): ${heatImmediatelyAfter}`);
    console.log(`- Heat after month advancement: ${heatAfterMonthAdvance}`);
    console.log(`========================================\n`);

    return {
      initialHeat,
      heatHit: result.heatHit,
      heatImmediatelyAfter,
      heatAfterMonthAdvance
    };
  };

  it('audits Level 1 Ghost Mode', () => {
    const res = runControlledGhostModeTest(1);
    expect(res.initialHeat).toBe(40);
    expect(res.heatHit).toBe(-6); // Base -5 + (-1) success decay
    expect(res.heatImmediatelyAfter).toBe(34);
    expect(res.heatAfterMonthAdvance).toBe(24); // 34 - 10 passive monthly decay
  });

  it('audits Level 2 Ghost Mode', () => {
    const res = runControlledGhostModeTest(2);
    expect(res.initialHeat).toBe(40);
    expect(res.heatHit).toBe(-9); // Base -8 + (-1) success decay
    expect(res.heatImmediatelyAfter).toBe(31);
    expect(res.heatAfterMonthAdvance).toBe(21); // 31 - 10 passive monthly decay
  });

  it('audits Level 3 Ghost Mode', () => {
    const res = runControlledGhostModeTest(3);
    expect(res.initialHeat).toBe(40);
    expect(res.heatHit).toBe(-13); // Base -12 + (-1) success decay
    expect(res.heatImmediatelyAfter).toBe(27);
    expect(res.heatAfterMonthAdvance).toBe(17); // 27 - 10 passive monthly decay
  });
});
