import type { HustleLevel } from '../config/hustles/base';
import type { PlayerStats, MarketType } from '../types/game';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { HUSTLE_BADGES } from '../config/badges';
import { HUSTLES } from '../config/hustles/base';
import { getMasteryCount } from '../utils/masteryUtils';
import { SENTIMENT_CATEGORIES } from '../config/sentiment';

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
}

export const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2.0,
  3: 3.5,
  4: 5.0,
};

/**
 * Applies systemic multipliers (Tier, Legacy, Badge, Streak, Sentiment) to a hustle result.
 * This is the single source of truth for multipliers applied after the base hustle logic.
 */
export function applySystemicMultipliers(
  hustleId: string,
  state: PlayerStats,
  baseResult: {
    yieldCash: number;
    yieldClout: number;
    yieldAura: number;
    mentalHit: number;
    heatHit: number;
    approvalBonus?: number;
  }
) {
  let { yieldCash, yieldClout, yieldAura, mentalHit, heatHit, approvalBonus = 0 } = baseResult;

  // 1. Apply Sentiment Multiplier
  if (state.activeSentiment) {
    const category = SENTIMENT_CATEGORIES.find(c => c.id === state.activeSentiment?.category);
    if (category && category.hustleIds.includes(hustleId)) {
      yieldCash = Math.floor(yieldCash * state.activeSentiment.multiplier);
    }
  }

  // 2. Apply Badge Buffs
  let finalYieldMult = 1.0;
  let finalCloutMult = 1.0;
  let finalAuraMult = 1.0;
  let finalMentalMult = 1.0;
  let finalHeatMult = 1.0;

  (state.masteredHustles || []).forEach(mId => {
    const badge = HUSTLE_BADGES[mId];
    if (!badge) return;
    if (badge.buff.type === 'yield') finalYieldMult *= badge.buff.value;
    if (badge.buff.type === 'clout') finalCloutMult *= badge.buff.value;
    if (badge.buff.type === 'aura') finalAuraMult *= badge.buff.value;
    if (badge.buff.type === 'mental') finalMentalMult *= badge.buff.value;
    if (badge.buff.type === 'heat') finalHeatMult *= badge.buff.value;
  });

  // 3. Apply Tier Badge Buffs (+2% permanent yield on that tier's hustles)
  const hustle = HUSTLES[hustleId];
  const hustleTier = hustle?.tier;
  if (hustleTier && (state.tierBadges || []).includes(hustleTier as any)) {
    finalYieldMult *= 1.02;
  }

  // 4. Apply Tier Mechanics
  if (state.currentTier === 'MUD') {
    mentalHit = Math.floor(mentalHit * 1.5);
  } else if (state.currentTier === 'STREET') {
    const streakBonus = Math.min(2.0, 1 + (state.streak || 0) * 0.1);
    yieldClout = Math.floor(yieldClout * streakBonus);
  } else if (state.currentTier === 'ELITE') {
    mentalHit = Math.floor(mentalHit * 0.9);
    yieldClout = Math.floor(yieldClout * 1.2);
  } else if (state.currentTier === 'MOGUL') {
    mentalHit = Math.floor(mentalHit * 0.7);
    yieldCash = Math.floor(yieldCash * 0.9);
    heatHit = Math.floor(heatHit * 1.5);
  } else if (state.currentTier === 'PRESIDENT') {
    mentalHit = Math.floor(mentalHit * 0.7);
    const auraBonus = 1 + (state.aura / 5000);
    yieldClout = Math.floor(yieldClout * auraBonus);

    const masteryCount = getMasteryCount(state);
    approvalBonus = (approvalBonus || 0) + Math.min(15, masteryCount * 1.5);
  }

  // 5. Apply Legacy Multiplier
  const legacyMultiplier = 1 + ((state.legacyPoints || 0) * 0.001);

  return {
    yieldCash: Math.floor(yieldCash * legacyMultiplier * finalYieldMult),
    yieldClout: Math.floor(yieldClout * legacyMultiplier * finalCloutMult),
    yieldAura: Math.floor(yieldAura * legacyMultiplier * finalAuraMult),
    mentalHit: Math.floor(mentalHit * finalMentalMult),
    heatHit: Math.floor(heatHit * finalHeatMult),
    approvalBonus
  };
}

