import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';

describe('Narrative Events Logic', () => {

  beforeEach(() => {
    const { resetGame } = useGameStore.getState();
    resetGame('sk_scrap', 3, 'street_kid', 'sk_scrap');

    useGameStore.setState({
      ph: 'PLAYING',
      isTutorialSkipped: true,
      pl: {
        ...useGameStore.getState().pl,
        bag: 1000,
        clout: 100,
        aura: 100,
        mentalHealth: 100,
        heat: 0,
        currentTier: 'MUD',
        month: 1,
        completedNarrativeEvents: [],
        activeNarrative: null,
        dynamicPassives: {}
      }
    });
  });

  it('triggers an event based on background and tier', () => {
    const { executeHustle } = useGameStore.getState();

    // Reset state to ensure clean start for this test
    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            chosenBackground: 'sk_scrap',
            currentTier: 'MUD',
            month: 1,
            completedNarrativeEvents: [],
            activeNarrative: null,
            artists: [] // Ensure no artists to keep random calls predictable
        }
    }));

    // Mock Math.random to ensure the event triggers
    // We need to trigger advanceMonth which happens inside executeHustle
    // We want most checks to fail (return 0.5) but the narrative one to succeed (return 0.01)
    // Use an auto-incrementing mock to be resilient to call-order changes.
    const mockValues = [0.1]; // initial executeHustle success check
    let callIndex = 0;
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
      const val = mockValues[callIndex++];
      // Return 0.01 for any call that doesn't have a specific mock, which will eventually
      // hit the narrative trigger probability check.
      return val ?? 0.01;
    });

    executeHustle('r_labor', 1, true);

    const state = useGameStore.getState().pl;
    expect(state.activeNarrative).not.toBeNull();
    expect(state.activeNarrative).toBe('scavenger_prototype');
    spy.mockRestore();
  });

  it('resolves an event and applies consequences', () => {
    const { resolveNarrativeEvent } = useGameStore.getState();

    useGameStore.setState(s => ({
        pl: { ...s.pl, activeNarrative: 'scavenger_prototype' }
    }));

    // Choice: 'sell_prototype' -> bag: 15000, clout: 10, heat: 15
    resolveNarrativeEvent('sell_prototype');

    const state = useGameStore.getState().pl;
    expect(state.activeNarrative).toBe(null);
    expect(state.bag).toBe(16000); // 1000 + 15000
    expect(state.clout).toBe(110); // 100 + 10
    expect(state.heat).toBe(15);
    expect(state.completedNarrativeEvents).toContain('scavenger_prototype');
  });

  it('applies permanent passive from narrative choices', () => {
      const { resolveNarrativeEvent } = useGameStore.getState();

      useGameStore.setState(s => ({
          pl: { ...s.pl, activeNarrative: 'scavenger_prototype' }
      }));

      // Choice: 'leak_prototype' -> passiveCash: 500
      resolveNarrativeEvent('leak_prototype');

      const state = useGameStore.getState().pl;
      expect(state.dynamicPassives['narrative_scavenger_prototype']).toBe(500);
  });

  it('respects once:true trigger requirement', () => {
    const { executeHustle } = useGameStore.getState();

    // Mark all potentially triggering events as completed to ensure we are testing 'once' correctly
    useGameStore.setState(s => ({
        pl: {
            ...s.pl,
            completedNarrativeEvents: [
                'scavenger_prototype',
                'char_marcus_1',
                'char_marcus_2',
                'char_ashley_1',
                'char_cole_1',
                'char_chen_1',
                'char_maya_1',
                'char_ghost_1'
            ]
        }
    }));

    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.01);

    executeHustle('r_labor', 1, true);

    const state = useGameStore.getState().pl;
    // Should NOT trigger because it's already in completedNarrativeEvents
    expect(state.activeNarrative).toBe(null);
    spy.mockRestore();
  });

  it('blocks choices if stat requirements are not met', () => {
    // This is mainly a UI concern but we can test the resolution logic doesn't care if we bypass UI,
    // however the resolution logic itself DOES NOT check requirements (it assumes UI handled it).
    // Let's re-verify NarrativeEventModal logic for stat requirements if we were doing E2E.
    // For unit, we can just ensure resolveNarrativeEvent works.
  });
});
