import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCandidatePool } from '../engine/presidentEngine';
import { CABINET_CANDIDATES } from '../config/cabinetCandidates';
import type { PlayerStats } from '../types/game';

describe('Cabinet Expansion - Engine Logic', () => {
  let mockPlayer: PlayerStats;

  beforeEach(() => {
    mockPlayer = {
      runId: 'test-run',
      avatarId: 'av_m1',
      bag: 1000000,
      clout: 1000,
      aura: 1000,
      mentalHealth: 100,
      heat: 0,
      month: 1,
      currentTier: 'PRESIDENT',
      hustleLevels: {},
      hustleBranchIds: {},
      masteredHustles: [],
      flexAssets: {},
      unlockedAchievements: [],
      rentalCount: 0,
      rentPortfolioCount: 0,
      flipCount: 0,
      vendingCount: 0,
      passiveLaborYield: 0,
      mentalShieldTurns: 0,
      artists: [],
      grammyCount: 0,
      recordLabelLevel: 0,
      realEstateType: 'residential',
      realEstateLeverage: 0,
      realEstateStrategy: 'hold',
      vcStage: 'seed',
      vcSector: 'tech',
      vcInvestment: 0,
      approvalRating: 50,
      gdp: 100,
      inflation: 2,
      nationalDebt: 50,
      federalBudget: 100000000,
      congressSupport: 50,
      demographicApproval: {},
      presidentialDiary: [],
      presidentMonth: 1,
      isSecondTerm: false,
      isReElectionPhase: false,
      cabinet: {},
      activeCrises: [],
      presidentialMarketControl: null,
      pendingPresidentialImpacts: [],
      regionalApproval: {},
      prePresidencyTier: 'MOGUL',
      crushedRivals: [],
      marketLeaderTiers: [],
      approvalFloor: 0,
      scandalRiskBonus: 0,
      sotuHistory: [],
      marketCycle: { realEstate: 'normal', vc: {} },
      monthsSinceCycleChange: 0,
      dynamicPassives: {},
      activeSpecializationId: null,
      specializationHistory: [],
      rivals: [],
      rivalThreats: {},
      activeChallenges: [],
      activeSentiment: null,
      activeWorldEvent: null,
      worldEventCooldown: 0,
      activeNarrative: null,
      originBonus: null,
      completedNarrativeEvents: [],
      biography: [],
      recordedBioKeys: [],
      narrativeFlags: {},
      actionLog: [],
      milestones: [],
      events: [],
      collectedDeathBadges: [],
      deathCount: 0,
      arrestCount: 0,
      tierBadges: [],
      pendingFlexOffer: null,
      seenFlexThresholds: [],
      pendingAnnualStatement: false,
      annualCashEarned: 0,
      annualCashSpent: 0,
      annualHustlesRun: 0,
      tierStats: {},
      hustlePlays: {},
      completedDailyChallengesCount: 0,
      totalChallengesCompleted: 0,
      totalHustlesCompleted: 0,
      inJail: false,
      jailMonthsRemaining: 0,
      jailSentenceTotal: 0,
      jailCharge: '',
      tutorialStep: 6,
      isTutorialSkipped: true,
    };
  });

  describe('generateCandidatePool', () => {
    it('should return 3 candidates for a valid role', () => {
      const candidates = generateCandidatePool('treasury', mockPlayer);
      expect(candidates).toHaveLength(3);
      candidates.forEach(c => {
        expect(c.role).toBe('Secretary of Treasury');
      });
    });

    it('should prioritize crushed rivals', () => {
      // Ashley Weaver is cand_ashley_weaver, preferred press
      mockPlayer.crushedRivals = ['char_ashley'];
      const candidates = generateCandidatePool('press', mockPlayer);
      expect(candidates[0].name).toBe('Ashley Weaver');
    });

    it('should adjust loyalty based on integrity', () => {
      // Lawrence Chen (Integrity 70) vs Ashley Weaver (Integrity 95)
      const pool = generateCandidatePool('treasury', mockPlayer);
      const chen = pool.find(p => p.name === 'Lawrence Chen');
      const ashley = generateCandidatePool('press', mockPlayer).find(p => p.name === 'Ashley Weaver');

      if (chen && ashley) {
        // High integrity should mean lower initial loyalty (harder to buy/convince)
        // initialLoyalty -= (cand.integrity - 50) / 5;
        // Chen: 70 -> 70 - (70-50)/5 = 70 - 4 = 66
        // Ashley: 95 -> 70 - (95-50)/5 = 70 - 9 = 61
        expect(chen.loyalty).toBeGreaterThan(ashley.loyalty);
      }
    });
  });
});
