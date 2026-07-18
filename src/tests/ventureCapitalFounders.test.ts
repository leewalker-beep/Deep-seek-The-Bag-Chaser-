import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { advanceMonth } from '../engine/advancementEngine';
import type { Founder } from '../types/game';

describe('Venture Capital Founders Roster System', () => {
  beforeEach(() => {
    // Reset state before each test
    useGameStore.getState().resetGame('sk_scrap');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize foundersBacked as an empty array', () => {
    const pl = useGameStore.getState().pl;
    expect(pl.foundersBacked).toBeDefined();
    expect(pl.foundersBacked).toBeInstanceOf(Array);
    expect(pl.foundersBacked.length).toBe(0);
  });

  it('should generate a Founder on successful venture capital pitch and persist it', () => {
    const store = useGameStore.getState();

    // Set a high enough bag amount to afford the l1 VC branch cost (which is $1,000,000)
    store.updatePl({
      bag: 20000000,
      clout: 5000,
      aura: 5000,
      currentTier: 'ELITE' // VC is an ELITE hustle
    });

    // Execute VC hustle with 3.0 minigame multiplier (high performance)
    const result = store.executeHustle('venture_capital', 3.0, true);

    expect(result.success).toBe(true);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.foundersBacked.length).toBe(1);

    const founder = updatedPl.foundersBacked[0];
    expect(founder.id).toBeDefined();
    expect(founder.name).toBeDefined();
    expect(founder.companyName).toBeDefined();
    expect(founder.pitchIdea).toBeDefined();
    expect(founder.avatar).toBeDefined();
    expect(founder.followOnCount).toBe(0);

    expect(founder.stats.execution).toBeGreaterThanOrEqual(60);
    expect(founder.stats.execution).toBeLessThanOrEqual(100);
    expect(founder.stats.vision).toBeGreaterThanOrEqual(60);
    expect(founder.stats.vision).toBeLessThanOrEqual(100);
    expect(founder.stats.burnDiscipline).toBeGreaterThanOrEqual(60);
    expect(founder.stats.burnDiscipline).toBeLessThanOrEqual(100);
  });

  it('should calculate and add portfolio passive yield based on backed founders stats', () => {
    const store = useGameStore.getState();

    // Create a mock backed founder
    const mockFounder: Founder = {
      id: 'founder_mock_1',
      name: 'Test Founder',
      avatar: '👓',
      companyName: 'TestAI',
      pitchIdea: 'Mock pitch idea',
      followOnCount: 0,
      stats: {
        execution: 80,
        vision: 90,
        burnDiscipline: 70
      }
    };

    store.updatePl({
      foundersBacked: [mockFounder]
    });

    const pl = useGameStore.getState().pl;
    const currentMarket = useGameStore.getState().currentMarket;
    const unlockedUpgrades = useGameStore.getState().unlockedLegacyUpgradeIds || [];

    // Advance month to calculate the passive yield
    const advancement = advanceMonth(pl, currentMarket, unlockedUpgrades);

    // Returns calculation: (execution * 100) + (vision * 150) + (burnDiscipline * 50)
    // (80 * 100) + (90 * 150) + (70 * 50) = 8000 + 13500 + 3500 = 25000
    const expectedYield = 25000;

    const source = advancement.passiveBreakdown.sources.find(s => s.id === 'founders_backed');
    expect(source).toBeDefined();
    expect(source!.amount).toBe(expectedYield);
    expect(source!.category).toBe('BUSINESS');
    expect(source!.name).toBe('Portfolio Returns');
  });

  it('should allow follow-on investments to boost founder stats', () => {
    const store = useGameStore.getState();

    const mockFounder: Founder = {
      id: 'founder_mock_1',
      name: 'Test Founder',
      avatar: '👓',
      companyName: 'TestAI',
      pitchIdea: 'Mock pitch idea',
      followOnCount: 0,
      stats: {
        execution: 40,
        vision: 50,
        burnDiscipline: 60
      }
    };

    store.updatePl({
      bag: 10000000,
      foundersBacked: [mockFounder]
    });

    const pl = useGameStore.getState().pl;
    const currentBag = pl.bag;
    const fee = 5000000;

    const updatedFounders = pl.foundersBacked.map(f => {
      if (f.id === 'founder_mock_1') {
        return {
          ...f,
          followOnCount: (f.followOnCount || 0) + 1,
          stats: {
            execution: Math.min(100, f.stats.execution + 10),
            vision: Math.min(100, f.stats.vision + 10),
            burnDiscipline: Math.min(100, f.stats.burnDiscipline + 10),
          }
        };
      }
      return f;
    });

    store.updatePl({
      bag: pl.bag - fee,
      foundersBacked: updatedFounders
    });

    const finalPl = useGameStore.getState().pl;
    expect(finalPl.bag).toBe(currentBag - fee);

    const boostedFounder = finalPl.foundersBacked[0];
    expect(boostedFounder.followOnCount).toBe(1);
    expect(boostedFounder.stats.execution).toBe(50);
    expect(boostedFounder.stats.vision).toBe(60);
    expect(boostedFounder.stats.burnDiscipline).toBe(70);
  });

  it('should enforce hard cap of 3 follow-ons and clamp stats at 100', () => {
    const store = useGameStore.getState();

    const mockFounder: Founder = {
      id: 'founder_mock_limit',
      name: 'Limit Test Founder',
      avatar: '🚀',
      companyName: 'PeakAI',
      pitchIdea: 'Testing bounds',
      followOnCount: 0,
      stats: {
        execution: 95,
        vision: 95,
        burnDiscipline: 95
      }
    };

    store.updatePl({
      bag: 50000000, // plenty of cash
      foundersBacked: [mockFounder]
    });

    const applyFollowOn = (f: Founder) => {
      if ((f.followOnCount || 0) >= 3) return f; // enforce cap
      return {
        ...f,
        followOnCount: (f.followOnCount || 0) + 1,
        stats: {
          execution: Math.min(100, f.stats.execution + 10),
          vision: Math.min(100, f.stats.vision + 10),
          burnDiscipline: Math.min(100, f.stats.burnDiscipline + 10),
        }
      };
    };

    // Perform follow-ons
    let pl = useGameStore.getState().pl;
    pl.foundersBacked = pl.foundersBacked.map(f => applyFollowOn(f));
    store.updatePl({ foundersBacked: pl.foundersBacked });

    pl = useGameStore.getState().pl;
    expect(pl.foundersBacked[0].followOnCount).toBe(1);
    expect(pl.foundersBacked[0].stats.execution).toBe(100); // clamped at 100

    pl.foundersBacked = pl.foundersBacked.map(f => applyFollowOn(f));
    store.updatePl({ foundersBacked: pl.foundersBacked });

    pl = useGameStore.getState().pl;
    expect(pl.foundersBacked[0].followOnCount).toBe(2);

    pl.foundersBacked = pl.foundersBacked.map(f => applyFollowOn(f));
    store.updatePl({ foundersBacked: pl.foundersBacked });

    pl = useGameStore.getState().pl;
    expect(pl.foundersBacked[0].followOnCount).toBe(3);

    // 4th attempt should be blocked by the hard cap
    pl.foundersBacked = pl.foundersBacked.map(f => applyFollowOn(f));
    store.updatePl({ foundersBacked: pl.foundersBacked });

    pl = useGameStore.getState().pl;
    expect(pl.foundersBacked[0].followOnCount).toBe(3); // capped at 3
    expect(pl.foundersBacked[0].stats.execution).toBe(100);
    expect(pl.foundersBacked[0].stats.vision).toBe(100);
    expect(pl.foundersBacked[0].stats.burnDiscipline).toBe(100);
  });
});
