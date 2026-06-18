import { describe, it, expect, vi } from 'vitest';
import { advanceMonth } from '../../engine/advancementEngine';
import { getInitialStats } from '../../store/initialState';
import { executeHustleAction } from '../../engine/hustleEngine';
import { HUSTLES } from '../../config/hustles/base';

describe('News Sentiment Engine', () => {
  it('should occasionally trigger a sentiment event in advanceMonth', () => {
    let pl = getInitialStats(3);
    let sentimentTriggered = false;

    // Run for 48 months (max duration of some effects)
    for (let i = 0; i < 48; i++) {
      const result = advanceMonth(pl, 'NORMAL');
      pl = result.newPl;
      if (pl.activeSentiment) {
        sentimentTriggered = true;
        break;
      }
    }

    expect(sentimentTriggered).toBe(true);
    expect(pl.activeSentiment).toBeDefined();
    expect(pl.activeSentiment?.monthsRemaining).toBeGreaterThan(0);
  });

  it('should decrement monthsRemaining and normalize sentiment', () => {
    let pl = getInitialStats(3);
    pl.activeSentiment = {
      category: 'crypto',
      label: 'Crypto Hype',
      multiplier: 1.5,
      monthsRemaining: 1
    };

    const result = advanceMonth(pl, 'NORMAL');
    expect(result.newPl.activeSentiment).toBeNull();
    expect(result.news.some(n => typeof n === 'object' && n.text.includes('Normalized'))).toBe(true);
  });

  it('should apply multiplier to matching hustles', () => {
    const pl = getInitialStats(3);
    pl.activeSentiment = {
      category: 'crypto',
      label: 'Crypto Hype',
      multiplier: 1.5,
      monthsRemaining: 5
    };

    // Meme coins is in 'crypto' category
    const levelData = HUSTLES.meme.branches!.l1;
    const result = executeHustleAction(
      'meme',
      pl,
      'NORMAL',
      levelData,
      1,
      1,
      true
    );

    // Default yield is 10000. 1.5x should be 15000.
    // Note: there might be other multipliers (legacy, etc), so we check relative to a run without sentiment.
    const plNoSentiment = getInitialStats(3);
    const resultNoSentiment = executeHustleAction(
      'meme',
      plNoSentiment,
      'NORMAL',
      levelData,
      1,
      1,
      true
    );

    expect(result.yieldCash).toBe(Math.floor(resultNoSentiment.yieldCash * 1.5));
    expect(result.tickerMessages?.some(m => m.text.includes('Crypto Hype'))).toBe(true);
  });

  it('should NOT apply multiplier to non-matching hustles', () => {
    const pl = getInitialStats(3);
    pl.activeSentiment = {
      category: 'crypto',
      label: 'Crypto Hype',
      multiplier: 1.5,
      monthsRemaining: 5
    };

    // Labor is NOT in 'crypto' category
    const levelData = HUSTLES.r_labor.branches!.l1;
    const result = executeHustleAction(
      'r_labor',
      pl,
      'NORMAL',
      levelData,
      1,
      1,
      true
    );

    const plNoSentiment = getInitialStats(3);
    const resultNoSentiment = executeHustleAction(
      'r_labor',
      plNoSentiment,
      'NORMAL',
      levelData,
      1,
      1,
      true
    );

    expect(result.yieldCash).toBe(resultNoSentiment.yieldCash);
  });
});
