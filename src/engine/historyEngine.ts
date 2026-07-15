import type { PlayerStats, WorldFeedItem, WorldFeedCategory } from '../types/game';

export interface HistoryEvent {
  id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  category:
    | "CAREER"
    | "BUSINESS"
    | "RIVAL"
    | "CRIME"
    | "POLITICS"
    | "LEGACY"
    | "RELATIONSHIP"
    | "WORLD";
  importance: 1 | 2 | 3 | 4 | 5;
  participants?: string[];
  excludeFromBiography?: boolean;
}

const generateId = () => Math.random().toString(36).substring(7);

function getFeedCategory(cat: HistoryEvent['category']): WorldFeedCategory {
  switch (cat) {
    case 'CAREER': return 'SOCIAL';
    case 'BUSINESS': return 'BUSINESS';
    case 'RIVAL': return 'SOCIAL';
    case 'CRIME': return 'NEWS';
    case 'POLITICS': return 'POLITICS';
    case 'LEGACY': return 'WORLD';
    case 'WORLD': return 'WORLD';
    default: return 'NEWS';
  }
}

/**
 * Records a significant gameplay milestone as a structured historical event.
 */
export function recordHistoryEvent(
  pl: PlayerStats,
  event: Omit<HistoryEvent, 'year'>
): PlayerStats {
  if (!pl.history) {
    pl.history = [];
  }
  if (!pl.biography) {
    pl.biography = [];
  }
  if (!pl.recordedBioKeys) {
    pl.recordedBioKeys = [];
  }

  // Prevent duplicate events
  if (pl.history.some(e => e.id === event.id)) {
    return pl;
  }

  const month = event.month !== undefined ? event.month : pl.month;
  const year = Math.floor(month / 12);

  const fullEvent: HistoryEvent = {
    ...event,
    month,
    year,
  };

  // 1. Record the event
  pl.history.push(fullEvent);

  // Keep timeline chronologically ordered (ascending order of month, stable secondary sort by id)
  pl.history.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.id.localeCompare(b.id);
  });

  // 2. Synchronize biography and recordedBioKeys
  if (!event.excludeFromBiography) {
    // Prevent duplicate entries in biography list
    if (!pl.biography.includes(event.description)) {
      pl.biography.push(event.description);
    }
    if (!pl.recordedBioKeys.includes(event.id)) {
      pl.recordedBioKeys.push(event.id);
    }
  }

  // 3. World Feed Pinning: Important history events (importance 4 or 5) automatically pin
  if (event.importance >= 4) {
    if (!pl.worldFeed) {
      pl.worldFeed = [];
    }

    const feedText = `📢 ${event.title.toUpperCase()}: ${event.description}`;

    // Prevent duplicates in world feed
    const isFeedDuplicate = pl.worldFeed.some(
      item => item.text === feedText && item.month === month
    );

    if (!isFeedDuplicate) {
      const feedItem: WorldFeedItem = {
        id: `history_feed_${event.id}_${generateId()}`,
        category: getFeedCategory(event.category),
        text: feedText,
        source: "Wall Street Ledger",
        timestamp: Date.now(),
        month,
        pinned: true,
      };
      pl.worldFeed = [feedItem, ...pl.worldFeed].slice(0, 100);
    }
  }

  return pl;
}
