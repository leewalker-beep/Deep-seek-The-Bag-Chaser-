import { test, expect } from '@playwright/test';

test('verify MUD hustles have unique minigames', async ({ page }) => {
  await page.goto('http://localhost:3000');

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
        rivals: []
      },
      ph: 'MAIN_GAME',
      activeTab: 'MUD'
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify(state));
    localStorage.setItem('bag-chaser-tutorial-complete', 'true');
    window.location.reload();
  });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'mud_tier_grid.png' });

  const hustles = [
    { name: 'Scrap Metal', minigame: 'MAGNETIC SWEEP' },
    { name: 'Labor & Property', minigame: 'LABOR & PROPERTY' },
    { name: 'Delivery Gigs', minigame: 'DELIVERY GIGS' },
    { name: 'Plasma Donation', minigame: 'PLASMA DONATION' },
    { name: 'Ghost Mode', minigame: 'GHOST MODE' },
    { name: 'Street Eats', minigame: 'STREET EATS' },
  ];

  for (const hustle of hustles) {
    console.log(`Verifying ${hustle.name}...`);
    await page.getByRole('button', { name: hustle.name }).click();
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h2')).toContainText(hustle.minigame);
    await page.screenshot({ path: `minigame_${hustle.name.replace(/\s/g, '_')}.png` });
    await page.reload();
    await page.waitForTimeout(1000);
  }
});
