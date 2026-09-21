import type { Tier } from '../types/game';

export const TIER_REQUIREMENTS: Record<Tier, { cash: number; clout: number; aura: number; fee: number; crowns: number; description: string }> = {
  MUD: { cash: 0, clout: 0, aura: 0, fee: 0, crowns: 0, description: 'SURVIVE: Escape the daily grind' },
  STREET: { cash: 50000, clout: 100, aura: 100, fee: 20000, crowns: 3, description: 'BUILD: Establish street cred & local footholds' },
  STARTUP: { cash: 500000, clout: 400, aura: 400, fee: 200000, crowns: 5, description: 'SCALE: Corporate incorporation & venture leverage' },
  CORPORATE: { cash: 5000000, clout: 1200, aura: 1200, fee: 2000000, crowns: 7, description: 'CONTROL: Institutional compliance & media dominance' },
  ELITE: { cash: 50000000, clout: 3500, aura: 3500, fee: 20000000, crowns: 9, description: 'INFLUENCE: Sovereign wealth & syndicate control' },
  MOGUL: { cash: 500000000, clout: 10000, aura: 10000, fee: 200000000, crowns: 11, description: 'DOMINATE: Uncontested commercial empire' },
  PRESIDENT: { cash: 5000000000, clout: 30000, aura: 30000, fee: 2000000000, crowns: 13, description: 'GOVERN: Executive statecraft & policy control' },
  OPEN: { cash: 0, clout: 0, aura: 0, fee: 5000000000, crowns: 15, description: 'CHOOSE YOUR LEGACY: Infinite career transcendence' },
};

export const PROGRESSION_ORDER: Tier[] = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];

export const getTierMax = (tier: string): { clout: number; aura: number } => {
  switch (tier) {
    case 'MUD': return { clout: 300, aura: 300 };
    case 'STREET': return { clout: 1000, aura: 1000 };
    case 'STARTUP': return { clout: 3000, aura: 3000 };
    case 'CORPORATE': return { clout: 8000, aura: 8000 };
    case 'ELITE': return { clout: 25000, aura: 25000 };
    case 'MOGUL': return { clout: 75000, aura: 75000 };
    case 'PRESIDENT': return { clout: 250000, aura: 250000 };
    case 'OPEN': return { clout: 999999, aura: 999999 };
    default: return { clout: 100, aura: 100 };
  }
};
