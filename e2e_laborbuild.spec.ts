import { test, expect } from '@playwright/test';

test.describe('Real LaborBuild UI First-Play Reproduction Audit', () => {
  const performanceProfiles = [
    { name: '0 taps (Poor)', taps: 0 },
    { name: '5 taps (Normal)', taps: 5 },
    { name: '25 taps (Excellent)', taps: 25 },
  ];

  for (const profile of performanceProfiles) {
    test(`REAL UI FIRST PLAY -> Building / LaborBuild -> ${profile.name}`, async ({ page }) => {
      // 1. Navigate to root application
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');

      // 2. Begin Prologue Flow
      const beginButton = page.locator('button', { hasText: 'Begin Journey' });
      if (await beginButton.isVisible()) {
        await beginButton.click();
      }

      // 3. Enter Name
      const nameInput = page.locator('input[placeholder="ENTER NAME / ALIAS"]');
      await nameInput.fill('AUDIT_BOT');
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

      // 10. CAPTURE & CONFIRM ACTUAL STARTING PLAYER STATE
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

      console.log(`\n=== ACTUAL STARTING PLAYER STATE (${profile.name}) ===`);
      console.log(JSON.stringify(startingState, null, 2));

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
        await page.waitForTimeout(80);
      }

      // 15. WAIT DETERMINISTICALLY FOR MINIGAME UNMOUNT / COMPLETION
      await expect(minigameBtn).not.toBeVisible({ timeout: 15000 });

      // Wait brief moment for month advancement and modal animations
      await page.waitForTimeout(1000);

      // Dismiss post-hustle monthly summary modal if visible
      if (await monthlySummaryDismiss.isVisible()) {
        await monthlySummaryDismiss.click();
      }

      // 16. CAPTURE AFTER-HUSTLE STATS & PHASE
      const afterHustleStats = await page.evaluate(() => {
        const store = (window as any).__gameStore__.getState();
        const pl = store.pl;
        return {
          bag: pl.bag,
          clout: pl.clout,
          aura: pl.aura,
          mentalHealth: pl.mentalHealth,
          heat: pl.heat,
          ph: store.ph,
          deathBadge: store.deathBadge,
          fatalCause: store.fatalCause,
          deathContext: pl.deathContext
        };
      });

      // Inspect UI for Post-Mortem / Game Over header
      const postMortemHeader = page.locator('h1:has-text("GAME OVER"), h2:has-text("GAME OVER"), h1:has-text("POST MORTEM")');
      const isDeadUI = await postMortemHeader.isVisible();
      const isDeadStore = afterHustleStats.ph === 'POST_MORTEM';
      const isDead = isDeadUI || isDeadStore;

      console.log(`\n=== BEFORE vs AFTER STATS (${profile.name}) ===`);
      console.log(`MH:    ${beforeHustleStats.mentalHealth} -> ${afterHustleStats.mentalHealth}`);
      console.log(`HEAT:  ${beforeHustleStats.heat} -> ${afterHustleStats.heat}`);
      console.log(`AURA:  ${beforeHustleStats.aura} -> ${afterHustleStats.aura}`);
      console.log(`CLOUT: ${beforeHustleStats.clout} -> ${afterHustleStats.clout}`);
      console.log(`BAG:   $${beforeHustleStats.bag} -> $${afterHustleStats.bag}`);
      console.log(`DEAD?: ${isDead} (UI=${isDeadUI}, Store=${isDeadStore})`);

      if (isDead) {
        console.log(`DEATH CONTEXT:`, JSON.stringify(afterHustleStats.deathContext, null, 2));
      }

      // HARD INVARIANTS:
      expect(isDeadUI).toBe(false);
      expect(isDeadStore).toBe(false);
      expect(afterHustleStats.ph).not.toBe('POST_MORTEM');
    });
  }
});
