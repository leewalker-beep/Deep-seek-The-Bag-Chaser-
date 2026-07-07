import type { LegacyUpgrade } from '../types/legacy';

export const LEGACY_UPGRADES: LegacyUpgrade[] = [
  {
    id: 'extra_clout',
    name: 'Street Cred',
    description: 'Start every run with +50 Clout.',
    cost: 5000,
    category: 'STARTING_STATS',
    icon: '📣'
  },
  {
    id: 'extra_aura',
    name: 'Natural Charisma',
    description: 'Start every run with +50 Aura.',
    cost: 5000,
    category: 'STARTING_STATS',
    icon: '✨'
  },
  {
    id: 'extra_cash',
    name: 'Silver Spoon',
    description: 'Start every run with $5,000 extra cash.',
    cost: 10000,
    category: 'STARTING_STATS',
    icon: '💰'
  },
  {
    id: 'early_vending',
    name: 'Vending Legacy',
    description: 'Start every run with 1 Vending Machine already owned.',
    cost: 15000,
    category: 'ASSETS',
    icon: '🥤'
  },
  {
    id: 'unique_hustle_deli',
    name: 'Family Deli',
    description: 'Unlocks the "Family Deli" hustle in the MUD tier. High stability, moderate returns.',
    cost: 40000,
    category: 'HUSTLES',
    icon: '🥪'
  },
  {
    id: 'market_insight',
    name: 'Market Maven',
    description: 'Get advanced warning of market shifts in the news ticker.',
    cost: 50000,
    category: 'PERKS',
    icon: '📈'
  },
  {
    id: 'passive_boost',
    name: 'Efficiency Expert',
    description: 'Permanent +10% to all passive income yields.',
    cost: 100000,
    category: 'PERKS',
    icon: '⚙️'
  },
  {
    id: 'unique_origin_chosen',
    name: 'The Chosen One',
    description: 'Unlocks "The Chosen One" origin. Elite starting stats and balanced bonuses.',
    cost: 400000,
    category: 'ORIGINS',
    icon: '👑'
  }
];
