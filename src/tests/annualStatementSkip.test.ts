import { describe, test, expect } from 'vitest';
import { compileAnnualReview } from '../utils/annualReviewCompiler';
import { getInitialStats } from '../store/initialState';
import { type PlayerStats } from '../types/game';

describe('Annual Statement - Slide 0 Highlight Preview & Skip Logic', () => {
  test('compileAnnualReview extracts defining moment, emotional signature, and net worth shift for Slide 0 preview', () => {
    const pl = getInitialStats(1) as PlayerStats;
    pl.month = 12;
    pl.bag = 25000;
    pl.annualCashEarned = 20000;
    pl.annualCashSpent = 0;
    pl.clout = 150;
    pl.aura = 50;
    pl.currentTier = 'STREET';
    pl.narrativeFlags = {
      year_start_bag: 5000,
      publicReputation: 'The Hustler'
    };
    pl.actionLog = [
      { id: 'act1', hustleId: 'cc', hustleName: 'Content Creation', timestamp: 100, deltaBag: 2000 }
    ];

    const review = compileAnnualReview(pl);

    expect(review.yearNumber).toBe(1);
    expect(review.definingMomentTitle).toBeDefined();
    expect(typeof review.definingMomentTitle).toBe('string');
    expect(review.definingMomentTitle.length).toBeGreaterThan(0);

    expect(review.definingMomentDescription).toBeDefined();
    expect(typeof review.definingMomentDescription).toBe('string');

    expect(review.netWorthChange).toBe(20000); // 25000 - 5000
    expect(review.emotionalSignature).toBeDefined();
    expect(typeof review.emotionalSignature).toBe('string');
  });

  test('Annual Review JSON serialization preserves Slide 0 preview fields cleanly', () => {
    const pl = getInitialStats(2) as PlayerStats;
    pl.month = 24;
    pl.bag = 100000;
    pl.annualCashEarned = 50000;

    const review = compileAnnualReview(pl);
    const serialized = JSON.stringify(review);
    const parsed = JSON.parse(serialized);

    expect(parsed.chapterTitle).toBe(review.chapterTitle);
    expect(parsed.definingMomentTitle).toBe(review.definingMomentTitle);
    expect(parsed.definingMomentDescription).toBe(review.definingMomentDescription);
    expect(parsed.netWorthChange).toBe(review.netWorthChange);
  });
});
