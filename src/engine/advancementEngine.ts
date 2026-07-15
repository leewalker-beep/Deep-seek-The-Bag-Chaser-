import type { PlayerStats, MarketType, Tier } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { HUSTLES } from '../config/hustles/base';
import { enforceStatCaps } from './statEngine';
import { SENTIMENT_CATEGORIES, SENTIMENT_TEMPLATES } from '../config/sentiment';
import { BACKGROUNDS } from '../config/backgrounds';
import { SPECIALIZATIONS } from '../config/specializations';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';
import { WORLD_EVENTS } from '../config/worldEvents';
import { HUSTLE_SECTORS } from '../config/sectors';
import { getSentence } from '../config/jailSentences';
import * as FlexEngine from './flexEngine';
import type { PassiveSource, PassiveBreakdown } from '../types/game';
import * as Bio from './biographyEngine';
import { recordHistoryEvent } from './historyEngine';
import { evolveWorldNPCs } from '../utils/narrativeEngine';
import { triggerMonthlyNarrativeEvent } from './eventEngine';
import { simulateRivals } from './rivalSimEngine';
import { detectAndCreateConsequences, tickConsequences, getConsequenceMultiplier, isConsequenceActive } from './consequenceEngine';
import { generateDynamicStoryNews, generateHistoricalStories, generateMonthlySummaryItem } from './storyEngine';
import { checkAmbitionTriggersAndCompletions } from './ambitionEngine';
import { evaluateReputationTick } from './reputationEngine';
const rentByTier: Record<Tier, number> = {
  MUD: 50,
  STREET: 1000,
  STARTUP: 5000,
  CORPORATE: 20000,
  ELITE: 100000,
  MOGUL: 500000,
  PRESIDENT: 2000000,
  OPEN: 0,
};

import type { TickerMessage } from '../types/game';

const TIER_MESSAGES: Record<string, string> = {
  STREET: "🔥 STREET TIER. You're off the block.",
  STARTUP: "🚀 STARTUP TIER. Build or get buried.",
  CORPORATE: "💼 CORPORATE TIER. Play the long game.",
  ELITE: "💎 ELITE TIER. Most never make it here.",
  MOGUL: "👑 MOGUL TIER. You own this now.",
  PRESIDENT: "🇺🇸 PRESIDENT TIER. They all answer to you.",
  OPEN: "🌐 OPEN TIER. No ceiling. No rules.",
};

export interface AdvancementResult {
  newPl: PlayerStats;
  newMarket: MarketType;
  news: (string | TickerMessage)[];
  shouldDie: boolean;
  deathCause: string | null;
  fatalStat?: 'clout' | 'aura' | 'mental' | 'bag' | 'heat';
  fatalStatValue?: number;
  totalRent: number;
  passiveIncome: number;
  passiveBreakdown: PassiveBreakdown;
}

export function checkDeathConditions(pl: PlayerStats): {
  shouldDie: boolean;
  deathCause: string | null;
  fatalStat?: 'clout' | 'aura' | 'mental' | 'bag' | 'heat';
  fatalStatValue?: number;
} {
  // Only protect clout/aura death during tutorial
  // Mental health and bag death always apply
  const inTutorial = !pl.isTutorialSkipped && pl.tutorialStep < 6;

  if (pl.clout <= 0 && !inTutorial) {
    return {
      shouldDie: true,
      deathCause: 'Irrelevant: The world has moved on without you.',
      fatalStat: 'clout',
      fatalStatValue: pl.clout,
    };
  }
  if (pl.aura <= 0 && !inTutorial) {
    return {
      shouldDie: true,
      deathCause: 'Canceled: Your reputation is destroyed.',
      fatalStat: 'aura',
      fatalStatValue: pl.aura,
    };
  }
  if (pl.mentalHealth <= 0) {
    return {
      shouldDie: true,
      deathCause: 'Burnout: Your mind and body collapsed.',
      fatalStat: 'mental',
      fatalStatValue: pl.mentalHealth,
    };
  }
  if (pl.bag < 0) {
    return {
      shouldDie: true,
      deathCause: 'Bankruptcy.',
      fatalStat: 'bag',
      fatalStatValue: pl.bag,
    };
  }
  return { shouldDie: false, deathCause: null };
}

