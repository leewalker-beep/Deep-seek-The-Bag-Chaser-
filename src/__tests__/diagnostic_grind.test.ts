import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';

describe('MUD Tier Grinding Diagnostic', () => {
  const categories = [
    { catId: 'street_kid', varId: 'sk_scrap' },
    { catId: 'dropout', varId: 'dr_vending' },
    { catId: 'benefactor', varId: 'bn_mining' },
  ];

  const mudHustles = Object.values(HUSTLES).filter(h => h.tier === 'MUD');

  categories.forEach(({ catId, varId }) => {
    it(`Diagnostic run for ${catId} (${varId})`, () => {
      const store = useGameStore.getState();
      store.resetGame(varId, 3, catId, varId);

      console.log(`\n=== STARTING RUN: Category=${catId}, Variation=${varId} ===`);

      mudHustles.forEach(hustle => {
        const branches = hustle.branches ? Object.keys(hustle.branches) : [undefined];

        branches.forEach(branchId => {
          for (let i = 0; i < 10; i++) {
            const stateBefore = useGameStore.getState().pl;
            if (stateBefore.mentalHealth <= 0 || stateBefore.bag < 0 || stateBefore.clout <= 0 || stateBefore.aura <= 0) {
                console.log(`[DEATH] Run terminated early. Stats: Bag=${stateBefore.bag}, MH=${stateBefore.mentalHealth}, Clout=${stateBefore.clout}, Aura=${stateBefore.aura}`);
                // Re-reset to continue testing other hustles
                store.resetGame(varId, 3, catId, varId);
                // Skip the rest of this iteration if we just died
                continue;
            }

            let result;
            if (hustle.branches) {
                // Determine if we need to upgrade or just execute
                const currentBranchId = stateBefore.hustleBranchIds[hustle.id] || hustle.startBranchId;
                if (currentBranchId !== branchId) {
                    // Try to upgrade to the target branch if possible
                    // This is tricky because we need to follow the path.
                    // For diagnostic purposes, let's just force the branch execution if we can.
                    // Actually, executeBranch handles it.
                    result = useGameStore.getState().executeBranch(hustle.id, branchId);
                } else {
                    result = useGameStore.getState().executeBranch(hustle.id, branchId);
                }
            } else {
                result = useGameStore.getState().executeHustle(hustle.id, 1, true); // Force success for data gathering
            }

            const stateAfter = useGameStore.getState().pl;
            const bagChange = stateAfter.bag - stateBefore.bag;

            // Find the last action log entry
            const lastAction = stateAfter.actionLog[0];
            const receiptNet = lastAction ? lastAction.netCash : 0;

            const discrepancy = bagChange - receiptNet;

            if (discrepancy !== 0 || stateAfter.bag > 1000000) {
              console.log(`[DATA] Hustle=${hustle.id}, Branch=${branchId}, Iter=${i}`);
              console.log(`      Receipt Net: ${receiptNet}`);
              console.log(`      Actual Change: ${bagChange}`);
              console.log(`      Discrepancy: ${discrepancy}`);
              console.log(`      Final Bag: ${stateAfter.bag}`);
              console.log(`      Stats: Clout=${stateAfter.clout}, Aura=${stateAfter.aura}, MH=${stateAfter.mentalHealth}`);

              // Check passive income in news
              const latestNews = useGameStore.getState().news[0];
              console.log(`      Latest News: ${JSON.stringify(latestNews)}`);
            }

            if (useGameStore.getState().ph === 'POST_MORTEM') {
                console.log(`[DEATH] Unexpected death during ${hustle.id} (${branchId || 'base'}). Cause: ${useGameStore.getState().fatalCause}`);
                console.log(`      Stats at death: Bag=${stateAfter.bag}, Clout=${stateAfter.clout}, Aura=${stateAfter.aura}, MH=${stateAfter.mentalHealth}, Heat=${stateAfter.heat}`);
                store.resetGame(varId, 3, catId, varId);
            }
          }
        });
      });
    });
  });
});
