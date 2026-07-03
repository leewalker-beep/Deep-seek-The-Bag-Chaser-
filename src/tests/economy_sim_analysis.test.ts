import { describe, it } from 'vitest';
import { getInitialStats } from '../store/initialState';
import { advanceMonth } from '../engine/advancementEngine';
import { PROGRESSION_ORDER } from '../config/tiers';

describe('Economy Simulation', () => {
  it('Simulates monthly cashflow at each tier', () => {
    console.log('Tier | Rent | Typical Passive | Net Monthly Change');
    console.log('--- | --- | --- | ---');

    PROGRESSION_ORDER.forEach(tier => {
      const pl = getInitialStats(3, 'street_kid');
      pl.currentTier = tier as any;
      pl.isTutorialSkipped = true;
      pl.tutorialStep = 10;

      // Simulate typical passive income for the tier
      // MUD: 1-2 vending machines (~300)
      // STREET: Podcast/CC (~1500)
      // STARTUP: Runner Fleet/SaaS (~10000)
      // CORPORATE: Global Franchise/Data (~100k)
      // ELITE: Real Estate/Hedge Fund (~1M)
      // MOGUL: Media Empire (~5M)
      // PRESIDENT: Data Monopoly (~300M)

      let typicalPassive = 0;
      if (tier === 'MUD') typicalPassive = 300;
      if (tier === 'STREET') typicalPassive = 2000;
      if (tier === 'STARTUP') typicalPassive = 15000;
      if (tier === 'CORPORATE') typicalPassive = 100000;
      if (tier === 'ELITE') typicalPassive = 1000000;
      if (tier === 'MOGUL') typicalPassive = 10000000;
      if (tier === 'PRESIDENT') typicalPassive = 300000000;

      pl.dynamicPassives = { 'typical': typicalPassive };

      const result = advanceMonth(pl, 'NORMAL');
      const rent = result.totalRent;
      const net = result.passiveIncome - rent;

      console.log(`${tier} | ${rent} | ${result.passiveIncome} | ${net}`);
    });
  });

  it('Analyzes Jail Drain vs Passive Income', () => {
     console.log('\nJail Analysis:');
     console.log('Tier | Jail Monthly Loss | Net Change (with typical passive)');

     PROGRESSION_ORDER.forEach(tier => {
        if (tier === 'OPEN') return;
        const pl = getInitialStats(3, 'street_kid');
        pl.currentTier = tier as any;
        pl.inJail = true;
        pl.jailMonthsRemaining = 12;
        pl.isTutorialSkipped = true;
        pl.tutorialStep = 10;

        let typicalPassive = 0;
        if (tier === 'MUD') typicalPassive = 300;
        if (tier === 'STREET') typicalPassive = 2000;
        if (tier === 'STARTUP') typicalPassive = 15000;
        if (tier === 'CORPORATE') typicalPassive = 100000;
        if (tier === 'ELITE') typicalPassive = 1000000;
        if (tier === 'MOGUL') typicalPassive = 10000000;
        if (tier === 'PRESIDENT') typicalPassive = 300000000;

        pl.dynamicPassives = { 'typical': typicalPassive };
        pl.bag = 1000000000; // Large bag to see drain

        const initialBag = pl.bag;
        const result = advanceMonth(pl, 'NORMAL');
        const net = result.newPl.bag - initialBag;

        // Find sentence loss
        // Need to calculate it manually or just look at net since we know rent and passive
        console.log(`${tier} | ??? | ${net}`);
     });
  });
});
