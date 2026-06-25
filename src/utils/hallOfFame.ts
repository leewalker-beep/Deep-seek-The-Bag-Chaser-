import type { HallOfFameEntry } from '../types/game';

/**
 * NOTE: Hall of Fame uses direct localStorage instead of the Zustand persist layer
 * because Hall of Fame data must persist across multiple game runs and resets.
 * The main game store (zustand) is cleared when a new run begins, but the
 * Hall of Fame serves as a permanent record of all completed runs.
 */
const STORAGE_KEY = 'bagchaser_hall_of_fame';

export const saveHallOfFameEntry = (entry: HallOfFameEntry) => {
  if (typeof window === 'undefined') return;

  try {
    const existing = getHallOfFameEntries();
    const updated = [...existing, entry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save Hall of Fame entry:', e);
  }
};

export const getHallOfFameEntries = (): HallOfFameEntry[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HallOfFameEntry[];
  } catch (e) {
    console.error('Failed to parse Hall of Fame entries:', e);
    return [];
  }
};

export const getBestRun = (): HallOfFameEntry | null => {
  const entries = getHallOfFameEntries();
  if (entries.length === 0) return null;

  return entries.reduce((best, current) => {
    return current.legacyScore > (best?.legacyScore || 0) ? current : best;
  }, entries[0]);
};
