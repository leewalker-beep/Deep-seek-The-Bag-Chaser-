import { describe, it, expect } from 'vitest';
import { calculateEnding, ENDINGS } from '../../engine/endingEngine';
import type { PlayerStats } from '../../types/game';

describe('endingEngine', () => {
  it('should return PRESIDENT_FOR_LIFE if campaignStage is 7', () => {
    const state = { campaignStage: 7 } as PlayerStats;
    expect(calculateEnding(state)).toBe(ENDINGS.PRESIDENT_FOR_LIFE);
  });

  it('should return PRISON_EMPIRE if heat is high', () => {
    const state = { heat: 95, bag: 1000000 } as PlayerStats;
    expect(calculateEnding(state)).toBe(ENDINGS.PRISON_EMPIRE);
  });

  it('should return SCRAP_KING if bag is empty', () => {
    const state = { heat: 0, bag: 500, stats: { totalHustles: 15 } } as PlayerStats;
    expect(calculateEnding(state)).toBe(ENDINGS.SCRAP_KING);
  });

  it('should return MEDIA_TYCOON if clout > aura * 2', () => {
    const state = { heat: 0, bag: 1000000, clout: 1000, aura: 400 } as PlayerStats;
    expect(calculateEnding(state)).toBe(ENDINGS.MEDIA_TYCOON);
  });

  it('should return THE_GHOST if aura > clout * 2', () => {
    const state = { heat: 0, bag: 1000000, clout: 400, aura: 1000 } as PlayerStats;
    expect(calculateEnding(state)).toBe(ENDINGS.THE_GHOST);
  });

  it('should return WORLD_MOGUL for balanced stats', () => {
    const state = { heat: 0, bag: 1000000, clout: 1000, aura: 1000 } as PlayerStats;
    expect(calculateEnding(state)).toBe(ENDINGS.WORLD_MOGUL);
  });
});
