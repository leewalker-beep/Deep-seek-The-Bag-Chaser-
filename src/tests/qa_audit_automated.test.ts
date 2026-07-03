import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHustleSlice } from '../store/slices/hustleSlice';
import { getInitialStats } from '../store/initialState';
import { advanceMonth, checkDeathConditions } from '../engine/advancementEngine';
import { enforceStatCaps } from '../engine/statEngine';
import { HUSTLES } from '../config/hustles/base';
import { TIER_REQUIREMENTS } from '../config/tiers';

// Mock dependencies
vi.mock('../components/effects/Confetti', () => ({
  showConfetti: vi.fn(),
}));

vi.mock('../utils/saveUtils', () => ({
  backupSave: vi.fn(),
}));

describe('Deep-Dive Automated Audit', () => {
  let store: any;
  const mockSet = (fn: any) => {
    const next = typeof fn === 'function' ? fn(store) : fn;
    Object.assign(store, next);
  };
  const mockGet = () => store;

  beforeEach(() => {
    const initialState: any = {
      pl: getInitialStats(3, 'street_kid'),
      currentMarket: 'NORMAL',
      news: [],
      ph: 'PLAYING',
      deathBadge: null,
      fatalCause: null,
      difficulty: 3,
      addTickerMessage: vi.fn(),
      logEvent: vi.fn(),
      logAction: vi.fn(),
      checkMilestones: vi.fn(),
      unlockAchievement: vi.fn(),
      setActiveTab: vi.fn(),
      updateChallengeProgress: vi.fn(),
      unlockedLegacyUpgradeIds: [],
      achievements: [],
    };
    store = initialState;
    const slice = createHustleSlice(mockSet, mockGet, {} as any);
    Object.assign(store, slice);
  });

  describe('Stat Clamping and Boundary Tests', () => {
    it('should never allow clout or aura to exceed tier caps', () => {
      const pl = store.pl;
      pl.clout = 1000000;
      pl.aura = 1000000;
      pl.currentTier = 'MUD';

      const capped = enforceStatCaps(pl);
      // MUD cap is usually around 500-1000 depending on config, but definitely not 1M
      expect(capped.clout).toBeLessThan(1000000);
      expect(capped.aura).toBeLessThan(1000000);
    });

    it('should never allow negative mental health or heat', () => {
      const pl = store.pl;
      pl.mentalHealth = -50;
      pl.heat = -20;

      const capped = enforceStatCaps(pl);
      expect(capped.mentalHealth).toBe(0);
      expect(capped.heat).toBe(0);
    });

    it('should convert excess clout/aura to bag bonus', () => {
      const pl = store.pl;
      pl.currentTier = 'MUD';
      pl.clout = 5000; // Far above MUD cap
      const initialBag = pl.bag;

      const capped = enforceStatCaps(pl);
      expect(capped.bag).toBeGreaterThan(initialBag);
    });
  });

  describe('Death and Game Over Logic', () => {
    it('should trigger death when bag is negative after month advancement', () => {
      const pl = store.pl;
      pl.isTutorialSkipped = true;
      pl.tutorialStep = 10;
      pl.bag = 10;
      pl.clout = 100; // Prevent clout death
      pl.aura = 100;  // Prevent aura death
      pl.currentTier = 'STREET'; // Rent is 1000

      const result = advanceMonth(pl, 'NORMAL');
      expect(result.newPl.bag).toBeLessThan(0);
      expect(result.shouldDie).toBe(true);
      expect(result.deathCause).toContain('Bankruptcy');
    });

    it('should NOT trigger death during tutorial (Mental Health 0)', () => {
      const pl = store.pl;
      pl.isTutorialSkipped = false;
      pl.tutorialStep = 2;
      pl.mentalHealth = 0;

      const deathResult = checkDeathConditions(pl);
      expect(deathResult.shouldDie).toBe(false);
    });

    it('should trigger death when mental health hits 0 post-tutorial', () => {
      const pl = store.pl;
      pl.isTutorialSkipped = true;
      pl.tutorialStep = 10;
      pl.mentalHealth = 0;

      const deathResult = checkDeathConditions(pl);
      expect(deathResult.shouldDie).toBe(true);
      expect(deathResult.deathCause).toContain('Burnout');
    });
  });

  describe('Jail System Audit', () => {
    it('should incarcerate player when heat hits 100', () => {
      const pl = store.pl;
      pl.heat = 100;
      pl.isTutorialSkipped = true;
      pl.tutorialStep = 10;

      const result = advanceMonth(pl, 'NORMAL');
      expect(result.newPl.inJail).toBe(true);
      expect(result.newPl.heat).toBe(0); // Heat resets on arrest
    });

    it('should apply monthly penalties while in jail', () => {
      const pl = store.pl;
      pl.inJail = true;
      pl.jailMonthsRemaining = 5;
      pl.currentTier = 'STREET';
      pl.bag = 10000;
      pl.clout = 100;

      const result = advanceMonth(pl, 'NORMAL');
      // STREET sentence: bagLoss=2000, cloutLoss=5. Rent=1000.
      expect(result.newPl.bag).toBe(7000); // 10000 - 2000 - 1000
      expect(result.newPl.clout).toBe(95);
      expect(result.newPl.jailMonthsRemaining).toBe(4);
    });

    it('should release player when sentence ends', () => {
      const pl = store.pl;
      pl.inJail = true;
      pl.jailMonthsRemaining = 1;

      const result = advanceMonth(pl, 'NORMAL');
      expect(result.newPl.inJail).toBe(false);
      expect(result.newPl.jailMonthsRemaining).toBe(0);
    });
  });

  describe('Hustle Verification', () => {
    it('should allow executing all MUD hustles', () => {
      const mudHustles = Object.values(HUSTLES).filter(h => h.tier === 'MUD');
      mudHustles.forEach(h => {
        store.pl = getInitialStats(3, 'street_kid'); // Reset for each
        store.pl.bag = 100000; // Give plenty of cash
        store.pl.clout = 1000; // Give plenty of clout
        store.pl.aura = 1000;  // Give plenty of aura
        store.pl.achievements = []; // Fix for mock
        const result = store.executeHustle(h.id, 1, true);
        if (!result.success) {
          console.log(`Failed MUD hustle: ${h.id} - ${result.message}`);
        }
        expect(result.success, `Failed to execute ${h.id}: ${result.message}`).toBe(true);
      });
    });

    it('should block higher tier hustles if player is lower tier', () => {
      const pl = store.pl;
      pl.currentTier = 'MUD';
      const result = store.executeHustle('cc', 1, true); // cc is STREET
      expect(result.success).toBe(false);
      expect(result.message).toContain('locked');
    });
  });

  describe('Economy and Passive Income', () => {
    it('should correctly sum passive income from multiple sources', () => {
      const pl = store.pl;
      pl.vendingCount = 2; // 150 each = 300
      pl.hustleBranchIds = { 'r_vending': 'vending' };
      pl.hustleLevels = { 'r_vending': 1 };
      pl.dynamicPassives = { 'test_hustle': 1000 };
      pl.currentTier = 'MUD';
      pl.bag = 0;

      const result = advanceMonth(pl, 'NORMAL');
      // baseTotal = 300 + 1000 = 1300.
      // Multipliers: Legacy (1.0), Market (1.0), Spec (1.0). Total = 1300.
      // Rent for MUD = 200.
      // Net = 1300 - 200 = 1100.
      expect(result.passiveIncome).toBe(1300);
      expect(result.newPl.bag).toBe(1100);
    });

    it('should apply market multipliers to passive income', () => {
      const pl = store.pl;
      pl.dynamicPassives = { 'test': 1000 };

      const resultBull = advanceMonth(pl, 'BULL_MARKET'); // Bull usually > 1.0
      const resultRecession = advanceMonth(pl, 'RECESSION'); // Recession < 1.0

      expect(resultBull.passiveIncome).toBeGreaterThan(resultRecession.passiveIncome);
    });
  });
});
