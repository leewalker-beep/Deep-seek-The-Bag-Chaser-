import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Go to the local dev server
  await page.goto('http://localhost:5173/');
  console.log('Navigated to page.');

  // Wait for the "Skip Prologue" button and click it
  try {
    const skipButton = page.locator('button:has-text("Skip Prologue")');
    await skipButton.waitFor({ timeout: 5000 });
    await skipButton.click();
    console.log('Clicked "Skip Prologue".');
  } catch (e) {
    console.log('No "Skip Prologue" button found or timeout, proceeding...');
  }

  // Wait for Character Selection screen and click "Street Kid"
  try {
    const streetKidButton = page.locator('button:has-text("Street Kid")');
    await streetKidButton.waitFor({ timeout: 5000 });
    await streetKidButton.click();
    console.log('Clicked "Street Kid" character.');
  } catch (e) {
    console.log('Street Kid button not found or timeout, trying "GRINDER"...');
    try {
      const grinderButton = page.locator('button:has-text("GRINDER")');
      await grinderButton.waitFor({ timeout: 5000 });
      await grinderButton.click();
      console.log('Clicked "GRINDER".');
    } catch (err) {
      console.log('Alternative character buttons not found, proceeding...');
    }
  }

  // Wait for the "START Month 1" or similar initiation button if any
  try {
    const startButton = page.locator('button:has-text("Start Month 1")');
    if (await startButton.isVisible()) {
      await startButton.click();
      console.log('Clicked "Start Month 1".');
    }
  } catch (e) {
    console.log('No "Start Month 1" button, proceeding...');
  }

  // Wait for some main dashboard element to verify we are loaded
  await page.waitForTimeout(3000);

  // Take a full-page screenshot of the dashboard showing the leaderboard
  await page.screenshot({ path: '/home/jules/verification/verification.png', fullPage: true });
  console.log('Screenshot saved to /home/jules/verification/verification.png');

  await browser.close();
})();
