import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { ScoopThePoop } from '../components/minigames/ScoopThePoop';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ScoopThePoop Minigame Biohazard Penalties', () => {
  beforeEach(() => {
    // Reset game store state
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        mentalHealth: 100,
        bag: 10000,
        aura: 50,
        inJail: false,
        jailMonthsRemaining: 0,
        jailSentenceTotal: 0,
        jailCharge: "",
        narrativeFlags: {}
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should apply Level 2 penalty (health drain and chemical rash narrative flag) when tapping biohazard', () => {
    vi.useFakeTimers();
    let randomCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCount++;
      if (randomCount === 1) return 0; // Choose index 0 ("0-0")
      if (randomCount === 2) return 0.05; // isBio = true
      return 0.5;
    });

    const onComplete = vi.fn();
    // Render at level 3 to spawn the biohazard tile
    const { rerender } = render(<ScoopThePoop level={3} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(800); // Trigger the spawner
    });

    // Verify biohazard tile spawned
    const biohazardBtn = screen.getByText('☣️');
    expect(biohazardBtn).toBeTruthy();

    // Rerender with level 2
    rerender(<ScoopThePoop level={2} onComplete={onComplete} />);

    // Tap the biohazard tile
    fireEvent.pointerDown(biohazardBtn);

    const storeState = useGameStore.getState().pl;
    expect(storeState.mentalHealth).toBe(90);
    expect(storeState.narrativeFlags.chemical_rash_turns).toBe(3);
    expect(storeState.inJail).toBe(false); // No jail on level 2
  });

  it('should apply Level 3 penalty (hospital lockout/jail and stat deduction) when tapping biohazard', () => {
    vi.useFakeTimers();
    let randomCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCount++;
      if (randomCount === 1) return 0; // Choose index 0 ("0-0")
      if (randomCount === 2) return 0.05; // isBio = true
      return 0.5;
    });

    const onComplete = vi.fn();
    render(<ScoopThePoop level={3} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(800); // Trigger the spawner
    });

    // Verify biohazard tile spawned
    const biohazardBtn = screen.getByText('☣️');
    expect(biohazardBtn).toBeTruthy();

    // Tap the biohazard tile
    fireEvent.pointerDown(biohazardBtn);

    const storeState = useGameStore.getState().pl;
    expect(storeState.bag).toBe(5000); // 10000 - 5000
    expect(storeState.mentalHealth).toBe(75); // 100 - 25
    expect(storeState.aura).toBe(35); // 50 - 15
    expect(storeState.inJail).toBe(true);
    expect(storeState.jailMonthsRemaining).toBe(3);
    expect(storeState.jailSentenceTotal).toBe(3);
    expect(storeState.jailCharge).toBe("Severe Toxemia Isolation Hospitalization");
  });
});
