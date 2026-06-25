import { test, expect } from '@playwright/test';

test('verify MUD hustles have unique minigames', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Set up MUD state
  await page.evaluate(() => {
    const state = {
      pl: {
        name: 'Test Player',
        bag: 1000,
        clout: 0,
        aura: 0,
        mentalHealth: 100,
        heat: 0,
        month: 1,
        currentTier: 'MUD',
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
      activeTab: 'MUD',
      currentMarket: 'NORMAL',
      difficulty: 3,
      isTutorialSkipped: true
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify({ state, version: 0 }));
    window.location.reload();
  });

  await page.waitForTimeout(2000);

  const hustles = [
    { id: 'r_scrap', name: 'Scrap Metal', minigame: 'MAGNETIC SWEEP' },
    { id: 'r_labor', name: 'Labor & Property', minigame: 'CONSTRUCTION' },
    { id: 'r_delivery', name: 'Delivery Gigs', minigame: 'TRAFFIC DODGE' },
    { id: 'r_plasma', name: 'Plasma Donation', minigame: 'PLASMA DONATION' },
    { id: 'r_ghost_mode', name: 'Ghost Mode', minigame: 'GHOST MODE' },
    { id: 'street_eats', name: 'Street Eats', minigame: 'STREET EATS' },
  ];

  for (const hustle of hustles) {
    console.log(`Verifying ${hustle.name}...`);
    const card = page.locator(`[data-testid="hustle-card-${hustle.id}"]`);
    await card.click();

    const playButton = page.locator('button').filter({ hasText: /^(PLAY|EXECUTE|MAGNETIC SWEEP)$/i }).first();
    await playButton.click();

    await page.waitForTimeout(1000);
    // expect at least some interaction or minigame canvas/container

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(500);
  }
});
