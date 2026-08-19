import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Heat Recovery Safety Shield', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('A. Rest with low Heat: Heat decreases or remains unchanged, never increases', () => {
    const store = useGameStore.getState();
    store.pl.heat = 20;
    store.pl.mentalHealth = 50;

    const heatBefore = store.pl.heat;
    store.executeHustleWithTimelineTick('r_sleep', 'l1');
    const finalHeat = useGameStore.getState().pl.heat;

    expect(finalHeat).toBeLessThanOrEqual(heatBefore);
  });

  it('B. Rest with simulated rival/narrative Heat increase: Final Heat cannot exceed Heat before Rest', () => {
    const store = useGameStore.getState();
    store.pl.heat = 50;
    store.pl.mentalHealth = 50;
    const heatBefore = store.pl.heat;

    // Simulate an active rival that triggers a +20 Heat hit during monthly simulation
    store.pl.rivals = [
      {
        id: 'rival_heat_threat',
        name: 'Aggressive Rival',
        tier: 'MUD',
        netWorth: 1000000,
        currentBid: 0,
        vengeance: 5,
        relationshipWithPlayer: -80,
      }
    ];

    store.executeHustleWithTimelineTick('r_sleep', 'l1');
    const finalHeat = useGameStore.getState().pl.heat;

    expect(finalHeat).toBeLessThanOrEqual(heatBefore);
  });

  it('C. Ghost Mode with normal conditions: Preserves calculated Ghost Mode reduction', () => {
    const store = useGameStore.getState();
    store.pl.heat = 60;
    store.pl.bag = 10000;
    const heatBefore = store.pl.heat;

    const res = store.executeHustle('r_ghost_mode', 1.0, true);
    const finalHeat = useGameStore.getState().pl.heat;

    expect(res.success).toBe(true);
    expect(finalHeat).toBeLessThan(heatBefore);
  });

  it('D. Ghost Mode with simulated monthly/rival Heat increase: Final Heat cannot exceed Heat before Ghost Mode', () => {
    const store = useGameStore.getState();
    store.pl.heat = 40;
    store.pl.bag = 10000;
    const heatBefore = store.pl.heat;

    // Set up a rival with high vengeance that attempts to add Heat
    store.pl.rivals = [
      {
        id: 'rival_heat_threat_2',
        name: 'Scandal Rival',
        tier: 'MUD',
        netWorth: 5000000,
        currentBid: 0,
        vengeance: 10,
        relationshipWithPlayer: -100,
      }
    ];

    store.executeHustle('r_ghost_mode', 1.0, true);
    const finalHeat = useGameStore.getState().pl.heat;

    expect(finalHeat).toBeLessThanOrEqual(heatBefore);
  });

  it('E. Normal Heat-attracting hustle: Existing Heat increase occurs normally (shield is NOT global)', () => {
    const store = useGameStore.getState();
    store.pl.heat = 10;
    store.pl.currentTier = 'CORPORATE';
    store.pl.bag = 5000000;
    store.pl.clout = 1000;
    store.pl.aura = 1000;

    const heatBefore = store.pl.heat;
    // Lobbying increases heat (e.g. 10 * 2 = 20 heatHit)
    const res = store.executeHustle('lobbying', 2.0, true);
    expect(res.success).toBe(true);
    const finalHeat = useGameStore.getState().pl.heat;

    expect(finalHeat).toBeGreaterThan(heatBefore);
  });

  it('F. Incarceration safety: Rest or Ghost Mode near danger threshold does not cause incarceration from a Heat increase', () => {
    const store = useGameStore.getState();
    store.pl.heat = 95;
    store.pl.bag = 10000;

    // Add liquidity crunch ($0 bag) or rival threat that would normally add +10 Heat
    store.pl.bag = 0; // Trigger liquidity crunch (+5 Heat) during month tick

    const heatBefore = 95;
    store.executeHustleWithTimelineTick('r_sleep', 'l1');

    const finalState = useGameStore.getState().pl;
    expect(finalState.heat).toBeLessThanOrEqual(heatBefore);
    expect(finalState.inJail).toBe(false);
  });
});
