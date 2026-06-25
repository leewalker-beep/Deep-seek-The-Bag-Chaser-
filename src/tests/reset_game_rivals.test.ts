import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getInitialStats } from '../store/initialState';

describe('resetGame rivals reinitialization', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should reset rivals to initial state on resetGame', () => {
    const rivalId = 'rival_mud';
    const modifiedNetWorth = 9999999;

    // 1. Modify a rival's net worth in the store
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, netWorth: modifiedNetWorth } : r)
      }
    }));

    // Verify it was modified
    expect(useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!.netWorth).toBe(modifiedNetWorth);

    // 2. Call resetGame
    useGameStore.getState().resetGame('STREET_KID', 3);

    // 3. Verify it was reset
    const initialStats = getInitialStats(3, 'STREET_KID');
    const initialRivalNetWorth = initialStats.rivals.find(r => r.id === rivalId)!.netWorth;

    expect(useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!.netWorth).toBe(initialRivalNetWorth);
    expect(useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!.netWorth).not.toBe(modifiedNetWorth);
  });

  it('should clear actionLog on resetGame', () => {
     // 1. Add an action to the log
     useGameStore.getState().logAction({
        month: 1,
        tier: 'MUD',
        hustleId: 'test',
        hustleName: 'Test',
        level: 1,
        branchId: 'test',
        branchName: 'Test',
        cost: 0,
        yieldCash: 0,
        yieldClout: 0,
        yieldAura: 0,
        netCash: 0,
        success: true
     });

     expect(useGameStore.getState().pl.actionLog.length).toBe(1);

     // 2. Call resetGame
     useGameStore.getState().resetGame('STREET_KID', 3);

     // 3. Verify it was cleared
     expect(useGameStore.getState().pl.actionLog.length).toBe(0);
  });
});
