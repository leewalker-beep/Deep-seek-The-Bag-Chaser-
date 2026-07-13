import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import type { HustleCompletedMetadata } from '../types/game';

describe('Money Pipeline Audit Verification', () => {
  beforeEach(() => {
    // Reset the game to standard starting configurations
    const { resetGame } = useGameStore.getState();
    resetGame('dropout', 3, 'Dropout', 'dropout_default');
  });

  it('verifies standard identity: Applied bag delta == Reward Card == Receipt == Receipt totals', () => {
    const { executeHustle } = useGameStore.getState();

    // 1. Establish clear state with known starting parameters
    useGameStore.setState(s => ({
      currentMarket: 'NORMAL',
      pl: {
        ...s.pl,
        bag: 100000,
        currentTier: 'STREET', // STREET tier has rent of -1000
        clout: 500,
        aura: 500,
        vendingCount: 0,
        flexAssets: {},
        artists: [],
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: [],
        events: [] // Clear all events to isolate totals calculation
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;

    // 2. Execute a hustle ('cc' on Level 1: yieldCash is 4000, cost is 0)
    // Month advances: Rent of -1000 is paid. No passive income.
    // Total applied bag delta should be: 4000 (hustle) - 1000 (rent) = 3000
    const rewardCardResult = executeHustle('cc', 1, true);

    const finalPl = useGameStore.getState().pl;
    const finalBag = finalPl.bag;

    const appliedBagDelta = finalBag - initialBag;

    // A. Verify Applied Bag Delta is mathematically correct
    expect(appliedBagDelta).toBe(3000);

    // B. Verify Reward Card value matches Applied Bag Delta
    const rewardCardNetChange = rewardCardResult.netChange;
    expect(rewardCardNetChange).toBe(appliedBagDelta);

    // C. Verify Receipt (Event) records the exact Applied Bag Delta rather than intermediate calculations
    const latestEvent = finalPl.events.find(e => e.type === 'HUSTLE_COMPLETED');
    expect(latestEvent).toBeDefined();

    const receiptMetadata = latestEvent!.metadata as HustleCompletedMetadata;
    expect(receiptMetadata.profit).toBe(appliedBagDelta);

    // D. Verify Receipt totals are calculated from the final applied transaction values
    const events = finalPl.events || [];
    const calculatedReceiptTotals = events
      .filter(e => e.type === 'HUSTLE_COMPLETED')
      .reduce((sum, e) => {
        const m = e.metadata as HustleCompletedMetadata;
        return sum + (m.profit || 0);
      }, 0);

    expect(calculatedReceiptTotals).toBe(appliedBagDelta);

    // E. Verify complete equality
    expect(appliedBagDelta).toBe(rewardCardNetChange);
    expect(rewardCardNetChange).toBe(receiptMetadata.profit);
    expect(receiptMetadata.profit).toBe(calculatedReceiptTotals);
  });

  it('verifies overall net loss scenario (Deficit)', () => {
    const { executeHustle } = useGameStore.getState();

    // Setup state where rent is larger than hustle rewards (deficit)
    useGameStore.setState(s => ({
      currentMarket: 'NORMAL',
      pl: {
        ...s.pl,
        bag: 100000,
        currentTier: 'STARTUP', // STARTUP tier rent is -5000
        clout: 500,
        aura: 500,
        vendingCount: 0,
        flexAssets: {},
        artists: [],
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: [],
        events: []
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;

    // Execute 'cc' on Level 1 (yieldCash is 4000, cost is 0)
    // Rent is -5000. No passive income.
    // Net Applied bag delta = 4000 (yield) - 5000 (rent) = -1000 (deficit)
    const result = executeHustle('cc', 1, true);

    const finalPl = useGameStore.getState().pl;
    const appliedBagDelta = finalPl.bag - initialBag;

    expect(appliedBagDelta).toBe(-1000);
    expect(result.netChange).toBe(-1000);
    expect(result.yieldCash - result.cost).toBe(-1000);

    const event = finalPl.events.find(e => e.type === 'HUSTLE_COMPLETED');
    expect((event!.metadata as HustleCompletedMetadata).profit).toBe(-1000);
  });

  it('verifies passive income offsets a hustle deficit', () => {
    const { executeHustle } = useGameStore.getState();

    // Setup state where player has high passive income that offsets hustle failure/deficit
    useGameStore.setState(s => ({
      currentMarket: 'NORMAL',
      pl: {
        ...s.pl,
        bag: 100000,
        currentTier: 'STARTUP', // STARTUP tier rent is -5000
        clout: 500,
        aura: 500,
        vendingCount: 40, // 40 * 150 = 6000 passive income. Plus vending king bonus +500 = 6500.
        hustleLevels: { 'r_vending': 1 }, // Must register active hustle levels so passive income applies
        flexAssets: {},
        artists: [],
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: [],
        events: []
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;

    // Execute 'cc' Level 1 and force failure!
    // Hustle yieldCash = 4000 * 0.3 (failure) = 1200. Cost = 0.
    // Passive income = 6500. Rent = -5000.
    // Net applied delta = 1200 (hustle) + 6500 (passive) - 5000 (rent) = 2700 (offsets overall loss!)
    const result = executeHustle('cc', 1, false);

    const finalPl = useGameStore.getState().pl;
    const appliedBagDelta = finalPl.bag - initialBag;

    expect(appliedBagDelta).toBe(2700);
    expect(result.netChange).toBe(2700);
    expect(result.yieldCash - result.cost).toBe(2700);

    const event = finalPl.events.find(e => e.type === 'HUSTLE_COMPLETED');
    expect((event!.metadata as HustleCompletedMetadata).profit).toBe(2700);
  });

  it('verifies narrative modifiers and challenge rewards are fully synchronized', () => {
    const { executeHustle } = useGameStore.getState();

    // Setup state with an active challenge on STREET tier
    useGameStore.setState(s => ({
      currentMarket: 'NORMAL',
      pl: {
        ...s.pl,
        bag: 100000,
        currentTier: 'STREET', // rent -1000
        clout: 500,
        aura: 500,
        vendingCount: 0,
        flexAssets: {},
        artists: [],
        masteredHustles: [],
        tierBadges: [],
        streak: 0,
        rivalThreats: {},
        activeSentiment: null,
        activeWorldEvent: null,
        marketLeaderTiers: [],
        events: [],
        activeChallenges: [
          {
            rivalId: 'rival_r1',
            rivalName: 'Rival R1',
            tier: 'STREET',
            hustlesCompleted: 2, // 1 play remaining to trigger win reward!
            hustlesRequired: 3,
            monthsRemaining: 5
          }
        ]
      }
    }));

    const initialBag = useGameStore.getState().pl.bag;

    // Execute STREET hustle 'cc' Level 1 (yieldCash = 4000, cost = 0)
    // Month advances: Rent -1000.
    // Challenge win triggers: awarded 10% of starting bag = +10000.
    // Final bag: 100000 + 4000 - 1000 + 10000 = 113000.
    // Total applied bag delta = 113000 - 100000 = 13000.
    const result = executeHustle('cc', 1, true);

    const finalPl = useGameStore.getState().pl;
    const appliedBagDelta = finalPl.bag - initialBag;

    // A. Verify exact match
    expect(appliedBagDelta).toBe(13000);
    expect(result.netChange).toBe(13000);
    expect(result.yieldCash - result.cost).toBe(13000);

    // B. Verify Receipt profit records 13000
    const event = finalPl.events.find(e => e.type === 'HUSTLE_COMPLETED');
    expect((event!.metadata as HustleCompletedMetadata).profit).toBe(13000);

    // C. Verify active challenge was won and cleared
    expect(finalPl.activeChallenges.length).toBe(0);
  });
});
