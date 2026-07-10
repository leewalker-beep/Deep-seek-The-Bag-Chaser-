import { describe, it, expect } from 'vitest';
import { getEffectiveHustleStats, calculateHustleStatsAdditive, HustleMathContext } from '../engine/mathEngine';
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

  describe('calculateHustleStatsAdditive', () => {
    const baseContext: HustleMathContext = {
      baseYield: 1000,
      levelMult: 2,
      badgeCount: 0,
      tierBonusFraction: 0,
      legacyPoints: 0,
      specializationBonusFraction: 0,
      sentimentModifier: 0,
      worldEventModifier: 0,
      flexAssetBonusFraction: 0,
    };

    it('calculates the baseline scaled by level mult correctly', () => {
      const result = calculateHustleStatsAdditive(baseContext);
      // baseYield (1000) * levelMult (2) * (1 + 0) = 2000
      expect(result).toBe(2000);
    });

    it('stacks mastery badges and tier bonuses additively', () => {
      const context: HustleMathContext = {
        ...baseContext,
        badgeCount: 3, // +15% linear yield (3 * 0.05)
        tierBonusFraction: 0.04, // +4% linear increment
      };
      const result = calculateHustleStatsAdditive(context);
      // baseScaledYield = 2000
      // totalBonus = 0.15 + 0.04 = 0.19
      // final = Math.floor(2000 * 1.19) = 2380
      expect(result).toBe(2380);
    });

    it('incorporates class specialization, legacy points, and flex assets additively', () => {
      const context: HustleMathContext = {
        ...baseContext,
        specializationBonusFraction: 0.20, // +20%
        legacyPoints: 150, // +15% (150 * 0.001)
        flexAssetBonusFraction: 0.10, // +10%
      };
      const result = calculateHustleStatsAdditive(context);
      // baseScaledYield = 2000
      // totalBonus = 0.20 + 0.15 + 0.10 = 0.45
      // final = Math.floor(2000 * 1.45) = 2900
      expect(result).toBe(2900);
    });

    it('clamps dynamic environment modifier fraction at -0.7 minimum and 1.5 maximum', () => {
      // Test dynamic environment clamping on positive end (1.5)
      const positiveContext: HustleMathContext = {
        ...baseContext,
        sentimentModifier: 1.2,
        worldEventModifier: 0.6, // Total dynamic = 1.8 -> clamped to 1.5
      };
      const resultPos = calculateHustleStatsAdditive(positiveContext);
      // baseScaledYield = 2000
      // totalBonus = 1.5 (clamped)
      // final = Math.floor(2000 * 2.5) = 5000
      expect(resultPos).toBe(5000);

      // Test dynamic environment clamping on negative end (-0.7)
      const negativeContext: HustleMathContext = {
        ...baseContext,
        sentimentModifier: -0.6,
        worldEventModifier: -0.5, // Total dynamic = -1.1 -> clamped to -0.7
      };
      const resultNeg = calculateHustleStatsAdditive(negativeContext);
      // baseScaledYield = 2000
      // totalBonus = -0.7
      // final = Math.floor(2000 * 0.3) = 6000
      expect(resultNeg).toBe(600);
    });

    it('enforces a minimum yield of 0', () => {
      const context: HustleMathContext = {
        ...baseContext,
        baseYield: -100, // Negative base yield to force a negative calculated yield
        levelMult: 1,
      };
      const result = calculateHustleStatsAdditive(context);
      // baseScaledYield = -100
      // totalBonusFraction = 0
      // finalCalculatedYield = -100
      // Math.max(0, -100) = 0
      expect(result).toBe(0);
    });
  });
});
