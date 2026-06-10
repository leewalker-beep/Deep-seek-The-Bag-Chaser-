import type { Tier } from '../types/game';

export const TIER_REQUIREMENTS: Record<Tier, { cash: number; clout: number; aura: number; fee: number; description: string }> = {
  MUD: { cash: 0, clout: 0, aura: 0, fee: 0, description: 'The Beginning' },
  STREET: { cash: 100000, clout: 50, aura: 50, fee: 50000, description: 'HQ Lease & Street Cred' },
  STARTUP: { cash: 250000, clout: 100, aura: 100, fee: 100000, description: 'Startup Incorporation' },
  CORPORATE: { cash: 1000000, clout: 200, aura: 200, fee: 250000, description: 'Institutional Compliance' },
  ELITE: { cash: 5000000, clout: 400, aura: 400, fee: 1000000, description: 'Sovereign Elite Syndicate' },
  MOGUL: { cash: 50000000, clout: 800, aura: 800, fee: 10000000, description: 'Global Empire' },
  PRESIDENT: { cash: 1000000000, clout: 1600, aura: 1600, fee: 250000000, description: 'The Oval Office' },
  OPEN: { cash: 0, clout: 0, aura: 0, fee: 0, description: 'Infinite' },
};

export const PROGRESSION_ORDER: Tier[] = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];

export const getTierMax = (tier: string): { clout: number; aura: number } => {
  switch (tier) {
    case 'MUD': return { clout: 50, aura: 50 };
    case 'STREET': return { clout: 100, aura: 100 };
    case 'STARTUP': return { clout: 200, aura: 200 };
    case 'CORPORATE': return { clout: 500, aura: 500 };
    case 'ELITE': return { clout: 1000, aura: 1000 };
    case 'MOGUL': return { clout: 2000, aura: 2000 };
    case 'PRESIDENT': return { clout: 5000, aura: 5000 };
    default: return { clout: 50, aura: 50 };
  }
};
