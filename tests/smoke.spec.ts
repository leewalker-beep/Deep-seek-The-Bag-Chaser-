import { test, expect } from '@playwright/test';

test.describe('Bag Chaser Performance & Hardening Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Ensure hydration/initial load
    await page.waitForSelector('h1:has-text("BAG CHASER")');
  });

  test('first load and new game flow', async ({ page }) => {
    // Click on "Skip Prologue" button to bypass cinematic transitions
    const skipBtn = page.locator('button:has-text("Skip Prologue")');
    if (await skipBtn.isVisible()) {
        await skipBtn.click();
    }

    // CHAMP name should be visible in the playing state header
    await expect(page.locator('text=CHAMP').first()).toBeVisible();
  });

  test('save and load verification', async ({ page }) => {
    // Start game directly using store state
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPlayerName('SmokeTester');
        store.getState().setPh('PLAYING');
        store.getState().setTutorialSkipped(true);
    });

    await expect(page.locator('text=SmokeTester').first()).toBeVisible();

    // Reload page
    await page.reload();
    await expect(page.locator('text=SmokeTester').first()).toBeVisible();
  });

  test('tier advancement and lazy loading', async ({ page }) => {
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
        store.getState().setTutorialSkipped(true);
        // Give enough stats to advance
        store.getState().updatePl({
            bag: 1000000,
            clout: 1000,
            aura: 1000,
            narrativeFlags: {
                advisor_shown_first_rival: true,
                advisor_shown_first_million: true,
                advisor_shown_dangerous_crime: true,
                advisor_shown_first_business: true,
                advisor_shown_first_passive: true,
                advisor_shown_tier_STREET: true, // Prevent STREET onboarding from popping up immediately as well
                advisor_shown_tier_STARTUP: true,
                advisor_shown_tier_CORPORATE: true,
                advisor_shown_tier_ELITE: true,
                advisor_shown_tier_MOGUL: true,
                advisor_shown_tier_PRESIDENT: true,
                advisor_shown_tier_OPEN: true
            }
        });
        store.getState().setActiveTab('MUD');
    });

    const advanceBtn = page.locator('#advance-tier-button');
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click({ force: true });

    // Should show specialization modal
    await page.waitForSelector('text=Choose your specialization', { timeout: 10000 });
    // Click the first specialization button
    await page.locator('button:has(h3)').first().click();

    await expect(page.locator('text=STREET').first()).toBeVisible();
  });

  test('death and preloading', async ({ page }) => {
     await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
        store.getState().setTutorialSkipped(true);
    });

    // Trigger death
    await page.evaluate(() => {
        (window as any).useGameStore.setState({ ph: 'POST_MORTEM', fatalCause: 'Smoked by Jules', deathBadge: 'DEBUGGER' });
    });

    // Death screen should be visible immediately
    await expect(page.locator('text=Smoked by Jules')).toBeVisible();
  });

  test('presidency and hall of fame lazy loading', async ({ page }) => {
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
        store.getState().setTutorialSkipped(true);
        store.getState().updatePl({
            campaignStage: 8,
            currentTier: 'PRESIDENT'
        });
        store.getState().setActiveTab('PRESIDENCY');
    });

    // Check for Presidency loader or content
    const loader = page.locator('text=Preparing the Situation Room...');
    const dashboard = page.locator('text=CABINET');

    await expect(loader.or(dashboard).first()).toBeVisible();

    // Go to Hall of Fame via state
    await page.evaluate(() => {
        (window as any).useGameStore.setState({ ph: 'POST_MORTEM' });
    });

    // Click through the progressive downfall stages
    await page.click('button:has-text("Read Your Chronicle")');
    await page.click('button:has-text("Claim Your Legacy")');

    // Click "See Ledger & Share Run" to go to summary screen
    await page.click('button:has-text("See Ledger")');

    const summaryContent = page.locator('text=FINAL LEGACY SCORE');
    await expect(summaryContent.first()).toBeVisible();
  });
});
