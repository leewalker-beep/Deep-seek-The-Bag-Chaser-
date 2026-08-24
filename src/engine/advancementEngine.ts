import type { PlayerStats, MarketType, Tier, RecordLabelArtist, Founder, RegionalExecutive, RolodexCelebrity } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import { compileAnnualReview } from '../utils/annualReviewCompiler';
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
import { processWorldReaction } from './reactiveWorldEngine';
import { checkAmbitionTriggersAndCompletions } from './ambitionEngine';
import { evaluateReputationTick, applyReputationLossScale } from './reputationEngine';
import { checkAndTriggerComebacks } from './comebackEngine';
import { getLegacyBonus } from './mathEngine';
import { calculateMonthlyUpkeep, calculateMonthlyDebtService } from '../utils/financialObligationsUtils';
import { compileIdentityProfile } from '../utils/identitySystem';
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
  // Protect clout/aura death during tutorial and fresh early-game window
  // (e.g. initial 2 in-game months or first 3 completed hustles)
  const inTutorial = !pl.isTutorialSkipped && pl.tutorialStep < 6;
  const isFreshPlayer = (pl.month <= 2) || ((pl.totalHustlesCompleted || 0) < 3);
  const isProtectedFromReputationDeath = inTutorial || isFreshPlayer;

  if (pl.clout <= 0 && !isProtectedFromReputationDeath) {
    return {
      shouldDie: true,
      deathCause: 'Irrelevant: The world has moved on without you.',
      fatalStat: 'clout',
      fatalStatValue: pl.clout,
    };
  }
  if (pl.aura <= 0 && !isProtectedFromReputationDeath) {
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
  newPl.scoutedTalentPool = [];
  let newMarket = currentMarket;
  const prevScandals = pl.scandalCount || 0;

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

  // Apply active monthly stat updates from consequences (scaled by reputation)
  if (isConsequenceActive(newPl, 'sabotage_retaliation')) {
    const sabotageLosses = applyReputationLossScale(15, 15, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - sabotageLosses.clout);
    newPl.aura = Math.max(0, newPl.aura - sabotageLosses.aura);
    newPl.approvalRating = Math.max(0, newPl.approvalRating - 2);
  }
  if (isConsequenceActive(newPl, 'philanthropic_halo')) {
    newPl.clout = Math.min(10000, newPl.clout + 10);
    newPl.aura = Math.min(10000, newPl.aura + 20);
    newPl.approvalRating = Math.min(100, newPl.approvalRating + 1.5);
  }

  // --- DYNAMIC REPUTATION CONSEQUENCES ENGINE ---

  // 1. Inactivity decay ("Being Forgotten")
  newPl.monthsSinceLastHustle = (newPl.monthsSinceLastHustle || 0) + 1;
  if (newPl.monthsSinceLastHustle >= 12) {
    let baseLoss = Math.max(5, Math.floor(newPl.clout * 0.01));
    const isSpotlightActive = newPl.clout >= 1000;
    if (isSpotlightActive) {
      baseLoss *= 2; // Double decay under intense spotlight pressure
    }
    const forgottenLoss = applyReputationLossScale(baseLoss, 0, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - forgottenLoss.clout);
    news.push({
      text: `📰 BEING FORGOTTEN: Long period without active ventures decays your clout (-${forgottenLoss.clout} Clout).${isSpotlightActive ? ' Public pressure to maintain the spotlight is intense!' : ''}`,
      colorClass: 'text-yellow-500 font-medium'
    });
  }

  // 2. Active Negative Consequences Passive Clout Decay
  const hasNegativeCons = isConsequenceActive(newPl, 'regulatory_crackdown') ||
                          isConsequenceActive(newPl, 'housing_affordability_crisis') ||
                          isConsequenceActive(newPl, 'sabotage_retaliation');
  if (hasNegativeCons) {
    const consDecay = applyReputationLossScale(Math.floor(newPl.clout * 0.02), 0, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - consDecay.clout);
    news.push({
      text: `📉 NEGATIVE COOLDOWN: Active social/regulatory crises erode your public stance (-${consDecay.clout} Clout).`,
      colorClass: 'text-orange-400 font-medium'
    });
  }

  // 3. High Heat passive erosion / Philanthropic Shield
  const justDonatedCharity = newPl.narrativeFlags?.just_donated_charity === true;
  if (justDonatedCharity) {
    newPl.narrativeFlags = { ...newPl.narrativeFlags, just_donated_charity: false };
  }

  if (newPl.heat >= 70) {
    let decayClout = 3;
    let decayAura = 3;
    if (justDonatedCharity) {
      decayClout = Math.floor(decayClout * 0.5);
      decayAura = Math.floor(decayAura * 0.5);
      news.push({
        text: `🕊️ PHILANTHROPIC SHIELD: Charity donations halved high heat reputation decay this month.`,
        colorClass: 'text-emerald-300 font-medium'
      });
    }
    const heatErosion = applyReputationLossScale(decayClout, decayAura, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - heatErosion.clout);
    newPl.aura = Math.max(0, newPl.aura - heatErosion.aura);
    news.push({
      text: `⚠️ PUBLIC TRUST EROSION: High Heat continues to slowly erode your reputation (-${heatErosion.clout} Clout, -${heatErosion.aura} Aura).`,
      colorClass: 'text-red-300 font-medium'
    });
  }

  // 4. Critical Mental Health / Burnout
  if (newPl.mentalHealth <= 30) {
    const burnoutErosion = applyReputationLossScale(0, 5, reputation, newPl);
    newPl.aura = Math.max(0, newPl.aura - burnoutErosion.aura);
    news.push({
      text: `🔥 BURNOUT PASSIVE: Critically low mental health erodes your aura (-${burnoutErosion.aura} Aura).`,
      colorClass: 'text-red-300 font-medium'
    });
  }

  // 5. Good Behavior Recovery
  if (newPl.heat === 0) {
    newPl.monthsAtZeroHeat = (newPl.monthsAtZeroHeat || 0) + 1;
    if (newPl.monthsAtZeroHeat === 6) {
      newPl.clout += 50;
      newPl.aura += 50;
      news.push({
        text: `🕊️ COMMUNITY TRUST: Maintaining a clean public profile for 6 months has restored public trust (+50 Clout, +50 Aura)!`,
        colorClass: 'text-emerald-400 font-bold'
      });
    }
  } else {
    newPl.monthsAtZeroHeat = 0;
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

  // 6.5 Backed Founders (BUSINESS)
  let totalFounderReturns = 0;
  if (newPl.foundersBacked && newPl.foundersBacked.length > 0) {
    newPl.foundersBacked.forEach(founder => {
      const execution = founder.stats.execution || 50;
      const vision = founder.stats.vision || 50;
      const burnDiscipline = founder.stats.burnDiscipline || 50;
      const returns = (execution * 100) + (vision * 150) + (burnDiscipline * 50);
      totalFounderReturns += returns;
    });
  }
  if (totalFounderReturns > 0) {
    baseTotal += totalFounderReturns;
    sources.push({
      id: 'founders_backed',
      name: 'Portfolio Returns',
      category: 'BUSINESS',
      amount: totalFounderReturns,
      count: newPl.foundersBacked.length
    });
  }

  // --- MULTIPLIERS ---
  const isJailed = newPl.inJail === true || newPl.isIncarcerated === true;
  const legacyMultiplier = 1 + getLegacyBonus(newPl.legacyPoints || 0);
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

  const isHonestEntrepreneur = (newPl.totalHustlesCompleted || 0) >= 30 && (newPl.arrestCount || 0) === 0 && (newPl.scandalCount || 0) === 0;
  const honestBoost = isHonestEntrepreneur ? 1.05 : 1.0;
  const chosenOneBoost = newPl.chosenBackground === 'lc_chosen' ? 1.10 : 1.0;
  const passiveIncome = Math.floor(finalTotal * chosenOneBoost * honestBoost);

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
  const upkeep = calculateMonthlyUpkeep(newPl);
  const debtService = calculateMonthlyDebtService(newPl);
  const totalDeductions = totalRent + upkeep + debtService;

  newPl.bag = newPl.bag + passiveIncome - totalDeductions;

  // Accumulate monthly passive income and deductions for annual statement
  if (!newPl.narrativeFlags) newPl.narrativeFlags = {};
  newPl.narrativeFlags.annualPassiveEarned = Number(newPl.narrativeFlags.annualPassiveEarned || 0) + passiveIncome;
  newPl.narrativeFlags.annualPassiveSpent = Number(newPl.narrativeFlags.annualPassiveSpent || 0) + totalDeductions;

  // Track / apply liquidity crunch and debt service progression
  const originalDebts = newPl.financialDebts || [];
  const updatedDebts = [];
  for (const debt of originalDebts) {
    const nextTerm = debt.remainingTerm - 1;
    if (nextTerm > 0) {
      updatedDebts.push({
        ...debt,
        remainingTerm: nextTerm
      });
    } else {
      news.push({
        text: `🎉 DEBT RETIRED: Your ${debt.loanType} Loan of $${debt.principal.toLocaleString()} has been fully paid off!`,
        colorClass: 'text-emerald-400 font-bold'
      });
    }
  }
  newPl.financialDebts = updatedDebts;

  // Warnings & Overdraft effects
  if (newPl.bag <= 0) {
    newPl.bag = 0;
    newPl.heat = Math.min(100, newPl.heat + 5);
    newPl.mentalHealth = Math.max(0, newPl.mentalHealth - 5);
    if (!newPl.narrativeFlags) newPl.narrativeFlags = {};
    newPl.narrativeFlags.had_bankruptcy_crisis = true;
    news.push({
      text: `🚨 LIQUIDITY CRUNCH: You are completely broke ($0) after paying monthly obligations! Creditor pressure builds (+5 Heat) and financial stress mounts (-5 Mental Health).`,
      colorClass: 'text-red-500 font-bold animate-pulse'
    });
  } else if (newPl.bag < totalDeductions) {
    news.push({
      text: `⚠️ LOW CASH FLOW WARNING: Your cash balance ($${newPl.bag.toLocaleString()}) is below next month's anticipated obligations ($${totalDeductions.toLocaleString()}). Adjust your strategy immediately!`,
      colorClass: 'text-yellow-400 font-medium'
    });
  }

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
    newPl = processWorldReaction(newPl, 'FIRST_PASSIVE_INCOME', {}).updatedPl;
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
  if (!pl.inJail && !pl.isIncarcerated) {
    newPl.monthsSinceLastEvent = (newPl.monthsSinceLastEvent || 0) + 1;
  }

  // LIFE TRAJECTORY & IDENTITY REFLECTION SYSTEM
  // Every 36 months (3 years)
  if (newPl.month > 0 && newPl.month % 36 === 0) {
    const identityProfile = compileIdentityProfile(newPl);
    const reflectionText = identityProfile.reflection;

    // 1. Record History Event
    recordHistoryEvent(newPl, {
      id: `reflection_${newPl.month}`,
      title: 'Identity Reflection',
      description: reflectionText,
      category: 'LEGACY',
      importance: 3,
      month: newPl.month
    });

    // 2. Add to biography
    const bioEntry = `[Identity Reflection] ${reflectionText}`;
    if (!newPl.biography.includes(bioEntry)) {
      newPl.biography.push(bioEntry);
    }

    // 3. Push to World Feed
    const feedItem = {
      id: `reflection_feed_${newPl.month}_${Math.random().toString(36).substring(7)}`,
      category: 'NEWS' as const,
      text: `💡 IDENTITY REFLECTION: "${reflectionText}"`,
      source: 'Self-Reflection',
      timestamp: Date.now(),
      month: newPl.month,
      pinned: true
    };
    newPl.worldFeed = [feedItem, ...(newPl.worldFeed || [])].slice(0, 100);

    // 4. Queue Advisor popup
    if (!newPl.advisorQueue) {
      newPl.advisorQueue = [];
    }
    newPl.advisorQueue.push({
      id: `advisor_reflection_${newPl.month}`,
      title: `💡 LIFETIME REFLECTION`,
      subtitle: `"${reflectionText}"`,
      bullets: [
        identityProfile.evolutionTrajectory,
        `Active Persona Archetype: ${identityProfile.dominantArchetype}`,
        identityProfile.advisorObservation
      ],
      ctaLabel: 'Continue'
    });

    // 5. Push ticker message
    news.push({
      text: `💡 LIFETIME REFLECTION: "${reflectionText}"`,
      colorClass: 'text-indigo-400 font-bold'
    });
  }

  // Evolve world NPCs as part of the background progression loop
  if (newPl.npcs && newPl.npcs.length > 0) {
    const playerAgeStr = `${Math.floor(newPl.month / 12) + 18}Y ${newPl.month % 12}M`;
    newPl.npcs = evolveWorldNPCs(newPl.npcs, playerAgeStr, newPl.currentTier);
  }

  // Narrative Cooldown decrement
  if (newPl.narrativeCooldown > 0 && !pl.inJail && !pl.isIncarcerated) {
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

    // Onset arrest consequences: 15% current Clout and 20% current Aura penalty upon arrest (scaled by reputation)
    const arrestLosses = applyReputationLossScale(Math.floor(newPl.clout * 0.15), Math.floor(newPl.aura * 0.20), reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - arrestLosses.clout);
    newPl.aura = Math.max(0, newPl.aura - arrestLosses.aura);

    news.push({
      text: `🚔 BUSTED. ${sentence.charge}. ${sentence.months} months.`,
      colorClass: 'text-red-500 font-black'
    });
    news.push({
      text: `🚔 ARREST CONSEQUENCE: Public profile shattered. Lost -${arrestLosses.clout} Clout and -${arrestLosses.aura} Aura.`,
      colorClass: 'text-red-500 font-bold'
    });
  }

  // SERVE TIME — if already in jail (only if NOT just arrested this month)
  else if (newPl.inJail && newPl.jailMonthsRemaining > 0) {
    const sentence = getSentence(newPl.currentTier);

    // Passive losses while inside (no longer double deducting bag here because processEntertainmentTimelineTick handles drains)
    newPl.bag = Math.max(0, newPl.bag - (sentence.bagLossPerMonth * marketMult));

    // Scale jail monthly passive Clout loss by reputation
    const jailPassives = applyReputationLossScale(sentence.cloutLossPerMonth, 0, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - jailPassives.clout);

    newPl.jailMonthsRemaining--;

    if (newPl.jailMonthsRemaining <= 0) {
      newPl.inJail = false;
      newPl.isIncarcerated = false;
      if (!newPl.narrativeFlags) newPl.narrativeFlags = {};
      newPl.narrativeFlags.released_from_prison_month = newPl.month;
      newPl.narrativeFlags.prison_release_cash = newPl.bag;
      news.push({
        text: `🔓 RELEASED. You served your time for ${newPl.jailCharge}.`,
        colorClass: 'text-emerald-400 font-black'
      });
      newPl = processWorldReaction(newPl, 'PRISON_RELEASE', {}).updatedPl;
    }
  }

  if (newPl.month > 0 && newPl.month % 12 === 0) {
    const reviewData = compileAnnualReview(newPl);
    if (!newPl.narrativeFlags) newPl.narrativeFlags = {};
    newPl.narrativeFlags.lastAnnualReviewData = JSON.stringify(reviewData);

    const bioUpdate = Bio.recordAnnualReviewBiography(newPl, reviewData);
    if (bioUpdate) {
      newPl.biography = [...(newPl.biography || []), bioUpdate.entry];
      newPl.recordedBioKeys = [...(newPl.recordedBioKeys || []), bioUpdate.key!];
    }

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

  // Conglomerate Divisional CEO Monthly Scandals / Leaks
  if (newPl.conglomerateCEOs) {
    const ceos = newPl.conglomerateCEOs;
    const divisions = [
      { id: 'na_tech', name: 'NA Technology' },
      { id: 'eu_mfg', name: 'EU Manufacturing' },
      { id: 'apac_retail', name: 'APAC Retail' },
      { id: 'latam_log', name: 'LATAM Logistics' }
    ];

    divisions.forEach(div => {
      const ceo = ceos[div.id];
      if (ceo) {
        const scandalChance = (ceo.riskTolerance / 100) * 0.10; // Capped at 10% chance per month passively
        const leakChance = ceo.loyalty < 40 ? ((40 - ceo.loyalty) / 100) * 0.15 : 0;

        if (Math.random() < scandalChance) {
          const fine = 2500000;
          newPl.bag = Math.max(0, newPl.bag - fine);
          newPl.heat = Math.min(100, newPl.heat + 10);
          newPl.scandalCount = (newPl.scandalCount || 0) + 1;
          news.push({
            text: `⚠️ CONGLOMERATE SCANDAL: ${ceo.name} (${div.name}) caused a compliance breach! Fined $${fine.toLocaleString()} and gained +10 Heat.`,
            colorClass: 'text-red-400 font-bold'
          });
        } else if (leakChance > 0 && Math.random() < leakChance) {
          const siphoned = 750000;
          newPl.bag = Math.max(0, newPl.bag - siphoned);
          news.push({
            text: `💸 CONGLOMERATE LEAK: Undisclosed accounts linked to ${ceo.name} (${div.name}) siphoned $${siphoned.toLocaleString()}!`,
            colorClass: 'text-orange-400 font-bold'
          });
        }
      }
    });
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
      if (rival.status === 'ally') {
        return;
      }
      const ratio = rival.netWorth / Math.max(1, newPl.bag);
      let threat: 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT' = 'NEUTRAL';

      if (ratio > 2) {
        threat = 'RIVAL_DOMINANT';
        if (rival.tier === newPl.currentTier) {
          const domLoss = applyReputationLossScale(0, 3, reputation, newPl);
          newPl.aura = Math.max(0, newPl.aura - domLoss.aura);
        }
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
        const chalLoss = applyReputationLossScale(Math.floor(newPl.clout * 0.15), 0, reputation, newPl);
        newPl.clout = Math.max(0, newPl.clout - chalLoss.clout);
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
    const isJailed = newPl.inJail === true || newPl.isIncarcerated === true;
    const validEvents = NARRATIVE_EVENTS.filter(event => {
      // Incarceration gating: jail-only events trigger ONLY when jailed; non-jail events trigger ONLY when free
      if (isJailed) {
        if (!event.trigger.jailOnly) return false;
      } else {
        if (event.trigger.jailOnly) return false;
      }

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
      const isTestEnv = typeof globalThis !== 'undefined' && (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';
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

  // --- COMMUNITY TRUST AND MEMORY (WORLD MEMORY SYSTEM) ---
  const charityChoices = newPl.narrativeFlags?.charity_choices_count as number || 0;
  const philanthropyLvl = newPl.hustleLevels?.['philanthropy_empire'] || 0;
  let communityTrust = charityChoices * 15 + philanthropyLvl * 25;
  const completedAmbitions = newPl.ambitions?.filter(a => a.status === 'COMPLETED') || [];
  if (completedAmbitions.some(a => a.id === 'leave_better_society')) {
    communityTrust += 30;
  }
  communityTrust = Math.min(100, communityTrust);

  // If community trust is high, occasionally trigger helpful community interventions (~8% chance)
  if (communityTrust >= 30 && Math.random() < 0.08) {
    const trustRoll = Math.random();
    if (trustRoll < 0.25) {
      newPl.heat = Math.max(0, newPl.heat - 15);
      news.push({
        text: `🌟 COMMUNITY SHIELD: Local leaders remember your past generosity and rally to support you, cooling your legal Heat (-15 Heat)!`,
        colorClass: 'text-emerald-400 font-bold'
      });
    } else if (trustRoll < 0.5) {
      newPl.aura = Math.min(10000, newPl.aura + 50);
      newPl.clout = Math.min(10000, newPl.clout + 100);
      news.push({
        text: `🤝 COMMUNITY ENDORSEMENT: District organizers publicly praise your long-term dedication to the neighborhood (+50 Aura, +100 Clout)!`,
        colorClass: 'text-emerald-400 font-bold'
      });
    } else if (trustRoll < 0.75 && newPl.currentTier === 'PRESIDENT') {
      newPl.approvalRating = Math.min(100, newPl.approvalRating + 5);
      newPl.congressSupport = Math.min(100, newPl.congressSupport + 4);
      news.push({
        text: `🗳️ GRASSROOTS MOBILIZATION: Local neighborhoods launch a voting campaign, citing your decade of charity (+5% Presidential Approval, +4% Congress Support)!`,
        colorClass: 'text-emerald-400 font-bold'
      });
    } else {
      const gift = Math.max(5000, Math.floor(newPl.bag * 0.02));
      newPl.bag += gift;
      news.push({
        text: `🎁 CRISIS ASSISTANCE: A community member you supported years ago offers logistics backing, saving you $${gift.toLocaleString()} in overhead!`,
        colorClass: 'text-emerald-400 font-bold'
      });
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

    if (approvalRating < 45) {
      const termLoss = applyReputationLossScale(Math.floor(newPl.clout * 0.25), 0, reputation, newPl);
      newPl.clout = Math.max(0, newPl.clout - termLoss.clout);
      news.push({
        text: `🗳️ TERM COMPLETE: Low public approval rating has severely damaged your political Clout (-${termLoss.clout} Clout).`,
        colorClass: 'text-red-500 font-black'
      });
    }

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

  // Centralized Public Scandal Monitor & Penalty
  const currentScandals = newPl.scandalCount || 0;
  if (currentScandals > prevScandals) {
    const scandalLoss = applyReputationLossScale(Math.floor(newPl.clout * 0.10), 0, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - scandalLoss.clout);
    news.push({
      text: `🚨 PUBLIC SCANDAL: Media backlash has damaged your public Clout (-${scandalLoss.clout} Clout).`,
      colorClass: 'text-red-400 font-bold'
    });
  }

  // Bankruptcy Clout Penalty Check
  if (pl.bag < 0 || newPl.bag < 0) {
    const bankLoss = applyReputationLossScale(Math.floor(newPl.clout * 0.20), 0, reputation, newPl);
    newPl.clout = Math.max(0, newPl.clout - bankLoss.clout);
  }

  // Check for death conditions
  let shouldDie = false;
  let deathCause: string | null = null;
  let fatalStat: 'clout' | 'aura' | 'mental' | 'bag' | 'heat' | undefined = undefined;
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

  // --- ANNIVERSARIES CHECK SYSTEM & HONEST ENTREPRENEUR NOTIFICATIONS ---
  const historyList = newPl.history || [];
  const pName = newPl.name || 'the Chaser';

  // 1. First business (5 years = 60 months)
  const firstBiz = historyList.find(h => h.id.startsWith('business_') || h.id === 'first_hustle');
  if (firstBiz) {
    const elapsed = newPl.month - firstBiz.month;
    if (elapsed === 60) {
      const anniversaryId = `anniversary_first_business_5y`;
      if (!historyList.some(h => h.id === anniversaryId)) {
        const firstBizName = firstBiz.title.replace('Mastered ', '').replace('First Business', 'Vending Machine');
        recordHistoryEvent(newPl, {
          id: anniversaryId,
          title: `5-Year Business Anniversary`,
          description: `Reflected on 5 years of commercial growth since launching their first ${firstBizName}. From humble beginnings to absolute power.`,
          category: 'WORLD',
          importance: 3,
          month: newPl.month
        });
        news.push({
          text: `🎉 ANNIVERSARY: 5 years since launching your first ${firstBizName}! Reflections of a legendary climb.`,
          colorClass: 'text-yellow-400 font-bold'
        });
      }
    }
  }

  // 2. First million (10 years = 120 months)
  const firstMillion = historyList.find(h => h.id === 'first_million' || h.title.includes('Million') || h.id.includes('million'));
  if (firstMillion) {
    const elapsed = newPl.month - firstMillion.month;
    if (elapsed === 120) {
      const anniversaryId = `anniversary_first_million_10y`;
      if (!historyList.some(h => h.id === anniversaryId)) {
        recordHistoryEvent(newPl, {
          id: anniversaryId,
          title: `10-Year Millionaire Anniversary`,
          description: `Reflected on a decade of elite status since hitting their first liquid million. A milestone that redefined their legacy.`,
          category: 'WORLD',
          importance: 3,
          month: newPl.month
        });
        news.push({
          text: `🎉 ANNIVERSARY: 10 years since hitting your first liquid million! A decade of compounding power.`,
          colorClass: 'text-yellow-400 font-bold'
        });
      }
    }
  }

  // 3. Becoming President (20 years = 240 months)
  const firstPres = historyList.find(h => h.id === 'tier_PRESIDENT');
  if (firstPres) {
    const elapsed = newPl.month - firstPres.month;
    if (elapsed === 240) {
      const anniversaryId = `anniversary_became_president_20y`;
      if (!historyList.some(h => h.id === anniversaryId)) {
        recordHistoryEvent(newPl, {
          id: anniversaryId,
          title: `20-Year Presidential Anniversary`,
          description: `Celebrated 20 years since President ${pName} was first elected to lead the nation. History remembers a transformative command.`,
          category: 'WORLD',
          importance: 4,
          month: newPl.month
        });
        news.push({
          text: `🎉 ANNIVERSARY: 20 years since becoming President! Two decades of legislative and sovereign authority.`,
          colorClass: 'text-yellow-400 font-bold'
        });
      }
    }
  }

  // 4. First passive income (25 years = 300 months)
  const firstPass = historyList.find(h => h.id === 'first_passive_income');
  if (firstPass) {
    const elapsed = newPl.month - firstPass.month;
    if (elapsed === 300) {
      const anniversaryId = `anniversary_first_passive_25y`;
      if (!historyList.some(h => h.id === anniversaryId)) {
        recordHistoryEvent(newPl, {
          id: anniversaryId,
          title: `25-Year Passive Income Anniversary`,
          description: `Reflected on a quarter-century of continuous passive cash flow. The strategic architecture of financial freedom.`,
          category: 'WORLD',
          importance: 3,
          month: newPl.month
        });
        news.push({
          text: `🎉 ANNIVERSARY: 25 years since your first passive stream! A quarter-century of stable financial independence.`,
          colorClass: 'text-yellow-400 font-bold'
        });
      }
    }
  }

  // B. Honest Entrepreneur passive yield notification (once a year)
  if (isHonestEntrepreneur && newPl.month % 12 === 0) {
    news.push({
      text: `💼 INVESTOR CONFIDENCE: Consistently clean compliance records have granted a +5% passive yield bonus this year!`,
      colorClass: 'text-emerald-400 font-bold'
    });
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

  // 4. Occasionally generate historical references (up to 30% chance in high tiers)
  const isHighTierClass = newPl.currentTier !== 'MUD' && newPl.currentTier !== 'STREET';
  const histChance = isHighTierClass ? 0.30 : 0.20;
  if (Math.random() < histChance) {
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

  // Evaluate periodic comebacks
  const comebackRes = checkAndTriggerComebacks(newPl);
  newPl = comebackRes.updatedPl;
  news.push(...comebackRes.news.map(msg => ({ text: msg, colorClass: 'text-yellow-400 font-bold' })));

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

export const processEntertainmentTimelineTick = (draftPl: PlayerStats, newsFeed: string[]) => {
  const isJailed = draftPl.inJail === true || draftPl.isIncarcerated === true;
  let positiveYields = 0;
  let negativeDrains = 0;

  if (!draftPl.artists) draftPl.artists = [];
  if (!draftPl.scoutedTalentPool) draftPl.scoutedTalentPool = [];
  if (!draftPl.rolodex) draftPl.rolodex = [];

  const auraProtectionFactor = draftPl.aura >= 100 ? 0.5 : 1.0;

  draftPl.artists = draftPl.artists.map((artist: RecordLabelArtist) => {
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
    if (updatedClock < 24 && !artist.isTargetedByRival && Math.random() < 0.08 * auraProtectionFactor) {
      artist.isTargetedByRival = true;
      newsFeed.unshift(`🦹 INDUSTRIAL THREAT: Chen MegaRecords is offering a backdoor buyout deal to ${artist.name}!`);
    }

    return { ...artist, contractMonthsLeft: updatedClock };
  });

  // 1. Founders Backed (Venture Capital Portfolio) Proactive Events
  if (!draftPl.foundersBacked) draftPl.foundersBacked = [];
  const keptFounders: Founder[] = [];
  draftPl.foundersBacked.forEach((founder: Founder) => {
    let currentFounder = { ...founder };
    let collapsed = false;

    // 5% chance of pivot/crisis (burn rate spike)
    if (Math.random() < 0.05 * auraProtectionFactor) {
      const updatedStats = {
        ...currentFounder.stats,
        burnDiscipline: Math.max(10, (currentFounder.stats?.burnDiscipline || 50) - 10)
      };
      currentFounder.stats = updatedStats;
      newsFeed.unshift(`🚨 PORTFOLIO CRISIS: ${currentFounder.companyName} managed by ${currentFounder.name} hit a critical burn rate spike! Burn discipline degraded.`);
    } else if (Math.random() < 0.05 * auraProtectionFactor) {
      // 5% chance of a competitor poaching threat
      newsFeed.unshift(`🦹 POACHING THREAT: Rival venture funds are attempting to poach ${currentFounder.name} from ${currentFounder.companyName}!`);
    }

    // Collapse check: If burnDiscipline has hit the absolute rock-bottom (10), there is a 20% chance of sudden collapse.
    // Also, there is a tiny baseline chance (1%) of random company collapse for any startup.
    if ((currentFounder.stats?.burnDiscipline <= 10 && Math.random() < 0.20 * auraProtectionFactor) || (Math.random() < 0.01 * auraProtectionFactor)) {
      collapsed = true;
    }

    if (collapsed) {
      // Log biography
      const bioUpdate = Bio.recordFounderCollapse(draftPl, currentFounder.name, currentFounder.companyName);
      if (bioUpdate) {
        if (!draftPl.biography) draftPl.biography = [];
        if (!draftPl.recordedBioKeys) draftPl.recordedBioKeys = [];
        draftPl.biography.push(bioUpdate.entry);
        draftPl.recordedBioKeys.push(bioUpdate.key!);
      }

      // Apply reputation penalty if high-performing
      let loyaltyPenaltyIncrement = 0;
      const isHighPerforming = (currentFounder.stats?.burnDiscipline !== undefined && currentFounder.stats.burnDiscipline >= 70) ||
        (currentFounder.stats?.execution !== undefined && currentFounder.stats.execution >= 70) ||
        (currentFounder.stats?.vision !== undefined && currentFounder.stats.vision >= 70);

      if (isHighPerforming) {
        loyaltyPenaltyIncrement = 15;
      }

      if (!draftPl.narrativeFlags) draftPl.narrativeFlags = {};
      draftPl.narrativeFlags.reputationLoyaltyPenalty = (Number(draftPl.narrativeFlags.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement;

      newsFeed.unshift(`🚨 COLLAPSE: ${currentFounder.companyName} went bankrupt under ${currentFounder.name}!`);
    } else {
      keptFounders.push(currentFounder);
    }
  });
  draftPl.foundersBacked = keptFounders;

  // 2. Regional Executives (Global Conglomerate Division CEOs) Proactive Events
  if (!draftPl.conglomerateCEOs) draftPl.conglomerateCEOs = {};
  if (!draftPl.conglomerateCandidates) draftPl.conglomerateCandidates = [];

  const updatedCEOs: Record<string, RegionalExecutive> = {};
  Object.entries(draftPl.conglomerateCEOs).forEach(([divisionId, exec]: [string, RegionalExecutive]) => {
    let updatedExec = { ...exec };
    // 5% chance of headhunting threat
    if (Math.random() < 0.05 * auraProtectionFactor) {
      updatedExec.loyalty = Math.max(10, (updatedExec.loyalty || 50) - 15);
      newsFeed.unshift(`🦹 HEADHUNTING THREAT: A competitor is trying to poach division CEO ${exec.name}! Loyalty decreased.`);
    }
    // riskTolerance scaled scandal check (up to 10% chance)
    else if (Math.random() < (exec.riskTolerance / 100) * 0.10 * auraProtectionFactor) {
      draftPl.heat = Math.min(100, (draftPl.heat || 0) + 15);
      newsFeed.unshift(`🚨 EXECUTIVE SCANDAL: Division CEO ${exec.name}'s risky decisions triggered a public backlash! +15 Heat.`);
    }
    updatedCEOs[divisionId] = updatedExec;
  });
  draftPl.conglomerateCEOs = updatedCEOs;

  // Candidate pool headhunting threats (5% chance per candidate)
  draftPl.conglomerateCandidates = draftPl.conglomerateCandidates.map((exec: RegionalExecutive) => {
    if (Math.random() < 0.05 * auraProtectionFactor) {
      newsFeed.unshift(`🦹 HEADHUNTING THREAT: Competitors are whispering in candidate ${exec.name}'s ear!`);
    }
    return exec;
  });

  // 3. Rolodex Celebrities Proactive Events
  if (!draftPl.rolodex) draftPl.rolodex = [];
  const keptRolodex: RolodexCelebrity[] = [];
  draftPl.rolodex.forEach((celebrity: RolodexCelebrity) => {
    let currentCelebrity = { ...celebrity };
    let lapsed = false;

    // 8% chance of tabloid event (positive or negative)
    if (Math.random() < 0.08 * auraProtectionFactor) {
      const isPositive = Math.random() < 0.5;
      if (isPositive) {
        const relationshipScore = Math.min(100, (currentCelebrity.relationshipScore || 50) + 10);
        currentCelebrity.relationshipScore = relationshipScore;
        newsFeed.unshift(`📸 TABLOID BUZZ: A glowing press article praised your close friendship with ${currentCelebrity.name}! Relationship increased.`);
      } else {
        const relationshipScore = Math.max(10, (currentCelebrity.relationshipScore || 50) - 10);
        currentCelebrity.relationshipScore = relationshipScore;
        newsFeed.unshift(`📸 TABLOID SCANDAL: Rumors of a dramatic fallout with ${currentCelebrity.name} hit the front pages! Relationship decreased.`);
      }
    }

    // Relationship ending / lapse check: if score drops below 20, it lapses and goes cold.
    // Also, 1% baseline monthly chance for any celebrity relationship to go cold/lapse.
    if ((currentCelebrity.relationshipScore < 20) || (Math.random() < 0.01 * auraProtectionFactor)) {
      lapsed = true;
    }

    if (lapsed) {
      // Log biography
      const bioUpdate = Bio.recordRolodexLapse(draftPl, currentCelebrity.name);
      if (bioUpdate) {
        if (!draftPl.biography) draftPl.biography = [];
        if (!draftPl.recordedBioKeys) draftPl.recordedBioKeys = [];
        draftPl.biography.push(bioUpdate.entry);
        draftPl.recordedBioKeys.push(bioUpdate.key!);
      }

      // Apply reputation penalty if high-performing
      let loyaltyPenaltyIncrement = 0;
      const isHighPerforming = (currentCelebrity.relationshipScore !== undefined && currentCelebrity.relationshipScore >= 75);
      if (isHighPerforming) {
        loyaltyPenaltyIncrement = 15;
      }

      if (!draftPl.narrativeFlags) draftPl.narrativeFlags = {};
      draftPl.narrativeFlags.reputationLoyaltyPenalty = (Number(draftPl.narrativeFlags.reputationLoyaltyPenalty || 0)) + loyaltyPenaltyIncrement;

      newsFeed.unshift(`❄️ COLD: Your relationship with ${currentCelebrity.name} has ended.`);
    } else {
      keptRolodex.push(currentCelebrity);
    }
  });
  draftPl.rolodex = keptRolodex;

  // Real-estate maintenance costs stay active regardless of incarceration status
  negativeDrains += draftPl.currentRentObligations || 0;

  if (isJailed) {
    // Lock out incoming revenue streams entirely, processing only operational drains
    draftPl.bag = Math.max(0, draftPl.bag - negativeDrains);

    // Eroding public influence and presence metrics behind bars (scaled by reputation)
    const reputation = draftPl.narrativeFlags?.publicReputation as string || "The Hustler";
    const prisonErosion = applyReputationLossScale(4, 8, reputation, draftPl);
    draftPl.clout = Math.max(0, draftPl.clout - prisonErosion.clout);
    draftPl.aura = Math.max(0, draftPl.aura - prisonErosion.aura);

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
