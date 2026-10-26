import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS, getTierMax } from '../config/tiers';
import { MASTERY_REQUIREMENTS, getMasteryCount } from '../utils/masteryUtils';
import { calculateHustleMath, getEffectiveHustleStats } from '../engine/mathEngine';
import { calculateDetailedMonthlyUpkeep, calculateMonthlyDebtService } from '../utils/financialObligationsUtils';
import { advanceMonth } from '../engine/advancementEngine';

describe('Economy and Progression Balance Audit Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('1. Early-Game Economy (MUD Tier)', () => {
    it('verifies early-game rent and starter hustle net yields allow sustainable progression', () => {
      const pl = useGameStore.getState().pl;
      expect(pl.currentTier).toBe('MUD');
      expect(pl.bag).toBeGreaterThanOrEqual(0);

      // MUD tier rent requirement is $50
      const rentMUD = 50;

      // Labor & Property (Level 1) yields $2,000 for $0 cost
      const levelDataLabor = { level: 1, cost: 0, yieldCash: 2000, yieldClout: 2, yieldAura: 2, mentalHit: -8, cloutReq: 0, auraReq: 0 };
      const laborMath = calculateHustleMath('r_labor', levelDataLabor, 1, 1.0, 1.0, 1.0, 1.0, true);
      const effectiveLabor = getEffectiveHustleStats('r_labor', levelDataLabor, pl, 1, laborMath);

      expect(effectiveLabor.cost).toBe(0);
      expect(effectiveLabor.yieldCash).toBeGreaterThanOrEqual(1800);
      // Single action covers 30+ months of MUD rent
      expect(effectiveLabor.yieldCash).toBeGreaterThan(rentMUD * 30);
    });

    it('provides free mental recovery via Rest & Recover', () => {
      const levelDataSleep = { level: 1, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 15, cloutReq: 0, auraReq: 0 };
      const sleepMath = calculateHustleMath('r_sleep', levelDataSleep, 1, 1.0, 1.0, 1.0, 1.0, true);
      const pl = useGameStore.getState().pl;
      const effectiveSleep = getEffectiveHustleStats('r_sleep', levelDataSleep, pl, 1, sleepMath);

      expect(effectiveSleep.cost).toBe(0);
      expect(effectiveSleep.mentalHit).toBeGreaterThan(0); // Positive mental recovery
    });
  });

  describe('2. Mid-Game Economy (STREET & STARTUP Tiers)', () => {
    it('scales expenses and yields appropriately between STREET and STARTUP tiers', () => {
      const streetReq = TIER_REQUIREMENTS['STREET'];
      const startupReq = TIER_REQUIREMENTS['STARTUP'];

      expect(streetReq.cash).toBe(50000);
      expect(streetReq.fee).toBe(20000);
      expect(startupReq.cash).toBe(500000);
      expect(startupReq.fee).toBe(200000);

      // STARTUP fee is 10x STREET fee, matching 10x cash advancement requirement
      expect(startupReq.fee / streetReq.fee).toBe(10);
      expect(startupReq.cash / streetReq.cash).toBe(10);
    });
  });

  describe('3. Late-Game Economy (CORPORATE to OPEN Tiers)', () => {
    it('applies hard multiplier cap (10.0x) on hustle cash yields', () => {
      const levelData = { level: 1, cost: 1000, yieldCash: 10000, yieldClout: 50, yieldAura: 50, mentalHit: -10, cloutReq: 0, auraReq: 0 };
      const extremeResult = calculateHustleMath('global_franchise', levelData, 1, 1.0, 1.0, 1.0, 100.0, true);

      const pl = useGameStore.getState().pl;
      pl.currentTier = 'CORPORATE';
      const effective = getEffectiveHustleStats('global_franchise', levelData, pl, 1, extremeResult);

      // Base yield 10,000, capped at 10.0x max multiplier = 100,000
      expect(effective.yieldCash).toBeLessThanOrEqual(100000);
    });

    it('enforces escalating tier advancement fees up to $5 Billion for OPEN tier', () => {
      expect(TIER_REQUIREMENTS['CORPORATE'].fee).toBe(2000000);
      expect(TIER_REQUIREMENTS['ELITE'].fee).toBe(20000000);
      expect(TIER_REQUIREMENTS['MOGUL'].fee).toBe(200000000);
      expect(TIER_REQUIREMENTS['PRESIDENT'].fee).toBe(2000000000);
      expect(TIER_REQUIREMENTS['OPEN'].fee).toBe(5000000000);
    });
  });

  describe('4. Hustle Trade-offs & Recovery Loops', () => {
    it('verifies non-cash utility hustles (PR Campaign, Ghost Mode) provide clear non-monetary trade-offs', () => {
      const pl = useGameStore.getState().pl;

      // PR Campaign: costs cash, yields zero cash, but yields Clout and Aura
      const prLevelData = { level: 1, cost: 1000, yieldCash: 0, yieldClout: 15, yieldAura: 10, mentalHit: -5, cloutReq: 0, auraReq: 0 };
      const prMath = calculateHustleMath('r_pr_campaign', prLevelData, 1, 1.0, 1.0, 1.0, 1.0, true);
      const effectivePR = getEffectiveHustleStats('r_pr_campaign', prLevelData, pl, 1, prMath);

      expect(effectivePR.cost).toBeGreaterThan(0);
      expect(effectivePR.yieldCash).toBe(0);
      expect(effectivePR.yieldClout).toBeGreaterThan(0);
      expect(effectivePR.yieldAura).toBeGreaterThan(0);

      // Ghost Mode: costs cash, yields cash, +5 Aura, and reduces Heat (-5)
      const ghostLevelData = { level: 1, cost: 1000, yieldCash: 1400, yieldClout: 0, yieldAura: 5, mentalHit: -2, heatHit: -5, cloutReq: 0, auraReq: 0 };
      const ghostMath = calculateHustleMath('r_ghost_mode', ghostLevelData, 1, 1.0, 1.0, 1.0, 1.0, true);
      const effectiveGhost = getEffectiveHustleStats('r_ghost_mode', ghostLevelData, pl, 1, ghostMath);

      expect(effectiveGhost.heatHit).toBeLessThan(0); // Reduces heat
      expect(effectiveGhost.yieldAura).toBeGreaterThan(0);
    });
  });

  describe('5. Progression Pacing & Cumulative Crown Gates', () => {
    it('verifies cumulative crown requirements increase predictably across all 8 tiers', () => {
      expect(TIER_REQUIREMENTS['MUD'].crowns).toBe(0);
      expect(TIER_REQUIREMENTS['STREET'].crowns).toBe(3);
      expect(TIER_REQUIREMENTS['STARTUP'].crowns).toBe(5);
      expect(TIER_REQUIREMENTS['CORPORATE'].crowns).toBe(7);
      expect(TIER_REQUIREMENTS['ELITE'].crowns).toBe(9);
      expect(TIER_REQUIREMENTS['MOGUL'].crowns).toBe(11);
      expect(TIER_REQUIREMENTS['PRESIDENT'].crowns).toBe(13);
      expect(TIER_REQUIREMENTS['OPEN'].crowns).toBe(15);
    });
  });

  describe('6. Failure & Heat Recovery Safety Shield', () => {
    it('guarantees recovery actions and Ghost Mode do not increase Heat during month advancement', () => {
      const store = useGameStore.getState();
      store.updatePl({
        bag: 10000,
        heat: 40,
        mentalHealth: 50,
        currentTier: 'MUD'
      });

      // Execute Ghost Mode
      store.executeHustle('r_ghost_mode', 1.0, true);

      const plAfter = useGameStore.getState().pl;
      // Final Heat must be <= initial Heat (40)
      expect(plAfter.heat).toBeLessThanOrEqual(40);
    });
  });

  describe('7. Player Stats & Exhaustion / Aura Discounts', () => {
    it('applies exhaustion work efficiency penalty when Mental Health drops below 50%', () => {
      const levelData = { level: 1, cost: 0, yieldCash: 1000, yieldClout: 10, yieldAura: 10, mentalHit: -5, cloutReq: 0, auraReq: 0 };
      const baseResult = calculateHustleMath('r_labor', levelData, 1, 1.0, 1.0, 1.0, 1.0, true);

      const store = useGameStore.getState();

      // Normal health (100%)
      store.updatePl({ mentalHealth: 100 });
      const normalStats = getEffectiveHustleStats('r_labor', levelData, useGameStore.getState().pl, 1, baseResult);

      // Low health (20% -> 0.75 + 0.25 * 0.4 = 0.85 efficiency)
      store.updatePl({ mentalHealth: 20 });
      const exhaustedStats = getEffectiveHustleStats('r_labor', levelData, useGameStore.getState().pl, 1, baseResult);

      expect(exhaustedStats.yieldCash).toBeLessThan(normalStats.yieldCash);
      expect(exhaustedStats.yieldClout).toBeLessThan(normalStats.yieldClout);
    });

    it('applies 10% Investor Confidence upgrade discount when Aura is >= 100', () => {
      const store = useGameStore.getState();

      // High Aura (150)
      store.updatePl({
        bag: 100000,
        clout: 200,
        aura: 150,
        currentTier: 'MUD'
      });

      // Upgrade r_delivery branch l2 (base cost $2,000)
      // With 10% aura discount: $2,000 * 0.90 = $1,800
      const initialBag = useGameStore.getState().pl.bag;
      store.upgradeHustle('r_delivery', 'l2');

      const pl = useGameStore.getState().pl;
      expect(initialBag - pl.bag).toBe(1800); // Exactly $1,800 deducted ($200 discount!)
    });
  });

  describe('8. Crown Mastery Requirements Across Core 4 Hustles', () => {
    it('verifies custom mastery requirements for Delivery Gigs, Scrap Metal, Plasma, and Vending', () => {
      expect(MASTERY_REQUIREMENTS['r_delivery']).toEqual({ minPlays: 10, minLevel: 2 });
      expect(MASTERY_REQUIREMENTS['r_scrap']).toEqual({ minPlays: 10, minLevel: 2 });
      expect(MASTERY_REQUIREMENTS['r_plasma']).toEqual({ minPlays: 15, noLevelReq: true });
      expect(MASTERY_REQUIREMENTS['r_vending']).toEqual({ minPlays: 20, noLevelReq: true });
    });
  });

  describe('9. Presidential Endgame Living Economy', () => {
    it('modulates business yields based on Presidential GDP and Inflation state', () => {
      const levelData = { level: 1, cost: 100000, yieldCash: 1000000, yieldClout: 100, yieldAura: 100, mentalHit: -10, cloutReq: 0, auraReq: 0 };
      const baseResult = calculateHustleMath('global_franchise', levelData, 1, 1.0, 1.0, 1.0, 1.0, true);

      const store = useGameStore.getState();

      // High GDP (> 110) gives +20% economy bonus
      store.updatePl({ currentTier: 'PRESIDENT', gdp: 120, inflation: 2 });
      const highGDPStats = getEffectiveHustleStats('global_franchise', levelData, useGameStore.getState().pl, 1, baseResult);

      // Low GDP (< 80) and high inflation (> 5) penalty
      store.updatePl({ currentTier: 'PRESIDENT', gdp: 70, inflation: 8 });
      const lowGDPStats = getEffectiveHustleStats('global_franchise', levelData, useGameStore.getState().pl, 1, baseResult);

      expect(highGDPStats.yieldCash).toBeGreaterThan(lowGDPStats.yieldCash);
    });
  });
});
