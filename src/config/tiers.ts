import type { Tier } from '../types/game';

export const TIER_REQUIREMENTS: Record<Tier, { cash: number; clout: number; aura: number; fee: number; description: string }> = {
  MUD: { cash: 0, clout: 0, aura: 0, fee: 0, description: 'The Beginning' },
  STREET: { cash: 5000, clout: 20, aura: 20, fee: 12000, description: 'HQ Lease & Street Cred' },
  STARTUP: { cash: 15000, clout: 50, aura: 50, fee: 20000, description: 'Startup Incorporation' },
  CORPORATE: { cash: 100000, clout: 100, aura: 100, fee: 100000, description: 'Institutional Compliance' },
  ELITE: { cash: 5000000, clout: 200, aura: 200, fee: 4000000, description: 'Sovereign Elite Syndicate' },
  MOGUL: { cash: 25000000, clout: 500, aura: 500, fee: 20000000, description: 'Global Empire' },
  PRESIDENT: { cash: 100000000, clout: 1000, aura: 1000, fee: 100000000, description: 'The Oval Office' },
  OPEN: { cash: 0, clout: 0, aura: 0, fee: 100000000, description: 'Infinite' },
};

export const PROGRESSION_ORDER: Tier[] = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];

export const getTierMax = (tier: string): { clout: number; aura: number } => {
  switch (tier) {
    case 'MUD': return { clout: 63, aura: 63 };
    case 'STREET': return { clout: 125, aura: 125 };
    case 'STARTUP': return { clout: 250, aura: 250 };
    case 'CORPORATE': return { clout: 625, aura: 625 };
    case 'ELITE': return { clout: 1250, aura: 1250 };
    case 'MOGUL': return { clout: 2500, aura: 2500 };
    case 'PRESIDENT': return { clout: 6250, aura: 6250 };
    case 'OPEN': return { clout: 999999, aura: 999999 };
    default: return { clout: 63, aura: 63 };
  }
};
