import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { advanceMonth } from '../engine/advancementEngine';
import type { RecordLabelArtist } from '../types/game';

describe('Two-step Talent Scouting Flow', () => {
  beforeEach(() => {
    // Reset state before each test
    useGameStore.getState().resetGame('street_kid', 3);
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        bag: 1000000,
        artists: [],
        scoutedTalentPool: []
      }
    }));
  });

  it('populates scoutedTalentPool with 2-3 candidate artists on successful scout roll', () => {
    const originalRandom = Math.random;
    // Mock Math.random to always succeed (< successRate) and also deterministic candidate count
    Math.random = vi.fn().mockReturnValue(0.01);

    const store = useGameStore.getState();
    const result = store.scoutArtist('local');

    // Restore Math.random
    Math.random = originalRandom;

    expect(result.success).toBe(true);

    const pl = useGameStore.getState().pl;
    // Should populate the pool with 2 or 3 candidates
    expect(pl.scoutedTalentPool.length).toBeGreaterThanOrEqual(2);
    expect(pl.scoutedTalentPool.length).toBeLessThanOrEqual(3);

    // Main artist roster must still be empty because we have not selected/signed anyone yet
    expect(pl.artists.length).toBe(0);

    // Candidates should have correct tier
    pl.scoutedTalentPool.forEach(artist => {
      expect(artist.tier).toBe('local');
      expect(artist.status).toBe('IN STUDIO');
    });
  });

  it('correctly adds a selected candidate to pl.artists and clears the pool on signScoutedArtist', () => {
    // Manually populate scoutedTalentPool with 2 fake candidate artists
    const mockArtist1: RecordLabelArtist = {
      id: 'artist_1',
      name: 'Artist One',
      avatar: '🎤',
      contractMonthsLeft: 120,
      monthlyRetainer: 400,
      monthlyRevenue: 2400,
      hypeFactor: 1.0,
      isTargetedByRival: false,
      tier: 'local',
      royaltyRate: 2000,
      monthsActive: 0,
      hasReleased: false,
      status: 'IN STUDIO',
    };

    const mockArtist2: RecordLabelArtist = {
      id: 'artist_2',
      name: 'Artist Two',
      avatar: '🎧',
      contractMonthsLeft: 120,
      monthlyRetainer: 400,
      monthlyRevenue: 2400,
      hypeFactor: 1.0,
      isTargetedByRival: false,
      tier: 'local',
      royaltyRate: 2000,
      monthsActive: 0,
      hasReleased: false,
      status: 'IN STUDIO',
    };

    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        scoutedTalentPool: [mockArtist1, mockArtist2]
      }
    }));

    const store = useGameStore.getState();

    // Selecting artist_1
    store.signScoutedArtist('artist_1');

    const pl = useGameStore.getState().pl;
    // Roster should have exactly 1 artist, which is artist_1
    expect(pl.artists.length).toBe(1);
    expect(pl.artists[0].id).toBe('artist_1');
    expect(pl.artists[0].name).toBe('Artist One');

    // Scouted talent pool must be cleared
    expect(pl.scoutedTalentPool.length).toBe(0);
  });

  it('expires and clears the scoutedTalentPool on month advancement', () => {
    // Manually populate scoutedTalentPool with candidate artists
    const mockArtist: RecordLabelArtist = {
      id: 'artist_temp',
      name: 'Temp Artist',
      avatar: '🎤',
      contractMonthsLeft: 120,
      monthlyRetainer: 400,
      monthlyRevenue: 2400,
      hypeFactor: 1.0,
      isTargetedByRival: false,
      tier: 'local',
      royaltyRate: 2000,
      monthsActive: 0,
      hasReleased: false,
      status: 'IN STUDIO',
    };

    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        scoutedTalentPool: [mockArtist]
      }
    }));

    const initialPl = useGameStore.getState().pl;
    expect(initialPl.scoutedTalentPool.length).toBe(1);

    // Call advanceMonth pure engine function
    const adv = advanceMonth(initialPl, 'NORMAL', [], true);
    expect(adv.newPl.scoutedTalentPool.length).toBe(0);

    // Now test using store action advanceMonthAction
    const store = useGameStore.getState();
    expect(store.advanceMonthAction).toBeDefined();

    // Call advanceMonthAction
    store.advanceMonthAction?.();
    const finalPl = useGameStore.getState().pl;
    expect(finalPl.scoutedTalentPool.length).toBe(0);
  });
});
