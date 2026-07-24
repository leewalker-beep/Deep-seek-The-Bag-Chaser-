import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../App';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Strategic Advisor Contextual Gating Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Start with a clean/reset state
    useGameStore.getState().resetGame('street_kid', 3);
  });

  it('blocks contextual triggers (e.g. HIGH HEAT) when BOTH month and completed hustles are below the threshold', async () => {
    // Set up a critical condition (heat = 90) but below play-threshold: month = 1, totalHustlesCompleted = 2
    useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        heat: 90,
        month: 1,
        totalHustlesCompleted: 2,
        guidanceSettings: 'Full',
        narrativeFlags: {
          advisor_shown_tier_STREET: true, // Mark tier onboarding as already shown so it does not interfere
        },
        advisorQueue: [],
        lastAdvisorPopupMonth: -1,
      }
    });

    render(<App />);

    // Wait a brief tick for react effects
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Verify "🚨 CRITICAL HEAT WARNING" is NOT rendered
    const warningText = screen.queryByText(/CRITICAL HEAT WARNING/i);
    expect(warningText).toBeNull();
  });

  it('allows contextual triggers when month >= 3 even if completed hustles < 5', async () => {
    // Set up critical condition (heat = 90) and month = 3, but completed hustles = 2
    useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        heat: 90,
        month: 3,
        totalHustlesCompleted: 2,
        guidanceSettings: 'Full',
        narrativeFlags: {
          advisor_shown_tier_STREET: true, // Mark tier onboarding as already shown so it does not interfere
        },
        advisorQueue: [],
        lastAdvisorPopupMonth: -1,
      }
    });

    render(<App />);

    // We expect the "🚨 CRITICAL HEAT WARNING" to fire because month >= 3
    const warningHeader = await screen.findByText(/🚨 CRITICAL HEAT WARNING/i);
    expect(warningHeader).toBeTruthy();
  });

  it('allows contextual triggers when completed hustles >= 5 even if month < 3', async () => {
    // Set up critical condition (heat = 90) and month = 1, but completed hustles = 5
    useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        heat: 90,
        month: 1,
        totalHustlesCompleted: 5,
        guidanceSettings: 'Full',
        narrativeFlags: {
          advisor_shown_tier_STREET: true, // Mark tier onboarding as already shown so it does not interfere
        },
        advisorQueue: [],
        lastAdvisorPopupMonth: -1,
      }
    });

    render(<App />);

    // We expect the "🚨 CRITICAL HEAT WARNING" to fire because totalHustlesCompleted >= 5
    const warningHeader = await screen.findByText(/🚨 CRITICAL HEAT WARNING/i);
    expect(warningHeader).toBeTruthy();
  });

  it('ensures tier onboarding prompts are completely unaffected by the contextual play-threshold gate', async () => {
    // Set up month = 1, completed hustles = 0, but currentTier = STREET and shown flag is false
    useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        month: 1,
        totalHustlesCompleted: 0,
        guidanceSettings: 'Full',
        narrativeFlags: {}, // Empty so onboarding triggers
        advisorQueue: [],
        lastAdvisorPopupMonth: -1,
      }
    });

    render(<App />);

    // We expect the "WELCOME TO STREET" onboarding modal to display immediately, bypassing the gate
    const welcomeHeader = await screen.findByText(/WELCOME TO STREET/i);
    expect(welcomeHeader).toBeTruthy();
  });
});
