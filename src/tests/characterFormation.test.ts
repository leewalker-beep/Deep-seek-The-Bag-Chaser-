import { describe, it, expect } from 'vitest';
import { recordCharacterChoice, CHOICE_BEHAVIOR_MAP } from '../utils/characterFormation';
import { calculateReputationScores } from '../engine/reputationEngine';
import { compileBiographyChapters } from '../utils/biographyCompiler';
import type { PlayerStats } from '../types/game';

const createMockPlayer = (): PlayerStats => ({
  runId: 'test_run',
  name: 'Test Chaser',
  avatarId: 'av_m1',
  bag: 10000,
  clout: 100,
  aura: 50,
  mentalHealth: 100,
  heat: 10,
  month: 12,
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
  foundersBacked: [],
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
  foreignRelations: 50,
  worldPeace: 50,
  approvalRating: 50,
  gdp: 2.0,
  inflation: 2.0,
  nationalDebt: 50,
  federalBudget: 100,
  congressSupport: 50,
  demographicApproval: {},
  presidentialDiary: [],
  presidentMonth: 0,
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
  marketCycle: { realEstate: 'normal', vc: {} },
  monthsSinceCycleChange: 0,
  dynamicPassives: {},
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
  history: [],
  narrativeFlags: {},
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
  tutorialStep: 6,
  isTutorialSkipped: true,
});

describe('Character Formation System', () => {
  it('should correctly map choices to categories using CHOICE_BEHAVIOR_MAP', () => {
    expect(CHOICE_BEHAVIOR_MAP['executive_education']).toBe('education');
    expect(CHOICE_BEHAVIOR_MAP['accept_university_offer']).toBe('education');
    expect(CHOICE_BEHAVIOR_MAP['fund_retreat']).toBe('employee_support');
    expect(CHOICE_BEHAVIOR_MAP['enforce_shifts']).toBe('employee_exploit');
    expect(CHOICE_BEHAVIOR_MAP['settle_dispute']).toBe('charity');
    expect(CHOICE_BEHAVIOR_MAP['bury_evidence']).toBe('unethical');
  });

  it('should increment behavioral counts correctly upon recording choices', () => {
    let pl = createMockPlayer();

    // Settle dispute is charity
    const res1 = recordCharacterChoice(pl, 'mining_labor_dispute', 'settle_dispute');
    pl = res1.updatedPl;
    expect(pl.narrativeFlags?.charity_choices_count).toBe(1);
    expect(res1.news.length).toBe(0); // No milestone triggered yet (count is 1)

    // Settle dispute again (count = 2)
    const res2 = recordCharacterChoice(pl, 'mining_labor_dispute', 'settle_dispute');
    pl = res2.updatedPl;
    expect(pl.narrativeFlags?.charity_choices_count).toBe(2);

    // Accept university offer (education count = 1)
    const res3 = recordCharacterChoice(pl, 'university_admission_offer', 'accept_university_offer');
    pl = res3.updatedPl;
    expect(pl.narrativeFlags?.education_choices_count).toBe(1);
    expect(pl.narrativeFlags?.charity_choices_count).toBe(2);
  });

  it('should trigger character milestones (Advisor prompt, history log, feed item, biography entry) when count reaches 3', () => {
    let pl = createMockPlayer();

    // Simulate 3 unethical choices
    pl = recordCharacterChoice(pl, 'mining_labor_dispute', 'bury_evidence').updatedPl;
    pl = recordCharacterChoice(pl, 'tech_black_project', 'accept_obsidian').updatedPl;

    // Third unethical choice triggering milestone
    const res = recordCharacterChoice(pl, 'shadow_blackmail', 'leverage_power');
    pl = res.updatedPl;

    expect(pl.narrativeFlags?.unethical_choices_count).toBe(3);

    // 1. Advisor Prompt queued
    expect(pl.advisorQueue?.length).toBe(1);
    expect(pl.advisorQueue?.[0].id).toBe('advisor_milestone_unethical');
    expect(pl.advisorQueue?.[0].title).toContain('OPERATING IN GREY AREAS');

    // 2. History Event recorded
    expect(pl.history?.some(h => h.id === 'milestone_unethical')).toBe(true);

    // 3. Biography Entry appended
    expect(pl.biography.some(entry => entry.includes('legal grey areas'))).toBe(true);

    // 4. World Feed item published
    expect(pl.worldFeed?.some(f => f.id?.startsWith('newspaper_unethical'))).toBe(true);

    // 5. Milestone news message returned
    expect(res.news.length).toBe(1);
    expect(res.news[0]).toContain('CHARACTER EVOLVED');
  });

  it('should factor behavioral counts into reputation scores', () => {
    let pl = createMockPlayer();

    // Base scores
    const baseScores = calculateReputationScores(pl);
    const basePhilanthropist = baseScores['The Philanthropist'] || 0;
    const baseCrimeBoss = baseScores['The Crime Boss'] || 0;

    // Simulate 1 charity choice
    pl.narrativeFlags.charity_choices_count = 1;
    let scores = calculateReputationScores(pl);
    expect(scores['The Philanthropist']).toBe(basePhilanthropist + 30);
    expect(scores["The People's Champion"]).toBe(20);

    // Simulate 3 unethical choices
    pl.narrativeFlags.unethical_choices_count = 3;
    scores = calculateReputationScores(pl);
    expect(scores['The Crime Boss']).toBe(baseCrimeBoss + 90);
    expect(scores['The Controversial Tycoon']).toBe(60);
  });

  it('should dynamically inject behavior passages into Compiled Biography Chapters', () => {
    let pl = createMockPlayer();

    // No behavior milestone -> standard intro
    let chapters = compileBiographyChapters(pl);
    let beginningsChapter = chapters.find(c => ch => ch.id === 'beginnings' || c.id === 'beginnings');
    expect(beginningsChapter?.intro).not.toContain('philanthropy and communal welfare');

    // Add charity count of 3 -> philanthropy behavior passage should be injected
    pl.narrativeFlags.charity_choices_count = 3;
    chapters = compileBiographyChapters(pl);
    beginningsChapter = chapters.find(c => c.id === 'beginnings');
    expect(beginningsChapter?.intro).toContain('philanthropy and communal welfare');

    // Add unethical count of 3 -> unethical behavior passage should be injected instead (takes higher precedence/override)
    pl.narrativeFlags.charity_choices_count = 0;
    pl.narrativeFlags.unethical_choices_count = 3;
    chapters = compileBiographyChapters(pl);
    beginningsChapter = chapters.find(c => c.id === 'beginnings');
    expect(beginningsChapter?.intro).toContain('legal grey areas');
  });
});
