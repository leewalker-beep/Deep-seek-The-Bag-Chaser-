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
  isPassive?: boolean;
  isRepeatable?: boolean;
  maxRepeat?: number;
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
      yieldCash: 22000,
      yieldClout: 25,
      yieldAura: 10,
      mentalHit: -15,
      cloutReq: 40,
      auraReq: 20,
      nextBranches: ['l3a'],
    },
    l2b: {
      level: 2,
      id: 'l2b',
      name: 'Rent Portfolio',
      cost: 50000,
      yieldCash: 5000,
      yieldClout: 10,
      yieldAura: 5,
      mentalHit: -5,
      cloutReq: 50,
      auraReq: 25,
      passiveYield: 1500,
      nextBranches: ['l3a'],
      isRepeatable: true,
      maxRepeat: 10
    },
    l3a: {
      level: 3,
      id: 'l3a',
      name: 'Commercial Real Estate',
      cost: 250000,
      yieldCash: 0,
      yieldClout: 50,
      yieldAura: 25,
      mentalHit: -20,
      cloutReq: 200,
      auraReq: 100,
      passiveYield: 15000,
    },
  },
};

HUSTLES.r_delivery = {
  id: 'r_delivery',
  name: 'Delivery Gigs',
  tier: 'MUD',
  icon: '🛵',
  description: 'Fast cash, faster roads',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Bike Delivery', cost: 0, yieldCash: 2000, yieldClout: 2, yieldAura: 0, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Car Delivery', cost: 8000, yieldCash: 6000, yieldClout: 5, yieldAura: 0, mentalHit: -10, cloutReq: 40, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Fleet Owner', cost: 40000, yieldCash: 25000, yieldClout: 20, yieldAura: 0, mentalHit: -15, cloutReq: 100, auraReq: 0 },
  }
};

HUSTLES.r_plasma = {
  id: 'r_plasma',
  name: 'Plasma Donation',
  tier: 'MUD',
  icon: '🩸',
  description: 'Sell your essence',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Plasma Donation', cost: 0, yieldCash: 500, yieldClout: 0, yieldAura: 0, mentalHit: -10, cloutReq: 0, auraReq: 0 },
  },
};

HUSTLES.r_vending = {
  id: 'r_vending',
  name: 'Vending Machine',
  tier: 'MUD',
  icon: '🥤',
  description: 'Passive income. Buy machines, get $250/month each.',
  isPassive: true,
  isRepeatable: true,
  maxRepeat: Infinity,
  startBranchId: 'l1',
  branches: {
    l1: {
      level: 1,
      id: 'l1',
      name: 'Buy Vending Machine',
      cost: 2000,
      yieldCash: 0,
      yieldClout: 0,
      yieldAura: 0,
      mentalHit: 0,
      cloutReq: 0,
      auraReq: 0,
      passiveYield: 250,
      isRepeatable: true,
      maxRepeat: Infinity,
    },
  },
};

HUSTLES.r_pr_campaign = {
  id: 'r_pr_campaign',
  name: 'PR Campaign',
  tier: 'MUD',
  icon: '📢',
  description: 'Build your reputation',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'PR Campaign', cost: 1000, yieldCash: 0, yieldClout: 50, yieldAura: 20, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Regional PR', cost: 5000, yieldCash: 0, yieldClout: 100, yieldAura: 40, mentalHit: -8, cloutReq: 30, auraReq: 15, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'National PR Firm', cost: 20000, yieldCash: 0, yieldClout: 250, yieldAura: 100, mentalHit: -12, cloutReq: 80, auraReq: 40 },
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
    l1: { level: 1, id: 'l1', name: 'Ghost Mode', cost: 1000, yieldCash: 800, yieldClout: 0, yieldAura: 5, mentalHit: -2, cloutReq: 0, auraReq: 0, heatHit: -5, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Stealth Ops', cost: 3000, yieldCash: 1500, yieldClout: 0, yieldAura: 10, mentalHit: -5, cloutReq: 25, auraReq: 10, heatHit: -8, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Dark Web Presence', cost: 12000, yieldCash: 4000, yieldClout: 0, yieldAura: 25, mentalHit: -8, cloutReq: 60, auraReq: 30, heatHit: -12 }
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
    l1: { level: 1, id: 'l1', name: 'Scrap Metal', cost: 0, yieldCash: 400, yieldClout: 0, yieldAura: 0, mentalHit: -6, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Industrial Scrap', cost: 3000, yieldCash: 2000, yieldClout: 5, yieldAura: 0, mentalHit: -8, cloutReq: 20, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Recycling Plant', cost: 15000, yieldCash: 8000, yieldClout: 15, yieldAura: 5, mentalHit: -12, cloutReq: 50, auraReq: 20 },
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
    l1: { level: 1, id: 'l1', name: 'Flyers', cost: 100, yieldCash: 300, yieldClout: 1, yieldAura: 0, mentalHit: -3, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Digital Flyers', cost: 1500, yieldCash: 1000, yieldClout: 5, yieldAura: 0, mentalHit: -6, cloutReq: 15, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'National Campaign', cost: 8000, yieldCash: 4000, yieldClout: 20, yieldAura: 5, mentalHit: -10, cloutReq: 40, auraReq: 15 },
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
    l1: { level: 1, id: 'l1', name: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 15, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Therapy Session', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 25, cloutReq: 10, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Wellness Retreat', cost: 1000, yieldCash: 0, yieldClout: 10, yieldAura: 10, mentalHit: 50, cloutReq: 30, auraReq: 15 },
  },
};

