import { describe, test, expect, vi, beforeEach } from 'vitest';
import { calculateHustleStatsAdditive } from '../engine/mathEngine';
import { executeHustleAction } from '../engine/hustleEngine';
import { enforceStatCaps } from '../engine/statEngine';
import type { PlayerStats } from '../types/game';

describe('System Interconnectivity Engine Audit', () => {
  let mockPlayer: PlayerStats;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPlayer = enforceStatCaps({
      runId: 'test-run',
      bag: 1000000,
      clout: 500,
      aura: 50,
      mentalHealth: 100, // Perfect health
      heat: 0,
      month: 1,
      currentTier: 'STREET',
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
      rolodex: [],
      rareTechStockpile: 0,
      algorithmicLogs: 0,
      grammyCount: 0,
      recordLabelLevel: 1,
      realEstateType: 'residential',
      realEstateLeverage: 0,
      realEstateStrategy: 'hold',
      vcStage: 'seed',
      vcSector: 'tech',
      vcInvestment: 0,
      approvalRating: 50,
      gdp: 100,
      inflation: 2.0,
      nationalDebt: 50,
      federalBudget: 50000000,
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
      prePresidencyTier: null,
      crushedRivals: [],
      marketLeaderTiers: [],
      approvalFloor: 0,
      scandalRiskBonus: 0,
      sotuHistory: [],
      marketCycle: {
        realEstate: 'normal',
        vc: { tech: 'normal', biotech: 'normal', energy: 'normal' }
      },
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
      narrativeCooldown: 0,
      arcLastFired: {},
      monthsSinceLastEvent: 0,
      originBonus: null,
      completedNarrativeEvents: [],
      biography: [],
      recordedBioKeys: [],
      actionLog: [],
      milestones: [],
      events: [],
      collectedDeathBadges: [],
      deathCount: 0,
      arrestCount: 0,
      tierBadges: [],
      pendingFlexOffer: null,
      flexOfferCooldown: 0,
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
      tutorialStep: 0,
      isTutorialSkipped: true,
    });
  });

  test('should reduce work efficiency when mentalHealth is low (Stress Penalty)', () => {
    const resultNormal = calculateHustleStatsAdditive('cc', { level: 1, cost: 0, yieldCash: 1000, yieldClout: 100, yieldAura: 100, mentalHit: 0, cloutReq: 0, auraReq: 0 }, { ...mockPlayer, mentalHealth: 100 }, 1, {
      cost: 0,
      yieldCash: 1000,
      yieldClout: 100,
      yieldAura: 100,
      mentalHit: 0,
      heatHit: 0,
      shieldTurns: 0
    });

    const resultStressed = calculateHustleStatsAdditive('cc', { level: 1, cost: 0, yieldCash: 1000, yieldClout: 100, yieldAura: 100, mentalHit: 0, cloutReq: 0, auraReq: 0 }, { ...mockPlayer, mentalHealth: 10 }, 1, {
      cost: 0,
      yieldCash: 1000,
      yieldClout: 100,
      yieldAura: 100,
      mentalHit: 0,
      heatHit: 0,
      shieldTurns: 0
    });

    expect(resultStressed.yieldCash).toBeLessThan(resultNormal.yieldCash);
    expect(resultStressed.yieldClout).toBeLessThan(resultNormal.yieldClout);
    expect(resultStressed.yieldAura).toBeLessThan(resultNormal.yieldAura);
  });

  test('should trigger Careless Mistakes under high stress (low mental health)', () => {
    mockPlayer.mentalHealth = 10; // Very high stress
    // We mock Math.random to guarantee that the careless mistake triggers (stressChance = 0.18, so we mock random < 0.18)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01);

    const levelData = { level: 1, cost: 0, yieldCash: 1000, yieldClout: 100, yieldAura: 100, mentalHit: 0, cloutReq: 0, auraReq: 0 };
    const result = executeHustleAction('cc', mockPlayer, 'NORMAL', levelData, 1, 1.0, true);

    expect(result.yieldCash).toBeLessThan(1000); // Penalty subtracted
    expect(result.heatHit).toBeGreaterThanOrEqual(10); // Heat penalty added
    expect(result.tickerMessages?.some(m => m.text.includes('CARELESS MISTAKE'))).toBe(true);

    randomSpy.mockRestore();
  });

  test('should apply Street Kid background mental recovery sleep bonus', () => {
    mockPlayer.chosenBackgroundCategory = 'street_kid';

    const result = calculateHustleStatsAdditive('r_sleep', { level: 1, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 20, cloutReq: 0, auraReq: 0 }, mockPlayer, 1, {
      cost: 0,
      yieldCash: 0,
      yieldClout: 0,
      yieldAura: 0,
      mentalHit: 20, // base recovery
      heatHit: 0,
      shieldTurns: 0
    });

    expect(result.mentalHit).toBe(23); // 20 * 1.15
  });

  test('should apply Dropout background VC / tech / media yield boost', () => {
    mockPlayer.chosenBackgroundCategory = 'dropout';

    const result = calculateHustleStatsAdditive('venture_capital', { level: 1, cost: 0, yieldCash: 10000, yieldClout: 0, yieldAura: 0, mentalHit: 0, cloutReq: 0, auraReq: 0 }, mockPlayer, 1, {
      cost: 0,
      yieldCash: 10000,
      yieldClout: 0,
      yieldAura: 0,
      mentalHit: 0,
      heatHit: 0,
      shieldTurns: 0
    });

    expect(result.yieldCash).toBe(11500); // 10000 * 1.15
  });

  test('should apply Specialization Sector Matching bonus', () => {
    mockPlayer.activeSpecializationId = 'institutional'; // Matches Real Estate & Finance

    const result = calculateHustleStatsAdditive('saas_mvp', { level: 1, cost: 0, yieldCash: 1000, yieldClout: 100, yieldAura: 100, mentalHit: 0, cloutReq: 0, auraReq: 0 }, mockPlayer, 1, {
      cost: 0,
      yieldCash: 1000,
      yieldClout: 100,
      yieldAura: 100,
      mentalHit: 0,
      heatHit: 0,
      shieldTurns: 0
    });

    // saas_mvp sector is Technology, Institutional matches Finance/Real Estate -> No match bonus (but institutional baseline +15% applies)
    expect(result.yieldCash).toBe(1150);

    const resultMatched = calculateHustleStatsAdditive('venture_capital', { level: 1, cost: 0, yieldCash: 1000, yieldClout: 100, yieldAura: 100, mentalHit: 0, cloutReq: 0, auraReq: 0 }, mockPlayer, 1, {
      cost: 0,
      yieldCash: 1000,
      yieldClout: 100,
      yieldAura: 100,
      mentalHit: 0,
      heatHit: 0,
      shieldTurns: 0
    });

    // venture_capital is Finance -> Matches Institutional! (+15% baseline and +10% matching bonus applied)
    expect(resultMatched.yieldCash).toBe(1265); // 1000 * 1.15 * 1.10
  });

  test('should apply Campaign Cost Clout Rebate', () => {
    mockPlayer.clout = 40000; // Gives max 25% cost rebate

    const result = calculateHustleStatsAdditive('president_campaign', { level: 1, cost: 100000000, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, cloutReq: 0, auraReq: 0 }, mockPlayer, 1, {
      cost: 100000000,
      yieldCash: 0,
      yieldClout: 0,
      yieldAura: 0,
      mentalHit: 0,
      heatHit: 0,
      shieldTurns: 0
    });

    expect(result.cost).toBe(75000000); // 25% off 100,000,000
  });
});
