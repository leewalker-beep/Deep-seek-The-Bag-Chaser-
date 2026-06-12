import type { HustleLevel } from '../config/hustles/base';

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
  mentalShieldTurns: number = 0
): MathResult {
  const levelMult = LEVEL_MULTIPLIERS[currentLevel] || 1;

  const cost = levelData.cost * levelMult * marketExpenseMult;
  let yieldCash = Math.floor(levelData.yieldCash * levelMult * marketYieldMult * minigameMult);
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

  // Profit safety net
  if (isSuccess && yieldCash < cost && cost > 0) {
    console.warn(`Profit safety applied to ${hustleId}`);
    yieldCash = Math.floor(cost * 1.3);
  }

  return {
    cost,
    yieldCash,
    yieldClout,
    yieldAura,
    mentalHit,
    heatHit,
    shieldTurns: levelData.shieldTurns || 0,
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
