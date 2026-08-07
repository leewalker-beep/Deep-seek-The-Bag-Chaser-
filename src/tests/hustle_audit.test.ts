import { describe, it, beforeAll, afterAll } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';
import * as fs from 'fs';

describe('Hustle Reward Audit', () => {
  const auditResults: any[] = [];

  beforeAll(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as any;
  });

  const allHustleIds = Object.keys(HUSTLES);

  for (const hustleId of allHustleIds) {
    const hustle = HUSTLES[hustleId];

    it(`audits ${hustle.name} (${hustleId})`, () => {
      const hustleResult = {
        hustleId,
        hustleName: hustle.name,
        tier: hustle.tier,
        plays: [] as any[]
      };

      const variations = [];
      if (hustle.levels) {
          variations.push(...hustle.levels.slice(0, 3).map(l => ({ level: l.level })));
      } else if (hustle.branches) {
          variations.push(...Object.keys(hustle.branches).slice(0, 3).map(b => ({ branchId: b })));
      } else {
          variations.push({ level: 1 });
      }

      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];

        // Reset state for each variation to ensure consistency
        useGameStore.getState().resetGame('STREET_KID', 3);
        useGameStore.setState((state) => ({
          pl: {
            ...state.pl,
            currentTier: hustle.tier as any,
            bag: 1000000000000, // $1 Trillion to cover any cost
            clout: 0,
            aura: 0,
            masteredHustles: [], // Clear mastered hustles to avoid badge buffs
          },
          currentMarket: 'NORMAL',
          activeSentiment: null
        }));

        // Setup state for this variation
        if (variation.level) {
            useGameStore.setState(s => ({ pl: { ...s.pl, hustleLevels: { ...s.pl.hustleLevels, [hustleId]: variation.level } } }));
        }
        if (variation.branchId) {
            useGameStore.setState(s => ({ pl: { ...s.pl, hustleBranchIds: { ...s.pl.hustleBranchIds, [hustleId]: variation.branchId } } }));
        }

        const stateTemp = useGameStore.getState();
        const currentLevel = stateTemp.pl.hustleLevels[hustleId] || 1;
        const currentBranchId = stateTemp.pl.hustleBranchIds[hustleId] || hustle.startBranchId;

        let cardData: any;
        if (hustle.branches) {
            cardData = currentBranchId ? hustle.branches[currentBranchId] : undefined;
        } else if (hustle.levels) {
            cardData = hustle.levels.find(l => l.level === currentLevel);
        }

        const initialClout = cardData?.cloutReq ?? 0;
        const initialAura = cardData?.auraReq ?? 0;

        useGameStore.setState((s) => ({
          pl: {
            ...s.pl,
            clout: initialClout,
            aura: initialAura
          }
        }));

        const stateBefore = useGameStore.getState();

        const cardDisplay = {
          cost: cardData?.cost ?? 0,
          yieldCash: cardData?.yieldCash ?? 0,
          yieldClout: cardData?.yieldClout ?? 0,
          yieldAura: cardData?.yieldAura ?? 0,
          mentalHit: cardData?.mentalHit ?? 0,
          heatHit: cardData?.heatHit ?? 5
        };

        const reward = stateBefore.executeHustle(hustleId, 1, true);

        const rewardCardDisplay = {
          cost: reward.cost,
          yieldCash: reward.yieldCash,
          yieldClout: reward.yieldClout,
          yieldAura: reward.yieldAura,
          mentalHit: reward.mentalHit,
          heatHit: reward.heatHit,
          netChange: reward.yieldCash - reward.cost
        };

        const stateAfter = useGameStore.getState();
        const latestHustleEvent = stateAfter.pl.events.find(e => e.type === 'HUSTLE_COMPLETED');

        if (!latestHustleEvent) {
             // If we still can't find it, it's a real bug in the engine/slice logging
             hustleResult.plays.push({
               iteration: i + 1,
               level: currentLevel,
               branchId: currentBranchId,
               card: cardDisplay,
               reward: rewardCardDisplay,
               receipt: "MISSING_EVENT"
             });
             continue;
        }
        const receipt = latestHustleEvent.metadata;

        const receiptDisplay = {
          cost: reward.cost,
          yieldCash: Math.round((receipt.profit || 0) + (reward.cost || 0)),
          yieldClout: receipt.yieldClout,
          yieldAura: receipt.yieldAura,
          mentalHit: receipt.mentalHit,
          heatHit: receipt.heatHit,
          profit: receipt.profit
        };

        hustleResult.plays.push({
          iteration: i + 1,
          level: currentLevel,
          branchId: currentBranchId,
          card: cardDisplay,
          reward: rewardCardDisplay,
          receipt: receiptDisplay
        });
      }
      auditResults.push(hustleResult);
    });
  }

  afterAll(() => {
    fs.writeFileSync('audit_results.json', JSON.stringify(auditResults, null, 2));
  });
});
