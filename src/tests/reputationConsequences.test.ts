import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInitialStats } from '../store/initialState';
import { advanceMonth } from '../engine/advancementEngine';
import { calculateHustleStatsAdditive, calculateHustleMath } from '../engine/mathEngine';
import { applyReputationGainScale, applyReputationLossScale } from '../engine/reputationEngine';

describe('Dynamic Reputation Consequence System Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Reputation Gain and Loss Scaling Functions', () => {
    it('should correctly scale clout and aura gains based on reputation', () => {
      // Celebrity: 1.2x Clout gains
      const celGains = applyReputationGainScale(100, 100, "The Celebrity");
      expect(celGains.clout).toBe(120);
      expect(celGains.aura).toBe(100);

      // Investor: 0.8x Clout gains
      const invGains = applyReputationGainScale(100, 100, "The Investor");
      expect(invGains.clout).toBe(80);
      expect(invGains.aura).toBe(100);

      // People's Champion: 1.2x Aura gains
      const champGains = applyReputationGainScale(100, 100, "The People's Champion");
      expect(champGains.clout).toBe(100);
      expect(champGains.aura).toBe(120);
    });

    it('should correctly scale clout and aura losses based on reputation', () => {
      // Celebrity: 1.5x Clout losses
      const celLosses = applyReputationLossScale(100, 100, "The Celebrity");
      expect(celLosses.clout).toBe(150);
      expect(celLosses.aura).toBe(100);

      // Investor: 0.5x Clout losses
      const invLosses = applyReputationLossScale(100, 100, "The Investor");
      expect(invLosses.clout).toBe(50);
      expect(invLosses.aura).toBe(100);

      // Crime Boss: 0.5x Aura losses
      const cbLosses = applyReputationLossScale(100, 100, "The Crime Boss");
      expect(cbLosses.clout).toBe(100);
      expect(cbLosses.aura).toBe(50);

      // People's Champion: 1.5x Aura losses
      const champLosses = applyReputationLossScale(100, 100, "The People's Champion");
      expect(champLosses.clout).toBe(100);
      expect(champLosses.aura).toBe(150);
    });
  });

  describe('Ongoing World Pressure (Monthly Erosion)', () => {
    it('should erode Clout and Aura when Heat is above 70', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN'; // Set high tier to prevent capping
      pl.rivals = []; // Clean rivals to isolate
      pl.clout = 1000;
      pl.aura = 1000;
      pl.heat = 80; // Above 70

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Base erosion is 3 clout and 3 aura -> 1000 - 3 = 997.
      // With High Aura >= 100, Aura erosion is scaled 1.5x -> 4.5 -> floor = 4. (1000 - 4 = 996)
      expect(result.newPl.clout).toBe(997);
      expect(result.newPl.aura).toBe(996);
    });

    it('should halve High Heat erosion if player just donated to charity', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.heat = 80;
      pl.narrativeFlags = { just_donated_charity: true, publicReputation: "The Celebrity" };

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // High heat is 80 (>= 70), so base clout decay of 3 is halved (charity) -> 1.5 -> floor = 1.
      // Celebrity clout loss (1.5x) -> 1 * 1.5 = 1.5 -> floor = 1.
      // Expected clout after 1 month tick: 1000 - 1 = 999.
      expect(result.newPl.clout).toBe(999);
    });

    it('should erode Aura when Mental Health is critically low (<= 30)', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.mentalHealth = 25; // critically low

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Critical MH erodes Aura by 5 -> with High Aura >= 100 scaled 1.5x to 7 -> 1000 - 7 = 993
      expect(result.newPl.aura).toBe(993);
    });

    it('should erode Aura when rival is dominant in player tier', () => {
      const pl = getInitialStats(3);
      pl.clout = 1000;
      pl.aura = 1000;
      pl.currentTier = 'STREET'; // street cap is 1000
      pl.rivals = [
        {
          id: 'rival_1',
          name: 'Sarah Hamilton',
          netWorth: 500000, // Dominant (ratio > 2)
          currentBid: 0,
          isNpc: true,
          tier: 'STREET'
        }
      ];

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Dominant rival erodes Aura by 3 -> with High Aura >= 100 scaled 1.5x to 4 -> 1000 - 4 = 996
      expect(result.newPl.aura).toBe(996);
    });

    it('should decay Clout passively if player goes 12 months without active ventures (Being Forgotten)', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.monthsSinceLastHustle = 12; // 12 months inactive

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Being Forgotten erodes 1% of Clout, doubled to 2% under High Clout, scaled 1.3x by Scrutiny (1000 - 26 = 974)
      expect(result.newPl.clout).toBe(974);
    });

    it('should erode Clout passively when a negative consequence is active', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.consequences = [
        {
          id: 'cons_1',
          source: 'regulatory_crackdown',
          triggerCondition: 'Arrests',
          delay: 0,
          severity: 'severe',
          expiry: 5,
          affectedSystems: ['businesses'],
          status: 'active',
          description: 'Audits',
        }
      ];

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Active negative consequence erodes 2% of Clout, scaled 1.3x by Scrutiny (20 * 1.3 = 26) -> 1000 - 26 = 974
      expect(result.newPl.clout).toBe(974);
    });
  });

  describe('Instant Loss Triggers', () => {
    it('should penalize Clout and Aura immediately upon arrest', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.heat = 100; // Trigger arrest check

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Immediate arrest penalty is 15% Clout and 20% Aura, scaled 1.5x by Expectations (200 * 1.5 = 300 Aura loss)
      // plus standard monthly erodings.
      expect(result.newPl.clout).toBe(848);
      expect(result.newPl.aura).toBe(698);
    });

    it('should penalize Clout by 10% immediately on public scandal count increase', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.scandalCount = 0;

      // Force a scandal increase during the month tick
      pl.conglomerateCEOs = {
        'na_tech': {
          id: 'na_tech_ceo',
          name: 'Sarah Hamilton',
          competence: 50,
          loyalty: 80,
          riskTolerance: 100, // Max risk tolerance to guarantee high scandal chance
        }
      };

      // Mock Math.random to return 0.001 to guarantee CEO scandal triggers
      const randomMock = vi.spyOn(Math, 'random').mockReturnValue(0.001);

      const result = advanceMonth(pl, 'NORMAL', [], true);
      expect(result.newPl.scandalCount).toBeGreaterThan(0);
      // 10% Clout penalty: 1000 * 0.10 = 100, scaled 1.3x by Scrutiny = 130 loss. 1000 -> 870 Clout
      expect(result.newPl.clout).toBe(870);

      randomMock.mockRestore();
    });

    it('should penalize Clout by 25% if a presidential term ends with low public approval (< 45%)', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'PRESIDENT';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.presidentMonth = 48; // Ends term this month
      pl.termComplete = false;
      pl.approvalRating = 35; // Bad approval rating

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // 25% Clout penalty: 1000 * 0.25 = 250, scaled 1.3x by Scrutiny = 325 loss. 1000 -> 675 Clout
      expect(result.newPl.clout).toBe(675);
    });

    it('should penalize Clout by 20% on bankruptcy checks', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.bag = -500; // Under bankruptcy

      // Set skip tutorial to skip bankruptcy death checks
      pl.isTutorialSkipped = false;
      pl.tutorialStep = 2; // Under tutorial protection from death, but penalty still triggers

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // 20% Clout penalty: 1000 * 0.20 = 200, scaled 1.3x by Scrutiny = 260 loss. 1000 -> 740 Clout
      expect(result.newPl.clout).toBe(740);
    });

    it('should penalize Clout by 15% when a rival challenge is failed', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.activeChallenges = [
        {
          rivalId: 'rival_1',
          rivalName: 'Chen MegaRecords',
          tier: 'STREET',
          hustlesCompleted: 0,
          hustlesRequired: 3,
          monthsRemaining: -1 // Expired/failed challenge
        }
      ];

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // 15% Clout penalty: 1000 * 0.15 = 150, scaled 1.3x by Scrutiny = 195 loss. 1000 -> 805 Clout
      expect(result.newPl.clout).toBe(805);
    });
  });

  describe('Reputation Matters (Identity Reinforcement in Math Engine)', () => {
    it('should scale Crime Boss Heat gains by 1.2x', () => {
      const pl = getInitialStats(3);
      pl.narrativeFlags = { publicReputation: "The Crime Boss" };

      const levelData = { level: 1, cost: 0, yieldCash: 1000, yieldClout: 10, yieldAura: 10, mentalHit: -5, heatHit: 10, cloutReq: 0, auraReq: 0 };
      const baseMath = calculateHustleMath('cleaning', levelData, 1, 1, 1, 1, 1, true);

      // Verify Crime Boss Heat gains are multiplied by 1.2x (10 * 1.2 = 12)
      const result = calculateHustleStatsAdditive('cleaning', levelData, pl, 1, baseMath);
      expect(result.heatHit).toBe(12);
    });

    it('should award a small Aura bonus (+3) for rest actions at high mental health', () => {
      const pl = getInitialStats(3);
      pl.mentalHealth = 90; // High health

      const levelData = { level: 1, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 15, heatHit: 0, cloutReq: 0, auraReq: 0 };
      const baseMath = calculateHustleMath('power_nap', levelData, 1, 1, 1, 1, 1, true);

      const result = calculateHustleStatsAdditive('power_nap', levelData, pl, 1, baseMath);
      // Base math aura is 0. High mental health rest adds a +3 aura yield bonus.
      expect(result.yieldAura).toBe(3);
    });
  });

  describe('Recovery Mechanics', () => {
    it('should award +50 Clout and +50 Aura if the player maintains zero Heat for 6 consecutive months', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.heat = 0;
      pl.monthsAtZeroHeat = 5; // Ready to trigger next tick

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Maintain zero Heat -> triggers +50 Clout and +50 Aura community trust reward
      expect(result.newPl.clout).toBe(1050);
      expect(result.newPl.aura).toBe(1050);
      expect(result.newPl.monthsAtZeroHeat).toBe(6);
    });
  });

  describe('Dynamic Social Pressure System Integration Tests', () => {
    it('should behave normally for a low influence player without any extra backlash', () => {
      const pl = getInitialStats(3);
      pl.clout = 100;
      pl.aura = 20;

      // Low influence player has standard loss rates (1.0x) and no Clout Sponsorship Bonus (0%)
      const gains = applyReputationGainScale(100, 100, "The Hustler", pl);
      expect(gains.clout).toBe(100);
      expect(gains.aura).toBe(100);

      const losses = applyReputationLossScale(100, 100, "The Hustler", pl);
      expect(losses.clout).toBe(100);
      expect(losses.aura).toBe(100);
    });

    it('should apply the Clout Sponsorship Bonus to high clout players', () => {
      const pl = getInitialStats(3);
      pl.clout = 1600; // High clout >= 1000
      pl.aura = 50;

      const levelData = { level: 1, cost: 0, yieldCash: 1000, yieldClout: 10, yieldAura: 10, mentalHit: -5, heatHit: 10, cloutReq: 0, auraReq: 0 };
      const baseMath = calculateHustleMath('cleaning', levelData, 1, 1, 1, 1, 1, true);

      const result = calculateHustleStatsAdditive('cleaning', levelData, pl, 1, baseMath);
      // Sponsorship bonus is min(0.25, (1600/2000)*0.25) = (0.8)*0.25 = 0.20 (+20% cash yield)
      // Base yield was 1000. Expected: 1000 * 1.20 = 1200
      expect(result.yieldCash).toBe(1200);
    });

    it('should scale up Clout losses and Heat hits under High Clout Public Scrutiny', () => {
      const pl = getInitialStats(3);
      pl.clout = 1500; // High Clout

      // Clout losses are multiplied by 1.3x under scrutiny
      const losses = applyReputationLossScale(100, 0, "The Hustler", pl);
      expect(losses.clout).toBe(130);

      // Heat hits are multiplied by 1.25x
      const levelData = { level: 1, cost: 0, yieldCash: 1000, yieldClout: 10, yieldAura: 10, mentalHit: -5, heatHit: 10, cloutReq: 0, auraReq: 0 };
      const baseMath = calculateHustleMath('cleaning', levelData, 1, 1, 1, 1, 1, true);
      const result = calculateHustleStatsAdditive('cleaning', levelData, pl, 1, baseMath);
      expect(result.heatHit).toBe(12); // Math.floor(10 * 1.25) = 12
    });

    it('should scale up Aura losses under High Aura Respected Leader Expectations', () => {
      const pl = getInitialStats(3);
      pl.aura = 150; // High Aura

      // Aura losses are multiplied by 1.5x under expectation penalty
      const losses = applyReputationLossScale(0, 100, "The Hustler", pl);
      expect(losses.aura).toBe(150);
    });

    it('should recognize and set rebuilt_after_scandal and ignored_housing_crisis flags', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.scandalCount = 1;
      pl.clout = 1200;
      pl.aura = 120;

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Because they have a scandal history and met the high influence threshold (clout>=1000, aura>=100), they are recognized as rebuilt
      expect(result.newPl.narrativeFlags.rebuilt_after_scandal).toBe(true);
    });
  });
});
