import { test, expect } from '@playwright/test';

test('verify mogul hustles', async ({ page }) => {
  // Set up MOGUL state directly in localStorage to bypass prologue/tutorial
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    const state = {
      pl: {
        name: 'Test Player',
        bag: 1000000000,
        clout: 10000,
        aura: 10000,
        mentalHealth: 100,
        heat: 0,
        month: 1,
        currentTier: 'MOGUL',
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
      activeTab: 'MOGUL',
      currentMarket: 'NORMAL',
      difficulty: 3,
      isTutorialSkipped: true
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify({ state, version: 0 }));
  });

  await page.reload();
  await page.waitForTimeout(1000);

  const hustles = [
    { id: 'film_studio', name: 'Film Studio' },
    { id: 'media_empire', name: 'Media Empire' }
  ];

  for (const h of hustles) {
    console.log(`Testing ${h.name}...`);
    const card = page.locator(`[data-testid="hustle-card-${h.id}"]`);
    await card.click();

    // Check if the custom panel or play button is visible
    const executeButton = page.locator('button').filter({ hasText: /^(PLAY|EXECUTE|FILM PRODUCTION|EXPAND MEDIA)$/i }).first();
    await expect(executeButton).toBeVisible();

    // Back to grid
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(500);
  }
});
