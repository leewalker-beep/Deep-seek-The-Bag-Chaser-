import { test, expect } from '@playwright/test';

test.describe('Bag Chaser Performance & Hardening Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Ensure hydration/initial load
    await page.waitForSelector('h1:has-text("BAG CHASER")');
  });

  test('first load and new game flow', async ({ page }) => {
    await page.click('button:has-text("Find out who you are")');
    // Skip through minigames if possible or just wait for them
    // (Assuming existing minigame logic in Prologue)
    await expect(page.locator('h2')).toContainText('THE STREET KID');

    // Check if we can skip tutorial
    const skipBtn = page.locator('button:has-text("SKIP TUTORIAL")');
    if (await skipBtn.isVisible()) {
        await skipBtn.click();
    }
  });

  test('save and load verification', async ({ page }) => {
    // Start game
    await page.click('button:has-text("Find out who you are")');
    await page.waitForTimeout(1000);

    // Manipulate state to set a name and jump into game
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPlayerName('SmokeTester');
        store.getState().setPh('PLAYING');
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
        // Give enough stats to advance
        store.getState().updatePl({
            bag: 1000000,
            clout: 1000,
            aura: 1000
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

    await expect(page.locator('text=STREET')).first().toBeVisible();
  });

  test('death and preloading', async ({ page }) => {
     await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
    });

    // Trigger death
    await page.evaluate(() => {
        (window as any).useGameStore.setState({ ph: 'POST_MORTEM', fatalCause: 'Smoked by Jules', deathBadge: 'DEBUGGER' });
    });

    // Death screen should be visible immediately
    await expect(page.locator('text=BURNED OUT')).toBeVisible();
    await expect(page.locator('text=Smoked by Jules')).toBeVisible();
  });

  test('presidency and hall of fame lazy loading', async ({ page }) => {
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
        store.getState().updatePl({
            campaignStage: 8,
            currentTier: 'PRESIDENT'
        });
        store.getState().setActiveTab('PRESIDENCY');
    });

    // Check for Presidency loader or content
    // Since it's lazy, we might see the loader for a split second
    const loader = page.locator('text=Preparing the Situation Room...');
    const dashboard = page.locator('text=CABINET');

    await expect(loader.or(dashboard).first()).toBeVisible();

    // Go to Hall of Fame via state
    await page.evaluate(() => {
        (window as any).useGameStore.setState({ ph: 'POST_MORTEM' });
    });
    await page.click('button:has-text("SEE THE LEDGER")');

    const hofLoader = page.locator('text=Reading the History Books...');
    const hofContent = page.locator('text=HALL OF FAME');
    await expect(hofLoader.or(hofContent).first()).toBeVisible();
  });
});
