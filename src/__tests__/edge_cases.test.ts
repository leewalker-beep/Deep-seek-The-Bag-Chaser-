import { describe, it, expect, vi } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { getEnding } from '../config/endings';
import { getDominantStat } from '../utils/endingUtils';
import { useGameStore } from '../store/gameStore';

// Mock localStorage for Zustand persist
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('Edge Case Tests', () => {
  it('detects warning from 0 mental health and but not instant death', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const pl = getInitialStats(3);
    pl.mentalHealth = 0;

    const res = advanceMonth(pl, 'NORMAL');
    expect(res.shouldDie).toBe(false);
    expect(res.news.some(n => typeof n === 'object' && n.text.includes('MENTAL COLLAPSE IMMINENT'))).toBe(true);
  });

  it('detects death from 0 mental health AND 0 bag', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const pl = getInitialStats(3);
    pl.mentalHealth = 0;
    pl.bag = 0;

    const res = advanceMonth(pl, 'NORMAL');
    // After rent deduction and passive (which is 0), bag will be <= 0
    expect(res.shouldDie).toBe(true);
    expect(res.deathCause).toContain('Bag gone. Mind gone.');

    // Simulate saving ending
    const dominant = getDominantStat(res.newPl);
    const ending = getEnding(res.newPl.legacyPoints, dominant);
    expect(ending).toBeDefined();
    expect(ending.title).toBe('The Forgotten'); // Initial legacy is 0
  });

  it('handles presidential election loss correctly via store', () => {
    const store = useGameStore;

    // Setup state near election
    store.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'PRESIDENT',
        presidentMonth: 47, // month before election check
        approvalRating: 40, // failing
        clout: 30000,
        aura: 30000,
        bag: 5000000000,
      },
      ph: 'PLAYING',
    }));

    // Trigger month advancement that should result in election loss
    store.getState().advancePresidentialMonth();

    expect(store.getState().pl.presidentMonth).toBe(48);
    expect(store.getState().ph).toBe('POST_MORTEM');
    expect(store.getState().fatalCause).toContain('Election Lost');
  });

  it('verifies dailyChallenges exists in the state', () => {
    const state = useGameStore.getState();
    expect(state).toHaveProperty('dailyChallenges');
  });
});
