import type { PlayerStats, MarketType } from '../types/game';
import type { HustleLevel } from '../config/hustles/base';
import { calculateHustleMath } from './mathEngine';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { HUSTLE_BADGES } from '../config/badges';

export interface HustleExecutionResult {
  success: boolean;
  netChange: number;
  message: string;
  cost: number;
  yieldCash: number;
  yieldClout: number;
  yieldAura: number;
  mentalHit: number;
  heatHit: number;
  passiveAdded?: number;
  legacyGain?: number;
  shieldTurns?: number;
  isRare?: boolean;
  bigWinMessage?: string;
  tickerMessages?: { text: string; colorClass?: string }[];
}

export type HustleStrategy = (
  state: PlayerStats,
  market: MarketType,
  levelData: HustleLevel,
  currentLevel: number,
  minigameMultiplier: number,
  forceSuccess?: boolean
) => HustleExecutionResult;

const defaultStrategy: HustleStrategy = (state, marketType, levelData, currentLevel, minigameMultiplier, forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const success = forceSuccess !== undefined ? forceSuccess : Math.random() < 0.8;
  const isVending = levelData.id?.includes('vending');

  const result = calculateHustleMath(
    'default',
    levelData,
    currentLevel,
    isVending ? 1 : market.expenseMultiplier,
    market.yieldMultiplier,
    market.heatMultiplier,
    minigameMultiplier,
    success,
    state.mentalShieldTurns
  );

  return {
    success,
    netChange: result.yieldCash - result.cost,
    message: success ? '' : 'Failed!',
    cost: result.cost,
    yieldCash: result.yieldCash,
    yieldClout: result.yieldClout,
    yieldAura: result.yieldAura,
    mentalHit: result.mentalHit,
    heatHit: result.heatHit,
    passiveAdded: result.passiveAdded,
    shieldTurns: result.shieldTurns,
    isRare: result.isBigWin,
    bigWinMessage: result.bigWinMessage,
  };
};

const festivalStrategy: HustleStrategy = (state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const choices = state.festivalChoices || { headliner: 'budget', venue: 'small', marketing: 'basic', insurance: false };
  const headlinerMult = { budget: 1.0, premium: 1.5, luxury: 2.5 }[choices.headliner];
  const venueCap = { small: 5000, medium: 20000, large: 50000 }[choices.venue];
  const marketingMult = { basic: 1.0, standard: 1.5, aggressive: 2.5 }[choices.marketing];

  const headlinerCost = { budget: 50000, premium: 200000, luxury: 500000 }[choices.headliner];
  const marketingCost = { basic: 10000, standard: 50000, aggressive: 100000 }[choices.marketing];
  const insuranceCost = choices.insurance ? 50000 : 0;
  const totalCost = (headlinerCost + marketingCost + insuranceCost) * market.expenseMultiplier;

  const ticketPrice = 50;
  let attendanceMult = marketingMult;
  const tickerMessages: { text: string; colorClass: string }[] = [];

  if (Math.random() < 0.15) {
    if (!choices.insurance) {
      attendanceMult *= 0.5;
      tickerMessages.push({ text: '⛈️ RAIN EVENT! Attendance slashed by 50% without insurance!', colorClass: 'text-red-400' });
    } else {
      tickerMessages.push({ text: '⛈️ RAIN EVENT! Insurance covered the losses!', colorClass: 'text-blue-400' });
    }
  }

  const yieldCash = Math.floor((ticketPrice * venueCap * headlinerMult * attendanceMult) * market.yieldMultiplier);

  return {
    success: true,
    netChange: yieldCash - totalCost,
    message: '',
    cost: totalCost,
    yieldCash,
    yieldClout: 500 * (minigameMultiplier || 1),
    yieldAura: 250 * (minigameMultiplier || 1),
    mentalHit: -20,
    heatHit: 15,
    tickerMessages,
  };
};

