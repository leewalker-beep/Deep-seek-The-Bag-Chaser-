import type { PlayerStats, MarketType, Tier } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { HUSTLES } from '../config/hustles/base';
import { enforceStatCaps } from './statEngine';

const rentByTier: Record<Tier, number> = {
  MUD: 200,
  STREET: 300,
  STARTUP: 800,
  CORPORATE: 2000,
  ELITE: 5000,
  MOGUL: 10000,
  PRESIDENT: 20000,
  OPEN: 0,
};

export interface AdvancementResult {
  newPl: PlayerStats;
  newMarket: MarketType;
  news: string[];
  shouldDie: boolean;
  deathCause: string | null;
}

export function advanceMonth(
  pl: PlayerStats,
  currentMarket: MarketType
): AdvancementResult {
  const news: string[] = [];
  const newPl = { ...pl };
  let newMarket = currentMarket;

  // Calculate rent based on tier
  const rent = rentByTier[newPl.currentTier];

  const marketMult = MARKET_CONFIGS[currentMarket].expenseMultiplier;
  const totalRent = rent * marketMult;

  // Calculate passive income dynamically from all sources
  let passiveIncome = 0;

  // 1. Dynamic Hustle Passives (SaaS, Podcast, Franchise, etc.)
  const activeHustleIds = new Set([
    ...Object.keys(newPl.hustleLevels),
    ...Object.keys(newPl.hustleBranchIds)
  ]);

  activeHustleIds.forEach(hustleId => {
    const level = newPl.hustleLevels[hustleId];
    const hustle = HUSTLES[hustleId];
    if (!hustle) return;

    let levelData;
    if (hustle.branches) {
      const branchId = newPl.hustleBranchIds[hustleId] || (hustle.startBranchId);
      levelData = branchId ? hustle.branches[branchId] : null;
    } else if (hustle.levels) {
      levelData = hustle.levels.find(l => l.level === (level || 1));
    }

    if (levelData?.passiveYield) {
      let multiplier = 1;
      // Handle repeatable hustle multipliers
      if (hustleId === 'r_labor' && newPl.hustleBranchIds[hustleId] === 'l2b') {
        multiplier = newPl.rentalCount || 1;
      }
      if (hustleId === 'r_vending') {
        multiplier = newPl.vendingCount || 0;
      }

      passiveIncome += levelData.passiveYield * multiplier;
    }
  });

  // Real Estate Empire Passive Income
  if (newPl.rentalCount > 0) {
    const typeMult = { residential: 1.0, commercial: 1.5, industrial: 2.0 }[newPl.realEstateType];
    const leverageMult = newPl.realEstateLeverage === 0 ? 1.0 : (newPl.realEstateLeverage === 50 ? 1.5 : 2.5);
    const cycle = newPl.marketCycle.realEstate;
    const cycleMult = cycle === 'boom' ? 1.5 : (cycle === 'bust' ? 0.6 : 1.0);
    const baseProfit = 1000000;
    const monthlyPassive = (baseProfit * typeMult * leverageMult * cycleMult * MARKET_CONFIGS[currentMarket].yieldMultiplier * 0.5);
    passiveIncome += Math.floor(monthlyPassive * newPl.rentalCount);
  }

  // 2. Flex Assets
  const techConglomerateCount = newPl.flexAssets['tech_conglomerate'] || 0;
  const flexBonusMultiplier = 1 + (techConglomerateCount * 0.1);

  FLEX_ASSETS.forEach(asset => {
    const count = newPl.flexAssets[asset.id] || 0;
    if (count > 0) {
      let assetPassive = asset.passiveYield * count;
      if (asset.id !== 'tech_conglomerate') {
        assetPassive *= flexBonusMultiplier;
      }
      passiveIncome += assetPassive;
    }
  });

  // 3. Vending Machine Bonus
  const vendingCount = newPl.vendingCount || 0;
  if (vendingCount >= 10) {
    passiveIncome += 500;
  }

  // Music roster passive income (Royalties)
  let totalRoyalties = 0;
  newPl.artists.forEach(artist => {
    totalRoyalties += artist.royaltyRate;
    artist.monthsActive++;
    if (artist.monthsActive % 12 === 0) {
      artist.hasReleased = true;
    }
  });
  passiveIncome += totalRoyalties;

  // Add dynamic passives
  Object.values(newPl.dynamicPassives || {}).forEach(val => {
    passiveIncome += val;
  });

  // Apply Legacy Multiplier (0.1% per point)
  const legacyMultiplier = 1 + ((newPl.legacyPoints || 0) * 0.001);
  passiveIncome = Math.floor(passiveIncome * legacyMultiplier);

  // Grammy Award System (2% annual chance per released artist)
  // Divide by 12 since this runs monthly
  newPl.artists.forEach(artist => {
    if (artist.hasReleased && Math.random() < (0.02 / 12)) {
      newPl.bag += 500000;
      newPl.clout = Math.floor(newPl.clout + 100);
      newPl.aura = Math.floor(newPl.aura + 50);
      newPl.grammyCount = (newPl.grammyCount || 0) + 1;
      artist.isGrammyWinner = true;
      news.push(`🏆 GRAMMY AWARD: ${artist.name} won a Grammy! +$500k | +100 Clout | +50 Aura`);
    }
  });

  // Apply financial changes
  newPl.bag = newPl.bag + passiveIncome - totalRent;
  newPl.month += 1;

  // Decay heat (cool down over time)
  let heatDecay = 10;
  const jetCount = newPl.flexAssets['jet'] || 0;
  if (jetCount > 0) {
    let jetBonus = (FLEX_ASSETS.find(a => a.id === 'jet')?.heatDecayBonus || 0) * jetCount;
    // Boost bonus by Tech Conglomerate
    jetBonus *= flexBonusMultiplier;
    heatDecay = heatDecay * Math.max(0, (1 - (jetBonus / 100)));
  }
  newPl.heat = Math.max(0, newPl.heat - heatDecay);

  // Rival AI Updates
  if (newPl.rivals) {
    newPl.rivals = newPl.rivals.map(rival => {
      // Net worth fluctuations (-2% to +5%)
      const fluctuation = 1 + (Math.random() * 0.07 - 0.02);
      const newNetWorth = Math.floor(rival.netWorth * fluctuation);

      // Random bidding challenge (5% chance per rival per month if player is ELITE+)
      let currentBid = 0;
      const isElitePlus = ['ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'].includes(newPl.currentTier);
      if (isElitePlus && Math.random() < 0.05) {
        // Rivals bid based on their scale
        currentBid = Math.floor(newNetWorth * (0.05 + Math.random() * 0.1));
        news.push(`⚠️ RIVAL ALERT: ${rival.name} is aggressively bidding in your sector! Current bid: $${currentBid.toLocaleString()}`);
      }

      return { ...rival, netWorth: newNetWorth, currentBid };
    });
  }

  // Decrement mental shield
  if (newPl.mentalShieldTurns > 0) {
    newPl.mentalShieldTurns--;
  }

  // Random market shift (15% chance)
  if (Math.random() < 0.15) {
    const markets: MarketType[] = ['NORMAL', 'RECESSION', 'BULL_MARKET', 'CRACKDOWN'];
    const newMarketType = markets[Math.floor(Math.random() * markets.length)];
    if (newMarketType !== currentMarket) {
      newMarket = newMarketType;
      news.unshift(`🌍 ECONOMIC SHIFT: ${MARKET_CONFIGS[newMarket].name} - ${MARKET_CONFIGS[newMarket].description}`);
    }
  }

  // Strategic Market Cycles (Real Estate & VC)
  newPl.monthsSinceCycleChange++;
  if (newPl.monthsSinceCycleChange >= 6 && (newPl.monthsSinceCycleChange >= 12 || Math.random() < 0.05)) {
    const cycleTypes: ('boom' | 'bust' | 'normal')[] = ['boom', 'bust', 'normal'];

    // Real Estate Cycle
    const oldRECycle = newPl.marketCycle.realEstate;
    newPl.marketCycle.realEstate = cycleTypes[Math.floor(Math.random() * cycleTypes.length)];
    if (newPl.marketCycle.realEstate !== oldRECycle) {
      news.push(`🏠 REAL ESTATE MARKET: Now in a ${newPl.marketCycle.realEstate.toUpperCase()} phase.`);
    }

    // VC Sector Cycles
    const sectors = ['tech', 'biotech', 'energy'];
    sectors.forEach(s => {
      const oldVCCycle = newPl.marketCycle.vc[s];
      newPl.marketCycle.vc[s] = cycleTypes[Math.floor(Math.random() * cycleTypes.length)];
      if (newPl.marketCycle.vc[s] !== oldVCCycle) {
        news.push(`💼 VC CYCLE (${s.toUpperCase()}): Shifted to ${newPl.marketCycle.vc[s].toUpperCase()}.`);
      }
    });

    newPl.monthsSinceCycleChange = 0;
  }

  // Add monthly summary to news
  const netChange = passiveIncome - totalRent;
  news.unshift(`📅 Month ${newPl.month}: Rent -$${totalRent.toLocaleString()} | Passive +$${passiveIncome.toLocaleString()} | Net: ${netChange >= 0 ? '+' : ''}$${netChange.toLocaleString()}`);

  // Check for death conditions
  let shouldDie = false;
  let deathCause: string | null = null;

  if (newPl.bag < 0) {
    shouldDie = true;
    deathCause = 'Bankruptcy: You ran out of money and the creditors came for everything.';
  } else if (newPl.mentalHealth <= 0) {
    shouldDie = true;
    deathCause = 'Burnout: Your mind and body collapsed under the pressure.';
  } else if (newPl.aura <= 0) {
    shouldDie = true;
    deathCause = 'Canceled: Your reputation is destroyed. No one will work with you.';
  } else if (newPl.clout <= 0) {
    shouldDie = true;
    deathCause = 'Irrelevant: The world has moved on without you.';
  }

  return { newPl: enforceStatCaps(newPl), newMarket, news, shouldDie, deathCause };
}
