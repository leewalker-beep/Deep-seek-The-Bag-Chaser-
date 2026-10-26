import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { calculateHustleMath, getEffectiveHustleStats, getLegacyBonus, LEVEL_MULTIPLIERS } from '../engine/mathEngine';
import { enforceStatCaps } from '../engine/statEngine';
import { advanceMonth, checkDeathConditions } from '../engine/advancementEngine';
import { calculateDetailedMonthlyUpkeep, calculateMonthlyDebtService } from '../utils/financialObligationsUtils';
import { getMasteryCount } from '../utils/masteryUtils';
import { TIER_REQUIREMENTS, getTierMax } from '../config/tiers';

describe('Gameplay Mathematics Audit & Boundary Verification Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('1. Core Financial & Hustle Reward Math', () => {
    it('applies level multipliers correctly based on currentLevel', () => {
      expect(LEVEL_MULTIPLIERS[1]).toBe(1.0);
      expect(LEVEL_MULTIPLIERS[2]).toBe(2.0);
      expect(LEVEL_MULTIPLIERS[3]).toBe(3.5);
      expect(LEVEL_MULTIPLIERS[4]).toBe(5.0);
    });

    it('preserves zero minigame score as zero yield without NaN or division-by-zero errors', () => {
      const levelData = {
        level: 1, cost: 100, yieldCash: 2000, yieldClout: 10, yieldAura: 5, mentalHit: -5, cloutReq: 0, auraReq: 0
      };

      const result = calculateHustleMath('r_labor', levelData, 1, 1.0, 1.0, 1.0, 0, true);
      expect(result.yieldCash).toBe(0);
      expect(result.minigameMult).toBe(0);

      const pl = useGameStore.getState().pl;
      const effective = getEffectiveHustleStats('r_labor', levelData, pl, 1, result);
      expect(effective.yieldCash).toBe(0);
      expect(Number.isNaN(effective.yieldCash)).toBe(false);
    });

    it('caps maximum cash yield multiplier at 10.0x to prevent mathematical runaway', () => {
      const levelData = {
        level: 1, cost: 100, yieldCash: 1000, yieldClout: 10, yieldAura: 5, mentalHit: -5, cloutReq: 0, auraReq: 0
      };

      // Pass an extreme 50.0x minigame multiplier
      const result = calculateHustleMath('r_labor', levelData, 1, 1.0, 1.0, 1.0, 50.0, true);
      const pl = useGameStore.getState().pl;
      const effective = getEffectiveHustleStats('r_labor', levelData, pl, 1, result);

      // Base yield is 1000, capped at 10.0x max multiplier = 10000
      expect(effective.yieldCash).toBeLessThanOrEqual(10000);
    });

    it('calculates legacy bonus smoothly with linear scaling and 2.0x max cap', () => {
      expect(getLegacyBonus(0)).toBe(0);
      expect(getLegacyBonus(500)).toBe(0.5);
      expect(getLegacyBonus(1000)).toBe(1.0);
      expect(getLegacyBonus(2000)).toBe(2.0);
      expect(getLegacyBonus(5000)).toBe(2.0); // Capped at 2.0
    });
  });

  describe('2. Player Stat Limits, Clamping, and Overflow Bonus', () => {
    it('enforces tier maximums for Clout and Aura and converts excess into overflow cash bonus', () => {
      const store = useGameStore.getState();
      const maxMUD = getTierMax('MUD'); // Clout: 300, Aura: 300

      store.updatePl({
        bag: 1000,
        clout: maxMUD.clout + 40, // 40 excess
        aura: maxMUD.aura + 20,   // 20 excess
        currentTier: 'MUD'
      });

      const pl = useGameStore.getState().pl;
      const clamped = enforceStatCaps(pl);

      expect(clamped.clout).toBe(maxMUD.clout);
      expect(clamped.aura).toBe(maxMUD.aura);
      // Excess clout + aura = 40 + 20 = 60. 10% overflow bonus = 6.
      expect(clamped.bag).toBe(1006);
    });

    it('clamps Mental Health and Heat within 0 to 100 bounds', () => {
      const pl = useGameStore.getState().pl;
      pl.mentalHealth = 150;
      pl.heat = -20;

      const clamped = enforceStatCaps(pl);
      expect(clamped.mentalHealth).toBe(100);
      expect(clamped.heat).toBe(0);
    });
  });

  describe('3. Monthly Financial Obligations & Bankruptcy Mechanics', () => {
    it('calculates monthly upkeep and debt obligations accurately', () => {
      const pl = useGameStore.getState().pl;
      pl.narrativeFlags = { upkeep_active: true };
      pl.rentalCount = 2; // 2 * $300 = $600
      pl.rentPortfolioCount = 1; // 1 * $1500 = $1500
      pl.hustleLevels = { cc: 2 }; // STREET tier level 2 = 2 * $100 = $200

      const upkeep = calculateDetailedMonthlyUpkeep(pl);
      expect(upkeep.propertyUpkeep).toBe(2100);
      expect(upkeep.businessUpkeep).toBe(200);
      expect(upkeep.total).toBe(2300);

      pl.financialDebts = [
        { id: 'debt_1', principal: 10000, monthlyPayment: 500, remainingTerm: 12, interestRate: 0.05, loanType: 'Bank' }
      ];
      expect(calculateMonthlyDebtService(pl)).toBe(500);
    });

    it('triggers liquidity crunch when cash balance drops to or below zero after deductions', () => {
      const store = useGameStore.getState();
      store.updatePl({
        bag: 10,
        currentTier: 'MUD', // Rent is $50
        mentalHealth: 50,
        heat: 10
      });

      const pl = useGameStore.getState().pl;
      const currentMarket = store.currentMarket;

      const advancement = advanceMonth(pl, currentMarket);
      expect(advancement.newPl.bag).toBe(0);
      // 10 heat - 10 monthly decay + 5 liquidity crunch penalty = 5
      expect(advancement.newPl.heat).toBe(5);
      expect(advancement.newPl.mentalHealth).toBe(45); // -5 Mental Health penalty
      expect(advancement.newPl.narrativeFlags?.had_bankruptcy_crisis).toBe(true);
    });

    it('evaluates death conditions correctly for zero mental health and bankruptcy', () => {
      const pl = useGameStore.getState().pl;

      // Normal state
      expect(checkDeathConditions(pl).shouldDie).toBe(false);

      // Zero mental health
      pl.mentalHealth = 0;
      const mentalDeath = checkDeathConditions(pl);
      expect(mentalDeath.shouldDie).toBe(true);
      expect(mentalDeath.fatalStat).toBe('mental');

      // Bankruptcy
      pl.mentalHealth = 50;
      pl.bag = -100;
      const bankDeath = checkDeathConditions(pl);
      expect(bankDeath.shouldDie).toBe(true);
      expect(bankDeath.fatalStat).toBe('bag');
    });
  });

  describe('4. Flex Assets and Asset Purchase Math', () => {
    it('validates bag balance before purchasing flex asset and deducts cost accurately', () => {
      const store = useGameStore.getState();
      store.updatePl({ bag: 50000 }); // Luxury Watch costs $10,000

      const success = store.purchaseFlexAsset('watch');
      expect(success).toBe(true);

      const updatedPl = useGameStore.getState().pl;
      expect(updatedPl.bag).toBe(40000);
      expect(updatedPl.flexAssets['watch']).toBe(1);
    });

    it('blocks flex asset purchase if player cannot afford cost', () => {
      const store = useGameStore.getState();
      store.updatePl({ bag: 1000 });

      const success = store.purchaseFlexAsset('watch');
      expect(success).toBe(false);

      const updatedPl = useGameStore.getState().pl;
      expect(updatedPl.bag).toBe(1000);
      expect(updatedPl.flexAssets['watch'] || 0).toBe(0);
    });
  });

  describe('5. Career Tier Advancement Requirements & Specialization Tax Math', () => {
    it('enforces all four requirements (Cash, Clout, Aura, Crowns) for tier advancement', () => {
      const store = useGameStore.getState();

      store.updatePl({
        bag: 100000,
        clout: 200,
        aura: 200,
        isTutorialSkipped: true,
        hustlePlays: { r_delivery: 10, r_plasma: 15 },
        hustleBranchIds: { r_delivery: 'l2' },
        hustleLevels: { r_delivery: 2 },
        masteredHustles: ['r_delivery', 'r_plasma'] // Only 2 crowns
      });

      const canAdvance = useGameStore.getState().advanceTier();
      expect(canAdvance).toBe(false); // Fails because 2/3 crowns

      store.updatePl({
        hustlePlays: { r_delivery: 10, r_plasma: 15, r_scrap: 10 },
        hustleBranchIds: { r_delivery: 'l2', r_scrap: 'l2' },
        hustleLevels: { r_delivery: 2, r_scrap: 2 },
        masteredHustles: ['r_delivery', 'r_plasma', 'r_scrap'] // 3 crowns
      });

      const currentPl = useGameStore.getState().pl;
      expect(getMasteryCount(currentPl)).toBeGreaterThanOrEqual(3);
      const canAdvanceWith3Crowns = useGameStore.getState().advanceTier();
      expect(canAdvanceWith3Crowns).toBe(true);
    });

    it('deducts specialization filing fee and applies clout/aura tax when advancing tier', () => {
      const store = useGameStore.getState();
      store.updatePl({
        bag: 100000,
        clout: 200,
        aura: 200,
        currentTier: 'MUD',
        isTutorialSkipped: true,
        hustlePlays: { r_delivery: 10, r_plasma: 15, r_scrap: 10 },
        hustleBranchIds: { r_delivery: 'l2', r_scrap: 'l2' },
        hustleLevels: { r_delivery: 2, r_scrap: 2 },
        masteredHustles: ['r_delivery', 'r_plasma', 'r_scrap']
      });

      useGameStore.getState().advanceTier();
      // Select 'influencer' specialization (STREET filing fee $20,000, clout tax 0.9, aura tax 0.5)
      useGameStore.getState().selectSpecialization('influencer');

      const pl = useGameStore.getState().pl;
      expect(pl.currentTier).toBe('STREET');
      // $100,000 - $20,000 fee + $1,000 tier promotion world reaction bonus = $81,000
      expect(pl.bag).toBe(81000);
      expect(pl.activeSpecializationId).toBe('influencer');
    });
  });
});
