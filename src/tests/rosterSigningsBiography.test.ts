import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { completeConcertPerformanceWithLineup } from '../store/slices/hustleSlice';
import * as Bio from '../engine/biographyEngine';

describe('Roster-Signing Biography Integrations', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  it('should record biography when signing a scouted artist and booking them for a performance', () => {
    const store = useGameStore.getState();

    // Simulate finding an artist in scouted pool
    const mockArtist = {
      id: 'artist_test_prodigy',
      name: 'Vocal Prodigy Test',
      avatar: '🎤',
      tier: 'local' as const,
      monthlyRevenue: 1000,
      hypeFactor: 1.0
    };

    useGameStore.setState({
      pl: {
        ...store.pl,
        scoutedTalentPool: [mockArtist],
        artists: []
      }
    });

    // 1. Label/Artist signing
    useGameStore.getState().signScoutedArtist('artist_test_prodigy');

    const stateAfterSign = useGameStore.getState();
    expect(stateAfterSign.pl.artists.length).toBe(1);
    expect(stateAfterSign.pl.biography.some(line =>
      line.includes('Signed local artist Vocal Prodigy Test')
    )).toBe(true);

    // 2. Festival artist booking
    const draftPl = { ...stateAfterSign.pl };
    const draftNewsFeed: string[] = [];
    completeConcertPerformanceWithLineup(draftPl, 10, 1, ['artist_test_prodigy'], draftNewsFeed);

    expect(draftPl.biography.some(line =>
      line.includes('Booked Vocal Prodigy Test for a live performance')
    )).toBe(true);
  });

  it('should record biography when signing talent at Boutique Talent Agency', () => {
    const store = useGameStore.getState();

    // Simulate completing the talent agency minigame
    const signedCelebrity = {
      id: 'cel_test_jules',
      name: 'Jules the Legend',
      avatar: '👑',
      relationshipScore: 85,
      isUnlocked: true
    };

    const currentRolodex = store.pl.rolodex || [];
    const updatedRolodex = [...currentRolodex, signedCelebrity];

    const bioUpdate = Bio.recordTalentSigning(store.pl, signedCelebrity.name, signedCelebrity.relationshipScore);
    expect(bioUpdate).not.toBeNull();
    expect(bioUpdate?.entry).toContain('Signed high-profile talent Jules the Legend');

    const biography = bioUpdate ? [...(store.pl.biography || []), bioUpdate.entry] : (store.pl.biography || []);
    store.updatePl({
      rolodex: updatedRolodex,
      biography
    });

    const finalState = useGameStore.getState();
    expect(finalState.pl.rolodex?.length).toBeGreaterThan(0);
    expect(finalState.pl.biography.some(line =>
      line.includes('Signed high-profile talent Jules the Legend')
    )).toBe(true);
  });

  it('should record biography when casting celebrity in Movie', () => {
    const store = useGameStore.getState();
    const mockActor = {
      id: 'cel_test_actor',
      name: 'Superstar Actor',
      avatar: '🎬',
      relationshipScore: 90,
      isUnlocked: true
    };

    useGameStore.setState({
      pl: {
        ...store.pl,
        rolodex: [mockActor]
      }
    });

    const state = useGameStore.getState();
    const bioUpdate = Bio.recordMovieCasting(state.pl, mockActor.name, 'Galaxy Odyssey', 'BLOCKBUSTER');
    expect(bioUpdate).not.toBeNull();
    expect(bioUpdate?.entry).toContain('Cast Superstar Actor in "Galaxy Odyssey", which went on to become a blockbuster');

    state.updatePl({
      biography: [...(state.pl.biography || []), bioUpdate!.entry],
      recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate!.key!]
    });

    const finalState = useGameStore.getState();
    expect(finalState.pl.biography.some(line =>
      line.includes('Cast Superstar Actor in "Galaxy Odyssey"')
    )).toBe(true);
  });

  it('should record biography when backing VC founders', () => {
    const store = useGameStore.getState();

    // Advance tier to allow ELITE hustles like venture_capital
    useGameStore.setState({
      pl: {
        ...store.pl,
        currentTier: 'ELITE',
        bag: 10000000,
        foundersBacked: []
      }
    });

    // Execute VC hustle (venture_capital)
    const result = useGameStore.getState().executeHustle('venture_capital', 1.0, true);

    const finalState = useGameStore.getState();
    expect(finalState.pl.foundersBacked.length).toBe(1);
    const backedFounder = finalState.pl.foundersBacked[0];

    expect(finalState.pl.biography.some(line =>
      line.includes(`Invested venture capital into backed founder ${backedFounder.name}`) &&
      line.includes(backedFounder.companyName)
    )).toBe(true);
  });

  it('should record biography when appointing a Regional CEO', () => {
    const store = useGameStore.getState();
    const mockCEO = {
      id: 'ceo_test_sterling',
      name: 'Jack Sterling Test',
      avatar: '👔',
      competence: 80,
      loyalty: 80,
      riskTolerance: 20,
      bio: 'Test CEO',
      personalityTraits: []
    };

    useGameStore.setState({
      pl: {
        ...store.pl,
        conglomerateCandidates: [mockCEO],
        conglomerateCEOs: {}
      }
    });

    // Appoint CEO to division
    useGameStore.getState().appointConglomerateCEO!('na_tech', mockCEO);

    const finalState = useGameStore.getState();
    expect(finalState.pl.conglomerateCEOs?.['na_tech']?.name).toBe('Jack Sterling Test');
    expect(finalState.pl.biography.some(line =>
      line.includes('Appointed Jack Sterling Test as Regional CEO of the North America Technology division')
    )).toBe(true);
  });

  it('should record biography when appointing a Cabinet member', () => {
    const store = useGameStore.getState();
    const mockCabinetMember = {
      id: 'test_vp',
      name: 'Vice President Test',
      avatar: '💼',
      role: 'Vice President',
      loyalty: 90,
      corruption: 10,
      scandalsResolved: 0,
      baseSalary: 150000,
      perk: 'None'
    };

    useGameStore.setState({
      pl: {
        ...store.pl,
        cabinet: {}
      }
    });

    // Appoint Cabinet Member
    useGameStore.getState().appointCabinetMember!(mockCabinetMember);

    const finalState = useGameStore.getState();
    expect(finalState.pl.cabinet['test_vp']?.name).toBe('Vice President Test');
    expect(finalState.pl.biography.some(line =>
      line.includes('Appointed Vice President Test as Vice President')
    )).toBe(true);
  });
});
