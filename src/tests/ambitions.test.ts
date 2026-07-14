import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInitialStats } from '../store/initialState';
import { checkAmbitionTriggersAndCompletions, AMBITION_REGISTRY } from '../engine/ambitionEngine';
import { generateStrategicAdvice } from '../engine/advisorEngine';
import { generateDynamicStoryNews } from '../engine/storyEngine';
import { createPlayerStatsSlice } from '../store/slices/playerStatsSlice';
import type { PlayerStats } from '../types/game';

describe('Ambition System Core', () => {
  let mockPlayer: PlayerStats;

  beforeEach(() => {
    mockPlayer = getInitialStats(3);
    mockPlayer.ambitions = [];
    mockPlayer.biography = [];
    mockPlayer.recordedBioKeys = [];
    mockPlayer.worldFeed = [];
  });

  it('correctly registers 18 grand ambitions in the engine', () => {
    expect(AMBITION_REGISTRY.length).toBe(18);
    const expectedAmbitionIds = [
      'prop_portfolio',
      'property_empire',
      'prop_baron',
      'prop_legacy',
      'corp_local',
      'corp_group',
      'corp_national',
      'corp_conglomerate',
      'leave_better_society',
      'shadow_kingpin',
      'oval_office_dream',
      'wealth_titan',
      'voice_of_nation',
      'sector_dominator',
      'silicon_sovereign',
      'political_maestro',
      'rentier_dream',
      'green_horizon',
    ];
    expectedAmbitionIds.forEach(id => {
      const found = AMBITION_REGISTRY.find(d => d.id === id);
      expect(found).toBeDefined();
    });
  });

  it('suggests "Small Property Portfolio" when property count criteria is met', () => {
    // Before property purchase
    let result = checkAmbitionTriggersAndCompletions(mockPlayer);
    let propertyAmb = result.updatedPl.ambitions?.find(a => a.id === 'prop_portfolio');
    expect(propertyAmb).toBeUndefined();

    // Meet criteria: own 1 property
    mockPlayer.rentalCount = 1;
    result = checkAmbitionTriggersAndCompletions(mockPlayer);
    propertyAmb = result.updatedPl.ambitions?.find(a => a.id === 'prop_portfolio');
    expect(propertyAmb).toBeDefined();
    expect(propertyAmb?.status).toBe('SUGGESTED');
    expect(propertyAmb?.progress).toBe(1);
    expect(propertyAmb?.target).toBe(2); // Since currentTier is MUD
  });

  it('allows players to accept suggested ambitions', () => {
    mockPlayer.rentalCount = 1;
    let result = checkAmbitionTriggersAndCompletions(mockPlayer);
    let pl = result.updatedPl;

    // Create player stats slice store emulator
    const state: any = {
      pl,
      news: [],
    };
    const set = (fn: any) => {
      const next = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, next);
    };
    const get = () => state;
    const storeActions = createPlayerStatsSlice(set, get, {} as any);

    storeActions.acceptAmbition('prop_portfolio');
    const acceptedAmb = state.pl.ambitions?.find((a: any) => a.id === 'prop_portfolio');
    expect(acceptedAmb?.status).toBe('ACTIVE');
    expect(state.news[0].text).toContain('Ambition Accepted');
  });

  it('allows players to ignore suggested ambitions', () => {
    mockPlayer.rentalCount = 1;
    let result = checkAmbitionTriggersAndCompletions(mockPlayer);
    let pl = result.updatedPl;

    const state: any = {
      pl,
      news: [],
    };
    const set = (fn: any) => {
      const next = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, next);
    };
    const get = () => state;
    const storeActions = createPlayerStatsSlice(set, get, {} as any);

    storeActions.ignoreAmbition('prop_portfolio');
    const ignoredAmb = state.pl.ambitions?.find((a: any) => a.id === 'prop_portfolio');
    expect(ignoredAmb?.status).toBe('IGNORED');
    expect(state.news[0].text).toContain('Ambition Ignored');
  });

  it('allows players to replace active ambitions with suggested ones', () => {
    mockPlayer.rentalCount = 1;
    let result = checkAmbitionTriggersAndCompletions(mockPlayer);
    let pl = result.updatedPl;

    // Make prop_portfolio ACTIVE
    pl.ambitions = pl.ambitions?.map(a => a.id === 'prop_portfolio' ? { ...a, status: 'ACTIVE' } : a);

    // Trigger another suggested ambition, e.g. "The Wealth Titan"
    pl.bag = 12000000;
    result = checkAmbitionTriggersAndCompletions(pl);
    pl = result.updatedPl;

    expect(pl.ambitions?.find(a => a.id === 'prop_portfolio')?.status).toBe('ACTIVE');
    expect(pl.ambitions?.find(a => a.id === 'wealth_titan')?.status).toBe('SUGGESTED');

    const state: any = {
      pl,
      news: [],
    };
    const set = (fn: any) => {
      const next = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, next);
    };
    const get = () => state;
    const storeActions = createPlayerStatsSlice(set, get, {} as any);

    storeActions.replaceAmbition('prop_portfolio', 'wealth_titan');

    expect(state.pl.ambitions?.find((a: any) => a.id === 'prop_portfolio')?.status).toBe('IGNORED');
    expect(state.pl.ambitions?.find((a: any) => a.id === 'wealth_titan')?.status).toBe('ACTIVE');
    expect(state.news[0].text).toContain('Ambition Replaced');
  });

  it('completes active ambition and unlocks progressive evolution chain', () => {
    mockPlayer.rentalCount = 1;
    let result = checkAmbitionTriggersAndCompletions(mockPlayer);
    let pl = result.updatedPl;

    // Accept prop_portfolio
    pl.ambitions = pl.ambitions?.map(a => a.id === 'prop_portfolio' ? { ...a, status: 'ACTIVE' } : a);

    // Meet completion threshold: own 3 rental properties/portfolios
    pl.rentalCount = 3;

    const preLegacyScore = pl.legacyScore || 0;
    result = checkAmbitionTriggersAndCompletions(pl);
    const finalPl = result.updatedPl;

    const propertyAmb = finalPl.ambitions?.find(a => a.id === 'prop_portfolio');
    expect(propertyAmb?.status).toBe('COMPLETED');
    expect(finalPl.legacyScore).toBeGreaterThan(preLegacyScore);

    // Progressive evolution chain check: "The Property Empire" should now be automatically suggested!
    const evolvedAmb = finalPl.ambitions?.find(a => a.id === 'property_empire');
    expect(evolvedAmb).toBeDefined();
    expect(evolvedAmb?.status).toBe('SUGGESTED');
    expect(result.news.some(n => n.text.includes('AMBITION EVOLVED'))).toBe(true);
  });

  it('enforces conflict suppression rules between Philanthropy and Crime Mastermind', () => {
    // 1. If player is active in philanthropy, they cannot get "The Shadow Kingpin"
    mockPlayer.ambitions = [
      {
        id: 'leave_better_society',
        title: 'Leave Society Better Than You Found It',
        description: 'philanthropic description',
        status: 'ACTIVE',
        progress: 1,
        target: 5,
        progressText: '1/5',
        rewardDescription: 'reward',
      }
    ];

    // Trigger high criminal heat which would normally suggest Shadow Kingpin
    mockPlayer.heat = 90;
    let result = checkAmbitionTriggersAndCompletions(mockPlayer);
    expect(result.updatedPl.ambitions?.find(a => a.id === 'shadow_kingpin')).toBeUndefined();

    // 2. If player is active in shadow_kingpin, they cannot get "Leave Society Better Than You Found It"
    mockPlayer.ambitions = [
      {
        id: 'shadow_kingpin',
        title: 'The Shadow Kingpin',
        description: 'criminal description',
        status: 'ACTIVE',
        progress: 1,
        target: 5,
        progressText: '1/5',
        rewardDescription: 'reward',
      }
    ];

    // Trigger high philanthropy backing which would normally suggest Leave Better Society
    mockPlayer.aura = 200;
    result = checkAmbitionTriggersAndCompletions(mockPlayer);
    expect(result.updatedPl.ambitions?.find(a => a.id === 'leave_better_society')).toBeUndefined();
  });

  it('scales thresholds dynamically based on player current tier progression', () => {
    // Standalone stand-out test: Wealth Titan threshold
    const wealthTitan = AMBITION_REGISTRY.find(a => a.id === 'wealth_titan');
    expect(wealthTitan).toBeDefined();

    // In early-game (MUD tier)
    mockPlayer.currentTier = 'MUD';
    const earlyProg = wealthTitan!.getProgress(mockPlayer);
    expect(earlyProg.target).toBe(100000000); // 100M

    // In late-game (MOGUL tier)
    mockPlayer.currentTier = 'MOGUL';
    const lateProg = wealthTitan!.getProgress(mockPlayer);
    expect(lateProg.target).toBe(500000000); // 500M
  });

  it('integrates completed ambitions into Advisor Insights and Dynamic Story news slates', () => {
    // Complete "The Silicon Sovereign"
    mockPlayer.ambitions = [
      {
        id: 'silicon_sovereign',
        title: 'The Silicon Sovereign',
        description: 'technology sovereign',
        status: 'COMPLETED',
        progress: 6,
        target: 6,
        progressText: '6/6',
        rewardDescription: 'reward',
      }
    ];

    // 1. Advisor recognition check
    const advice = generateStrategicAdvice(mockPlayer, 'NORMAL');
    const advisorInsight = advice.insights.find(i => i.id === 'advisor_ambition_completed_silicon_sovereign');
    expect(advisorInsight).toBeDefined();
    expect(advisorInsight?.priority).toBe('Information');
    expect(advisorInsight?.recommendation).toContain('inspire persistent NPCs');

    // 2. Dynamic Story headlines check
    const stories = generateDynamicStoryNews(mockPlayer);
    const siliconStory = stories.find(s => s.text.includes('Cyber-Sovereignty') && s.text.includes('algorithms pioneered by'));
    expect(siliconStory).toBeDefined();
    expect(siliconStory?.colorClass).toContain('text-cyan-400');
  });
});