// STREET Tier Hustles
HUSTLES.cc = {
  id: 'cc',
  name: 'Content Creation',
  tier: 'STREET',
  icon: '📱',
  description: 'Build your audience',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Create Content', cost: 400, yieldCash: 0, yieldClout: 100, yieldAura: 0, mentalHit: -10, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Viral Series', cost: 5000, yieldCash: 2000, yieldClout: 300, yieldAura: 50, mentalHit: -15, cloutReq: 150, auraReq: 50, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Media Channel', cost: 25000, yieldCash: 15000, yieldClout: 800, yieldAura: 200, mentalHit: -25, cloutReq: 500, auraReq: 200 },
  },
};

HUSTLES.pod = {
  id: 'pod',
  name: 'Podcast',
  tier: 'STREET',
  icon: '🎙️',
  description: 'Find your voice',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Record Episode', cost: 200, yieldCash: 1500, yieldClout: 30, yieldAura: 0, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Guest Interview', cost: 4000, yieldCash: 5000, yieldClout: 100, yieldAura: 50, mentalHit: -10, cloutReq: 80, auraReq: 40, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Spotify Exclusive', cost: 30000, yieldCash: 25000, yieldClout: 500, yieldAura: 250, mentalHit: -20, cloutReq: 300, auraReq: 150 }
  },
};

HUSTLES.drop = {
  id: 'drop',
  name: 'Dropshipping',
  tier: 'STREET',
  icon: '📦',
  description: 'Middleman your way to wealth',
  miniGame: 'SwipeOrder',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Basic Store', cost: 2000, yieldCash: 4000, yieldClout: 5, yieldAura: 2, mentalHit: -10, cloutReq: 20, auraReq: 10, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Automated Store', cost: 15000, yieldCash: 12000, yieldClout: 30, yieldAura: 10, mentalHit: -18, cloutReq: 40, auraReq: 20, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Global Supply Chain', cost: 50000, yieldCash: 45000, yieldClout: 80, yieldAura: 30, mentalHit: -25, cloutReq: 80, auraReq: 40 }
  }
};

HUSTLES.vintage = {
  id: 'vintage',
  name: 'Vintage Reselling',
  tier: 'STREET',
  icon: '🧥',
  description: 'Thrift flips and archival pieces',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Thrift Flip', cost: 1000, yieldCash: 3000, yieldClout: 15, yieldAura: 10, mentalHit: -8, cloutReq: 30, auraReq: 20, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Showroom Space', cost: 12000, yieldCash: 10000, yieldClout: 50, yieldAura: 40, mentalHit: -15, cloutReq: 60, auraReq: 40, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Archival Gallery', cost: 45000, yieldCash: 40000, yieldClout: 150, yieldAura: 120, mentalHit: -22, cloutReq: 120, auraReq: 80 }
  }
};

HUSTLES.techFlip = {
  id: 'techFlip',
  name: 'Tech Flipping',
  tier: 'STREET',
  icon: '💻',
  description: 'Refurbish and resell electronics',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Basic Refurb', cost: 1500, yieldCash: 3500, yieldClout: 10, yieldAura: 5, mentalHit: -9, cloutReq: 25, auraReq: 15, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Bulk Repair Shop', cost: 18000, yieldCash: 15000, yieldClout: 40, yieldAura: 20, mentalHit: -18, cloutReq: 50, auraReq: 30, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Hardware Customization', cost: 55000, yieldCash: 50000, yieldClout: 120, yieldAura: 60, mentalHit: -25, cloutReq: 100, auraReq: 60 }
  }
};

