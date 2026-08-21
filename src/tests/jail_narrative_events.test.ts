import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';

describe('Jail Narrative Events', () => {
  let originalRandom: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('should allow jail-only events to trigger while pl.inJail is true', () => {
    const stats = getInitialStats(3);
    stats.inJail = true;
    stats.isIncarcerated = true;
    stats.jailMonthsRemaining = 10;
    stats.currentTier = 'STREET';
    stats.activeNarrative = null;
    stats.monthsSinceLastEvent = 10;
    stats.narrativeCooldown = 0;
    stats.rivals = [];

    // Force Math.random to return 0.01 so probability check succeeds
    Math.random = () => 0.01;

    const result = advanceMonth(stats, 'NORMAL', [], true);
    expect(result.newPl.activeNarrative).not.toBeNull();
    expect(result.newPl.activeNarrative).toMatch(/^jail_/);
  });

  it('should never trigger jail-only events while pl.inJail is false', () => {
    const stats = getInitialStats(3);
    stats.inJail = false;
    stats.isIncarcerated = false;
    stats.currentTier = 'STREET';
    stats.activeNarrative = null;
    stats.monthsSinceLastEvent = 10;
    stats.narrativeCooldown = 0;
    stats.rivals = [];

    // Force Math.random to 0.01
    Math.random = () => 0.01;

    const result = advanceMonth(stats, 'NORMAL', [], true);
    if (result.newPl.activeNarrative) {
      expect(result.newPl.activeNarrative).not.toMatch(/^jail_/);
    }
  });

  it('should never trigger non-jail narrative events while incarcerated (regression check)', () => {
    const stats = getInitialStats(3);
    stats.inJail = true;
    stats.isIncarcerated = true;
    stats.jailMonthsRemaining = 10;
    stats.currentTier = 'STREET';
    stats.monthsSinceLastEvent = 10;
    stats.narrativeCooldown = 0;
    stats.activeNarrative = null;
    stats.rivals = [];

    Math.random = () => 0.001;

    for (let i = 0; i < 20; i++) {
      stats.activeNarrative = null;
      stats.completedNarrativeEvents = [];
      const result = advanceMonth(stats, 'NORMAL', [], true);
      if (result.newPl.activeNarrative) {
        const activeEv = NARRATIVE_EVENTS.find(e => e.id === result.newPl.activeNarrative);
        expect(activeEv?.trigger.jailOnly).toBe(true);
      }
    }
  });

  it('should verify all 10 jail-only events have trigger.jailOnly set to true', () => {
    const jailEvents = NARRATIVE_EVENTS.filter(e => e.id.startsWith('jail_'));
    expect(jailEvents.length).toBeGreaterThanOrEqual(10);
    jailEvents.forEach(e => {
      expect(e.trigger.jailOnly).toBe(true);
    });
  });
});
