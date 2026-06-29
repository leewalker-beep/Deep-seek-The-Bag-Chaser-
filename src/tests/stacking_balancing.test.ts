import { describe, it, expect } from 'vitest';
import { getEffectiveHustleStats } from '../engine/mathEngine';
import { PlayerStats, Tier, MarketType } from '../types/game';
import { HUSTLE_SECTORS } from '../config/sectors';

describe('Modifier Stacking Balancing', () => {
  const basePlayer: PlayerStats = {
    currentTier: 'STREET' as Tier,
    hustleLevels: {},
    hustleBranchIds: {},
    masteredHustles: [],
    flexAssets: {},
    activeSentiment: null,
    activeWorldEvent: null,
    legacyPoints: 0,
    unlockedLegacyUpgradeIds: [],
    tierBadges: [],
    rivals: [],
    dynamicPassives: {},
    activeSpecializationId: null,
    specializationHistory: [],
    aura: 0,
  } as any;

  const baseResult = {
    cost: 1000,
    yieldCash: 1000,
    yieldClout: 10,
    yieldAura: 10,
    mentalHit: -5,
    heatHit: 5,
    shieldTurns: 0,
  };

  it('caps combined dynamic multipliers at 2.5x', () => {
    const hustleId = 'techFlip'; // Technology sector

    const player = {
      ...basePlayer,
      activeSentiment: { category: 'tech', label: 'Tech Mania', multiplier: 2.0, monthsRemaining: 5 },
      activeWorldEvent: { eventId: 'ai_bubble', monthsRemaining: 5 } // AI Bubble modifier for Tech is 0.7 (1.7x total)
    };

    const effective = getEffectiveHustleStats(hustleId, {} as any, player, 1, { ...baseResult });

    // Without cap: 1000 * 2.0 * 1.7 = 3400 (3.4x)
    // With cap: 1000 * 2.5 = 2500
    expect(effective.yieldCash).toBe(2500);
  });

  it('prevents decimation with a 0.3x floor', () => {
    const hustleId = 'drop'; // Retail sector

    const player = {
      ...basePlayer,
      activeSentiment: { category: 'retail', label: 'Retail Crash', multiplier: 0.5, monthsRemaining: 5 },
      activeWorldEvent: { eventId: 'recession', monthsRemaining: 5 } // Recession modifier for Retail is -0.4 (0.6x total)
    };

    // Note: 'drop' is Retail. Recession (Retail -0.4) + Sentiment (0.5x)
    // Actually need to ensure 'retail' sentiment category exists.
    // Let's use 'crypto' since it's definitely there.

    const cryptoPlayer = {
        ...basePlayer,
        activeSentiment: { category: 'crypto', label: 'Crypto Winter', multiplier: 0.5, monthsRemaining: 5 },
        activeWorldEvent: { eventId: 'market_crash', monthsRemaining: 5 } // Market Crash modifier for Finance is -0.7 (0.3x total)
    };

    const cryptoHustleId = 'meme'; // Finance sector

    const effective = getEffectiveHustleStats(cryptoHustleId, {} as any, cryptoPlayer, 1, { ...baseResult });

    // Without cap: 1000 * 0.5 * 0.3 = 150 (0.15x)
    // With cap: 1000 * 0.3 = 300
    expect(effective.yieldCash).toBe(300);
  });
});
