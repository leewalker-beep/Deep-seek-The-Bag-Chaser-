import type { NarrativeEvent } from '../types/game';

export let NARRATIVE_EVENTS: NarrativeEvent[] = [];

export function setNarrativeEvents(events: NarrativeEvent[]) {
  NARRATIVE_EVENTS.length = 0;
  NARRATIVE_EVENTS.push(...events);
}

// Export SATIRICAL_NARRATIVE_EXPANSIONS for test coverage if it is imported
export const SATIRICAL_NARRATIVE_EXPANSIONS: NarrativeEvent[] = [];

// Helper to check if expansions are empty and populate them dynamically
export function updateSatiricalExpansions() {
  SATIRICAL_NARRATIVE_EXPANSIONS.length = 0;
  const filtered = NARRATIVE_EVENTS.filter(e =>
    ['soul_equity_collateral', 'corporate_wellness_purge', 'presidential_distraction'].includes(e.id)
  );
  SATIRICAL_NARRATIVE_EXPANSIONS.push(...filtered);
}
