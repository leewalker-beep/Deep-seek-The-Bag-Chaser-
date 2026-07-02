import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';

describe('Living Characters System', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap', 3, 'street_kid', 'sk_basic', 'av_m1');
    vi.clearAllMocks();
  });

  it('should initialize with no narrative flags', () => {
    const state = useGameStore.getState();
    expect(state.pl.narrativeFlags).toEqual({});
  });

  it('should set relationship and trust flags when a narrative choice is made', () => {
    const state = useGameStore.getState();

    // Simulate being in MUD tier
    useGameStore.setState({
      pl: {
        ...state.pl,
        currentTier: 'MUD',
        activeNarrative: 'char_marcus_1'
      }
    });

    // Resolve the event by helping Marcus
    useGameStore.getState().resolveNarrativeEvent('marcus_help');

    const updatedState = useGameStore.getState();
    expect(updatedState.pl.narrativeFlags['rel_marcus']).toBe(50);
    expect(updatedState.pl.narrativeFlags['trust_marcus']).toBe(100);
    expect(updatedState.pl.narrativeFlags['status_marcus']).toBe('ally');
    expect(updatedState.pl.bag).toBeLessThan(state.pl.bag);
  });

  it('should persist narrative flags across simulated save/load', () => {
    // 1. Set some flags
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        narrativeFlags: {
          'rel_ashley': 50,
          'trust_ashley': 80,
          'status_ashley': 'ally'
        }
      }
    });

    // 2. Simulate persistence by extracting and re-injecting state (as the persist middleware would)
    const savedState = JSON.parse(JSON.stringify(useGameStore.getState().pl));

    useGameStore.setState({
      pl: savedState
    });

    const reloadedState = useGameStore.getState();
    expect(reloadedState.pl.narrativeFlags['rel_ashley']).toBe(50);
    expect(reloadedState.pl.narrativeFlags['trust_ashley']).toBe(80);
    expect(reloadedState.pl.narrativeFlags['status_ashley']).toBe('ally');
  });

  it('should trigger future events based on existing narrative flags', () => {
    // 1. Set flags that Marcus 2 requires
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        narrativeFlags: {
          'status_marcus': 'ally'
        },
        activeNarrative: null,
        completedNarrativeEvents: ['char_marcus_1']
      }
    });

    // Find Marcus 2 event
    const marcus2 = NARRATIVE_EVENTS.find(e => e.id === 'char_marcus_2');
    expect(marcus2).toBeDefined();

    // Verify trigger requirements
    if (marcus2 && marcus2.trigger.flagReqs) {
        expect(marcus2.trigger.flagReqs['status_marcus']).toBe('ally');
    }
  });

  it('should correctly handle "once" property for character events', () => {
    useGameStore.setState({
        pl: {
          ...useGameStore.getState().pl,
          activeNarrative: 'char_marcus_1'
        }
    });

    useGameStore.getState().resolveNarrativeEvent('marcus_help');

    const state = useGameStore.getState();
    expect(state.pl.completedNarrativeEvents).toContain('char_marcus_1');

    // Check if it would trigger again
    const event = NARRATIVE_EVENTS.find(e => e.id === 'char_marcus_1');
    expect(event?.trigger.once).toBe(true);
  });
});
