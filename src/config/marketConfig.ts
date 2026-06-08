import type { MarketType } from '../types/game';

export const MARKET_CONFIGS: Record<MarketType, {
  name: string;
  icon: string;
  expenseMultiplier: number;
  yieldMultiplier: number;
  heatMultiplier: number;
  description: string;
}> = {
  NORMAL: {
    name: 'Normal Economy',
    icon: '⚖️',
    expenseMultiplier: 1,
    yieldMultiplier: 1,
    heatMultiplier: 1,
    description: 'The grind continues as usual.'
  },
  RECESSION: {
    name: 'Recession',
    icon: '📉',
    expenseMultiplier: 1.5,
    yieldMultiplier: 0.5,
    heatMultiplier: 1,
    description: 'Expenses up, yields down. The mud gets deeper.'
  },
  BULL_MARKET: {
    name: 'Bull Market',
    icon: '📈',
    expenseMultiplier: 1,
    yieldMultiplier: 1.5,
    heatMultiplier: 1,
    description: 'Everything is pumping. Easy money.'
  },
  CRACKDOWN: {
    name: 'Crackdown',
    icon: '🚔',
    expenseMultiplier: 1,
    yieldMultiplier: 0.8,
    heatMultiplier: 2,
    description: 'Feds are watching. Heat accumulates faster.'
  },
};
