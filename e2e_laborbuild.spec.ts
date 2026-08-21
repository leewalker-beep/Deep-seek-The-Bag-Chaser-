import { test, expect } from '@playwright/test';

test.describe('Real LaborBuild UI First-Play Reproduction Audit', () => {
  const performanceProfiles = [
    { name: '0 taps (Poor)', taps: 0 },
    { name: '5 taps (Normal)', taps: 5 },
    { name: '25 taps (Excellent)', taps: 25 },
  ];

  // Run 21 repeated real UI first-play runs (7 iterations x 3 profiles)
  const totalIterations = 7;

  for (let iter = 1; iter <= totalIterations; iter++) {
    for (const profile of performanceProfiles) {
      test(`Run ${iter}/7: REAL UI FIRST PLAY -> Building / LaborBuild -> ${profile.name}`, async ({ page, context }) => {
        // Ensure complete context isolation: clear localStorage & sessionStorage
        await context.clearCookies();
        await page.goto('http://localhost:5173');
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 2. Begin Prologue Flow
        const beginButton = page.locator('button', { hasText: 'Begin Journey' });
        if (await beginButton.isVisible()) {
          await beginButton.click();
        }

        // 3. Enter Name
        const nameInput = page.locator('input[placeholder="ENTER NAME / ALIAS"]');
        await nameInput.fill(`BOT_${iter}`);
        await page.click('button:has-text("Confirm Name")');

        // 4. Choose Face
        await page.click('button:has-text("Confirm Face")');

        // 5. Choose Origin (The Dropout - dr_tech)
        await page.click('button:has-text("The Dropout")');
        await page.click('button:has-text("Confirm Origin & Proceed")');

        // 6. Select Starting Conditions
        await page.click('button:has-text("Aggressive Capitalist")');
        await page.click('button:has-text("Confirm Starting Conditions & Proceed")');

        // 7. Skip Cinematic
        const skipCinematic = page.locator('button:has-text("Skip Cinematic")');
        await skipCinematic.waitFor({ state: 'visible', timeout: 10000 });
        await skipCinematic.click();

        // 8. Acknowledge Advisor Briefing
        const ackBriefing = page.locator('button:has-text("Acknowledge Briefing")');
        await ackBriefing.waitFor({ state: 'visible', timeout: 10000 });
        await ackBriefing.click();

        // 9. Enter Month 1
        const enterMonth1 = page.locator('button:has-text("Enter Month 1: Start Game")');
        await enterMonth1.waitFor({ state: 'visible', timeout: 10000 });
        await enterMonth1.click();

        // Dismiss Month 1 Monthly Summary Modal if open
        const monthlySummaryDismiss = page.locator('button:has-text("Continue Operations")');
        if (await monthlySummaryDismiss.isVisible()) {
          await monthlySummaryDismiss.click();
        }

        // Wait for store to be available
        await page.waitForFunction(() => !!(window as any).__gameStore__);

        // 10. CAPTURE & ASSERT ACTUAL FRESH-PLAYER STARTING STATE
        const startingState = await page.evaluate(() => {
          const store = (window as any).__gameStore__.getState();
          const pl = store.pl;
          return {
            bag: pl.bag,
            clout: pl.clout,
            aura: pl.aura,
            mentalHealth: pl.mentalHealth,
            heat: pl.heat,
            currentTier: pl.currentTier,
            buildingLevel: pl.hustleLevels['r_labor'] || 1,
            backgroundId: pl.backgroundId,
            categoryId: pl.categoryId,
            difficulty: store.difficulty,
            ph: store.ph
          };
        });

        // ASSERTIONS FOR FRESH-PLAYER STARTING STATE:
        expect(startingState.mentalHealth).toBe(100);
        expect(startingState.heat).toBe(0);
        expect(startingState.ph).not.toBe('POST_MORTEM');

        // 11. Verify MUD Tier Active & Find Building Card
        await page.waitForSelector('#hustle-card-r_labor');
        const laborCard = page.locator('#hustle-card-r_labor');
        await expect(laborCard).toBeVisible();

        // 12. Click Building Card to open branch choice
        await laborCard.click();

        // 13. Click "#hustle-execute-button"
        const executeBtn = page.locator('#hustle-execute-button');
        await expect(executeBtn).toBeVisible({ timeout: 5000 });

        // Capture before-hustle stats immediately before execute click
        const beforeHustleStats = await page.evaluate(() => {
          const pl = (window as any).__gameStore__.getState().pl;
          return {
            bag: pl.bag,
            clout: pl.clout,
            aura: pl.aura,
            mentalHealth: pl.mentalHealth,
            heat: pl.heat
          };
        });

        await executeBtn.click();

        // 14. Interact with LaborBuild minigame button ("BUILD!!!" or "MAINTAIN")
        const minigameBtn = page.locator('button:has-text("BUILD!!!"), button:has-text("MAINTAIN")');
        await expect(minigameBtn).toBeVisible({ timeout: 10000 });

        // Perform taps
        for (let i = 0; i < profile.taps; i++) {
          await minigameBtn.click({ force: true });
          await page.waitForTimeout(50);
        }

        // 15. WAIT DETERMINISTICALLY FOR MINIGAME UNMOUNT / COMPLETION
        await expect(minigameBtn).not.toBeVisible({ timeout: 15000 });

        // Wait brief moment for month advancement and modal animations
        await page.waitForTimeout(500);

        // Dismiss post-hustle monthly summary modal if visible
        if (await monthlySummaryDismiss.isVisible()) {
          await monthlySummaryDismiss.click();
        }

        // 16. CAPTURE GRANULAR AFTER-HUSTLE STATS & DELTA BREAKDOWN
        const afterHustleData = await page.evaluate(() => {
          const store = (window as any).__gameStore__.getState();
          const pl = store.pl;
          const actionLog = pl.actionLog || [];
          const lastAction = actionLog[0] || {};
          const eventList = pl.events || [];
          const hustleEvent = eventList.find((e: any) => e.type === 'HUSTLE_COMPLETED') || {};
          const meta = hustleEvent.metadata || {};

          return {
            bag: pl.bag,
            clout: pl.clout,
            aura: pl.aura,
            mentalHealth: pl.mentalHealth,
            heat: pl.heat,
            ph: store.ph,
            deathBadge: store.deathBadge,
            fatalCause: store.fatalCause,
            deathContext: pl.deathContext,
            // Granular logged deltas
            directHustleMHDelta: meta.mentalHit !== undefined ? meta.mentalHit : lastAction.mentalHit,
            directHustleHeatDelta: meta.heatHit !== undefined ? meta.heatHit : lastAction.heatHit,
            directHustleYieldCash: meta.profit !== undefined ? meta.profit : lastAction.netCash,
            multiplier: meta.multiplier !== undefined ? meta.multiplier : 1.0,
            success: meta.success !== undefined ? meta.success : true
          };
        });

        // Inspect UI for Post-Mortem / Game Over header
        const postMortemHeader = page.locator('h1:has-text("GAME OVER"), h2:has-text("GAME OVER"), h1:has-text("POST MORTEM")');
        const isDeadUI = await postMortemHeader.isVisible();
        const isDeadStore = afterHustleData.ph === 'POST_MORTEM';
        const isDead = isDeadUI || isDeadStore;

        // Granular MH Transition Chain
        const mhBefore = beforeHustleStats.mentalHealth; // 100
        const directMHDelta = afterHustleData.directHustleMHDelta !== undefined ? afterHustleData.directHustleMHDelta : -12;
        const mhAfterResolution = mhBefore + directMHDelta;
        const finalMH = afterHustleData.mentalHealth;
        const monthEndMHDelta = finalMH - mhAfterResolution;

        // Granular Heat Transition Chain
        const heatBefore = beforeHustleStats.heat; // 0
        const directHeatDelta = afterHustleData.directHustleHeatDelta !== undefined ? afterHustleData.directHustleHeatDelta : 0;
        const heatAfterResolution = heatBefore + directHeatDelta;
        const finalHeat = afterHustleData.heat;
        const monthEndHeatDelta = finalHeat - heatAfterResolution;

        console.log(`\n=== RUN ${iter}/7 [${profile.name}] GRANULAR TRACE ===`);
        console.log(`MH CHAIN:   Before=${mhBefore} -> Direct Delta=${directMHDelta} -> After Res=${mhAfterResolution} -> Month-End Delta=${monthEndMHDelta} -> Final MH=${finalMH}`);
        console.log(`HEAT CHAIN: Before=${heatBefore} -> Direct Delta=${directHeatDelta} -> After Res=${heatAfterResolution} -> Month-End Delta=${monthEndHeatDelta} -> Final Heat=${finalHeat}`);
        console.log(`AURA CHAIN: Before=${beforeHustleStats.aura} -> Aura After=${afterHustleData.aura}`);
        console.log(`CASH CHAIN: Before=$${beforeHustleStats.bag} -> Cash After=$${afterHustleData.bag}`);
        console.log(`RESULT:     Dead?=${isDead} (UI=${isDeadUI}, Store=${isDeadStore})`);

        if (isDead) {
          console.log(`CRITICAL DEATH CONTEXT:`, JSON.stringify({
            fatalCause: afterHustleData.fatalCause,
            deathContext: afterHustleData.deathContext,
            deathBadge: afterHustleData.deathBadge,
            exactPoint: 'Post-hustle month advancement death check'
          }, null, 2));
        }

        // HARD INVARIANTS:
        expect(isDeadUI).toBe(false);
        expect(isDeadStore).toBe(false);
        expect(afterHustleData.ph).not.toBe('POST_MORTEM');
      });
    }
  }
});
