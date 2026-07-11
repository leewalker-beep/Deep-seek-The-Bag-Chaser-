import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage for Zustand persist
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';

describe('Upgrade Bug Regression', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame('STREET_KID', 3); // MUD tier
  });

  it('executeBranch (Branch Upgrade) should subtract cost and NOT add yieldCash to bag', () => {
    const { executeBranch } = useGameStore.getState();

    // Setup player with enough money and stats for House Flip (l2a)
    // l2a requirements: cost 5000, clout 30, aura 20
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 10000,
        clout: 100,
        aura: 100,
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;
    const hustleId = 'r_labor';
    const branchId = 'l2a'; // House Flip: cost 5000, yieldCash 8000

    executeBranch(hustleId, branchId);

    const finalPl = useGameStore.getState().pl;
    // EXPECTATION: bag = 10000 - 5000 = 5000
    // ACTUAL (BUG): bag = 10000 - 5000 + 8000 = 13000
    expect(finalPl.bag).toBe(initialBag - 5000);

    // Check receipts (events)
    const event = finalPl.events.find(e => e.type === 'PROPERTY_PURCHASED');
    expect(event).toBeDefined();
    expect(event?.metadata.cost).toBe(5000);

    // Check actionLog/Receipts profit
    const action = finalPl.actionLog[0];
    expect(action.netCash).toBe(-5000);
    expect(action.yieldCash).toBe(0);
  });

  it('upgradeHustle (Level Upgrade) should subtract cost and log correctly', () => {
    const { upgradeHustle } = useGameStore.getState();

    // Setup player for a level upgrade
    // r_delivery: l1 -> l2 cost 2000, yield 4500
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 10000,
        clout: 100,
        aura: 100,
        hustleLevels: { 'r_delivery': 1 },
        hustleBranchIds: { 'r_delivery': 'l1' }
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;
    upgradeHustle('r_delivery', 'l2');

    const finalPl = useGameStore.getState().pl;
    expect(finalPl.bag).toBe(initialBag - 2000);
    expect(finalPl.hustleLevels['r_delivery']).toBe(2);

    // Check actionLog
    const action = finalPl.actionLog[0];
    expect(action.netCash).toBe(-2000);
    expect(action.yieldCash).toBe(0);
  });

  it('upgradeHustle (True Level Upgrade - global_franchise) should subtract cost and log correctly', () => {
    const { upgradeHustle } = useGameStore.getState();

    // global_franchise: l1 cost 500k, l2 cost 3M
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'CORPORATE',
        bag: 10000000,
        clout: 5000,
        aura: 5000,
        hustleLevels: { 'global_franchise': 1 }
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;
    upgradeHustle('global_franchise'); // Upgrade to l2

    const finalPl = useGameStore.getState().pl;
    expect(finalPl.bag).toBe(initialBag - 3000000);
    expect(finalPl.hustleLevels['global_franchise']).toBe(2);

    // Check actionLog
    const action = finalPl.actionLog[0];
    expect(action.netCash).toBe(-3000000);
    expect(action.yieldCash).toBe(0);
  });

  it('repeatable branch purchase should subtract cost and NOT add yield', () => {
    const { executeBranch } = useGameStore.getState();

    // l2b: Rent Portfolio, cost 15000, yield 25000
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 20000,
        clout: 100,
        aura: 100,
        hustleBranchIds: { 'r_labor': 'l2b' }
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;
    executeBranch('r_labor', 'l2b');

    const finalPl = useGameStore.getState().pl;
    // Account for automatic month advancement (passive yield 500 - rent 50 = +450)
    expect(finalPl.bag).toBe(initialBag - 15000 + 450);
    expect(finalPl.actionLog[0].netCash).toBe(-15000);
  });
});
