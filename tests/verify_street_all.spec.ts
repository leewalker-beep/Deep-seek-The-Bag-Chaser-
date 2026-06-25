import { test, expect } from '@playwright/test';

test('verify street minigames', async ({ page }) => {
  await page.goto('http://localhost:5173');
  page.on('console', msg => console.log('BROWSER LOG:', msg.text())); await page.evaluate(() => {
    const state = {
      pl: {
        name: 'Test Player',
        bag: 1000000,
        clout: 5000,
        aura: 5000,
        mentalHealth: 100,
        heat: 0,
        month: 1,
        currentTier: 'STREET',
        hustleLevels: {},
        hustleBranchIds: {},
        masteredHustles: [],
        rivals: [],
        flexAssets: {},
        activeChallenges: [],
        events: [],
        stats: { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 },
        tierBadges: [],
        tierStats: {},
        specializationHistory: [],
        crushedRivals: [],
        artists: [],
        vendingCount: 0,
        flipCount: 0,
        rentPortfolioCount: 0,
        dailyChallenges: []
      },
      ph: 'PLAYING',
      activeTab: 'STREET',
      currentMarket: 'NORMAL',
      difficulty: 3,
      isTutorialSkipped: true,
      tutorialStep: 5,
      unlockedHustles: { 'cc': true, 'drop': true, 'audio': true, 'vintage': true, 'r_pr_campaign': true }
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify({ state, version: 0 })); console.log('SET LOCALSTORAGE'); console.log('SET LOCALSTORAGE');
  });

  await page.reload();
  await page.waitForTimeout(1000);

  const minigames = [
    { id: 'cc', name: 'Content Creation' },
    { id: 'drop', name: 'Dropshipping' },
    { id: 'audio', name: 'Music Production' },
    { id: 'vintage', name: 'Vintage Reselling' },
    { id: 'r_pr_campaign', name: 'PR Campaign' }
  ];

  for (const mg of minigames) {
    console.log(`Verifying ${mg.name}...`);
    const card = page.locator(`[data-testid="hustle-card-${mg.id}"]`);
    await page.screenshot({ path: 'debug_card.png' });
    await card.click();

    await page.waitForTimeout(500);

    // Find the execute/play button inside the card or view
    const playButton = page.locator('button').filter({ hasText: /^(PLAY|EXECUTE|START|RECORD|LAUNCH|DROP|CAMPAIGN|PRODUCE TRACK)$/i }).first();

    if (await playButton.isVisible()) {
        await playButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `verification/street_${mg.id}.png` });

        // Return to main view
        await page.goto('http://localhost:5173');
        await page.locator('[data-testid="nav-tab-street"]').click();
        await page.waitForTimeout(500);
    } else {
        console.warn(`Play button not found for ${mg.name}`);
        await page.screenshot({ path: `verification/street_${mg.id}_failed.png` });
        await page.goto('http://localhost:5173');
        await page.locator('[data-testid="nav-tab-street"]').click();
    }
  }
});
