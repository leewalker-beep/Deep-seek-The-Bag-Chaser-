import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS } from '../config/achievements';
import { checkAchievements } from '../engine/achievementEngine';

describe('Roster Achievements Extra Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useGameStore.getState().resetGame('sk_scrap');
    // Ensure achievements slice is reset
    useGameStore.setState({
      achievements: ACHIEVEMENTS.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        category: a.category,
        isUnlocked: false,
        reward: a.reward,
      })),
    });
  });

  it('should find all 7 specified achievements in ACHIEVEMENTS configuration', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(ids).toContain('ROSTER_ARTIST_1');       // First Signing
    expect(ids).toContain('ROSTER_ARTIST_5');       // Full Roster
    expect(ids).toContain('ROSTER_FOUNDER_1');      // First Bet
    expect(ids).toContain('ROSTER_FOUNDER_5');      // Portfolio Builder
    expect(ids).toContain('ROSTER_CABINET_FULL');   // Full Cabinet
    expect(ids).toContain('ROSTER_RIVAL_ALLY_1');   // Turned Coat
    expect(ids).toContain('ROSTER_CEO_3');          // Global Reach

    // Check their exact names as requested
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_ARTIST_1')?.name).toBe('First Signing');
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_ARTIST_5')?.name).toBe('Full Roster');
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_FOUNDER_1')?.name).toBe('First Bet');
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_FOUNDER_5')?.name).toBe('Portfolio Builder');
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_CABINET_FULL')?.name).toBe('Full Cabinet');
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_RIVAL_ALLY_1')?.name).toBe('Turned Coat');
    expect(ACHIEVEMENTS.find(a => a.id === 'ROSTER_CEO_3')?.name).toBe('Global Reach');
  });

  it('should evaluate "First Signing" and "Full Roster" correctly', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_ARTIST_1')!;
    const config5 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_ARTIST_5')!;

    // 0 artists
    expect(config1.requirement.check(store)).toBe(false);
    expect(config5.requirement.check(store)).toBe(false);

    const mockArtist = { id: 'a1', name: 'Artist 1', tier: 'local' as const, royaltyRate: 1000, monthsActive: 0, hasReleased: false, avatar: '', contractMonthsLeft: 12, monthlyRetainer: 100, monthlyRevenue: 1000, hypeFactor: 1, isTargetedByRival: false };

    // 1 artist (threshold for First Signing)
    useGameStore.setState({
      pl: {
        ...store.pl,
        artists: [mockArtist]
      }
    });
    const state1 = useGameStore.getState();
    expect(config1.requirement.check(state1)).toBe(true);
    expect(config5.requirement.check(state1)).toBe(false);

    // 4 artists (premature for Full Roster)
    useGameStore.setState({
      pl: {
        ...store.pl,
        artists: Array(4).fill(mockArtist)
      }
    });
    const state4 = useGameStore.getState();
    expect(config1.requirement.check(state4)).toBe(true);
    expect(config5.requirement.check(state4)).toBe(false);

    // 5 artists (threshold for Full Roster)
    useGameStore.setState({
      pl: {
        ...store.pl,
        artists: Array(5).fill(mockArtist)
      }
    });
    const state5 = useGameStore.getState();
    expect(config1.requirement.check(state5)).toBe(true);
    expect(config5.requirement.check(state5)).toBe(true);
  });

  it('should evaluate "First Bet" and "Portfolio Builder" correctly', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_FOUNDER_1')!;
    const config5 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_FOUNDER_5')!;

    // 0 founders backed
    expect(config1.requirement.check(store)).toBe(false);
    expect(config5.requirement.check(store)).toBe(false);

    const mockFounder = { id: 'f1', name: 'Founder 1', avatar: '💼', companyName: 'A', pitchIdea: 'B', stats: { execution: 50, vision: 50, burnDiscipline: 50 } };

    // 1 founder backed (threshold for First Bet)
    useGameStore.setState({
      pl: {
        ...store.pl,
        foundersBacked: [mockFounder]
      }
    });
    const state1 = useGameStore.getState();
    expect(config1.requirement.check(state1)).toBe(true);
    expect(config5.requirement.check(state1)).toBe(false);

    // 4 founders backed (premature for Portfolio Builder)
    useGameStore.setState({
      pl: {
        ...store.pl,
        foundersBacked: Array(4).fill(mockFounder)
      }
    });
    const state4 = useGameStore.getState();
    expect(config1.requirement.check(state4)).toBe(true);
    expect(config5.requirement.check(state4)).toBe(false);

    // 5 founders backed (threshold for Portfolio Builder)
    useGameStore.setState({
      pl: {
        ...store.pl,
        foundersBacked: Array(5).fill(mockFounder)
      }
    });
    const state5 = useGameStore.getState();
    expect(config1.requirement.check(state5)).toBe(true);
    expect(config5.requirement.check(state5)).toBe(true);
  });

  it('should evaluate "Full Cabinet" correctly', () => {
    const store = useGameStore.getState();
    const config = ACHIEVEMENTS.find(a => a.id === 'ROSTER_CABINET_FULL')!;

    // 0 cabinet members
    expect(config.requirement.check(store)).toBe(false);

    const mockMember = { id: 'treasury', name: 'Treasurer', role: 'Secretary of Treasury', loyalty: 90, bonus: { type: 'cash' as const, value: 10 }, strengths: [], weaknesses: [], politicalAlignment: 'MODERATE', impacts: {} };

    // 3 cabinet members (premature)
    useGameStore.setState({
      pl: {
        ...store.pl,
        cabinet: {
          treasury: mockMember,
          state: mockMember,
          defense: mockMember
        }
      }
    });
    const state3 = useGameStore.getState();
    expect(config.requirement.check(state3)).toBe(false);

    // 4 cabinet members (threshold for Full Cabinet)
    useGameStore.setState({
      pl: {
        ...store.pl,
        cabinet: {
          treasury: mockMember,
          state: mockMember,
          defense: mockMember,
          press: mockMember
        }
      }
    });
    const state4 = useGameStore.getState();
    expect(config.requirement.check(state4)).toBe(true);
  });

  it('should evaluate "Turned Coat" correctly', () => {
    const store = useGameStore.getState();
    const config = ACHIEVEMENTS.find(a => a.id === 'ROSTER_RIVAL_ALLY_1')!;

    // No rivals
    expect(config.requirement.check(store)).toBe(false);

    const mockRivalActive = { id: 'rival1', name: 'Active Rival', netWorth: 1000, currentBid: 0, isNpc: true, tier: 'MUD' as const, status: 'rival' as const };
    const mockRivalAlly = { id: 'rival2', name: 'Ally Rival', netWorth: 1000, currentBid: 0, isNpc: true, tier: 'MUD' as const, status: 'ally' as const };

    // Rivals exist but none are allies
    useGameStore.setState({
      pl: {
        ...store.pl,
        rivals: [mockRivalActive]
      }
    });
    const stateActive = useGameStore.getState();
    expect(config.requirement.check(stateActive)).toBe(false);

    // One rival is an ally (threshold for Turned Coat)
    useGameStore.setState({
      pl: {
        ...store.pl,
        rivals: [mockRivalActive, mockRivalAlly]
      }
    });
    const stateAlly = useGameStore.getState();
    expect(config.requirement.check(stateAlly)).toBe(true);
  });

  it('should evaluate "Global Reach" correctly', () => {
    const store = useGameStore.getState();
    const config = ACHIEVEMENTS.find(a => a.id === 'ROSTER_CEO_3')!;

    // 0 conglomerate CEOs
    expect(config.requirement.check(store)).toBe(false);

    const mockCEO = { id: 'ceo1', name: 'CEO 1', competence: 80, loyalty: 80, riskTolerance: 20 };

    // 2 conglomerate CEOs (premature)
    useGameStore.setState({
      pl: {
        ...store.pl,
        conglomerateCEOs: {
          na_tech: mockCEO,
          eu_mfg: mockCEO
        }
      }
    });
    const state2 = useGameStore.getState();
    expect(config.requirement.check(state2)).toBe(false);

    // 3 conglomerate CEOs (threshold for Global Reach)
    useGameStore.setState({
      pl: {
        ...store.pl,
        conglomerateCEOs: {
          na_tech: mockCEO,
          eu_mfg: mockCEO,
          apac_retail: mockCEO
        }
      }
    });
    const state3 = useGameStore.getState();
    expect(config.requirement.check(state3)).toBe(true);
  });

  it('should unlock only once and not trigger repeatedly', () => {
    // Setup 1 artist to trigger First Signing
    const mockArtist = { id: 'a1', name: 'Artist 1', tier: 'local' as const, royaltyRate: 1000, monthsActive: 0, hasReleased: false, avatar: '', contractMonthsLeft: 12, monthlyRetainer: 100, monthlyRevenue: 1000, hypeFactor: 1, isTargetedByRival: false };

    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        artists: [mockArtist]
      }
    });

    // Check achievement unlock status before
    let currentAchievements = useGameStore.getState().achievements;
    let targetAchievement = currentAchievements.find(a => a.id === 'ROSTER_ARTIST_1')!;
    expect(targetAchievement.isUnlocked).toBe(false);

    // First time check and unlock
    const newUnlocked = checkAchievements(useGameStore.getState());
    expect(newUnlocked).toContain('ROSTER_ARTIST_1');

    // Run unlock
    useGameStore.getState().unlockAchievement('ROSTER_ARTIST_1');

    // Check achievement unlock status after
    currentAchievements = useGameStore.getState().achievements;
    targetAchievement = currentAchievements.find(a => a.id === 'ROSTER_ARTIST_1')!;
    expect(targetAchievement.isUnlocked).toBe(true);

    // Second time check (should not trigger again since it's already unlocked)
    const secondUnlocked = checkAchievements(useGameStore.getState());
    expect(secondUnlocked).not.toContain('ROSTER_ARTIST_1');
  });
});
