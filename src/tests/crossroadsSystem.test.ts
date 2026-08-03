import { describe, test, expect } from 'vitest';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import { processWorldReaction } from '../engine/reactiveWorldEngine';
import { evaluateIdentityDimensions } from './../utils/identitySystem';
import { generateStrategicAdvice } from '../engine/advisorEngine';
import { compileBiographyChapters } from '../utils/biographyCompiler';
import type { PlayerStats } from '../types/game';

// Helper to generate a baseline player state
function getBaselinePlayer(): PlayerStats {
  return {
    name: 'Alex Chaser',
    month: 12,
    currentTier: 'CORPORATE',
    prePresidencyTier: 'CORPORATE',
    categoryId: 'street_kid',
    variationId: 'grinder',
    chosenBackground: 'sk_scrap',
    chosenBackgroundCategory: 'street_kid',
    chosenBackgroundVariation: 'grinder',
    bag: 1000000,
    clout: 800,
    aura: 500,
    mentalHealth: 80,
    heat: 0,
    consequences: [],
    biography: [],
    recordedBioKeys: [],
    worldFeed: [],
    npcs: [],
    hustleLevels: {},
    hustleBranchIds: {},
    hustlePlays: {},
    masteredHustles: [],
    unlockedLegacyUpgradeIds: [],
    activeSpecializationId: null,
    specializationHistory: [],
    flexAssets: {},
    seenFlexThresholds: [],
    pendingFlexOffer: null,
    flexOfferCooldown: 0,
    inJail: false,
    jailMonthsRemaining: 0,
    jailSentenceTotal: 0,
    jailCharge: '',
    completedNarrativeEvents: [],
    lastExecutedHustleId: '',
    streak: 0,
    stats: {
      totalHustles: 10,
      successfulHustles: 10,
      lifetimeEarnings: 50000,
    },
    tierStats: {},
    totalHustlesCompleted: 10,
    campaignStage: 0,
    approvalRating: 50,
    congressSupport: 50,
    nationalDebt: 40,
    gdp: 100,
    inflation: 2.0,
    lastPassiveBreakdown: {
      sources: [],
      baseTotal: 0,
      multipliers: { legacy: 1.0, market: 1.0, specialization: 1.0 },
      finalTotal: 0
    },
    narrativeFlags: {
      publicReputation: 'The Investor',
      charity_choices_count: 5,
      unethical_choices_count: 5
    },
    worldFeedCooldown: 0,
    activeWorldEvent: null,
    completedLiveEvents: [],
    worldEventCooldown: 0,
    activeSentiment: null,
    marketCycle: {
      realEstate: 'normal',
      vc: { tech: 'normal', biotech: 'normal', energy: 'normal' }
    },
    monthsSinceCycleChange: 0,
    vendingCount: 0,
    rentalCount: 0,
    rentPortfolioCount: 0,
    flipCount: 0,
    scandalCount: 0,
    annualCashEarned: 10000,
    annualCashSpent: 5000,
    annualHustlesRun: 5,
    artists: [],
    scoutedTalentPool: [],
    rolodex: [],
    foundersBacked: [],
    conglomerateCEOs: {},
    conglomerateCandidates: [],
    cabinet: {},
    marketLeaderTiers: [],
    activeChallenges: []
  };
}

