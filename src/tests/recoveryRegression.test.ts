import { describe, it, expect } from 'vitest';
import { HUSTLES } from '../config/hustles/base';
import { generateStrategicAdvice } from '../engine/advisorEngine';
import type { PlayerStats } from '../types/game';

describe('Recovery System Regression Tests', () => {
  const recoveryHustleIds = ['r_sleep', 'power_nap', 'therapy_session', 'wellness_retreat', 'psychiatrist'];

  it('should ensure all recovery activities exist and unlock at correct tiers', () => {
    // 1. Check existence and correct tier mapping
    const expectedTiers: Record<string, string> = {
      r_sleep: 'MUD',
      power_nap: 'STREET',
      therapy_session: 'STARTUP',
      wellness_retreat: 'CORPORATE',
      psychiatrist: 'ELITE',
    };

    recoveryHustleIds.forEach((id) => {
      const hustle = HUSTLES[id];
      expect(hustle, `Recovery hustle ${id} must exist in the game configurations`).toBeDefined();
      expect(hustle.tier, `Recovery hustle ${id} must be mapped to correct tier`).toBe(expectedTiers[id]);
    });
  });

  it('should ensure no recovery activities are duplicated or orphaned', () => {
    // Ensure no other hustles share these recovery IDs or names
    const allHustles = Object.values(HUSTLES);

    recoveryHustleIds.forEach((id) => {
      const matches = allHustles.filter((h) => h.id === id);
      expect(matches.length, `Recovery hustle ${id} must have exactly one unique registration`).toBe(1);
    });
  });

  it('should ensure rest panel configurations are correctly set and functional', () => {
    // Rest panel activities must have panelType REST and hasPanel: true
    const panelActivities = ['r_sleep', 'power_nap', 'therapy_session'];

    panelActivities.forEach((id) => {
      const hustle = HUSTLES[id];
      expect(hustle.hasPanel, `Hustle ${id} must use the recovery RestPanel`).toBe(true);
      expect(hustle.panelType, `Hustle ${id} must have panelType REST`).toBe('REST');

      // Check that they contain l1, l2, and l3 branches for progressive choices
      expect(hustle.branches, `Hustle ${id} must have progressive choices under branches`).toBeDefined();
      expect(hustle.branches?.l1, `Hustle ${id} must have level 1 choice`).toBeDefined();
      expect(hustle.branches?.l2, `Hustle ${id} must have level 2 choice`).toBeDefined();
      expect(hustle.branches?.l3, `Hustle ${id} must have level 3 choice`).toBeDefined();
    });
  });

  it('should ensure Advisor recommendations still navigate players to the correct recovery loops', () => {
    // Mock player with low mental health
    const lowMHPlayer: PlayerStats = {
      mentalHealth: 10,
      month: 5,
      currentTier: 'MUD',
      bag: 1000,
      clout: 50,
      aura: 50,
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
      scoutedTalentPool: [],
      activeMinigame: null,
      rolodex: [],
      npcs: [],
      biography: [],
      recordedBioKeys: [],
      history: [],
      activeNarrative: null,
      narrativeCooldown: 0,
      narrativeFlags: {},
      actionLog: [],
      milestones: [],
      events: [],
      collectedDeathBadges: [],
      deathCount: 0,
      arrestCount: 0,
      tierBadges: [],
      campaignStage: 1,
      approvalRating: 50,
      gdp: 100,
      inflation: 2,
      nationalDebt: 60,
      federalBudget: 50000000,
      congressSupport: 50,
      unlockedLegacyUpgradeIds: [],
      stats: { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 },
      rivals: [],
      rivalThreats: {},
      activeChallenges: [],
      completedLiveEvents: [],
      consequences: [],
      grammyCount: 0,
      recordLabelLevel: 1,
      festivalChoices: { headliner: 'budget', venue: 'small', marketing: 'basic', insurance: false },
      dataAnalyticsChoice: 'consumer',
      cryptoStrategy: 'solo',
      vaStaff: 5,
      vaTraining: 'none',
      vaClient: 'small',
      realEstateType: 'residential',
      realEstateLeverage: 0,
      realEstateStrategy: 'hold',
      vcStage: 'seed',
      vcSector: 'tech',
      vcInvestment: 1,
      legacyPoints: 0,
      filmGenre: 'action',
      filmBudget: 'medium',
      spaceCompany: 'asteroid',
      philanthropyDonation: 10000000,
      electoralVotes: 0,
      foreignRelations: 50,
      worldPeace: 50,
      voterTurnout: 50,
      termComplete: false,
      isSecondTerm: false,
      isReElectionPhase: false,
      pendingTermEnd: false,
      scandalCount: 0,
      cabinet: {},
      activeCrises: [],
      regionalApproval: {},
      demographicApproval: {},
      sotuHistory: [],
      presidentialDiary: [],
      presidentMonth: 0,
      monthsSinceCycleChange: 0,
      dynamicPassives: {},
      activeSpecializationId: null,
      specializationHistory: [],
      completedDailyChallengesCount: 0,
      totalChallengesCompleted: 0,
      totalHustlesCompleted: 0,
      inJail: false,
      isIncarcerated: false,
      jailMonthsRemaining: 0,
      jailSentenceTotal: 0,
      jailCharge: '',
      tutorialStep: 0,
      isTutorialSkipped: false,
      runId: 'smoke',
      avatarId: 'av_m1',
      worldFeed: [],
      endgameTracks: {
        realEstateAcquisitions: [],
        globalFleetCount: 0,
        automatedHustleIds: [],
        techStartupValuation: 1000
      },
      rareTechStockpile: 0,
      algorithmicLogs: 0,
      marketCycle: {
        realEstate: 'normal',
        vc: { tech: 'normal', biotech: 'normal', energy: 'normal' }
      }
    };

    const advice = generateStrategicAdvice(lowMHPlayer, 'normal');
    const insights = advice.insights;
    const mhInsight = insights.find((i) => i.category === 'MentalHealth');

    expect(mhInsight, 'An advisor insight must be generated for severe mental exhaustion').toBeDefined();
    expect(mhInsight?.title).toBe('Severe Mental Exhaustion');
    expect(mhInsight?.recommendation).toContain('Rest & Recover');
  });
});
