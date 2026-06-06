export interface HustleLevel {
  level: number;
  cost: number;
  yieldCash: number;
  yieldClout: number;
  yieldAura: number;
  mentalHit: number;
  cloutReq: number;
  auraReq: number;
  passiveYield?: number;
}

export interface Hustle {
  id: string;
  name: string;
  tier: string;
  icon: string;
  description: string;
  levels: HustleLevel[];
  hasPanel?: boolean;
  panelType?: string;
  miniGame?: string;
}

export const HUSTLES: Record<string, Hustle> = {};

// MUD Tier Hustles
HUSTLES.r_labor = {
  id: 'r_labor',
  name: 'Manual Labor',
  tier: 'MUD',
  icon: '💪',
  description: 'Hard work, honest pay',
  levels: [
    { level: 1, cost: 0, yieldCash: 2400, yieldClout: 0, yieldAura: 0, mentalHit: -8, cloutReq: 0, auraReq: 0 },
    { level: 2, cost: 15000, yieldCash: 25000, yieldClout: 0, yieldAura: 0, mentalHit: -15, cloutReq: 40, auraReq: 0 },
    { level: 3, cost: 50000, yieldCash: 100000, yieldClout: 0, yieldAura: 0, mentalHit: -25, cloutReq: 100, auraReq: 50 },
  ]
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