describe('Defining Moments & Life Crossroads System', () => {
  test('Crossroads events exist and are configured correctly in NARRATIVE_EVENTS', () => {
    const layoffEvent = NARRATIVE_EVENTS.find(e => e.id === 'crossroad_recession_toll');
    const buyoutEvent = NARRATIVE_EVENTS.find(e => e.id === 'crossroad_titans_exit');
    const partnerEvent = NARRATIVE_EVENTS.find(e => e.id === 'crossroad_partners_redemption');
    const corruptionEvent = NARRATIVE_EVENTS.find(e => e.id === 'crossroad_whistleblowers_gambit');

    expect(layoffEvent).toBeDefined();
    expect(buyoutEvent).toBeDefined();
    expect(partnerEvent).toBeDefined();
    expect(corruptionEvent).toBeDefined();

    // Verify layoff choices
    expect(layoffEvent!.choices).toHaveLength(2);
    expect(layoffEvent!.choices[0].id).toBe('crossroad_employees_protect');
    expect(layoffEvent!.choices[1].id).toBe('crossroad_employees_layoff');

    // Verify buyout choices
    expect(buyoutEvent!.choices).toHaveLength(2);
    expect(buyoutEvent!.choices[0].id).toBe('crossroad_company_sell');
    expect(buyoutEvent!.choices[1].id).toBe('crossroad_company_fight');
  });

  test('Crossroads choices trigger custom World Reactions', () => {
    const p1 = getBaselinePlayer();
    p1.narrativeFlags = {
      ...p1.narrativeFlags,
      crossroad_protected_employees: true
    };

    const reaction1 = processWorldReaction(p1, 'NARRATIVE_DECISION', { choiceText: 'Protect All Employees' });
    const feedText1 = reaction1.addedItems.map(item => item.text).join(' | ');

    expect(feedText1).toContain('sacrifice of short-term profit');
    expect(feedText1).toContain('protecting their entire workforce');

    // Betrayal Choice
    const p2 = getBaselinePlayer();
    p2.narrativeFlags = {
      ...p2.narrativeFlags,
      crossroad_betrayed_partner: true
    };

    const reaction2 = processWorldReaction(p2, 'NARRATIVE_DECISION', { choiceText: 'Ruthlessly Liquidate Them' });
    const feedText2 = reaction2.addedItems.map(item => item.text).join(' | ');

    expect(feedText2).toContain('declines partner');
    expect(feedText2).toContain("company collapses");
  });

  test('Crossroads choices permanently shift Identity Dimensions', () => {
    const pBaseline = getBaselinePlayer();
    const dimsBaseline = evaluateIdentityDimensions(pBaseline);

    // Test Sacrifice (Protect Employees)
    const pSacrifice = getBaselinePlayer();
    pSacrifice.narrativeFlags = {
      ...pSacrifice.narrativeFlags,
      crossroad_protected_employees: true
    };
    const dimsSacrifice = evaluateIdentityDimensions(pSacrifice);
    expect(dimsSacrifice.compassion).toBeGreaterThan(dimsBaseline.compassion);
    expect(dimsSacrifice.integrity).toBeGreaterThan(dimsBaseline.integrity);
    expect(dimsSacrifice.leadership).toBeGreaterThan(dimsBaseline.leadership);

    // Test Betrayal (Exploit Partner)
    const pBetrayal = getBaselinePlayer();
    pBetrayal.narrativeFlags = {
      ...pBetrayal.narrativeFlags,
      crossroad_betrayed_partner: true
    };
    const dimsBetrayal = evaluateIdentityDimensions(pBetrayal);
    expect(dimsBetrayal.compassion).toBeLessThan(dimsBaseline.compassion);
    expect(dimsBetrayal.integrity).toBeLessThan(dimsBaseline.integrity);
    expect(dimsBetrayal.ambition).toBeGreaterThan(dimsBaseline.ambition);
  });

  test('Crossroads choices trigger Strategic Advisor Retrospective Comments', () => {
    const p1 = getBaselinePlayer();
    p1.narrativeFlags = {
      ...p1.narrativeFlags,
      crossroad_exposed_corruption: true
    };

    const advice = generateStrategicAdvice(p1, 'NORMAL');
    const whistleblowerInsight = advice.insights.find(ins => ins.id === 'advisor_crossroad_expose_glow');

    expect(whistleblowerInsight).toBeDefined();
    expect(whistleblowerInsight!.title).toBe("The Whistleblower's Halo");
  });

  test('Biography Compiler extracts and bundles Crossroads into a dynamic chapter', () => {
    const p1 = getBaselinePlayer();
    p1.narrativeFlags = {
      ...p1.narrativeFlags,
      crossroad_protected_employees: true
    };
    p1.biography = [
      'Started life in the CORPORATE tier.',
      '“The Sacrifice: In the depth of a harsh economic recession, chose to protect employee livelihood at massive personal expense.”'
    ];

    const chapters = compileBiographyChapters(p1);
    const crossroadsChapter = chapters.find(ch => ch.id === 'crossroads');

    expect(crossroadsChapter).toBeDefined();
    expect(crossroadsChapter!.title).toBe('The Sacrifice');
    expect(crossroadsChapter!.entries).toHaveLength(1);
    expect(crossroadsChapter!.entries[0]).toContain('The Sacrifice: In the depth of a harsh economic recession');
  });
});
