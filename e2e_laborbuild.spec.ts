import { test, expect } from '@playwright/test';

test.describe('Real LaborBuild UI First-Play Reproduction Audit', () => {
  const performanceProfiles = [
    { name: 'Poor Performance (0 taps)', taps: 0 },
    { name: 'Normal Performance (5 taps)', taps: 5 },
    { name: 'Excellent Performance (25 taps)', taps: 25 },
  ];

  for (const profile of performanceProfiles) {
    test(`REAL NEW GAME FLOW -> Building / LaborBuild -> ${profile.name}`, async ({ page }) => {
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

      // 5. Choose Origin (The Dropout - zero starter aura)
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

      // 10. Verify MUD Tier Active & Find Building / Labor & Property Hustle Card
      await page.waitForSelector('#hustle-card-r_labor');
      const laborCard = page.locator('#hustle-card-r_labor');
      await expect(laborCard).toBeVisible();

      // 11. Click Building Card to open hustle view / branch choice
      await laborCard.click();

      // 12. Click "#hustle-execute-button"
      const executeBtn = page.locator('#hustle-execute-button');
      await expect(executeBtn).toBeVisible({ timeout: 5000 });
      await executeBtn.click();

      // 13. Interact with LaborBuild minigame button ("BUILD!!!" or "MAINTAIN")
      const minigameBtn = page.locator('button:has-text("BUILD!!!"), button:has-text("MAINTAIN")');
      await expect(minigameBtn).toBeVisible({ timeout: 10000 });

      // Perform taps according to performance profile
      for (let i = 0; i < profile.taps; i++) {
        await minigameBtn.click({ force: true });
        await page.waitForTimeout(80);
      }

      // Wait for minigame timer (5.0s) to expire and trigger completion
      await page.waitForTimeout(7000);

      // Dismiss post-hustle monthly summary modal if visible
      if (await monthlySummaryDismiss.isVisible()) {
        await monthlySummaryDismiss.click();
      }

      // 14. Observe outcome & player state after minigame + month transition
      const postMortemHeader = page.locator('h1:has-text("GAME OVER"), h2:has-text("GAME OVER"), h1:has-text("POST MORTEM")');
      const isDead = await postMortemHeader.isVisible();

      console.log(`E2E PROFILE [${profile.name}]: Is Post-Mortem / Dead = ${isDead}`);
      expect(isDead).toBe(false);
    });
  }
});
