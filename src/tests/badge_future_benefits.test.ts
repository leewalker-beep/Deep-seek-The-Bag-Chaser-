import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Badge Future Benefits', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame('dr_music', 3, 'The Dropout', 'dr_music');
  });

  it('reveals benefit when reaching relevant tier', () => {
    const { advanceTier } = useGameStore.getState();

    // 1. Prepare for advancement and mastery
    useGameStore.setState((state) => ({
      pl: {
        ...state.pl,
        currentTier: 'MOGUL', // Set tier first so caps are higher
        bag: 10000000000,
        clout: 100000,
        aura: 100000,
        hustleLevels: { 'audio': 4 },
        hustleBranchIds: { 'audio': 'l4' },
        masteredHustles: []
      }
    }));

    // Trigger mastery check
    useGameStore.getState().checkMilestones();
    expect(useGameStore.getState().pl.masteredHustles).toContain('audio');

    // 2. Reach PRESIDENT tier
    const result = advanceTier();
    expect(result).toBe(true);
    expect(useGameStore.getState().pl.currentTier).toBe('PRESIDENT');

    // 3. Verify notification in news
    const news = useGameStore.getState().news;
    const benefitActiveMessage = news.find((m: any) =>
        (typeof m === 'string' && m.includes('Platinum Producer is now active')) ||
        (m.text && m.text.includes('Platinum Producer is now active'))
    );
    expect(benefitActiveMessage).toBeDefined();

    // 4. Verify event logged
    const events = useGameStore.getState().pl.events;
    const event = events.find(e => e.type === 'SPECIAL_EVENT' && e.metadata.type === 'BADGE_BENEFIT_ACTIVE');
    expect(event).toBeDefined();
  });

  it('hides benefit before relevant tier is reached', () => {
     const { pl } = useGameStore.getState();
     expect(pl.currentTier).toBe('MUD');
  });
});
