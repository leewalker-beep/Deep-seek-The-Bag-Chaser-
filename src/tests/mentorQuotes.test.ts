import { describe, it, expect, beforeEach, vi } from 'vitest';
import { determineDominantIdentity, getOrAssignQuoteForPrompt, INSPIRATIONAL_QUOTES } from '../utils/mentorQuotes';
import type { PlayerStats } from '../types/game';

describe('determineDominantIdentity', () => {
  let mockPlayer: PlayerStats;

  beforeEach(() => {
    mockPlayer = {
      name: "Test Player",
      cash: 0,
      clout: 0,
      aura: 0,
      heat: 0,
      mentalHealth: 100,
      fameLevel: 1,
      tier: 'STREET',
      narrativeFlags: {
        publicReputation: "The Hustler"
      },
      lastPassiveBreakdown: { finalTotal: 0 },
      hustleLevels: {},
      rentPortfolioCount: 0,
      employeeCount: 0,
      cabinet: {},
      conglomerateCandidates: [],
      sabotagedCount: 0,
      arrestCount: 0,
      escalationCount: 0,
      retreatCount: 0,
      philanthropyDonation: 0
    } as unknown as PlayerStats;
  });

  it('classifies charitable player correctly', () => {
    mockPlayer.narrativeFlags!.publicReputation = 'The Philanthropist';
    mockPlayer.philanthropyDonation = 500000;
    mockPlayer.hustleLevels!['philanthropy_empire'] = 1;
    const identity = determineDominantIdentity(mockPlayer);
    expect(identity).toBe('charitable');
  });

  it('classifies risk-taking player correctly', () => {
    mockPlayer.narrativeFlags!.publicReputation = 'The Crime Boss';
    mockPlayer.heat = 80;
    mockPlayer.arrestCount = 2;
    const identity = determineDominantIdentity(mockPlayer);
    expect(identity).toBe('risk');
  });

  it('classifies patient investor player correctly', () => {
    mockPlayer.narrativeFlags!.publicReputation = 'The Investor';
    mockPlayer.lastPassiveBreakdown = { finalTotal: 100000 };
    mockPlayer.rentPortfolioCount = 5;
    const identity = determineDominantIdentity(mockPlayer);
    expect(identity).toBe('investor');
  });

  it('classifies leader player correctly', () => {
    mockPlayer.narrativeFlags!.publicReputation = 'The Kingmaker';
    mockPlayer.employeeCount = 50;
    mockPlayer.cabinet = { member1: {} };
    const identity = determineDominantIdentity(mockPlayer);
    expect(identity).toBe('leader');
  });

  it('classifies resilient player correctly', () => {
    mockPlayer.mentalHealth = 30;
    mockPlayer.sabotagedCount = 3;
    mockPlayer.escalationCount = 5;
    const identity = determineDominantIdentity(mockPlayer);
    expect(identity).toBe('resilient');
  });
});

describe('getOrAssignQuoteForPrompt', () => {
  let mockPlayer: PlayerStats;
  let mockFlags: Record<string, any>;
  const updateFlags = (newFlags: Record<string, any>) => {
    Object.assign(mockFlags, newFlags);
    mockPlayer.narrativeFlags = mockFlags;
  };

  beforeEach(() => {
    mockFlags = {
      publicReputation: "The Hustler"
    };
    mockPlayer = {
      name: "Test Player",
      narrativeFlags: mockFlags,
    } as unknown as PlayerStats;
  });

  it('returns null for ineligible prompts', () => {
    const quote = getOrAssignQuoteForPrompt(mockPlayer, 'some_random_trigger', updateFlags);
    expect(quote).toBeNull();
  });

  it('assigns and persists a quote for an eligible prompt', () => {
    const promptId = 'advisor_shown_tier_STREET';
    const quote1 = getOrAssignQuoteForPrompt(mockPlayer, promptId, updateFlags);
    expect(quote1).not.null;
    expect(quote1!.text).toBeDefined();

    // Verify it is assigned and stored in flags
    const assignedId = mockFlags[`assigned_quote_${promptId}`];
    expect(assignedId).toBeDefined();
    expect(mockFlags[`quote_shown_${assignedId}`]).toBe(true);

    // Call again to ensure it remains deterministic
    const quote2 = getOrAssignQuoteForPrompt(mockPlayer, promptId, updateFlags);
    expect(quote2).toEqual(quote1);
  });

  it('does not repeat the same quote on subsequent calls for different prompts', () => {
    const prompt1 = 'advisor_shown_tier_STREET';
    const prompt2 = 'advisor_shown_tier_STARTUP';

    const quote1 = getOrAssignQuoteForPrompt(mockPlayer, prompt1, updateFlags);
    const quote2 = getOrAssignQuoteForPrompt(mockPlayer, prompt2, updateFlags);

    expect(quote1!.text).not.toEqual(quote2!.text);
  });

  it('resets category shown flags if all quotes are exhausted', () => {
    const promptId = 'advisor_shown_tier_STREET';

    // Force resilient identity
    mockPlayer.mentalHealth = 10;
    mockPlayer.sabotagedCount = 5;

    // Simulate all 15 quotes being shown
    INSPIRATIONAL_QUOTES.forEach(q => {
      mockFlags[`quote_shown_${q.id}`] = true;
    });
    const resilientQuotes = INSPIRATIONAL_QUOTES.filter(q => q.category === 'resilient');

    const quote = getOrAssignQuoteForPrompt(mockPlayer, promptId, updateFlags);
    expect(quote).not.toBeNull();
    // Verify that some category shown flag got reset to false
    const someCleared = resilientQuotes.some(q => !mockFlags[`quote_shown_${q.id}`]);
    expect(someCleared).toBe(true);
  });
});
