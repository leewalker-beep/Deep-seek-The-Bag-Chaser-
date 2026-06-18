import type { Tier } from '../types/game';

export const TIER_REQUIREMENTS: Record<Tier, { cash: number; clout: number; aura: number; fee: number; description: string }> = {
  MUD: { cash: 0, clout: 0, aura: 0, fee: 0, description: 'The Beginning' },
  STREET: { cash: 50000, clout: 100, aura: 100, fee: 20000, description: 'HQ Lease & Street Cred' },
  STARTUP: { cash: 500000, clout: 400, aura: 400, fee: 200000, description: 'Startup Incorporation' },
  CORPORATE: { cash: 5000000, clout: 1200, aura: 1200, fee: 2000000, description: 'Institutional Compliance' },
  ELITE: { cash: 50000000, clout: 3500, aura: 3500, fee: 20000000, description: 'Sovereign Elite Syndicate' },
  MOGUL: { cash: 500000000, clout: 10000, aura: 10000, fee: 200000000, description: 'Global Empire' },
  PRESIDENT: { cash: 5000000000, clout: 30000, aura: 30000, fee: 2000000000, description: 'The Oval Office' },
  OPEN: { cash: 0, clout: 0, aura: 0, fee: 5000000000, description: 'Infinite' },
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
