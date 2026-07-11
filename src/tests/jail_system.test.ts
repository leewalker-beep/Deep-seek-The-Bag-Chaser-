import { describe, it, expect } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { getSentence } from '../config/jailSentences';

describe('Jail System', () => {
  it('should trigger jail at 100% heat', () => {
    const stats = getInitialStats(3);
    stats.rivals = []; // Prevent random rival actions from affecting heat
    stats.heat = 100;
    stats.currentTier = 'STREET';

    const result = advanceMonth(stats, 'NORMAL');
    const newPl = result.newPl;

    expect(newPl.inJail).toBe(true);
    const sentence = getSentence('STREET');
    expect(newPl.jailMonthsRemaining).toBe(sentence.months);
    expect(newPl.jailCharge).toBe(sentence.charge);
    expect(newPl.heat).toBe(0);
    expect(result.news.some(m => m.text.includes('BUSTED'))).toBe(true);
  });

  it('should apply passive losses while in jail', () => {
    const stats = getInitialStats(3);
    stats.rivals = []; // Prevent random rival actions from affecting clout
    stats.currentTier = 'STREET';
    stats.inJail = true;
    stats.jailMonthsRemaining = 5;
    stats.jailSentenceTotal = 6;
    stats.jailCharge = 'Tax Evasion';
    stats.bag = 10000;
    stats.clout = 100;

    const sentence = getSentence('STREET');

    const result = advanceMonth(stats, 'NORMAL');
    const newPl = result.newPl;

    expect(newPl.jailMonthsRemaining).toBe(4);
    expect(newPl.clout).toBe(100 - sentence.cloutLossPerMonth - 4); // Accounts for sentence-based clout decay and hard-mode bars erosion
    expect(newPl.bag).toBeLessThan(10000);
  });

  it('should release player when sentence is served', () => {
    const stats = getInitialStats(3);
    stats.inJail = true;
    stats.jailMonthsRemaining = 1;
    stats.jailSentenceTotal = 6;

    const result = advanceMonth(stats, 'NORMAL');
    const newPl = result.newPl;

    expect(newPl.inJail).toBe(false);
    expect(newPl.jailMonthsRemaining).toBe(0);
    expect(result.news.some(m => m.text.includes('RELEASED'))).toBe(true);
  });
});
