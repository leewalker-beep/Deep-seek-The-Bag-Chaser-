import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCandidatePool } from '../engine/presidentEngine';
import { CABINET_CANDIDATES } from '../config/cabinetCandidates';
import { useGameStore } from '../store/gameStore';
import type { PlayerStats } from '../types/game';

describe('Cabinet Expansion - Engine Logic', () => {
  let mockPlayer: PlayerStats;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
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
    useGameStore.setState({ currentMarket: 'NORMAL' });
  });

  describe('generateCandidatePool', () => {
    it('should return 5 candidates for a valid role', () => {
      const candidates = generateCandidatePool('treasury', mockPlayer);
      expect(candidates).toHaveLength(5);
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

  describe('Relationship Evolution and Impacts', () => {
    it('should apply monthly impacts from cabinet members', () => {
      const store = useGameStore;
      const candidate = CABINET_CANDIDATES.find(c => c.id === 'cand_lawrence_chen')!;
      const member = {
        ...candidate,
        id: 'treasury',
        role: 'Secretary of Treasury',
        loyalty: 100,
        bonus: { type: 'cash' as const, value: 10 },
        impacts: {
          gdp: 2,
          inflation: -1,
          approval: 1
        }
      };

      store.setState({
        pl: {
          ...mockPlayer,
          currentTier: 'PRESIDENT',
          presidentMonth: 1,
          cabinet: { treasury: member },
          gdp: 100,
          inflation: 5,
          approvalRating: 50,
          federalBudget: 100000000,
          activeCrises: [],
          presidentialDiary: [],
          pendingPresidentialImpacts: [],
        }
      });

      store.getState().advancePresidentialMonth();

      const updatedPl = store.getState().pl;
      expect(updatedPl.gdp).toBe(102);
      expect(updatedPl.inflation).toBe(4);
      expect(updatedPl.approvalRating).toBeGreaterThanOrEqual(51);
    });

    it('should evolve a relationship to Trusted Ally after 6 months of high loyalty', () => {
      const store = useGameStore;
      const candidate = CABINET_CANDIDATES.find(c => c.id === 'cand_lawrence_chen')!;
      const member = {
        ...candidate,
        id: 'treasury',
        role: 'Secretary of Treasury',
        loyalty: 95,
        monthsAtHighLoyalty: 5,
        isTrustedAlly: false,
        bonus: { type: 'cash' as const, value: 10 },
        impacts: {}
      };

      store.setState({
        pl: {
          ...mockPlayer,
          currentTier: 'PRESIDENT',
          presidentMonth: 10,
          cabinet: { treasury: member },
          federalBudget: 100000000,
          activeCrises: [],
          presidentialDiary: [],
        }
      });

      store.getState().advancePresidentialMonth();

      expect(store.getState().pl.cabinet.treasury.isTrustedAlly).toBe(true);
    });

    it('should trigger a betrayal leak when loyalty is very low', () => {
      // Advance month uses Date.now() for leak IDs, which can cause collision in rapid tests
      // but here we just need to ensure the leak triggers.
      const store = useGameStore;
      const candidate = CABINET_CANDIDATES.find(c => c.id === 'cand_lawrence_chen')!;
      const member = {
        ...candidate,
        id: 'treasury',
        role: 'Secretary of Treasury',
        loyalty: 5,
        hasLeaked: false,
        bonus: { type: 'cash' as const, value: 10 },
        impacts: {}
      };

      store.setState({
        pl: {
          ...mockPlayer,
          currentTier: 'PRESIDENT',
          presidentMonth: 10,
          cabinet: { treasury: member },
          federalBudget: 100000000,
          activeCrises: [],
          presidentialDiary: [],
        }
      });

      // Mock random to ensure betrayal triggers (Betrayal chance is 0.2)
      // Note: Scandal check also uses random. We need to be careful.
      // Scandal check: Math.random() < scandalRisk * 0.12
      // Loyalty check: Math.random() < 0.2
      // We set random to 0.05 to ensure it passes all common checks
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05);

      // Force loyalty even lower just in case
      store.setState(s => ({
        pl: {
            ...s.pl,
            cabinet: {
                ...s.pl.cabinet,
                treasury: { ...s.pl.cabinet.treasury, loyalty: 2 }
            }
        }
      }));

      store.getState().advancePresidentialMonth();

      const crises = store.getState().pl.activeCrises;
      expect(crises.some(c => c.name === 'Cabinet Leak')).toBe(true);
      expect(store.getState().pl.cabinet.treasury.hasLeaked).toBe(true);

      vi.restoreAllMocks();
    });
  });
});
