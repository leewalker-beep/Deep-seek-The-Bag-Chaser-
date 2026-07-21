import { describe, it, expect } from 'vitest';
import { generateDynamicChapterIntro } from '../components/effects/CinematicTransition';
import { getInitialStats } from '../store/initialState';
import { type PlayerStats } from '../types/game';

describe('Dynamic Chapter Introductions', () => {
  it('generates a personalized intro with name, background variation, and playstyle for a Street Kid origin', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');
    pl.name = 'TEST CHAMP';

    const result = generateDynamicChapterIntro(pl, 'STREET');

    expect(result).toContain('TEST CHAMP');
    expect(result).toContain('Delivery Hustler'); // background variation name is Delivery Hustler
    expect(result).toContain('The Hustler'); // starting reputation
  });

  it('generates risk-taker narrator text when playstyle is highly risky', () => {
    const pl = getInitialStats(3, 'sk_scrap', 'street_kid', 'sk_scrap');
    pl.name = 'RISKY BOB';
    pl.heat = 65; // high heat but less than 75 to avoid being crime boss, triggering risk-taker categorization

    const result = generateDynamicChapterIntro(pl, 'STREET');

    expect(result).toContain('Some call you reckless');
    expect(result).toContain('Others call you fearless');
  });

  it('generates investor playstyle quote when calculated investor playstyle criteria are met', () => {
    const pl = getInitialStats(3, 'bn_investor', 'benefactor', 'bn_investor');
    pl.name = 'VALERIE';
    // Mock passive income breakdown with high yield
    pl.lastPassiveBreakdown = {
      sources: [],
      baseTotal: 60000,
      multipliers: { legacy: 1, market: 1, specialization: 1 },
      finalTotal: 60000,
    };

    const result = generateDynamicChapterIntro(pl, 'CORPORATE');

    expect(result).toContain('Your empire wasn\'t built overnight');
    expect(result).toContain('Every decision was calculated');
  });

  it('reflects major choices like recruited rivals and hand-picked cabinet members', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');
    pl.name = 'MARCUS';
    pl.rivals = [
      { id: 'rival_mud', name: 'Marcus Rival', netWorth: 100000, currentBid: 0, isNpc: true, tier: 'MUD', status: 'ally' }
    ];
    pl.cabinet = {
      treasury: { id: 'treasury_sec', name: 'John Doe', role: 'Treasury Secretary', loyalty: 80, bonus: { type: 'cash', value: 100 }, strengths: [], weaknesses: [], politicalAlignment: 'center', impacts: {} }
    };

    const result = generateDynamicChapterIntro(pl, 'PRESIDENT');

    expect(result).toContain('recruited former rival allies');
    expect(result).toContain('federal cabinet of 1 members');
  });
});
