import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Timeline Guard - Automatic Month Advancement', () => {
  beforeEach(() => {
    // Reset game state to start in month 1
    useGameStore.getState().resetGame('STREET_KID', 3);
    // Grant enough cash to afford rent portfolios and vending machines
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        bag: 1000000,
        clout: 500,
        aura: 500,
        month: 1
      }
    }));
  });

  it('should immediately advance the month when repeating Rent Portfolio (executeBranch)', () => {
    const stateBefore = useGameStore.getState();
    expect(stateBefore.pl.month).toBe(1);

    // Rent Portfolio is 'l2b' under 'r_labor'
    const result = useGameStore.getState().executeBranch('r_labor', 'l2b');
    expect(result.success).toBe(true);

    const stateAfter = useGameStore.getState();
    // Month should immediately advance to 2
    expect(stateAfter.pl.month).toBe(2);
    expect(stateAfter.pl.rentPortfolioCount).toBe(1);
  });

  it('should immediately advance the month when repeating Rent Portfolio via upgradeHustle', () => {
    const stateBefore = useGameStore.getState();
    expect(stateBefore.pl.month).toBe(1);

    // Set r_labor branch ID in store to enable repeatability/upgrade path
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        hustleBranchIds: {
          ...state.pl.hustleBranchIds,
          r_labor: 'l2b'
        }
      }
    }));

    const result = useGameStore.getState().upgradeHustle('r_labor', 'l2b');
    expect(result).toBe(true);

    const stateAfter = useGameStore.getState();
    expect(stateAfter.pl.month).toBe(2);
    expect(stateAfter.pl.rentPortfolioCount).toBe(1);
  });

  it('should immediately advance the month when purchasing/buying a Vending Machine (executeBranch)', () => {
    const stateBefore = useGameStore.getState();
    expect(stateBefore.pl.month).toBe(1);

    const result = useGameStore.getState().executeBranch('r_vending', 'vending');
    expect(result.success).toBe(true);

    const stateAfter = useGameStore.getState();
    expect(stateAfter.pl.month).toBe(2);
    expect(stateAfter.pl.vendingCount).toBe(1);
  });

  it('should immediately advance the month when purchasing/buying a Vending Machine via upgradeHustle', () => {
    const stateBefore = useGameStore.getState();
    expect(stateBefore.pl.month).toBe(1);

    const result = useGameStore.getState().upgradeHustle('r_vending', 'vending');
    expect(result).toBe(true);

    const stateAfter = useGameStore.getState();
    expect(stateAfter.pl.month).toBe(2);
    expect(stateAfter.pl.vendingCount).toBe(1);
  });
});
