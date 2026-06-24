import type { Tier } from '../types/game';
import { PROGRESSION_ORDER } from '../config/tiers';

/**
 * Calculates a global difficulty multiplier based on hustle level and player tier.
 * This ensures that as players progress through the game and upgrade hustles,
 * the mechanical challenge increases proportionally.
 */
export const getScalingMultiplier = (level: number = 1, tier: Tier = 'MUD'): number => {
  const tierIndex = PROGRESSION_ORDER.indexOf(tier);
  // Base tier impact: 0.25x increase per tier (MUD=1.0, STREET=1.25, etc.)
  const tierFactor = 1 + (tierIndex * 0.25);
  // Level impact: 0.15x increase per level beyond 1
  const levelFactor = 1 + ((level - 1) * 0.15);

  return tierFactor * levelFactor;
};

/**
 * Returns a factor for timers. Higher difficulty = shorter time.
 * Multiplier is usually between 1.0 and 0.4.
 */
export const getTimerFactor = (level: number = 1, tier: Tier = 'MUD'): number => {
  const scale = getScalingMultiplier(level, tier);
  // Shave off up to 60% of the timer at max difficulty
  return Math.max(0.4, 1.1 - (scale - 1) * 0.25);
};

/**
 * Returns a factor for spawn rates or frequency. Higher difficulty = more frequent.
 * Multiplier is usually between 1.0 and 2.5.
 */
export const getSpawnFactor = (level: number = 1, tier: Tier = 'MUD'): number => {
  const scale = getScalingMultiplier(level, tier);
  // Increase frequency by up to 150% at max difficulty
  return 1 + (scale - 1) * 0.7;
};

/**
 * Returns a precision window factor. Higher difficulty = smaller target.
 * Multiplier is usually between 1.0 and 0.5.
 */
export const getPrecisionFactor = (level: number = 1, tier: Tier = 'MUD'): number => {
  const scale = getScalingMultiplier(level, tier);
  return Math.max(0.5, 1.2 - (scale - 1) * 0.3);
};
