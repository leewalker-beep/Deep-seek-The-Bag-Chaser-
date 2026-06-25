import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Rival Interactions', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should allow sabotaging a rival and applying penalties/rewards', () => {
    const rivalId = 'rival_mud';
    const initialBag = 1000000; // Give enough money
    useGameStore.setState(state => ({
      pl: { ...state.pl, bag: initialBag }
    }));

    const rival = useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!;
    const initialNetWorth = rival.netWorth;

    // Mock math.random for success
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    useGameStore.getState().sabotageRival(rivalId);

    const updatedRival = useGameStore.getState().pl.rivals.find(r => r.id === rivalId)!;
    expect(updatedRival.netWorth).toBeLessThan(initialNetWorth);
    expect(useGameStore.getState().pl.bag).toBe(initialBag - 500000);
    expect(updatedRival.lastSabotagedMonth).toBe(useGameStore.getState().pl.month);
    expect(updatedRival.vengeance).toBeGreaterThan(1);

    vi.restoreAllMocks();
  });

  it('should handle sabotage failure correctly', () => {
    const rivalId = 'rival_mud';
    const initialBag = 1000000;
    useGameStore.setState(state => ({
      pl: { ...state.pl, bag: initialBag }
    }));

    // Mock math.random for failure (success threshold is 0.75)
    vi.spyOn(Math, 'random').mockReturnValue(0.8);

    useGameStore.getState().sabotageRival(rivalId);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.heat).toBe(25);
    // Note: enforceStatCaps clamps aura to 0
    expect(updatedPl.aura).toBe(0);

    vi.restoreAllMocks();
  });

  it('should allow counter-bidding and applying yield bonuses', () => {
    const rivalId = 'rival_mud';
    const initialBag = 1000000;
    useGameStore.setState(state => ({
      pl: { ...state.pl, bag: initialBag, currentTier: 'MUD' as any }
    }));

    // Manually set a bid
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        rivals: state.pl.rivals.map(r => r.id === rivalId ? { ...r, currentBid: 10000 } : r)
      }
    }));

    useGameStore.getState().counterBid(rivalId);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.bag).toBe(initialBag - 15000); // 1.5x of 10000
    expect(updatedPl.clout).toBeGreaterThan(0);
    expect(updatedPl.rivals.find(r => r.id === rivalId)!.currentBid).toBe(0);
    expect(updatedPl.dynamicPassives['counter_bid_bonus_MUD']).toBe(1);
  });

  it('should unlock Market Leader status when crushing a rival', async () => {
    const rivalId = 'rival_mud';
    // Set player bag much higher than rival net worth
    useGameStore.setState(state => ({
      pl: { ...state.pl, bag: 1000000, currentTier: 'MUD' as any }
    }));

    const { advanceMonth } = await import('../engine/advancementEngine');
    const { newPl } = advanceMonth(useGameStore.getState().pl, 'NORMAL');

    expect(newPl.marketLeaderTiers).toContain('MUD');
  });
});
