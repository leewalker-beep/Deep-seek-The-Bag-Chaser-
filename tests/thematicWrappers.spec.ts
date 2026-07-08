import { test, expect } from '@playwright/test';

test('Verify thematic wrappers', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Wait for app to load
  await page.waitForSelector('text=HUSTLE', { timeout: 10000 });

  const wrappers = [
    { id: 'FestivalCrowdSurge', name: 'CROWD SURGE' },
    { id: 'CryptoMineRush', name: 'MINING RUSH' },
    { id: 'DeliveryDash', name: 'DELIVERY DASH' },
    { id: 'PodcastFlowState', name: 'FLOW STATE' },
    { id: 'VCPitchRoom', name: 'PITCH ROOM' }
  ];

  for (const wrapper of wrappers) {
    console.log(`Checking ${wrapper.id}...`);
    // Manually trigger the minigame via window.useGameStore if possible
    await page.evaluate((id) => {
      const store = (window as any).useGameStore.getState();
      store.set({ showMinigame: id });
    }, wrapper.id);

    // Wait for the wrapper to appear
    await page.waitForSelector(`text=${wrapper.name}`, { timeout: 5000 });

    // Take screenshot
    await page.screenshot({ path: `${wrapper.id}.png` });
    console.log(`Saved ${wrapper.id}.png`);

    // Reset state
    await page.evaluate(() => {
      (window as any).useGameStore.getState().set({ showMinigame: null });
    });
  }
});
