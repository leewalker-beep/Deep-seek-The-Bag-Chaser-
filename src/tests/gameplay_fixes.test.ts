import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';

describe('Gameplay Fixes Verification', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame('dropout', 1, 'Dropout', 'dropout_default');
  });

  describe('Fix 1: Heat Decay', () => {
    it('should reduce heat by 1 on successful hustle execution', () => {
      const { executeHustle } = useGameStore.getState();

      // Setup state with some heat
      useGameStore.setState((state) => ({
        pl: { ...state.pl, heat: 50, bag: 1000000, currentTier: 'STREET' }
      }));

      // Content Creation l1 has heatHit: 5 by default (from calculateHustleMath default)
      // executeHustleAction applies -1 decay on success.
      // Monthly decay in advanceMonth is -10 by default.
      // 50 (start) + 5 (hit) - 1 (decay) - 10 (monthly) = 44

      const result = executeHustle('cc', 1, true); // forceSuccess=true
      expect(result.success).toBe(true);
      expect(useGameStore.getState().pl.heat).toBe(44);

      // Execute again, should go to 44 + 5 - 1 - 10 = 38
      executeHustle('cc', 1, true);
      expect(useGameStore.getState().pl.heat).toBe(38);
    });

    it('should not reduce heat below 0', () => {
      const { executeHustle } = useGameStore.getState();

      // Setup state with 0 heat
      useGameStore.setState((state) => ({
        pl: { ...state.pl, heat: 0, bag: 1000000, currentTier: 'MUD' }
      }));

      // Ghost Mode l1 has heatHit: -5
      // 0 (start) + (-5) (hit) - 1 (decay) = -6 -> clamped to 0

      const result = executeHustle('r_ghost_mode', 1, true);
      expect(result.success).toBe(true);
      expect(useGameStore.getState().pl.heat).toBe(0);
    });
  });

  describe('Fix 2: OPEN Tier Passive Income', () => {
    it('open_island should be repeatable and increase passive income', () => {
      const { executeHustle } = useGameStore.getState();

      useGameStore.setState((state) => ({
        pl: { ...state.pl, bag: 10000000000, currentTier: 'OPEN', clout: 10000, aura: 10000 }
      }));

      // First execution
      const result1 = executeHustle('open_island', 1, true);
      expect(result1.success).toBe(true);
      expect(useGameStore.getState().pl.dynamicPassives['open_island']).toBe(10000000);

      // Second execution (repeatable)
      const result2 = executeHustle('open_island', 1, true);
      expect(result2.success).toBe(true);
      expect(useGameStore.getState().pl.dynamicPassives['open_island']).toBe(20000000);
    });

    it('open_sports_league should be repeatable and increase passive income', () => {
      const { executeHustle } = useGameStore.getState();

      useGameStore.setState((state) => ({
        pl: { ...state.pl, bag: 10000000000, currentTier: 'OPEN', clout: 10000, aura: 10000 }
      }));

      // First execution
      const result1 = executeHustle('open_sports_league', 1, true);
      expect(result1.success).toBe(true);
      expect(useGameStore.getState().pl.dynamicPassives['open_sports_league']).toBe(50000000);

      // Second execution
      const result2 = executeHustle('open_sports_league', 1, true);
      expect(result2.success).toBe(true);
      expect(useGameStore.getState().pl.dynamicPassives['open_sports_league']).toBe(100000000);
    });

    it('other OPEN hustles should remain zero passive', () => {
      const { executeHustle } = useGameStore.getState();

      useGameStore.setState((state) => ({
        pl: { ...state.pl, bag: 10000000000, currentTier: 'OPEN', clout: 10000, aura: 10000 }
      }));

      executeHustle('open_crypto', 1, true);
      // It might be 0 because result.passiveAdded (0) - levelData.passiveYield (0) = 0
      const passive = useGameStore.getState().pl.dynamicPassives['open_crypto'];
      expect(passive === undefined || passive === 0).toBe(true);

      executeHustle('open_celebrity', 1, true);
      const passiveCeleb = useGameStore.getState().pl.dynamicPassives['open_celebrity'];
      expect(passiveCeleb === undefined || passiveCeleb === 0).toBe(true);

      executeHustle('open_movie', 1, true);
      const passiveMovie = useGameStore.getState().pl.dynamicPassives['open_movie'];
      expect(passiveMovie === undefined || passiveMovie === 0).toBe(true);
    });
  });
});
