import type { NarrativeEvent, Tier } from '../types/game';
import { setNarrativeEvents } from '../config/narrativeEvents';

export async function loadNarrativeEventsForTier(tier: Tier): Promise<NarrativeEvent[]> {
  const lowerTier = tier.toLowerCase();
  let events: NarrativeEvent[] = [];

  try {
    switch (lowerTier) {
      case 'mud':
        events = (await import('../config/narrative/mud.json')).default as NarrativeEvent[];
        break;
      case 'street':
        events = (await import('../config/narrative/street.json')).default as NarrativeEvent[];
        break;
      case 'startup':
        events = (await import('../config/narrative/startup.json')).default as NarrativeEvent[];
        break;
      case 'corporate':
        events = (await import('../config/narrative/corporate.json')).default as NarrativeEvent[];
        break;
      case 'elite':
      case 'mogul':
        events = (await import('../config/narrative/elite.json')).default as NarrativeEvent[];
        break;
      case 'president':
      case 'open':
        events = (await import('../config/narrative/presidency.json')).default as NarrativeEvent[];
        break;
      default:
        events = [];
    }
  } catch (err) {
    console.error(`Failed to dynamically load narrative events for tier: ${tier}`, err);
  }

  setNarrativeEvents(events);
  return events;
}
