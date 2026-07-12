import { describe, it, expect, vi } from 'vitest';

// Mock localStorage for Zustand persist
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

import { enforceStatCaps } from '../engine/statEngine';
import { getInitialStats } from '../store/initialState';
import { useGameStore } from '../store/gameStore';
import { getEnding } from '../config/endings';
import { getDominantStat } from '../utils/endingUtils';

describe('Regression Tests', () => {
  it('asserts enforceStatCaps correctly limits stats in OPEN tier', () => {
    const pl = getInitialStats(3);
    pl.currentTier = 'OPEN';
    pl.clout = 2000000; // Over cap
    pl.aura = 2000000;  // Over cap

    const capped = enforceStatCaps(pl);
    expect(capped.clout).toBe(999999);
    expect(capped.aura).toBe(999999);
    // Note: Due to "emergency recovery" in statEngine.ts,
    // if pl.aura > 10000, it's set to maxAura before excess calculation.
    // So excessAura = 0.
    // Overflow bonus: (1,000,001 excessClout + 0 excessAura) * 0.1 = 100,000
    expect(capped.bag).toBe(pl.bag + 100000);
  });

  it('verifies dailyChallenges exists in the state', () => {
    const state = useGameStore.getState();
    expect(state).toHaveProperty('dailyChallenges');
  });

  it('ensures ending system consistently returns correct title', () => {
    // Forgotten Clout: Legacy < 2500, Clout dominant
    const pl = getInitialStats(3);
    pl.legacyPoints = 500;
    pl.clout = 1000;
    pl.aura = 100;
    pl.heat = 50;

    const dominant = getDominantStat(pl);
    expect(dominant).toBe('clout');

    const ending = getEnding(pl.legacyPoints, dominant);
    expect(ending.title).toBe('The Forgotten');
    expect(ending.id).toBe('forgotten_clout');

    // The Kingmaker: Legacy 5000, Clout dominant
    pl.legacyPoints = 5000;
    const ending2 = getEnding(pl.legacyPoints, dominant);
    expect(ending2.title).toBe('The Kingmaker');

    // Balanced check
    pl.clout = 1000;
    pl.aura = 950;
    pl.heat = 900;
    const dominantB = getDominantStat(pl);
    expect(dominantB).toBe('balanced');
    const endingB = getEnding(pl.legacyPoints, dominantB);
    expect(endingB.title).toBe('The Mayor');
  });

  it('scouts artist and assigns correct tier avatar and status', () => {
    // Mock Math.random to always succeed (value < successRate)
    const originalRandom = Math.random;
    Math.random = vi.fn().mockReturnValue(0.01);

    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 1000000,
        artists: [],
      }
    }));

    const store = useGameStore.getState();

    try {
      // Scout local
      const localResult = store.scoutArtist('local');
      expect(localResult.success).toBe(true);
      expect(localResult.artist).toBeDefined();
      if (localResult.artist) {
        expect(['🎤', '🧢', '🎧', '🎸']).toContain(localResult.artist.avatar);
        expect(localResult.artist.status).toBe('IN STUDIO');
      }

      // Scout regional
      const regionalResult = store.scoutArtist('regional');
      expect(regionalResult.success).toBe(true);
      expect(regionalResult.artist).toBeDefined();
      if (regionalResult.artist) {
        expect(['🥷', '🕶️', '🔥', '🕷️', '🦊']).toContain(regionalResult.artist.avatar);
        expect(regionalResult.artist.status).toBe('IN STUDIO');
      }

      // Scout global
      const globalResult = store.scoutArtist('global');
      expect(globalResult.success).toBe(true);
      expect(globalResult.artist).toBeDefined();
      if (globalResult.artist) {
        expect(['👑', '🌟', '💎', '🚀', '🔮']).toContain(globalResult.artist.avatar);
        expect(globalResult.artist.status).toBe('IN STUDIO');
      }
    } finally {
      // Restore Math.random
      Math.random = originalRandom;
    }
  });
});
