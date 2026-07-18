import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntertainmentDashboard } from '../components/dashboard/EntertainmentDashboard';
import { useGameStore } from '../store/gameStore';
import { completeConcertPerformanceWithLineup } from '../store/slices/hustleSlice';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EntertainmentDashboard & Concert Performance Flow', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        bag: 10000,
        artists: [
          { id: 'artist-1', name: 'Rap Legend', avatar: '🎤', hypeFactor: 1.2, monthlyRevenue: 100, royaltyRate: 50, status: 'Active', hasReleased: true },
          { id: 'artist-2', name: 'Pop Star', avatar: '👩‍🎤', hypeFactor: 1.5, monthlyRevenue: 200, royaltyRate: 80, status: 'Active', hasReleased: true },
          { id: 'artist-3', name: 'Indie Band', avatar: '🎸', hypeFactor: 1.0, monthlyRevenue: 150, royaltyRate: 60, status: 'Active', hasReleased: true },
        ],
        synergyPool: {
          grassrootsMarketing: 300,
          logisticsBonus: 10,
        },
        activeMinigame: null,
      },
      news: [],
    });
  });

  it('should render signed artists from the store roster', () => {
    render(<EntertainmentDashboard />);

    expect(screen.getByText('🎤 Rap Legend')).toBeTruthy();
    expect(screen.getByText('👩‍🎤 Pop Star')).toBeTruthy();
    expect(screen.getByText('🎸 Indie Band')).toBeTruthy();
  });

  it('should show placeholder text when no artists are signed', () => {
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        artists: [],
      },
    });

    render(<EntertainmentDashboard />);
    expect(screen.getByText('No active artists signed to contract.')).toBeTruthy();
  });

  it('should toggle artist selection when clicked', () => {
    render(<EntertainmentDashboard />);

    const artist1 = screen.getByText('🎤 Rap Legend');
    // Before click, selected line-up size is 0
    expect(screen.getByText('Selected line-up size: 0 artists')).toBeTruthy();

    // Click to select
    fireEvent.click(artist1);
    expect(screen.getByText('Selected line-up size: 1 artists')).toBeTruthy();

    // Click again to deselect
    fireEvent.click(artist1);
    expect(screen.getByText('Selected line-up size: 0 artists')).toBeTruthy();
  });

  it('should apply synergyPool grassroots marketing discount and deduct cost on gig trigger', () => {
    render(<EntertainmentDashboard />);

    // Select 1 artist
    fireEvent.click(screen.getByText('🎤 Rap Legend'));

    // Club Tour base cost is 1000, grassrootsMarketing discount is 300.
    // Final booking cost should be 1000 - 300 = 700.
    // Initial bag: 10000. Expected after trigger: 9300.
    const clubTourBtn = screen.getByRole('button', { name: /CLUB TOUR GIG/ });
    expect(clubTourBtn.removeAttribute('disabled')).toBeUndefined();

    fireEvent.click(clubTourBtn);

    const plState = useGameStore.getState().pl;
    expect(plState.bag).toBe(9300);
    // synergyPool grassrootsMarketing and logisticsBonus should be reset to 0
    expect(plState.synergyPool?.grassrootsMarketing).toBe(0);
    expect(plState.synergyPool?.logisticsBonus).toBe(0);

    // activeMinigame should be set correctly with CONCERT_JAM_GAME
    expect(plState.activeMinigame).toEqual({
      panelType: 'CONCERT_JAM_GAME',
      level: 1,
      initialHype: 60, // 50 + logisticsBonus (10) = 60
      performingArtistIds: ['artist-1'],
    });
  });

  it('should correctly execute completeConcertPerformanceWithLineup to calculate payout and hype boosts', () => {
    const draftPl = {
      bag: 5000,
      artists: [
        { id: 'artist-1', name: 'Rap Legend', avatar: '🎤', hypeFactor: 1.2, monthlyRevenue: 100 },
        { id: 'artist-2', name: 'Pop Star', avatar: '👩‍🎤', hypeFactor: 1.5, monthlyRevenue: 200 },
        { id: 'artist-3', name: 'Indie Band', avatar: '🎸', hypeFactor: 1.0, monthlyRevenue: 150 },
      ],
      activeMinigame: null,
    };
    const draftNewsFeed: string[] = [];

    // Let's complete a Concert Jam with performing artist 'artist-1'
    // score = 15, level = 1
    // Ticket sales payoff = floor(score * gigLevel * 30 * (collectiveLineupHype / lineup.length))
    // = floor(15 * 1 * 30 * (1.2 / 1)) = floor(450 * 1.2) = 540.
    // New bag should be 5000 + 540 = 5540.
    // Artist 1 gets hype boost: score * 0.02 * gigLevel = 15 * 0.02 * 1 = 0.3.
    // New Hype for Artist 1 = 1.2 + 0.3 = 1.5.
    // Artist 1 monthly revenue = floor(100 * (1.5 / 1.2)) = 125.
    completeConcertPerformanceWithLineup(draftPl, 15, 1, ['artist-1'], draftNewsFeed);

    expect(draftPl.bag).toBe(5540);
    expect(draftPl.artists[0].hypeFactor).toBeCloseTo(1.5, 3);
    expect(draftPl.artists[0].monthlyRevenue).toBe(125);

    // Other artists should remain unchanged
    expect(draftPl.artists[1].hypeFactor).toBe(1.5);
    expect(draftPl.artists[2].hypeFactor).toBe(1.0);

    // Verify news feed entry
    expect(draftNewsFeed[0]).toContain('LIVE WRAP: Show complete!');
    expect(draftNewsFeed[0]).toContain(' Your chosen lineup generated $540 in revenue.');
  });
});
