import type { PlayerStats } from '../types/game';
import { HUSTLES } from '../config/hustles/base';

export interface MasteryRequirement {
  minPlays: number;
  minLevel?: number; // minimum level required
  noLevelReq?: boolean; // explicitly no level requirement
}

export const CROWN_PROGRESS_LABELS: Record<string, string> = {
  r_labor: 'Jobs completed',
  r_delivery: 'Runs completed',
  r_plasma: 'Donations',
  r_vending: 'Purchases',
  r_ghost_mode: 'Successful runs',
  r_scrap: 'Successful salvage runs',
  street_eats: 'Successful service runs',
  cleaning: 'Successful jobs',
  h_sign_spinner: 'Campaigns',
  r_flyers: 'Campaigns',
  cc: 'Uploads',
  pod: 'Episodes recorded',
  techFlip: 'Profitable flips',
  sw: 'Product releases',
  drop: 'Profitable sales cycles',
  ecom_brand: 'Profitable sales cycles',
  h_talent_agent: 'Successful client deals',
  saas_mvp: 'Successful product launches',
  meme: 'Profitable trading months',
  audio: 'Successful releases',
  agency_scale: 'Successful automation deployments',
  smm: 'Successful launches',
  real_estate_empire: 'Successful property expansions',
  venture_capital: 'Successful investments',
  data_analytics: 'Successful optimization projects',
  festival: 'Successful events',
  virtual_assistant_agency: 'Major contracts',
  media_empire: 'Successful campaigns',
  privateequity: 'Successful acquisitions',
  luxury_conglomerate: 'Successful launches',
  h_global_conglomerate: 'Successful expansions',
  philanthropy_empire: 'Major charitable initiatives',
  president_campaign: 'Successful policy terms',
  lobbying: 'Successful diplomatic initiatives',
};

export const MASTERY_REQUIREMENTS: Record<string, MasteryRequirement> = {
  r_labor: { minPlays: 10, minLevel: 2 },
  r_delivery: { minPlays: 10, minLevel: 2 },
  r_plasma: { minPlays: 15, noLevelReq: true },
  r_vending: { minPlays: 20, noLevelReq: true }, // Complete 20 purchases, no level requirement
  r_ghost_mode: { minPlays: 8, minLevel: 2 },
  r_scrap: { minPlays: 10, minLevel: 2 },
  street_eats: { minPlays: 10, minLevel: 2 },
  cleaning: { minPlays: 12, noLevelReq: true },
  h_sign_spinner: { minPlays: 15, noLevelReq: true },
  r_flyers: { minPlays: 15, noLevelReq: true }, // mapped for fallback/save compatibility
  cc: { minPlays: 10, noLevelReq: true },
  pod: { minPlays: 6, minLevel: 2 },
  techFlip: { minPlays: 8, minLevel: 2 },
  sw: { minPlays: 8, noLevelReq: true },
  drop: { minPlays: 8, minLevel: 2 },
  h_talent_agent: { minPlays: 8, noLevelReq: true },

  // STARTUP Tier Rebalance
  saas_mvp: { minPlays: 6, minLevel: 2 },
  ecom_brand: { minPlays: 8, minLevel: 2 },
  meme: { minPlays: 10, noLevelReq: true },
  audio: { minPlays: 8, noLevelReq: true },
  agency_scale: { minPlays: 6, minLevel: 2 },
  smm: { minPlays: 6, minLevel: 2 },

  // CORPORATE Tier Rebalance
  real_estate_empire: { minPlays: 6, minLevel: 2 },
  venture_capital: { minPlays: 6, minLevel: 2 },
  data_analytics: { minPlays: 8, noLevelReq: true },
  festival: { minPlays: 8, noLevelReq: true },
  virtual_assistant_agency: { minPlays: 6, minLevel: 2 },
  media_empire: { minPlays: 6, noLevelReq: true },

  // ELITE Tier Rebalance
  privateequity: { minPlays: 5, minLevel: 2 },
  luxury_conglomerate: { minPlays: 6, noLevelReq: true },
  h_global_conglomerate: { minPlays: 5, minLevel: 2 },
  philanthropy_empire: { minPlays: 8, noLevelReq: true },

  // PRESIDENT Tier Rebalance
  president_campaign: { minPlays: 4, minLevel: 2 },
  lobbying: { minPlays: 4, noLevelReq: true },
};

export const isHustleMastered = (player: PlayerStats, hId: string): boolean => {
  const hustle = HUSTLES[hId];
  if (!hustle) return false;

  const currentLevel = player.hustleLevels[hId] || 0;

  // A hustle has to be unlocked or played to be mastered.
  const hasPlayed = player.hustleLevels[hId] !== undefined || player.hustleBranchIds[hId] !== undefined;
  if (!hasPlayed) return false;

  const plays = player.hustlePlays?.[hId] || 0;

  // Check if we have a custom requirement for this hustle
  const req = MASTERY_REQUIREMENTS[hId];
  if (req) {
    // Vending Machine play count can be either plays or vendingCount
    let actualPlays = plays;
    if (hId === 'r_vending') {
      actualPlays = Math.max(plays, player.vendingCount || 0);
    }
    // Human Billboard can be h_sign_spinner or r_flyers
    if (hId === 'h_sign_spinner') {
      actualPlays = Math.max(plays, player.hustlePlays?.['r_flyers'] || 0);
    }
    if (hId === 'r_flyers') {
      actualPlays = Math.max(plays, player.hustlePlays?.['h_sign_spinner'] || 0);
    }

    if (actualPlays < req.minPlays) return false;

    if (req.noLevelReq) return true;

    if (req.minLevel !== undefined) {
      return currentLevel >= req.minLevel;
    }

    return false;
  }

  // Fallback to Universal / Legacy Rule
  if (plays < 20) return false;

  if (hustle.levels) {
    return currentLevel >= hustle.levels.length;
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

      return !!(isTerminal || isRepeatableMastery);
    }
  }

  return false;
};

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
    if (isHustleMastered(player, hId)) {
      count++;
    }
  });

  return count;
};
