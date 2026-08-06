import { describe, it, expect } from 'vitest';
import { loadNarrativeEventsForTier } from '../utils/narrativeLoader';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';

describe('Narrative Loader Integration Tests', () => {
  it('should successfully load mud tier narrative events and update NARRATIVE_EVENTS', async () => {
    const events = await loadNarrativeEventsForTier('MUD');
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);

    // Check that NARRATIVE_EVENTS array is correctly updated
    expect(NARRATIVE_EVENTS).toBeDefined();
    expect(NARRATIVE_EVENTS.length).toBe(events.length);
    expect(NARRATIVE_EVENTS[0].id).toBe(events[0].id);
  });

  it('should successfully load street tier narrative events', async () => {
    const events = await loadNarrativeEventsForTier('STREET');
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });

  it('should successfully load startup tier narrative events', async () => {
    const events = await loadNarrativeEventsForTier('STARTUP');
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });

  it('should successfully load corporate tier narrative events', async () => {
    const events = await loadNarrativeEventsForTier('CORPORATE');
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });

  it('should successfully load elite tier narrative events', async () => {
    const events = await loadNarrativeEventsForTier('ELITE');
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });

  it('should successfully load presidency tier narrative events', async () => {
    const events = await loadNarrativeEventsForTier('PRESIDENT');
    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
  });
});
