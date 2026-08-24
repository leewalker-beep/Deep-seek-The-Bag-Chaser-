import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS } from '../config/tiers';
import { getMasteryCount } from '../utils/masteryUtils';

describe('Crown Tier Advancement Requirements', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    // Set tutorial skipped so tutorial auto-advance does not trigger
    useGameStore.setState({ isTutorialSkipped: true });
  });

  it('0/3 Crowns cannot leave MUD', () => {
    const store = useGameStore.getState();
    const req = TIER_REQUIREMENTS['STREET'];

    // Provide full cash, clout, and aura for STREET tier
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        bag: req.cash + 10000,
        clout: req.clout + 50,
        aura: req.aura + 50,
        masteredHustles: [],
        hustlePlays: {},
        hustleLevels: {},
      },
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(0);

    const advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(false);
    expect(useGameStore.getState().pl.currentTier).toBe('MUD');
    expect(useGameStore.getState().news[0]).toContain('3 Crowns (0/3, need 3 more)');
  });

  it('2/3 Crowns cannot leave MUD', () => {
    const req = TIER_REQUIREMENTS['STREET'];

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        bag: req.cash + 10000,
        clout: req.clout + 50,
        aura: req.aura + 50,
        masteredHustles: ['r_labor', 'r_delivery'],
        hustlePlays: { r_labor: 10, r_delivery: 10 },
        hustleLevels: { r_labor: 2, r_delivery: 2 },
      },
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(2);

    const advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(false);
    expect(useGameStore.getState().pl.currentTier).toBe('MUD');
    expect(useGameStore.getState().news[0]).toContain('3 Crowns (2/3, need 1 more)');
  });

  it('3/3 Crowns can advance from MUD', () => {
    const req = TIER_REQUIREMENTS['STREET'];

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        bag: req.cash + 10000,
        clout: req.clout + 50,
        aura: req.aura + 50,
        masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'],
        hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15 },
        hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1 },
      },
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);

    const advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(true);
    expect(useGameStore.getState().pendingSpecialization).toBe(true);
  });

  it('4/5 Crowns cannot advance from STARTUP', () => {
    const req = TIER_REQUIREMENTS['CORPORATE'];

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'STARTUP',
        bag: req.cash + 100000,
        clout: req.clout + 100,
        aura: req.aura + 100,
        masteredHustles: ['saas_mvp', 'ecom_brand', 'meme', 'audio'],
        hustlePlays: { saas_mvp: 6, ecom_brand: 8, meme: 10, audio: 8 },
        hustleLevels: { saas_mvp: 2, ecom_brand: 2, meme: 1, audio: 1 },
      },
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(4);

    const advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(false);
    expect(useGameStore.getState().pl.currentTier).toBe('STARTUP');
    expect(useGameStore.getState().news[0]).toContain('5 Crowns (4/5, need 1 more)');
  });

  it('5/5 Crowns can advance from STARTUP', () => {
    const req = TIER_REQUIREMENTS['CORPORATE'];

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'STARTUP',
        bag: req.cash + 100000,
        clout: req.clout + 100,
        aura: req.aura + 100,
        masteredHustles: ['saas_mvp', 'ecom_brand', 'meme', 'audio', 'agency_scale'],
        hustlePlays: { saas_mvp: 6, ecom_brand: 8, meme: 10, audio: 8, agency_scale: 6 },
        hustleLevels: { saas_mvp: 2, ecom_brand: 2, meme: 1, audio: 1, agency_scale: 2 },
      },
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(5);

    const advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(true);
    expect(useGameStore.getState().pendingSpecialization).toBe(true);
  });

  it('Crown earned at different hustle levels counts identically', () => {
    // Level 1 Crown (r_plasma, no level req) vs Level 2 Crown (r_labor) vs Level 5 Crown (street_eats)
    const pl = {
      ...useGameStore.getState().pl,
      masteredHustles: [],
      hustlePlays: { r_plasma: 15, r_labor: 10, street_eats: 10 },
      hustleLevels: { r_plasma: 1, r_labor: 2, street_eats: 5 },
    };

    expect(getMasteryCount(pl)).toBe(3);
  });

  it('existing advancement requirements still work alongside Crowns', () => {
    const req = TIER_REQUIREMENTS['STREET'];

    // Meets 3 Crowns, but lacks cash
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        bag: req.cash - 1000,
        clout: req.clout + 50,
        aura: req.aura + 50,
        masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'],
        hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15 },
        hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1 },
      },
    }));

    let advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(false);

    // Meets cash and Crowns, but lacks clout
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: req.cash + 10000,
        clout: req.clout - 10,
      },
    }));

    advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(false);

    // Meets cash, Crowns, clout, but lacks aura
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        clout: req.clout + 10,
        aura: req.aura - 10,
      },
    }));

    advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(false);

    // Meets all 4 requirements -> advances
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        aura: req.aura + 10,
      },
    }));

    advanceResult = useGameStore.getState().advanceTier();
    expect(advanceResult).toBe(true);
  });

  it('no duplicate Crown increments', () => {
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        masteredHustles: ['r_labor', 'r_labor', 'r_labor'], // duplicate array entries
        hustlePlays: { r_labor: 100 },
        hustleLevels: { r_labor: 2 },
      },
    }));

    // Should count unique mastered hustles from HUSTLES
    expect(getMasteryCount(useGameStore.getState().pl)).toBe(1);

    // Running checkMilestones multiple times does not duplicate crowns
    useGameStore.getState().checkMilestones();
    useGameStore.getState().checkMilestones();
    expect(getMasteryCount(useGameStore.getState().pl)).toBe(1);
  });
});
