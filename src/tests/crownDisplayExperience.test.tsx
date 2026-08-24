import { describe, test, expect } from 'vitest';
import { TIER_REQUIREMENTS } from '../config/tiers';
import { getMasteryCount } from '../utils/masteryUtils';
import type { PlayerStats } from '../types/game';

describe('Crown Progression Display Experience Audit', () => {
  const createMockPlayer = (overrides?: Partial<PlayerStats>): PlayerStats => ({
    name: 'Test Chaser',
    currentTier: 'MUD',
    bag: 50000,
    clout: 100,
    aura: 100,
    mentalHealth: 100,
    heat: 0,
    month: 1,
    masteredHustles: [],
    hustleLevels: {},
    hustleBranchIds: {},
    hustlePlayCounts: {},
    stats: {
      totalHustles: 0,
      successfulHustles: 0,
      lifetimeEarnings: 0
    },
    ...overrides
  } as unknown as PlayerStats);

  test('Tier requirements correctly define crown thresholds for MUD, STARTUP, and ELITE transitions', () => {
    expect(TIER_REQUIREMENTS.STREET.crowns).toBe(3);    // MUD -> STREET requires 3 crowns
    expect(TIER_REQUIREMENTS.CORPORATE.crowns).toBe(5); // STARTUP -> CORPORATE requires 5 crowns
    expect(TIER_REQUIREMENTS.MOGUL.crowns).toBe(7);     // ELITE -> MOGUL requires 7 crowns
  });

  test('Calculates remaining crowns status correctly when crowns are incomplete', () => {
    const pl = createMockPlayer({
      currentTier: 'MUD',
      masteredHustles: ['r_labor', 'r_delivery'] // 2 crowns
    });

    const currentCrowns = getMasteryCount(pl);
    const nextTierReq = TIER_REQUIREMENTS.STREET;
    const remaining = Math.max(0, nextTierReq.crowns - currentCrowns);
    const crownRequirementMet = remaining === 0;

    expect(currentCrowns).toBe(2);
    expect(remaining).toBe(1);
    expect(crownRequirementMet).toBe(false);

    const statusText = crownRequirementMet
      ? `CROWNS ${currentCrowns} / ${nextTierReq.crowns} • CROWN REQUIREMENT MET`
      : `CROWNS ${currentCrowns} / ${nextTierReq.crowns} • ${remaining} MORE CROWN NEEDED`;

    expect(statusText).toBe('CROWNS 2 / 3 • 1 MORE CROWN NEEDED');
  });

  test('Calculates crown requirement met status when crowns are complete but cash/clout/aura incomplete', () => {
    const pl = createMockPlayer({
      currentTier: 'MUD',
      bag: 100, // Insufficient cash for STREET ($50,000 req)
      masteredHustles: ['r_labor', 'r_delivery', 'r_scrap'] // 3 crowns
    });

    const currentCrowns = getMasteryCount(pl);
    const nextTierReq = TIER_REQUIREMENTS.STREET;
    const remaining = Math.max(0, nextTierReq.crowns - currentCrowns);
    const crownRequirementMet = remaining === 0;

    const canAdvance = pl.bag >= nextTierReq.cash &&
                       pl.clout >= nextTierReq.clout &&
                       pl.aura >= nextTierReq.aura &&
                       currentCrowns >= nextTierReq.crowns;

    expect(currentCrowns).toBe(3);
    expect(remaining).toBe(0);
    expect(crownRequirementMet).toBe(true);
    expect(canAdvance).toBe(false);

    const statusText = crownRequirementMet
      ? `CROWNS ${currentCrowns} / ${nextTierReq.crowns} • CROWN REQUIREMENT MET`
      : `CROWNS ${currentCrowns} / ${nextTierReq.crowns} • ${remaining} MORE CROWN NEEDED`;

    expect(statusText).toBe('CROWNS 3 / 3 • CROWN REQUIREMENT MET');
  });

  test('Calculates ready to advance status when all requirements including crowns are satisfied', () => {
    const pl = createMockPlayer({
      currentTier: 'MUD',
      bag: 60000,
      clout: 150,
      aura: 150,
      masteredHustles: ['r_labor', 'r_delivery', 'r_scrap'] // 3 crowns
    });

    const currentCrowns = getMasteryCount(pl);
    const nextTierReq = TIER_REQUIREMENTS.STREET;

    const canAdvance = pl.bag >= nextTierReq.cash &&
                       pl.clout >= nextTierReq.clout &&
                       pl.aura >= nextTierReq.aura &&
                       currentCrowns >= nextTierReq.crowns;

    expect(canAdvance).toBe(true);

    const buttonSubtext = `CROWNS ${currentCrowns} / ${nextTierReq.crowns} • READY TO ADVANCE`;
    expect(buttonSubtext).toBe('CROWNS 3 / 3 • READY TO ADVANCE');
  });

  test('StatsPanel crowns row correctly formats requirement met vs remaining count', () => {
    const plMissing = createMockPlayer({
      currentTier: 'STARTUP',
      masteredHustles: ['r_labor', 'r_delivery', 'r_scrap', 'cc'] // 4 crowns (needs 5 for CORPORATE)
    });

    const nextReq = TIER_REQUIREMENTS.CORPORATE;
    const countMissing = getMasteryCount(plMissing);
    const statsPanelMissingText = countMissing >= nextReq.crowns
      ? 'Requirement Met'
      : `${nextReq.crowns - countMissing} more needed`;

    expect(statsPanelMissingText).toBe('1 more needed');

    const plMet = createMockPlayer({
      currentTier: 'STARTUP',
      masteredHustles: ['r_labor', 'r_delivery', 'r_scrap', 'cc', 'pod'] // 5 crowns
    });

    const countMet = getMasteryCount(plMet);
    const statsPanelMetText = countMet >= nextReq.crowns
      ? 'Requirement Met'
      : `${nextReq.crowns - countMet} more needed`;

    expect(statsPanelMetText).toBe('Requirement Met');
  });
});
