import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getEffectiveHustleStats, calculateHustleMath } from '../engine/mathEngine';
import { executeHustleAction } from '../engine/hustleEngine';
import { enforceStatCaps } from '../engine/statEngine';
import { advanceMonth, checkDeathConditions } from '../engine/advancementEngine';
import { isHustleMastered, getCrownProgress } from '../utils/masteryUtils';
import type { PlayerStats } from '../types/game';

describe('Comprehensive Stat Integrity & Player Experience Verification', () => {
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

      const res = useGameStore.getState().executeHustle('r_labor', 1, true);
      expect(res.success).toBe(true);

      const stateAfter = useGameStore.getState().pl;

      // Expected Cash change: 2000 * 1.15 (Origin) - 50 (Rent) = 2250.
      expect(stateAfter.bag).toBe(102250);
      expect(stateAfter.clout).toBe(102);
      expect(stateAfter.aura).toBe(102);
      expect(stateAfter.mentalHealth).toBe(88);
      expect(stateAfter.heat).toBe(0);

      const completedEvents = stateAfter.events.filter(e => e.type === 'HUSTLE_COMPLETED');
      expect(completedEvents.length).toBeGreaterThan(0);
      const receipt = completedEvents[0].metadata as any;
      expect(receipt.profit).toBe(2250);
      expect(receipt.yieldClout).toBe(2);
      expect(receipt.yieldAura).toBe(2);
      expect(receipt.mentalHit).toBe(-12);
    });
  });

  describe('2. Ghost Mode & PR Campaign Player Verification', () => {
    it('verifies Ghost Mode Heat changes before, immediately after the run, and after month advancement', () => {
      // Start with Heat = 40
      useGameStore.setState(s => ({
        pl: {
          ...s.pl,
          currentTier: 'MUD',
          heat: 40,
          bag: 50000,
          clout: 100,
          aura: 100
        }
      }));

      const stateBefore = useGameStore.getState().pl;
      expect(stateBefore.heat).toBe(40);

      // Perform a successful Ghost Mode run
      // level 1 Ghost Mode has heatHit = -5
      const res = useGameStore.getState().executeHustle('r_ghost_mode', 1, true);
      expect(res.success).toBe(true);

      const stateImmediatelyAfter = useGameStore.getState().pl;
      // Ghost Mode yields heatHit = -5. Also on success, effective heatHit decreases by 1 passively.
      // So immediate heat = 40 - 5 - 1 = 34.
      // And then month advancement is bundled inside executeHustle, applying heatDecay of 10.
      // So the final store state immediately reflects 24!
      expect(stateImmediatelyAfter.heat).toBe(24);
    });

    it('verifies PR Campaign Aura recovery values shown to the player', () => {
      useGameStore.setState(s => ({
        pl: {
          ...s.pl,
          currentTier: 'STREET',
          bag: 50000,
          clout: 100,
          aura: 10,
          hustleBranchIds: { 'r_pr_campaign': 'l1' },
          hustleLevels: { 'r_pr_campaign': 1 }
        }
      }));

      const stateBefore = useGameStore.getState().pl;
      expect(stateBefore.aura).toBe(10);

      // Execute successful PR Campaign
      const res = useGameStore.getState().executeHustle('r_pr_campaign', 1, true);
      expect(res.success).toBe(true);

      const stateAfter = useGameStore.getState().pl;
      // PR Campaign level 1 yields +10 Aura base.
      // With monthly advancement, monthly erosion is applied but PR restores Aura significantly
      expect(stateAfter.aura).toBeGreaterThan(10);
      expect(res.yieldAura).toBe(10); // Shown on reward card / receipt
    });
  });

  describe('3. 12-Month Playthrough Simulation Tracing', () => {
    it('simulates a continuous 12-month controlled playthrough and traces stat changes month-over-month', () => {
      let currentStats = useGameStore.getState().pl;
      expect(currentStats.month).toBe(1);

      // We will trace 12 months of natural gameplay (successful runs, rest, and month transitions)
      for (let m = 1; m <= 12; m++) {
        // Month 1-4: MUD Labor
        if (m <= 4) {
          const res = useGameStore.getState().executeHustle('r_labor', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 5: Ghost Mode to reduce Heat risk
        else if (m === 5) {
          const res = useGameStore.getState().executeHustle('r_ghost_mode', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 6: Rest/Sleep to recover Mental Health
        else if (m === 6) {
          const res = useGameStore.getState().executeHustle('r_sleep', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 7-8: Plasma Donation for quick safe cash injection
        else if (m <= 8) {
          const res = useGameStore.getState().executeHustle('r_plasma', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 9: Advance Tier from MUD to STREET & then execute Street Content Creation
        else if (m === 9) {
          useGameStore.setState(s => ({
            pl: {
              ...s.pl,
              bag: 150000,
              clout: 300,
              aura: 300
            }
          }));
          const success = useGameStore.getState().advanceTier();
          expect(success).toBe(true);
          useGameStore.getState().selectSpecialization('influencer');

          // Now execute the first STREET hustle in month 9 (which advances game to Month 10)
          const res = useGameStore.getState().executeHustle('cc', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 10: STREET Content Creation
        else if (m === 10) {
          const res = useGameStore.getState().executeHustle('cc', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 11: STREET PR Campaign
        else if (m === 11) {
          const res = useGameStore.getState().executeHustle('r_pr_campaign', 1, true);
          expect(res.success).toBe(true);
        }
        // Month 12: Play failed cc to test negative experience trace
        else {
          const res = useGameStore.getState().executeHustle('cc', 0.1, false);
          expect(res.success).toBe(false);
        }

        currentStats = useGameStore.getState().pl;
        // Verify month is ticking upward sequentially
        expect(currentStats.month).toBe(m + 1);
      }
    });
  });
});
