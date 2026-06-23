import type { PlayerStats } from '../types/game';
import type { HustleLevel } from '../config/hustles/base';
import { HUSTLE_BADGES } from '../config/badges';
import { HUSTLES } from '../config/hustles/base';
import { SENTIMENT_CATEGORIES } from '../config/sentiment';
import { getMasteryCount } from '../utils/masteryUtils';
import { FLEX_ASSETS } from '../config/flexAssets';

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
    bigWinMessage
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

export function getEffectiveHustleStats(
  hustleId: string,
  _levelData: HustleLevel,
  player: PlayerStats,
  _currentLevel: number,
  result: MathResult // Result from calculateHustleMath or strategy
): MathResult {
  const effectiveResult = { ...result };

  // 1. Apply Sentiment Multiplier
  if (player.activeSentiment) {
    const category = SENTIMENT_CATEGORIES.find(c => c.id === player.activeSentiment?.category);
    if (category && category.hustleIds.includes(hustleId)) {
      effectiveResult.yieldCash = Math.floor(effectiveResult.yieldCash * player.activeSentiment.multiplier);
    }
  }

  // 2. Apply Badge Buffs
  let finalYieldMult = 1.0;
  let finalCloutMult = 1.0;
  let finalAuraMult = 1.0;
  let finalMentalMult = 1.0;
  let finalHeatMult = 1.0;

  player.masteredHustles.forEach(mId => {
    const badge = HUSTLE_BADGES[mId];
    if (!badge) return;
    if (badge.buff.type === 'yield') finalYieldMult *= badge.buff.value;
    if (badge.buff.type === 'clout') finalCloutMult *= badge.buff.value;
    if (badge.buff.type === 'aura') finalAuraMult *= badge.buff.value;
    if (badge.buff.type === 'mental') finalMentalMult *= badge.buff.value;
    if (badge.buff.type === 'heat') finalHeatMult *= badge.buff.value;
  });

  // 3. Apply Tier Badge Buffs (+2% permanent yield on that tier's hustles)
  const hustleTier = HUSTLES[hustleId]?.tier;
  if (hustleTier && player.tierBadges.includes(hustleTier)) {
    finalYieldMult *= 1.02;
  }

  // 4. Apply Tier Mechanics
  if (player.currentTier === 'MUD') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 1.5);
  } else if (player.currentTier === 'STREET') {
    const streakBonus = Math.min(2.0, 1 + (player.streak || 0) * 0.1);
    effectiveResult.yieldClout = Math.floor(effectiveResult.yieldClout * streakBonus);
  } else if (player.currentTier === 'CORPORATE') {
    // Note: Variance is applied at execution time in hustleEngine,
    // but for effective stats we show the base expected value.
  } else if (player.currentTier === 'ELITE') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.9);
    effectiveResult.yieldClout = Math.floor(effectiveResult.yieldClout * 1.2);
  } else if (player.currentTier === 'MOGUL') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.7);
    effectiveResult.yieldCash = Math.floor(effectiveResult.yieldCash * 0.9);
    effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * 1.5);
  } else if (player.currentTier === 'PRESIDENT') {
    effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * 0.7);
    const auraBonus = 1 + (player.aura / 5000);
    effectiveResult.yieldClout = Math.floor(effectiveResult.yieldClout * auraBonus);

    const masteryCount = getMasteryCount(player);
    const masteryApprovalBonus = Math.min(15, masteryCount * 1.5);
    effectiveResult.approvalBonus = (effectiveResult.approvalBonus || 0) + masteryApprovalBonus;
  }

  // 5. Apply Legacy Multiplier
  const legacyMultiplier = 1 + ((player.legacyPoints || 0) * 0.001);

  effectiveResult.yieldCash = Math.floor(effectiveResult.yieldCash * legacyMultiplier * finalYieldMult);
  effectiveResult.yieldClout = Math.floor(effectiveResult.yieldClout * legacyMultiplier * finalCloutMult);
  effectiveResult.yieldAura = Math.floor(effectiveResult.yieldAura * legacyMultiplier * finalAuraMult);
  effectiveResult.mentalHit = Math.floor(effectiveResult.mentalHit * finalMentalMult);
  effectiveResult.heatHit = Math.floor(effectiveResult.heatHit * finalHeatMult);

  // 6. Apply Flex Bonuses
  applyFlexBonuses(effectiveResult, calculateFlexBonuses(player));

  return effectiveResult;
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
