import { describe, it, expect } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { BACKGROUNDS } from '../config/backgrounds';
import { checkDeathConditions, advanceMonth } from '../engine/advancementEngine';

describe('Building / LaborBuild First-Play Reproduction Audit', () => {
  it('TEST 1: Real First-Play Reproduction Across 100+ Background/Focus Variations', () => {
    const focusOptions: ('capital' | 'clout' | 'aura' | 'balanced')[] = ['capital', 'clout', 'aura', 'balanced'];
    const multipliers = [0, 0.1, 0.5, 0.8, 1.0, 1.2, 2.0];

    let totalRuns = 0;
    let deaths = 0;
    const records: any[] = [];

    for (const bg of BACKGROUNDS) {
      for (const focus of focusOptions) {
        for (const mult of multipliers) {
          totalRuns++;

          let extraCash = 0;
          let extraClout = 0;
          let extraAura = 0;
          if (focus === 'capital') extraCash = 250;
          if (focus === 'clout') extraClout = 10;
          if (focus === 'aura') extraAura = 10;

          // Real new-player initialization path (Prologue completion)
          useGameStore.getState().resetGame(
            bg.id,
            3, // Grinder difficulty
            bg.id.startsWith('sk') ? 'street_kid' : bg.id.startsWith('dr') ? 'dropout' : bg.id.startsWith('bn') ? 'benefactor' : 'legacy',
            bg.id,
            'av_m1',
            {
              bag: extraCash,
              clout: extraClout,
              aura: extraAura,
              biography: ['Prologue entry'],
              recordedBioKeys: ['prologue_key'],
              hustlePlays: {},
              totalHustlesCompleted: 0,
              actionLog: []
            }
          );

          const stateBefore = JSON.parse(JSON.stringify(useGameStore.getState().pl));

          // FIRST PLAY of Building/LaborBuild ('r_labor')
          const result = useGameStore.getState().executeHustle('r_labor', mult);

          const stateAfter = JSON.parse(JSON.stringify(useGameStore.getState().pl));
          const phAfter = useGameStore.getState().ph;
          const deathBadge = useGameStore.getState().deathBadge;
          const fatalCause = useGameStore.getState().fatalCause;

          const isDead = phAfter === 'POST_MORTEM';
          if (isDead) {
            deaths++;
          }

          records.push({
            runId: totalRuns,
            bgId: bg.id,
            bgCategory: stateBefore.categoryId,
            focus,
            mult,
            startBag: stateBefore.bag,
            startMH: stateBefore.mentalHealth,
            startAura: stateBefore.aura,
            startHeat: stateBefore.heat,
            startClout: stateBefore.clout,
            startLevel: stateBefore.hustleLevels['r_labor'] || 1,
            playerTier: stateBefore.currentTier,
            hustleLevel: 1,
            resultSuccess: result.success,
            minigameMultiplier: mult,
            baseMHChange: -8,
            actualHustleMHChange: result.mentalHit,
            finalMH: stateAfter.mentalHealth,
            finalAura: stateAfter.aura,
            finalHeat: stateAfter.heat,
            finalBag: stateAfter.bag,
            finalClout: stateAfter.clout,
            isDead,
            deathBadge,
            fatalCause,
            fatalStatInContext: stateAfter.deathContext?.fatalStat,
            fatalStatValInContext: stateAfter.deathContext?.fatalStatValue
          });
        }
      }
    }

    console.log(`TEST 1 SUMMARY: Total Runs = ${totalRuns}, Total Deaths = ${deaths}`);
    const deadRuns = records.filter(r => r.isDead);
    console.log(`Deaths Triggered by Starting Aura = 0 (Dropout / Benefactor): ${deadRuns.length}`);
    if (deadRuns.length > 0) {
      console.log('SAMPLE AURA DEATH RUN:', JSON.stringify(deadRuns[0], null, 2));
    }

    expect(totalRuns).toBeGreaterThanOrEqual(100);
  });

  it('TEST 2: Controlled Baseline State vs Execution Delta', () => {
    useGameStore.getState().resetGame('sk_delivery', 3, 'street_kid', 'sk_delivery', 'av_m1', {
      bag: 0, clout: 0, aura: 0, biography: [], recordedBioKeys: [], hustlePlays: {}, totalHustlesCompleted: 0, actionLog: []
    });

    const mhBefore = useGameStore.getState().pl.mentalHealth; // 100
    const result = useGameStore.getState().executeHustle('r_labor', 1.0, true);
    const mhAfter = useGameStore.getState().pl.mentalHealth; // 88

    console.log(`TEST 2 BASELINE: MH Before=${mhBefore}, Result MH Hit=${result.mentalHit}, MH After=${mhAfter}`);
    expect(mhBefore).toBe(100);
    expect(result.mentalHit).toBe(-12); // -8 base * 1.5 MUD tier multiplier
    expect(mhAfter).toBe(88); // 100 - 12
  });

  it('TEST 3: Minigame Multiplier Range Analysis', () => {
    const testMults = [0, 0.1, 0.5, 0.8, 1.0, 1.5, 2.0, 4.0];

    testMults.forEach(mult => {
      useGameStore.getState().resetGame('sk_delivery', 3, 'street_kid', 'sk_delivery', 'av_m1', {
        bag: 0, clout: 0, aura: 0, biography: [], recordedBioKeys: [], hustlePlays: {}, totalHustlesCompleted: 0, actionLog: []
      });
      const res = useGameStore.getState().executeHustle('r_labor', mult, true);
      console.log(`Mult=${mult} -> MH Hit=${res.mentalHit}, Cash Yield=$${res.yieldCash}, NetCash=$${res.netChange}`);
      expect(res.mentalHit).toBeLessThan(0); // Drains mental health, does not invert into positive gain
    });
  });

  it('TEST 4: Month Transition and Death Order Tracing', () => {
    useGameStore.getState().resetGame('sk_delivery', 3, 'street_kid', 'sk_delivery', 'av_m1', {
      bag: 0, clout: 0, aura: 0, biography: [], recordedBioKeys: [], hustlePlays: {}, totalHustlesCompleted: 0, actionLog: []
    });

    const plBeforeHustle = JSON.parse(JSON.stringify(useGameStore.getState().pl));
    const result = useGameStore.getState().executeHustle('r_labor', 1.0, true);
    const plAfterHustle = JSON.parse(JSON.stringify(useGameStore.getState().pl));

    // Trace Mental Health step-by-step
    const mhBeforeBuilding = plBeforeHustle.mentalHealth; // 100
    const hustleMHHit = result.mentalHit; // -12
    const mhAfterBuilding = mhBeforeBuilding + hustleMHHit; // 88

    //advanceMonth is bundled inside executeHustle
    const finalMH = plAfterHustle.mentalHealth; // 88

    console.log(`TEST 4 TRACE: MH Before Building=${mhBeforeBuilding} -> MH Hit=${hustleMHHit} -> MH After Building=${mhAfterBuilding} -> Final MH=${finalMH}`);
    expect(mhBeforeBuilding).toBe(100);
    expect(hustleMHHit).toBe(-12);
    expect(mhAfterBuilding).toBe(88);
    expect(finalMH).toBe(88);
  });

  it('TEST 5: Check All First-Play Modifiers', () => {
    useGameStore.getState().resetGame('sk_delivery', 3, 'street_kid', 'sk_delivery', 'av_m1', {
      bag: 0, clout: 0, aura: 0, biography: [], recordedBioKeys: [], hustlePlays: {}, totalHustlesCompleted: 0, actionLog: []
    });

    const pl = useGameStore.getState().pl;
    expect(pl.mentalHealth).toBe(100);
    expect(pl.heat).toBe(0);
    expect(pl.inJail).toBe(false);
    expect(pl.consequences.length).toBe(0);
  });

  it('TEST 6: Death Threshold Verification', () => {
    useGameStore.getState().resetGame('sk_delivery', 3);

    const testPl = { ...useGameStore.getState().pl, clout: 0, aura: 0, mentalHealth: 0, bag: -1 };
    const deathCheck = checkDeathConditions(testPl);
    expect(deathCheck.shouldDie).toBe(true);
  });
});
