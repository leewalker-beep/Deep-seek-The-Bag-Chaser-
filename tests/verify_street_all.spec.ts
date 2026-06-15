import { test, expect } from '@playwright/test';

test('verify street minigames', async ({ page }) => {
  // Inject state to unlock STREET tier
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    const state = {
      playerStats: {
        rank: 'STREET',
        cash: 1000000,
        clout: 5000,
        aura: 5000,
        mental: 100,
        heat: 0,
        bestRunTier: 'STREET'
      },
      ui: {
        activeTab: 'STREET'
      }
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify(state));
  });

  await page.reload();

  const minigames = [
    { id: 'cc', name: 'content_creation' },
    { id: 'drop', name: 'dropshipping' },
    { id: 'audio', name: 'music_production' },
    { id: 'vintage', name: 'vintage_reselling' },
    { id: 'r_pr_campaign', name: 'pr_campaign' }
  ];

  for (const mg of minigames) {
    console.log(`Verifying ${mg.name}...`);
    // Click the hustle card to start minigame
    await page.click(`[data-hustle-id="${mg.id}"]`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `verification/street_${mg.name}.png` });
    // Go back to grid
    await page.click('text=Back to STREET hustles');
    await page.waitForTimeout(500);
  }
});
