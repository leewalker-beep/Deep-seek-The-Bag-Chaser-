import type { PlayerStats } from '../types/game';

export const getDominantStat = (pl: PlayerStats): 'clout' | 'aura' | 'heat' | 'balanced' => {
  const stats: ('clout' | 'aura' | 'heat')[] = ['clout', 'aura', 'heat'];

  const dominant = stats.reduce((a, b) =>
    (pl[b] as number) > (pl[a] as number) ? b : a, 'clout' as 'clout' | 'aura' | 'heat');

  const values = stats.map(s => pl[s] as number);
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Balanced if the range is within 20% of the max value
  const isBalanced = max > 0 && (max - min) < (max * 0.2);

  return isBalanced ? 'balanced' : dominant;
};
