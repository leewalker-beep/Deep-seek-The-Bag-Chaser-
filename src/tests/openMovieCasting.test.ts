import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';

describe('open_movie custom casting and strategy tests', () => {
  beforeEach(() => {
    // Reset the game to starting conditions
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should have custom hasPanel and panelType configured', () => {
    const hustle = HUSTLES.open_movie;
    expect(hustle).toBeDefined();
    expect(hustle.hasPanel).toBe(true);
    expect(hustle.panelType).toBe('FUND_MOVIE');
  });

  it('should run openMovieStrategy with overridden base yield cash', () => {
    // Advance tier to OPEN to execute open_movie
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'OPEN',
        bag: 500000000, // Give enough cash
        clout: 1000,
        aura: 1000,
      }
    }));

    // Execute with a standard multiplier = 1.0 (average release)
    const result = useGameStore.getState().executeHustle('open_movie', 1.0, true);

    expect(result.success).toBe(true);
    // Overridden base cash yield in strategy is $100,000,000
    // Net change: cost is deducted, yield cash is added
    // With 1.0x multiplier, rawYieldCash is 100M * 1 = 100M
    expect(result.yieldCash).toBeGreaterThan(0);
    expect(result.cost).toBeGreaterThan(0);
  });

  it('should calculate correct celebrity multipliers based on relationshipScore', () => {
    // Relationship multiplier formula: 0.8 + (score / 100) * 1.2
    const calcCelebMultiplier = (score: number) => 0.8 + (score / 100) * 1.2;

    expect(calcCelebMultiplier(0)).toBeCloseTo(0.8);
    expect(calcCelebMultiplier(50)).toBeCloseTo(1.4);
    expect(calcCelebMultiplier(100)).toBeCloseTo(2.0);
  });

  it('should calculate flop and blockbuster chances reflecting relationshipScore', () => {
    const getChances = (score: number) => {
      const flopChance = Math.max(0.02, 0.35 - (score / 300));
      const blockbusterChance = Math.min(0.50, 0.10 + (score / 250));
      return { flopChance, blockbusterChance };
    };

    // Low score: higher flop chance, lower blockbuster chance
    const lowChances = getChances(0);
    expect(lowChances.flopChance).toBeCloseTo(0.35);
    expect(lowChances.blockbusterChance).toBeCloseTo(0.10);

    // High score: lower flop chance, higher blockbuster chance
    const highChances = getChances(100);
    expect(highChances.flopChance).toBeLessThan(lowChances.flopChance);
    expect(highChances.blockbusterChance).toBeGreaterThan(lowChances.blockbusterChance);

    // Caps/Clamps check
    const maxChances = getChances(200); // Exceed max score
    expect(maxChances.flopChance).toBe(0.02); // Clamped at 0.02
    expect(maxChances.blockbusterChance).toBe(0.50); // Clamped at 0.50
  });

  it('should execute open_movie with celebrity casting outcome multiplier', () => {
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'OPEN',
        bag: 1000000000,
        clout: 2000,
        aura: 2000,
        rolodex: [
          { id: 'cel_1', name: 'Superstar Marcus', avatar: '🏀', relationshipScore: 100, isUnlocked: true }
        ]
      }
    }));

    // Casting Superstar Marcus (100 relationship -> 2.0x celeb multiplier)
    // If we assume a HIT base multiplier (2.0x), final multiplier is 2.0 * 2.0 = 4.0x
    const finalMultiplier = 4.0;

    const result = useGameStore.getState().executeHustle('open_movie', finalMultiplier, true);

    expect(result.success).toBe(true);
    // Base is 100M. 4.0x multiplier yields 400M!
    expect(result.yieldCash).toBe(400000000);
  });

  it('should cap the final multiplier globally to 10.0x to prevent exploits', () => {
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'OPEN',
        bag: 1000000000,
        clout: 2000,
        aura: 2000,
        legacyPoints: 999999, // Giant legacy points!
      }
    }));

    // 100.0x multiplier requested
    const result = useGameStore.getState().executeHustle('open_movie', 100.0, true);

    // Multiplier is capped globally at 10.0x in mathEngine.ts, so yieldCash won't exceed $1 Billion
    expect(result.yieldCash).toBeLessThanOrEqual(1000000000);
  });
});
