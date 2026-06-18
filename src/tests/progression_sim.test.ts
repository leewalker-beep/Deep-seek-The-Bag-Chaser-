
import { describe, it } from 'vitest';
import { HUSTLES } from '../config/hustles/base';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';
import { LEVEL_MULTIPLIERS } from '../engine/mathEngine';
import type { Tier } from '../types/game';

const rentByTier: Record<string, number> = {
  MUD: 200,
  STREET: 1000,
  STARTUP: 5000,
  CORPORATE: 20000,
  ELITE: 100000,
  MOGUL: 500000,
  PRESIDENT: 2000000,
  OPEN: 0
};

describe('Progression Simulation', () => {
  it('should simulate full game progression', () => {
    let bag = 1000;
    let clout = 0;
    let aura = 0;
    let totalMonths = 0;
    let safetyNetTriggers = 0;

    console.log("Tier,Months,Final Bag,Final Clout,Final Aura,Safety Triggers");

    for (const tier of PROGRESSION_ORDER) {
      if (tier === 'OPEN') break;

      const req = TIER_REQUIREMENTS[tier];
      // Advance to tier
      bag -= req.fee;
      clout = Math.floor(clout * 0.6);
      aura = Math.floor(aura * 0.6);

      const nextTier = PROGRESSION_ORDER[PROGRESSION_ORDER.indexOf(tier) + 1];
      if (!nextTier) break;
      const nextReq = TIER_REQUIREMENTS[nextTier];

      let tierMonths = 0;
      const tierHustles = Object.values(HUSTLES).filter(h => h.tier === tier);

      // Strategy: Always pick the "best" available hustle level we can afford and meet requirements for
      while (bag < nextReq.cash || clout < nextReq.clout || aura < nextReq.aura) {
        tierMonths++;
        totalMonths++;

        // Rent
        bag -= (rentByTier[tier] || 0);

        if (tierMonths > 240) {
          console.log(`STUCK in ${tier}: Bag=${bag}, Clout=${clout}, Aura=${aura}`);
          break;
        }

        // Find best hustle
        let bestHustle: any = null;
        let bestScore = -Infinity;

        for (const hustle of tierHustles) {
          const allLevels = [...Object.values(hustle.branches || {}), ...(hustle.levels || [])];
          for (const lvl of allLevels) {
            const levelMult = LEVEL_MULTIPLIERS[lvl.level] || 1;
            const cost = lvl.cost * levelMult;

            if (lvl.cloutReq <= clout && lvl.auraReq <= aura && cost <= bag + 10000) {
              const yieldCash = lvl.yieldCash * levelMult;
              const profit = yieldCash - cost;

              // Simple heuristic: weigh bag/clout/aura based on what we need most
              let score = 0;
              if (bag < 0) {
                  // EMERGENCY: Survival first
                  score += profit * 1000;
              } else {
                  if (bag < nextReq.cash) {
                    score += (profit / Math.max(1, nextReq.cash - bag)) * 1000;
                  }
                  if (clout < nextReq.clout) {
                    score += (lvl.yieldClout * levelMult / Math.max(1, nextReq.clout - clout)) * 500;
                  }
                  if (aura < nextReq.aura) {
                    score += (lvl.yieldAura * levelMult / Math.max(1, nextReq.aura - aura)) * 500;
                  }
              }

              // Preference for active over passive in this sim to avoid stalling
              if (lvl.yieldCash > 0) score += 10;

              if (score > bestScore) {
                bestScore = score;
                bestHustle = { ...lvl, cost, yieldCash, yieldClout: lvl.yieldClout * levelMult, yieldAura: lvl.yieldAura * levelMult };
              }
            }
          }
        }

        if (!bestHustle || bag < -1000000000) {
          // If stuck or bankrupt
          if (tier === 'MUD' && bag < 0) bag = 0; // Mud safety
          if (tierMonths % 50 === 0) {
              // console.log(`[SIM] ${tier} Month ${tierMonths}: Bag=${bag.toLocaleString()}, No Best Hustle? ${!bestHustle}`);
          }
          continue;
        }

        // Profit safety net check for reporting
        if (bestHustle.yieldCash > 0 && bestHustle.yieldCash < bestHustle.cost) {
            safetyNetTriggers++;
        }

        bag += (bestHustle.yieldCash - bestHustle.cost);
        clout += bestHustle.yieldClout;
        aura += bestHustle.yieldAura;

        // Passive income (simplified)
        for (const h of tierHustles) {
            if (h.isPassive) {
                // assume 1 machine for now
                bag += 150;
            }
        }

        // Simulate mental recovery every 4 months
        if (tierMonths % 4 === 0) {
          tierMonths++;
          totalMonths++;
          bag -= (rentByTier[tier] || 0); // extra rent for recovery month
        }
      }

      console.log(`${tier},${tierMonths},${bag.toLocaleString()},${clout},${aura},${safetyNetTriggers}`);
    }
  });
});
