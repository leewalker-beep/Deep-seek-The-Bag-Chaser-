import { describe, it, expect } from 'vitest';
import { executeHustleAction } from '../engine/hustleEngine';
import { getInitialStats } from '../store/initialState';
import { HUSTLES } from '../config/hustles/base';

describe('Minigame Math Stress Test', () => {
  it('Verifies multiplier impact on rewards', () => {
    const pl = getInitialStats(3, 'street_kid');
    pl.currentTier = 'STREET';
    const levelData = HUSTLES.cc.branches!.l1;

    const resultLow = executeHustleAction('cc', pl, 'NORMAL', levelData, 1, 0.5, true);
    const resultMed = executeHustleAction('cc', pl, 'NORMAL', levelData, 1, 1.0, true);
    const resultHigh = executeHustleAction('cc', pl, 'NORMAL', levelData, 1, 2.0, true);

    console.log('CC Mult | Yield Cash | Yield Clout');
    console.log(`0.5 | ${resultLow.yieldCash} | ${resultLow.yieldClout}`);
    console.log(`1.0 | ${resultMed.yieldCash} | ${resultMed.yieldClout}`);
    console.log(`2.0 | ${resultHigh.yieldCash} | ${resultHigh.yieldClout}`);

    expect(resultHigh.yieldCash).toBeGreaterThan(resultMed.yieldCash);
    expect(resultMed.yieldCash).toBeGreaterThan(resultLow.yieldCash);
  });

  it('Checks for zero or negative rewards at low multipliers', () => {
    const pl = getInitialStats(3, 'street_kid');
    const levelData = HUSTLES.r_labor.branches!.l1;

    const resultZero = executeHustleAction('r_labor', pl, 'NORMAL', levelData, 1, 0, true);
    expect(resultZero.yieldCash).toBeGreaterThanOrEqual(0);
    expect(resultZero.yieldClout).toBeGreaterThanOrEqual(0);

    console.log('Labor Mult 0 Yield:', resultZero.yieldCash);
  });

  it('Stress tests high-tier scaling', () => {
     const pl = getInitialStats(3, 'street_kid');
     pl.currentTier = 'MOGUL';
     const levelData = HUSTLES.film_studio.levels![0];

     const result = executeHustleAction('film_studio', pl, 'NORMAL', levelData, 1, 4.0, true);
     console.log('Film Studio (Mogul) 4x Mult Yield:', result.yieldCash.toLocaleString());

     // Ensure no overflow
     expect(result.yieldCash).toBeLessThan(1000000000000); // Less than 1 Trillion per click
  });
});