const philanthropyStrategy: HustleStrategy = (state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const donation = state.philanthropyDonation || 10000000;
  const donationMult = (donation / 50000000) * (minigameMultiplier || 1);
  const legacyGain = Math.floor(donationMult * 100) + Math.floor(donation / 500000);

  return {
    success: true,
    netChange: -donation * market.expenseMultiplier,
    message: '',
    cost: donation * market.expenseMultiplier,
    yieldCash: 0,
    yieldClout: Math.floor(500 * donationMult),
    yieldAura: Math.floor(1000 * donationMult),
    legacyGain,
    mentalHit: 20,
    heatHit: 0,
  };
};

export const HUSTLE_REGISTRY: Record<string, HustleStrategy> = {
  festival: festivalStrategy,
  philanthropy_empire: philanthropyStrategy,
};

export const getHustleStrategy = (hustleId: string): HustleStrategy => {
  return HUSTLE_REGISTRY[hustleId] || defaultStrategy;
};

export const executeHustleAction = (
  hustleId: string,
  state: PlayerStats,
  market: MarketType,
  levelData: HustleLevel,
  currentLevel: number,
  minigameMultiplier: number,
  forceSuccess?: boolean
): HustleExecutionResult => {
  const strategy = getHustleStrategy(hustleId);
  const result = strategy(state, market, levelData, currentLevel, minigameMultiplier, forceSuccess);

  // Apply Badge Buffs
  let finalYieldMult = 1.0;
  let finalCloutMult = 1.0;
  let finalAuraMult = 1.0;
  let finalMentalMult = 1.0;
  let finalHeatMult = 1.0;

  state.masteredHustles.forEach(mId => {
    const badge = HUSTLE_BADGES[mId];
    if (!badge) return;
    if (badge.buff.type === 'yield') finalYieldMult *= badge.buff.value;
    if (badge.buff.type === 'clout') finalCloutMult *= badge.buff.value;
    if (badge.buff.type === 'aura') finalAuraMult *= badge.buff.value;
    if (badge.buff.type === 'mental') finalMentalMult *= badge.buff.value;
    if (badge.buff.type === 'heat') finalHeatMult *= badge.buff.value;
  });

  // Apply Tier Mechanics
  if (state.currentTier === 'MUD') {
    result.mentalHit = Math.floor(result.mentalHit * 1.5); // More exhausting
  } else if (state.currentTier === 'STREET') {
    const streakBonus = Math.min(2.0, 1 + (state.streak || 0) * 0.1);
    result.yieldClout = Math.floor(result.yieldClout * streakBonus);
  } else if (state.currentTier === 'CORPORATE') {
    // High variance in corporate
    const variance = 0.5 + Math.random(); // 0.5x to 1.5x
    result.yieldCash = Math.floor(result.yieldCash * variance);
  } else if (state.currentTier === 'ELITE') {
    // Boardroom pressure: Higher mental hits but higher potential clout
    result.mentalHit = Math.floor(result.mentalHit * 1.3);
    result.yieldClout = Math.floor(result.yieldClout * 1.2);
  } else if (state.currentTier === 'MOGUL') {
    // Big Swings: Higher yield but much higher heat
    result.yieldCash = Math.floor(result.yieldCash * 1.5);
    result.heatHit = Math.floor(result.heatHit * 1.5);
  } else if (state.currentTier === 'PRESIDENT') {
    // Campaign intensity: Aura acts as multiplier for Clout
    const auraBonus = 1 + (state.aura / 5000);
    result.yieldClout = Math.floor(result.yieldClout * auraBonus);
  }

  const legacyMultiplier = 1 + ((state.legacyPoints || 0) * 0.001);

  result.yieldCash = Math.floor(result.yieldCash * legacyMultiplier * finalYieldMult);
  result.yieldClout = Math.floor(result.yieldClout * legacyMultiplier * finalCloutMult);
  result.yieldAura = Math.floor(result.yieldAura * legacyMultiplier * finalAuraMult);
  result.mentalHit = Math.floor(result.mentalHit * finalMentalMult);
  result.heatHit = Math.floor(result.heatHit * finalHeatMult);

  return result;
};
