import { describe, it, expect } from 'vitest';
import { getEffectiveHustleStats } from '../engine/mathEngine';
import { advanceMonth } from '../engine/advancementEngine';
import { PlayerStats, Tier, MarketType } from '../types/game';
import { WORLD_EVENTS } from '../config/worldEvents';
import { HUSTLE_SECTORS } from '../config/sectors';

describe('World Event Sector Modifiers', () => {
  const basePlayer: PlayerStats = {
    currentTier: 'MUD' as Tier,
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
    mentalHealth: 100,
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

  it('applies positive sector modifiers correctly', () => {
    const hustleId = 'r_vending'; // Retail sector
    const sector = HUSTLE_SECTORS[hustleId];
    expect(sector).toBe('Retail');

    const economicBoom = WORLD_EVENTS.find(e => e.id === 'economic_boom')!;
    const modifier = economicBoom.sectorModifiers['Retail']!;
    expect(modifier).toBeGreaterThan(0);

    const player = {
      ...basePlayer,
      activeWorldEvent: { eventId: 'economic_boom', monthsRemaining: 5 }
    };

    const effective = getEffectiveHustleStats(hustleId, {} as any, player, 1, { ...baseResult });

    expect(effective.yieldCash).toBe(Math.floor(baseResult.yieldCash * (1 + modifier)));
  });

  it('applies negative sector modifiers correctly', () => {
    const hustleId = 'r_vending'; // Retail sector
    const recession = WORLD_EVENTS.find(e => e.id === 'recession')!;
    const modifier = recession.sectorModifiers['Retail']!;
    expect(modifier).toBeLessThan(0);

    const player = {
      ...basePlayer,
      activeWorldEvent: { eventId: 'recession', monthsRemaining: 5 }
    };

    const effective = getEffectiveHustleStats(hustleId, {} as any, player, 1, { ...baseResult });

    expect(effective.yieldCash).toBe(Math.floor(baseResult.yieldCash * (1 + modifier)));
  });

  it('does not apply modifier if hustle is in a different sector', () => {
    const hustleId = 'r_labor'; // Construction sector
    const sector = HUSTLE_SECTORS[hustleId];
    expect(sector).toBe('Construction');

    const aiBubble = WORLD_EVENTS.find(e => e.id === 'ai_bubble')!;
    expect(aiBubble.sectorModifiers['Construction']).toBeUndefined();

    const player = {
      ...basePlayer,
      activeWorldEvent: { eventId: 'ai_bubble', monthsRemaining: 5 }
    };

    const effective = getEffectiveHustleStats(hustleId, {} as any, player, 1, { ...baseResult });

    expect(effective.yieldCash).toBe(baseResult.yieldCash);
  });

  it('applies sector modifiers to passive income in advanceMonth', () => {
    // Setup a player with a SaaS hustle (Technology sector)
    const player: PlayerStats = {
      ...basePlayer,
      currentTier: 'STARTUP' as Tier,
      hustleLevels: { saas_mvp: 1 },
      hustleBranchIds: { saas_mvp: 'l1' },
      activeWorldEvent: { eventId: 'ai_bubble', monthsRemaining: 5 },
      marketCycle: { realEstate: 'normal', vc: { tech: 'normal', biotech: 'normal', energy: 'normal' } },
      flexAssets: {},
      artists: [],
      dynamicPassives: {},
      activeChallenges: [],
    } as any;

    // AI Bubble modifier for Technology is 0.7
    // saas_mvp level 1 passive yield is 2000
    const aiBubble = WORLD_EVENTS.find(e => e.id === 'ai_bubble')!;
    const modifier = aiBubble.sectorModifiers['Technology']!;

    const result = advanceMonth(player, 'NORMAL');

    // Expected passive income = 2000 * (1 + 0.7) = 3400
    expect(result.passiveIncome).toBe(3400);
    expect(result.passiveBreakdown.sources.find(s => s.id === 'saas_mvp')?.amount).toBe(3400);
  });
});
