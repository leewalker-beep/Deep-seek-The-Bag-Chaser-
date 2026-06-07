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
  heatHit?: number;
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
    { level: 1, id: 'l1', cost: 0, yieldCash: 2000, yieldClout: 2, yieldAura: 0, mentalHit: -5, cloutReq: 0, auraReq: 0 },
    { level: 2, id: 'l2', cost: 15000, yieldCash: 6000, yieldClout: 5, yieldAura: 0, mentalHit: -15, cloutReq: 40, auraReq: 0 },
    { level: 3, id: 'l3', cost: 85000, yieldCash: 35000, yieldClout: 20, yieldAura: 0, mentalHit: -20, cloutReq: 100, auraReq: 50 },
  ]
};

HUSTLES.r_plasma = {
  id: 'r_plasma',
  name: 'Plasma Donation',
  tier: 'MUD',
  icon: '🩸',
  description: 'Sell your essence',
  levels: [
    { level: 1, id: 'l1', cost: 0, yieldCash: 500, yieldClout: 0, yieldAura: 0, mentalHit: -10, cloutReq: 0, auraReq: 0 },
  ]
};

HUSTLES.r_pr_campaign = {
  id: 'r_pr_campaign',
  name: 'PR Campaign',
  tier: 'MUD',
  icon: '📢',
  description: 'Build your reputation',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'PR Campaign', cost: 2000, yieldCash: 0, yieldClout: 50, yieldAura: 20, mentalHit: -5, cloutReq: 0, auraReq: 0 },
  },
};

HUSTLES.r_ghost_mode = {
  id: 'r_ghost_mode',
  name: 'Ghost Mode',
  tier: 'MUD',
  icon: '👻',
  description: 'Low-heat operations',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Ghost Mode', cost: 1000, yieldCash: 800, yieldClout: 0, yieldAura: 5, mentalHit: -2, cloutReq: 0, auraReq: 0, heatHit: -5 },
  },
};

HUSTLES.r_scrap = {
  id: 'r_scrap',
  name: 'Scrap Metal',
  tier: 'MUD',
  icon: '🔧',
  description: 'Salvage and sell',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Scrap Metal', cost: 0, yieldCash: 400, yieldClout: 0, yieldAura: 0, mentalHit: -6, cloutReq: 0, auraReq: 0 },
  },
};

HUSTLES.r_flyers = {
  id: 'r_flyers',
  name: 'Flyer Distribution',
  tier: 'MUD',
  icon: '📄',
  description: 'Promote local businesses',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Flyers', cost: 100, yieldCash: 300, yieldClout: 1, yieldAura: 0, mentalHit: -3, cloutReq: 0, auraReq: 0 },
  },
};

HUSTLES.r_sleep = {
  id: 'r_sleep',
  name: 'Rest & Recover',
  tier: 'MUD',
  icon: '😴',
  description: 'Regain mental health',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 15, cloutReq: 0, auraReq: 0 },
  },
};

// STREET Tier Hustles
HUSTLES.cc = {
  id: 'cc',
  name: 'Content Creation',
  tier: 'STREET',
  icon: '📸',
  description: 'Build a following on social media',
  levels: [
    { level: 1, id: 'l1', cost: 500, yieldCash: 200, yieldClout: 10, yieldAura: 2, mentalHit: -5, cloutReq: 20, auraReq: 10 },
    { level: 2, id: 'l2', cost: 2500, yieldCash: 1200, yieldClout: 25, yieldAura: 5, mentalHit: -10, cloutReq: 50, auraReq: 20 },
    { level: 3, id: 'l3', cost: 10000, yieldCash: 5000, yieldClout: 60, yieldAura: 15, mentalHit: -15, cloutReq: 100, auraReq: 50 },
  ]
};

HUSTLES.pod = {
  id: 'pod',
  name: 'Podcast',
  tier: 'STREET',
  icon: '🎙️',
  description: 'Talk your way to the top',
  levels: [
    { level: 1, id: 'l1', cost: 1000, yieldCash: 0, yieldClout: 20, yieldAura: 10, mentalHit: -4, cloutReq: 30, auraReq: 15 },
    { level: 2, id: 'l2', cost: 5000, yieldCash: 2500, yieldClout: 40, yieldAura: 20, mentalHit: -8, cloutReq: 80, auraReq: 40 },
  ]
};

