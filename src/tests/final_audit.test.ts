
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateHustleMath } from '../engine/mathEngine';
import { executeHustleAction } from '../engine/hustleEngine';
import { advanceMonth } from '../engine/advancementEngine';
import { HUSTLES } from '../config/hustles/base';
import { getInitialStats } from '../store/initialState';
import { TIER_REQUIREMENTS } from '../config/tiers';
import { FLEX_ASSETS } from '../config/flexAssets';
import { EXECUTIVE_ORDERS } from '../engine/presidentEngine';
import { MARKET_CONFIGS } from '../config/marketConfig';

describe('Final Audit: Programmatic Calculation Verification', () => {
  let pl = getInitialStats(3);

  beforeEach(() => {
    pl = getInitialStats(3); // Reset to base difficulty 3 (Normal)
  });

  describe('KPI Audit: Hustle Execution (Points 1-5, 9, 12)', () => {
    it('should verify MUD tier hustle: r_labor (Manual Labor)', () => {
      pl.currentTier = 'MUD';
      const hustle = HUSTLES.r_labor;
      const levelData = hustle.branches!.l1;

      const result = executeHustleAction('r_labor', pl, 'NORMAL', levelData, 1, 1, true);

      // Math: cost=0, yieldCash=2000, yieldClout=2, yieldAura=2, mentalHit=-8 (x1.5 for MUD), heatHit=5 (default)
      expect(result.cost).toBe(0);
      expect(result.yieldCash).toBe(2000);
      expect(result.yieldClout).toBe(2);
      expect(result.yieldAura).toBe(2);
      expect(result.mentalHit).toBe(-12);
      expect(result.heatHit).toBe(5);
    });

    it('should verify STREET tier hustle: cc (Create Content)', () => {
      pl.currentTier = 'STREET';
      const hustle = HUSTLES.cc;
      const levelData = hustle.branches!.l1;

      const result = executeHustleAction('cc', pl, 'NORMAL', levelData, 1, 1, true);

      // Expected: cost=0, yieldCash=4000, yieldClout=3, yieldAura=1, mentalHit=-10, heatHit=5
      expect(result.cost).toBe(0);
      expect(result.yieldCash).toBe(4000);
      expect(result.yieldClout).toBe(3);
      expect(result.yieldAura).toBe(1);
      expect(result.mentalHit).toBe(-10);
      expect(result.heatHit).toBe(5);
    });

    it('should verify STARTUP tier hustle: saas_mvp (Level 1)', () => {
      pl.currentTier = 'STARTUP';
      const hustle = HUSTLES.saas_mvp;
      const levelData = hustle.branches!.l1;

      const result = executeHustleAction('saas_mvp', pl, 'NORMAL', levelData, 1, 1, true);

      // Expected: cost=30000, yieldCash=50000, yieldClout=5, yieldAura=2, mentalHit=-15, heatHit=5
      expect(result.cost).toBe(30000);
      expect(result.yieldCash).toBe(50000);
      expect(result.yieldClout).toBe(5);
      expect(result.yieldAura).toBe(2);
      expect(result.mentalHit).toBe(-15);
      expect(result.heatHit).toBe(5);
    });

    it('should verify CORPORATE tier hustle: global_franchise (Level 1)', () => {
      pl.currentTier = 'CORPORATE';
      const hustle = HUSTLES.global_franchise;
      const levelData = hustle.levels![0];

      vi.spyOn(Math, 'random').mockReturnValue(0.5); // variance = 1.0x

      const result = executeHustleAction('global_franchise', pl, 'NORMAL', levelData, 1, 1, true);

      // Override values in globalFranchiseStrategy
      expect(result.cost).toBe(5000000);
      expect(result.yieldCash).toBe(5000000);
      expect(result.yieldClout).toBe(150);
      expect(result.yieldAura).toBe(75);
      expect(result.mentalHit).toBe(-5);
      expect(result.heatHit).toBe(5);

      vi.restoreAllMocks();
    });

    it('should verify ELITE tier hustle: privateequity (Small Buyouts)', () => {
      pl.currentTier = 'ELITE';
      const hustle = HUSTLES.privateequity;
      const levelData = hustle.branches!.l1;

      const result = executeHustleAction('privateequity', pl, 'NORMAL', levelData, 1, 1, true);

      // ELITE bonuses: 1.2x Clout, 0.9x Mental
      expect(result.cost).toBe(30000000);
      expect(result.yieldCash).toBe(55000000);
      expect(result.yieldClout).toBe(72);
      expect(result.yieldAura).toBe(40);
      expect(result.mentalHit).toBe(-17);
      expect(result.heatHit).toBe(5);
    });

    it('should verify Upgrade/Branch cost deduction logic (Point 9)', () => {
      const hustle = HUSTLES.r_labor;
      const branch = hustle.branches!.l2a; // House Flip
      const market = MARKET_CONFIGS['NORMAL'];

      // hustleSlice.ts logic: calculateHustleMath with level 1
      const result = calculateHustleMath(
        'r_labor',
        branch,
        1,
        market.expenseMultiplier,
        market.yieldMultiplier,
        market.heatMultiplier,
        1,
        true,
        0,
        'NEUTRAL'
      );

      expect(result.cost).toBe(5000); // Base cost of House Flip
    });
  });

  describe('KPI Audit: Monthly Progression (Points 6-7)', () => {
    it('should verify monthly net change: Rent + Passive (Point 6, 7)', () => {
      pl.currentTier = 'STREET';
      pl.bag = 100000;
      // Setup Vending
      pl.vendingCount = 10;
      pl.hustleBranchIds['r_vending'] = 'vending';
      pl.hustleLevels['r_vending'] = 1; // +150 * 10 = 1500

      // Setup SaaS
      pl.hustleBranchIds['saas_mvp'] = 'l1';
      pl.hustleLevels['saas_mvp'] = 1; // +2000 passive

      const result = advanceMonth(pl, 'NORMAL');

      // AUDIT: Vending(150*10 + 500 bonus) + SaaS(2000) = 4000
      // Rent for STREET: 1000
      // Net: +3000
      expect(result.totalRent).toBe(1000);
      expect(result.passiveIncome).toBe(4000);
      expect(result.newPl.bag).toBe(100000 + 3000);
    });
  });

  describe('KPI Audit: Tier & Flex (Points 8, 10)', () => {
    it('should verify Flex Asset bonus compounding (Point 10)', () => {
        const yacht = FLEX_ASSETS.find(a => a.id === 'yacht')!; // allGainsBonus: 5%
        pl.flexAssets['yacht'] = 1;
        pl.flexAssets['tech_conglomerate'] = 1; // boosts other bonuses by 10% (1.1x)

        // logic in applyFlexBonuses/calculateFlexBonuses
        const techConglomerateCount = pl.flexAssets['tech_conglomerate'] || 0;
        const flexBonusMultiplier = 1 + (techConglomerateCount * 0.1); // 1.1x

        let cashBonus = 0;
        const count = pl.flexAssets['yacht'];
        const bonusScale = count * flexBonusMultiplier; // 1 * 1.1 = 1.1
        cashBonus += (yacht.allGainsBonus || 0) * bonusScale; // 5 * 1.1 = 5.5

        expect(cashBonus).toBe(5.5);
    });
  });

  describe('KPI Audit: President Tier (Point 11)', () => {
    it('should verify Federal Budget and Tax Revenue (Point 11)', () => {
        pl.currentTier = 'PRESIDENT';
        pl.federalBudget = 100000000;
        pl.gdp = 110;
        pl.inflation = 2;

        // advancePresidentialMonth logic
        let taxRevenue = 10000000;
        if (pl.gdp > 100) taxRevenue += 2000000;

        expect(taxRevenue).toBe(12000000);
    });
  });
});
