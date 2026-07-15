import type { PlayerStats } from '../types/game';
import { HUSTLES } from '../config/hustles/base';

/**
 * Returns the total number of mastered hustles.
 * Counts every hustle where hustleLevels[hustleId] has reached the maximum possible level
 * AND the hustle has actually been played.
 */
export const getMasteryCount = (player: PlayerStats): number => {
  if (player.masteredHustles && player.masteredHustles.length > 0) {
    return player.masteredHustles.length;
  }

  let count = 0;

  Object.keys(HUSTLES).forEach(hId => {
    const hustle = HUSTLES[hId];
    const currentLevel = player.hustleLevels[hId] || 0;
    if (currentLevel === 0) return;

    // Universal rule: minimum 20 plays required for mastery
    const plays = player.hustlePlays?.[hId] || 0;
    if (plays < 20) return;

    if (hustle.levels) {
      if (currentLevel >= hustle.levels.length) {
        count++;
      }
    } else if (hustle.branches) {
      const nodeId = player.hustleBranchIds[hId] || hustle.startBranchId;
      if (nodeId) {
        const node = hustle.branches[nodeId];
        const isTerminal = node && (!node.nextBranches || node.nextBranches.length === 0);

        const isRepeatableMastery = node?.isRepeatable && (
          (hId === 'r_vending' && player.vendingCount >= 10) ||
          (hId === 'street_eats' && node.level >= 5) ||
          (node.id === 'l2b' && player.rentPortfolioCount >= 10)
        );

        if (isTerminal || isRepeatableMastery) {
          count++;
        }
      }
    }
  });

  return count;
};
