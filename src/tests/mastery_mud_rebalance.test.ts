import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { getMasteryCount, isHustleMastered } from '../utils/masteryUtils';

// Mock localStorage globally for this test
if (typeof global.localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

describe('MUD Tier Mastery Rebalance Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('street_kid', 3);
  });

  it('correctly identifies r_labor mastery at level 2 and 10 plays', () => {
    const pl = useGameStore.getState().pl;

    // Below threshold
    pl.hustleLevels['r_labor'] = 1;
    pl.hustlePlays['r_labor'] = 9;
    expect(isHustleMastered(pl, 'r_labor')).toBe(false);

    pl.hustleLevels['r_labor'] = 2;
    expect(isHustleMastered(pl, 'r_labor')).toBe(false);

    pl.hustlePlays['r_labor'] = 10;
    expect(isHustleMastered(pl, 'r_labor')).toBe(true);
  });

  it('correctly identifies r_delivery mastery at level 2 and 10 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['r_delivery'] = 1;
    pl.hustlePlays['r_delivery'] = 10;
    expect(isHustleMastered(pl, 'r_delivery')).toBe(false);

    pl.hustleLevels['r_delivery'] = 2;
    expect(isHustleMastered(pl, 'r_delivery')).toBe(true);
  });

  it('correctly identifies r_plasma mastery at 15 plays with no level requirement', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['r_plasma'] = 1;
    pl.hustlePlays['r_plasma'] = 14;
    expect(isHustleMastered(pl, 'r_plasma')).toBe(false);

    pl.hustlePlays['r_plasma'] = 15;
    expect(isHustleMastered(pl, 'r_plasma')).toBe(true);
  });

  it('correctly identifies r_vending mastery at 20 purchases/plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['r_vending'] = 1;
    pl.vendingCount = 19;
    pl.hustlePlays['r_vending'] = 19;
    expect(isHustleMastered(pl, 'r_vending')).toBe(false);

    pl.vendingCount = 20;
    expect(isHustleMastered(pl, 'r_vending')).toBe(true);
  });

  it('correctly identifies r_ghost_mode mastery at level 2 and 8 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['r_ghost_mode'] = 1;
    pl.hustlePlays['r_ghost_mode'] = 8;
    expect(isHustleMastered(pl, 'r_ghost_mode')).toBe(false);

    pl.hustleLevels['r_ghost_mode'] = 2;
    expect(isHustleMastered(pl, 'r_ghost_mode')).toBe(true);
  });

  it('correctly identifies r_scrap mastery at level 2 and 10 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['r_scrap'] = 2;
    pl.hustlePlays['r_scrap'] = 9;
    expect(isHustleMastered(pl, 'r_scrap')).toBe(false);

    pl.hustlePlays['r_scrap'] = 10;
    expect(isHustleMastered(pl, 'r_scrap')).toBe(true);
  });

  it('correctly identifies street_eats mastery at level 2 and 10 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['street_eats'] = 2;
    pl.hustlePlays['street_eats'] = 9;
    expect(isHustleMastered(pl, 'street_eats')).toBe(false);

    pl.hustlePlays['street_eats'] = 10;
    expect(isHustleMastered(pl, 'street_eats')).toBe(true);
  });

  it('correctly identifies cleaning mastery at 12 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['cleaning'] = 1;
    pl.hustlePlays['cleaning'] = 11;
    expect(isHustleMastered(pl, 'cleaning')).toBe(false);

    pl.hustlePlays['cleaning'] = 12;
    expect(isHustleMastered(pl, 'cleaning')).toBe(true);
  });

  it('correctly identifies h_sign_spinner mastery at 15 plays', () => {
    const pl = useGameStore.getState().pl;

    pl.hustleLevels['h_sign_spinner'] = 1;
    pl.hustlePlays['h_sign_spinner'] = 14;
    expect(isHustleMastered(pl, 'h_sign_spinner')).toBe(false);

    pl.hustlePlays['h_sign_spinner'] = 15;
    expect(isHustleMastered(pl, 'h_sign_spinner')).toBe(true);
  });
});
