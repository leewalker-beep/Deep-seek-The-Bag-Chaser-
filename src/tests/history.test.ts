import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { recordHistoryEvent } from '../engine/historyEngine';
import type { PlayerStats } from '../types/game';

describe('Living History Engine & Integration', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  it('should record history events correctly with computed month and year', () => {
    const pl = useGameStore.getState().pl;

    // Record an event at month 15 (which is Year 1)
    const updatedPl = recordHistoryEvent({ ...pl }, {
      id: 'test_event_1',
      title: 'Venture Capital Funding',
      description: 'Secured first venture seed capital.',
      category: 'BUSINESS',
      importance: 3,
      month: 15,
    });

    expect(updatedPl.history).toBeDefined();
    expect(updatedPl.history!.length).toBeGreaterThan(0);

    const event = updatedPl.history!.find(e => e.id === 'test_event_1');
    expect(event).toBeDefined();
    expect(event!.month).toBe(15);
    expect(event!.year).toBe(1); // Math.floor(15 / 12) = 1
    expect(event!.category).toBe('BUSINESS');
    expect(event!.importance).toBe(3);
  });

  it('should prevent recording duplicate history events', () => {
    const pl = useGameStore.getState().pl;

    const plWithEvent = recordHistoryEvent({ ...pl }, {
      id: 'dup_event_key',
      title: 'Company Merger',
      description: 'Merged corporate entities.',
      category: 'BUSINESS',
      importance: 3,
      month: 5,
    });

    const initialLength = plWithEvent.history!.length;

    // Try to record the duplicate event again
    const plDup = recordHistoryEvent(plWithEvent, {
      id: 'dup_event_key',
      title: 'Company Merger (Duplicate)',
      description: 'Duplicate merged entities.',
      category: 'BUSINESS',
      importance: 3,
      month: 5,
    });

    expect(plDup.history!.length).toBe(initialLength);
  });

  it('should synchronize biography with recorded history events', () => {
    const pl = useGameStore.getState().pl;

    const updatedPl = recordHistoryEvent({ ...pl }, {
      id: 'bio_sync_key',
      title: 'First Arrest',
      description: 'Faced sudden legal complications and spent time in custody.',
      category: 'CRIME',
      importance: 4,
      month: 10,
    });

    // Biography should have the exact description
    expect(updatedPl.biography).toContain('Faced sudden legal complications and spent time in custody.');
    expect(updatedPl.recordedBioKeys).toContain('bio_sync_key');
  });

  it('should only pin high importance events (4 or 5) to the World Feed', () => {
    const pl = useGameStore.getState().pl;

    // 1. Minor event (importance 3)
    let updatedPl = recordHistoryEvent({ ...pl }, {
      id: 'minor_event_key',
      title: 'Minor Venture',
      description: 'Started a small corner stand.',
      category: 'BUSINESS',
      importance: 3,
      month: 12,
    });

    const initialFeedLength = updatedPl.worldFeed?.length || 0;

    // 2. High importance event (importance 5)
    updatedPl = recordHistoryEvent(updatedPl, {
      id: 'major_event_key',
      title: 'Became President',
      description: 'Elected as the chief executive of the nation.',
      category: 'POLITICS',
      importance: 5,
      month: 12,
    });

    const finalFeed = updatedPl.worldFeed || [];
    expect(finalFeed.length).toBe(initialFeedLength + 1);

    const pinnedItem = finalFeed[0];
    expect(pinnedItem.pinned).toBe(true);
    expect(pinnedItem.text).toContain('BECAME PRESIDENT');
  });

  it('should maintain chronological sorting order of events in the timeline', () => {
    const pl = useGameStore.getState().pl;

    // Insert events out of chronological order
    let updatedPl = recordHistoryEvent({ ...pl }, {
      id: 'month_24_event',
      title: 'Corporate Launch',
      description: 'Scaled to national operations.',
      category: 'CAREER',
      importance: 3,
      month: 24,
    });

    updatedPl = recordHistoryEvent(updatedPl, {
      id: 'month_5_event',
      title: 'Corner Shop',
      description: 'Launched local shop.',
      category: 'BUSINESS',
      importance: 3,
      month: 5,
    });

    updatedPl = recordHistoryEvent(updatedPl, {
      id: 'month_12_event',
      title: 'District Expand',
      description: 'Expanded properties.',
      category: 'BUSINESS',
      importance: 3,
      month: 12,
    });

    const history = updatedPl.history || [];
    expect(history.length).toBeGreaterThanOrEqual(3);

    // Filter to our test events to verify ordering
    const testEvents = history.filter(e =>
      ['month_5_event', 'month_12_event', 'month_24_event'].includes(e.id)
    );

    expect(testEvents[0].id).toBe('month_5_event');
    expect(testEvents[1].id).toBe('month_12_event');
    expect(testEvents[2].id).toBe('month_24_event');
  });
});
