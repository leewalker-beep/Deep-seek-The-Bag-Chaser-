import type { PlayerStats } from '../types/game';
import type { HustleLevel } from '../config/hustles/base';
import { HUSTLE_BADGES } from '../config/badges';
import { HUSTLES } from '../config/hustles/base';
import { SENTIMENT_CATEGORIES } from '../config/sentiment';
import { HUSTLE_SECTORS } from '../config/sectors';
import { WORLD_EVENTS } from '../config/worldEvents';
import { getMasteryCount } from '../utils/masteryUtils';
import { FLEX_ASSETS } from '../config/flexAssets';
import { SPECIALIZATIONS } from '../config/specializations';
import { getConsequenceMultiplier } from './consequenceEngine';
import { applyReputationGainScale } from './reputationEngine';

interface SynergyContext {
  backgroundId: string;
  sectorName: string;
  baseYield: number;
}

export const applyHQSynergies = (context: SynergyContext): number => {
  let operationalMultiplier = 1.0;

  if (context.backgroundId === 'hq_silicon_valley' && context.sectorName === 'Technology') {
    operationalMultiplier += 0.25;
  } else if (context.backgroundId === 'hq_wall_street' && context.sectorName === 'Finance') {
    operationalMultiplier += 0.30;
  } else if (context.backgroundId === 'hq_pentagon' && context.sectorName === 'Security') {
    operationalMultiplier += 0.40;
  }

  return Math.floor(context.baseYield * operationalMultiplier);
};

export function getLegacyBonus(legacyPoints: number): number {
  return Math.min(2.0, (legacyPoints || 0) * 0.001);
}

export interface MathResult {
  cost: number;
  yieldCash: number;
  yieldClout: number;
  yieldAura: number;
  mentalHit: number;
  heatHit: number;
  shieldTurns: number;
  passiveAdded?: number;
  legacyGain?: number;
  isBigWin?: boolean;
  bigWinMessage?: string;
  approvalBonus?: number;
  minigameMult?: number; // Optional minigame multiplier for linear calculations
}

export const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2.0,
  3: 3.5,
  4: 5.0,
};

