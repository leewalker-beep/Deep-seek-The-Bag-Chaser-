import { test, expect } from '@playwright/test';

test.describe('Death Screen Redesign Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('verify Burnout (Mental Health) death screen', async ({ page }) => {
    await page.evaluate(() => {
      const state = {
        pl: {
          runId: 'test-run',
          name: 'Burnout Bob',
          avatarId: 'av_m1',
          bag: 5000,
          clout: 100,
          aura: 100,
          mentalHealth: 0,
          heat: 10,
          month: 12,
          currentTier: 'MUD',
          hustleLevels: { r_labor: 2 },
          hustleBranchIds: { r_labor: 'l2a' },
          masteredHustles: [],
          flexAssets: {},
          unlockedAchievements: [],
          rentalCount: 0,
          rentPortfolioCount: 0,
          flipCount: 0,
          vendingCount: 0,
          passiveLaborYield: 0,
          mentalShieldTurns: 0,
          artists: [],
          grammyCount: 0,
          recordLabelLevel: 1,
          legacyPoints: 0,
          legacyScore: 1500,
          biography: ['Started as a Street Kid.', 'Failed a major house flip.'],
          recordedBioKeys: [],
          lastMajorEvents: [
            { text: 'Failed House Flip', color: 'text-red-400' },
            { text: 'Mental Health fell by 60%', color: 'text-orange-400' },
            { text: 'Rent Due: $200', color: 'text-slate-400' }
          ],
          deathContext: {
            cause: 'Burnout',
            narrative: 'You pushed yourself too hard trying to grow your empire. A failed hustle caused severe Mental Health damage, leaving you unable to continue.',
            statReachedZero: 'MENTAL',
            statValueAtDeath: -10,
            timeline: [
              { label: 'Mental Health', value: '100%' },
              { label: 'House Flip', value: '-60%', color: 'text-red-400' },
              { label: 'MUD Tier Pressure', value: '-50%', color: 'text-red-500' },
              { label: 'Final Mental Health', value: '0%', color: 'text-red-600' }
            ],
            technicalMath: [
              { label: 'Base Hit', multiplier: -15 },
              { label: 'Hustle Level', multiplier: 2.0 },
              { label: 'MUD Tier Factor', multiplier: 1.5 },
              { label: 'Failure', multiplier: 2.0 }
            ],
            recommendations: [
              'Invest in Mental Health recovery earlier.',
              'Avoid upgrading hustles before improving resilience.',
              'Use "Rest & Recover" or "Therapy" to maintain stability.'
            ],
            monthsPlayed: 12,
            tier: 'MUD',
            lastHustleName: 'House Flip'
          },
          collectedDeathBadges: [],
          deathCount: 1,
          tierBadges: [],
          stats: { totalHustles: 10, successfulHustles: 5, lifetimeEarnings: 15000 }
        },
        ph: 'POST_MORTEM',
        activeTab: 'MUD',
        currentMarket: 'NORMAL',
        difficulty: 3,
        isTutorialSkipped: true,
        deathBadge: 'BONE CRUSHER',
        fatalCause: 'Burnout'
      };
      localStorage.setItem('bag-chaser-save', JSON.stringify({ state, version: 0 }));
      window.location.reload();
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'burnout_death.png', fullPage: true });

    // Verify Title (the large one in the middle, not the modal header)
    await expect(page.locator('h2').filter({ hasText: /^Burnout$/i }).nth(1)).toBeVisible();
    // Verify Stat
    await expect(page.locator('text=Stat: MENTAL reached zero')).toBeVisible();
    // Verify Timeline
    await expect(page.locator('span').filter({ hasText: /^House Flip$/i })).toBeVisible();
    // Verify Legacy
    await expect(page.locator('text=+1,500')).toBeVisible();
  });

  test('verify Bankruptcy (Bag) death screen', async ({ page }) => {
    await page.evaluate(() => {
      const state = {
        pl: {
          runId: 'test-run-2',
          name: 'Broke Bill',
          avatarId: 'av_m1',
          bag: -500,
          clout: 50,
          aura: 50,
          mentalHealth: 80,
          heat: 0,
          month: 6,
          currentTier: 'STREET',
          hustleLevels: {},
          hustleBranchIds: {},
          masteredHustles: [],
          flexAssets: {},
          unlockedAchievements: [],
          rentalCount: 0,
          rentPortfolioCount: 0,
          flipCount: 0,
          vendingCount: 0,
          passiveLaborYield: 0,
          mentalShieldTurns: 0,
          artists: [],
          grammyCount: 0,
          recordLabelLevel: 1,
          legacyPoints: 0,
          legacyScore: 500,
          biography: ['Known for being cheap.', 'Died in debt.'],
          recordedBioKeys: [],
          lastMajorEvents: [
            { text: 'Failed Content Creation', color: 'text-red-400' },
            { text: 'Rent Due: $1,000', color: 'text-red-500' }
          ],
          deathContext: {
            cause: 'Bankruptcy',
            narrative: "Your ambition exceeded your bank account. Between Monthly Expenses and monthly expenses, you've run out of cash and credit.",
            statReachedZero: 'BAG',
            statValueAtDeath: -500,
            timeline: [
              { label: 'Cash Balance', value: '$500' },
              { label: 'Monthly Expenses', value: '-$1,000', color: 'text-red-400' },
              { label: 'Final Balance', value: '-$500', color: 'text-red-600' }
            ],
            recommendations: [
              'Build passive income before taking larger risks.',
              'Always keep a buffer for rent and recurring expenses.',
              'Watch out for high-cost upgrades in early tiers.'
            ],
            monthsPlayed: 6,
            tier: 'STREET',
            lastHustleName: 'Monthly Expenses'
          },
          collectedDeathBadges: [],
          deathCount: 1,
          tierBadges: [],
          stats: { totalHustles: 5, successfulHustles: 2, lifetimeEarnings: 5000 }
        },
        ph: 'POST_MORTEM',
        activeTab: 'STREET',
        currentMarket: 'NORMAL',
        difficulty: 3,
        isTutorialSkipped: true,
        deathBadge: 'RATIO\'D',
        fatalCause: 'Bankruptcy'
      };
      localStorage.setItem('bag-chaser-save', JSON.stringify({ state, version: 0 }));
      window.location.reload();
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'bankruptcy_death.png', fullPage: true });

    await expect(page.locator('h2').filter({ hasText: /^Bankruptcy$/i }).nth(1)).toBeVisible();
    await expect(page.locator('text=Stat: BAG reached zero')).toBeVisible();
  });

  test('verify Heat (Arrest) death screen', async ({ page }) => {
    await page.evaluate(() => {
      const state = {
        pl: {
          runId: 'test-run-3',
          name: 'Inmate Ian',
          avatarId: 'av_m1',
          bag: 50000,
          clout: 500,
          aura: 500,
          mentalHealth: 100,
          heat: 100,
          month: 24,
          currentTier: 'CORPORATE',
          hustleLevels: {},
          hustleBranchIds: {},
          masteredHustles: [],
          flexAssets: {},
          unlockedAchievements: [],
          rentalCount: 0,
          rentPortfolioCount: 0,
          flipCount: 0,
          vendingCount: 0,
          passiveLaborYield: 0,
          mentalShieldTurns: 0,
          artists: [],
          grammyCount: 0,
          recordLabelLevel: 1,
          legacyPoints: 0,
          legacyScore: 10000,
          biography: ['The corporate criminal.', 'Finally caught.'],
          recordedBioKeys: [],
          lastMajorEvents: [
            { text: 'Insider Trading Exposed', color: 'text-red-600' },
            { text: 'Heat spiked from Data Monopoly', color: 'text-red-500' }
          ],
          deathContext: {
            cause: 'Heat Caught Up With You',
            narrative: 'You flew too close to the sun. The authorities have finally caught up with your operations.',
            statReachedZero: 'HEAT',
            statValueAtDeath: 100,
            timeline: [
              { label: 'Stat Level', value: 'Low' },
              { label: 'Final Action', value: 'Arrest', color: 'text-red-400' },
              { label: 'Final Status', value: '0', color: 'text-red-600' }
            ],
            recommendations: [
              'Reduce Heat before attempting high-risk jobs.',
              'Use "Ghost Mode" to lower your profile.',
              'Avoid back-to-back high-heat actions.'
            ],
            monthsPlayed: 24,
            tier: 'CORPORATE',
            lastHustleName: 'Arrest'
          },
          collectedDeathBadges: [],
          deathCount: 1,
          tierBadges: [],
          stats: { totalHustles: 50, successfulHustles: 45, lifetimeEarnings: 500000 }
        },
        ph: 'POST_MORTEM',
        activeTab: 'CORPORATE',
        currentMarket: 'NORMAL',
        difficulty: 3,
        isTutorialSkipped: true,
        deathBadge: 'CORPORATE CLONE',
        fatalCause: 'Busted'
      };
      localStorage.setItem('bag-chaser-save', JSON.stringify({ state, version: 0 }));
      window.location.reload();
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'arrest_death.png', fullPage: true });

    await expect(page.locator('h2').filter({ hasText: /^Heat Caught Up With You$/i }).nth(1)).toBeVisible();
  });
});
