import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { BACKGROUNDS } from '../config/backgrounds';
import { SPECIALIZATIONS } from '../config/specializations';

describe('Living Biography System', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  it('should record the player origin on reset', () => {
    const state = useGameStore.getState();
    const background = BACKGROUNDS.find(b => b.id === 'sk_scrap');
    expect(state.pl.biography.some(line =>
      line.includes(`Started life in the MUD tier as a ${background?.name}`) ||
      line.includes(`Born into the MUD tier`) ||
      line.includes(`The story began in the MUD tier`)
    )).toBe(true);
  });

  it('should record tier advancement and specialization', () => {
    const state = useGameStore.getState();
    // Force enough stats to advance
    useGameStore.setState({
      pl: {
        ...state.pl,
        bag: 100000,
        clout: 1000,
        aura: 1000
      }
    });

    const specId = SPECIALIZATIONS[0].id;
    useGameStore.getState().selectSpecialization(specId);

    const newState = useGameStore.getState();
    expect(newState.pl.currentTier).toBe('STREET');
    expect(newState.pl.biography.some(line =>
      line.includes('Rose to the STREET tier') ||
      line.includes('Ascended to the STREET ranks') ||
      line.includes('join the STREET tier')
    )).toBe(true);
  });

  it('should record business creation', () => {
    const state = useGameStore.getState();
    // Buy a vending machine (recorded as business)
    useGameStore.setState({
      pl: {
        ...state.pl,
        bag: 10000,
        hustleBranchIds: { 'r_vending': 'vending' }
      }
    });

    useGameStore.getState().executeBranch('r_vending', 'vending');

    const newState = useGameStore.getState();
    expect(newState.pl.biography.some(line =>
      line.includes('Built the first Vending Machine') ||
      line.includes('Established a Vending Machine') ||
      line.includes('Vending Machine was founded')
    )).toBe(true);
  });

  it('should record hustle mastery', () => {
    const state = useGameStore.getState();

    // Mock mastery for a hustle with branches (like cc)
    useGameStore.setState({
        pl: {
            ...state.pl,
            hustleBranchIds: { 'cc': 'l3' }, // l3 is terminal for cc
            hustleLevels: { 'cc': 3 }
        }
    });

    useGameStore.getState().checkMilestones();

    const newState = useGameStore.getState();
    expect(newState.pl.biography.some(line =>
      line.includes('Reached absolute mastery in Content Creation') ||
      line.includes('legendary figure in Content Creation') ||
      line.includes('dominance in the field of Content Creation')
    )).toBe(true);
  });

  it('should record rival defeat', () => {
    const state = useGameStore.getState();

    // Mock a challenge win
    useGameStore.setState({
        pl: {
            ...state.pl,
            bag: 1000,
            activeChallenges: [{
                rivalId: 'rival1',
                rivalName: 'Test Rival',
                tier: 'MUD',
                hustlesCompleted: 2,
                hustlesRequired: 3,
                monthsRemaining: 5
            }]
        }
    });

    // Complete the challenge by running a hustle in the same tier
    // 'r_labor' is MUD tier
    useGameStore.getState().executeHustle('r_labor', 1, true);

    const newState = useGameStore.getState();
    expect(newState.pl.biography.some(line => line.includes('Defeated Test Rival'))).toBe(true);
  });

  it('should record scandals (arrest)', () => {
    const state = useGameStore.getState();

    // Force arrest condition
    useGameStore.setState({
        pl: {
            ...state.pl,
            bag: 1000,
            heat: 100,
            isTutorialSkipped: true,
            tutorialStep: 10
        }
    });

    // Running any hustle triggers advanceMonth which checks for arrest
    useGameStore.getState().executeHustle('r_labor', 1, true);

    const newState = useGameStore.getState();
    expect(newState.pl.inJail).toBe(true);
    expect(newState.pl.biography.some(line => line.includes('spell behind bars'))).toBe(true);
  });

  it('should handle simultaneous events (Hustle + Milestone + Challenge) without duplicates', () => {
    const state = useGameStore.getState();

    // Set up state for simultaneous trigger
    // Using r_labor l3a (Commercial Real Estate) which is terminal and MUD tier
    useGameStore.setState({
      pl: {
        ...state.pl,
        bag: 1000000,
        clout: 100,
        aura: 50,
        currentTier: 'MUD',
        hustleBranchIds: { 'r_labor': 'l3a' },
        hustleLevels: { 'r_labor': 3 },
        activeChallenges: [{
            rivalId: 'rival1',
            rivalName: 'Test Rival',
            tier: 'MUD',
            hustlesCompleted: 2,
            hustlesRequired: 3,
            monthsRemaining: 5
        }]
      }
    });

    // Running 'r_labor' will trigger the logic
    useGameStore.getState().executeHustle('r_labor', 1, true);

    const newState = useGameStore.getState();

    // Should have: Origin, Mastery, Rival Defeat
    // (Mastery occurs in checkMilestones, Rival Defeat in executeHustle)
    expect(newState.pl.biography.filter(line =>
      line.includes('Reached absolute mastery') ||
      line.includes('legendary figure in') ||
      line.includes('dominance in the field of')
    ).length).toBe(1);
    expect(newState.pl.biography.filter(line => line.includes('Defeated Test Rival')).length).toBe(1);
  });

  it('should preserve chronological order during simultaneous updates', () => {
     const state = useGameStore.getState();

     // Set up for MUD tier simultaneous triggers
     useGameStore.setState({
       pl: {
         ...state.pl,
         currentTier: 'MUD',
         bag: 1000000,
         clout: 100,
         aura: 50,
         hustleBranchIds: { 'r_labor': 'l3a' },
         hustleLevels: { 'r_labor': 3 },
         activeChallenges: [{
             rivalId: 'rival1',
             rivalName: 'Test Rival',
             tier: 'MUD',
             hustlesCompleted: 2,
             hustlesRequired: 3,
             monthsRemaining: 5
         }]
       }
     });

     useGameStore.getState().executeHustle('r_labor', 1, true);

     const newState = useGameStore.getState();

     // Chronology should be:
     // 0: Origin
     // 1: Rival Defeat (happens in executeHustle before checkMilestones)
     // 2: Mastery (happens in checkMilestones)

     const bio = newState.pl.biography;
     expect(bio.some(line =>
       line.includes('Started life') ||
       line.includes('Born into') ||
       line.includes('The story began')
     )).toBe(true);

     expect(bio.some(line => line.includes('Defeated Test Rival'))).toBe(true);

     expect(bio.some(line =>
       line.includes('Reached absolute mastery') ||
       line.includes('legendary figure in') ||
       line.includes('dominance in the field of')
     )).toBe(true);

     // Verify Rival Defeat is before Mastery
     const rivalIdx = bio.findIndex(l => l.includes('Defeated Test Rival'));
     const masteryIdx = bio.findIndex(l =>
       l.includes('Reached absolute mastery') ||
       l.includes('legendary figure in') ||
       l.includes('dominance in the field of')
     );
     expect(rivalIdx).toBeLessThan(masteryIdx);
  });
});
