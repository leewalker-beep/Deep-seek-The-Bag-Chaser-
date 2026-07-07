import { describe, it, expect, beforeEach } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import { PlayerStats, MarketType } from '../types/game';

describe('Narrative Pacing System', () => {
  let pl: PlayerStats;
  const market: MarketType = 'NORMAL';

  beforeEach(() => {
    pl = getInitialStats(3); // Grinder
    pl.chosenBackground = 'sk_scrap';
    pl.chosenBackgroundCategory = 'street_kid';
    pl.narrativeCooldown = 0;
    pl.completedNarrativeEvents = [];
    pl.narrativeFlags = {};
  });

  it('should enforce a 4-month cooldown for MAJOR events', () => {
    // Force a MAJOR event to trigger
    // scavenger_prototype is a MAJOR event (pacingCategory: 'MAJOR')
    const eventId = 'scavenger_prototype';
    const event = NARRATIVE_EVENTS.find(e => e.id === eventId);
    expect(event).toBeDefined();
    expect(event?.pacingCategory).toBe('MAJOR');

    // Simulate 100 months and check gaps between MAJOR events
    let lastMajorMonth = -10;
    let majorEventCount = 0;

    // Use a modified version of advanceMonth or just simulate the loop
    // To make it deterministic for the test, we'll mock Math.random if needed,
    // but here we can just loop until we get enough events.

    let currentPl = { ...pl };

    // We'll simulate 100 months.
    // Since probability is involved, we might not get many events,
    // so we'll bump probabilities for the test.
    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    NARRATIVE_EVENTS.forEach(e => e.trigger.probability = 1.0);

    try {
        for (let m = 1; m <= 100; m++) {
            const result = advanceMonth(currentPl, market);
            currentPl = result.newPl;

            if (currentPl.activeNarrative) {
                const triggeredEvent = NARRATIVE_EVENTS.find(e => e.id === currentPl.activeNarrative);
                const category = triggeredEvent?.pacingCategory || (triggeredEvent?.characterId ? 'CHARACTER' : 'MAJOR');

                if (category === 'MAJOR') {
                    if (lastMajorMonth !== -10) {
                        const gap = m - lastMajorMonth;
                        // It should be at least 4 months since the last one was *set*
                        // Wait, if it triggered in month X, cooldown became 4.
                        // Month X+1: cooldown 3
                        // Month X+2: cooldown 2
                        // Month X+3: cooldown 1
                        // Month X+4: cooldown 0 -> can trigger again.
                        // So gap should be >= 4.
                        expect(gap).toBeGreaterThanOrEqual(4);
                    }
                    lastMajorMonth = m;
                    majorEventCount++;
                }

                // Clear active narrative so another can trigger
                currentPl.completedNarrativeEvents.push(currentPl.activeNarrative);
                currentPl.activeNarrative = null;
            }
        }
    } finally {
        // Restore original probabilities
        NARRATIVE_EVENTS.forEach((e, i) => e.trigger.probability = originalProbabilities[i]);
    }

    expect(majorEventCount).toBeGreaterThan(0);
  });

  it('should allow CHARACTER events to trigger independently of MAJOR cooldown', () => {
    // Force a MAJOR event to trigger in month 1
    let currentPl = { ...pl };
    currentPl.narrativeCooldown = 0;

    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    NARRATIVE_EVENTS.forEach(e => e.trigger.probability = 0); // Disable all

    const majorEvent = NARRATIVE_EVENTS.find(e => e.pacingCategory === 'MAJOR');
    const charEvent = NARRATIVE_EVENTS.find(e => e.pacingCategory === 'CHARACTER' || e.characterId);

    if (!majorEvent || !charEvent) return;

    majorEvent.trigger.probability = 1.0;
    charEvent.trigger.probability = 1.0;

    try {
        // Month 1: Major event triggers
        let result = advanceMonth(currentPl, market);
        currentPl = result.newPl;
        expect(currentPl.activeNarrative).toBe(majorEvent.id);
        expect(currentPl.narrativeCooldown).toBe(4);

        // Resolve it
        currentPl.completedNarrativeEvents.push(currentPl.activeNarrative!);
        currentPl.activeNarrative = null;

        // Month 2: Major should NOT trigger, but Character CAN
        result = advanceMonth(currentPl, market);
        currentPl = result.newPl;

        // It might trigger the character event
        expect(currentPl.activeNarrative).toBe(charEvent.id);
        expect(currentPl.narrativeCooldown).toBe(3); // Cooldown still ticking down from Major
    } finally {
        NARRATIVE_EVENTS.forEach((e, i) => e.trigger.probability = originalProbabilities[i]);
    }
  });

  it('should allow RIVAL and PRESIDENCY events to trigger independently', () => {
    let currentPl = { ...pl };
    currentPl.currentTier = 'PRESIDENT'; // Enable presidency events

    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    const originalTiers = NARRATIVE_EVENTS.map(e => e.trigger.tier);

    // Disable all
    NARRATIVE_EVENTS.forEach(e => e.trigger.probability = 0);

    const majorEvent = NARRATIVE_EVENTS.find(e => e.pacingCategory === 'MAJOR');
    const rivalEvent = NARRATIVE_EVENTS.find(e => e.pacingCategory === 'RIVAL');
    const presEvent = NARRATIVE_EVENTS.find(e => e.pacingCategory === 'PRESIDENCY');

    if (!majorEvent || !rivalEvent || !presEvent) return;

    // Ensure they are valid for the test
    majorEvent.trigger.probability = 1.0;
    majorEvent.trigger.tier = ['PRESIDENT'];

    rivalEvent.trigger.probability = 1.0;
    rivalEvent.trigger.tier = ['PRESIDENT'];

    presEvent.trigger.probability = 1.0;
    presEvent.trigger.tier = ['PRESIDENT'];

    try {
        // Month 1: Major event triggers (it appears first in the array usually)
        let result = advanceMonth(currentPl, market);
        currentPl = result.newPl;

        // Since we set several to 1.0, it picks the first valid one in NARRATIVE_EVENTS
        const firstTriggered = currentPl.activeNarrative;
        expect(firstTriggered).toBeDefined();
        const firstCategory = NARRATIVE_EVENTS.find(e => e.id === firstTriggered)?.pacingCategory;

        // Resolve it
        currentPl.completedNarrativeEvents.push(currentPl.activeNarrative!);
        currentPl.activeNarrative = null;

        // If it was MAJOR, cooldown is set.
        // If not, we can manually trigger a MAJOR one to test the gating.
        if (firstCategory !== 'MAJOR') {
            currentPl.narrativeCooldown = 4;
        }

        // Month 2: Rival or Presidency can trigger even if cooldown > 0
        result = advanceMonth(currentPl, market);
        currentPl = result.newPl;

        expect(currentPl.activeNarrative).toBeDefined();
        const secondCategory = NARRATIVE_EVENTS.find(e => e.id === currentPl.activeNarrative)?.pacingCategory;
        expect(['RIVAL', 'PRESIDENCY', 'CHARACTER']).toContain(secondCategory);
        expect(currentPl.narrativeCooldown).toBeGreaterThan(0);
    } finally {
        NARRATIVE_EVENTS.forEach((e, i) => {
            e.trigger.probability = originalProbabilities[i];
            e.trigger.tier = originalTiers[i];
        });
    }
  });
});
