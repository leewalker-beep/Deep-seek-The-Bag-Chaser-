import type { HustleLevel } from '../config/hustles/base';

export interface MathResult {
  cost: number;
  yieldCash: number;
  yieldClout: number;
  yieldAura: number;
  mentalHit: number;
  heatHit: number;
}

const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2.0,
  3: 3.5,
};

export function calculateHustleMath(
  hustleId: string,
  levelData: HustleLevel,
  currentLevel: number,
  marketExpenseMult: number,
  marketYieldMult: number,
  marketHeatMult: number,
  minigameMult: number,
  isSuccess: boolean
): MathResult {
  const levelMult = LEVEL_MULTIPLIERS[currentLevel] || 1;

  const cost = levelData.cost * levelMult * marketExpenseMult;
  let yieldCash = levelData.yieldCash * levelMult * marketYieldMult * minigameMult;
  let yieldClout = levelData.yieldClout * levelMult * marketYieldMult;
  let yieldAura = levelData.yieldAura * levelMult * marketYieldMult;
  let mentalHit = levelData.mentalHit * levelMult;
  let heatHit = (levelData.heatHit !== undefined ? levelData.heatHit : 5) * marketHeatMult;

  if (!isSuccess) {
    yieldCash = Math.floor(yieldCash * 0.3);
    yieldClout = Math.floor(yieldClout * 0.3);
    yieldAura = Math.floor(yieldAura * 0.3);
    // If mentalHit is positive (gain), reduce it on failure. If negative (penalty), double it.
    mentalHit = mentalHit > 0 ? Math.floor(mentalHit * 0.3) : mentalHit * 2;
    // If heatHit was negative (reduction), on failure it should probably be a penalty instead of double reduction
    heatHit = heatHit < 0 ? 5 : heatHit * 2;
  }

  yieldClout = Math.floor(yieldClout);
  yieldAura = Math.floor(yieldAura);

  // Profit safety net
  if (isSuccess && yieldCash < cost && cost > 0) {
    console.warn(`Profit safety applied to ${hustleId}`);
    yieldCash = Math.floor(cost * 1.3);
  }

  return { cost, yieldCash, yieldClout, yieldAura, mentalHit, heatHit };
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