HUSTLES.drop = {
  id: 'drop',
  name: 'Dropshipping',
  tier: 'STREET',
  icon: '📦',
  description: 'Middleman your way to wealth',
  levels: [
    { level: 1, id: 'l1', cost: 2000, yieldCash: 4000, yieldClout: 5, yieldAura: 2, mentalHit: -10, cloutReq: 20, auraReq: 10 },
  ]
};

HUSTLES.vintage = {
  id: 'vintage',
  name: 'Vintage Reselling',
  tier: 'STREET',
  icon: '🧥',
  description: 'Thrift flips and archival pieces',
  levels: [
    { level: 1, id: 'l1', cost: 1000, yieldCash: 3000, yieldClout: 15, yieldAura: 10, mentalHit: -8, cloutReq: 30, auraReq: 20 },
  ]
};

// STARTUP Tier Hustles
HUSTLES.saas_mvp = {
  id: 'saas_mvp',
  name: 'SaaS MVP',
  tier: 'STARTUP',
  icon: '💻',
  description: 'Software as a Service',
  levels: [
    { level: 1, id: 'l1', cost: 15000, yieldCash: 2000, yieldClout: 50, yieldAura: 20, mentalHit: -15, cloutReq: 50, auraReq: 50, passiveYield: 1000 },
    { level: 2, id: 'l2', cost: 50000, yieldCash: 10000, yieldClout: 120, yieldAura: 50, mentalHit: -25, cloutReq: 150, auraReq: 100, passiveYield: 5000 },
  ]
};

// CORPORATE Tier Hustles
HUSTLES.festival = {
  id: 'festival',
  name: 'Music Festival',
  tier: 'CORPORATE',
  icon: '🎸',
  description: 'Organize a massive event',
  levels: [
    { level: 1, id: 'l1', cost: 200000, yieldCash: 350000, yieldClout: 200, yieldAura: 100, mentalHit: -40, cloutReq: 100, auraReq: 100 },
  ]
};

HUSTLES.global_franchise = {
  id: 'global_franchise',
  name: 'Global Franchise',
  tier: 'CORPORATE',
  icon: '🍔',
  description: 'Scalable standardized success',
  levels: [
    { level: 1, id: 'l1', cost: 500000, yieldCash: 150000, yieldClout: 100, yieldAura: 50, mentalHit: -30, cloutReq: 150, auraReq: 100, passiveYield: 40000 },
  ]
};

// ELITE Tier Hustles
HUSTLES.real_estate_empire = {
  id: 'real_estate_empire',
  name: 'Real Estate Empire',
  tier: 'ELITE',
  icon: '🏙️',
  description: 'Dominating the skyline',
  levels: [
    { level: 1, id: 'l1', cost: 5000000, yieldCash: 0, yieldClout: 500, yieldAura: 300, mentalHit: -30, cloutReq: 200, auraReq: 200, passiveYield: 500000 },
  ]
};

// MOGUL Tier Hustles
HUSTLES.film_studio = {
  id: 'film_studio',
  name: 'Film Studio',
  tier: 'MOGUL',
  icon: '🎬',
  description: 'Produce blockbusters',
  levels: [
    { level: 1, id: 'l1', cost: 25000000, yieldCash: 60000000, yieldClout: 1000, yieldAura: 500, mentalHit: -50, cloutReq: 500, auraReq: 500 },
  ]
};

// PRESIDENT Tier Hustles
HUSTLES.the_campaign = {
  id: 'the_campaign',
  name: 'The Campaign',
  tier: 'PRESIDENT',
  icon: '🇺🇸',
  description: 'Running for the highest office',
  levels: [
    { level: 1, id: 'l1', cost: 100000000, yieldCash: 0, yieldClout: 5000, yieldAura: 5000, mentalHit: -80, cloutReq: 1000, auraReq: 1000 },
  ]
};
