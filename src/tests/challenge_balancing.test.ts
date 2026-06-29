import { describe, it, expect } from 'vitest';
import { generateDynamicChallenges } from '../engine/challengeEngine';
import { PlayerStats, Tier, MarketType } from '../types/game';
import { TIER_REQUIREMENTS } from '../config/tiers';

describe('Dynamic Challenge Reward Balancing', () => {
  const basePlayer: PlayerStats = {
    currentTier: 'STREET' as Tier,
    bag: 100000,
    clout: 100,
    aura: 100,
    activeWorldEvent: null,
    lastPassiveBreakdown: { finalTotal: 10000 } as any,
    // other required fields
  } as any;

  it('scales rewards based on advancement costs', () => {
    // STREET -> STARTUP advancement fee is $200k
    const streetChallenges = generateDynamicChallenges({ ...basePlayer, currentTier: 'STREET' }, 'NORMAL');
    const streetRewardSum = streetChallenges.reduce((sum, c) => sum + c.reward.cash, 0);

    // MOGUL -> PRESIDENT advancement fee is $200M
    const mogulChallenges = generateDynamicChallenges({ ...basePlayer, currentTier: 'MOGUL', bag: 1000000000, lastPassiveBreakdown: { finalTotal: 10000000 } as any }, 'NORMAL');
    const mogulRewardSum = mogulChallenges.reduce((sum, c) => sum + c.reward.cash, 0);

    expect(mogulRewardSum).toBeGreaterThan(streetRewardSum);

    // Check if mogul reward is roughly proportional to its higher costs
    // $200M vs $200k is 1000x difference
    expect(mogulRewardSum / streetRewardSum).toBeGreaterThan(100);
  });

  it('caps rewards based on monthly income to prevent runaway economy', () => {
    const nextTier = 'STARTUP';
    const advancementFee = TIER_REQUIREMENTS[nextTier].fee; // $200k
    const baseRewardPool = advancementFee * 0.03; // $6k

    // If income is very low, reward should be capped
    const lowIncomePlayer = {
      ...basePlayer,
      currentTier: 'STREET' as Tier,
      lastPassiveBreakdown: { finalTotal: 1000 } as any // Only $1k income
    };

    const challenges = generateDynamicChallenges(lowIncomePlayer, 'NORMAL');
    challenges.forEach(c => {
      // Reward should not exceed 2 * monthly income ($2k)
      expect(c.reward.cash).toBeLessThanOrEqual(2000);
    });
  });
});
