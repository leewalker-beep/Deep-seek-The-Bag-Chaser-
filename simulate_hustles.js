
import { HUSTLES } from './src/config/hustles/base';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from './src/config/tiers';

const LEVEL_MULTIPLIERS = {
  1: 1,
  2: 2.0,
  3: 3.5,
  4: 5.0,
};

function simulate() {
  console.log("Tier | Hustle ID | Level | Cost | Yield | Profit | Clout | Aura | Passive | Net Monthly");
  console.log("-----------------------------------------------------------------------------------------");

  for (const tier of PROGRESSION_ORDER) {
    if (tier === 'OPEN') continue;

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

        console.log(`${tier.padEnd(10)} | ${hustle.id.padEnd(15)} | ${String(levelData.level).padEnd(5)} | ${String(cost).padEnd(10)} | ${String(yieldCash).padEnd(10)} | ${String(profit).padEnd(10)} | ${String(clout).padEnd(5)} | ${String(aura).padEnd(5)} | ${String(passive).padEnd(8)}`);
      }
    }
  }
}

simulate();
