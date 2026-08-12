import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConcertJam } from '../components/minigames/ConcertJam';

// Synchronous React.lazy mock to bypass Vitest JSDOM async dynamic-import timing issues
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    lazy: (fn: any) => {
      const fnStr = fn.toString();
      if (fnStr.includes('ConcertJam')) {
        return ConcertJam;
      }
      return (props: any) => actual.createElement('div', null, 'Mocked Lazy Component');
    }
  };
});

import App from '../App';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Concert Jam Overlay Layering and Z-index Stacking', () => {
  beforeEach(() => {
    // Reset state
    const originalState = useGameStore.getState();
    useGameStore.setState({
      ...originalState,
      ph: 'PLAYING',
      isTutorialSkipped: true,
      pl: {
        ...originalState.pl,
        bag: 10000,
        artists: [
          { id: 'art-1', name: 'Rap Legend', avatar: '🎤', hypeFactor: 1.2, monthlyRevenue: 100, royaltyRate: 50, status: 'Active', hasReleased: true },
          { id: 'art-2', name: 'Pop Star', avatar: '👩‍🎤', hypeFactor: 1.5, monthlyRevenue: 200, royaltyRate: 80, status: 'Active', hasReleased: true },
          { id: 'art-3', name: 'Indie Band', avatar: '🎸', hypeFactor: 1.0, monthlyRevenue: 150, royaltyRate: 60, status: 'Active', hasReleased: true },
        ],
        activeLiveEvent: {
          id: 'first_employee',
          type: 'BREAKING_NEWS',
          title: 'FIRST EMPLOYEE',
          source: 'Local News',
          headline: 'Signed First Talent',
          body: 'A rising star is signed!',
          fameLevel: 'local',
        }, // Simulate FIRST_EMPLOYEE overlay being active (z-[3000])
        activeMinigame: {
          panelType: 'CONCERT_JAM_GAME',
          level: 2,
          initialHype: 60,
          performingArtistIds: ['art-1', 'art-2', 'art-3'],
        }, // ConcertJam triggered
      },
    });
  });

  it('should render the ConcertJam minigame overlay with critical minigame z-index style', async () => {
    render(<App />);

    // Assert that the Concert Jam Arena is in the DOM, waiting for hydration and render
    const header = await screen.findByText('🎸 CONCERT JAM ARENA', {}, { timeout: 5000 });
    expect(header).toBeTruthy();

    // Find the minigame overlay container
    const overlay = header.closest('.fixed.inset-0');
    expect(overlay).toBeTruthy();

    // Check style/class for our critical minigame layer (z-[4000])
    expect(overlay?.className).toContain('z-[4000]');

    // Also assert style maps to Z_INDEX.CRITICAL_MINIGAME (4000)
    const style = (overlay as HTMLElement).style;
    expect(style.zIndex).toBe('4000');
  });
});
