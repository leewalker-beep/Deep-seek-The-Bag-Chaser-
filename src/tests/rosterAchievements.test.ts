import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS } from '../config/achievements';
import { checkAchievements } from '../engine/achievementEngine';

describe('Roster-Milestone Achievements Config & Engine Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  it('should find the newly added achievements in the ACHIEVEMENTS config', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(ids).toContain('ROSTER_ARTIST_1');
    expect(ids).toContain('ROSTER_ARTIST_5');
    expect(ids).toContain('ROSTER_ROLODEX_1');
    expect(ids).toContain('ROSTER_ROLODEX_5');
    expect(ids).toContain('ROSTER_FOUNDER_1');
    expect(ids).toContain('ROSTER_FOUNDER_5');
    expect(ids).toContain('ROSTER_CEO_1');
    expect(ids).toContain('ROSTER_CEO_4');
    expect(ids).toContain('ROSTER_CABINET_1');
    expect(ids).toContain('ROSTER_CABINET_FULL');
  });

  it('should evaluate progress correctly for Artists milestones', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_ARTIST_1')!;
    const config5 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_ARTIST_5')!;

    // Initial state: 0 artists
    expect(config1.requirement.check(store)).toBe(false);
    expect(config1.requirement.progress(store)).toEqual({ current: 0, target: 1 });
    expect(config5.requirement.check(store)).toBe(false);
    expect(config5.requirement.progress(store)).toEqual({ current: 0, target: 5 });

    // State with 1 artist
    const mockArtist = { id: 'a1', name: 'Artist 1', tier: 'local' as const, royaltyRate: 1000, monthsActive: 0, hasReleased: false };
    useGameStore.setState({
      pl: {
        ...store.pl,
        artists: [mockArtist]
      }
    });

    const store1 = useGameStore.getState();
    expect(config1.requirement.check(store1)).toBe(true);
    expect(config1.requirement.progress(store1)).toEqual({ current: 1, target: 1 });
    expect(config5.requirement.check(store1)).toBe(false);
    expect(config5.requirement.progress(store1)).toEqual({ current: 1, target: 5 });

    // State with 5 artists
    useGameStore.setState({
      pl: {
        ...store1.pl,
        artists: Array(5).fill(mockArtist)
      }
    });

    const store5 = useGameStore.getState();
    expect(config1.requirement.check(store5)).toBe(true);
    expect(config5.requirement.check(store5)).toBe(true);
    expect(config5.requirement.progress(store5)).toEqual({ current: 5, target: 5 });
  });

  it('should evaluate progress correctly for Rolodex milestones', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_ROLODEX_1')!;
    const config5 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_ROLODEX_5')!;

    // Initial state: 0
    expect(config1.requirement.check(store)).toBe(false);
    expect(config1.requirement.progress(store)).toEqual({ current: 0, target: 1 });

    // State with 1 creator
    const mockCreator = { id: 'c1', name: 'Creator 1', avatar: '👑', relationshipScore: 50, isUnlocked: true };
    useGameStore.setState({
      pl: {
        ...store.pl,
        rolodex: [mockCreator]
      }
    });

    const store1 = useGameStore.getState();
    expect(config1.requirement.check(store1)).toBe(true);
    expect(config5.requirement.check(store1)).toBe(false);
    expect(config5.requirement.progress(store1)).toEqual({ current: 1, target: 5 });

    // State with 5 creators
    useGameStore.setState({
      pl: {
        ...store1.pl,
        rolodex: Array(5).fill(mockCreator)
      }
    });

    const store5 = useGameStore.getState();
    expect(config5.requirement.check(store5)).toBe(true);
    expect(config5.requirement.progress(store5)).toEqual({ current: 5, target: 5 });
  });

  it('should evaluate progress correctly for VC Founders milestones', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_FOUNDER_1')!;
    const config5 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_FOUNDER_5')!;

    // Initial state
    expect(config1.requirement.check(store)).toBe(false);

    // State with 1 founder
    const mockFounder = { id: 'f1', name: 'Founder 1', avatar: '💼', companyName: 'A', pitchIdea: 'B', stats: { execution: 50, vision: 50, burnDiscipline: 50 } };
    useGameStore.setState({
      pl: {
        ...store.pl,
        foundersBacked: [mockFounder]
      }
    });

    const store1 = useGameStore.getState();
    expect(config1.requirement.check(store1)).toBe(true);
    expect(config5.requirement.check(store1)).toBe(false);

    // State with 5 founders
    useGameStore.setState({
      pl: {
        ...store1.pl,
        foundersBacked: Array(5).fill(mockFounder)
      }
    });

    const store5 = useGameStore.getState();
    expect(config5.requirement.check(store5)).toBe(true);
  });

  it('should evaluate progress correctly for Conglomerate Regional CEOs milestones', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_CEO_1')!;
    const config4 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_CEO_4')!;

    // Initial state
    expect(config1.requirement.check(store)).toBe(false);

    // State with na_tech CEO
    const mockCEO = { id: 'ceo1', name: 'CEO Na', avatar: '👔', competence: 80, loyalty: 80, riskTolerance: 20 };
    useGameStore.setState({
      pl: {
        ...store.pl,
        conglomerateCEOs: {
          na_tech: mockCEO
        }
      }
    });

    const store1 = useGameStore.getState();
    expect(config1.requirement.check(store1)).toBe(true);
    expect(config4.requirement.check(store1)).toBe(false);
    expect(config4.requirement.progress(store1)).toEqual({ current: 1, target: 4 });

    // State with all 4 CEOs
    useGameStore.setState({
      pl: {
        ...store1.pl,
        conglomerateCEOs: {
          na_tech: mockCEO,
          eu_mfg: mockCEO,
          apac_retail: mockCEO,
          latam_log: mockCEO
        }
      }
    });

    const store4 = useGameStore.getState();
    expect(config4.requirement.check(store4)).toBe(true);
    expect(config4.requirement.progress(store4)).toEqual({ current: 4, target: 4 });
  });

  it('should evaluate progress correctly for Cabinet Member milestones', () => {
    const store = useGameStore.getState();
    const config1 = ACHIEVEMENTS.find(a => a.id === 'ROSTER_CABINET_1')!;
    const configFull = ACHIEVEMENTS.find(a => a.id === 'ROSTER_CABINET_FULL')!;

    // Initial state
    expect(config1.requirement.check(store)).toBe(false);

    // State with 1 cabinet member
    const mockMember = { id: 'treasury', name: 'Treasurer', role: 'Secretary of Treasury', loyalty: 90, bonus: { type: 'cash' as const, value: 10 }, strengths: [], weaknesses: [], politicalAlignment: 'MODERATE', impacts: {} };
    useGameStore.setState({
      pl: {
        ...store.pl,
        cabinet: {
          treasury: mockMember
        }
      }
    });

    const store1 = useGameStore.getState();
    expect(config1.requirement.check(store1)).toBe(true);
    expect(configFull.requirement.check(store1)).toBe(false);
    expect(configFull.requirement.progress(store1)).toEqual({ current: 1, target: 4 });

    // State with all 4 cabinet members
    useGameStore.setState({
      pl: {
        ...store1.pl,
        cabinet: {
          treasury: mockMember,
          state: mockMember,
          defense: mockMember,
          press: mockMember
        }
      }
    });

    const storeFull = useGameStore.getState();
    expect(configFull.requirement.check(storeFull)).toBe(true);
    expect(configFull.requirement.progress(storeFull)).toEqual({ current: 4, target: 4 });
  });

  it('should automatically unlock achievements and reward the player when events are triggered', () => {
    const store = useGameStore.getState();

    // Setup player with 1 artist but achievement not yet checked/unlocked in achievements state
    const mockArtist = { id: 'a1', name: 'Artist 1', tier: 'local' as const, royaltyRate: 1000, monthsActive: 0, hasReleased: false };
    const originalLegacyPoints = store.pl.legacyPoints || 0;

    useGameStore.setState({
      pl: {
        ...store.pl,
        artists: [mockArtist]
      }
    });

    // Fire logEvent, which triggers checkAchievements and unlocks qualified ones
    useGameStore.getState().logEvent('PROMOTION_EARNED', { from: 'MUD', to: 'STREET', fee: 0 });

    const finalState = useGameStore.getState();
    const finalArtistAchievement = finalState.achievements.find(a => a.id === 'ROSTER_ARTIST_1')!;
    expect(finalArtistAchievement.isUnlocked).toBe(true);
    // Verified that the player received legacy points
    expect(finalState.pl.legacyPoints).toBeGreaterThan(originalLegacyPoints);
    expect(finalState.pl.unlockedAchievements).toContain('ROSTER_ARTIST_1');
  });
});
