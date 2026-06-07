export interface HustleLevel {
  level: number;
  id?: string;
  name?: string;
  cost: number;
  yieldCash: number;
  yieldClout: number;
  yieldAura: number;
  mentalHit: number;
  cloutReq: number;
  auraReq: number;
  passiveYield?: number;
  nextBranches?: string[];
  isRepeatable?: boolean;
  maxRepeat?: number;
}

export interface Hustle {
  id: string;
  name: string;
  tier: string;
  icon: string;
  description: string;
  levels?: HustleLevel[];
  branches?: Record<string, HustleLevel>;
  startBranchId?: string;
  hasPanel?: boolean;
  panelType?: string;
  miniGame?: string;
}

export const HUSTLES: Record<string, Hustle> = {};

// MUD Tier Hustles
HUSTLES.r_labor = {
  id: 'r_labor',
  name: 'Labor & Property',
  tier: 'MUD',
  icon: '🏗️',
  description: 'From manual labor to real estate empire',
  startBranchId: 'l1',
  branches: {
    l1: {
      level: 1,
      id: 'l1',
      name: 'Manual Labor',
      cost: 0,
      yieldCash: 2400,
      yieldClout: 0,
      yieldAura: 0,
      mentalHit: -8,
      cloutReq: 0,
      auraReq: 0,
      nextBranches: ['l2a', 'l2b']
    },
    l2a: {
      level: 2,
      id: 'l2a',
      name: 'House Flip',
      cost: 15000,
      yieldCash: 25000,
      yieldClout: 20,
      yieldAura: 0,
      mentalHit: -15,
      cloutReq: 40,
      auraReq: 0,
      nextBranches: ['l3a'],
      isRepeatable: true,
      maxRepeat: 5
    },
    l2b: {
      level: 2,
      id: 'l2b',
      name: 'Rent Portfolio',
      cost: 5000,
      yieldCash: 8000,
      yieldClout: 10,
      yieldAura: 0,
      mentalHit: -10,
      cloutReq: 30,
      auraReq: 0,
      passiveYield: 5000,
      nextBranches: ['l3c'],
      isRepeatable: true,
      maxRepeat: 10
    },
    l3a: {
      level: 3,
      id: 'l3a',
      name: 'Commercial Real Estate',
      cost: 500000,
      yieldCash: 0,
      yieldClout: 50,
      yieldAura: 20,
      mentalHit: -20,
      cloutReq: 200,
      auraReq: 100,
      passiveYield: 40000,
    },
    l3c: {
      level: 3,
      id: 'l3c',
      name: 'Construction Firm',
      cost: 50000,
      yieldCash: 100000,
      yieldClout: 30,
      yieldAura: 15,
      mentalHit: -25,
      cloutReq: 100,
      auraReq: 50,
      passiveYield: 10000,
    },
  },
};

HUSTLES.r_delivery = {
  id: 'r_delivery',
  name: 'Delivery Gigs',
  tier: 'MUD',
  icon: '🛵',
  description: 'Fast cash, faster roads',
  levels: [
    { level: 1, cost: 0, yieldCash: 2000, yieldClout: 2, yieldAura: 0, mentalHit: -5, cloutReq: 0, auraReq: 0 },
    { level: 2, cost: 15000, yieldCash: 6000, yieldClout: 5, yieldAura: 0, mentalHit: -15, cloutReq: 40, auraReq: 0 },
    { level: 3, cost: 85000, yieldCash: 35000, yieldClout: 20, yieldAura: 0, mentalHit: -20, cloutReq: 100, auraReq: 50 },
  ]
};

HUSTLES.r_plasma = {
  id: 'r_plasma',
  name: 'Plasma Donation',
  tier: 'MUD',
  icon: '🩸',
  description: 'Sell your essence',
  levels: [
    { level: 1, cost: 0, yieldCash: 500, yieldClout: 0, yieldAura: 0, mentalHit: -10, cloutReq: 0, auraReq: 0 },
  ]
};
