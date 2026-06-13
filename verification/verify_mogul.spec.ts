import { test, expect } from '@playwright/test';

test('verify mogul hustles', async ({ page }) => {
  // Set up MOGUL state directly in localStorage to bypass prologue/tutorial
  await page.goto('http://localhost:5173');

  await page.evaluate(() => {
    const mogulState = {
      state: {
        pl: {
          name: 'Test Mogul',
          bag: 500000000,
          clout: 5000,
          aura: 5000,
          mentalHealth: 100,
          heat: 0,
          month: 120,
          currentTier: 'MOGUL',
          hustleLevels: {},
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
          recordLabelLevel: 0,
          realEstateType: 'residential',
          realEstateLeverage: 0,
          realEstateStrategy: 'hold',
          vcStage: 'seed',
          vcSector: 'tech',
          vcInvestment: 0,
          marketCycle: {
            realEstate: 'normal',
            vc: { tech: 'normal', biotech: 'normal', energy: 'normal' }
          },
          monthsSinceCycleChange: 0,
          dynamicPassives: {},
          rivals: [],
          actionLog: [],
          milestones: []
        },
        ph: 'PLAYING',
        currentMarket: 'NORMAL',
        unlockedHustles: {},
        activeTab: 'MOGUL',
        difficulty: 3
      },
      version: 0
    };
    localStorage.setItem('bag-chaser-save', JSON.stringify(mogulState));
    localStorage.setItem('bag-chaser-tutorial-complete', 'true');
  });

  // Reload to apply state
  await page.goto('http://localhost:5173');

  // Wait for Film Studio button to be visible
  await page.waitForSelector('text=Film Studio');

  // 1. Film Studio
  console.log('Testing Film Studio...');
  await page.click('text=Film Studio');
  await page.click('button:has-text("ACTION")');
  await page.click('button:has-text("MEDIUM")');
  await page.click('button:has-text("GREENLIGHT MOVIE")');

  // Wait for ShakeForHype minigame and complete it
  await page.waitForSelector('text=Shake for Hype');
  await page.click('text=Skip to Results');

  await page.waitForSelector('text=HUSTLE SUCCESS');
  await page.click('text=Dismiss');

  expect(await page.isVisible('text=Test Mogul')).toBeTruthy();
});