export function calculateHustleMath(
  hustleId: string,
  levelData: HustleLevel,
  currentLevel: number,
  marketExpenseMult: number,
  marketYieldMult: number,
  marketHeatMult: number,
  minigameMult: number,
  isSuccess: boolean,
  mentalShieldTurns: number = 0,
  rivalThreat: 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT' = 'NEUTRAL'
): MathResult {
  const levelMult = LEVEL_MULTIPLIERS[currentLevel] || 1;

  let costMult = marketExpenseMult;
  let yieldMult = marketYieldMult * minigameMult;

  if (rivalThreat === 'RIVAL_DOMINANT') {
    costMult *= 1.25;
  } else if (rivalThreat === 'PLAYER_DOMINANT') {
    yieldMult *= 1.15;
  }

  const hustle = HUSTLES[hustleId];
  let rawCost = levelData.cost;
  let rawYieldCash = levelData.yieldCash;
  let rawYieldClout = levelData.yieldClout;
  let rawYieldAura = levelData.yieldAura;
  let rawMentalHit = levelData.mentalHit;

  if (hustle && (hustle.basePayout !== undefined || hustle.baseClout !== undefined || hustle.mentalHealthCost !== undefined)) {
    const mult = levelData.multiplier !== undefined ? levelData.multiplier : 1;
    if (hustle.basePayout !== undefined) {
      rawYieldCash = Math.floor(hustle.basePayout * mult);
    }
    if (hustle.baseClout !== undefined) {
      rawYieldClout = Math.floor(hustle.baseClout * mult);
    }
    if (hustle.mentalHealthCost !== undefined) {
      rawMentalHit = -hustle.mentalHealthCost;
    }
  }

  const cost = rawCost * levelMult * costMult;
  let yieldCash = Math.floor(rawYieldCash * levelMult * yieldMult);
  let yieldClout = Math.floor(rawYieldClout * levelMult * marketYieldMult);
  let yieldAura = Math.floor(rawYieldAura * levelMult * marketYieldMult);
  // Cap minigame impact on mental health to prevent extreme hits or weird gains from negative multipliers
  const mentalMinigameMult = Math.max(0.5, Math.min(2.0, Math.abs(minigameMult)));
  let mentalHit = rawMentalHit * levelMult * (rawMentalHit < 0 ? mentalMinigameMult : 1);
  let heatHit = (levelData.heatHit !== undefined ? levelData.heatHit : 5) * marketHeatMult;

  let isBigWin = false;
  let bigWinMessage = '';

  // Big Win Logic
  if (isSuccess) {
    if (hustleId === 'drop' && Math.random() < 0.05) {
      isBigWin = true;
      yieldCash *= 5;
      bigWinMessage = 'VIRAL PRODUCT! 5x sales boost!';
    } else if (hustleId === 'meme' && Math.random() < 0.10) {
      isBigWin = true;
      yieldCash *= 5;
      bigWinMessage = 'TO THE MOON! Meme coin pumps 5x!';
    } else if (hustleId === 'festival' && Math.random() < 0.08) {
      const profit = yieldCash - cost;
      if (profit > 0) {
        isBigWin = true;
        yieldCash = cost + (profit * 3);
        bigWinMessage = 'SELLOUT! Festival attendance doubles profit!';
      }
    }
  }

  // Mental Shield Logic
  if (mentalShieldTurns > 0 && mentalHit < 0) {
    mentalHit = 0;
  }

  if (!isSuccess) {
    yieldCash = Math.floor(yieldCash * 0.3);
    yieldClout = Math.floor(yieldClout * 0.3);
    yieldAura = Math.floor(yieldAura * 0.3);
    // If mentalHit is positive (gain), reduce it on failure. If negative (penalty), double it.
    mentalHit = mentalHit > 0 ? Math.floor(mentalHit * 0.3) : mentalHit * 2;
    // If heatHit was negative (reduction), on failure it should probably be a penalty instead of double reduction
    heatHit = heatHit < 0 ? 5 : heatHit * 2;
  }

  yieldClout = Math.floor(Math.max(0, Math.min(1000, yieldClout)));
  yieldAura = Math.floor(Math.max(0, Math.min(1000, yieldAura)));
  mentalHit = Math.max(-100, Math.min(100, mentalHit));

  // Music Production floor ($5k)
  if (isSuccess && (hustleId === 'audio' || levelData.id?.includes('audio'))) {
    yieldCash = Math.max(yieldCash, 5000);
  }

  return {
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    mentalHit,
    heatHit,
    shieldTurns: levelData.shieldTurns || 0,
    passiveAdded: levelData.passiveYield,
    isBigWin,
    bigWinMessage,
    minigameMult
  };
}

export const calculateFlexBonuses = (pl: PlayerStats) => {
  const techConglomerateCount = pl.flexAssets['tech_conglomerate'] || 0;
  const flexBonusMultiplier = 1 + (techConglomerateCount * 0.1);

  let cashBonus = 0;
  let cloutBonus = 0;
  let auraBonus = 0;
  let mentalBonus = 0;

  FLEX_ASSETS.forEach(asset => {
    const count = pl.flexAssets[asset.id] || 0;
    if (count > 0) {
      const bonusScale = count * flexBonusMultiplier;
      if (asset.allGainsBonus) {
        cashBonus += asset.allGainsBonus * bonusScale;
        cloutBonus += asset.allGainsBonus * bonusScale;
        auraBonus += asset.allGainsBonus * bonusScale;
      }
      if (asset.cloutBonus) cloutBonus += asset.cloutBonus * bonusScale;
      if (asset.auraBonus) auraBonus += asset.auraBonus * bonusScale;
      if (asset.mentalRecoveryBonus) mentalBonus += asset.mentalRecoveryBonus * bonusScale;
    }
  });

  return { cashBonus, cloutBonus, auraBonus, mentalBonus };
};

