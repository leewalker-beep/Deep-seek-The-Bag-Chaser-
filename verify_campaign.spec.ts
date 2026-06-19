import { test, expect } from '@playwright/test';

test('verify campaign minigames', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for the app to load and clear overlays
  await page.evaluate(() => {
    const store = (window as any).gameStore;
    if (store) {
      store.setState({
        currentTier: 'PRESIDENCY',
        isPresidentialCampaign: true,
        campaignStage: 5,
        showPrologue: false,
        showTutorial: false,
        pl: {
          ...store.getState().pl,
          bag: 1000000000,
          clout: 1000000,
          aura: 1000000
        }
      });
    }
  });

  await page.waitForTimeout(1000);

  // Check if Campaign Panel is visible
  await expect(page.locator('text=PRESIDENTIAL CAMPAIGN')).toBeVisible();

  // Look for "Swing State Sweep" or "Persuade Voters"
  await expect(page.locator('text=Swing State Sweep')).toBeVisible();
  await page.screenshot({ path: 'campaign_panel.png' });

  // Click on "Swing State Sweep"
  await page.click('text=Swing State Sweep');
  await page.waitForTimeout(500);

  // Verify minigame wrapper
  await expect(page.locator('text=SWING STATE SWEEP')).toBeVisible();
  await expect(page.locator('text=DRAG TO COLLECT ELECTORAL VOTES')).toBeVisible();
  await page.screenshot({ path: 'swing_state_minigame.png' });
});
