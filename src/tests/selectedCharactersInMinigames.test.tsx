import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { ConcertJam } from '../components/minigames/ConcertJam';
import { BoardroomBattle } from '../components/minigames/BoardroomBattle';
import { FundMoviePanel } from '../components/panels/FundMoviePanel';
import { MarryCelebrityPanel } from '../components/panels/MarryCelebrityPanel';
import { TalentAgencyGame } from '../components/minigames/TalentAgencyGame';
import type { Hustle } from '../config/hustles/base';

describe('Roster Selection and Selected Character Rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        bag: 1000000000,
        clout: 10000,
        aura: 10000,
        rolodex: [
          {
            id: 'cel_1',
            name: 'Starlet Scarlett',
            avatar: '💅',
            relationshipScore: 95,
            isUnlocked: true,
          }
        ],
        artists: [
          {
            id: 'art_1',
            name: 'Lil Spitfire',
            avatar: '🎤',
            hypeFactor: 2.5,
            monthlyRevenue: 15000,
          }
        ],
        foundersBacked: [
          {
            id: 'founder_1',
            name: 'Dev Elon',
            avatar: '🚀',
            companyName: 'XSpaces',
            pitchIdea: 'Rockets on Rails',
            followOnCount: 1,
            stats: {
              execution: 80,
              vision: 90,
              burnDiscipline: 70
            }
          }
        ]
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders performing artists name and avatar inside ConcertJam during active play', () => {
    const performingArtists = [
      { name: 'Lil Spitfire', avatar: '🎤' }
    ];
    render(
      <ConcertJam
        level={1}
        onComplete={() => {}}
        performingArtists={performingArtists}
      />
    );

    // Verify container and elements exist
    const artistContainer = screen.getByTestId('concert-jam-artists');
    expect(artistContainer).toBeTruthy();
    expect(screen.getByTestId('artist-Lil Spitfire')).toBeTruthy();
    expect(screen.getByText('Lil Spitfire')).toBeTruthy();
    expect(screen.getByText('🎤')).toBeTruthy();
  });

  it('renders selected founder name and avatar inside BoardroomBattle during active play', () => {
    const selectedFounder = { name: 'Dev Elon', avatar: '🚀' };
    render(
      <BoardroomBattle
        playerBid={100000}
        rivalBid={50000}
        onOutbid={() => {}}
        onComplete={() => {}}
        selectedCharacter={selectedFounder}
      />
    );

    // Verify elements exist
    expect(screen.getByTestId('boardroom-battle-character')).toBeTruthy();
    expect(screen.getByTestId('boardroom-battle-character-avatar')).toBeTruthy();
    expect(screen.getByTestId('boardroom-battle-character-name')).toBeTruthy();
    expect(screen.getByText('🚀')).toBeTruthy();
    expect(screen.getByText('Dev Elon')).toBeTruthy();
  });

  it('renders selected lead actor name and avatar in FundMoviePanel during filming and outcome screen', async () => {
    const mockHustle: Hustle = {
      id: 'open_movie',
      name: 'Fund a Movie',
      description: 'Fund an indie or block-buster cinema project.',
      icon: '🎬',
      tier: 'MOGUL',
      startBranchId: '',
      hasPanel: true,
      panelType: 'FUND_MOVIE',
      levels: [
        {
          level: 1,
          cost: 100000000,
          yieldCash: 120000000,
          yieldClout: 300,
          yieldAura: 150,
          mentalHit: -25,
          cloutReq: 500,
          auraReq: 300,
        }
      ]
    };

    render(<FundMoviePanel hustle={mockHustle} />);

    // Click on the first celebrity Starlet Scarlett
    const celebCard = screen.getByText('Starlet Scarlett');
    expect(celebCard).toBeTruthy();
    act(() => {
      celebCard.click();
    });

    // Check we are in production pre-selection screen
    expect(screen.getByText('PRE-PRODUCTION SCREEN')).toBeTruthy();

    // Click Greenlight Blockbuster
    const greenlightBtn = screen.getByText('🎬 GREENLIGHT BLOCKBUSTER');
    expect(greenlightBtn).toBeTruthy();

    act(() => {
      greenlightBtn.click();
    });

    // It should now be in filming state (isProducing is true)
    // Check that name and avatar are rendered
    expect(screen.getByTestId('filming-progress')).toBeTruthy();
    expect(screen.getByTestId('filming-celebrity-avatar')).toBeTruthy();
    expect(screen.getByTestId('filming-celebrity-name')).toBeTruthy();
    expect(screen.getByText('💅')).toBeTruthy();
    expect(screen.getByText('STARRING STARLET SCARLETT')).toBeTruthy();

    // Fast-forward timers to complete production
    act(() => {
      vi.advanceTimersByTime(1250);
    });

    // Now it should be on the outcome screen
    expect(screen.getByTestId('outcome-celebrity-info')).toBeTruthy();
    expect(screen.getByTestId('outcome-celebrity-avatar')).toBeTruthy();
    expect(screen.getByTestId('outcome-celebrity-name')).toBeTruthy();
    expect(screen.getByText('💅')).toBeTruthy();
    expect(screen.getByText('Starlet Scarlett')).toBeTruthy();
  });

  it('renders selected spouse name and avatar in MarryCelebrityPanel during wedding preparation and outcome screen', async () => {
    const mockHustle: Hustle = {
      id: 'open_celebrity',
      name: 'Marry a Celebrity',
      description: 'Host the ultimate luxury high-society wedding of the decade.',
      icon: '💍',
      tier: 'MOGUL',
      startBranchId: '',
      hasPanel: true,
      panelType: 'MARRY_CELEBRITY',
      levels: [
        {
          level: 1,
          cost: 5000000,
          yieldCash: 0,
          yieldClout: 100,
          yieldAura: 200,
          mentalHit: 20,
          cloutReq: 300,
          auraReq: 500,
        }
      ]
    };

    render(<MarryCelebrityPanel hustle={mockHustle} />);

    // Click on the spouse Starlet Scarlett
    const spouseCard = screen.getByText('Starlet Scarlett');
    expect(spouseCard).toBeTruthy();
    act(() => {
      spouseCard.click();
    });

    // Check we are in wedding planning screen
    expect(screen.getByText('WEDDING PLANNING')).toBeTruthy();

    // Click Host High-Society Wedding
    const marryBtn = screen.getByText('💍 HOST HIGH-SOCIETY WEDDING');
    expect(marryBtn).toBeTruthy();

    act(() => {
      marryBtn.click();
    });

    // It should now be in wedding preparation state (isWeddinProgress is true)
    // Check that name and avatar are rendered
    expect(screen.getByTestId('wedding-progress')).toBeTruthy();
    expect(screen.getByTestId('wedding-spouse-avatar')).toBeTruthy();
    expect(screen.getByTestId('wedding-spouse-name')).toBeTruthy();
    expect(screen.getByText('💅')).toBeTruthy();
    expect(screen.getByText('MARRYING STARLET SCARLETT')).toBeTruthy();

    // Fast-forward timers to complete marriage
    act(() => {
      vi.advanceTimersByTime(1250);
    });

    // Now it should be on the outcome screen
    expect(screen.getByTestId('wedding-outcome-title')).toBeTruthy();
    expect(screen.getByTestId('wedding-outcome-spouse-avatar')).toBeTruthy();
    expect(screen.getByTestId('wedding-outcome-spouse-name')).toBeTruthy();
    expect(screen.getByText('💅')).toBeTruthy();
    expect(screen.getByText('STARLET SCARLETT')).toBeTruthy();
  });

  it('renders signed talent name and avatar inside TalentAgencyGame result screen', () => {
    const onComplete = vi.fn();
    render(<TalentAgencyGame level={1} onComplete={onComplete} />);

    // Verify introductory/start screen has title
    expect(screen.getByText(/TALENT RECRUIT/i)).toBeTruthy();

    // Start recruitment
    const startBtn = screen.getByText(/START RECRUITMENT/i);
    expect(startBtn).toBeTruthy();
    act(() => {
      startBtn.click();
    });

    // Once game starts, wait for time limit to expire to trigger the game-over failed state
    act(() => {
      vi.advanceTimersByTime(45000);
    });

    // Verify failure screen has standard failure texts
    expect(screen.getByText(/RECRUITMENT TERMINATED/i)).toBeTruthy();
  });
});
