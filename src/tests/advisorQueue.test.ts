import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('Advisor Popup Queue System', () => {
  beforeEach(() => {
    // Reset state before each test
    useGameStore.getState().resetGame('street_kid', 3);
  });

  it('should initialize with lastAdvisorPopupMonth as -1 and advisorQueue as an empty array', () => {
    const pl = useGameStore.getState().pl;
    expect(pl.lastAdvisorPopupMonth).toBe(-1);
    expect(pl.advisorQueue).toBeDefined();
    expect(pl.advisorQueue?.length).toBe(0);
  });

  it('should allow adding multiple items to the advisor queue', () => {
    // Simulate adding multiple items manually to verify the queue structure
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        advisorQueue: [
          { id: 'trigger_1', title: 'Trigger One' },
          { id: 'trigger_2', title: 'Trigger Two' }
        ]
      }
    }));

    const pl = useGameStore.getState().pl;
    expect(pl.advisorQueue?.length).toBe(2);
    expect(pl.advisorQueue?.[0].id).toBe('trigger_1');
    expect(pl.advisorQueue?.[1].id).toBe('trigger_2');
  });

  it('should support popping/shifting items from the queue correctly', () => {
    // Set up queue
    useGameStore.setState(state => ({
      pl: {
        ...state.pl,
        advisorQueue: [
          { id: 'trigger_1', title: 'Trigger One' },
          { id: 'trigger_2', title: 'Trigger Two' }
        ]
      }
    }));

    // Simulate dequeueing first item
    const currentQueue = useGameStore.getState().pl.advisorQueue || [];
    const [nextPrompt, ...remainingQueue] = currentQueue;

    useGameStore.setState(state => {
      const updatedFlags = { ...(state.pl.narrativeFlags || {}) };
      if (nextPrompt.id) {
        updatedFlags[nextPrompt.id] = true;
      }
      return {
        pl: {
          ...state.pl,
          lastAdvisorPopupMonth: state.pl.month,
          advisorQueue: remainingQueue,
          narrativeFlags: updatedFlags
        }
      };
    });

    const pl = useGameStore.getState().pl;
    expect(pl.lastAdvisorPopupMonth).toBe(pl.month);
    expect(pl.advisorQueue?.length).toBe(1);
    expect(pl.advisorQueue?.[0].id).toBe('trigger_2');
    expect(pl.narrativeFlags?.trigger_1).toBe(true);
  });
});
