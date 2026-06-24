import { describe, it, expect } from 'vitest';
import { getScalingMultiplier, getTimerFactor, getSpawnFactor, getPrecisionFactor } from '../utils/difficulty';
import { PROGRESSION_ORDER } from '../config/tiers';

describe('Global Difficulty Scaling Utility', () => {
  it('should increase multiplier as tier increases', () => {
    const mudScale = getScalingMultiplier(1, 'MUD');
    const streetScale = getScalingMultiplier(1, 'STREET');
    const presidentScale = getScalingMultiplier(1, 'PRESIDENT');

    expect(mudScale).toBe(1.0);
    expect(streetScale).toBeGreaterThan(mudScale);
    expect(presidentScale).toBeGreaterThan(streetScale);
  });

  it('should increase multiplier as level increases', () => {
    const level1 = getScalingMultiplier(1, 'MUD');
    const level5 = getScalingMultiplier(5, 'MUD');

    expect(level5).toBeGreaterThan(level1);
    expect(level5).toBe(1.0 * (1 + (5 - 1) * 0.15)); // 1.6
  });

  it('should compound tier and level scaling', () => {
    // MOGUL (index 5) = 1 + 5 * 0.25 = 2.25
    // Level 3 = 1 + 2 * 0.15 = 1.3
    // Total = 2.25 * 1.3 = 2.925
    const compound = getScalingMultiplier(3, 'MOGUL');
    expect(compound).toBeCloseTo(2.925, 3);
  });

  it('should reduce timer factor as difficulty increases', () => {
    const mudTimer = getTimerFactor(1, 'MUD');
    const highTimer = getTimerFactor(5, 'PRESIDENT');

    expect(mudTimer).toBe(1.1); // 1.1 - (1-1)*0.25
    expect(highTimer).toBeLessThan(mudTimer);
    expect(highTimer).toBeGreaterThanOrEqual(0.4);
  });

  it('should increase spawn factor as difficulty increases', () => {
    const mudSpawn = getSpawnFactor(1, 'MUD');
    const highSpawn = getSpawnFactor(5, 'PRESIDENT');

    expect(mudSpawn).toBe(1.0);
    expect(highSpawn).toBeGreaterThan(mudSpawn);
  });

  it('should reduce precision factor as difficulty increases', () => {
    const mudPrec = getPrecisionFactor(1, 'MUD');
    const highPrec = getPrecisionFactor(5, 'PRESIDENT');

    expect(mudPrec).toBe(1.2); // 1.2 - (1-1)*0.3
    expect(highPrec).toBeLessThan(mudPrec);
    expect(highPrec).toBeGreaterThanOrEqual(0.5);
  });
});
