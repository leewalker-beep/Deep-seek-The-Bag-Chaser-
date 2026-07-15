import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getMasteryCount } from '../utils/masteryUtils';
import { getElectionTitle } from '../config/electionTitles';
import { HUSTLES } from '../config/hustles/base';

// Mock localStorage globally for this test
if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

describe('Mastery to Election Impact', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('street_kid', 3);
  });

  it('calculates mastery count and election titles correctly', () => {
    expect(getElectionTitle(0)).toBe('The Specialist');
    expect(getElectionTitle(5)).toBe('The Coalition Builder');
    expect(getElectionTitle(10)).toBe('The Polymath');
    expect(getElectionTitle(20)).toBe('The Unstoppable');
  });

  it('applies mastery bonus during campaign trail', () => {
    const hustleLevels: Record<string, number> = {};
    const hustlePlays: Record<string, number> = {};

    const masteredHustleIds = Object.keys(HUSTLES).filter(id => !!HUSTLES[id].levels).slice(0, 10);
    masteredHustleIds.forEach(id => {
      hustleLevels[id] = HUSTLES[id].levels!.length;
      hustlePlays[id] = 20;
    });

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'PRESIDENT',
        approvalRating: 50,
        hustleLevels,
        hustlePlays,
        hustleBranchIds: { 'president_campaign': 'l1' },
        clout: 1000000,
        aura: 1000000,
        bag: 1000000000,
      }
    }));

    expect(getMasteryCount(useGameStore.getState().pl)).toBe(10);

    useGameStore.getState().executeHustle('president_campaign', 1, true);

    expect(useGameStore.getState().pl.approvalRating).toBeGreaterThanOrEqual(65);
  });

  it('updates approval immediately when a new badge is earned during campaign', () => {
    // control base: avoid all auto-mastery
    const allHustleIds = Object.keys(HUSTLES);

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'PRESIDENT',
        approvalRating: 50,
        masteredHustles: allHustleIds, // pretend EVERYTHING is already mastered
        hustleLevels: {},
        hustleBranchIds: {},
        demographicApproval: { 'Economy': 50 }
      }
    }));

    // Now remove one from masteredHustles and set it to max level
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        masteredHustles: allHustleIds.filter(id => id !== 'r_scrap'),
        hustleLevels: { 'r_scrap': 4 },
        hustleBranchIds: { 'r_scrap': 'l4' },
        hustlePlays: { 'r_scrap': 20 }
      }
    }));

    useGameStore.getState().checkMilestones();

    const newPl = useGameStore.getState().pl;
    expect(newPl.masteredHustles).toContain('r_scrap');
    expect(newPl.approvalRating).toBeGreaterThan(50);
  });
});
