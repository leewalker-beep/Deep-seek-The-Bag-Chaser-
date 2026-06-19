
import { describe, it, expect } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { PlayerStats } from '../types/game';

describe('Passive Income Recession Suppression', () => {
  const basePl: Partial<PlayerStats> = {
    bag: 1000000,
    clout: 1000,
    aura: 1000,
    currentTier: 'STARTUP',
    hustleLevels: {},
    hustleBranchIds: {},
    flexAssets: {},
    dynamicPassives: { 'test': 100000 }, // $100k passive
    legacyPoints: 0,
    rentPortfolioCount: 0,
    vendingCount: 0,
    rentalCount: 0,
    artists: [],
    marketCycle: { realEstate: 'normal', vc: { tech: 'normal', biotech: 'normal', energy: 'normal' } },
    monthsSinceCycleChange: 0,
    heat: 0,
    activeChallenges: [],
    rivals: [],
    rivalThreats: {},
    mentalShieldTurns: 0,
    month: 0,
    mentalHealth: 100
  };

  it('should have lower passive income in Recession than in Normal market', () => {
    const normalResult = advanceMonth(basePl as PlayerStats, 'NORMAL');
    const recessionResult = advanceMonth(basePl as PlayerStats, 'RECESSION');

    const normalPassive = normalResult.newPl.bag - basePl.bag! + 5000; // + rent ($5000 for STARTUP)
    const recessionPassive = recessionResult.newPl.bag - basePl.bag! + 7500; // + rent ($5000 * 1.5)

    console.log(`Normal Passive: ${normalPassive}, Recession Passive: ${recessionPassive}`);
    expect(recessionPassive).toBe(normalPassive * 0.5);
    expect(recessionPassive).toBeLessThan(normalPassive);
  });
});
