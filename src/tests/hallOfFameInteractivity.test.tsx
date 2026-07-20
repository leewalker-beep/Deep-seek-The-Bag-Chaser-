import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { ShareCard } from '../components/ShareCard';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Header Stats Tooltip Interaction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...useGameStore.getState().pl,
        name: 'Test Player',
        currentTier: 'STREET',
        bag: 500000,
        clout: 100,
        aura: 50,
        mentalHealth: 100,
        heat: 0,
        actionLog: [],
      }
    });
  });

  it('toggles clout tooltip on click and closes on click outside', async () => {
    render(<App />);

    // Find the Clout stat container (wait for hydration skeleton to disappear)
    const cloutText = await screen.findByText('Clout');
    const cloutContainer = cloutText.closest('.stat-tooltip-container');
    expect(cloutContainer).toBeTruthy();

    // The tooltip is inside
    const cloutTooltip = screen.getByText('👑 Clout (Influence)');
    expect(cloutTooltip).toBeTruthy();

    // Check that it's initially hidden via opacity-0 and pointer-events-none
    const tooltipParent = cloutTooltip.closest('div');
    expect(tooltipParent?.className).toContain('opacity-0');
    expect(tooltipParent?.className).toContain('pointer-events-none');

    // Click Clout container to open
    fireEvent.click(cloutContainer!);
    expect(tooltipParent?.className).toContain('opacity-100');
    expect(tooltipParent?.className).toContain('pointer-events-auto');

    // Click Clout container again to close
    fireEvent.click(cloutContainer!);
    expect(tooltipParent?.className).toContain('opacity-0');
    expect(tooltipParent?.className).toContain('pointer-events-none');

    // Click to open again
    fireEvent.click(cloutContainer!);
    expect(tooltipParent?.className).toContain('opacity-100');

    // Click outside (e.g. document body)
    fireEvent.click(document.body);
    expect(tooltipParent?.className).toContain('opacity-0');
    expect(tooltipParent?.className).toContain('pointer-events-none');
  });
});

describe('ShareCard with Behavioral Blueprint', () => {
  it('renders correctly with blueprint prop', () => {
    const blueprintData = {
      primaryColor: 'GOLD' as const,
      dominantPersona: 'The Philanthropist',
      paceSeconds: 8.5,
      paceLabel: 'Deliberate',
      adviceRatio: 0.9,
      setbackRatio: 1.0,
      riskCadenceRatio: 0.1,
      orientationLabel: 'Others & Principles',
      headlineSynthesis: 'You played the long game exactly by the book.'
    };

    render(
      <ShareCard
        playerName="Champion Chaser"
        avatarId="av_m1"
        tier="STREET"
        finalBag={1000000}
        legacyScore={5000}
        months={24}
        endingTitle="The Sovereign"
        endingEmoji="👑"
        deathMessage="A peaceful retirement."
        deathBadge="RETIRED"
        blueprint={blueprintData}
      />
    );

    // Verify player details
    expect(screen.getByText('Champion Chaser')).toBeTruthy();
    expect(screen.getByText('👑 The Sovereign')).toBeTruthy();

    // Verify Blueprint details are present
    expect(screen.getByText('ADVISOR BLUEPRINT')).toBeTruthy();
    expect(screen.getByText('GOLD (The Philanthropist)')).toBeTruthy();
    expect(screen.getByText('"You played the long game exactly by the book."')).toBeTruthy();
    expect(screen.getByText('Deliberate')).toBeTruthy();
    expect(screen.getByText('Others & Principles')).toBeTruthy();
  });
});
