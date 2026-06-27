import { test, expect } from '@playwright/test';

test('verify prologue flow', async ({ page }) => {
  test.setTimeout(120000); // Increase timeout for the whole test
  await page.goto('http://localhost:5173');

  // Screen 1: Title
  await expect(page.locator('h1')).toContainText('BAG CHASER');
  await page.screenshot({ path: 'prologue-1-title.png' });
  await page.click('button:has-text("Find out who you are")');

  // Screen 2: Street Kid Trial
  await expect(page.locator('h2')).toContainText('THE STREET KID');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'prologue-2-street-kid.png' });
  for(let i=0; i<5; i++) {
    await page.locator('div.cursor-pointer').click();
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(16000); // Wait for trial to finish

  // Screen 3: Dropout Trial
  await expect(page.locator('h2')).toContainText('THE DROPOUT');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'prologue-3-dropout.png' });
  await page.waitForTimeout(16000); // Wait for trial to finish

  // Screen 4: Benefactor Trial
  await expect(page.locator('h2')).toContainText('THE BENEFACTOR');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'prologue-4-benefactor.png' });
  await page.waitForTimeout(16000); // Wait for trial to finish

  // Screen 5: Reveal
  await expect(page.locator('text=YOUR DESTINY IS SEALED')).toBeVisible();
  await page.screenshot({ path: 'prologue-5-reveal.png' });
  await page.click('button:has-text("This is me")');

  // Screen 6: Alias
  await expect(page.locator('text=What do they call you?')).toBeVisible();
  const startButton = page.locator('button:has-text("Enter the World")');
  await expect(startButton).toBeDisabled();

  await page.fill('input[placeholder="Enter your alias"]', 'J');
  await expect(startButton).toBeDisabled();

  await page.fill('input[placeholder="Enter your alias"]', '  JD  ');
  await expect(startButton).toBeEnabled();

  await page.screenshot({ path: 'prologue-6-alias.png' });
  await startButton.click();

  // Verify game started
  await expect(page.locator('text=THE RECEIPTS')).toBeVisible();
});
