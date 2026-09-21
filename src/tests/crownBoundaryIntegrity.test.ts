import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getMasteryCount } from '../utils/masteryUtils';
import { TIER_REQUIREMENTS } from '../config/tiers';

describe('Crown Integrity and Boundary Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
    useGameStore.setState({ isTutorialSkipped: true });
  });

  const ALL_CROWN_HUSTLES = [
    'r_labor', 'r_delivery', 'r_plasma', 'r_vending', 'r_ghost_mode',
    'r_scrap', 'street_eats', 'cleaning', 'cc', 'pod',
    'techFlip', 'sw', 'drop', 'saas_mvp', 'ecom_brand'
  ];

  it('guarantees 1 Crown maximum per mastered hustle regardless of duplicate array entries', () => {
    const pl = {
      ...useGameStore.getState().pl,
      masteredHustles: ['r_labor', 'r_labor', 'r_labor', 'r_delivery']
    };

    expect(getMasteryCount(pl)).toBe(2);
  });

  it('does not inflate Crown count when replaying or upgrading a mastered hustle', () => {
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        bag: 100000,
        masteredHustles: ['r_labor']
      }
    }));

    const initialCount = getMasteryCount(useGameStore.getState().pl);
    expect(initialCount).toBe(1);

    // Execute labor again
    useGameStore.getState().executeHustle('r_labor');
    useGameStore.getState().checkMilestones();

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(1);
  });

  it('ensures Crowns remain permanent and are not spent upon tier advancement', () => {
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        bag: 500000,
        clout: 1000,
        aura: 1000,
        masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'] // 3 crowns
      }
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);

    // Advance to STREET
    useGameStore.getState().advanceTier();
    useGameStore.getState().selectSpecialization('influencer');

    expect(useGameStore.getState().pl.currentTier).toBe('STREET');
    // Crowns must remain 3!
    expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);
  });

  it('ensures save/load or JSON serialization does not inflate Crown count', () => {
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        masteredHustles: ['r_labor', 'r_delivery', 'r_plasma', 'r_vending', 'r_ghost_mode']
      }
    }));

    const originalCount = getMasteryCount(useGameStore.getState().pl);
    expect(originalCount).toBe(5);

    const serialized = JSON.stringify(useGameStore.getState().pl);
    const restoredPl = JSON.parse(serialized);

    expect(getMasteryCount(restoredPl)).toBe(5);
  });

  it('does not count special badges like the_phoenix in getMasteryCount()', () => {
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        masteredHustles: ['the_phoenix', 'r_labor']
      }
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(1);
  });

  describe('Crown Boundary Requirements (3, 5, 7, 9, 11, 13, 15)', () => {
    const boundaryRequirements = [
      { tier: 'MUD', nextTier: 'STREET', crowns: 3 },
      { tier: 'STREET', nextTier: 'STARTUP', crowns: 5 },
      { tier: 'STARTUP', nextTier: 'CORPORATE', crowns: 7 },
      { tier: 'CORPORATE', nextTier: 'ELITE', crowns: 9 },
      { tier: 'ELITE', nextTier: 'MOGUL', crowns: 11 },
      { tier: 'MOGUL', nextTier: 'PRESIDENT', crowns: 13 },
      { tier: 'PRESIDENT', nextTier: 'OPEN', crowns: 15 },
    ];

    boundaryRequirements.forEach(({ tier, nextTier, crowns }) => {
      it(`enforces exact crown boundary ${crowns} for ${tier} -> ${nextTier}`, () => {
        const req = TIER_REQUIREMENTS[nextTier as keyof typeof TIER_REQUIREMENTS];
        expect(req.crowns).toBe(crowns);

        // Sub-test A: crowns - 1 fails
        const plBelow = {
          ...useGameStore.getState().pl,
          currentTier: tier as any,
          bag: Math.max(100000000000, req.fee + 1000000000),
          clout: Math.max(100000, req.clout + 1000),
          aura: Math.max(100000, req.aura + 1000),
          masteredHustles: ALL_CROWN_HUSTLES.slice(0, crowns - 1)
        };
        useGameStore.setState({ pl: plBelow });

        expect(getMasteryCount(useGameStore.getState().pl)).toBe(crowns - 1);
        expect(useGameStore.getState().advanceTier()).toBe(false);

        // Sub-test B: exact crowns passes
        const plExact = {
          ...useGameStore.getState().pl,
          currentTier: tier as any,
          bag: Math.max(100000000000, req.fee + 1000000000),
          clout: Math.max(100000, req.clout + 1000),
          aura: Math.max(100000, req.aura + 1000),
          masteredHustles: ALL_CROWN_HUSTLES.slice(0, crowns)
        };
        useGameStore.setState({ pl: plExact });

        expect(getMasteryCount(useGameStore.getState().pl)).toBe(crowns);
        expect(useGameStore.getState().advanceTier()).toBe(true);
      });
    });
  });
});