HUSTLES.audio = {
  id: 'audio',
  name: 'Music Production',
  tier: 'STREET',
  icon: '🎹',
  description: 'Selling beats and engineering',
  miniGame: 'TapRhythm',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Home Studio', cost: 2500, yieldCash: 1200, yieldClout: 40, yieldAura: 30, mentalHit: -12, cloutReq: 40, auraReq: 30, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Studio Session', cost: 10000, yieldCash: 2000, yieldClout: 80, yieldAura: 40, mentalHit: -15, cloutReq: 50, auraReq: 30, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Record Deal', cost: 40000, yieldCash: 10000, yieldClout: 200, yieldAura: 100, mentalHit: -25, cloutReq: 100, auraReq: 60 }
  }
};

HUSTLES.sw = {
  id: 'sw',
  name: 'Streetwear',
  tier: 'STARTUP',
  icon: '👕',
  description: 'Building a global hype brand',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Screenprint Tees', cost: 3000, yieldCash: 5000, yieldClout: 50, yieldAura: 25, mentalHit: -15, cloutReq: 50, auraReq: 40, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Full Collection', cost: 20000, yieldCash: 18000, yieldClout: 120, yieldAura: 60, mentalHit: -20, cloutReq: 100, auraReq: 80, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Flagship Store', cost: 80000, yieldCash: 60000, yieldClout: 300, yieldAura: 150, mentalHit: -30, cloutReq: 250, auraReq: 150 }
  }
};

HUSTLES.smm = {
  id: 'smm',
  name: 'SMM Agency',
  tier: 'STARTUP',
  icon: '📈',
  description: 'Scale your agency with high-ticket clients',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Freelance SMM', cost: 500, yieldCash: 2500, yieldClout: 20, yieldAura: 10, mentalHit: -10, cloutReq: 30, auraReq: 20, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Agency Partner', cost: 8000, yieldCash: 12000, yieldClout: 60, yieldAura: 30, mentalHit: -15, cloutReq: 80, auraReq: 40, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Full Scale Agency', cost: 35000, yieldCash: 30000, yieldClout: 150, yieldAura: 80, mentalHit: -22, cloutReq: 150, auraReq: 100 }
  }
};

HUSTLES.gig = {
  id: 'gig',
  name: 'Runner Fleet',
  tier: 'STARTUP',
  icon: '🚚',
  description: 'Scale your logistics and fleet management',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Hire Runner', cost: 5000, yieldCash: 2000, yieldClout: 15, yieldAura: 5, mentalHit: -10, cloutReq: 40, auraReq: 20, passiveYield: 500, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'City Dispatch', cost: 25000, yieldCash: 10000, yieldClout: 40, yieldAura: 15, mentalHit: -15, cloutReq: 100, auraReq: 50, passiveYield: 2500, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Logistics Hub', cost: 100000, yieldCash: 40000, yieldClout: 100, yieldAura: 40, mentalHit: -20, cloutReq: 250, auraReq: 120, passiveYield: 10000 }
  }
};

HUSTLES.meme = {
  id: 'meme',
  name: 'Meme Coins',
  tier: 'STARTUP',
  icon: '🪙',
  description: 'Manipulate the markets for high-tier gains',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Shitcoin Gamble', cost: 1000, yieldCash: 10000, yieldClout: 10, yieldAura: 50, mentalHit: -25, cloutReq: 20, auraReq: 50, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Influencer Launch', cost: 15000, yieldCash: 50000, yieldClout: 100, yieldAura: 150, mentalHit: -40, cloutReq: 100, auraReq: 100, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Exchange Listing', cost: 100000, yieldCash: 500000, yieldClout: 500, yieldAura: 500, mentalHit: -60, cloutReq: 500, auraReq: 300 }
  }
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

HUSTLES.agency_scale = {
  id: 'agency_scale',
  name: 'Agency Scale',
  tier: 'STARTUP',
  icon: '🏢',
  description: 'High-ticket service fulfillment',
  levels: [
    { level: 1, id: 'l1', cost: 25000, yieldCash: 15000, yieldClout: 80, yieldAura: 40, mentalHit: -20, cloutReq: 80, auraReq: 60, passiveYield: 3000 },
  ]
};

HUSTLES.ecom_brand = {
  id: 'ecom_brand',
  name: 'E-com Brand',
  tier: 'STARTUP',
  icon: '🛒',
  description: 'Private label consumer goods',
  levels: [
    { level: 1, id: 'l1', cost: 40000, yieldCash: 25000, yieldClout: 100, yieldAura: 60, mentalHit: -22, cloutReq: 100, auraReq: 80, passiveYield: 8000 },
  ]
};

