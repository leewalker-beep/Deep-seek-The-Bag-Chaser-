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

const dataAnalyticsStrategy: HustleStrategy = (state, marketType, _levelData, currentLevel, _minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const choice = state.dataAnalyticsChoice || 'consumer';
  let yieldCash = 0, yieldClout = 0, yieldAura = 0, heatHit = 5;
  const tickerMessages = [];

  if (choice === 'consumer') { yieldCash = 100000; yieldClout = 50; }
  else if (choice === 'financial') { yieldCash = 500000; heatHit = 10; }
  else if (choice === 'social') { yieldCash = 50000; yieldAura = 100; }
  else if (choice === 'all' && currentLevel >= 3) {
    yieldCash = 1000000; yieldClout = 150; yieldAura = 150; heatHit = 30;
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

const cryptoMiningStrategy: HustleStrategy = (state, marketType, _levelData, currentLevel, _minigameMultiplier, _forceSuccess) => {
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
    yieldClout: 50,
    yieldAura: 50,
    mentalHit: -10,
    heatHit: heatHit * market.heatMultiplier,
    tickerMessages
  };
};

const vaAgencyStrategy: HustleStrategy = (state, marketType, _levelData, _currentLevel, _minigameMultiplier, forceSuccess) => {
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
  let yieldClout = Math.floor(20 * trainingMultiplier);
  let yieldAura = Math.floor(10 * trainingMultiplier);
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

const lobbyingStrategy: HustleStrategy = (_state, _marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
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

const disasterStrategy: HustleStrategy = (_state, _marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const crisisRatio = Math.min(1, Math.max(0, (minigameMultiplier || 0.5) / 4));
  const base = 10000000;
  const cost = base;
  const yieldCash = base * crisisRatio * 2;
  const yieldClout = 100 * crisisRatio;
  const yieldAura = 50 * crisisRatio;
  return {
    success: true,
    netChange: yieldCash - cost,
    message: '',
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    heatHit: 15,
    mentalHit: -10,
    shieldTurns: 0
  };
};

const globalFranchiseStrategy: HustleStrategy = (_state, _marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const territories = Math.min(6, Math.max(1, Math.floor(minigameMultiplier || 1)));
  const base = 5000000;
  const cost = base;
  const yieldCash = base * territories;
  const yieldClout = 150 * territories;
  const yieldAura = 75 * territories;
  const passiveAdded = 50000 * territories;
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

const realEstateEmpireStrategy: HustleStrategy = (state, marketType, _levelData, _currentLevel, _minigameMultiplier, _forceSuccess) => {
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

const ventureCapitalStrategy: HustleStrategy = (state, marketType, _levelData, _currentLevel, _minigameMultiplier, _forceSuccess) => {
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

const filmStudioStrategy: HustleStrategy = (state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
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

const fightPromoterStrategy: HustleStrategy = (_state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const mult = minigameMultiplier || 1;
  const cost = 15000000 * market.expenseMultiplier;
  const yieldCash = Math.floor(cost * mult * market.yieldMultiplier);

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

const spaceInvestmentStrategy: HustleStrategy = (_state, marketType, _levelData, _currentLevel, minigameMultiplier, _forceSuccess) => {
  const market = MARKET_CONFIGS[marketType];
  const cost = 100000000 * market.expenseMultiplier;
  const mult = minigameMultiplier || 1.0;
  const yieldCash = Math.floor(cost * mult * market.yieldMultiplier);

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
