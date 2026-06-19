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

describe('Final Data Gathering for User', () => {
  const runs = [
    { name: 'Street Kid', catId: 'street_kid', varId: 'sk_scrap' },
    { name: 'Dropout', catId: 'dropout', varId: 'dr_vending' },
    { name: 'Benefactor', catId: 'benefactor', varId: 'bn_mining' },
  ];

  runs.forEach(run => {
    it(`Full Log for ${run.name}`, () => {
      const store = useGameStore.getState();
      store.resetGame(run.varId, 3, run.catId, run.varId);

      console.log(`\n=== DATA LOG: ${run.name} ===`);
      console.log(`Initial Bag: ${store.pl.bag}`);

      // Play 2 hustles
      for (let i = 1; i <= 2; i++) {
        const stateBefore = useGameStore.getState().pl;
        // Use a simple hustle: r_plasma (always succeeds in this test's logic if I force it)
        const result = store.executeHustle('r_plasma', 1, true);
        const stateAfter = useGameStore.getState().pl;

        console.log(`Play ${i}: r_plasma`);
        console.log(`  Receipt: yieldCash=${result.yieldCash}, cost=${result.cost}, net=${result.yieldCash - result.cost}`);
        console.log(`  Bag Change: ${stateAfter.bag - stateBefore.bag}`);
        console.log(`  Current Bag: ${stateAfter.bag}`);
        console.log(`  Mastered Count: ${stateAfter.masteredHustles.length}`);
        console.log(`  Unlocked Achievements: ${stateAfter.unlockedAchievements.length}`);

        if (stateAfter.unlockedAchievements.length > 0) {
            console.log(`  Achievements: ${stateAfter.unlockedAchievements.join(', ')}`);
        }
      }
    });
  });

  it('Death Analysis - Low Mental Health', () => {
      const store = useGameStore.getState();
      store.resetGame('sk_scrap', 3, 'street_kid', 'sk_scrap');
      console.log('\n=== DEATH ANALYSIS: Mental Health Burnout ===');

      // Set MH low
      store.pl.mentalHealth = 10;
      console.log(`Starting MH: ${store.pl.mentalHealth}`);

      // Manual Labor -12 MH
      const result = store.executeBranch('r_labor', 'l1');
      console.log(`Executed r_labor: result success=${result.success}`);

      // Since executeBranch doesn't advance month, we need to call executeHustle or just check MH
      console.log(`MH after labor: ${store.pl.mentalHealth}`);

      // Now call a terminal hustle to trigger month advancement and death check
      store.executeHustle('r_plasma', 1, true);

      console.log(`Phase after hustle: ${store.ph}`);
      console.log(`Fatal Cause: ${store.fatalCause}`);
  });
});
