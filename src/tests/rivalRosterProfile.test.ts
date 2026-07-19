import { describe, it, expect } from 'vitest';
import { getRivalRosterProfile } from '../utils/rivalUtils';
import type { Rival } from '../types/game';

describe('Rival to Roster Profile Mapping Helper', () => {
  const createBaseRival = (fields: Partial<Rival> = {}): Rival => {
    return {
      id: 'test_rival',
      name: 'Test Rival',
      netWorth: 1000000,
      currentBid: 0,
      isNpc: true,
      tier: 'STARTUP',
      ...fields
    };
  };

  it('maps correct values when all personality fields are undefined (defaults to 0.5)', () => {
    const rival = createBaseRival();
    const profile = getRivalRosterProfile(rival);

    expect(profile.riskTolerance).toBe(50);
    // execution: (0.5 * 0.6) + (0.5 * 0.4) = 0.5 => 50
    expect(profile.execution).toBe(50);
    // vision: (0.5 * 0.5) + (0.5 * 0.3) + (0.5 * 0.2) = 0.5 => 50
    expect(profile.vision).toBe(50);
    // burnDiscipline: (0.5 * 0.5) + ((1 - 0.5) * 0.3) + (0.5 * 0.2) = 0.25 + 0.15 + 0.1 = 0.5 => 50
    expect(profile.burnDiscipline).toBe(50);
    // competence: (0.5 * 0.7) + (0.5 * 0.3) = 0.5 => 50
    expect(profile.competence).toBe(50);
    // loyalty: (0.5 * 0.4) + ((1 - 0.5) * 0.3) + (((0 + 100) / 200) * 0.3) = 0.2 + 0.15 + 0.15 = 0.5 => 50
    expect(profile.loyalty).toBe(50);
  });

  it('maps correct bounds when all stats are at their minimum (0)', () => {
    const rival = createBaseRival({
      riskTolerance: 0,
      aggression: 0,
      intelligence: 0,
      ambition: 0,
      ethics: 0,
      relationshipWithPlayer: -100
    });
    const profile = getRivalRosterProfile(rival);

    // Outputs should be bounded and within range
    expect(profile.riskTolerance).toBe(0);
    expect(profile.execution).toBe(0);
    expect(profile.vision).toBe(0);
    expect(profile.competence).toBe(0);

    // burnDiscipline: eth=0, agg=0, intel=0 => 0 + 0.3 * 1 + 0 = 0.3 => 30
    expect(profile.burnDiscipline).toBe(30);

    // loyalty: eth=0, agg=0, rel=-100 => 0 + 0.3 * 1 + 0 = 0.3 => 30
    expect(profile.loyalty).toBe(30);

    // Verify all fields are between 0 and 100
    Object.values(profile).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('maps correct bounds when all stats are at their maximum (1)', () => {
    const rival = createBaseRival({
      riskTolerance: 1,
      aggression: 1,
      intelligence: 1,
      ambition: 1,
      ethics: 1,
      relationshipWithPlayer: 100
    });
    const profile = getRivalRosterProfile(rival);

    expect(profile.riskTolerance).toBe(100);
    expect(profile.execution).toBe(100);
    expect(profile.vision).toBe(100);
    expect(profile.competence).toBe(100);

    // burnDiscipline: eth=1, agg=1, intel=1 => 1*0.5 + 0*0.3 + 1*0.2 = 0.7 => 70
    expect(profile.burnDiscipline).toBe(70);

    // loyalty: eth=1, agg=1, rel=100 => 1*0.4 + 0*0.3 + 1*0.3 = 0.7 => 70
    expect(profile.loyalty).toBe(70);

    // Verify all fields are between 0 and 100
    Object.values(profile).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('handles absolute extreme cases correctly and keeps outputs clamped in 0-100 range', () => {
    const rival = createBaseRival({
      riskTolerance: 9.9,
      aggression: -5.0,
      intelligence: 12.0,
      ambition: -3.0,
      ethics: 4.5,
      relationshipWithPlayer: 500 // way above 100
    });
    const profile = getRivalRosterProfile(rival);

    // All should be properly clamped within 0-100 range
    Object.values(profile).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('correctly reacts to relationship score variations in loyalty calculations', () => {
    const neutralRival = createBaseRival({ relationshipWithPlayer: 0 });
    const hostileRival = createBaseRival({ relationshipWithPlayer: -50 });
    const friendlyRival = createBaseRival({ relationshipWithPlayer: 50 });

    const neutralProfile = getRivalRosterProfile(neutralRival);
    const hostileProfile = getRivalRosterProfile(hostileRival);
    const friendlyProfile = getRivalRosterProfile(friendlyRival);

    expect(friendlyProfile.loyalty).toBeGreaterThan(neutralProfile.loyalty);
    expect(neutralProfile.loyalty).toBeGreaterThan(hostileProfile.loyalty);
  });
});
