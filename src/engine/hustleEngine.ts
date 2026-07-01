import type { PlayerStats, MarketType, TickerMessage } from '../types/game';
import type { HustleLevel } from '../config/hustles/base';
import { calculateHustleMath, getEffectiveHustleStats } from './mathEngine';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { SENTIMENT_CATEGORIES } from '../config/sentiment';

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
  tickerMessages?: TickerMessage[];
  approvalBonus?: number;
}

export type HustleStrategy = (
  hustleId: string,
  state: PlayerStats,
  market: MarketType,
  levelData: HustleLevel,
  currentLevel: number,
  minigameMultiplier: number,
  forceSuccess?: boolean,
  rivalThreat?: 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT'
) => HustleExecutionResult;

const defaultStrategy: HustleStrategy = (hustleId, state, marketType, levelData, currentLevel, minigameMultiplier, forceSuccess, rivalThreat = 'NEUTRAL') => {
  const market = MARKET_CONFIGS[marketType];
  const success = forceSuccess !== undefined ? forceSuccess : Math.random() < 0.8;
  const isVending = levelData.id?.includes('vending');

  const result = calculateHustleMath(
    hustleId,
    levelData,
    currentLevel,
    isVending ? 1 : market.expenseMultiplier,
    market.yieldMultiplier,
    market.heatMultiplier,
    minigameMultiplier,
    success,
    state.mentalShieldTurns,
    rivalThreat
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

const festivalStrategy: HustleStrategy = (_hustleId, state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
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

  let yieldCash = Math.floor((ticketPrice * venueCap * headlinerMult * attendanceMult) * market.yieldMultiplier);

  const yieldCap = 7_000_000;
  yieldCash = Math.min(yieldCash, yieldCap);

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

const philanthropyStrategy: HustleStrategy = (_hustleId, state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
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

const dataAnalyticsStrategy: HustleStrategy = (_hustleId, state, marketType, levelData, currentLevel, _minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const choice = state.dataAnalyticsChoice || 'consumer';
  let yieldCash = 0, yieldClout = 0, yieldAura = 0, heatHit = 5;
  const tickerMessages = [];

  if (choice === 'consumer') {
    yieldCash = 100000;
    yieldClout = Math.floor(levelData.yieldClout * 0.5);
    yieldAura = Math.floor(levelData.yieldAura * 0.5);
  }
  else if (choice === 'financial') {
    yieldCash = 500000;
    yieldClout = 0;
    yieldAura = 0;
    heatHit = 10;
  }
  else if (choice === 'social') {
    yieldCash = 50000;
    yieldClout = 0;
    yieldAura = 0;
  }
  else if (choice === 'all' && currentLevel >= 3) {
    yieldCash = 1000000;
    yieldClout = Math.floor(levelData.yieldClout * 1.0);
    yieldAura = Math.floor(levelData.yieldAura * 1.0);
    heatHit = 30;
    if (Math.random() < 0.10) {
      heatHit += 50; yieldClout -= 100;
      tickerMessages.push({ text: '🚨 DATA BREACH! Massive heat spike and clout loss!', colorClass: 'text-red-500 font-bold' });
    }
  }

  return {
    success: true,
    netChange: (yieldCash * market.yieldMultiplier) - (0),
    message: '',
    cost: 0,
    yieldCash: yieldCash * market.yieldMultiplier,
    yieldClout,
    yieldAura,
    mentalHit: -25,
    heatHit: heatHit * market.heatMultiplier,
    tickerMessages
  };
};

const cryptoMiningStrategy: HustleStrategy = (_hustleId, state, marketType, levelData, currentLevel, _minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const strategy = state.cryptoStrategy || 'solo';
  let yieldCash = 0, heatHit = 5, risk = 0;
  const tickerMessages = [];

  if (strategy === 'solo') { yieldCash = 50000; }
  else if (strategy === 'pool') { yieldCash = 200000; heatHit = 10; risk = 0.05; }
  else if (strategy === 'cloud') { yieldCash = 500000; heatHit = 20; risk = 0.20; }
  else if (strategy === 'asic' && currentLevel >= 3) { yieldCash = 2000000; heatHit = 30; risk = 0.10; }

  let success = true;
  if (Math.random() < risk) {
    yieldCash = 0;
    success = false;
    const msg = strategy === 'cloud' ? 'Scammed by cloud provider!' : 'Mining failure!';
    tickerMessages.push({ text: `❌ ${msg} Yield is 0.`, colorClass: 'text-red-400' });
  }

  return {
    success,
    netChange: (yieldCash * market.yieldMultiplier),
    message: success ? '' : 'Mining failed',
    cost: 0,
    yieldCash: yieldCash * market.yieldMultiplier,
    yieldClout: Math.floor(levelData.yieldClout * (yieldCash > 0 ? 1 : 0.3)),
    yieldAura: Math.floor(levelData.yieldAura * (yieldCash > 0 ? 1 : 0.3)),
    mentalHit: -10,
    heatHit: heatHit * market.heatMultiplier,
    tickerMessages
  };
};

const vaAgencyStrategy: HustleStrategy = (_hustleId, state, marketType, levelData, _currentLevel, _minigameMultiplier, forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const staff = state.vaStaff || 5;
  const training = state.vaTraining || 'none';
  const client = state.vaClient || 'small';

  const costMap = { 5: 10000, 10: 25000, 20: 50000 };
  const cost = (costMap[staff as keyof typeof costMap] || 10000) * market.expenseMultiplier;

  const trainingMult = { none: 1.0, basic: 1.3, advanced: 1.6 };
  const trainingMultiplier = trainingMult[training as keyof typeof trainingMult] || 1.0;

  const baseYieldMap = { small: 50000, medium: 200000, large: 1000000 };
  const baseYield = baseYieldMap[client as keyof typeof baseYieldMap] || 50000;

  const successChance = Math.min(0.95, (staff / 20) * trainingMultiplier);
  const isSuccess = forceSuccess !== undefined ? forceSuccess : Math.random() < successChance;

  let yieldCash = Math.floor(baseYield * market.yieldMultiplier);
  let yieldClout = Math.floor(levelData.yieldClout * trainingMultiplier);
  let yieldAura = Math.floor(levelData.yieldAura * trainingMultiplier);
  const tickerMessages = [];

  if (!isSuccess) {
    yieldCash = Math.floor(yieldCash * 0.3);
    yieldClout = Math.floor(yieldClout * 0.5);
    yieldAura = Math.floor(yieldAura * 0.5);
    tickerMessages.push({ text: '❌ Agency fulfillment failed! Client lost.', colorClass: 'text-red-400' });
  }

  return {
    success: isSuccess,
    netChange: yieldCash - cost,
    message: isSuccess ? '' : 'Fulfillment failed',
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    mentalHit: -18,
    heatHit: 5,
    passiveAdded: Math.floor(baseYield * 0.08),
    tickerMessages
  };
};

const lobbyingStrategy: HustleStrategy = (_hustleId, _state, _marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const intensity = Math.min(4, Math.max(1, Math.floor(minigameMultiplier || 1)));
  const base = 5000000;
  const cost = base;
  const yieldCash = base * intensity;
  const yieldClout = 100 * intensity;
  const yieldAura = 50 * intensity;
  const heatHit = 10 * intensity;
  return {
    success: true,
    netChange: yieldCash - cost,
    message: '',
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    heatHit,
    mentalHit: -5,
    shieldTurns: 0
  };
};

const disasterStrategy: HustleStrategy = (_hustleId, _state, _marketType, levelData, _currentLevel, _minigameMultiplier, forceSuccess) => {
  const isSuccess = forceSuccess !== undefined ? forceSuccess : Math.random() < 0.5;
  const cost = levelData.cost;

  let yieldCash = 0;
  let yieldClout = 0;
  let yieldAura = 0;
  let message = "";

  if (isSuccess) {
    yieldCash = Math.floor(cost * 1.3);
    yieldClout = levelData.yieldClout;
    yieldAura = levelData.yieldAura;
    message = "Crisis averted! Profitable recovery.";
  } else {
    yieldCash = Math.floor(cost * 0.7);
    yieldClout = Math.floor(levelData.yieldClout * 0.3);
    yieldAura = Math.floor(levelData.yieldAura * 0.3);
    message = "Crisis mismanaged. Loss incurred but survived.";
  }

  return {
    success: isSuccess,
    netChange: yieldCash - cost,
    message,
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    heatHit: 15,
    mentalHit: -10,
    shieldTurns: 0
  };
};

const globalFranchiseStrategy: HustleStrategy = (_hustleId, _state, _marketType, levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const territories = Math.min(6, Math.max(1, Math.floor(minigameMultiplier || 1)));
  const cost = levelData.cost;
  const yieldCash = Math.floor(levelData.yieldCash * territories);
  const yieldClout = Math.floor(levelData.yieldClout * territories);
  const yieldAura = Math.floor(levelData.yieldAura * territories);
  const passiveAdded = Math.floor((levelData.passiveYield || 0) * territories);
  return {
    success: true,
    netChange: yieldCash - cost,
    message: '',
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    passiveAdded,
    heatHit: 5,
    mentalHit: -5,
    shieldTurns: 0
  };
};

const realEstateEmpireStrategy: HustleStrategy = (_hustleId, state, marketType, _levelData, _currentLevel, _minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const type = state.realEstateType;
  const leverage = state.realEstateLeverage;
  const strategy = state.realEstateStrategy;

  const typeMult = { residential: 1.0, commercial: 1.5, industrial: 2.0 }[type];
  const leverageMult = leverage === 0 ? 1.0 : (leverage === 50 ? 1.5 : 2.5);

  const cycle = state.marketCycle.realEstate;
  const cycleMult = cycle === 'boom' ? 1.5 : (cycle === 'bust' ? 0.6 : 1.0);

  const baseYield = 1000000;
  let yieldCash = baseYield * typeMult * leverageMult * cycleMult * market.yieldMultiplier;
  const tickerMessages = [];

  if (strategy === 'hold') {
    yieldCash = 0;
    tickerMessages.push({ text: `🏙️ Property acquired for HOLD. Passive income updated.`, colorClass: 'text-blue-400' });
  } else {
    tickerMessages.push({ text: `🏙️ Property FLIPPED for $${Math.floor(yieldCash).toLocaleString()}!`, colorClass: 'text-emerald-400' });
  }

  return {
    success: true,
    netChange: yieldCash - 5000000,
    message: '',
    cost: 5000000,
    yieldCash: Math.floor(yieldCash),
    yieldClout: 500,
    yieldAura: 300,
    mentalHit: -30,
    heatHit: 10,
    tickerMessages
  };
};

const ventureCapitalStrategy: HustleStrategy = (_hustleId, state, marketType, _levelData, _currentLevel, _minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const stage = state.vcStage;
  const sector = state.vcSector;
  const investment = state.vcInvestment * 1000000;

  const stageData = {
    seed: { multRange: [10, 50], failRate: 0.7 },
    seriesA: { multRange: [5, 20], failRate: 0.5 },
    growth: { multRange: [2, 5], failRate: 0.3 },
  }[stage as 'seed' | 'seriesA' | 'growth'];

  const sectorCycle = state.marketCycle.vc[sector];
  const sectorMult = sectorCycle === 'boom' ? 1.4 : (sectorCycle === 'bust' ? 0.7 : 1.0);

  let yieldCash = 0;
  const outcomeRoll = Math.random();
  let success = false;
  const tickerMessages = [];

  if (outcomeRoll > stageData.failRate) {
    success = true;
    const successTypeRoll = Math.random();
    let exitMult;
    if (successTypeRoll < 0.25) {
      exitMult = stageData.multRange[1];
      tickerMessages.push({ text: `🚀 UNICORN IPO! ${sector.toUpperCase()} exit at ${exitMult}x!`, colorClass: 'text-emerald-400 font-black animate-bounce' });
    } else {
      exitMult = Math.random() * (stageData.multRange[1] - stageData.multRange[0]) + stageData.multRange[0];
      tickerMessages.push({ text: `💰 ACQUISITION! ${sector.toUpperCase()} company sold at ${exitMult.toFixed(1)}x.`, colorClass: 'text-emerald-400' });
    }
    yieldCash = investment * exitMult * sectorMult * market.yieldMultiplier;
  } else {
    tickerMessages.push({ text: `📉 STARTUP FAILED. ${sector.toUpperCase()} investment lost.`, colorClass: 'text-red-400' });
  }

  return {
    success,
    netChange: yieldCash - investment,
    message: success ? '' : 'Investment lost',
    cost: investment,
    yieldCash: Math.floor(yieldCash),
    yieldClout: 800,
    yieldAura: 400,
    mentalHit: -25,
    heatHit: 5,
    tickerMessages
  };
};

const filmStudioStrategy: HustleStrategy = (_hustleId, state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const genre = state.filmGenre || 'action';
  const budget = state.filmBudget || 'medium';
  const genreMult = { action: 1.2, comedy: 1.0, drama: 0.8 }[genre];
  const budgetMult = { low: 0.7, medium: 1.0, high: 1.5 }[budget];
  const baseCost = 25000000;
  const cost = baseCost * budgetMult * market.expenseMultiplier;

  const perfMult = minigameMultiplier || 1.0;
  const finalYieldMult = perfMult * genreMult * budgetMult;
  const yieldCash = Math.floor(baseCost * finalYieldMult * market.yieldMultiplier);

  return {
    success: perfMult >= 0.5,
    netChange: yieldCash - cost,
    message: perfMult >= 0.5 ? '' : 'Box office flop',
    cost,
    yieldCash,
    yieldClout: 200 * (perfMult > 1 ? perfMult : 1),
    yieldAura: 100 * (perfMult > 1 ? perfMult : 1),
    mentalHit: -15,
    heatHit: 10
  };
};

const fightPromoterStrategy: HustleStrategy = (_hustleId, _state, marketType, levelData, currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const mult = minigameMultiplier || 1;
  const cost = levelData.cost * market.expenseMultiplier;
  // Apply 1.12x buffer to offset MOGUL yield tax (0.9x), ensuring break-even/profit at 1.0 performance
  const yieldBuffer = currentLevel === 1 ? 1.12 : 1.0;
  const yieldCash = Math.floor(levelData.yieldCash * mult * market.yieldMultiplier * yieldBuffer);

  return {
    success: mult >= 0.5,
    netChange: yieldCash - cost,
    message: mult >= 0.5 ? '' : 'Event failed',
    cost,
    yieldCash,
    yieldClout: 300 * (mult > 1 ? mult : 1),
    yieldAura: 150 * (mult > 1 ? mult : 1),
    mentalHit: -10,
    heatHit: 15
  };
};

const spaceInvestmentStrategy: HustleStrategy = (_hustleId, _state, marketType, levelData, currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const cost = levelData.cost * market.expenseMultiplier;
  const mult = minigameMultiplier || 1.0;
  // Apply 1.12x buffer to offset MOGUL yield tax (0.9x), ensuring break-even/profit at 1.0 performance
  const yieldBuffer = currentLevel === 1 ? 1.12 : 1.12;
  const yieldCash = Math.floor(levelData.yieldCash * mult * market.yieldMultiplier * yieldBuffer);

  return {
    success: mult >= 0.5,
    netChange: yieldCash - cost,
    message: mult >= 0.5 ? '' : 'Mission failure',
    cost,
    yieldCash,
    yieldClout: 400 * (mult > 1 ? mult : 1),
    yieldAura: 300 * (mult > 1 ? mult : 1),
    mentalHit: -20,
    heatHit: 20
  };
};







const openIslandStrategy: HustleStrategy = (hustleId, state, marketType, levelData, currentLevel, minigameMultiplier, forceSuccess, rivalThreat) => {
  const result = defaultStrategy(hustleId, state, marketType, levelData, currentLevel, minigameMultiplier, forceSuccess, rivalThreat);
  const plays = state.hustlePlays[hustleId] || 0;
  if (result.success) {
    // Return 2x base yield if already owned (plays > 0) to trigger dynamic stacking in hustleSlice.ts
    // Delta = (2 * base) - base = base increment.
    result.passiveAdded = (levelData.passiveYield || 0) * (plays > 0 ? 2 : 1);
  }
  return result;
};

const openSportsLeagueStrategy: HustleStrategy = (hustleId, state, marketType, levelData, currentLevel, minigameMultiplier, forceSuccess, rivalThreat) => {
  const result = defaultStrategy(hustleId, state, marketType, levelData, currentLevel, minigameMultiplier, forceSuccess, rivalThreat);
  const plays = state.hustlePlays[hustleId] || 0;
  if (result.success) {
    result.passiveAdded = (levelData.passiveYield || 0) * (plays > 0 ? 2 : 1);
  }
  return result;
};
export const HUSTLE_REGISTRY: Record<string, HustleStrategy> = {
  festival: festivalStrategy,
  philanthropy_empire: philanthropyStrategy,
  data_analytics: dataAnalyticsStrategy,
  crypto_mining: cryptoMiningStrategy,
  virtual_assistant_agency: vaAgencyStrategy,
  lobbying: lobbyingStrategy,
  disaster: disasterStrategy,
  global_franchise: globalFranchiseStrategy,
  real_estate_empire: realEstateEmpireStrategy,
  venture_capital: ventureCapitalStrategy,
  film_studio: filmStudioStrategy,
  fight_promoter: fightPromoterStrategy,
  space_investment: spaceInvestmentStrategy,
  open_island: openIslandStrategy,
  open_sports_league: openSportsLeagueStrategy,
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
  forceSuccess?: boolean,
  rivalThreat: 'RIVAL_DOMINANT' | 'NEUTRAL' | 'PLAYER_DOMINANT' = 'NEUTRAL'
): HustleExecutionResult => {
  const strategy = getHustleStrategy(hustleId);
  const result = strategy(hustleId, state, market, levelData, currentLevel, minigameMultiplier, forceSuccess, rivalThreat);

  // Stamp tier on existing ticker messages
  if (result.tickerMessages) {
    result.tickerMessages = result.tickerMessages.map(m => ({ ...m, tier: state.currentTier }));
  }

  // Apply Sentiment Multiplier (for ticker messages only now, math is centralized)
  if (state.activeSentiment) {
    const category = SENTIMENT_CATEGORIES.find(c => c.id === state.activeSentiment?.category);
    if (category && category.hustleIds.includes(hustleId)) {
      if (!result.tickerMessages) result.tickerMessages = [];
      result.tickerMessages.push({
        text: `📰 ${state.activeSentiment.label}: ${state.activeSentiment.multiplier}x yield`,
        colorClass: state.activeSentiment.multiplier > 1 ? 'text-emerald-400' : 'text-red-400'
      });
    }
  }

  // Apply Rival Impact to non-default strategies that might not use calculateHustleMath internally
  if (hustleId !== 'default' && strategy !== defaultStrategy) {
    if (rivalThreat === 'RIVAL_DOMINANT') {
      result.cost = Math.floor(result.cost * 1.25);
    } else if (rivalThreat === 'PLAYER_DOMINANT') {
      result.yieldCash = Math.floor(result.yieldCash * 1.15);
    }
  }

  // Use centralized math for ALL multipliers (Badges, Tier, Legacy, Flex, Sentiment)
  const effective = getEffectiveHustleStats(hustleId, levelData, state, currentLevel, {
    cost: result.cost,
    yieldCash: result.yieldCash,
    yieldClout: result.yieldClout,
    yieldAura: result.yieldAura,
    mentalHit: result.mentalHit,
    heatHit: result.heatHit,
    shieldTurns: result.shieldTurns || 0,
    passiveAdded: result.passiveAdded,
    isBigWin: result.isRare,
    bigWinMessage: result.bigWinMessage,
  });

  // Apply variance for Corporate tier
  if (state.currentTier === 'CORPORATE') {
    const variance = 0.5 + Math.random(); // 0.5x to 1.5x
    effective.yieldCash = Math.floor(effective.yieldCash * variance);
  }

  // Apply Origin Bonus if active for current tier
  if (state.originBonus && state.originBonus.tiers.includes(state.currentTier)) {
    if (state.originBonus.type === 'cash') {
      effective.yieldCash = Math.floor(effective.yieldCash * state.originBonus.multiplier);
    } else if (state.originBonus.type === 'clout') {
      effective.yieldClout = Math.floor(effective.yieldClout * state.originBonus.multiplier);
    } else if (state.originBonus.type === 'aura') {
      effective.yieldAura = Math.floor(effective.yieldAura * state.originBonus.multiplier);
    }
  }

  // Add passive heat decay on success
  if (result.success) {
    effective.heatHit -= 1;
  }

  // Minimum yield guarantee
  if (levelData.minimumYield && effective.yieldCash < levelData.minimumYield) {
    effective.yieldCash = levelData.minimumYield;
  }

  return {
    ...result,
    cost: effective.cost,
    yieldCash: effective.yieldCash,
    yieldClout: effective.yieldClout,
    yieldAura: effective.yieldAura,
    mentalHit: effective.mentalHit,
    heatHit: effective.heatHit,
    passiveAdded: effective.passiveAdded,
    shieldTurns: effective.shieldTurns,
    approvalBonus: effective.approvalBonus,
    isRare: effective.isBigWin,
    bigWinMessage: effective.bigWinMessage
  };
};
