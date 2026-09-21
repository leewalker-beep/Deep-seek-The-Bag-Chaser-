import { describe, it, expect } from 'vitest';
import { executeHustleAction } from '../engine/hustleEngine';
import { HUSTLES } from '../config/hustles/base';
import type { PlayerStats } from '../types/game';

describe('Minigame Multiplier Mathematical Integrity Tests', () => {
  const mockPlayer: PlayerStats = {
    month: 12,
    currentTier: 'MOGUL',
    bag: 1000000000,
    clout: 10000,
    aura: 10000,
    mentalHealth: 100,
    heat: 0,
    hustleLevels: {},
    hustleBranchIds: {},
    hustlePlays: {},
    masteredHustles: [],
    tierBadges: [],
    flexAssets: {},
    dynamicPassives: {},
    activeChallenges: [],
    crushedRivals: [],
    conglomerateCEOs: {},
    conglomerateCandidates: [],
    artists: [],
    foundersBacked: [],
    rolodex: [],
    npcs: [],
    worldFeed: [],
    history: [],
    biography: [],
    recordedBioKeys: [],
    milestones: [],
    consequences: [],
    events: [],
    actionLog: [],
    financialDebts: [],
    marketLeaderTiers: [],
    seenFlexThresholds: [],
    specializationHistory: [],
    marketCycle: { realEstate: 'normal', vc: { tech: 'normal', biotech: 'normal', energy: 'normal' } }
  } as unknown as PlayerStats;

  it('preserves 0 as 0 for Film Studio when player gets 0 performance score', () => {
    const hustle = HUSTLES['film_studio'];
    const levelData = hustle.levels![0];

    const resultZero = executeHustleAction(
      'film_studio',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      0, // Zero multiplier
      true
    );

    expect(resultZero.yieldCash).toBe(0);

    const resultNormal = executeHustleAction(
      'film_studio',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      1.0, // Normal 1.0 multiplier
      true
    );

    expect(resultNormal.yieldCash).toBeGreaterThan(0);
  });

  it('preserves 0 as 0 for Festival clout/aura yield when minigame multiplier is 0', () => {
    const hustle = HUSTLES['festival'];
    const levelData = hustle.levels![0];

    const resultZero = executeHustleAction(
      'festival',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      0, // Zero multiplier
      true
    );

    expect(resultZero.yieldClout).toBe(0);
    expect(resultZero.yieldAura).toBe(0);
  });

  it('defaults undefined and null multipliers to 1.0 safely', () => {
    const hustle = HUSTLES['film_studio'];
    const levelData = hustle.levels![0];

    const resultUndefined = executeHustleAction(
      'film_studio',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      undefined as any,
      true
    );

    const resultDefault = executeHustleAction(
      'film_studio',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      1.0,
      true
    );

    expect(resultUndefined.yieldCash).toBe(resultDefault.yieldCash);

    const resultNull = executeHustleAction(
      'film_studio',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      null as any,
      true
    );

    expect(resultNull.yieldCash).toBe(resultDefault.yieldCash);
  });

  it('handles negative or invalid multiplier values safely without producing negative multiplier yields', () => {
    const hustle = HUSTLES['space_investment'];
    const levelData = hustle.levels![0];

    const resultNegative = executeHustleAction(
      'space_investment',
      mockPlayer,
      'NORMAL',
      levelData,
      1,
      -2.5, // Invalid negative multiplier
      true
    );

    expect(resultNegative.yieldCash).toBeGreaterThanOrEqual(0);
  });
});