export const applyFlexBonuses = (result: MathResult, bonuses: ReturnType<typeof calculateFlexBonuses>) => {
  const { cashBonus, cloutBonus, auraBonus, mentalBonus } = bonuses;

  result.yieldCash = Math.floor(result.yieldCash * Math.min(2.0, (1 + cashBonus / 100)));
  result.yieldClout = Math.floor(result.yieldClout * Math.min(2.0, (1 + cloutBonus / 100)));
  result.yieldAura = Math.floor(result.yieldAura * Math.min(2.0, (1 + auraBonus / 100)));

  if (result.mentalHit < 0) {
    // Reduce mental drain
    result.mentalHit = Math.ceil(result.mentalHit * (1 - mentalBonus / 100));
  } else if (result.mentalHit > 0) {
    // Increase mental recovery
    result.mentalHit = Math.floor(result.mentalHit * (1 + mentalBonus / 100));
  }
};

export function calculateHustleStatsAdditive(
  hustleId: string,
  _levelData: HustleLevel,
  player: PlayerStats,
  _currentLevel: number,
  result: MathResult
): MathResult {
  const effectiveResult = { ...result };

  // --- Dynamic Environmental Modifiers ---
  let sentimentMult = 1.0;
  if (player.activeSentiment) {
    const category = SENTIMENT_CATEGORIES.find(c => c.id === player.activeSentiment?.category);
    if (category && category.hustleIds.includes(hustleId)) {
      sentimentMult = player.activeSentiment.multiplier;
    }
  }

  let worldEventMult = 1.0;
  if (player.activeWorldEvent) {
    const worldEvent = WORLD_EVENTS.find(e => e.id === player.activeWorldEvent?.eventId);
    const sector = HUSTLE_SECTORS[hustleId];
    if (worldEvent && sector && worldEvent.sectorModifiers[sector]) {
      worldEventMult = (1 + worldEvent.sectorModifiers[sector]!);
    }
  }

  const dynamicBonus = (sentimentMult - 1) + (worldEventMult - 1);
  const combinedDynamicBonus = Math.max(-0.7, Math.min(1.5, dynamicBonus));

  // --- permanent yield/clout/aura/mental/heat buffs ---
  let badgeYieldBonus = 0;
  let badgeCloutBonus = 0;
  let badgeAuraBonus = 0;
  let finalMentalMult = 1.0;
  let finalHeatMult = 1.0;

  player.masteredHustles?.forEach(mId => {
    const badge = HUSTLE_BADGES[mId];
    if (!badge) return;
    if (badge.buff.type === 'yield') badgeYieldBonus += (badge.buff.value - 1);
    if (badge.buff.type === 'clout') badgeCloutBonus += (badge.buff.value - 1);
    if (badge.buff.type === 'aura') badgeAuraBonus += (badge.buff.value - 1);
    if (badge.buff.type === 'mental') finalMentalMult *= badge.buff.value;
    if (badge.buff.type === 'heat') finalHeatMult *= badge.buff.value;
  });

  // --- Tier Badge Buffs ---
  let tierBadgeBonus = 0;
  const hustleTier = HUSTLES[hustleId]?.tier;
  if (hustleTier && player.tierBadges?.includes(hustleTier)) {
    tierBadgeBonus = 0.02;
  }

  // --- Tier Mechanics ---
  const activeRivalBid = player.rivals?.find(r => r.tier === player.currentTier && r.currentBid > 0);
  if (activeRivalBid) {
    effectiveResult.cost = Math.floor(effectiveResult.cost * 1.5);
  }

  let counterBidBonus = 0;
  const hasCounterBidBonus = player.dynamicPassives?.[`counter_bid_bonus_${player.currentTier}`];
  if (hasCounterBidBonus) {
    counterBidBonus = 0.2;
  }

  let marketLeaderBonus = 0;
  if (player.marketLeaderTiers?.includes(player.currentTier)) {
    marketLeaderBonus = 0.05;
  }

  let mogulBonus = 0;
  let streetStreakBonus = 0;
  let eliteCloutBonus = 0;
  let presidentAuraBonus = 0;

  let presidentEconomyBonus = 0;

  if (player.currentTier === 'MUD') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 1.5);
  } else if (player.currentTier === 'STREET') {
    streetStreakBonus = Math.min(1.0, (player.streak || 0) * 0.1);
  } else if (player.currentTier === 'ELITE') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.9);
    eliteCloutBonus = 0.2;
  } else if (player.currentTier === 'MOGUL') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.7);
    mogulBonus = -0.1;
    effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * 1.5);
  } else if (player.currentTier === 'PRESIDENT') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.7);
    presidentAuraBonus = (player.aura || 0) / 5000;

    const masteryCount = getMasteryCount(player);
    const masteryApprovalBonus = Math.min(15, masteryCount * 1.5);
    effectiveResult.approvalBonus = (effectiveResult.approvalBonus || 0) + masteryApprovalBonus;

    // Living Economy: GDP and Inflation directly scale business yields under presidency
    if (player.gdp > 110) {
      presidentEconomyBonus += 0.20;
    } else if (player.gdp < 80) {
      presidentEconomyBonus -= 0.20;
    }
    if (player.inflation > 5) {
      presidentEconomyBonus -= 0.10;
    }
  }

  // --- Legacy Multiplier ---
  const legacyBonus = getLegacyBonus(player.legacyPoints || 0);

  // --- Specialization Bonuses ---
  let specBonus = 0;
  let specCloutBonus = 0;
  let specAuraBonus = 0;
  if (player.activeSpecializationId) {
    const spec = SPECIALIZATIONS.find(s => s.id === player.activeSpecializationId);
    if (spec) {
      if (spec.yieldCashMult) specBonus = spec.yieldCashMult - 1;
      if (spec.yieldCloutMult) specCloutBonus = spec.yieldCloutMult - 1;
      if (spec.yieldAuraMult) specAuraBonus = spec.yieldAuraMult - 1;
      if (spec.heatMult) effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * spec.heatMult);
      if (spec.mentalHitMult) {
        if (effectiveResult.mentalHit < 0) {
          effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * spec.mentalHitMult);
        } else {
          effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * (2 - spec.mentalHitMult));
        }
      }
    }
  }

  // --- Flex Bonuses ---
  const flexBonuses = calculateFlexBonuses(player);
  const flexBonus = Math.min(1.0, flexBonuses.cashBonus / 100);
  const flexCloutBonus = Math.min(1.0, flexBonuses.cloutBonus / 100);
  const flexAuraBonus = Math.min(1.0, flexBonuses.auraBonus / 100);

  if (effectiveResult.mentalHit < 0) {
    effectiveResult.mentalHit = Math.ceil(effectiveResult.mentalHit * (1 - flexBonuses.mentalBonus / 100));
  } else if (effectiveResult.mentalHit > 0) {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * (1 + flexBonuses.mentalBonus / 100));
  }

  // --- Apply base badge/legacy multipliers to mental/heat ---
  effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * finalMentalMult);
  effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * finalHeatMult);

  // --- Enduring Background Modifiers ---
  let bgYieldBonus = 0;
  if (player.chosenBackgroundCategory === 'dropout') {
    const isDropoutSector = ['venture_capital', 'techFlip', 'media_empire', 'film_studio', 'saas_mvp', 'drop'].includes(hustleId);
    if (isDropoutSector) {
      bgYieldBonus += 0.15;
    }
  }
  if (player.chosenBackground === 'lc_chosen') {
    bgYieldBonus += 0.10;
  }
  if (player.chosenBackgroundCategory === 'street_kid') {
    if (hustleId === 'r_sleep' || hustleId === 'power_nap' || hustleId === 'therapy_session') {
      if (effectiveResult.mentalHit > 0) {
        effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 1.15);
      }
    }
  }

  // --- Specialization Sector Matching ---
  let specMatchingBonus = 1.0;
  if (player.activeSpecializationId) {
    const sector = HUSTLE_SECTORS[hustleId];
    if (sector) {
      if (player.activeSpecializationId === 'institutional' && (sector === 'Finance' || sector === 'Real Estate')) specMatchingBonus = 1.10;
      if (player.activeSpecializationId === 'influencer' && (sector === 'Entertainment' || sector === 'Retail')) specMatchingBonus = 1.10;
      if (player.activeSpecializationId === 'shadow' && (sector === 'Technology' || sector === 'Transport')) specMatchingBonus = 1.10;
      if (player.activeSpecializationId === 'vanguard' && sector === 'Technology') specMatchingBonus = 1.10;
    }
  }

  // --- Campaign Cost Rebate based on Clout ---
  if (hustleId === 'president_campaign') {
    const cloutRebate = Math.min(0.25, player.clout / 40000);
    effectiveResult.cost = Math.floor(effectiveResult.cost * (1 - cloutRebate));
  }

  // --- Dynamic Reputation Modifiers ---
  const reputation = player.narrativeFlags?.publicReputation as string || "The Hustler";
  let repYieldBonus = 0;
  let repCloutBonus = 0;
  let repAuraBonus = 0;

  if (reputation === "The Celebrity") {
    if (['cc', 'pod', 'audio'].includes(hustleId)) {
      repYieldBonus += 0.15;
    } else {
      repYieldBonus += 0.10;
    }
    effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * 1.2);
  } else if (reputation === "The Crime Boss") {
    if (['r_ghost_mode', 'r_scrap', 'r_plasma'].includes(hustleId)) {
      repYieldBonus += 0.20;
    }
    if (hustleId === 'president_campaign') {
      effectiveResult.cost = Math.floor(effectiveResult.cost * 1.3);
    }
    if (effectiveResult.heatHit > 0) {
      effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * 1.2);
    }
  } else if (reputation === "The Investor") {
    effectiveResult.cost = Math.floor(effectiveResult.cost * 0.9);
  } else if (reputation === "The Media Emperor") {
    repCloutBonus += 0.15;
  } else if (reputation === "The Mogul") {
    repYieldBonus += 0.10;
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.7);
    effectiveResult.cost = Math.floor(effectiveResult.cost * 1.15);
    effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * 1.5);
  } else if (reputation === "The People's Champion") {
    repAuraBonus += 0.20;
    if (['r_sleep', 'power_nap', 'therapy_session'].includes(hustleId) && effectiveResult.mentalHit > 0) {
      effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 1.15);
    }
  } else if (reputation === "The Shadow Broker") {
    if (['data_analytics', 'crypto_mining', 'data_monopoly'].includes(hustleId) || hustleId.includes('crypto')) {
      repYieldBonus += 0.15;
    }
    const isTechOrDigital = ['data_analytics', 'crypto_mining', 'data_monopoly', 'saas_mvp', 'sw', 'techFlip'].includes(hustleId);
    if (isTechOrDigital) {
      effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * 0.8);
    }
  } else if (reputation === "The Controversial Tycoon") {
    repYieldBonus += 0.15;
    if (hustleId === 'president_campaign') {
      effectiveResult.cost = Math.floor(effectiveResult.cost * 1.20);
    }
  } else if (reputation === "The Billionaire") {
    effectiveResult.cost = Math.floor(effectiveResult.cost * 0.85);
  }

  // --- Centralized Cash Yield Linear Multiplier ---
  const scoreMult = result.minigameMult !== undefined ? result.minigameMult : 1.0;
  const baseYield = scoreMult !== 0 ? result.yieldCash / scoreMult : result.yieldCash;

  const totalMultiplier = 1.0 + (scoreMult - 1) + combinedDynamicBonus + badgeYieldBonus + tierBadgeBonus + counterBidBonus + marketLeaderBonus + mogulBonus + legacyBonus + specBonus + flexBonus + bgYieldBonus + presidentEconomyBonus + repYieldBonus;

  // Globally limit the total cash yield multiplier to prevent extreme scaling/exploit (capped at 10.0x max multiplier)
  const cappedTotalMultiplier = Math.min(10.0, totalMultiplier);

  // Stress / Mental Health work efficiency impact
  const efficiencyMult = player.mentalHealth < 50 ? 0.75 + 0.25 * (player.mentalHealth / 50) : 1.0;

  effectiveResult.yieldCash = Math.max(0, Math.floor(baseYield * cappedTotalMultiplier * specMatchingBonus * efficiencyMult));

  // --- Centralized Clout/Aura Yield Linear Multiplier ---
  const totalCloutMultiplier = (1.0 + badgeCloutBonus + streetStreakBonus + eliteCloutBonus + legacyBonus + specCloutBonus + flexCloutBonus + repCloutBonus) * specMatchingBonus * efficiencyMult;
  effectiveResult.yieldClout = Math.max(0, Math.floor(result.yieldClout * totalCloutMultiplier));

  let finalBaseAuraYield = result.yieldAura;
  if (['r_sleep', 'power_nap', 'therapy_session', 'wellness_retreat', 'psychiatrist'].includes(hustleId) && player.mentalHealth > 80) {
    // If it's a rest action at high health, guarantee at least a baseline Aura yield to apply the +3 recovery reward
    finalBaseAuraYield = Math.max(finalBaseAuraYield, 0) + 3;
  }

  const totalAuraMultiplier = (1.0 + badgeAuraBonus + legacyBonus + specAuraBonus + flexAuraBonus + presidentAuraBonus + repAuraBonus) * specMatchingBonus * efficiencyMult;
  effectiveResult.yieldAura = Math.max(0, Math.floor(finalBaseAuraYield * totalAuraMultiplier));

  // --- Dynamic Reputation Gain Scaling ---
  const scaledGains = applyReputationGainScale(effectiveResult.yieldClout, effectiveResult.yieldAura, reputation);
  effectiveResult.yieldClout = scaledGains.clout;
  effectiveResult.yieldAura = scaledGains.aura;

  // --- Clamp Clout/Aura yields ---
  effectiveResult.yieldClout = Math.floor(Math.max(0, Math.min(1000, effectiveResult.yieldClout)));
  effectiveResult.yieldAura = Math.floor(Math.max(0, Math.min(1000, effectiveResult.yieldAura)));

  // --- Consequence Multipliers ---
  const sector = HUSTLE_SECTORS[hustleId];
  const consCashMult = sector === 'Real Estate'
    ? getConsequenceMultiplier(player, 'real_estate', 'rentMult', 1.0)
    : getConsequenceMultiplier(player, 'businesses', 'yieldCashMult', 1.0);

  const consCloutMult = getConsequenceMultiplier(player, 'clout', 'cloutGainMult', 1.0);
  const consAuraMult = getConsequenceMultiplier(player, 'aura', 'auraGainMult', 1.0);
  const consMentalMult = getConsequenceMultiplier(player, 'mental_health', 'mentalHitMult', 1.0);
  const consHeatMult = getConsequenceMultiplier(player, 'heat', 'heatGainMult', 1.0);

  effectiveResult.yieldCash = Math.floor(effectiveResult.yieldCash * consCashMult);
  effectiveResult.yieldClout = Math.floor(effectiveResult.yieldClout * consCloutMult);
  effectiveResult.yieldAura = Math.floor(effectiveResult.yieldAura * consAuraMult);

  if (effectiveResult.mentalHit < 0) {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * consMentalMult);
  }
  effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * consHeatMult);

  return effectiveResult;
}

export function getEffectiveHustleStats(
  hustleId: string,
  levelData: HustleLevel,
  player: PlayerStats,
  currentLevel: number,
  result: MathResult // Result from calculateHustleMath or strategy
): MathResult {
  return calculateHustleStatsAdditive(hustleId, levelData, player, currentLevel, result);
}

export function calculatePassiveIncome(
  _flexAssets: Record<string, number>,
  _treePassives: Record<string, number>
): number {
  const total = 0;
  // Flex assets passive will be added later
  // Tree passives will be added later
  return total;
}
