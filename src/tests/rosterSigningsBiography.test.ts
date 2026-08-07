import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { completeConcertPerformanceWithLineup } from '../store/slices/hustleSlice';
import * as Bio from '../engine/biographyEngine';

describe('Roster-Signing Biography Integrations', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  it('Festival artist booking - should record exactly one biography entry with no duplicates on repeated triggers', () => {
    const store = useGameStore.getState();

    // Setup an artist
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

    // 2. Festival artist booking (First Trigger)
    let draftPl = { ...stateAfterSign.pl };
    const draftNewsFeed: string[] = [];
    completeConcertPerformanceWithLineup(draftPl, 10, 1, ['artist_test_prodigy'], draftNewsFeed);

    const firstCount = draftPl.biography.filter(line =>
      line.includes('Booked Vocal Prodigy Test for a live performance')
    ).length;
    expect(firstCount).toBe(1);

    // Repeated Trigger
    completeConcertPerformanceWithLineup(draftPl, 10, 1, ['artist_test_prodigy'], draftNewsFeed);
    const secondCount = draftPl.biography.filter(line =>
      line.includes('Booked Vocal Prodigy Test for a live performance')
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1, no duplicate added
  });

  it('Talent Agency signing - should record exactly one biography entry with no duplicates on repeated triggers', () => {
    const store = useGameStore.getState();

    const signedCelebrity = {
      id: 'cel_test_jules',
      name: 'Jules the Legend',
      avatar: '👑',
      relationshipScore: 85,
      isUnlocked: true
    };

    // First trigger
    let state = useGameStore.getState();
    let updatedRolodex = [...(state.pl.rolodex || []), signedCelebrity];
    let bioUpdate = Bio.recordTalentSigning(state.pl, signedCelebrity.name, signedCelebrity.relationshipScore);
    expect(bioUpdate).not.toBeNull();

    let biography = bioUpdate ? [...(state.pl.biography || []), bioUpdate.entry] : (state.pl.biography || []);
    let recordedBioKeys = bioUpdate ? [...(state.pl.recordedBioKeys || []), bioUpdate.key!] : (state.pl.recordedBioKeys || []);

    useGameStore.getState().updatePl({
      rolodex: updatedRolodex,
      biography,
      recordedBioKeys
    });

    let finalState = useGameStore.getState();
    const firstCount = finalState.pl.biography.filter(line =>
      line.includes('Signed high-profile talent Jules the Legend')
    ).length;
    expect(firstCount).toBe(1);

    // Second trigger with exact same parameters
    state = useGameStore.getState();
    bioUpdate = Bio.recordTalentSigning(state.pl, signedCelebrity.name, signedCelebrity.relationshipScore);
    expect(bioUpdate).toBeNull(); // Should be null on repeated trigger because key already exists

    biography = bioUpdate ? [...(state.pl.biography || []), bioUpdate.entry] : (state.pl.biography || []);
    recordedBioKeys = bioUpdate ? [...(state.pl.recordedBioKeys || []), bioUpdate.key!] : (state.pl.recordedBioKeys || []);

    useGameStore.getState().updatePl({
      biography,
      recordedBioKeys
    });

    finalState = useGameStore.getState();
    const secondCount = finalState.pl.biography.filter(line =>
      line.includes('Signed high-profile talent Jules the Legend')
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1
  });

  it('Movie casting - should record exactly one biography entry with no duplicates on repeated triggers', () => {
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

    // First casting
    let state = useGameStore.getState();
    let bioUpdate = Bio.recordMovieCasting(state.pl, mockActor.name, 'Galaxy Odyssey', 'BLOCKBUSTER');
    expect(bioUpdate).not.toBeNull();

    state.updatePl({
      biography: [...(state.pl.biography || []), bioUpdate!.entry],
      recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate!.key!]
    });

    let finalState = useGameStore.getState();
    const firstCount = finalState.pl.biography.filter(line =>
      line.includes('Cast Superstar Actor in "Galaxy Odyssey"')
    ).length;
    expect(firstCount).toBe(1);

    // Second casting of exact same movie/actor
    state = useGameStore.getState();
    bioUpdate = Bio.recordMovieCasting(state.pl, mockActor.name, 'Galaxy Odyssey', 'BLOCKBUSTER');
    expect(bioUpdate).toBeNull(); // Should be null

    if (bioUpdate) {
      state.updatePl({
        biography: [...(state.pl.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate.key!]
      });
    }

    finalState = useGameStore.getState();
    const secondCount = finalState.pl.biography.filter(line =>
      line.includes('Cast Superstar Actor in "Galaxy Odyssey"')
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1
  });

  it('Marry a Celebrity - should record exactly one biography entry with no duplicates on repeated triggers', () => {
    const store = useGameStore.getState();
    const mockSpouse = {
      id: 'cel_test_spouse',
      name: 'Superstar Marcus',
      avatar: '🏀',
      relationshipScore: 100,
      isUnlocked: true
    };

    useGameStore.setState({
      pl: {
        ...store.pl,
        rolodex: [mockSpouse]
      }
    });

    // First Marriage
    let state = useGameStore.getState();
    let bioUpdate = Bio.recordCelebrityMarriage(state.pl, mockSpouse.name, mockSpouse.relationshipScore);
    expect(bioUpdate).not.toBeNull();

    state.updatePl({
      biography: [...(state.pl.biography || []), bioUpdate!.entry],
      recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate!.key!]
    });

    let finalState = useGameStore.getState();
    const firstCount = finalState.pl.biography.filter(line =>
      line.includes('Married the renowned celebrity Superstar Marcus')
    ).length;
    expect(firstCount).toBe(1);

    // Second Marriage to the exact same celebrity
    state = useGameStore.getState();
    bioUpdate = Bio.recordCelebrityMarriage(state.pl, mockSpouse.name, mockSpouse.relationshipScore);
    expect(bioUpdate).toBeNull(); // Should be null

    if (bioUpdate) {
      state.updatePl({
        biography: [...(state.pl.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate.key!]
      });
    }

    finalState = useGameStore.getState();
    const secondCount = finalState.pl.biography.filter(line =>
      line.includes('Married the renowned celebrity Superstar Marcus')
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1
  });

  it('VC Founder backed - should record exactly one biography entry with no duplicates on repeated triggers', () => {
    const store = useGameStore.getState();

    // Advance tier to allow ELITE hustles like venture_capital
    useGameStore.setState({
      pl: {
        ...store.pl,
        currentTier: 'ELITE',
        bag: 100000000,
        clout: 2000,
        aura: 2000,
        foundersBacked: []
      }
    });

    // Execute VC hustle (First Trigger)
    useGameStore.getState().executeHustle('venture_capital', 1.0, true);

    let finalState = useGameStore.getState();
    expect(finalState.pl.foundersBacked.length).toBe(1);
    const backedFounder = finalState.pl.foundersBacked[0];

    const firstCount = finalState.pl.biography.filter(line =>
      line.includes(`Invested venture capital into backed founder ${backedFounder.name}`)
    ).length;
    expect(firstCount).toBe(1);

    // Triggering it again using Bio.recordFounderBacked directly with identical parameters to simulate duplicate trigger
    const bioUpdate = Bio.recordFounderBacked(finalState.pl, backedFounder.name, backedFounder.companyName);
    expect(bioUpdate).toBeNull(); // Duplicates blocked!

    if (bioUpdate) {
      useGameStore.getState().updatePl({
        biography: [...(finalState.pl.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(finalState.pl.recordedBioKeys || []), bioUpdate.key!]
      });
    }

    finalState = useGameStore.getState();
    const secondCount = finalState.pl.biography.filter(line =>
      line.includes(`Invested venture capital into backed founder ${backedFounder.name}`)
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1
  });

  it('Regional CEO appointed - should record exactly one biography entry with no duplicates on repeated triggers', () => {
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

    // Appoint CEO (First Trigger)
    useGameStore.getState().appointConglomerateCEO!('na_tech', mockCEO);

    let finalState = useGameStore.getState();
    expect(finalState.pl.conglomerateCEOs?.['na_tech']?.name).toBe('Jack Sterling Test');

    const firstCount = finalState.pl.biography.filter(line =>
      line.includes('Appointed Jack Sterling Test as Regional CEO of the North America Technology division')
    ).length;
    expect(firstCount).toBe(1);

    // Re-appoint / trigger appointment again
    const bioUpdate = Bio.recordCEOAppointment(finalState.pl, mockCEO.name, 'na_tech');
    expect(bioUpdate).toBeNull(); // Duplicates blocked!

    if (bioUpdate) {
      useGameStore.getState().updatePl({
        biography: [...(finalState.pl.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(finalState.pl.recordedBioKeys || []), bioUpdate.key!]
      });
    }

    finalState = useGameStore.getState();
    const secondCount = finalState.pl.biography.filter(line =>
      line.includes('Appointed Jack Sterling Test as Regional CEO of the North America Technology division')
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1
  });

  it('Cabinet appointment - should record exactly one biography entry with no duplicates on repeated triggers', () => {
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

    // Appoint Cabinet Member (First Trigger)
    useGameStore.getState().appointCabinetMember!(mockCabinetMember);

    let finalState = useGameStore.getState();
    expect(finalState.pl.cabinet['test_vp']?.name).toBe('Vice President Test');

    const firstCount = finalState.pl.biography.filter(line =>
      line.includes('Appointed Vice President Test as Vice President')
    ).length;
    expect(firstCount).toBe(1);

    // Re-appoint / trigger appointment again
    const bioUpdate = Bio.recordCabinetAppointment(finalState.pl, mockCabinetMember.name, mockCabinetMember.role);
    expect(bioUpdate).toBeNull(); // Duplicates blocked!

    if (bioUpdate) {
      useGameStore.getState().updatePl({
        biography: [...(finalState.pl.biography || []), bioUpdate.entry],
        recordedBioKeys: [...(finalState.pl.recordedBioKeys || []), bioUpdate.key!]
      });
    }

    finalState = useGameStore.getState();
    const secondCount = finalState.pl.biography.filter(line =>
      line.includes('Appointed Vice President Test as Vice President')
    ).length;
    expect(secondCount).toBe(1); // Still exactly 1
  });
});