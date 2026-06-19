
import { describe, it, expect } from 'vitest';
import { create } from 'zustand';
import { createPresidentSlice } from '../store/slices/presidentSlice';
import { createHustleSlice } from '../store/slices/hustleSlice';
import { createPlayerStatsSlice } from '../store/slices/playerStatsSlice';
import { createUISlice } from '../store/slices/uiSlice';
import { createMarketSlice } from '../store/slices/marketSlice';
import { createAchievementSlice } from '../store/slices/achievementSlice';
import { createChallengeSlice } from '../store/slices/challengeSlice';
import { GameState } from '../types/game';

const useStore = create<GameState>()((set, get, api) => ({
  ...createUISlice(set, get, api),
  ...createMarketSlice(set, get, api),
  ...createPlayerStatsSlice(set, get, api),
  ...createHustleSlice(set, get, api),
  ...createAchievementSlice(set, get, api),
  ...createChallengeSlice(set, get, api),
  ...createPresidentSlice(set, get, api),
  addTickerMessage: (text: string) => set(state => ({ news: [text, ...state.news] })),
}));

describe('Presidential Clamping', () => {
  it('should clamp approvalRating between 0 and 100', () => {
    const store = useStore;
    store.getState().resetGame(3);

    // Test upward clamping
    store.setState(s => ({ pl: { ...s.pl, approvalRating: 95, clout: 1000, aura: 1000, federalBudget: 100000000 } }));
    // Issue an order that gives +10 approval
    store.getState().issueExecutiveOrder('tax_cut');
    expect(store.getState().pl.approvalRating).toBe(100);

    // Test downward clamping
    store.setState(s => ({ pl: { ...s.pl, approvalRating: 5 } }));
    // Trade Tariffs gives -10 approval
    store.getState().issueExecutiveOrder('tariffs');
    expect(store.getState().pl.approvalRating).toBe(0);
  });

  it('should maintain clamping across two terms', () => {
    const store = useStore;
    store.getState().resetGame(3);

    // Force high approval and advance to re-election
    store.setState(s => ({
        pl: {
            ...s.pl,
            approvalRating: 150, // Should be clamped by enforceStatCaps next set
            presidentMonth: 47,
            currentTier: 'PRESIDENT',
            clout: 10000,
            aura: 10000,
            federalBudget: 1000000000
        }
    }));

    // Trigger month advancement to 48 (re-election)
    store.getState().advancePresidentialMonth();

    expect(store.getState().pl.approvalRating).toBeLessThanOrEqual(100);
    expect(store.getState().pl.isSecondTerm).toBe(true);

    // Repeatedly fire orders to try and break clamping
    for(let i=0; i<10; i++) {
        store.getState().issueExecutiveOrder('healthcare'); // +30 approval
    }
    expect(store.getState().pl.approvalRating).toBe(100);
  });
});
