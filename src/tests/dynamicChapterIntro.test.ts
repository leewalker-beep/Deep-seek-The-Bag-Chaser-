import { describe, it, expect } from 'vitest';
import { generateDynamicChapterIntro, determinePlaystyle } from '../components/effects/CinematicTransition';
import { getInitialStats } from '../store/initialState';
import { type PlayerStats } from '../types/game';

describe('Dynamic Chapter Introductions', () => {
  it('generates a personalized intro with name, background variation, and playstyle for a Street Kid origin', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');
    pl.name = 'TEST CHAMP';

    const result = generateDynamicChapterIntro(pl, 'STREET');

    expect(result).toContain('TEST CHAMP');
    expect(result).toContain('Delivery Hustler'); // background variation name is Delivery Hustler
    expect(result).toContain('You chose patience over shortcuts'); // steady builder default
    expect(result).toContain("I remember when your biggest concern was paying next week's rent."); // emotional callback for street kid at STREET tier
  });

  it('generates risk-taker narrator text when playstyle is highly risky', () => {
    const pl = getInitialStats(3, 'sk_scrap', 'street_kid', 'sk_scrap');
    pl.name = 'RISKY BOB';
    pl.heat = 65; // high heat, triggering risk-taker categorization

    const result = generateDynamicChapterIntro(pl, 'STREET');

    expect(result).toContain('While others hesitated, you embraced uncertainty');
    expect(result).toContain('turning bold decisions into remarkable rewards');
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

    expect(result).toContain('ownership creates freedom');
    expect(result).toContain('allowing your empire to grow');
  });

  it('reflects major choices like hand-picked cabinet members and specialization', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');
    pl.name = 'MARCUS';
    pl.cabinet = {
      treasury: { id: 'treasury_sec', name: 'John Doe', role: 'Treasury Secretary', loyalty: 80, bonus: { type: 'cash', value: 100 }, strengths: [], weaknesses: [], politicalAlignment: 'center', impacts: {} }
    };

    const result = generateDynamicChapterIntro(pl, 'PRESIDENT');

    expect(result).toContain('backed by a hand-picked cabinet of 1');
    expect(result).toContain('your specialized POLITICAL leadership');
  });

  it('identifies and weaves the first and most played hustles into narration', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');
    pl.name = 'CLIMBER';
    pl.actionLog = [
      {
        id: '1',
        timestamp: 1000,
        month: 1,
        tier: 'MUD',
        hustleId: 'r_delivery',
        hustleName: 'Delivery Hustler',
        level: 1,
        branchId: '',
        branchName: '',
        cost: 0,
        yieldCash: 500,
        yieldClout: 1,
        yieldAura: 1,
        netCash: 500,
        success: true
      },
      {
        id: '2',
        timestamp: 2000,
        month: 2,
        tier: 'MUD',
        hustleId: 'sw',
        hustleName: 'Streetwear Drop',
        level: 1,
        branchId: '',
        branchName: '',
        cost: 0,
        yieldCash: 1000,
        yieldClout: 2,
        yieldAura: 2,
        netCash: 1000,
        success: true
      }
    ];
    pl.hustlePlays = {
      'sw': 10,
      'r_delivery': 1
    };

    const result = generateDynamicChapterIntro(pl, 'STARTUP');

    expect(result).toContain('Starting out with Delivery Hustler');
    expect(result).toContain('Streetwear Drop your trademark engine of growth');
  });

  it('acknowledges comebacks when the player has the phoenix badge', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');
    pl.name = 'RESILIENT';
    pl.masteredHustles = ['the_phoenix'];

    const result = generateDynamicChapterIntro(pl, 'STARTUP');

    expect(result).toContain('rose like a phoenix');
    expect(result).toContain('turning near-ruin into your greatest comeback');
  });

  it('determines all six playstyles accurately', () => {
    const pl = getInitialStats(3, 'sk_delivery', 'street_kid', 'sk_delivery');

    // Default: steady builder
    expect(determinePlaystyle(pl).id).toBe('steady_builder');

    // Crime Boss
    pl.arrestCount = 2;
    expect(determinePlaystyle(pl).id).toBe('crime_boss');

    // People's Champion / Charitable
    pl.arrestCount = 0;
    pl.philanthropyDonation = 15000000; // default is 10M, > 10M trigger
    expect(determinePlaystyle(pl).id).toBe('peoples_champion');

    // Celebrity
    pl.philanthropyDonation = 10000000;
    pl.clout = 35000;
    expect(determinePlaystyle(pl).id).toBe('celebrity');

    // Investor
    pl.clout = 0;
    pl.rentalCount = 5;
    expect(determinePlaystyle(pl).id).toBe('investor');

    // Risk Taker
    pl.rentalCount = 0;
    pl.heat = 65;
    expect(determinePlaystyle(pl).id).toBe('risk_taker');
  });
});
