
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { SPECIALIZATIONS } from '../config/specializations';

describe('Imperial Ledger System', () => {

  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame();

    // Clear any persistent state
    useGameStore.setState(s => ({
        ...s,
        pl: {
            ...s.pl,
            bag: 10000,
            clout: 1000,
            aura: 1000,
            month: 0,
            hustleLevels: {},
            hustleBranchIds: {},
            vendingCount: 0,
            flexAssets: {},
            dynamicPassives: {},
            rentalCount: 0,
            artists: [],
            events: []
        }
    }));
  });

  it('calculates passive income breakdown with source attribution', () => {
    const { executeHustle } = useGameStore.getState();

    // Setup: 10 Vending machines ($150 * 10 = 1500) + Vending King Bonus (500) = 2000
    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            vendingCount: 10,
            hustleLevels: { 'r_vending': 1 },
            hustleBranchIds: { 'r_vending': 'vending' }
        }
    }));

    // Trigger advanceMonth via executeHustle
    executeHustle('r_labor', 1, true);

    const state = useGameStore.getState().pl;
    const breakdown = state.lastPassiveBreakdown;

    expect(breakdown).toBeDefined();
    expect(breakdown!.baseTotal).toBe(2000);

    const vendingSource = breakdown!.sources.find(s => s.id === 'r_vending');
    const bonusSource = breakdown!.sources.find(s => s.id === 'vending_bonus');

    expect(vendingSource).toBeDefined();
    expect(vendingSource!.amount).toBe(1500);
    expect(vendingSource!.count).toBe(10);

    expect(bonusSource).toBeDefined();
    expect(bonusSource!.amount).toBe(500);
  });

  it('applies Specialization bonuses to passive income', () => {
    const { executeHustle, selectSpecialization } = useGameStore.getState();

    // Setup: Institutionalist specialization (+15% cash)
    // Needs to meet requirements to advance tier and select specialization,
    // but for unit test we can force set it.
    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            activeSpecializationId: 'institutional',
            vendingCount: 10,
            hustleLevels: { 'r_vending': 1 },
            hustleBranchIds: { 'r_vending': 'vending' }
        }
    }));

    executeHustle('r_labor', 1, true);

    const state = useGameStore.getState().pl;
    const breakdown = state.lastPassiveBreakdown;

    // Base: 2000. Spec bonus: x1.15. Total: 2300.
    expect(breakdown!.multipliers.specialization).toBe(1.15);
    expect(breakdown!.finalTotal).toBe(2300);
  });

  it('includes Real Estate and Flex Assets in the breakdown', () => {
    const { executeHustle } = useGameStore.getState();

    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            rentalCount: 1,
            realEstateType: 'residential',
            realEstateLeverage: 0,
            marketCycle: { ...s.pl.marketCycle, realEstate: 'normal' },
            flexAssets: { 'yacht': 1 }
        }
    }));

    executeHustle('r_labor', 1, true);

    const state = useGameStore.getState().pl;
    const breakdown = state.lastPassiveBreakdown;

    const reSource = breakdown!.sources.find(s => s.category === 'REAL_ESTATE');
    const flexSource = breakdown!.sources.find(s => s.category === 'FLEX');

    // Residential base profit: 1M. Yield = base * 1 * 1 * 1 * 0.5 = 500k.
    expect(reSource).toBeDefined();
    expect(reSource!.amount).toBe(500000);

    // Yacht passive: 10000.
    expect(flexSource).toBeDefined();
    expect(flexSource!.amount).toBe(10000);
  });
});
