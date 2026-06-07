import type { PlayerStats, MarketType } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { PROGRESSION_ORDER } from '../config/tiers';

export interface AdvancementResult {
  newPl: PlayerStats;
  newMarket: MarketType;
  news: string[];
  shouldDie: boolean;
  deathCause: string | null;
}

export function advanceMonth(
  pl: PlayerStats,
  currentMarket: MarketType
): AdvancementResult {
  const news: string[] = [];
  const newPl = { ...pl };
  let newMarket = currentMarket;

  // Calculate rent based on tier
  let rent = 500;
  const tierIndex = PROGRESSION_ORDER.indexOf(newPl.currentTier);

  if (tierIndex >= 1) rent = 1200;   // STREET
  if (tierIndex >= 2) rent = 3500;   // STARTUP
  if (tierIndex >= 3) rent = 10000;  // CORPORATE
  if (tierIndex >= 4) rent = 25000;  // ELITE
  if (tierIndex >= 5) rent = 50000;  // MOGUL
  if (tierIndex >= 6) rent = 100000; // PRESIDENT
  if (tierIndex >= 7) rent = 0;      // OPEN

  const marketMult = MARKET_CONFIGS[currentMarket].expenseMultiplier;
  const totalRent = rent * marketMult;

  // Calculate passive income from flex assets and labor empire
  let passiveIncome = newPl.passiveLaborYield || 0;
  FLEX_ASSETS.forEach(asset => {
    const count = newPl.flexAssets[asset.id] || 0;
    passiveIncome += asset.passiveYield * count;
  });

  // Apply financial changes
  newPl.bag = newPl.bag + passiveIncome - totalRent;
  newPl.month += 1;

  // Decay heat (cool down over time)
  newPl.heat = Math.max(0, newPl.heat - 10);

  // Random market shift (15% chance)
  if (Math.random() < 0.15) {
    const markets: MarketType[] = ['NORMAL', 'RECESSION', 'BULL_MARKET', 'CRACKDOWN'];
    const newMarketType = markets[Math.floor(Math.random() * markets.length)];
    if (newMarketType !== currentMarket) {
      newMarket = newMarketType;
      news.unshift(`🌍 ECONOMIC SHIFT: ${MARKET_CONFIGS[newMarket].name} - ${MARKET_CONFIGS[newMarket].description}`);
    }
  }

  // Add monthly summary to news
  const netChange = passiveIncome - totalRent;
  news.unshift(`📅 Month ${newPl.month}: Rent -$${totalRent.toLocaleString()} | Passive +$${passiveIncome.toLocaleString()} | Net: ${netChange >= 0 ? '+' : ''}$${netChange.toLocaleString()}`);

  // Check for death conditions
  let shouldDie = false;
  let deathCause: string | null = null;

  if (newPl.bag < 0) {
    shouldDie = true;
    deathCause = 'Bankruptcy: You ran out of money and the creditors came for everything.';
  } else if (newPl.mentalHealth <= 0) {
    shouldDie = true;
    deathCause = 'Burnout: Your mind and body collapsed under the pressure.';
  } else if (newPl.aura <= 0) {
    shouldDie = true;
    deathCause = 'Canceled: Your reputation is destroyed. No one will work with you.';
  } else if (newPl.clout <= 0) {
    shouldDie = true;
    deathCause = 'Irrelevant: The world has moved on without you.';
  }

  return { newPl, newMarket, news, shouldDie, deathCause };
}
