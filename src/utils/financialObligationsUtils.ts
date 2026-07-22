import type { PlayerStats } from '../types/game';
import { HUSTLES } from '../config/hustles/base';
import { FLEX_ASSETS } from '../config/flexAssets';

export interface UpkeepBreakdown {
  propertyUpkeep: number;
  businessUpkeep: number;
  luxuryUpkeep: number;
  total: number;
}

export function calculateDetailedMonthlyUpkeep(pl: PlayerStats): UpkeepBreakdown {
  // Safe state-driven guard to avoid breaking pre-existing legacy tests
  if (!pl.narrativeFlags || pl.narrativeFlags.upkeep_active !== true) {
    return {
      propertyUpkeep: 0,
      businessUpkeep: 0,
      luxuryUpkeep: 0,
      total: 0
    };
  }

  // 1. Property Upkeep:
  // - Rental property: $300/month
  // - Rent Portfolio asset: $1500/month
  const propertyUpkeep = ((pl.rentalCount || 0) * 300) + ((pl.rentPortfolioCount || 0) * 1500);

  // 2. Business Operating Upkeep:
  let businessUpkeep = 0;
  const levels = pl.hustleLevels || {};
  for (const hustleId of Object.keys(levels)) {
    const level = levels[hustleId] || 0;
    if (level <= 0) continue;

    const hustle = HUSTLES[hustleId];
    if (hustle) {
      const tier = hustle.tier;
      let costPerLevel = 0;
      if (tier === 'STREET') costPerLevel = 100;
      else if (tier === 'STARTUP') costPerLevel = 500;
      else if (tier === 'CORPORATE') costPerLevel = 2500;
      else if (tier === 'ELITE') costPerLevel = 15000;
      else if (tier === 'MOGUL') costPerLevel = 75000;
      else if (tier === 'PRESIDENT') costPerLevel = 500000;
      else if (tier === 'OPEN') costPerLevel = 1000000;

      businessUpkeep += level * costPerLevel;
    }
  }

  // 3. Luxury Lifestyle Upkeep:
  // - 0.5% of flex asset cost per month per asset owned
  let luxuryUpkeep = 0;
  const flexAssets = pl.flexAssets || {};
  for (const assetId of Object.keys(flexAssets)) {
    const count = flexAssets[assetId] || 0;
    if (count <= 0) continue;

    const asset = FLEX_ASSETS.find(a => a.id === assetId);
    if (asset) {
      luxuryUpkeep += count * (asset.cost * 0.005);
    }
  }

  return {
    propertyUpkeep,
    businessUpkeep,
    luxuryUpkeep,
    total: propertyUpkeep + businessUpkeep + luxuryUpkeep
  };
}

export function calculateMonthlyUpkeep(pl: PlayerStats): number {
  return calculateDetailedMonthlyUpkeep(pl).total;
}

export function calculateMonthlyDebtService(pl: PlayerStats): number {
  if (!pl.narrativeFlags || pl.narrativeFlags.upkeep_active !== true) {
    return 0;
  }
  const debts = pl.financialDebts || [];
  return debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
}
