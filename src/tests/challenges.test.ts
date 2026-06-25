import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Daily Challenges', () => {
  beforeEach(() => {
    // Reset store state
    const state = useGameStore.getState();
    state.resetGame('dropout', 3, 'DROPOUT', 'variation1');

    // Mock login to generate challenges
    useGameStore.setState({
      dailyChallenges: [
        { id: 'hustle_count', type: 'hustle_count', description: 'Complete 5 hustles', target: 5, current: 0, isCompleted: false, reward: { cash: 2000 } },
        { id: 'complete_15_hustles', type: 'hustle_count', description: 'Complete 15 hustles', target: 15, current: 0, isCompleted: false, reward: { cash: 10000 } },
        { id: 'earn_1M_dollars', type: 'earn_cash', description: 'Earn $1,000,000', target: 1000000, current: 0, isCompleted: false, reward: { cash: 50000 } }
      ]
    });
  });

  it('updates both low and high tier challenges of the same type', () => {
    const { updateChallengeProgress } = useGameStore.getState();

    updateChallengeProgress('hustle_count', 1);

    const challenges = useGameStore.getState().dailyChallenges;
    expect(challenges.find(c => c.id === 'hustle_count')?.current).toBe(1);
    expect(challenges.find(c => c.id === 'complete_15_hustles')?.current).toBe(1);
  });

  it('completes challenges when target is reached', () => {
    const { updateChallengeProgress } = useGameStore.getState();

    updateChallengeProgress('hustle_count', 5);

    const challenges = useGameStore.getState().dailyChallenges;
    expect(challenges.find(c => c.id === 'hustle_count')?.isCompleted).toBe(true);
    expect(challenges.find(c => c.id === 'complete_15_hustles')?.isCompleted).toBe(false);
    expect(challenges.find(c => c.id === 'complete_15_hustles')?.current).toBe(5);
  });

  it('handles high-tier cash challenges correctly', () => {
    const { updateChallengeProgress } = useGameStore.getState();

    updateChallengeProgress('earn_cash', 1000000);

    const challenges = useGameStore.getState().dailyChallenges;
    const highTier = challenges.find(c => c.id === 'earn_1M_dollars');
    expect(highTier?.current).toBe(1000000);
    expect(highTier?.isCompleted).toBe(true);
  });

  it('selects tier-appropriate challenges for ELITE tier', () => {
    const { processLogin, resetGame } = useGameStore.getState();

    // Set to ELITE tier
    resetGame('dropout', 3, 'DROPOUT', 'variation1');
    useGameStore.setState((state) => ({
      pl: { ...state.pl, currentTier: 'ELITE' },
      lastLoginDate: null // Ensure login process runs
    }));

    processLogin();

    const challenges = useGameStore.getState().dailyChallenges;
    expect(challenges.length).toBe(3);

    // Check if challenges are from ELITE pool (they should have 'elite_' prefix in ID based on my changes)
    challenges.forEach(c => {
      expect(c.id).toMatch(/^elite_/);
      // ELITE rewards should be in the $500K–$2M range as per requirements
      expect(c.reward.cash).toBeGreaterThanOrEqual(500000);
      expect(c.reward.cash).toBeLessThanOrEqual(2000000);
    });
  });

  it('selects tier-appropriate challenges for MOGUL tier', () => {
    const { processLogin, resetGame } = useGameStore.getState();

    // Set to MOGUL tier
    resetGame('dropout', 3, 'DROPOUT', 'variation1');
    useGameStore.setState((state) => ({
      pl: { ...state.pl, currentTier: 'MOGUL' },
      lastLoginDate: null
    }));

    processLogin();

    const challenges = useGameStore.getState().dailyChallenges;
    expect(challenges.length).toBe(3);

    challenges.forEach(c => {
      expect(c.id).toMatch(/^mogul_/);
      // MOGUL rewards should be in the $10M–$50M range
      expect(c.reward.cash).toBeGreaterThanOrEqual(10000000);
      expect(c.reward.cash).toBeLessThanOrEqual(50000000);
    });
  });
});
