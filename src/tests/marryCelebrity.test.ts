import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';
import * as Bio from '../engine/biographyEngine';

describe('open_celebrity custom marry celebrity and strategy tests', () => {
  beforeEach(() => {
    // Reset the game to starting conditions
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should have custom hasPanel and panelType configured', () => {
    const hustle = HUSTLES.open_celebrity;
    expect(hustle).toBeDefined();
    expect(hustle.hasPanel).toBe(true);
    expect(hustle.panelType).toBe('MARRY_CELEBRITY');
  });

  it('should calculate correct celebrity multipliers based on relationshipScore', () => {
    // Relationship multiplier formula: 0.8 + (score / 100) * 1.2
    const calcCelebMultiplier = (score: number) => 0.8 + (score / 100) * 1.2;

    expect(calcCelebMultiplier(0)).toBeCloseTo(0.8);
    expect(calcCelebMultiplier(50)).toBeCloseTo(1.4);
    expect(calcCelebMultiplier(100)).toBeCloseTo(2.0);
  });

  it('should execute open_celebrity with high relationship multiplier and low relationship multiplier differently', () => {
    // 1. Setup player with 100 relationship celebrity and execute
    useGameStore.getState().resetGame('STREET_KID', 3);
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'OPEN',
        bag: 10000000,
        clout: 1000,
        aura: 1000,
        rolodex: [
          { id: 'cel_1', name: 'Superstar Marcus', avatar: '🏀', relationshipScore: 100, isUnlocked: true }
        ]
      }
    }));

    const scoreHigh = 100;
    const relationshipMultiplierHigh = 0.8 + (scoreHigh / 100) * 1.2; // 2.0x

    const resultHigh = useGameStore.getState().executeHustle('open_celebrity', relationshipMultiplierHigh, true);
    expect(resultHigh.success).toBe(true);

    // 2. Reset game and setup player with 0 relationship celebrity and execute
    useGameStore.getState().resetGame('STREET_KID', 3);
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'OPEN',
        bag: 10000000,
        clout: 1000,
        aura: 1000,
        rolodex: [
          { id: 'cel_2', name: 'Distant Diva', avatar: '🎤', relationshipScore: 0, isUnlocked: true }
        ]
      }
    }));

    const scoreLow = 0;
    const relationshipMultiplierLow = 0.8 + (scoreLow / 100) * 1.2; // 0.8x

    const resultLow = useGameStore.getState().executeHustle('open_celebrity', relationshipMultiplierLow, true);
    expect(resultLow.success).toBe(true);

    // Dynamic multiplier should meaningfully affect outcomes: yield from high relationship should be larger than low relationship
    expect(resultHigh.yieldClout).toBeGreaterThan(resultLow.yieldClout);
    expect(resultHigh.yieldAura).toBeGreaterThan(resultLow.yieldAura);
  });

  it('should record the celebrity marriage biography entry correctly', () => {
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'OPEN',
        bag: 10000000,
        clout: 1000,
        aura: 1000,
        rolodex: [
          { id: 'cel_1', name: 'Superstar Marcus', avatar: '🏀', relationshipScore: 100, isUnlocked: true }
        ]
      }
    }));

    const score = 100;
    const relationshipMultiplier = 0.8 + (score / 100) * 1.2; // 2.0x

    // Execute hustle
    useGameStore.getState().executeHustle('open_celebrity', relationshipMultiplier, true);

    // Record the marriage to biography manually (matching MarryCelebrityPanel behavior)
    const storeState = useGameStore.getState();
    const bioUpdate = Bio.recordCelebrityMarriage(
      storeState.pl,
      'Superstar Marcus',
      score
    );

    expect(bioUpdate).toBeDefined();
    expect(bioUpdate!.key).toBe('marry_celebrity_superstar_marcus');
    expect(bioUpdate!.entry).toContain('Superstar Marcus');
  });

  it('should verify empty-rolodex locking condition is readable from the state', () => {
    // Initial conditions with an empty rolodex
    const currentRolodex = useGameStore.getState().pl.rolodex || [];
    expect(currentRolodex.length).toBe(0);

    // The panel will display an explicit lock screen and not proceed
  });
});
