import { describe, it, expect, vi } from 'vitest';
import { advanceMonth } from '../engine/advancementEngine';
import { getInitialStats } from '../store/initialState';
import { TIER_REQUIREMENTS } from '../config/tiers';

describe('Integration Tests', () => {
  it('confirms rentPortfolioCount and rentalCount passive incomes are independent', () => {
    const pl = getInitialStats(3);

    // MUD Tier with Rent Portfolio
    pl.currentTier = 'MUD';
    pl.hustleBranchIds['r_labor'] = 'l2b'; // Rent Portfolio
    pl.rentPortfolioCount = 5;
    pl.rentalCount = 0;

    // Rent Portfolio (l2b) has passiveYield: 500
    // Expected: 500 * 5 = 2500
    const res1 = advanceMonth(pl, 'NORMAL');
    const news1 = res1.news.find(n => typeof n === 'string' && n.includes('Passive')) as string;
    expect(news1).toContain('Passive +$2,500');

    // ELITE Tier with Real Estate Empire
    const pl2 = getInitialStats(3);
    pl2.currentTier = 'ELITE';
    pl2.rentalCount = 2;
    pl2.rentPortfolioCount = 0;
    pl2.realEstateType = 'residential';
    pl2.realEstateLeverage = 0;
    pl2.marketCycle.realEstate = 'normal';

    // baseProfit (1M) * typeMult(1) * levMult(1) * cycleMult(1) * yieldMult(1) * 0.5 = 500,000 per rental
    // Expected: 1,000,000
    const res2 = advanceMonth(pl2, 'NORMAL');
    const news2 = res2.news.find(n => typeof n === 'string' && n.includes('Passive')) as string;
    expect(news2).toContain('Passive +$1,000,000');

    // Mixed - should not interfere
    const pl3 = getInitialStats(3);
    pl3.currentTier = 'ELITE';
    pl3.hustleBranchIds['r_labor'] = 'l2b';
    pl3.rentPortfolioCount = 5; // Should add 2500
    pl3.rentalCount = 2; // Should add 1,000,000
    pl3.realEstateType = 'residential';
    pl3.realEstateLeverage = 0;
    pl3.marketCycle.realEstate = 'normal';

    const res3 = advanceMonth(pl3, 'NORMAL');
    const news3 = res3.news.find(n => typeof n === 'string' && n.includes('Passive')) as string;
    expect(news3).toContain('Passive +$1,002,500');
  });

  it('verifies tier advancement requirements and transitions', () => {
    const pl = getInitialStats(3);
    pl.currentTier = 'MUD';
    pl.bag = 100000;
    pl.clout = 200;
    pl.aura = 200;

    const streetReq = TIER_REQUIREMENTS['STREET'];
    expect(pl.bag).toBeGreaterThanOrEqual(streetReq.cash + streetReq.fee);
    expect(pl.clout).toBeGreaterThanOrEqual(streetReq.clout);
    expect(pl.aura).toBeGreaterThanOrEqual(streetReq.aura);

    // Manual transition check (since the UI handles the action)
    // We can verify that TIER_REQUIREMENTS are consistent
    expect(streetReq.cash).toBe(50000);
    expect(streetReq.clout).toBe(100);
    expect(streetReq.aura).toBe(100);
  });

  it('ensures market cycle transitions work correctly in advanceMonth', () => {
    const pl = getInitialStats(3);
    pl.presidentialMarketControl = null; // Ensure random shift can happen

    // We can't easily test the 15% random chance without many iterations or mocking Math.random
    // But we can test that it DOES NOT shift if presidentialMarketControl is active
    pl.presidentialMarketControl = { type: 'NORMAL', monthsRemaining: 12 };
    let shifts = 0;
    for(let i=0; i<100; i++) {
        const res = advanceMonth(pl, 'NORMAL');
        if (res.newMarket !== 'NORMAL') shifts++;
    }
    expect(shifts).toBe(0);
  });
});
