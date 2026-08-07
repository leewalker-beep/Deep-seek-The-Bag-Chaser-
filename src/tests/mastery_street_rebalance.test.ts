import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { isHustleMastered } from '../utils/masteryUtils';

// Mock localStorage globally for this test
if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

describe('STREET Tier Mastery Rebalance Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('street_kid', 3);
  });

  it('correctly identifies Content Creation (cc) mastery at 10 plays with no level requirement', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['cc'] = 1;
    pl.hustlePlays['cc'] = 9;
    expect(isHustleMastered(pl, 'cc')).toBe(false);

    pl.hustlePlays['cc'] = 10;
    expect(isHustleMastered(pl, 'cc')).toBe(true);
  });

  it('correctly identifies Podcast (pod) mastery at level 2 and 6 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['pod'] = 1;
    pl.hustlePlays['pod'] = 6;
    expect(isHustleMastered(pl, 'pod')).toBe(false);

    pl.hustleLevels['pod'] = 2;
    expect(isHustleMastered(pl, 'pod')).toBe(true);
  });

  it('correctly identifies Tech Flipping (techFlip) mastery at level 2 and 8 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['techFlip'] = 2;
    pl.hustlePlays['techFlip'] = 7;
    expect(isHustleMastered(pl, 'techFlip')).toBe(false);

    pl.hustlePlays['techFlip'] = 8;
    expect(isHustleMastered(pl, 'techFlip')).toBe(true);
  });

  it('correctly identifies Streetwear (sw) mastery at 8 plays with no level requirement', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['sw'] = 1;
    pl.hustlePlays['sw'] = 7;
    expect(isHustleMastered(pl, 'sw')).toBe(false);

    pl.hustlePlays['sw'] = 8;
    expect(isHustleMastered(pl, 'sw')).toBe(true);
  });

  it('correctly identifies Dropshipping (drop) mastery at level 2 and 8 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['drop'] = 2;
    pl.hustlePlays['drop'] = 7;
    expect(isHustleMastered(pl, 'drop')).toBe(false);

    pl.hustlePlays['drop'] = 8;
    expect(isHustleMastered(pl, 'drop')).toBe(true);
  });

  it('correctly identifies Talent Agency (h_talent_agent) mastery at 8 plays with no level requirement', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['h_talent_agent'] = 1;
    pl.hustlePlays['h_talent_agent'] = 7;
    expect(isHustleMastered(pl, 'h_talent_agent')).toBe(false);

    pl.hustlePlays['h_talent_agent'] = 8;
    expect(isHustleMastered(pl, 'h_talent_agent')).toBe(true);
  });
});
