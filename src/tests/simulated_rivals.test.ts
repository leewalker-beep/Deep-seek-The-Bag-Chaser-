import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { advanceMonth } from '../engine/advancementEngine';
import { simulateRivals } from '../engine/rivalSimEngine';

describe('Simulated Rivals Robust AI System', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize all rivals with correct persistent traits and states', () => {
    const state = useGameStore.getState();
    const marcus = state.pl.rivals.find(r => r.name === 'Marcus')!;
    expect(marcus).toBeDefined();
    expect(marcus.riskTolerance).toBe(0.3);
    expect(marcus.ethics).toBe(0.7);
    expect(marcus.politicalLeaning).toBe('center');
    expect(marcus.preferredIndustries).toContain('Food');
    expect(marcus.relationshipWithPlayer).toBe(0);
    expect(marcus.businesses).toEqual([]);
    expect(marcus.propertiesOwned).toBe(0);
  });

  it('should run monthly simulation and trigger dynamic actions & updates', () => {
    const pl = useGameStore.getState().pl;

    // Force sequence:
    // 1. High fluctuation growth factor (Math.random() around 0.9)
    // 2. High action chance triggers (Math.random() around 0.01)
    // 3. Action type selection
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)  // high fluctuation
      .mockReturnValueOnce(0.01) // action chance trigger
      .mockReturnValueOnce(0.1)  // action category trigger
      .mockReturnValue(0.1);     // fallback rest (makes sure Math.random() < 0.4 news chance succeeds)

    const result = simulateRivals(pl, 'NORMAL');
    const marcus = result.updatedRivals.find(r => r.name === 'Marcus')!;

    // Net worth is non-zero and correctly calculated
    expect(marcus.netWorth).toBeGreaterThan(0);

    // Some actions should have triggered
    expect(marcus.propertiesOwned + marcus.businesses.length + marcus.companiesAcquired.length + marcus.mediaCompaniesOwned).toBeGreaterThan(0);
    expect(result.news.length).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });

  it('should process relationship changes and retaliations if player sabotages them', () => {
    const state = useGameStore.getState();
    const marcus = state.pl.rivals.find(r => r.name === 'Marcus')!;

    // Sabotage Marcus
    useGameStore.setState(s => ({
      pl: { ...s.pl, bag: 10000000 } // give enough funds
    }));

    // Mock Math.random to guarantee sabotage success
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    useGameStore.getState().sabotageRival(marcus.id);

    const updatedMarcus = useGameStore.getState().pl.rivals.find(r => r.name === 'Marcus')!;
    expect(updatedMarcus.sabotagedCount).toBe(1);
    expect(updatedMarcus.relationshipWithPlayer).toBeLessThan(0);
    expect(updatedMarcus.vengeance).toBeGreaterThan(1);

    vi.restoreAllMocks();
  });

  it('should establish partnership and trigger rewards if player helps them', () => {
    const state = useGameStore.getState();
    const marcus = state.pl.rivals.find(r => r.name === 'Marcus')!;

    // Help/Partner with Marcus
    useGameStore.setState(s => ({
      pl: { ...s.pl, bag: 10000000 } // give enough funds
    }));

    useGameStore.getState().helpRival!(marcus.id);

    const updatedMarcus = useGameStore.getState().pl.rivals.find(r => r.name === 'Marcus')!;
    expect(updatedMarcus.helpedCount).toBe(1);
    expect(updatedMarcus.relationshipWithPlayer).toBeGreaterThan(0);

    // Verify news was added
    expect(useGameStore.getState().news.some(m => typeof m === 'object' && m.text.includes('PARTNERSHIP ESTABLISHED'))).toBe(true);
  });

  it('should execute advancement tick and run rival AI simulation correctly', () => {
    const pl = useGameStore.getState().pl;
    const initialNetWorths = pl.rivals.map(r => r.netWorth);

    // Call advanceMonth
    const adv = advanceMonth(pl, 'NORMAL', [], true);

    // Check that rival netWorths shifted
    adv.newPl.rivals.forEach((r, idx) => {
      expect(r.netWorth).not.toBe(initialNetWorths[idx]);
    });
  });
});
