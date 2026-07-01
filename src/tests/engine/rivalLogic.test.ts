import { describe, it, expect, vi } from 'vitest';
import { calculateHustleMath } from '../../engine/mathEngine';
import { advanceMonth } from '../../engine/advancementEngine';
import { getInitialStats } from '../../store/initialState';
import { PlayerStats } from '../../types/game';

describe('Rival Logic Mechanical Impact', () => {
  const baseLevelData = {
    level: 1,
    cost: 1000,
    yieldCash: 2000,
    yieldClout: 10,
    yieldAura: 10,
    mentalHit: -10,
    cloutReq: 0,
    auraReq: 0
  };

  describe('Math Engine Multipliers', () => {
    it('applies 25% cost increase when rival is dominant', () => {
      const result = calculateHustleMath('test', baseLevelData, 1, 1, 1, 1, 1, true, 0, 'RIVAL_DOMINANT');
      expect(result.cost).toBe(1250);
      expect(result.yieldCash).toBe(2000);
    });

    it('applies 15% yield bonus when player is dominant', () => {
      const result = calculateHustleMath('test', baseLevelData, 1, 1, 1, 1, 1, true, 0, 'PLAYER_DOMINANT');
      expect(result.cost).toBe(1000);
      expect(result.yieldCash).toBe(2300);
    });

    it('applies no bonus when neutral', () => {
      const result = calculateHustleMath('test', baseLevelData, 1, 1, 1, 1, 1, true, 0, 'NEUTRAL');
      expect(result.cost).toBe(1000);
      expect(result.yieldCash).toBe(2000);
    });
  });

  describe('Advancement Engine Threat Calculation', () => {
    it('sets RIVAL_DOMINANT when rival net worth > 2x player bag', () => {
      const pl = getInitialStats(3);
      pl.bag = 1000;
      pl.rivals = [{ id: 'r1', name: 'Rival', netWorth: 5000, currentBid: 0, isNpc: true, tier: 'MUD' }];

      const result = advanceMonth(pl, 'NORMAL');
      expect(result.newPl.rivalThreats['MUD']).toBe('RIVAL_DOMINANT');
    });

    it('sets PLAYER_DOMINANT when rival net worth < 0.5x player bag', () => {
      const pl = getInitialStats(3);
      pl.bag = 10000;
      pl.rivals = [{ id: 'r1', name: 'Rival', netWorth: 1000, currentBid: 0, isNpc: true, tier: 'MUD' }];

      const result = advanceMonth(pl, 'NORMAL');
      expect(result.newPl.rivalThreats['MUD']).toBe('PLAYER_DOMINANT');
    });
  });

  describe('Challenge Expiration', () => {
    it('penalizes 10% bag when challenge expires', () => {
      const pl = getInitialStats(3);
      pl.rivals = []; // Prevent new random challenges
      pl.bag = 10000;
      pl.activeChallenges = [{
        rivalId: 'r1',
        rivalName: 'Rival',
        tier: 'MUD',
        hustlesCompleted: 0,
        hustlesRequired: 3,
        monthsRemaining: 0
      }];

      const result = advanceMonth(pl, 'NORMAL');
      // Initial: 10000. Rent: 50. Bag after rent: 9950.
      // Penalty: 10% of 9950 = 995.
      // Final: 9950 - 995 = 8955.
      expect(result.newPl.bag).toBe(8955);
      expect(result.newPl.activeChallenges.length).toBe(0);
      expect(result.news.some(n => typeof n === 'object' && n.text.includes('CHALLENGE FAILED'))).toBe(true);
    });
  });
});
