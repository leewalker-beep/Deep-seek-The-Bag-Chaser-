import { test, expect } from '@playwright/test';

test('verify presidency actions tab and strategic meeting modal', async ({ page }) => {
  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('http://localhost:3000');

  // Set state to President tier
  await page.evaluate(() => {
    const store = (window as any).useGameStore;
    if (store) {
      const state = store.getState();
      state.pl.currentTier = 'PRESIDENT';
      state.pl.presidentMonth = 1;
      state.pl.approvalRating = 65;
      state.pl.gdp = 105;
      state.pl.federalBudget = 50000000;
      state.ph = 'PLAYING';
      state.activeTab = 'PRESIDENCY';
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/dashboard_mobile.png' });

  // Navigate to ACTIONS tab (Page 4)
  // Page titles: THE OVAL (0), TREASURY (1), CABINET (2), CRISES & ORDERS (3), ACTIONS (4)
  for (let i = 0; i < 4; i++) {
    await page.click('button:has-text("NEXT →")');
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: 'verification/actions_tab.png' });

  // Verify action list exists
  await expect(page.locator('text=Presidential Agenda')).toBeVisible();

  // Start an activity (e.g., Budget Negotiations)
  await page.click('text=Budget Negotiations');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verification/modal_briefing.png' });

  // Proceed to choice
  await page.click('text=COMMENCE STRATEGY SESSION →');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verification/modal_choice.png' });

  // Select a choice
  await page.click('text=Growth Stimulus');
  await page.screenshot({ path: 'verification/choice_selected.png' });

  // Execute
  await page.click('text=EXECUTE COMMAND →');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/modal_execution.png' });

  // Wait for results (execution takes about 1.5s in code)
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/modal_results.png' });

  await expect(page.locator('text=Strategic Victory')).toBeVisible();
  await page.click('text=CLOSE BRIEFING');

  // Final check
  await expect(page.locator('text=Presidential Agenda')).toBeVisible();
});