/**
 * Calculates the "Effective" stats for a hustle, applying ALL multipliers.
 * USED FOR UI PREVIEWS.
 */
export function getEffectiveHustleStats(
  hustleId: string,
  levelData: HustleLevel,
  state: PlayerStats,
  marketType: MarketType,
  minigameMult: number = 1.0
): MathResult {
  const currentLevel = state.hustleLevels[hustleId] || 1;
  const levelMult = LEVEL_MULTIPLIERS[currentLevel] || 1;
  const market = MARKET_CONFIGS[marketType];
  const isVending = hustleId === 'r_vending' || levelData.id?.includes('vending');
  const hustleTier = HUSTLES[hustleId]?.tier;
  const rivalThreat = state.rivalThreats?.[hustleTier as any] || 'NEUTRAL';

  let costMult = isVending ? 1 : market.expenseMultiplier;
  let yieldMult = market.yieldMultiplier * minigameMult;

  if (rivalThreat === 'RIVAL_DOMINANT') {
    costMult *= 1.25;
  } else if (rivalThreat === 'PLAYER_DOMINANT') {
    yieldMult *= 1.15;
  }

  let cost = Math.floor(levelData.cost * levelMult * costMult);

  let rawYieldCash = levelData.yieldCash * levelMult * yieldMult;
  let rawYieldClout = levelData.yieldClout * levelMult * market.yieldMultiplier;
  let rawYieldAura = levelData.yieldAura * levelMult * market.yieldMultiplier;
  let rawMentalHit = levelData.mentalHit * levelMult;
  let rawHeatHit = (levelData.heatHit !== undefined ? levelData.heatHit : 5) * market.heatMultiplier;

  // Custom Strategy Override logic for accurate card previews
  if (hustleId === 'festival') {
      const choices = state.festivalChoices || { headliner: 'budget', venue: 'small', marketing: 'basic', insurance: false };
      const headlinerMult = { budget: 1.0, premium: 1.5, luxury: 2.5 }[choices.headliner];
      const venueCap = { small: 5000, medium: 20000, large: 50000 }[choices.venue];
      const marketingMult = { basic: 1.0, standard: 1.5, aggressive: 2.5 }[choices.marketing];

      const headlinerCost = { budget: 50000, premium: 200000, luxury: 500000 }[choices.headliner];
      const marketingCost = { basic: 10000, standard: 50000, aggressive: 100000 }[choices.marketing];
      const insuranceCost = choices.insurance ? 50000 : 0;
      cost = (headlinerCost + marketingCost + insuranceCost) * market.expenseMultiplier;

      rawYieldCash = (50 * venueCap * headlinerMult * marketingMult) * market.yieldMultiplier;
      rawYieldClout = 500 * minigameMult;
      rawYieldAura = 250 * minigameMult;
      rawMentalHit = -20;
      rawHeatHit = 15;
  } else if (hustleId === 'philanthropy_empire') {
      const donation = state.philanthropyDonation || 10000000;
      const donationMult = (donation / 50000000) * minigameMult;
      cost = donation * market.expenseMultiplier;
      rawYieldCash = 0;
      rawYieldClout = 500 * donationMult;
      rawYieldAura = 1000 * donationMult;
      rawMentalHit = 20;
      rawHeatHit = 0;
  } else if (hustleId === 'lobbying') {
      const base = 5000000;
      const intensity = Math.min(4, Math.max(1, Math.floor(minigameMult)));
      cost = base;
      rawYieldCash = base * intensity;
      rawYieldClout = 100 * intensity;
      rawYieldAura = 50 * intensity;
      rawMentalHit = -5;
      rawHeatHit = 10 * intensity;
  } else if (hustleId === 'disaster') {
      const base = 10000000;
      const ratio = Math.min(1, Math.max(0, minigameMult / 4));
      cost = base;
      rawYieldCash = base * ratio * 2;
      rawYieldClout = 100 * ratio;
      rawYieldAura = 50 * ratio;
      rawMentalHit = -10;
      rawHeatHit = 15;
  } else if (hustleId === 'global_franchise') {
      const base = 5000000;
      const territories = Math.min(6, Math.max(1, Math.floor(minigameMult)));
      cost = base;
      rawYieldCash = base * territories;
      rawYieldClout = 150 * territories;
      rawYieldAura = 75 * territories;
      rawMentalHit = -5;
      rawHeatHit = 5;
  } else if (hustleId === 'data_analytics') {
      const choice = state.dataAnalyticsChoice || 'consumer';
      if (choice === 'consumer') { rawYieldCash = 100000; rawYieldClout = 50; rawYieldAura = 0; }
      else if (choice === 'financial') { rawYieldCash = 500000; rawYieldClout = 0; rawYieldAura = 0; rawHeatHit = 10; }
      else if (choice === 'social') { rawYieldCash = 50000; rawYieldClout = 0; rawYieldAura = 100; }
      else if (choice === 'all') { rawYieldCash = 1000000; rawYieldClout = 150; rawYieldAura = 150; rawHeatHit = 30; }
      rawYieldCash *= market.yieldMultiplier;
      rawMentalHit = -25;
      rawHeatHit *= market.heatMultiplier;
      cost = 0;
  } else if (hustleId === 'crypto_mining') {
      const strategy = state.cryptoStrategy || 'solo';
      if (strategy === 'solo') { rawYieldCash = 50000; }
      else if (strategy === 'pool') { rawYieldCash = 200000; rawHeatHit = 10; }
      else if (strategy === 'cloud') { rawYieldCash = 500000; rawHeatHit = 20; }
      else if (strategy === 'asic') { rawYieldCash = 2000000; rawHeatHit = 30; }
      rawYieldCash *= market.yieldMultiplier;
      rawYieldClout = 50;
      rawYieldAura = 50;
      rawMentalHit = -10;
      rawHeatHit *= market.heatMultiplier;
      cost = 0;
  } else if (hustleId === 'virtual_assistant_agency') {
      const training = state.vaTraining || 'none';
      const client = state.vaClient || 'small';
      const trainingMult = { none: 1.0, basic: 1.3, advanced: 1.6 }[training] || 1.0;
      const baseYieldMap = { small: 50000, medium: 200000, large: 1000000 };
      const baseYield = baseYieldMap[client as keyof typeof baseYieldMap] || 50000;
      rawYieldCash = baseYield * market.yieldMultiplier;
      rawYieldClout = 20 * trainingMult;
      rawYieldAura = 10 * trainingMult;
      rawMentalHit = -18;
      rawHeatHit = 5;

      const staff = state.vaStaff || 5;
      const costMap = { 5: 10000, 10: 25000, 20: 50000 };
      cost = (costMap[staff as keyof typeof costMap] || 10000) * market.expenseMultiplier;
  } else if (hustleId === 'real_estate_empire') {
      rawYieldCash = 0;
      rawYieldClout = 500;
      rawYieldAura = 300;
      rawMentalHit = -30;
      rawHeatHit = 10;
      cost = 5000000;
  } else if (hustleId === 'venture_capital') {
      rawYieldCash = 0;
      rawYieldClout = 800;
      rawYieldAura = 400;
      rawMentalHit = -25;
      rawHeatHit = 5;
      cost = (state.vcInvestment || 1) * 1000000;
  } else if (hustleId === 'film_studio') {
      const budget = state.filmBudget || 'medium';
      const budgetMult = { low: 0.7, medium: 1.0, high: 1.5 }[budget];
      const baseCost = 25000000;
      cost = baseCost * budgetMult * market.expenseMultiplier;

      const genre = state.filmGenre || 'action';
      const genreMult = { action: 1.2, comedy: 1.0, drama: 0.8 }[genre];
      const perfMult = minigameMult || 1.0;
      const finalYieldMult = perfMult * genreMult * budgetMult;
      rawYieldCash = Math.floor(baseCost * finalYieldMult * market.yieldMultiplier);

      rawYieldClout = 200 * (perfMult > 1 ? perfMult : 1);
      rawYieldAura = 100 * (perfMult > 1 ? perfMult : 1);
      rawMentalHit = -15;
      rawHeatHit = 10;
  } else if (hustleId === 'fight_promoter') {
      const baseCost = 15000000;
      cost = baseCost * market.expenseMultiplier;
      rawYieldCash = Math.floor(cost * minigameMult * market.yieldMultiplier);
      rawYieldClout = 300 * (minigameMult > 1 ? minigameMult : 1);
      rawYieldAura = 150 * (minigameMult > 1 ? minigameMult : 1);
      rawMentalHit = -10;
      rawHeatHit = 15;
  } else if (hustleId === 'space_investment') {
      const baseCost = 100000000;
      cost = baseCost * market.expenseMultiplier;
      rawYieldCash = Math.floor(cost * minigameMult * market.yieldMultiplier);
      rawYieldClout = 400 * (minigameMult > 1 ? minigameMult : 1);
      rawYieldAura = 300 * (minigameMult > 1 ? minigameMult : 1);
      rawMentalHit = -20;
      rawHeatHit = 20;
  }

  const mentalMinigameMult = Math.max(0.5, Math.min(2.0, Math.abs(minigameMult)));
  const baseMentalHit = rawMentalHit * (rawMentalHit < 0 ? mentalMinigameMult : 1);

  // 2. Apply Systemic Multipliers (passing null for Sentiment since we handled it above if needed,
  // or we want it handled within applySystemicMultipliers)
  const systemic = applySystemicMultipliers(hustleId, state, {
      yieldCash: rawYieldCash,
      yieldClout: rawYieldClout,
      yieldAura: rawYieldAura,
      mentalHit: baseMentalHit,
      heatHit: rawHeatHit
  });

  // 3. Apply Mental Shield
  let mentalHit = systemic.mentalHit;
  if (state.mentalShieldTurns > 0 && mentalHit < 0) {
    mentalHit = 0;
  }

  // 4. Final Caps and Post-processing
  let yieldCash = systemic.yieldCash;
  if (hustleId === 'audio' || (levelData.id && levelData.id.includes('audio'))) {
    yieldCash = Math.max(yieldCash, 5000);
  }

  return {
    cost,
    yieldCash,
    yieldClout: Math.floor(Math.max(0, Math.min(1000, systemic.yieldClout))),
    yieldAura: Math.floor(Math.max(0, Math.min(1000, systemic.yieldAura))),
    mentalHit: Math.max(-100, Math.min(100, mentalHit)),
    heatHit: systemic.heatHit,
    shieldTurns: levelData.shieldTurns || 0,
    passiveAdded: levelData.passiveYield,
    approvalBonus: systemic.approvalBonus
  };
}

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

  const cost = levelData.cost * levelMult * costMult;
  let yieldCash = Math.floor(levelData.yieldCash * levelMult * yieldMult);
  let yieldClout = Math.floor(levelData.yieldClout * levelMult * marketYieldMult);
  let yieldAura = Math.floor(levelData.yieldAura * levelMult * marketYieldMult);
  // Cap minigame impact on mental health to prevent extreme hits or weird gains from negative multipliers
  const mentalMinigameMult = Math.max(0.5, Math.min(2.0, Math.abs(minigameMult)));
  let mentalHit = levelData.mentalHit * levelMult * (levelData.mentalHit < 0 ? mentalMinigameMult : 1);
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
      yieldCash *= 10;
      bigWinMessage = 'TO THE MOON! Meme coin pumps 10x!';
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
  if (isSuccess && (hustleId === 'audio' || (levelData.id && levelData.id.includes('audio')))) {
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
    bigWinMessage
  };
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
