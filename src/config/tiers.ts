import type { Tier } from '../types/game';

export const TIER_REQUIREMENTS: Record<Tier, { cash: number; clout: number; aura: number; fee: number; description: string }> = {
  MUD: { cash: 0, clout: 0, aura: 0, fee: 0, description: 'The Beginning' },
  STREET: { cash: 5000, clout: 20, aura: 20, fee: 3000, description: 'HQ Lease & Street Cred' },
  STARTUP: { cash: 15000, clout: 50, aura: 50, fee: 5000, description: 'Startup Incorporation' },
  CORPORATE: { cash: 100000, clout: 100, aura: 100, fee: 25000, description: 'Institutional Compliance' },
  ELITE: { cash: 5000000, clout: 200, aura: 200, fee: 1000000, description: 'Sovereign Elite Syndicate' },
  MOGUL: { cash: 25000000, clout: 500, aura: 500, fee: 5000000, description: 'Global Empire' },
  PRESIDENT: { cash: 100000000, clout: 1000, aura: 1000, fee: 25000000, description: 'The Oval Office' },
  OPEN: { cash: 0, clout: 0, aura: 0, fee: 0, description: 'Infinite' },
};

export const PROGRESSION_ORDER: Tier[] = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];
