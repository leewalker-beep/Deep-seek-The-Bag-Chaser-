import type { HallOfFameEntry } from '../types/game';

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
