import { test, expect } from '@playwright/test';

test.describe('Bag Chaser Extended Stress & Stability Tests', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for stress tests
    await page.goto('http://localhost:5173');
    await page.waitForSelector('h1:has-text("BAG CHASER")');
  });

  test('scenario: rapid interaction and modal stress', async ({ page }) => {
    // Start game and jump into PLAYING
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
    });

    // Rapidly switch tabs
    const tabs = ['STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'FLEX'];
    for (let i = 0; i < 20; i++) {
        const tab = tabs[i % tabs.length];
        await page.evaluate((t) => (window as any).useGameStore.getState().setActiveTab(t), tab);
    }

    // Rapidly open/close Scoreboard
    for (let i = 0; i < 10; i++) {
        await page.click('button:has-text("Stats")');
        await page.click('button:has-text("Close")');
    }

    // Rapidly open/close Daily Challenges
    for (let i = 0; i < 10; i++) {
        await page.click('button:has-text("Goals")');
        await page.click('button:has-text("Close")');
    }

    // Check memory growth (informational)
    const memory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize);
    console.log(`Memory after rapid interaction: ${memory}`);
  });

  test('scenario: economy extremes and calculation stability', async ({ page }) => {
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
    });

    const testStats = [
        { bag: 0, clout: 0, aura: 0, mentalHealth: 1 },
        { bag: 1e15, clout: 1e6, aura: 1e6, mentalHealth: 100 },
        { bag: 1000, heat: 100, mentalHealth: 100 },
    ];

    for (const stats of testStats) {
        await page.evaluate((s) => (window as any).useGameStore.getState().updatePl(s), stats);
        await page.waitForTimeout(100);
        // Verify UI hasn't crashed
        await expect(page.locator('#bag-amount')).toBeVisible();
    }
  });

  test('scenario: long session simulation (MUD to PRESIDENT)', async ({ page }) => {
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
    });

    const tiers = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT'];

    for (const tier of tiers) {
        console.log(`Simulating advancement to ${tier}...`);
        await page.evaluate((t) => {
            const store = (window as any).useGameStore.getState();
            store.updatePl({
                currentTier: t as any,
                bag: store.pl.bag + 1000000000,
                clout: 5000,
                aura: 5000
            });
            store.setActiveTab(t as any);
        }, tier);

        // Execute some hustles in each tier
        const hustleCards = await page.locator('[id^="hustle-card-"]').all();
        if (hustleCards.length > 0) {
            await hustleCards[0].click();
            // We are now in hustle view, click the execute button (RUN IT / SHIP IT etc)
            // It might be a minigame, so we just force success via state to move fast
            await page.evaluate(() => {
                const store = (window as any).useGameStore;
                const activeHustle = store.getState().activeHustleView;
                if (activeHustle) {
                    store.getState().executeHustle(activeHustle, 1, true);
                }
            });
            // Dismiss reward card
            const dismissBtn = page.locator('button:has-text("Collect Rewards")');
            if (await dismissBtn.isVisible()) {
                await dismissBtn.click();
            }
        }
    }

    // Verify 30 years simulation (360 months)
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        for(let i=0; i<360; i++) {
            // Manually trigger the advance month logic multiple times
            // This is heavy, checking if it causes slowdown
            store.getState().executeHustle('r_sleep', 1, true);
        }
    });

    const finalMonth = await page.evaluate(() => (window as any).useGameStore.getState().pl.month);
    console.log(`Final month after 30 years: ${finalMonth}`);
    expect(finalMonth).toBeGreaterThanOrEqual(360);
  });

  test('scenario: biography and narrative stress', async ({ page }) => {
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        store.getState().resetGame('sk_ghost', 3);
        store.getState().setPh('PLAYING');
    });

    // Inject 200 biography entries
    await page.evaluate(() => {
        const store = (window as any).useGameStore;
        const entries = Array.from({ length: 200 }, (_, i) => `Historical event ${i} in the life of the legend.`);
        store.getState().updatePl({ biography: entries });
    });

    // Save and reload
    await page.evaluate(() => (window as any).useGameStore.persist.rehydrate());

    // Check scoreboard biography tab
    await page.click('button:has-text("Stats")');
    await page.click('button:has-text("Biography")');

    await expect(page.locator('text=Historical event 199')).toBeVisible();
  });

  test('scenario: presidency stress', async ({ page }) => {
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

    // Perform presidency actions
    await expect(page.locator('text=THE OVAL OFFICE')).toBeVisible();

    // Issue some orders if available
    const orderBtn = page.locator('button:has-text("Issue")').first();
    if (await orderBtn.isVisible()) {
        await orderBtn.click();
    }
  });
});
