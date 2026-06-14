import type { GameState, GameEvent } from '../types/game';
import { ACHIEVEMENTS } from '../config/achievements';

/**
 * AchievementEngine
 * Listens to state changes and game events to determine if any achievements should be unlocked.
 */
export const checkAchievements = (state: GameState, event?: GameEvent): string[] => {
  const newlyUnlocked: string[] = [];

  // Filter for achievements not yet unlocked in the state
  const lockedAchievements = ACHIEVEMENTS.filter(config =>
    !state.achievements.find(a => a.id === config.id)?.isUnlocked
  );

  for (const config of lockedAchievements) {
    if (config.requirement.check(state, event)) {
      newlyUnlocked.push(config.id);
    }
  }

  return newlyUnlocked;
};
