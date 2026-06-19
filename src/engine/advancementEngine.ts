import type { PlayerStats, MarketType, Tier } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { HUSTLES } from '../config/hustles/base';
import { enforceStatCaps } from './statEngine';
import { SENTIMENT_CATEGORIES, SENTIMENT_TEMPLATES } from '../config/sentiment';
import { BACKGROUNDS } from '../config/backgrounds';

const rentByTier: Record<Tier, number> = {
  MUD: 200,
  STREET: 1000,
  STARTUP: 5000,
  CORPORATE: 20000,
  ELITE: 100000,
  MOGUL: 500000,
  PRESIDENT: 2000000,
  OPEN: 0,
};

import type { TickerMessage } from '../types/game';

export interface AdvancementResult {
  newPl: PlayerStats;
  newMarket: MarketType;
  news: (string | TickerMessage)[];
  shouldDie: boolean;
  deathCause: string | null;
  totalRent: number;
  passiveIncome: number;
}

export function checkDeathConditions(pl: PlayerStats): { shouldDie: boolean; deathCause: string | null } {
  if (pl.bag < 0) {
    return {
      shouldDie: true,
      deathCause: 'Bankruptcy: You ran out of money and the creditors came for everything.'
    };
  } else if (pl.mentalHealth <= 0) {
    return {
      shouldDie: true,
      deathCause: 'Burnout: Your mind and body collapsed under the pressure.'
    };
  } else if (pl.aura <= 0) {
    return {
      shouldDie: true,
      deathCause: 'Canceled: Your reputation is destroyed. No one will work with you.'
    };
  } else if (pl.clout <= 0) {
    return {
      shouldDie: true,
      deathCause: 'Irrelevant: The world has moved on without you.'
    };
  }
  return { shouldDie: false, deathCause: null };
}

