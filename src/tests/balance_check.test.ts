
import { describe, it } from 'vitest';
import { HUSTLES } from '../config/hustles/base';
import { PROGRESSION_ORDER } from '../config/tiers';

const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 2.0,
  3: 3.5,
  4: 5.0,
};

describe('Balance Check', () => {
  it('should analyze hustle balance', () => {
    console.log("Tier,Hustle ID,Level,Cost,Yield,Profit,Clout,Aura,Passive,ROI%");

    for (const tier of PROGRESSION_ORDER) {
      const tierHustles = Object.values(HUSTLES).filter(h => h.tier === tier);

      for (const hustle of tierHustles) {
        const branches = hustle.branches || {};
        const levels = hustle.levels || [];
        const allLevels = [...Object.values(branches), ...levels];

        for (const levelData of allLevels) {
          const levelMult = LEVEL_MULTIPLIERS[levelData.level] || 1;
          const cost = levelData.cost * levelMult;
          const yieldCash = levelData.yieldCash * levelMult;
          const profit = yieldCash - cost;
          const clout = levelData.yieldClout * levelMult;
          const aura = levelData.yieldAura * levelMult;
          const passive = levelData.passiveYield || 0;
          const roi = cost > 0 ? (profit / cost) * 100 : 0;

          console.log(`${tier},${hustle.id},${levelData.level},${cost},${yieldCash},${profit},${clout},${aura},${passive},${roi.toFixed(1)}%`);
        }
      }
    }
  });
});
