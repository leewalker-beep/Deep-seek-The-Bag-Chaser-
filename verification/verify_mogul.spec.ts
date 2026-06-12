import { test, expect } from '@playwright/test';

test('verify mogul hustles', async ({ page }) => {
  // Set up MOGUL state
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    const state = {
      state: {
        pl: {
          name: 'Mogul Tester',
          bag: 1000000000,
          clout: 1000,
          aura: 1000,
          mentalHealth: 80,
          heat: 0,
          month: 25,
          currentTier: 'MOGUL',
          hustleLevels: { film_studio: 1, fight_promoter: 1, space_investment: 1, philanthropy_empire: 1 },
          hustleBranchIds: {},
          flexAssets: {},
          unlockedAchievements: [],
          rentalCount: 0,
          flipCount: 0,
          vendingCount: 0,
          passiveLaborYield: 0,
          mentalShieldTurns: 0,
          artists: [],
          grammyCount: 0,
          recordLabelLevel: 1,
          realEstateType: 'residential',
          realEstateLeverage: 0,
          realEstateStrategy: 'hold',
          vcStage: 'seed',
          vcSector: 'tech',
          vcInvestment: 1,
          marketCycle: { realEstate: 'normal', vc: { tech: 'normal', biotech: 'normal', energy: 'normal' } },
          monthsSinceCycleChange: 0,
          dynamicPassives: {},
          legacyPoints: 0,
          rivals: [],
          actionLog: [],
          milestones: [],
          stats: { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 }
        },
        ph: 'PLAYING',
        currentMarket: 'NORMAL',
        unlockedHustles: { film_studio: true, fight_promoter: true, space_investment: true, philanthropy_empire: true },
        activeTab: 'MOGUL',
        difficulty: 3
      },
      version: 0
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify(state));
    window.location.reload();
  });

  // Verify MOGUL tab is active
  await expect(page.locator('button:has-text("MOGUL")')).toHaveClass(/bg-emerald-500/);

  // 1. Film Studio
  console.log('Testing Film Studio...');
  await page.click('text=Film Studio');
  await page.click('button:has-text("ACTION")');
  await page.click('button:has-text("MEDIUM")');
  await page.click('button:has-text("GREENLIGHT MOVIE")');

  // Wait for Reward Card and collect
  await page.waitForSelector('text=COLLECT REWARDS', { timeout: 10000 });
  await page.click('button:has-text("COLLECT REWARDS")');

  // 2. Fight Promoter (ShakeForHype fallback)
  console.log('Testing Fight Promoter...');
  await page.click('text=Fight Promoter');
  await page.waitForSelector('text=FIGHT PROMOTER');
  // Since we are in a headless/desktop env, it should show the slider fallback
  await page.fill('input[type="range"]', '80');
  await page.click('button:has-text("COMPLETE")');
  await page.waitForSelector('text=COLLECT REWARDS');
  await page.click('button:has-text("COLLECT REWARDS")');

  // 3. Space Investment
  console.log('Testing Space Investment...');
  await page.click('text=Space Investment');
  await page.click('text=Asteroid Mining Co.');
  await page.click('button:has-text("INVEST $100M")');
  await page.waitForSelector('text=COLLECT REWARDS');
  await page.click('button:has-text("COLLECT REWARDS")');

  // 4. Philanthropy
  console.log('Testing Philanthropy...');
  await page.click('text=Philanthropy Empire');
  await page.click('text=DONATE $50M → +100 Legacy Points');
  await page.click('button:has-text("MAKE DONATION")');
  await page.waitForSelector('text=COLLECT REWARDS');
  await page.click('button:has-text("COLLECT REWARDS")');

  // Verify Legacy Points
  console.log('Verifying Legacy Points...');
  const legacyPointsText = await page.textContent('body');
  expect(legacyPointsText).toContain('Legacy Points: 100');
});