export function advanceMonth(
  pl: PlayerStats,
  currentMarket: MarketType
): AdvancementResult {
  const news: (string | TickerMessage)[] = [];
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
        multiplier = newPl.rentPortfolioCount || 1;
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

  // Apply Market and Legacy Multipliers (0.1% per legacy point)
  const legacyMultiplier = 1 + ((newPl.legacyPoints || 0) * 0.001);
  const yieldMult = MARKET_CONFIGS[currentMarket].yieldMultiplier;
  passiveIncome = Math.floor(passiveIncome * legacyMultiplier * yieldMult);

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
    newPl.rivalThreats = {};
    newPl.rivals = newPl.rivals.map(rival => {
      // Net worth fluctuations (-2% to +5%)
      const fluctuation = 1 + (Math.random() * 0.07 - 0.02);
      const newNetWorth = Math.floor(rival.netWorth * fluctuation);

      // Update threat level
      const ratio = newNetWorth / Math.max(1, newPl.bag);
      let threat: 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT' = 'NEUTRAL';

      if (ratio > 2) {
        threat = 'RIVAL_DOMINANT';
        if (rival.tier === newPl.currentTier) {
          news.push({ text: `⚠️ ${rival.name} is dominating the market. Costs are up 25% in ${rival.tier} tier.`, colorClass: 'text-red-400 font-bold' });
        }
      } else if (ratio < 0.5) {
        threat = 'PLAYER_DOMINANT';
        if (rival.tier === newPl.currentTier) {
          news.push({ text: `🚀 You are crushing ${rival.name}. Your reputation is soaring. Yields up 15%.`, colorClass: 'text-emerald-400 font-bold' });

          // Trigger Challenge (20% chance if not already challenged by this rival)
          const isChallenged = newPl.activeChallenges.some(c => c.rivalId === rival.id);
          if (!isChallenged && Math.random() < 0.20) {
            newPl.activeChallenges.push({
              rivalId: rival.id,
              rivalName: rival.name,
              tier: rival.tier as Tier,
              hustlesCompleted: 0,
              hustlesRequired: 3,
              monthsRemaining: 5
            });
            news.push({ text: `⚔️ CHALLENGE: ${rival.name} has challenged you! Complete 3 hustles in ${rival.tier} tier within 5 months or lose 10% of your bag!`, colorClass: 'text-orange-400 font-black animate-pulse' });
          }
        }
      }

      newPl.rivalThreats[rival.tier] = threat;

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

  // Update Challenges
  if (newPl.activeChallenges.length > 0) {
    newPl.activeChallenges = newPl.activeChallenges.map(challenge => {
      return { ...challenge, monthsRemaining: challenge.monthsRemaining - 1 };
    }).filter(challenge => {
      if (challenge.monthsRemaining < 0) {
        // Challenge Failed
        const penalty = Math.floor(newPl.bag * 0.1);
        newPl.bag -= penalty;
        news.push({ text: `❌ CHALLENGE FAILED: ${challenge.rivalName} won the challenge. You lost $${penalty.toLocaleString()} (10% of bag).`, colorClass: 'text-red-500 font-bold' });

        // Rival wins, they gain 10% net worth
        newPl.rivals = newPl.rivals.map(r =>
          r.id === challenge.rivalId ? { ...r, netWorth: Math.floor(r.netWorth * 1.1) } : r
        );
        return false;
      }
      return true;
    });
  }

  // Decrement mental shield
  if (newPl.mentalShieldTurns > 0) {
    newPl.mentalShieldTurns--;
  }

  // Sentiment Engine Lifecycle
  if (newPl.activeSentiment) {
    newPl.activeSentiment.monthsRemaining--;
    if (newPl.activeSentiment.monthsRemaining <= 0) {
      news.push({ text: `📰 Sentiment Normalized: The ${newPl.activeSentiment.label} period has ended.`, colorClass: 'text-slate-400' });
      newPl.activeSentiment = null;
    }
  }

  // 25% chance to trigger sentiment if none active
  if (!newPl.activeSentiment && Math.random() < 0.25) {
    const category = SENTIMENT_CATEGORIES[Math.floor(Math.random() * SENTIMENT_CATEGORIES.length)];
    const isHype = Math.random() < 0.5;
    const multiplier = isHype ? 1.5 : 0.5;
    const duration = 3 + Math.floor(Math.random() * 4); // 3-6 months
    const templates = isHype ? SENTIMENT_TEMPLATES.hype : SENTIMENT_TEMPLATES.fud;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const label = isHype ? 'Hype' : 'FUD';
    const message = template
      .replace(/{category}/g, category.name)
      .replace(/{duration}/g, duration.toString());

    newPl.activeSentiment = {
      category: category.id,
      label: category.name + ' ' + label,
      multiplier,
      monthsRemaining: duration
    };

    news.push({ text: `📰 ${message}`, colorClass: isHype ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold' });
  }

  // Random market shift (15% chance) - Skipped if President has Market Control
  if (!newPl.presidentialMarketControl && Math.random() < 0.15) {
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

  // Occasional Background News Reference (~5% chance per month)
  if (newPl.chosenBackground && Math.random() < 0.05) {
    const bg = BACKGROUNDS.find(b => b.id === newPl.chosenBackground);
    if (bg && bg.newsReferences.length > 0) {
      const ref = bg.newsReferences[Math.floor(Math.random() * bg.newsReferences.length)];
      news.push({ text: `📰 ${ref}`, colorClass: 'text-emerald-400 font-bold' });
    }
  }

  // Add monthly summary to news
  const netChange = passiveIncome - totalRent;
  news.unshift(`📅 Month ${newPl.month}: Rent -$${totalRent.toLocaleString()} | Passive +$${passiveIncome.toLocaleString()} | Net: ${netChange >= 0 ? '+' : ''}$${netChange.toLocaleString()}`);

  // Check for death conditions
  const { shouldDie, deathCause } = checkDeathConditions(newPl);

  return {
    newPl: enforceStatCaps(newPl),
    newMarket,
    news,
    shouldDie,
    deathCause,
    totalRent,
    passiveIncome
  };
}