HUSTLES.data_analytics = {
  id: 'data_analytics',
  name: 'Data Analytics',
  tier: 'STARTUP',
  icon: '📊',
  description: 'Sell insights to corporations',
  levels: [
    { level: 1, id: 'l1', cost: 60000, yieldCash: 45000, yieldClout: 120, yieldAura: 80, mentalHit: -25, cloutReq: 150, auraReq: 100, passiveYield: 12000 },
  ]
};

HUSTLES.crypto_mining = {
  id: 'crypto_mining',
  name: 'Crypto Mining',
  tier: 'STARTUP',
  icon: '⛏️',
  description: 'Secure the network, secure the bag',
  levels: [
    { level: 1, id: 'l1', cost: 100000, yieldCash: 0, yieldClout: 50, yieldAura: 100, mentalHit: -10, cloutReq: 100, auraReq: 150, passiveYield: 25000 },
  ]
};

HUSTLES.virtual_assistant_agency = {
  id: 'virtual_assistant_agency',
  name: 'VA Agency',
  tier: 'STARTUP',
  icon: '🤝',
  description: 'Arbitrage global labor',
  levels: [
    { level: 1, id: 'l1', cost: 20000, yieldCash: 12000, yieldClout: 40, yieldAura: 20, mentalHit: -18, cloutReq: 60, auraReq: 40, passiveYield: 4000 },
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

HUSTLES.venture_capital = {
  id: 'venture_capital',
  name: 'Venture Capital',
  tier: 'ELITE',
  icon: '💼',
  description: 'Invest in the next unicorn',
  levels: [
    { level: 1, id: 'l1', cost: 10000000, yieldCash: 50000000, yieldClout: 800, yieldAura: 400, mentalHit: -25, cloutReq: 400, auraReq: 300 },
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

HUSTLES.fight_promoter = {
  id: 'fight_promoter',
  name: 'Fight Promoter',
  tier: 'MOGUL',
  icon: '🥊',
  description: 'The biggest cards in history',
  levels: [
    { level: 1, id: 'l1', cost: 15000000, yieldCash: 40000000, yieldClout: 1500, yieldAura: 800, mentalHit: -40, cloutReq: 800, auraReq: 600 },
  ]
};

HUSTLES.space_investment = {
  id: 'space_investment',
  name: 'Space Investment',
  tier: 'MOGUL',
  icon: '🚀',
  description: 'Mining asteroids and orbital tourism',
  levels: [
    { level: 1, id: 'l1', cost: 100000000, yieldCash: 0, yieldClout: 2000, yieldAura: 1500, mentalHit: -30, cloutReq: 1000, auraReq: 1000, passiveYield: 10000000 },
  ]
};

HUSTLES.philanthropy_empire = {
  id: 'philanthropy_empire',
  name: 'Philanthropy Empire',
  tier: 'MOGUL',
  icon: '🤝',
  description: 'Solve world hunger for the tax break',
  levels: [
    { level: 1, id: 'l1', cost: 50000000, yieldCash: 0, yieldClout: 1000, yieldAura: 5000, mentalHit: 50, cloutReq: 1500, auraReq: 1000 },
  ]
};

// PRESIDENT Tier Hustles
HUSTLES.data_monopoly = {
  id: 'data_monopoly',
  name: 'Data Monopoly',
  tier: 'PRESIDENT',
  icon: '🔒',
  description: 'Own every byte of personal information',
  levels: [
    { level: 1, id: 'l1', cost: 500000000, yieldCash: 100000000, yieldClout: 3000, yieldAura: 1000, mentalHit: -60, cloutReq: 2000, auraReq: 1500, passiveYield: 50000000 },
  ]
};

HUSTLES.central_bank_play = {
  id: 'central_bank_play',
  name: 'Central Bank Play',
  tier: 'PRESIDENT',
  icon: '🏦',
  description: 'Influence interest rates for profit',
  levels: [
    { level: 1, id: 'l1', cost: 1000000000, yieldCash: 500000000, yieldClout: 4000, yieldAura: 2000, mentalHit: -70, cloutReq: 3000, auraReq: 2000 },
  ]
};

HUSTLES.legacy_fund = {
  id: 'legacy_fund',
  name: 'Legacy Fund',
  tier: 'PRESIDENT',
  icon: '🏛️',
  description: 'Ensuring your name lasts forever',
  levels: [
    { level: 1, id: 'l1', cost: 2000000000, yieldCash: 0, yieldClout: 5000, yieldAura: 10000, mentalHit: 100, cloutReq: 5000, auraReq: 5000 },
  ]
};

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
