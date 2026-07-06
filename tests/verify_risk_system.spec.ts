import { test, expect } from '@playwright/test';

test('verify High Risk Warning modal', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await page.evaluate(() => {
    const state = {
      pl: {
        runId: 'risk-test',
        name: 'Risky Rick',
        avatarId: 'av_m1',
        bag: 100, // Very low bag
        clout: 100,
        aura: 100,
        mentalHealth: 20, // Very low mental
        heat: 90, // Very high heat
        month: 1,
        currentTier: 'MUD',
        hustleLevels: {},
        hustleBranchIds: {},
        masteredHustles: [],
        flexAssets: {},
        unlockedAchievements: [],
        rentalCount: 0,
        rentPortfolioCount: 0,
        flipCount: 0,
        vendingCount: 0,
        passiveLaborYield: 0,
        mentalShieldTurns: 0,
        artists: [],
        grammyCount: 0,
        recordLabelLevel: 1,
        legacyPoints: 0,
        legacyScore: 0,
        biography: [],
        recordedBioKeys: [],
        lastMajorEvents: [],
        collectedDeathBadges: [],
        deathCount: 0,
        tierBadges: [],
        stats: { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 }
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

  await page.waitForTimeout(1000);

  // Try to execute a hustle that should be risky
  // Vending machine does not have a minigame, so it triggers immediately
  await page.locator('[data-testid="hustle-card-r_vending"]').click();
  await page.click('button:has-text("BUY MACHINE")');

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'risk_warning.png' });

  // Verify Modal
  await expect(page.locator('text=EXTREME RISK')).toBeVisible();
  await expect(page.locator('text=Failure would reduce Mental Health below zero')).toBeVisible();
  await expect(page.locator('text=This action will trigger an immediate police raid')).toBeVisible();
});
