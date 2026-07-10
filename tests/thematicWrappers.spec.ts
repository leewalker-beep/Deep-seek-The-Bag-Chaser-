import { test, expect } from '@playwright/test';

test('Verify thematic wrappers', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Start game directly using store state
  await page.evaluate(() => {
    const store = (window as any).useGameStore;
    store.getState().resetGame('sk_ghost', 3);
    store.getState().setPlayerName('SmokeTester');
    store.getState().setPh('PLAYING');
    store.getState().setTutorialSkipped(true);
  });

  // Wait for app to load playing dashboard
  await page.waitForSelector('text=Stats', { timeout: 10000 });

  const wrappers = [
    { id: 'FestivalCrowdSurge', name: 'CROWD SURGE' },
    { id: 'CryptoMineRush', name: 'MINING RUSH' },
    { id: 'PodcastFlowState', name: 'FLOW STATE' },
    { id: 'VCPitchRoom', name: 'PITCH ROOM' }
  ];

  for (const wrapper of wrappers) {
    console.log(`Checking ${wrapper.id}...`);
    // Manually trigger the minigame via window.useGameStore if possible
    await page.evaluate((id) => {
      const store = (window as any).useGameStore;
      store.setState({ showMinigame: true }); // or wrapper ID check based on store schema
    }, wrapper.id);

    // Reset state
    await page.evaluate(() => {
      const store = (window as any).useGameStore;
      store.setState({ showMinigame: false });
    });
  }
});
