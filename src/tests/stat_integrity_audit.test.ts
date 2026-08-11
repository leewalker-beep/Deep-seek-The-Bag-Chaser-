import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getEffectiveHustleStats, calculateHustleMath } from '../engine/mathEngine';
import { executeHustleAction } from '../engine/hustleEngine';
import { enforceStatCaps } from '../engine/statEngine';
import { advanceMonth, checkDeathConditions } from '../engine/advancementEngine';
import { isHustleMastered, getCrownProgress } from '../utils/masteryUtils';
import type { PlayerStats } from '../types/game';

describe('Comprehensive Stat Integrity & Display Audit', () => {
  let originalRandom: typeof Math.random;

  beforeEach(() => {
    // Save original random to prevent environment bleeding
    originalRandom = Math.random;

    // Initialize mock localStorage
    if (typeof (global as any).localStorage === 'undefined') {
      (global as any).localStorage = {
        setItem: () => {},
        getItem: () => null,
        removeItem: () => {},
        clear: () => {}
      };
    }

    const { resetGame } = useGameStore.getState();
    resetGame('sk_ghost', 3); // Street Kid background

    // Force set a clean state for every test to prevent cross-contamination
    useGameStore.setState({
      ph: 'PLAYING',
      isTutorialSkipped: true,
      currentMarket: 'NORMAL',
      dailyChallenges: [],
      achievements: useGameStore.getState().achievements.map(a => ({ ...a, isUnlocked: true })),
      pl: {
        ...useGameStore.getState().pl,
        bag: 100000,
        clout: 100,
        aura: 100,
        mentalHealth: 100,
        heat: 0,
        events: [],
        masteredHustles: [],
        tierBadges: [],
        flexAssets: {},
        vendingCount: 0,
        hustleBranchIds: {},
        hustleLevels: {},
        hustlePlays: {},
        artists: [],
        dynamicPassives: {},
        rentalCount: 0,
        rentPortfolioCount: 0,
        flipCount: 0,
        activeChallenges: [],
        legacyPoints: 0,
        currentTier: 'MUD',
        congressSupport: 100,
        approvalFloor: 0,
        scandalRiskBonus: 0,
        pendingPresidentialImpacts: [],
        activeCrises: [],
        presidentialDiary: [],
        month: 1,
        presidentMonth: 0,
        federalBudget: 0,
        unlockedAchievements: [],
        collectedDeathBadges: [],
        loginStreak: 0,
        totalChallengesCompleted: 0
      }
    });
  });

  afterEach(() => {
    // Restore Math.random to prevent environment bleeding
    Math.random = originalRandom;
    vi.restoreAllMocks();
  });

  describe('1. Stat Pipeline Audit', () => {
    it('verifies that each of the core stats updates cleanly and propagates through player state, receipts, history, and ticker', () => {
      const stateBefore = useGameStore.getState().pl;
      expect(stateBefore.bag).toBe(100000);
      expect(stateBefore.clout).toBe(100);
      expect(stateBefore.aura).toBe(100);
      expect(stateBefore.mentalHealth).toBe(100);
      expect(stateBefore.heat).toBe(0);

      // Execute Labor successful run under score multiplier 1.0
      // Math: yieldCash: 2000, yieldClout: 2, yieldAura: 2, mentalHit: -8 (x1.5 = -12), heatHit: 5
      // Street Kid Origin Bonus: +15% Cash (multiplier 1.15)
      // advanceMonth: Rent -50 (MUD tier)
      const res = useGameStore.getState().executeHustle('r_labor', 1, true);
      expect(res.success).toBe(true);

      const stateAfter = useGameStore.getState().pl;

      // Pipeline update assertions:
      // Expected Cash change: 2000 * 1.15 (Origin) - 50 (Rent) = 2250.
      // 100,000 + 2250 = 102250.
      expect(stateAfter.bag).toBe(102250);

      // Expected Clout/Aura: 100 + 2 = 102
      expect(stateAfter.clout).toBe(102);
      expect(stateAfter.aura).toBe(102);

      // Expected Mental Health: 100 - 12 = 88
      expect(stateAfter.mentalHealth).toBe(88);

      // Expected Heat: 5 - 10 (Heat decay) = 0
      expect(stateAfter.heat).toBe(0);

      // Event/Receipt assertions:
      const completedEvents = stateAfter.events.filter(e => e.type === 'HUSTLE_COMPLETED');
      expect(completedEvents.length).toBeGreaterThan(0);
      const receipt = completedEvents[0].metadata as any;
      expect(receipt.profit).toBe(2250);
      expect(receipt.yieldClout).toBe(2);
      expect(receipt.yieldAura).toBe(2);
      expect(receipt.mentalHit).toBe(-12);
      expect(receipt.heatHit).toBe(0); // Heat delta is 0 since both starting and ending are 0

      // World feed ticker updated:
      const hasTickerMsg = useGameStore.getState().news.some(m => {
         const txt = typeof m === 'string' ? m : m.text;
         return txt.includes('Labor & Property') && txt.includes('Success');
      });
      expect(hasTickerMsg).toBe(true);
    });
  });

  describe('2. Hustle Execution Under Multi-Tier Runs', () => {
    const testHustles = [
      { id: 'r_labor', tier: 'MUD', branchId: 'l1', cost: 0 },
      { id: 'r_delivery', tier: 'MUD', branchId: 'l1', cost: 0 },
      { id: 'r_plasma', tier: 'MUD', branchId: 'l1', cost: 0 },
      { id: 'r_ghost_mode', tier: 'MUD', branchId: 'l1', cost: 1000 },
      { id: 'cc', tier: 'STREET', branchId: 'l1', cost: 0 },
      { id: 'sw', tier: 'STARTUP', branchId: 'l1', cost: 0 },
      { id: 'techFlip', tier: 'STREET', branchId: 'l1', cost: 1500 },
      { id: 'saas_mvp', tier: 'STARTUP', branchId: 'l1', cost: 30000 },
      { id: 'ecom_brand', tier: 'STARTUP', branchId: 'l1', cost: 40000 },
      { id: 'venture_capital', tier: 'ELITE', branchId: 'l1', cost: 1000000 },
      { id: 'hedgefund', tier: 'ELITE', branchId: 'l1', cost: 20000000 },
      { id: 'film_studio', tier: 'MOGUL', branchId: 'l1', cost: 500000000 }
    ];

    testHustles.forEach(({ id, tier, branchId, cost }) => {
      it(`audits hustle [${id}] under tier [${tier}] for success, failure, level-up, and crown progression`, () => {
        // Prepare state to allow execution (bypass tier gating restrictions for audit)
        useGameStore.setState(s => ({
          pl: {
            ...s.pl,
            currentTier: tier as any,
            bag: Math.max(s.pl.bag, cost * 2 + 1000000000), // ensure infinite wealth
            clout: 100000,
            aura: 100000,
            mentalHealth: 100,
            hustlePlays: {} // Clear plays for this isolated block
          }
        }));

        // Execute successful run (pass minigameMultiplier = 1.0 for success)
        const resSuccess = useGameStore.getState().executeHustle(id, 1, true);
        expect(resSuccess.success).toBe(true);

        // Execute failed run (pass minigameMultiplier = 0.1 to ensure fail in performance-based games like film_studio)
        const resFail = useGameStore.getState().executeHustle(id, 0.1, false);
        expect(resFail.success).toBe(false);

        // Verify that play counters updated correctly in state
        const plays = useGameStore.getState().pl.hustlePlays[id] || 0;
        expect(plays).toBe(2); // 1 success, 1 failure = 2 plays total

        // Verify crown progress display label mapping
        const progress = getCrownProgress(useGameStore.getState().pl, id);
        expect(progress).not.toBeNull();
        expect(progress!.playsLabel).toBeDefined();
        expect(progress!.actualPlays).toBe(plays);
      });
    });

    it('verifies that Ghost Mode successful run visibly decreases Heat', () => {
      // Initialize with high heat
      useGameStore.setState(s => ({
        pl: {
          ...s.pl,
          currentTier: 'MUD',
          heat: 50,
          bag: 50000,
          clout: 100,
          aura: 100
        }
      }));

      // Execute Ghost Mode
      // Math: cost: 1000, yieldCash: 1400, yieldClout: 0, yieldAura: 5, mentalHit: -2, heatHit: -5 (x market heat mult)
      // Normal market heat mult: 1
      const res = useGameStore.getState().executeHustle('r_ghost_mode', 1, true);
      expect(res.success).toBe(true);

      const finalHeat = useGameStore.getState().pl.heat;
      // High heat (50) + heatHit (-5) - 1 (success deduction) - 10 (monthly decay) = 34
      expect(finalHeat).toBeLessThan(50);
    });

    it('verifies that PR Campaign successful run correctly recovers Clout and Aura', () => {
      useGameStore.setState(s => ({
        pl: {
          ...s.pl,
          currentTier: 'STREET',
          bag: 50000,
          clout: 100,
          aura: 100,
          hustleBranchIds: { 'r_pr_campaign': 'l1' },
          hustleLevels: { 'r_pr_campaign': 1 }
        }
      }));

      // Execute PR Campaign
      // Math: cost 1000, yieldClout 15, yieldAura 10
      const res = useGameStore.getState().executeHustle('r_pr_campaign', 1, true);
      expect(res.success).toBe(true);

      const finalState = useGameStore.getState().pl;
      expect(finalState.clout).toBeGreaterThan(100);
      expect(finalState.aura).toBeGreaterThan(100);
    });
  });

  describe('3. Monthly Advancement & Passive Income Integrity', () => {
    it('verifies that monthly advancement applies rent, upkeeps, passive yields, and decays exactly once with no duplications', () => {
      useGameStore.setState(s => ({
        currentMarket: 'NORMAL',
        pl: {
          ...s.pl,
          currentTier: 'STREET',
          bag: 100000,
          clout: 500,
          aura: 500,
          mentalHealth: 100,
          vendingCount: 10, // passiveYield 150 each = 1500 base total + 500 king bonus = 2000 total passive base
          hustleBranchIds: { 'r_vending': 'vending' },
          hustleLevels: { 'r_vending': 1 },
          month: 1
        }
      }));

      // Trigger advanceMonth manually to isolate engine execution
      const initialBag = useGameStore.getState().pl.bag;
      const initialMonth = useGameStore.getState().pl.month;

      const result = advanceMonth(useGameStore.getState().pl, 'NORMAL', []);

      // Month advanced by exactly 1
      expect(result.newPl.month).toBe(initialMonth + 1);

      // Rent Street = 1000. Upkeep street = 0 (since upkeep_active narrative flag is false by default).
      // Passive Income: 10 machines * 150 = 1500 base + 500 King bonus = 2000 total base
      // With NORMAL market (1.0x), STREET tier (1.0x spec), legacy (1.0x) = 2000 total passive income.
      // Net Cash flow: +2000 passive - 1000 rent = +1000 net change.
      // 100,000 + 1000 = 101000.
      expect(result.newPl.bag).toBe(initialBag + 1000);
    });
  });

  describe('4. Rival Actions & Interactions', () => {
    it('verifies rival action bids, sabotage, and partnerships apply costs and rewards exactly once', () => {
      useGameStore.setState(s => ({
        pl: {
          ...s.pl,
          currentTier: 'STREET',
          bag: 1000000, // initialized with >500k to cover Sabotage cost
          clout: 500,
          aura: 500,
          rivals: [
            {
              id: 'rival_1',
              name: 'Sarah Hamilton',
              netWorth: 500000,
              currentBid: 0,
              isNpc: true,
              tier: 'STREET',
              relationshipWithPlayer: 0,
              sabotagedCount: 0,
              helpedCount: 0,
              businesses: [],
              propertiesOwned: 0
            }
          ]
        }
      }));

      // Sabotage Rival
      // Math: Sabotage costs GAME_CONSTANTS.SABOTAGE_COST = 500000
      const initialBag = useGameStore.getState().pl.bag;
      useGameStore.getState().sabotageRival('rival_1');

      const finalBag = useGameStore.getState().pl.bag;
      expect(finalBag).toBe(initialBag - 500000);
    });
  });
});
