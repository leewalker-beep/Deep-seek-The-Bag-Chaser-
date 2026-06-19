import { describe, it, expect, vi } from 'vitest';

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

describe('Comprehensive MUD Tier Grinding Diagnostic', () => {
  const categories = [
    { name: 'Street Kid', catId: 'street_kid', varId: 'sk_scrap' },
    { name: 'Dropout', catId: 'dropout', varId: 'dr_vending' },
    { name: 'Benefactor', catId: 'benefactor', varId: 'bn_mining' },
  ];

  const mudHustles = Object.values(HUSTLES).filter(h => h.tier === 'MUD');

  categories.forEach(category => {
    it(`Full Log for ${category.name}`, () => {
      const store = useGameStore.getState();

      console.log(`\n\n=== CATEGORY: ${category.name} ===`);

      mudHustles.forEach(hustle => {
        // Find all branches/levels for this hustle
        const levelsToTest: string[] = [];
        if (hustle.branches) {
            levelsToTest.push(...Object.keys(hustle.branches));
        } else {
            levelsToTest.push('base');
        }

        levelsToTest.forEach(levelId => {
            // Reset for each hustle-level to ensure clean data
            store.resetGame(category.varId, 3, category.catId, category.varId);
            const initialBag = useGameStore.getState().pl.bag;

            console.log(`\n--- Hustle: ${hustle.name} | Level/Branch: ${levelId} ---`);
            console.log(`Initial Bag: $${initialBag.toLocaleString()}`);

            for (let i = 1; i <= 10; i++) {
                const stateBefore = useGameStore.getState().pl;
                if (useGameStore.getState().ph === 'POST_MORTEM') break;

                let result;
                if (hustle.branches && levelId !== 'base') {
                    // We might need to unlock previous branches first, but for diagnostic we'll try direct execution
                    // Note: executeBranch doesn't advance month, so we might need to alternate with executeHustle
                    result = store.executeBranch(hustle.id, levelId);
                    // Force a month advancement to see effects
                    store.executeHustle('r_plasma', 1, true);
                } else {
                    result = store.executeHustle(hustle.id, 1, true);
                }

                const stateAfter = useGameStore.getState().pl;
                const bagChange = stateAfter.bag - stateBefore.bag;

                // Get receipt from action log
                const lastAction = stateAfter.actionLog[0];
                const receiptCash = result.yieldCash || (lastAction ? lastAction.yieldCash : 0);
                const receiptCost = result.cost || (lastAction ? lastAction.cost : 0);
                const receiptNet = receiptCash - receiptCost;

                // Find month advancement news for rent/passives
                const latestNews = useGameStore.getState().news[0];
                const newsStr = typeof latestNews === 'string' ? latestNews : latestNews.text;

                console.log(`Play ${i}:`);
                console.log(`  Receipt: +$${receiptCash} | -$${receiptCost} | Net: $${receiptNet}`);
                console.log(`  Actual Bag Change: $${bagChange}`);
                console.log(`  Discrepancy: $${bagChange - receiptNet}`);
                console.log(`  Latest News: ${newsStr}`);
                console.log(`  Stats: Bag=$${stateAfter.bag}, Clout=${stateAfter.clout}, Aura=${stateAfter.aura}, MH=${stateAfter.mentalHealth}, Heat=${stateAfter.heat}`);

                if (useGameStore.getState().ph === 'POST_MORTEM') {
                    console.log(`  [DEATH] Cause: ${useGameStore.getState().fatalCause}`);
                    break;
                }
            }
        });
      });
    });
  });
});