export function advanceMonth(
  pl: PlayerStats,
  currentMarket: MarketType,
  unlockedLegacyUpgrades: string[] = [],
  skipNarrativeEvent: boolean = false
): AdvancementResult {
  const news: (string | TickerMessage)[] = [];
  let newPl = { ...pl };
  newPl.isIncarcerated = newPl.inJail;
  let newMarket = currentMarket;

  // Evaluate reputation tick and update public reputation
  const repTick = evaluateReputationTick(newPl);
  newPl = repTick.newPl;
  news.push(...repTick.news.map(msg => ({ text: msg, colorClass: 'text-yellow-400 font-bold' })));

  const reputation = newPl.narrativeFlags?.publicReputation as string || "The Hustler";
  if (reputation === "The Crime Boss") {
    newPl.aura = Math.max(0, newPl.aura - 2);
  }

  // Process Consequences
  newPl = detectAndCreateConsequences(newPl, news);
  newPl = tickConsequences(newPl, news);

  // Apply active monthly stat updates from consequences
  if (isConsequenceActive(newPl, 'sabotage_retaliation')) {
    newPl.clout = Math.max(0, newPl.clout - 15);
    newPl.aura = Math.max(0, newPl.aura - 15);
    newPl.approvalRating = Math.max(0, newPl.approvalRating - 2);
  }
  if (isConsequenceActive(newPl, 'philanthropic_halo')) {
    newPl.clout = Math.min(10000, newPl.clout + 10);
    newPl.aura = Math.min(10000, newPl.aura + 20);
    newPl.approvalRating = Math.min(100, newPl.approvalRating + 1.5);
  }

  // Calculate rent based on tier
  const rent = rentByTier[newPl.currentTier];

  const marketMult = MARKET_CONFIGS[currentMarket].expenseMultiplier;
  const totalRent = rent * marketMult;

  // --- PASSIVE INCOME BREAKDOWN START ---
  const sources: PassiveSource[] = [];
  let baseTotal = 0;

  // World Event Context for Passive Income
  const activeWorldEvent = newPl.activeWorldEvent ? WORLD_EVENTS.find(e => e.id === newPl.activeWorldEvent?.eventId) : null;

  // 1. Dynamic Hustle Passives (BUSINESS)
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
      if (hustleId === 'r_labor' && newPl.hustleBranchIds[hustleId] === 'l2b') {
        multiplier = Math.min(20, newPl.rentPortfolioCount || 1);
      }
      if (hustleId === 'r_vending') {
        multiplier = newPl.vendingCount || 0;
      }

      let yieldAmount = levelData.passiveYield * multiplier;

      // Apply World Event Sector Modifier to Passive
      if (activeWorldEvent) {
        const sector = HUSTLE_SECTORS[hustleId];
        if (sector && activeWorldEvent.sectorModifiers[sector]) {
            yieldAmount = Math.floor(yieldAmount * (1 + activeWorldEvent.sectorModifiers[sector]!));
        }
      }

      // Apply consequence multipliers to business yields
      const bizMult = getConsequenceMultiplier(newPl, 'businesses', 'yieldCashMult', 1.0);
      yieldAmount = Math.floor(yieldAmount * bizMult);

      // Apply Investor Reputation Bonus (+10% passive business yield)
      if (reputation === "The Investor") {
        yieldAmount = Math.floor(yieldAmount * 1.10);
      }

      baseTotal += yieldAmount;
      sources.push({
        id: hustleId,
        name: levelData.name || hustle.name,
        category: 'BUSINESS',
        amount: yieldAmount,
        count: multiplier
      });
    }
  });

  // 2. Real Estate Empire (REAL_ESTATE)
  if (newPl.rentalCount > 0) {
    const typeMult = { residential: 1.0, commercial: 1.5, industrial: 2.0 }[newPl.realEstateType];
    const leverageMult = newPl.realEstateLeverage === 0 ? 1.0 : (newPl.realEstateLeverage === 50 ? 1.5 : 2.5);
    const cycle = newPl.marketCycle.realEstate;
    const cycleMult = cycle === 'boom' ? 1.5 : (cycle === 'bust' ? 0.6 : 1.0);
    const baseProfit = 1000000;

    const monthlyBasePerProperty = (baseProfit * typeMult * leverageMult * cycleMult * 0.5);
    let yieldAmount = Math.floor(monthlyBasePerProperty * newPl.rentalCount);

    // Apply World Event Sector Modifier (Real Estate)
    if (activeWorldEvent && activeWorldEvent.sectorModifiers['Real Estate']) {
        yieldAmount = Math.floor(yieldAmount * (1 + activeWorldEvent.sectorModifiers['Real Estate']!));
    }

    // Apply consequence multipliers to real estate yields
    const rentMult = getConsequenceMultiplier(newPl, 'real_estate', 'rentMult', 1.0);
    yieldAmount = Math.floor(yieldAmount * rentMult);

    baseTotal += yieldAmount;
    sources.push({
        id: 'real_estate_rentals',
        name: `Real Estate Empire (${newPl.realEstateType})`,
        category: 'REAL_ESTATE',
        amount: yieldAmount,
        count: newPl.rentalCount
    });
  }

  // 3. Flex Assets (FLEX)
  const techConglomerateCount = newPl.flexAssets['tech_conglomerate'] || 0;
  const flexBonusMultiplier = 1 + (techConglomerateCount * 0.1);

  FLEX_ASSETS.forEach(asset => {
    const count = newPl.flexAssets[asset.id] || 0;
    if (count > 0) {
      let assetPassive = asset.passiveYield * count;
      if (asset.id !== 'tech_conglomerate') {
        assetPassive *= flexBonusMultiplier;
      }

      // Apply World Event Sector Modifier to Flex (e.g. tech_conglomerate is Technology)
      if (activeWorldEvent) {
        const sector = HUSTLE_SECTORS[asset.id];
        if (sector && activeWorldEvent.sectorModifiers[sector]) {
            assetPassive = Math.floor(assetPassive * (1 + activeWorldEvent.sectorModifiers[sector]!));
        }
      }

      baseTotal += assetPassive;
      sources.push({
        id: asset.id,
        name: asset.name,
        category: 'FLEX',
        amount: assetPassive,
        count
      });
    }
  });

  // 4. Vending Machine Bonus (BONUS)
  const vendingCount = newPl.vendingCount || 0;
  if (vendingCount >= 10) {
    baseTotal += 500;
    sources.push({
        id: 'vending_bonus',
        name: 'Vending King Bonus',
        category: 'BONUS',
        amount: 500
    });
  }

  // 5. Music Royalties (ROYALTY)
  let totalRoyalties = 0;
  newPl.artists.forEach(artist => {
    let rate = artist.royaltyRate;
    // Apply World Event Sector Modifier (Music/Entertainment)
    if (activeWorldEvent && activeWorldEvent.sectorModifiers['Entertainment']) {
        rate = Math.floor(rate * (1 + activeWorldEvent.sectorModifiers['Entertainment']!));
    }
    totalRoyalties += rate;

    artist.monthsActive++;
    if (artist.monthsActive % 12 === 0) {
      artist.hasReleased = true;
      artist.status = 'ACTIVE';
    }
  });
  if (totalRoyalties > 0) {
    baseTotal += totalRoyalties;
    sources.push({
        id: 'music_royalties',
        name: 'Music Royalties',
        category: 'ROYALTY',
        amount: totalRoyalties,
        count: newPl.artists.length
    });
  }

  // 6. Dynamic Passives (BUSINESS/BONUS)
  Object.entries(newPl.dynamicPassives || {}).forEach(([id, val]) => {
    if (val !== 0) {
        let dynamicVal = val;
        // Apply World Event Sector Modifier
        if (activeWorldEvent) {
            const sector = HUSTLE_SECTORS[id];
            if (sector && activeWorldEvent.sectorModifiers[sector]) {
                dynamicVal = Math.floor(dynamicVal * (1 + activeWorldEvent.sectorModifiers[sector]!));
            }
        }
        baseTotal += dynamicVal;
        sources.push({
            id: `dynamic_${id}`,
            name: HUSTLES[id]?.name || id,
            category: 'BUSINESS',
            amount: val
        });
    }
  });

  // --- MULTIPLIERS ---
  const isJailed = newPl.inJail === true || newPl.isIncarcerated === true;
  const legacyMultiplier = 1 + Math.min(2.0, (newPl.legacyPoints || 0) * 0.001);
  let legacyBoost = 1.0;
  if (unlockedLegacyUpgrades.includes('passive_boost')) legacyBoost = 1.1;

  const marketYieldMult = MARKET_CONFIGS[currentMarket].yieldMultiplier;

  // FIX: Apply Specialization Bonuses to Passive Income
  let specMultiplier = 1.0;
  if (newPl.activeSpecializationId) {
    const spec = SPECIALIZATIONS.find(s => s.id === newPl.activeSpecializationId);
    if (spec?.yieldCashMult) {
        specMultiplier = spec.yieldCashMult;
    }
  }

  const finalTotal = isJailed ? 0 : Math.floor(baseTotal * legacyMultiplier * legacyBoost * marketYieldMult * specMultiplier);

  const passiveBreakdown: PassiveBreakdown = {
      sources,
      baseTotal,
      multipliers: {
          legacy: legacyMultiplier * legacyBoost,
          market: marketYieldMult,
          specialization: specMultiplier
      },
      finalTotal
  };

  // Add world event multiplier to breakdown if active
  if (newPl.activeWorldEvent) {
    const worldEvent = WORLD_EVENTS.find(e => e.id === newPl.activeWorldEvent?.eventId);
    if (worldEvent) {
      passiveBreakdown.multipliers.worldEvent = {
        name: worldEvent.name,
        multiplier: 1.0 // Display 1.0 as it's now applied per-source for accuracy
      };
    }
  }

  const chosenOneBoost = newPl.chosenBackground === 'lc_chosen' ? 1.10 : 1.0;
  const passiveIncome = Math.floor(finalTotal * chosenOneBoost);

  // Grammy Award System (2% annual chance per released artist)
  // Divide by 12 since this runs monthly
  newPl.artists.forEach(artist => {
    if (artist.hasReleased && Math.random() < (0.02 / 12)) {
      newPl.bag += 500000;
      newPl.clout = Math.floor(newPl.clout + 100);
      newPl.aura = Math.floor(newPl.aura + 50);
      newPl.grammyCount = (newPl.grammyCount || 0) + 1;
      artist.isGrammyWinner = true;
      news.push({
        text: `🏆 GRAMMY AWARD: ${artist.name} won a Grammy! +$500k | +100 Clout | +50 Aura`,
        colorClass: 'text-yellow-400 font-black'
      });
    }
  });

  // Apply financial changes
  newPl.bag = newPl.bag + passiveIncome - totalRent;

  // Record First Passive Income
  if (passiveIncome > 0 && !newPl.history?.some(h => h.id === 'first_passive_income')) {
    recordHistoryEvent(newPl, {
      id: 'first_passive_income',
      title: 'First Passive Income',
      description: `Began generating passive stream of $${passiveIncome.toLocaleString()}/mo.`,
      category: 'CAREER',
      importance: 3,
      month: newPl.month
    });
  }

  // New Record Label Artists handling (contract countdown, poaching alerts, revenue/retainer calculations)
  processEntertainmentTimelineTick(newPl, news as string[]);

  const FLEX_THRESHOLDS: Record<number, string> = {
    10000:       'watch',
    50000:       'car',
    500000:      'yacht',
    1000000:     'penthouse',
    5000000:     'jet',
    25000000:    'island',
    100000000:   'franchise',
  };

  // Monthly cooldown decrement
  if (newPl.flexOfferCooldown > 0) {
    newPl.flexOfferCooldown--;
  }

  for (const threshold of Object.keys(FLEX_THRESHOLDS)) {
    const t = Number(threshold);
    if (!(newPl.seenFlexThresholds || []).includes(t) &&
        FlexEngine.shouldOfferFlex(newPl, t, passiveIncome, totalRent)) {
      newPl.pendingFlexOffer = t;
      newPl.seenFlexThresholds = [
        ...(newPl.seenFlexThresholds || []), t
      ];
      break;
    }
  }

  newPl.month += 1;
  newPl.monthsSinceLastEvent = (newPl.monthsSinceLastEvent || 0) + 1;

  // Evolve world NPCs as part of the background progression loop
  if (newPl.npcs && newPl.npcs.length > 0) {
    const playerAgeStr = `${Math.floor(newPl.month / 12) + 18}Y ${newPl.month % 12}M`;
    newPl.npcs = evolveWorldNPCs(newPl.npcs, playerAgeStr, newPl.currentTier);
  }

  // Narrative Cooldown decrement
  if (newPl.narrativeCooldown > 0) {
    newPl.narrativeCooldown--;
  }

  // JAIL CHECK — fires after month increment
  if (pl.heat >= 100 && !newPl.inJail) {
    const sentence = getSentence(newPl.currentTier);
    newPl.inJail = true;
    newPl.isIncarcerated = true;

    let sentenceMonths = sentence.months;
    if (newPl.chosenBackgroundCategory === 'street_kid') {
      sentenceMonths = Math.max(1, Math.floor(sentenceMonths * 0.85));
    }

    newPl.jailMonthsRemaining = sentenceMonths;
    newPl.jailSentenceTotal = sentenceMonths;
    newPl.jailCharge = sentence.charge;
    newPl.arrestCount = (newPl.arrestCount || 0) + 1;
    const bioUpdate = Bio.recordScandal(newPl, 'ARREST');
    if (bioUpdate) {
      newPl.biography = [...(newPl.biography || []), bioUpdate.entry];
      newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), bioUpdate.key!];
    }
    news.push({
      text: `🚔 BUSTED. ${sentence.charge}. ${sentence.months} months.`,
      colorClass: 'text-red-500 font-black'
    });
  }

  // SERVE TIME — if already in jail (only if NOT just arrested this month)
  else if (newPl.inJail && newPl.jailMonthsRemaining > 0) {
    const sentence = getSentence(newPl.currentTier);

    // Passive losses while inside (no longer double deducting bag here because processEntertainmentTimelineTick handles drains)
    newPl.bag = Math.max(0, newPl.bag - (sentence.bagLossPerMonth * marketMult));
    newPl.clout = Math.max(0, newPl.clout - sentence.cloutLossPerMonth);

    newPl.jailMonthsRemaining--;

    if (newPl.jailMonthsRemaining <= 0) {
      newPl.inJail = false;
      newPl.isIncarcerated = false;
      news.push({
        text: `🔓 RELEASED. You served your time for ${newPl.jailCharge}.`,
        colorClass: 'text-emerald-400 font-black'
      });
    }
  }

  if (newPl.month > 0 && newPl.month % 12 === 0) {
    newPl.pendingAnnualStatement = true;
  }

  // Decay heat (cool down over time) - Skip if in jail (just arrested or already serving)
  if (newPl.inJail) {
    newPl.heat = 0; // Ensure heat is 0 while in jail
  } else {
    let heatDecay = 10;
    const jetCount = newPl.flexAssets['jet'] || 0;
    if (jetCount > 0) {
      let jetBonus = (FLEX_ASSETS.find(a => a.id === 'jet')?.heatDecayBonus || 0) * jetCount;
      // Boost bonus by Tech Conglomerate
      jetBonus *= flexBonusMultiplier;
      heatDecay = heatDecay * Math.max(0, (1 - (jetBonus / 100)));
    }
    newPl.heat = Math.max(0, newPl.heat - heatDecay);
  }

  // Rival AI Updates (Simulated via new robust emergent rivalSimEngine)
  if (newPl.rivals) {
    newPl.rivalThreats = {};
    const simResult = simulateRivals(newPl, currentMarket);

    // Apply simulated changes to rivals list
    newPl.rivals = simResult.updatedRivals;

    // Apply player updates from the rival interactions
    if (simResult.playerStatsUpdates.bag !== undefined) {
      newPl.bag = Math.max(0, simResult.playerStatsUpdates.bag);
    }
    if (simResult.playerStatsUpdates.heat !== undefined) {
      newPl.heat = Math.max(0, Math.min(100, simResult.playerStatsUpdates.heat));
    }
    if (simResult.playerStatsUpdates.aura !== undefined) {
      newPl.aura = Math.max(0, Math.min(100, simResult.playerStatsUpdates.aura));
    }
    if (simResult.playerStatsUpdates.clout !== undefined) {
      newPl.clout = Math.max(0, simResult.playerStatsUpdates.clout);
    }
    if (simResult.playerStatsUpdates.dynamicPassives !== undefined) {
      newPl.dynamicPassives = { ...newPl.dynamicPassives, ...simResult.playerStatsUpdates.dynamicPassives };
    }
    if (simResult.playerStatsUpdates.approvalRating !== undefined) {
      newPl.approvalRating = Math.max(0, Math.min(100, simResult.playerStatsUpdates.approvalRating));
    }

    // Merge news ticker events from rival simulation
    simResult.news.forEach(msg => {
      news.push({ text: msg, colorClass: msg.includes('🚨') || msg.includes('💥') || msg.includes('🔥') ? 'text-red-400 font-bold' : 'text-slate-300' });
    });

    // Re-evaluate threats and trigger milestones / challenges
    newPl.rivals.forEach(rival => {
      const ratio = rival.netWorth / Math.max(1, newPl.bag);
      let threat: 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT' = 'NEUTRAL';

      if (ratio > 2) {
        threat = 'RIVAL_DOMINANT';
        if (rival.tier === newPl.currentTier) {
          news.push({ text: `⚠️ ${rival.name} is running your tier. Costs up 25% until you take it back.`, colorClass: 'text-red-400 font-bold' });
        }
      } else if (ratio < 0.5) {
        threat = 'PLAYER_DOMINANT';
        if (rival.tier === newPl.currentTier) {
          news.push({ text: `🚀 You are crushing ${rival.name}. Your reputation is soaring. Yields up 15%.`, colorClass: 'text-emerald-400 font-bold' });

          // Market Leader Check (Permanent bonus)
          if (!newPl.marketLeaderTiers.includes(rival.tier)) {
            newPl.marketLeaderTiers.push(rival.tier);
            news.push({ text: `🏆 ${rival.tier} IS YOURS. Nobody eats here without your say-so. Yield locked at +5%.`, colorClass: 'text-yellow-400 font-black animate-bounce' });
          }

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
            news.push({ text: `⚔️ ${rival.name} WANTS SMOKE. Run 3 hustles in ${rival.tier} within 5 months or lose 10% of your bag. Don't sleep.`, colorClass: 'text-orange-400 font-black animate-pulse' });
          }
        }
      }

      newPl.rivalThreats[rival.tier] = threat;
    });
  }

  // Clear temporary counter-bid bonuses (Immutable update)
  const nextDynamicPassives = { ...newPl.dynamicPassives };
  let hasChanges = false;
  Object.keys(nextDynamicPassives).forEach(key => {
    if (key.startsWith('counter_bid_bonus_')) {
      delete nextDynamicPassives[key];
      hasChanges = true;
    }
  });
  if (hasChanges) {
    newPl.dynamicPassives = nextDynamicPassives;
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

  // World Event Lifecycle
  if (newPl.activeWorldEvent) {
    newPl.activeWorldEvent.monthsRemaining--;
    if (newPl.activeWorldEvent.monthsRemaining <= 0) {
      const event = WORLD_EVENTS.find(e => e.id === newPl.activeWorldEvent?.eventId);
      if (event) {
        news.push({ text: `🌍 WORLD EVENT ENDED: ${event.newsTemplates.end}`, colorClass: 'text-slate-400 font-bold' });
      }
      newPl.activeWorldEvent = null;
      newPl.worldEventCooldown = 4 + Math.floor(Math.random() * 5); // 4-8 months cooldown
      if (event) {
        const bioUpdate = Bio.recordWorldEventSurvival(newPl, event.name);
        if (bioUpdate) {
          newPl.biography = [...(newPl.biography || []), bioUpdate.entry];
          newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), bioUpdate.key!];
        }
      }
    }
  } else if (newPl.worldEventCooldown > 0) {
    newPl.worldEventCooldown--;
  }

  // World Event Triggering (if no event active and cooldown is 0)
  if (!newPl.activeWorldEvent && (newPl.worldEventCooldown || 0) <= 0) {
    const triggerChance = 0.08; // 8% per month
    if (Math.random() < triggerChance) {
      // Common events are 4x more likely than Rare
      const isRare = Math.random() < 0.2;
      const pool = WORLD_EVENTS.filter(e => isRare ? e.rarity === 'RARE' : e.rarity === 'COMMON');
      const event = pool[Math.floor(Math.random() * pool.length)] || WORLD_EVENTS[0];

      const duration = Math.floor(Math.random() * (event.duration[1] - event.duration[0] + 1)) + event.duration[0];

      newPl.activeWorldEvent = {
        eventId: event.id,
        monthsRemaining: duration
      };

      news.push({ text: `🌍 ${event.newsTemplates.start} (${duration} months)`, colorClass: 'text-yellow-400 font-black animate-pulse' });
    }
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

  // Narrative Event Triggering Logic
  if (!newPl.activeNarrative) {
    const validEvents = NARRATIVE_EVENTS.filter(event => {
      // 1. Quick Filters (Static/State-based)
      if (event.trigger.tier && !event.trigger.tier.includes(newPl.currentTier)) return false;
      if (event.trigger.minMonth && newPl.month < event.trigger.minMonth) return false;
      if (event.trigger.once && newPl.completedNarrativeEvents?.includes(event.id)) return false;

      // 0. Pacing/Category Filters
      const explicitCategory = event.pacingCategory;
      const inferredCategory = explicitCategory || (event.characterId ? 'CHARACTER' : 'MAJOR');

      // MAJOR events are gated by narrativeCooldown
      if (inferredCategory === 'MAJOR' && newPl.narrativeCooldown > 0) return false;

      // New Cooldown Rules:
      // 1. Same character cannot immediately reappear
      if (event.characterId && event.characterId === newPl.lastCharacterId) return false;
      // 2. Same story arc cannot repeat too quickly (12-month cooldown)
      const lastFired = newPl.arcLastFired?.[event.arcId || ''];
      if (event.arcId && lastFired !== undefined && (newPl.month - lastFired) < 12) return false;

      // 2. Remaining Filters
      if (event.trigger.background && !event.trigger.background.includes(newPl.chosenBackground!)) return false;
      if (event.trigger.category && !event.trigger.category.includes(newPl.chosenBackgroundCategory!)) return false;
      if (event.trigger.specialization && !event.trigger.specialization.includes(newPl.activeSpecializationId!)) return false;

      // 2. Narrative Flag Requirements
      if (event.trigger.flagReqs) {
        if (!newPl.narrativeFlags) return false;
        for (const [key, value] of Object.entries(event.trigger.flagReqs)) {
          if (newPl.narrativeFlags[key] !== value) return false;
        }
      }

      // 3. Stat Requirements
      if (event.requirement?.stat) {
        const req = event.requirement.stat;
        const statKey = req.type === 'mentalHealth' ? 'mentalHealth' : req.type;
        const currentVal = newPl[statKey as keyof PlayerStats];
        if (typeof currentVal === 'number' && currentVal < req.value) return false;
      }

      return true;
    });

    // Pick one event based on probability + Pacing
    // Target: ~1 event per 4 months.
    const pacingMult = Math.min(2.0, (newPl.monthsSinceLastEvent || 0) / 10);

    for (const event of validEvents) {
      const finalProb = event.trigger.probability * pacingMult;

      if (Math.random() < finalProb) {
        newPl.activeNarrative = event.id;
        newPl.monthsSinceLastEvent = 0;
        if (event.characterId) newPl.lastCharacterId = event.characterId;
        if (event.arcId) {
            newPl.lastArcId = event.arcId;
            newPl.arcLastFired = { ...newPl.arcLastFired, [event.arcId]: newPl.month };
        }

        // Set cooldown for MAJOR events
        const explicitCategory = event.pacingCategory;
        const inferredCategory = explicitCategory || (event.characterId ? 'CHARACTER' : 'MAJOR');
        if (inferredCategory === 'MAJOR') {
          newPl.narrativeCooldown = 4;
        }

        news.push({ text: `⚡ NEW EVENT: ${event.title}`, colorClass: 'text-yellow-400 font-black animate-pulse' });
        break; // Only one event at a time
      }
    }
  }

  // Trigger Patch 34 historical callback narrative events/news alerts
  if (!skipNarrativeEvent) {
    const monthlyEvent = triggerMonthlyNarrativeEvent(newPl);
    if (monthlyEvent) {
      const isSpecialEvent = !monthlyEvent.id.startsWith('evt_generic_market_');
      const isTestEnv = typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'test';
      const shouldTriggerGeneric = !isTestEnv && Math.random() < 0.05; // 5% chance in real gameplay

      if (isSpecialEvent || shouldTriggerGeneric) {
        news.push({
          text: `${monthlyEvent.title}: ${monthlyEvent.description}`,
          colorClass: monthlyEvent.title.includes('SABOTAGE') ? 'text-red-400 font-bold' :
                      monthlyEvent.title.includes('LOCKED') ? 'text-yellow-400 font-bold' :
                      'text-emerald-400'
        });
        const mockState = {
          updateBag: (amount: number) => { newPl.bag = Math.max(0, newPl.bag + amount); },
          updateHeat: (amount: number) => { newPl.heat = Math.max(0, Math.min(100, newPl.heat + amount)); },
          updateClout: (amount: number) => { newPl.clout = Math.max(0, newPl.clout + amount); },
          updateAura: (amount: number) => { newPl.aura = Math.max(0, newPl.aura + amount); }
        };
        monthlyEvent.effect(mockState);
      }
    }
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

  // Inject Tier Advancement news if tier just changed
  if (pl.currentTier !== newPl.currentTier && TIER_MESSAGES[newPl.currentTier]) {
    news.push({ text: TIER_MESSAGES[newPl.currentTier], colorClass: 'text-yellow-400 font-black animate-pulse' });
  }

  // Presidency Term End Detection
  if (newPl.currentTier === 'PRESIDENT' && newPl.presidentMonth >= 48 && !newPl.termComplete) {
    const approvalRating = newPl.approvalRating || 50;
    const scandals = newPl.scandalCount || 0;

    let verdict = '';
    let verdictEmoji = '';
    let legacyBonus = 0;

    if (approvalRating >= 70 && scandals === 0) {
      verdict = 'GREATEST OF ALL TIME';
      verdictEmoji = '🏆';
      legacyBonus = 500000;
    } else if (approvalRating >= 55) {
      verdict = 'RESPECTED LEADER';
      verdictEmoji = '🤝';
      legacyBonus = 200000;
    } else if (approvalRating >= 40) {
      verdict = 'COMPLICATED LEGACY';
      verdictEmoji = '📜';
      legacyBonus = 50000;
    } else if (scandals > 2) {
      verdict = 'DISGRACED';
      verdictEmoji = '💀';
      legacyBonus = 0;
    } else {
      verdict = 'FORGOTTEN';
      verdictEmoji = '👻';
      legacyBonus = 10000;
    }

    newPl.termComplete = true;
    newPl.pendingTermEnd = true;
    newPl.termVerdict = verdict;
    newPl.termVerdictEmoji = verdictEmoji;
    newPl.legacyScore = (newPl.legacyScore || 0) + legacyBonus;
  }

  // Check for death conditions
  let shouldDie = false;
  let deathCause: string | null = null;
  let fatalStat: any = undefined;
  let fatalStatValue: number | undefined = undefined;

  const deathResult = checkDeathConditions(newPl);
  shouldDie = deathResult.shouldDie;
  deathCause = deathResult.deathCause;
  fatalStat = deathResult.fatalStat;
  fatalStatValue = deathResult.fatalStatValue;

  if (shouldDie) {
    newPl.deathContext = {
      mentalHealthAtDeath: Math.floor(newPl.mentalHealth),
      lastHustleMentalHit: 0,
      lastHustleName: 'Monthly Expenses',
      heatAtDeath: Math.floor(newPl.heat),
      monthsPlayed: newPl.month,
      tier: newPl.currentTier,
      fatalStat,
      fatalStatValue,
    };
  }

  // 1. Generate monthly summary item and push to worldFeed
  const summaryItem = generateMonthlySummaryItem(newPl, passiveIncome, totalRent, newMarket);
  newPl.worldFeed = [summaryItem, ...(newPl.worldFeed || [])].slice(0, 100);

  // 2. Add ticker alert that Monthly Summary has been compiled
  news.push({
    text: `📊 Month ${newPl.month} Simulation Report compiled! Open your Phone Feed to review.`,
    colorClass: 'text-indigo-400 font-bold'
  });

  // 3. Occasionally generate dynamic state observations (~25% chance)
  if (Math.random() < 0.25) {
    const dynamicStories = generateDynamicStoryNews(newPl);
    if (dynamicStories.length > 0) {
      const picked = dynamicStories[Math.floor(Math.random() * dynamicStories.length)];
      news.push(picked);
    }
  }

  // 4. Occasionally generate historical references (~15% chance)
  if (Math.random() < 0.15) {
    const historicalStories = generateHistoricalStories(newPl);
    if (historicalStories.length > 0) {
      const picked = historicalStories[Math.floor(Math.random() * historicalStories.length)];
      news.push(picked);
    }
  }

  // Evaluate and update Ambitions system
  const ambitionRes = checkAmbitionTriggersAndCompletions(newPl);
  newPl = ambitionRes.updatedPl;
  news.push(...ambitionRes.news);

  // Convert all news to TickerMessage objects and stamp current tier
  const stampedNews = news.map(m => {
    if (typeof m === 'string') {
      return { text: m, tier: newPl.currentTier };
    }
    return { ...m, tier: m.tier || newPl.currentTier };
  });

  return {
    newPl: enforceStatCaps(newPl),
    newMarket,
    news: stampedNews,
    shouldDie,
    deathCause,
    fatalStat,
    fatalStatValue,
    totalRent,
    passiveIncome,
    passiveBreakdown
  };
}

export const processEntertainmentTimelineTick = (draftPl: any, newsFeed: string[]) => {
  const isJailed = draftPl.inJail === true || draftPl.isIncarcerated === true;
  let positiveYields = 0;
  let negativeDrains = 0;

  if (!draftPl.artists) draftPl.artists = [];
  if (!draftPl.scoutedTalentPool) draftPl.scoutedTalentPool = [];
  if (!draftPl.rolodex) draftPl.rolodex = [];

  draftPl.artists = draftPl.artists.map((artist: any) => {
    negativeDrains += artist.monthlyRetainer; // Retainers must be honored to prevent legal abandonment

    if (!isJailed) {
      positiveYields += artist.monthlyRevenue; // Passive collection only occurs if free
    } else {
      // PREDATORY PRISON EXPLOITATION EVENTS:
      // Rivals strip market share and undercut client exposure while you cannot file counter-injunctions
      if (Math.random() < 0.15) {
        artist.monthlyRevenue = Math.max(0, artist.monthlyRevenue - 75);
        newsFeed.unshift(`🚨 PRISON EXPLOIT: Competitors undercut ${artist.name}'s streaming visibility while you are locked away.`);
      }
    }

    // Decrement 10-year countdown metrics clock
    const updatedClock = Math.max(0, artist.contractMonthsLeft - 1);
    if (updatedClock === 0) {
      newsFeed.unshift(`🚨 ROSTER CRISIS: ${artist.name}'s 10-year contract has expired! Re-sign them on your dashboard.`);
    }

    // Evaluate random poaching ambushes from competitor labels
    if (updatedClock < 24 && !artist.isTargetedByRival && Math.random() < 0.08) {
      artist.isTargetedByRival = true;
      newsFeed.unshift(`🦹 INDUSTRIAL THREAT: Chen MegaRecords is offering a backdoor buyout deal to ${artist.name}!`);
    }

    return { ...artist, contractMonthsLeft: updatedClock };
  });

  // Real-estate maintenance costs stay active regardless of incarceration status
  negativeDrains += draftPl.currentRentObligations || 0;

  if (isJailed) {
    // Lock out incoming revenue streams entirely, processing only operational drains
    draftPl.bag = Math.max(0, draftPl.bag - negativeDrains);

    // Eroding public influence and presence metrics behind bars
    draftPl.clout = Math.max(0, draftPl.clout - 4);
    draftPl.aura = Math.max(0, draftPl.aura - 8);

    // Random legal fine discoveries processing tick
    if (Math.random() < 0.12) {
      const legalFine = 500 + Math.floor(Math.random() * 1500);
      draftPl.bag = Math.max(0, draftPl.bag - legalFine);
      newsFeed.unshift(`⚖️ COURT FORFEITURE: State prosecutors freeze asset capital for courtroom discovery processing. Lost $${legalFine}.`);
    }
  } else {
    // Normal career logic processing for free players
    draftPl.bag = Math.max(0, draftPl.bag + positiveYields - negativeDrains);
  }
};
