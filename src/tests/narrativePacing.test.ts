import { describe, it, expect, beforeEach } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import { PlayerStats, MarketType, Tier } from '../types/game';

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
    pl.monthsSinceLastEvent = 0;
    pl.lastCharacterId = undefined;
    pl.lastArcId = undefined;
  });

  it('should enforce a 4-month cooldown for MAJOR events', () => {
    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    NARRATIVE_EVENTS.forEach(e => e.trigger.probability = 1.0);

    let currentPl = { ...pl };
    let lastMajorMonth = -10;
    let majorEventCount = 0;

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
                        expect(gap).toBeGreaterThanOrEqual(4);
                    }
                    lastMajorMonth = m;
                    majorEventCount++;
                }

                currentPl.completedNarrativeEvents.push(currentPl.activeNarrative);
                currentPl.activeNarrative = null;
            }
        }
    } finally {
        NARRATIVE_EVENTS.forEach((e, i) => e.trigger.probability = originalProbabilities[i]);
    }

    expect(majorEventCount).toBeGreaterThan(0);
  });

  it('should prevent immediate character reappearance', () => {
    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    NARRATIVE_EVENTS.forEach(e => e.trigger.probability = 1.0);

    let currentPl = { ...pl };
    let lastCharacterId: string | undefined = undefined;

    try {
      for (let m = 1; m <= 50; m++) {
        const result = advanceMonth(currentPl, market);
        currentPl = result.newPl;

        if (currentPl.activeNarrative) {
          const triggeredEvent = NARRATIVE_EVENTS.find(e => e.id === currentPl.activeNarrative);
          if (triggeredEvent?.characterId) {
            expect(triggeredEvent.characterId).not.toBe(lastCharacterId);
            lastCharacterId = triggeredEvent.characterId;
          }
          currentPl.completedNarrativeEvents.push(currentPl.activeNarrative);
          currentPl.activeNarrative = null;
        }
      }
    } finally {
      NARRATIVE_EVENTS.forEach((e, i) => e.trigger.probability = originalProbabilities[i]);
    }
  });

  it('should enforce 12-month cooldown for the same story arc', () => {
    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    NARRATIVE_EVENTS.forEach(e => e.trigger.probability = 1.0);

    let currentPl = { ...pl };
    let arcFiredAt: Record<string, number> = {};

    try {
      for (let m = 1; m <= 200; m++) {
        const result = advanceMonth(currentPl, market);
        currentPl = result.newPl;

        if (currentPl.activeNarrative) {
          const triggeredEvent = NARRATIVE_EVENTS.find(e => e.id === currentPl.activeNarrative);
          if (triggeredEvent?.arcId) {
            if (arcFiredAt[triggeredEvent.arcId] !== undefined) {
              const gap = m - arcFiredAt[triggeredEvent.arcId];
              expect(gap).toBeGreaterThanOrEqual(12);
            }
            arcFiredAt[triggeredEvent.arcId] = m;
          }
          currentPl.completedNarrativeEvents.push(currentPl.activeNarrative);
          currentPl.activeNarrative = null;
        }
      }
    } finally {
      NARRATIVE_EVENTS.forEach((e, i) => e.trigger.probability = originalProbabilities[i]);
    }
  });

  it('should target approximately one event every 4 months over a 30-year simulation', () => {
    let currentPl = { ...pl };
    let totalEvents = 0;
    const SIM_MONTHS = 360; // 30 years

    // Use original probabilities to get a realistic measure of frequency
    const originalProbabilities = NARRATIVE_EVENTS.map(e => e.trigger.probability);
    // NARRATIVE_EVENTS.forEach(e => e.trigger.probability = Math.min(1.0, e.trigger.probability * 2));

    try {
      for (let m = 1; m <= SIM_MONTHS; m++) {
        // Advance player through tiers to keep events valid
        if (m === 24) currentPl.currentTier = 'STREET';
        if (m === 60) currentPl.currentTier = 'STARTUP';
        if (m === 120) currentPl.currentTier = 'CORPORATE';
        if (m === 180) currentPl.currentTier = 'ELITE';
        if (m === 240) currentPl.currentTier = 'MOGUL';
        if (m === 300) currentPl.currentTier = 'PRESIDENT';

        const result = advanceMonth(currentPl, market);
        currentPl = result.newPl;

        if (currentPl.activeNarrative) {
          totalEvents++;
          const ev = NARRATIVE_EVENTS.find(e => e.id === currentPl.activeNarrative);
          // Log for manual inspection in report
          if (m < 60) { // Log first 5 years
             console.log(`[Month ${m}] Event: ${ev?.title} | Char: ${ev?.characterId} | Arc: ${ev?.arcId}`);
          }
          currentPl.completedNarrativeEvents.push(currentPl.activeNarrative);
          currentPl.activeNarrative = null;
        }
      }
    } finally {
      NARRATIVE_EVENTS.forEach((e, i) => e.trigger.probability = originalProbabilities[i]);
    }

    const eventsPerMonth = totalEvents / SIM_MONTHS;
    const monthsPerEvent = SIM_MONTHS / totalEvents;

    console.log(`30-Year Simulation: ${totalEvents} events triggered. Average frequency: 1 event every ${monthsPerEvent.toFixed(2)} months.`);

    // Target is ~4 months. Acceptable range 3-6 months given randomness and tier requirements.
    expect(monthsPerEvent).toBeGreaterThanOrEqual(2.5);
    expect(monthsPerEvent).toBeLessThanOrEqual(7.0);
  });
});
