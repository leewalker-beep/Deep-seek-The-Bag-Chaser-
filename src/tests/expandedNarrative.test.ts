import { describe, it, expect } from 'vitest';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';

describe('Expanded Narrative Arcs', () => {
  it('should have all 50 new arcs integrated into NARRATIVE_EVENTS', () => {
    // Total events should be around 220 (70 base + 150 new)
    expect(NARRATIVE_EVENTS.length).toBeGreaterThan(200);

    // Check for the last event of the last arc
    const hasLastArc = NARRATIVE_EVENTS.some(e => e.id === 'monument_3_immortality');
    expect(hasLastArc).toBe(true);
  });

  it('should ensure all arc events have unique IDs', () => {
    const ids = NARRATIVE_EVENTS.flatMap(e => [e.id, ...e.choices.map(c => c.id)]);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should verify arc connectivity via flags', () => {
    const pops1 = NARRATIVE_EVENTS.find(e => e.id === 'char_pops_1_the_reunion');
    const pops2 = NARRATIVE_EVENTS.find(e => e.id === 'char_pops_2_threat');

    expect(pops1?.choices.some(c => c.setFlags?.['pops_mentor'])).toBe(true);
    expect(pops2?.trigger.flagReqs?.['pops_mentor']).toBe(true);
  });

  it('should have branching choices in several arcs', () => {
    const branchingEvents = NARRATIVE_EVENTS.filter(e => e.choices.length > 1);
    expect(branchingEvents.length).toBeGreaterThan(10);
  });
});
