import { test, expect } from '@playwright/test';

test('Verify President Mode transition', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Inject state and mark tutorial as complete
  await page.evaluate(() => {
    localStorage.setItem('bag-chaser-tutorial-complete', 'true');
    const store = (window as any).useGameStore.getState();
    (window as any).useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...store.pl,
        campaignStage: 8,
        currentTier: 'PRESIDENT',
        bag: 100000000,
        clout: 5000,
        aura: 5000,
        approvalRating: 75,
        presidentMonth: 12,
        isSecondTerm: false,
        cabinet: {},
        activeCrises: [],
        dynamicPassives: {},
        name: 'Test President'
      },
      activeTab: 'PRESIDENCY'
    });
  });

  // Reload to apply localStorage if necessary, or just rely on state injection
  await page.reload();

  await page.evaluate(() => {
    const store = (window as any).useGameStore.getState();
    (window as any).useGameStore.setState({
      ph: 'PLAYING',
      pl: {
        ...store.pl,
        campaignStage: 8,
        currentTier: 'PRESIDENT',
        bag: 100000000,
        clout: 5000,
        aura: 5000,
        approvalRating: 75,
        presidentMonth: 12,
        isSecondTerm: false,
        cabinet: {},
        activeCrises: [],
        dynamicPassives: {},
        name: 'Test President'
      },
      activeTab: 'PRESIDENCY'
    });
  });

  // Verify "PRESIDENCY" tab appears
  const presidencyTab = page.locator('button:has-text("PRESIDENCY")');
  await expect(presidencyTab).toBeVisible();

  // Verify Dashboard is visible
  await expect(page.locator('h1:has-text("THE OVAL OFFICE")')).toBeVisible();

  // Capture screenshot
  await page.screenshot({ path: 'presidency_verified_clear.png' });
});
