import type { PlayerStats, MarketType, Tier } from '../types/game';
import { FLEX_ASSETS } from '../config/flexAssets';
import { MARKET_CONFIGS } from '../config/marketConfig';

const rentByTier: Record<Tier, number> = {
  MUD: 200,
  STREET: 300,
  STARTUP: 800,
  CORPORATE: 2000,
  ELITE: 5000,
  MOGUL: 10000,
  PRESIDENT: 20000,
  OPEN: 0,
};

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
  const rent = rentByTier[newPl.currentTier];

  const marketMult = MARKET_CONFIGS[currentMarket].expenseMultiplier;
  const totalRent = rent * marketMult;

  // Calculate passive income from flex assets and labor empire
  let passiveIncome = newPl.passiveLaborYield || 0;

  // Vending machine logic
  const vendingCount = newPl.vendingCount || 0;
  if (vendingCount > 0) {
    let vendingIncome = vendingCount * 250;
    if (vendingCount >= 10) {
      vendingIncome += 500;
    }
    passiveIncome += vendingIncome;
  }

  FLEX_ASSETS.forEach(asset => {
    const count = newPl.flexAssets[asset.id] || 0;
    passiveIncome += asset.passiveYield * count;
  });

  // Music roster passive income (Royalties)
  let totalRoyalties = 0;
  newPl.artists.forEach(artist => {
    totalRoyalties += artist.royaltyRate;
    artist.monthsActive++;
    if (artist.monthsActive % 12 === 0) {
      artist.hasReleased = true;
    }
  });
  passiveIncome += totalRoyalties;

  // Grammy Award System (2% annual chance per released artist)
  // Divide by 12 since this runs monthly
  newPl.artists.forEach(artist => {
    if (artist.hasReleased && Math.random() < (0.02 / 12)) {
      newPl.bag += 500000;
      newPl.clout += 100;
      newPl.aura += 50;
      newPl.grammyCount = (newPl.grammyCount || 0) + 1;
      artist.isGrammyWinner = true;
      news.push(`🏆 GRAMMY AWARD: ${artist.name} won a Grammy! +$500k | +100 Clout | +50 Aura`);
    }
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
