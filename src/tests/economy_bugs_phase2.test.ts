import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';

describe('Phase 2: Economy-Breaking Bugs Verification', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame('dropout', 1, 'Dropout', 'dropout_default');
  });

  it('Rent Portfolio: should block purchase at 20', () => {
    const { executeBranch } = useGameStore.getState();

    // Give enough money
    useGameStore.setState((state) => ({
      pl: { ...state.pl, bag: 10000000, currentTier: 'MUD', clout: 500, aura: 50 }
    }));

    // Purchase 20 Rent Portfolios
    for (let i = 0; i < 20; i++) {
      const result = executeBranch('r_labor', 'l2b');
      expect(result.success).toBe(true);
    }

    // Try to purchase 21st
    const result21 = executeBranch('r_labor', 'l2b');
    expect(result21.success).toBe(false);
    expect(result21.message).toBe('Maximum 20 Rent Portfolios reached.');
    expect(useGameStore.getState().pl.rentPortfolioCount).toBe(20);
  });

  it('Meme Coin: big win should be 5x', () => {
    // We can't easily test random but we can check mathEngine directly or mock Math.random
    // Actually, let's mock Math.random to trigger big win
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05); // Triggers Meme Coin big win (threshold 0.10)

    const { executeHustle } = useGameStore.getState();
    useGameStore.setState((state) => ({
      pl: { ...state.pl, bag: 1000000, currentTier: 'OPEN', clout: 500, aura: 50 }
    }));

    const result = executeHustle('meme', 1, true); // forceSuccess=true

    // Meme Coin l1 yieldCash is 1500. levelMult=1, marketYieldMult=1.
    // 5x big win should be 1500 * 5 = 7500.
    // However, executeHustleAction calls getEffectiveHustleStats which might apply other multipliers.
    // At OPEN tier, no special yield multiplier for meme coin specifically besides sentiment.

    expect(result.isRare).toBe(true);
    expect(result.bigWinMessage).toBe('TO THE MOON! Meme coin pumps 5x!');
    // Base yield is 1500. Big win makes it 7500.
    expect(result.yieldCash).toBe(7500);

    randomSpy.mockRestore();
  });

  it('Flex Bonuses: should be applied but never exceed 2.0x total multiplier', () => {
    // Mock random to prevent sentiment interference
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const { executeHustle } = useGameStore.getState();

    // 1. Check without bonuses
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 1000000,
        currentTier: 'OPEN',
        clout: 500,
        aura: 50,
        flexAssets: {},
        legacyPoints: 0,
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: []
      }
    }));
    const resultNoBonus = executeHustle('r_labor', 1, true);
    // r_labor l1 yieldCash is 2000
    expect(resultNoBonus.yieldCash).toBe(2000);

    // 2. Check with some bonuses (but under 2x)
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 1000000,
        currentTier: 'OPEN',
        clout: 500,
        aura: 50,
        flexAssets: {
            'penthouse': 1 // Penthouse has 10% allGainsBonus
        },
        legacyPoints: 0,
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: []
      }
    }));
    const resultSomeBonus = executeHustle('r_labor', 1, true);
    // 2000 + 10% = 2200. Plus penthouse passive = 25000. Total applied = 27200.
    expect(resultSomeBonus.yieldCash).toBe(27200);

    // 3. Check with huge bonuses (should be capped at 2x)
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        bag: 1000000,
        currentTier: 'OPEN',
        clout: 500,
        aura: 50,
        flexAssets: {
            'tech_conglomerate': 10, // boosts other flex assets by 1+10*0.1 = 2.0x
            'penthouse': 10 // (10 * 10%) * 2.0 = 200% bonus
        },
        legacyPoints: 0,
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: []
      }
    }));

    const resultCapped = executeHustle('r_labor', 1, true);
    // r_labor l1 yieldCash is 2000. Capped at 2x is 4000. Plus passive (25,000,000 + 500,000) = 25,504,000.
    expect(resultCapped.yieldCash).toBe(25504000);
    vi.restoreAllMocks();
  });

  it('Congress Support: should be clamped between 0 and 100', () => {
    const { updatePresidentialStat } = useGameStore.getState();

    useGameStore.setState((state) => ({
      pl: { ...state.pl, currentTier: 'PRESIDENT', congressSupport: 50 }
    }));

    // Try to increase above 100
    updatePresidentialStat('congressSupport', 100);
    expect(useGameStore.getState().pl.congressSupport).toBe(100);

    // Try to decrease below 0
    updatePresidentialStat('congressSupport', -200);
    expect(useGameStore.getState().pl.congressSupport).toBe(0);
  });
});
