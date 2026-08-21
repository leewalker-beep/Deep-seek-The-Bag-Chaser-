import { describe, it, expect } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { BACKGROUNDS } from '../config/backgrounds';
import { checkDeathConditions } from '../engine/advancementEngine';

describe('Building / LaborBuild First-Play Reproduction Audit', () => {
  it('TEST 1: Real First-Play Reproduction Across 100+ Background/Focus Variations', () => {
    const focusOptions: ('capital' | 'clout' | 'aura' | 'balanced')[] = ['capital', 'clout', 'aura', 'balanced'];
    const multipliers = [0, 0.1, 0.5, 0.8, 1.0, 1.2, 2.0];

    let totalRuns = 0;
    let deaths = 0;
    const deathRecords: any[] = [];
    const causeCounts: Record<string, number> = {};

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

          // Real new-player initialization path
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

          // Capture actual initial stats
          const startingBag = stateBefore.bag;
          const startingMH = stateBefore.mentalHealth;
          const startingAura = stateBefore.aura;
          const startingHeat = stateBefore.heat;
          const startingClout = stateBefore.clout;
          const startingLevel = stateBefore.hustleLevels['r_labor'] || 1;
          const playerTier = stateBefore.currentTier;
          const originBackground = bg.id;

          // FIRST PLAY of Building/LaborBuild ('r_labor')
          const result = useGameStore.getState().executeHustle('r_labor', mult);

          const stateAfter = JSON.parse(JSON.stringify(useGameStore.getState().pl));
          const phAfter = useGameStore.getState().ph;
          const deathBadge = useGameStore.getState().deathBadge;
          const fatalCause = useGameStore.getState().fatalCause;

          const isDead = phAfter === 'POST_MORTEM';

          // Delta Ledger Calculations
          const buildingMHDelta = result.mentalHit;
          const mhAfterHustle = startingMH + buildingMHDelta;
          const monthEndMHDelta = stateAfter.mentalHealth - mhAfterHustle;
          const finalMH = stateAfter.mentalHealth;

          if (isDead) {
            deaths++;
            const fatalStat = stateAfter.deathContext?.fatalStat || 'unknown';
            causeCounts[fatalStat] = (causeCounts[fatalStat] || 0) + 1;

            deathRecords.push({
              runId: totalRuns,
              originBackground,
              focus,
              minigameMultiplier: mult,
              minigameResult: result.success ? 'SUCCESS' : 'FAILED',
              startingBag,
              startingMH,
              startingAura,
              startingHeat,
              startingClout,
              startingLevel,
              playerTier,
              hustleLevel: 1,
              baseMHChange: -8,
              allMHModifiers: 'MUD Tier Multiplier (1.5x)',
              buildingMHDelta,
              mhAfterHustle,
              monthEndMHDelta,
              finalMH,
              finalHeat: stateAfter.heat,
              finalAura: stateAfter.aura,
              finalClout: stateAfter.clout,
              finalBag: stateAfter.bag,
              isDead,
              exactFatalCondition: `fatalStat: ${fatalStat}, fatalStatValue: ${stateAfter.deathContext?.fatalStatValue}`,
              fatalCause,
              deathContext: stateAfter.deathContext,
              lastActionExecuted: stateAfter.lastExecutedHustleId || 'r_labor'
            });
          }
        }
      }
    }

    console.log(`TEST 1 SUMMARY: Total Runs = ${totalRuns}, Total Deaths = ${deaths}`);
    console.log(`Death Causes Breakdown:`, causeCounts);

    if (deaths > 0) {
      console.log(`\n=== ALL FIRST-PLAY DEATH RECORDS (${deaths}) ===`);
      deathRecords.forEach((record, index) => {
        console.log(`\n--- DEATH RECORD #${index + 1} ---`);
        console.log(JSON.stringify(record, null, 2));
      });
    }

    // Explicit assertion: A fresh player must NOT die from first Building play
    expect(deaths).toBe(0);
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

  it('TEST 4: Month Transition and MH Delta Ledger Tracing', () => {
    useGameStore.getState().resetGame('sk_delivery', 3, 'street_kid', 'sk_delivery', 'av_m1', {
      bag: 0, clout: 0, aura: 0, biography: [], recordedBioKeys: [], hustlePlays: {}, totalHustlesCompleted: 0, actionLog: []
    });

    const plBeforeHustle = JSON.parse(JSON.stringify(useGameStore.getState().pl));
    const result = useGameStore.getState().executeHustle('r_labor', 1.0, true);
    const plAfterHustle = JSON.parse(JSON.stringify(useGameStore.getState().pl));

    // Full Delta Ledger:
    // MH Before Building (100)
    // + Building MH Delta (-12)
    // + Active Modifier Delta (0)
    // + Month Transition Delta (0)
    // + Sleep/Rest/Recovery Delta (0)
    // + Narrative Delta (0)
    // + Rival Delta (0)
    // = Final MH (88)

    const mhBeforeBuilding = plBeforeHustle.mentalHealth; // 100
    const buildingMHDelta = result.mentalHit; // -12
    const mhAfterBuilding = mhBeforeBuilding + buildingMHDelta; // 88
    const monthTransitionMHDelta = plAfterHustle.mentalHealth - mhAfterBuilding; // 0
    const finalMH = plAfterHustle.mentalHealth; // 88

    console.log(`TEST 4 DELTA LEDGER:`);
    console.log(`  MH Before Building: ${mhBeforeBuilding}`);
    console.log(`  Building MH Delta:   ${buildingMHDelta}`);
    console.log(`  MH After Building:   ${mhAfterBuilding}`);
    console.log(`  Month-End MH Delta:  ${monthTransitionMHDelta}`);
    console.log(`  Final MH:            ${finalMH}`);

    expect(mhBeforeBuilding).toBe(100);
    expect(buildingMHDelta).toBe(-12);
    expect(mhAfterBuilding).toBe(88);
    expect(monthTransitionMHDelta).toBe(0);
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

  it('TEST 6: Full Death Path Verification (Low MH Burnout)', () => {
    // 1. Fresh player first play with prologueStats -> remains alive
    useGameStore.getState().resetGame('sk_delivery', 3, 'street_kid', 'sk_delivery', 'av_m1', {
      bag: 0, clout: 0, aura: 0, biography: [], recordedBioKeys: [], hustlePlays: {}, totalHustlesCompleted: 0, actionLog: []
    });
    expect(useGameStore.getState().ph).toBe('PLAYING');

    useGameStore.getState().executeHustle('r_labor', 1.0, true);
    expect(useGameStore.getState().ph).toBe('PLAYING');
    expect(useGameStore.getState().pl.mentalHealth).toBe(88);

    // 2. Deliberately reduce Mental Health to threshold (e.g. MH = 5)
    useGameStore.setState(state => ({
      pl: { ...state.pl, mentalHealth: 5 }
    }));

    // Execute Building when MH is already low -> triggers burnout death
    useGameStore.getState().executeHustle('r_labor', 1.0, true);

    const endState = useGameStore.getState();
    expect(endState.ph).toBe('POST_MORTEM');
    expect(endState.deathBadge).toBe('BONE CRUSHER');
    expect(endState.pl.deathContext?.fatalStat).toBe('mental');
    console.log(`TEST 6 VERIFICATION: Low MH player correctly died of burnout. Fatal stat = ${endState.pl.deathContext?.fatalStat}`);
  });
});
