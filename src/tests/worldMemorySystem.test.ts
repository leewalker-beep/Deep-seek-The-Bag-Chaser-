import { describe, it, expect } from 'vitest';
import type { PlayerStats } from '../types/game';
import { getRivalMemories, simulateRivals } from '../engine/rivalSimEngine';
import { generateHistoricalStories, generateDynamicStoryNews } from '../engine/storyEngine';
import { generateStrategicAdvice } from '../engine/advisorEngine';
import { getCharacterCallbackLine } from '../utils/rivalUtils';
import { advanceMonth } from '../engine/advancementEngine';

describe('World Memory & Relationship Evolution System Tests', () => {
  const createBasePlayer = (): PlayerStats => ({
    runId: 'test-run',
    name: 'ChaserTest',
    avatarId: 'av_m1',
    bag: 1000000,
    clout: 100,
    aura: 100,
    mentalHealth: 100,
    heat: 0,
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
    history: [],
    biography: [],
    recordedBioKeys: [],
    rivals: [],
    npcs: [],
    completedNarrativeEvents: [],
    narrativeFlags: {},
    gdp: 100,
    approvalRating: 50,
    congressSupport: 50,
    activeChallenges: [],
    consequences: [],
    financialDebts: [],
  });

  describe('Rival Memory & Dialogue Recollection', () => {
    it('should correctly resolve earliest interaction month and tier', () => {
      const pl = createBasePlayer();
      pl.rivals = [
        {
          name: 'Victor Kane',
          tier: 'STREET',
          netWorth: 100000,
          relationshipWithPlayer: -50,
          sabotagedCount: 1,
          helpedCount: 0,
          businesses: [],
        },
      ];
      pl.history = [
        {
          id: 'sabotage_success_victor',
          month: 6,
          year: 0,
          title: 'Sabotage Success',
          description: 'Sabotaged Victor Kane.',
          category: 'RIVAL',
          importance: 3,
          participants: ['Victor Kane'],
        },
      ];

      const mem = getRivalMemories(pl, 'Victor Kane');
      expect(mem.sabotaged).toBe(true);
      expect(mem.earliestInteractionMonth).toBe(6);
      expect(mem.earliestInteractionTier).toBe('MUD');
    });

    it('should correctly detect liquidation and public humiliation', () => {
      const pl = createBasePlayer();
      pl.rivals = [
        {
          name: 'Victor Kane',
          tier: 'STREET',
          netWorth: 100000,
          relationshipWithPlayer: -60,
          sabotagedCount: 3,
          helpedCount: 0,
          businesses: [],
        },
      ];
      pl.history = [
        {
          id: 'liquidation_victor',
          month: 10,
          year: 0,
          title: 'Liquidation Event',
          description: 'Victor Kane sold assets.',
          category: 'RIVAL',
          importance: 3,
          participants: ['Victor Kane'],
        },
      ];

      const mem = getRivalMemories(pl, 'Victor Kane');
      expect(mem.liquidated).toBe(true);
      expect(mem.humiliated).toBe(true);
    });
  });

  describe('Community Trust & Memory', () => {
    it('should occasionally trigger community assistance and shield when community trust is high', () => {
      const pl = createBasePlayer();
      pl.narrativeFlags = {
        charity_choices_count: 4, // communityTrust = 4 * 15 = 60
      };
      pl.bag = 100000;
      pl.heat = 50;

      // We run advanceMonth repeatedly to check if the high community trust is factored in and news mentions trigger
      let triggeredShield = false;
      for (let i = 0; i < 40; i++) {
        const res = advanceMonth(pl, 'NORMAL', [], true);
        const newsText = JSON.stringify(res.news);
        if (newsText.includes('COMMUNITY SHIELD') || newsText.includes('COMMUNITY ENDORSEMENT') || newsText.includes('CRISIS ASSISTANCE')) {
          triggeredShield = true;
          break;
        }
      }
      expect(triggeredShield).toBe(true);
    });
  });

  describe('Media Retrospective Headlines', () => {
    it('should generate dynamic retrospects connecting past milestones', () => {
      const pl = createBasePlayer();
      pl.month = 180; // 15 years
      pl.bag = 25000000;
      pl.history = [
        {
          id: 'business_vending_machine',
          month: 0,
          year: 0,
          title: 'First Business',
          description: 'Established a Vending Machine.',
          category: 'BUSINESS',
          importance: 3,
        },
      ];
      pl.narrativeFlags = {
        charity_choices_count: 3,
      };

      const stories = generateHistoricalStories(pl);
      const textDump = stories.map(s => s.text).join(' | ');

      // Should check that 15 year cafe/vending news is present
      expect(textDump).toContain('Fifteen years after opening');
      // Should check critics question early investments is present
      expect(textDump).toContain("Critics once questioned ChaserTest's early investments");
      // Should check charity donation blossomed news
      expect(textDump).toContain('A donation made');
    });
  });

  describe('Rare and Meaningful Advisor Memories', () => {
    it('should surface historical advisor reflections based on milestones', () => {
      const pl = createBasePlayer();
      pl.currentTier = 'CORPORATE';
      pl.month = 60;
      pl.arrestCount = 1;
      pl.narrativeFlags = {
        education_choices_count: 2,
      };

      const advice = generateStrategicAdvice(pl, 'NORMAL');
      const memoryInsights = advice.insights.filter(i => i.category === 'WorldMemory');

      const rentInsight = memoryInsights.find(i => i.id === 'advisor_mem_rent');
      const resilienceInsight = memoryInsights.find(i => i.id === 'advisor_mem_resilience');
      const patienceInsight = memoryInsights.find(i => i.id === 'advisor_mem_patience');

      expect(rentInsight).toBeDefined();
      expect(rentInsight?.whatIsHappening).toContain('paying rent');

      expect(resilienceInsight).toBeDefined();
      expect(resilienceInsight?.whatIsHappening).toContain("survived difficult periods");

      expect(patienceInsight).toBeDefined();
      expect(patienceInsight?.whatIsHappening).toContain("patience has always been");
    });
  });

  describe('Relationship Evolution Callbacks', () => {
    it('should resolve detailed returning lines for named characters based on decisions', () => {
      const pl = createBasePlayer();
      pl.completedNarrativeEvents = ['char_cassie_intel'];
      pl.narrativeFlags = {
        cut_ties_marcus: true,
        pops_give_back: true,
        slick_heist: true,
        rosa_break: true,
      };

      const cassieLine = getCharacterCallbackLine(pl, 'char_cassie');
      expect(cassieLine).toContain('Cassie remembers the thrift shop');

      const marcusLine = getCharacterCallbackLine(pl, 'char_marcus_v2');
      expect(marcusLine).toContain('Tensions linger after you cut ties with Marcus');

      const popsLine = getCharacterCallbackLine(pl, 'char_pops');
      expect(popsLine).toContain('Pops Jenkins remembers your promise');

      const slickLine = getCharacterCallbackLine(pl, 'char_slick');
      expect(slickLine).toContain("Terrence 'Slick' Reed remembers");

      const rosaLine = getCharacterCallbackLine(pl, 'char_rosa');
      expect(rosaLine).toContain('Rosa looks at you coldly');
    });
  });

  describe('30-Year Multi-Playstyle Simulation Tests', () => {
    it('should simulate an Ethical Builder over 30 years and verify positive community trust and noble memories', () => {
      let pl = createBasePlayer();
      pl.month = 360; // 30 years passed
      pl.currentTier = 'MOGUL';
      pl.bag = 12000000;
      pl.history = [
        {
          id: 'business_cafe',
          month: 12,
          year: 1,
          title: 'First Business',
          description: 'Established a small café.',
          category: 'BUSINESS',
          importance: 3,
        },
      ];
      pl.narrativeFlags = {
        charity_choices_count: 5,
        employee_support_choices_count: 4,
        pops_give_back: true,
        rosa_help: true,
        publicReputation: 'The Reformer',
      };
      pl.npcs = [
        { id: 'char_pops', name: 'Arthur "Pops" Jenkins', disposition: 85, originAge: 18 },
        { id: 'char_rosa', name: 'Rosa Mendez', disposition: 90, originAge: 18 },
      ];

      // 1. Verify Media Retrospectives for Cafe origins & Generosity
      const historicalStories = generateHistoricalStories(pl);
      const textDump = historicalStories.map(s => s.text).join(' | ');
      expect(textDump).toContain('Fifteen years after opening');
      expect(textDump).toContain('A donation made');

      // 2. Verify Advisor Memories of humility, patience, and lack of scandals
      const advice = generateStrategicAdvice(pl, 'NORMAL');
      const memoryInsights = advice.insights.filter(i => i.category === 'WorldMemory');
      expect(memoryInsights.some(i => i.id === 'advisor_mem_rent')).toBe(true);
      expect(memoryInsights.some(i => i.id === 'advisor_mem_patience')).toBe(true);

      // 3. Verify NPC callback lines for Pops and Rosa
      const popsLine = getCharacterCallbackLine(pl, 'char_pops');
      const rosaLine = getCharacterCallbackLine(pl, 'char_rosa');
      expect(popsLine).toContain('Pops Jenkins remembers your promise');
      expect(rosaLine).toContain('Mama Rosa Mendez remembers your support');
    });

    it('should simulate an Aggressive Tycoon over 30 years and verify dark, rival-retaliatory memories and scandals', () => {
      let pl = createBasePlayer();
      pl.month = 360; // 30 years passed
      pl.currentTier = 'MOGUL';
      pl.bag = 80000000;
      pl.arrestCount = 3;
      pl.history = [
        {
          id: 'business_scrap_yard',
          month: 12,
          year: 1,
          title: 'First Business',
          description: 'Established a Scrap Yard.',
          category: 'BUSINESS',
          importance: 3,
        },
        {
          id: 'sabotage_success_victor',
          month: 24,
          year: 2,
          title: 'Hostile Takeover',
          description: 'Sabotaged Victor Kane.',
          category: 'RIVAL',
          importance: 4,
          participants: ['Victor Kane'],
        },
        {
          id: 'liquidation_victor',
          month: 48,
          year: 4,
          title: 'Rival Liquidated',
          description: 'Victor Kane sold assets.',
          category: 'RIVAL',
          importance: 4,
          participants: ['Victor Kane'],
        },
      ];
      pl.rivals = [
        {
          name: 'Victor Kane',
          tier: 'MOGUL',
          netWorth: 100000,
          relationshipWithPlayer: -80,
          sabotagedCount: 4,
          helpedCount: 0,
          businesses: [],
        },
      ];
      pl.narrativeFlags = {
        unethical_choices_count: 6,
        employee_exploit_choices_count: 5,
        cut_ties_marcus: true,
        rosa_break: true,
        publicReputation: 'The Crime Boss',
      };

      // 1. Verify Media Retrospectives recall early scandals and aggressive growth
      const historicalStories = generateHistoricalStories(pl);
      const textDump = historicalStories.map(s => s.text).join(' | ');
      expect(textDump).toContain('Recall the early business scandals?');

      // 2. Verify Advisor Memories of resilience after multiple arrests/scandals
      const advice = generateStrategicAdvice(pl, 'NORMAL');
      const memoryInsights = advice.insights.filter(i => i.category === 'WorldMemory');
      expect(memoryInsights.some(i => i.id === 'advisor_mem_resilience')).toBe(true);

      // 3. Verify Rival Memories scale with significance and years passed
      const mem = getRivalMemories(pl, 'Victor Kane');
      expect(mem.earliestInteractionYearsPassed).toBe(28); // 30 - 2 years
      expect(mem.earliestInteractionTier).toBe('STARTUP');
      expect(mem.liquidated).toBe(true);
      expect(mem.humiliated).toBe(true);

      // 4. Verify NPC callbacks reflect cold/antagonistic relations
      const marcusLine = getCharacterCallbackLine(pl, 'char_marcus_v2');
      const rosaLine = getCharacterCallbackLine(pl, 'char_rosa');
      expect(marcusLine).toContain('Tensions linger after you cut ties with Marcus');
      expect(rosaLine).toContain('Rosa looks at you coldly');
    });

    it('should simulate a Celebrity / Media Empire over 30 years and verify clout-driven media memory and cassie alignment', () => {
      let pl = createBasePlayer();
      pl.month = 360;
      pl.currentTier = 'MOGUL';
      pl.bag = 150000000;
      pl.clout = 8500;
      pl.history = [
        {
          id: 'business_vending',
          month: 12,
          year: 1,
          title: 'First Business',
          description: 'Established Vending Machine.',
          category: 'BUSINESS',
          importance: 3,
        },
        {
          id: 'marry_celebrity_selena',
          month: 120,
          year: 10,
          title: 'Married Selena Rosso',
          description: 'Married Selena Rosso in a gorgeous ceremony.',
          category: 'RELATIONSHIP',
          importance: 4,
          participants: ['Selena Rosso'],
        },
      ];
      pl.hustleLevels = {
        media_empire: 3,
        film_studio: 2,
      };
      pl.completedNarrativeEvents = ['char_cassie_intel'];

      // 1. Verify dynamic news feed shows media empire dominance
      const newsStories = generateDynamicStoryNews(pl);
      const textDump = newsStories.map(s => s.text).join(' | ');
      expect(textDump).toContain('media empire has become more influential');

      // 2. Verify Cassie recalls the historic info exchange
      const cassieLine = getCharacterCallbackLine(pl, 'char_cassie');
      expect(cassieLine).toContain('Cassie remembers the thrift shop exchanges');
    });
  });
});
