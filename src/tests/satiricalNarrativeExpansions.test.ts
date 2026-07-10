import { describe, it, expect, beforeEach } from 'vitest';
import { NARRATIVE_EVENTS, SATIRICAL_NARRATIVE_EXPANSIONS } from '../config/narrativeEvents';
import { WORLD_EVENTS, HIGH_SATIRE_WORLD_NEWS } from '../config/worldEvents';
import { useGameStore } from '../store/gameStore';

describe('Satirical Narrative Expansions & High Satire World News Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetGame } = useGameStore.getState();
    resetGame();
  });

  it('should have SATIRICAL_NARRATIVE_EXPANSIONS appended to NARRATIVE_EVENTS', () => {
    expect(SATIRICAL_NARRATIVE_EXPANSIONS.length).toBe(3);
    for (const exp of SATIRICAL_NARRATIVE_EXPANSIONS) {
      const found = NARRATIVE_EVENTS.find(e => e.id === exp.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe(exp.title);
    }
  });

  it('should successfully resolve choice and print logMessage to the news feed', () => {
    const store = useGameStore.getState();
    const eventId = 'soul_equity_collateral';
    const choiceId = 'monetize_psyche';

    // Simulate activating the narrative
    useGameStore.setState({
      pl: {
        ...store.pl,
        activeNarrative: eventId,
      }
    });

    // Resolve the choice
    useGameStore.getState().resolveNarrativeEvent(choiceId);

    const updatedState = useGameStore.getState();

    // Check that the stats were modified correctly (bag += 500000, clout += 50)
    expect(updatedState.pl.bag).toBeGreaterThanOrEqual(store.pl.bag + 500000);
    expect(updatedState.pl.clout).toBeGreaterThanOrEqual(store.pl.clout + 50);

    // Verify narrative flag is set
    expect(updatedState.pl.narrativeFlags['liquidated_childhood']).toBe(true);

    // Verify logMessage was written to the news feed
    const expectedLog = '❌ You monetized your early memories. You can no longer recall the layout of your childhood bedroom, but your automated Runway is extended by 6 months.';
    const newsItem = updatedState.news.find(item => typeof item === 'object' && item.text === expectedLog);
    expect(newsItem).toBeDefined();
    expect(newsItem).toEqual({ text: expectedLog, colorClass: 'text-blue-400 font-bold' });
  });

  it('should verify the high satire world news definitions are bound correctly in WORLD_EVENTS', () => {
    expect(HIGH_SATIRE_WORLD_NEWS).toBeDefined();
    expect(HIGH_SATIRE_WORLD_NEWS.bull_market.start).toContain('AI startup that translates corporate sigh cycles');
    expect(HIGH_SATIRE_WORLD_NEWS.recession.start).toContain('replacing basic grocery spending with high-yield');
    expect(HIGH_SATIRE_WORLD_NEWS.crackdown.start).toContain('weaponized algorithmic audits');

    // Find the world events and verify templates
    const boomEvent = WORLD_EVENTS.find(e => e.id === 'economic_boom');
    const recessionEvent = WORLD_EVENTS.find(e => e.id === 'recession');
    const crackdownEvent = WORLD_EVENTS.find(e => e.id === 'regulatory_crackdown');

    expect(boomEvent?.newsTemplates).toEqual(HIGH_SATIRE_WORLD_NEWS.bull_market);
    expect(recessionEvent?.newsTemplates).toEqual(HIGH_SATIRE_WORLD_NEWS.recession);
    expect(crackdownEvent?.newsTemplates).toEqual(HIGH_SATIRE_WORLD_NEWS.crackdown);
  });
});
