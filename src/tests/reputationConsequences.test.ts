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
      // Base erosion is 3 clout and 3 aura -> 1000 - 3 = 997
      expect(result.newPl.clout).toBe(997);
      expect(result.newPl.aura).toBe(997);
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
      // Critical MH erodes Aura by 5 -> 1000 - 5 = 995
      expect(result.newPl.aura).toBe(995);
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
      // Dominant rival erodes Aura by 3 -> 1000 - 3 = 997
      expect(result.newPl.aura).toBe(997);
    });

    it('should decay Clout passively if player goes 12 months without active ventures (Being Forgotten)', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'OPEN';
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.monthsSinceLastHustle = 12; // 12 months inactive

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // Being Forgotten erodes 1% of Clout (1% of 1000 = 10 Clout) -> 1000 - 10 = 990
      expect(result.newPl.clout).toBe(990);
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
      // Active negative consequence erodes 2% of Clout (2% of 1000 = 20 Clout) -> 1000 - 20 = 980
      expect(result.newPl.clout).toBe(980);
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
      // Immediate arrest penalty is 15% Clout and 20% Aura
      // Plus cumulative monthly erodings during serve/arrest
      expect(result.newPl.clout).toBe(848);
      expect(result.newPl.aura).toBe(798);
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
      // 10% Clout penalty: 1000 -> 900 Clout
      expect(result.newPl.clout).toBe(900);

      randomMock.mockRestore();
    });

    it('should penalize Clout by 25% if a presidential term ends with low public approval (< 45%)', () => {
      const pl = getInitialStats(3);
      pl.currentTier = 'PRESIDENT'; // PRESIDENT cap is 250k
      pl.rivals = [];
      pl.clout = 1000;
      pl.aura = 1000;
      pl.presidentMonth = 48; // Ends term this month
      pl.termComplete = false;
      pl.approvalRating = 35; // Bad approval rating

      const result = advanceMonth(pl, 'NORMAL', [], true);
      // 25% Clout penalty: 1000 -> 750 Clout
      expect(result.newPl.clout).toBe(750);
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
      // 20% Clout penalty: 1000 -> 800 Clout
      expect(result.newPl.clout).toBe(800);
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
      // 15% Clout penalty: 1000 -> 850 Clout
      expect(result.newPl.clout).toBe(850);
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
});
