import { test, expect } from '@playwright/test';

test('verify prologue flow', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://localhost:5173');

  // Screen 1: Cinematic Intro Title is visible
  await expect(page.locator('h1')).toContainText('BAG CHASER');
  await page.screenshot({ path: 'prologue-1-title.png' });

  // Skip Prologue to get to the first chapter intro
  await page.click('button:has-text("Skip Prologue")');
  await expect(page.locator('h2')).toContainText('The First Hustle');
  await page.screenshot({ path: 'prologue-2-first-hustle.png' });
});
