import React from 'react';
import { render, screen } from '@testing-library/react';
import { RestPanel } from '../components/panels/RestPanel';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe('RestPanel Tier-Based Filtering', () => {
  beforeEach(() => {
    // Reset or set up the state before each test
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'MUD',
        mentalHealth: 50,
      }
    });
  });

  it('should display only the standard nap and +50% minigames when in the MUD tier', () => {
    render(<RestPanel onClose={() => {}} />);

    // Assert "RECOVERY DECK (MUD)" is in the document
    expect(screen.getByText('RECOVERY DECK (MUD)')).toBeTruthy();

    // Assert baseline/standard is visible
    expect(screen.getByText('Standard Power Nap')).toBeTruthy();

    // Assert +50% minigames are visible
    expect(screen.getByText('🧘 Mindful Breathing')).toBeTruthy();
    expect(screen.getByText('🍵 The Perfect Brew')).toBeTruthy();

    // Assert +100% minigames are not visible
    expect(screen.queryByText('🌌 Constellation Tracing')).toBeNull();
    expect(screen.queryByText('☁️ Thought Clouds')).toBeNull();
  });

  it('should display standard nap and +100% advanced minigames when in STREET tier and above', () => {
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
      }
    });

    render(<RestPanel onClose={() => {}} />);

    // Assert "RECOVERY DECK (STREET)" is in the document
    expect(screen.getByText('RECOVERY DECK (STREET)')).toBeTruthy();

    // Assert baseline/standard is visible
    expect(screen.getByText('Standard Power Nap')).toBeTruthy();

    // Assert +50% minigames are not visible
    expect(screen.queryByText('🧘 Mindful Breathing')).toBeNull();
    expect(screen.queryByText('🍵 The Perfect Brew')).toBeNull();

    // Assert +100% minigames are visible
    expect(screen.getByText('🌌 Constellation Tracing')).toBeTruthy();
    expect(screen.getByText('☁️ Thought Clouds')).toBeTruthy();
  });
});
