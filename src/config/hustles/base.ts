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
  shieldTurns?: number;
  nextBranches?: string[];
  isRepeatable?: boolean;
  maxRepeat?: number;
  miniGame?: string;
  minimumYield?: number;
  reqClout?: number;
  multiplier?: number;
}

export interface Hustle {
  id: string;
  name: string;
  title?: string;
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
  basePayout?: number;
  baseClout?: number;
  mentalHealthCost?: number;
}

export const HUSTLES: Record<string, Hustle> = {};

// MUD Tier Hustles (Target: ~$1,000 profit/month, ~10 months)
HUSTLES.r_labor = {
  id: 'r_labor',
  name: 'Labor & Property',
  tier: 'MUD',
  icon: '🏗️',
  description: 'From manual labor to real estate empire',
  startBranchId: 'l1',
  miniGame: 'LaborBuild',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Manual Labor', cost: 0, yieldCash: 2000, yieldClout: 2, yieldAura: 2, mentalHit: -8, cloutReq: 0, auraReq: 0, nextBranches: ['l2a', 'l2b'], miniGame: 'LaborBuild' },
    l2a: { level: 2, id: 'l2a', name: 'House Flip', cost: 5000, yieldCash: 8000, yieldClout: 8, yieldAura: 8, mentalHit: -15, cloutReq: 30, auraReq: 20, nextBranches: ['l3a'], miniGame: 'LaborBuild' },
    l2b: { level: 2, id: 'l2b', name: 'Rent Portfolio', cost: 15000, yieldCash: 25000, yieldClout: 4, yieldAura: 4, mentalHit: -5, cloutReq: 40, auraReq: 25, passiveYield: 500, nextBranches: ['l3a'], isRepeatable: true, maxRepeat: 20, miniGame: 'LaborBuild' },
    l3a: { level: 3, id: 'l3a', name: 'Commercial Real Estate', cost: 100000, yieldCash: 150000, yieldClout: 15, yieldAura: 15, mentalHit: -20, cloutReq: 100, auraReq: 50, passiveYield: 8000, miniGame: 'LaborBuild' },
  },
};

HUSTLES.r_delivery = {
  id: 'r_delivery',
  name: 'Delivery Gigs',
  tier: 'MUD',
  icon: '🛵',
  description: 'Fast cash, faster roads',
  miniGame: 'TrafficDodge',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Bike Delivery', cost: 0, yieldCash: 1800, yieldClout: 2, yieldAura: 0, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'], miniGame: 'TrafficDodge' },
    l2: { level: 2, id: 'l2', name: 'Car Delivery', cost: 2000, yieldCash: 4500, yieldClout: 4, yieldAura: 0, mentalHit: -10, cloutReq: 40, auraReq: 0, nextBranches: ['l3'], miniGame: 'TrafficDodge' },
    l3: { level: 3, id: 'l3', name: 'Fleet Owner', cost: 10000, yieldCash: 18000, yieldClout: 12, yieldAura: 0, mentalHit: -15, cloutReq: 100, auraReq: 0, miniGame: 'TrafficDodge' },
  }
};

HUSTLES.r_plasma = {
  id: 'r_plasma',
  name: 'Plasma Donation',
  tier: 'MUD',
  icon: '🩸',
  description: 'Sell your essence',
  miniGame: 'PlasmaDonation',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Plasma Donation', cost: 0, yieldCash: 300, yieldClout: 0, yieldAura: 0, mentalHit: -10, cloutReq: 0, auraReq: 0, miniGame: 'PlasmaDonation' },
  },
};

HUSTLES.r_vending = {
  id: 'r_vending',
  name: 'Vending Machine',
  tier: 'MUD',
  icon: '🥤',
  description: 'Passive income. Buy machines, get $150/month each.',
  isPassive: true,
  isRepeatable: true,
  maxRepeat: Infinity,
  startBranchId: 'vending',
  branches: {
    vending: { level: 1, id: 'vending', name: 'Buy Vending Machine', cost: 2000, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, cloutReq: 0, auraReq: 0, passiveYield: 150, isRepeatable: true, maxRepeat: Infinity },
  },
};

HUSTLES.r_ghost_mode = {
  id: 'r_ghost_mode',
  name: 'Ghost Mode',
  tier: 'MUD',
  icon: '👻',
  description: 'Low-heat operations',
  miniGame: 'GhostMode',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Ghost Mode', cost: 1000, yieldCash: 1400, yieldClout: 0, yieldAura: 5, mentalHit: -2, cloutReq: 0, auraReq: 0, heatHit: -5, nextBranches: ['l2'], miniGame: 'GhostMode' },
    l2: { level: 2, id: 'l2', name: 'Stealth Ops', cost: 3000, yieldCash: 4500, yieldClout: 0, yieldAura: 10, mentalHit: -5, cloutReq: 25, auraReq: 10, heatHit: -8, nextBranches: ['l3'], miniGame: 'GhostMode' },
    l3: { level: 3, id: 'l3', name: 'Dark Web Presence', cost: 12000, yieldCash: 18000, yieldClout: 0, yieldAura: 25, mentalHit: -8, cloutReq: 60, auraReq: 30, heatHit: -12, miniGame: 'GhostMode' }
  },
};

HUSTLES.r_scrap = {
  id: 'r_scrap',
  name: 'Scrap Metal',
  tier: 'MUD',
  icon: '🔧',
  description: 'Salvage and sell',
  miniGame: 'MagneticSweep',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Scavenger', cost: 0, yieldCash: 400, yieldClout: 0, yieldAura: 0, mentalHit: -6, cloutReq: 0, auraReq: 0, nextBranches: ['l2'], minimumYield: 300 },
    l2: { level: 2, id: 'l2', name: 'Yard Owner', cost: 3000, yieldCash: 4500, yieldClout: 5, yieldAura: 0, mentalHit: -10, cloutReq: 20, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Recycling Plant', cost: 15000, yieldCash: 22000, yieldClout: 15, yieldAura: 5, mentalHit: -15, cloutReq: 50, auraReq: 20, nextBranches: ['l4'] },
    l4: { level: 4, id: 'l4', name: 'Industrial Network', cost: 50000, yieldCash: 75000, yieldClout: 40, yieldAura: 15, mentalHit: -20, cloutReq: 100, auraReq: 50 }
  },
};

HUSTLES.r_sleep = {
  id: 'r_sleep',
  name: 'Rest & Recover',
  tier: 'MUD',
  icon: '😴',
  description: 'Regain mental health',
  startBranchId: 'l1',
  hasPanel: true,
  panelType: 'REST',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Rest', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 15, cloutReq: 0, auraReq: 0, shieldTurns: 1, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Therapy Session', cost: 200, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 25, cloutReq: 10, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Wellness Retreat', cost: 2000, yieldCash: 0, yieldClout: 10, yieldAura: 10, mentalHit: 50, cloutReq: 30, auraReq: 15 },
  },
};

HUSTLES.street_eats = {
  id: 'street_eats',
  name: 'Street Eats',
  tier: 'MUD',
  icon: '🌮',
  description: 'From taco cart to restaurant empire',
  startBranchId: 'l1',
  miniGame: 'StreetEats',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Taco Cart', cost: 500, yieldCash: 1000, yieldClout: 5, yieldAura: 3, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'], miniGame: 'StreetEats' },
    l2: { level: 2, id: 'l2', name: 'Food Truck', cost: 8000, yieldCash: 12000, yieldClout: 15, yieldAura: 8, mentalHit: -8, cloutReq: 20, auraReq: 10, nextBranches: ['l3'], passiveYield: 500, miniGame: 'StreetEats' },
    l3: { level: 3, id: 'l3', name: 'Ghost Kitchen', cost: 25000, yieldCash: 35000, yieldClout: 30, yieldAura: 15, mentalHit: -12, cloutReq: 50, auraReq: 25, nextBranches: ['l4'], passiveYield: 2000, miniGame: 'StreetEats' },
    l4: { level: 4, id: 'l4', name: 'Brick & Mortar', cost: 80000, yieldCash: 110000, yieldClout: 60, yieldAura: 30, mentalHit: -15, cloutReq: 100, auraReq: 50, nextBranches: ['l5'], passiveYield: 8000, miniGame: 'StreetEats' },
    l5: { level: 5, id: 'l5', name: 'Mini-Chain', cost: 250000, yieldCash: 350000, yieldClout: 120, yieldAura: 60, mentalHit: -20, cloutReq: 200, auraReq: 100, passiveYield: 25000, miniGame: 'StreetEats' }
  }
};

HUSTLES.cleaning = {
  id: 'cleaning',
  name: 'Cleaning Services',
  tier: 'MUD',
  icon: '🧹',
  description: 'Someone has to do it.',
  miniGame: 'ScoopThePoop',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1',
      name: 'Dog Walker', cost: 0,
      yieldCash: 800, yieldClout: 1, yieldAura: 0,
      mentalHit: -8, cloutReq: 0, auraReq: 0,
      nextBranches: ['l2'],
      miniGame: 'ScoopThePoop' },
    l2: { level: 2, id: 'l2',
      name: 'Home Cleaner', cost: 500,
      yieldCash: 2500, yieldClout: 3, yieldAura: 0,
      mentalHit: -10, cloutReq: 10, auraReq: 0,
      nextBranches: ['l3'],
      miniGame: 'ScoopThePoop' },
    l3: { level: 3, id: 'l3',
      name: 'Cleaning Company', cost: 5000,
      yieldCash: 8000, yieldClout: 8, yieldAura: 2,
      mentalHit: -12, cloutReq: 30, auraReq: 0,
      miniGame: 'ScoopThePoop' },
  }
};

HUSTLES.h_sign_spinner = {
  id: 'h_sign_spinner',
  name: 'Human Billboard',
  title: 'Human Billboard',
  description: 'Dress up like a giant taco and spin directional signs to drive traffic to dying local bistros.',
  tier: 'MUD',
  icon: '🪧',
  hasPanel: true,
  panelType: 'SIGN_SPINNER_GAME',
  basePayout: 15,
  baseClout: 3,
  mentalHealthCost: 5,
  levels: [
    { level: 1, reqClout: 0, cloutReq: 0, multiplier: 1.0, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 },
    { level: 2, reqClout: 60, cloutReq: 60, multiplier: 1.4, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 },
    { level: 3, reqClout: 180, cloutReq: 180, multiplier: 1.9, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 }
  ]
};

// STREET Tier Hustles (Target: ~$3,000 profit/month, ~30 months)
HUSTLES.cc = {
  id: 'cc',
  name: 'Content Creation',
  tier: 'STREET',
  icon: '📱',
  description: 'Build your audience',
  miniGame: 'ContentCreation',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Create Content', cost: 0, yieldCash: 4000, yieldClout: 3, yieldAura: 1, mentalHit: -10, cloutReq: 0, auraReq: 0, nextBranches: ['l2'], miniGame: 'ContentCreation' },
    l2: { level: 2, id: 'l2', name: 'Viral Series', cost: 15000, yieldCash: 35000, yieldClout: 12, yieldAura: 8, mentalHit: -15, cloutReq: 150, auraReq: 50, nextBranches: ['l3'], miniGame: 'ContentCreation' },
    l3: { level: 3, id: 'l3', name: 'Media Channel', cost: 100000, yieldCash: 220000, yieldClout: 35, yieldAura: 20, mentalHit: -25, cloutReq: 400, auraReq: 200, miniGame: 'ContentCreation' },
  },
};

HUSTLES.pod = {
  id: 'pod',
  name: 'Podcast',
  tier: 'STREET',
  icon: '🎙️',
  description: 'Find your voice',
  miniGame: 'PodcastFlowState',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Record Episode', cost: 3000, yieldCash: 12000, yieldClout: 3, yieldAura: 1, mentalHit: -5, cloutReq: 0, auraReq: 0, passiveYield: 200, nextBranches: ['l2'], miniGame: 'PodcastFlowState' },
    l2: { level: 2, id: 'l2', name: 'Guest Interview', cost: 25000, yieldCash: 60000, yieldClout: 10, yieldAura: 5, mentalHit: -10, cloutReq: 80, auraReq: 40, passiveYield: 800, nextBranches: ['l3'], miniGame: 'PodcastFlowState' },
    l3: { level: 3, id: 'l3', name: 'Spotify Exclusive', cost: 120000, yieldCash: 280000, yieldClout: 28, yieldAura: 15, mentalHit: -20, cloutReq: 300, auraReq: 150, passiveYield: 3000, nextBranches: ['l4'], miniGame: 'PodcastFlowState' },
    l4: { level: 4, id: 'l4', name: 'Global Network', cost: 500000, yieldCash: 1100000, yieldClout: 85, yieldAura: 45, mentalHit: -35, cloutReq: 800, auraReq: 400, passiveYield: 15000, miniGame: 'PodcastFlowState' }
  },
};

HUSTLES.vintage = {
  id: 'vintage',
  name: 'Vintage Reselling',
  tier: 'STREET',
  icon: '🧥',
  description: 'Thrift flips and archival pieces',
  miniGame: 'PinchToInspect',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Thrift Flip', cost: 1000, yieldCash: 1500, yieldClout: 5, yieldAura: 5, mentalHit: -8, cloutReq: 30, auraReq: 20, nextBranches: ['l2'], miniGame: 'PinchToInspect' },
    l2: { level: 2, id: 'l2', name: 'Showroom Space', cost: 12000, yieldCash: 18000, yieldClout: 15, yieldAura: 15, mentalHit: -15, cloutReq: 60, auraReq: 40, nextBranches: ['l3'], miniGame: 'PinchToInspect' },
    l3: { level: 3, id: 'l3', name: 'Archival Gallery', cost: 45000, yieldCash: 65000, yieldClout: 40, yieldAura: 40, mentalHit: -22, cloutReq: 120, auraReq: 80, miniGame: 'PinchToInspect' }
  }
};

HUSTLES.techFlip = {
  id: 'techFlip',
  name: 'Tech Flipping',
  tier: 'STREET',
  icon: '💻',
  description: 'Refurbish and resell electronics',
  miniGame: 'TechRepairDrag',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Basic Refurb', cost: 1500, yieldCash: 2200, yieldClout: 5, yieldAura: 2, mentalHit: -9, cloutReq: 25, auraReq: 15, nextBranches: ['l2'], miniGame: 'TechRepairDrag' },
    l2: { level: 2, id: 'l2', name: 'Bulk Repair Shop', cost: 18000, yieldCash: 26000, yieldClout: 15, yieldAura: 8, mentalHit: -18, cloutReq: 50, auraReq: 30, nextBranches: ['l3'], miniGame: 'TechRepairDrag' },
    l3: { level: 3, id: 'l3', name: 'Hardware Customization', cost: 55000, yieldCash: 80000, yieldClout: 35, yieldAura: 15, mentalHit: -25, cloutReq: 100, auraReq: 60, miniGame: 'TechRepairDrag' }
  }
};

HUSTLES.audio = {
  id: 'audio',
  name: 'Music Production',
  tier: 'STREET',
  icon: '🎹',
  description: 'Manage a roster and hunt for Grammys',
  miniGame: 'BeatSequence',
  hasPanel: true,
  panelType: 'MUSIC_PRODUCTION',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Bedroom Producer', cost: 2500, yieldCash: 3500, yieldClout: 20, yieldAura: 15, mentalHit: -12, cloutReq: 40, auraReq: 30, nextBranches: ['l2'], miniGame: 'BeatSequence' },
    l2: { level: 2, id: 'l2', name: 'Independent Label', cost: 10000, yieldCash: 15000, yieldClout: 40, yieldAura: 30, mentalHit: -15, cloutReq: 80, auraReq: 50, nextBranches: ['l3'], miniGame: 'BeatSequence' },
    l3: { level: 3, id: 'l3', name: 'Major Distribution', cost: 75000, yieldCash: 110000, yieldClout: 120, yieldAura: 80, mentalHit: -25, cloutReq: 250, auraReq: 150, nextBranches: ['l4'], miniGame: 'BeatSequence' },
    l4: { level: 4, id: 'l4', name: 'Global Records', cost: 250000, yieldCash: 380000, yieldClout: 400, yieldAura: 200, mentalHit: -40, cloutReq: 600, auraReq: 400, miniGame: 'BeatSequence' }
  }
};

HUSTLES.r_pr_campaign = {
  id: 'r_pr_campaign',
  name: 'PR Campaign',
  tier: 'STREET',
  icon: '📢',
  description: 'Build your reputation',
  miniGame: 'WordTap',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'PR Campaign', cost: 1000, yieldCash: 0, yieldClout: 15, yieldAura: 10, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'], miniGame: 'WordTap' },
    l2: { level: 2, id: 'l2', name: 'Regional PR', cost: 5000, yieldCash: 0, yieldClout: 40, yieldAura: 25, mentalHit: -8, cloutReq: 50, auraReq: 30, nextBranches: ['l3'], miniGame: 'WordTap' },
    l3: { level: 3, id: 'l3', name: 'National PR Firm', cost: 20000, yieldCash: 0, yieldClout: 100, yieldAura: 60, mentalHit: -12, cloutReq: 100, auraReq: 60, miniGame: 'WordTap' },
  },
};

HUSTLES.power_nap = {
  id: 'power_nap',
  name: 'Power Nap',
  tier: 'STREET',
  icon: '😴',
  description: 'Regain mental health',
  startBranchId: 'l1',
  hasPanel: true,
  panelType: 'REST',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Power Nap', cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 15, cloutReq: 0, auraReq: 0, shieldTurns: 2, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'The Perfect Brew', cost: 200, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 25, cloutReq: 10, auraReq: 0, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Constellation Tracing', cost: 2000, yieldCash: 0, yieldClout: 10, yieldAura: 10, mentalHit: 50, cloutReq: 30, auraReq: 15 },
  },
};

HUSTLES.h_review_farm = {
  id: 'h_review_farm',
  name: 'Reputation Laundry',
  title: 'Reputation Laundry',
  description: 'Manage a click-farm botnet to post 5-star review spam for shady clients and review-bomb rivals.',
  tier: 'STARTUP',
  icon: '🤖',
  hasPanel: true,
  panelType: 'REVIEW_FARM_GAME',
  basePayout: 210,
  baseClout: 30,
  mentalHealthCost: 9,
  levels: [
    { level: 1, reqClout: 0, cloutReq: 0, multiplier: 1.0, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 },
    { level: 2, reqClout: 400, cloutReq: 400, multiplier: 1.5, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 },
    { level: 3, reqClout: 1000, cloutReq: 1000, multiplier: 2.1, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 }
  ]
};

// STARTUP Tier Hustles (Target: ~$25,000 profit/month, ~30 months)
HUSTLES.drop = {
  id: 'drop',
  name: 'Dropshipping',
  tier: 'STARTUP',
  icon: '📦',
  description: 'Middleman your way to wealth',
  miniGame: 'SwipeAuthentic',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Basic Store', cost: 4000, yieldCash: 15000, yieldClout: 2, yieldAura: 2, mentalHit: -10, cloutReq: 20, auraReq: 10, nextBranches: ['l2'], miniGame: 'SwipeAuthentic' },
    l2: { level: 2, id: 'l2', name: 'Automated Store', cost: 30000, yieldCash: 85000, yieldClout: 6, yieldAura: 4, mentalHit: -18, cloutReq: 80, auraReq: 40, nextBranches: ['l3'], miniGame: 'SwipeAuthentic' },
    l3: { level: 3, id: 'l3', name: 'Global Supply Chain', cost: 200000, yieldCash: 500000, yieldClout: 18, yieldAura: 10, mentalHit: -25, cloutReq: 250, auraReq: 150, miniGame: 'SwipeAuthentic' }
  }
};

HUSTLES.sw = {
  id: 'sw',
  name: 'Streetwear',
  tier: 'STARTUP',
  icon: '👕',
  description: 'Building a global hype brand',
  miniGame: 'StreetwearMatch',
  hasPanel: true,
  panelType: 'STREETWEAR',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Screenprint Tees', cost: 0, yieldCash: 12000, yieldClout: 4, yieldAura: 2, mentalHit: -15, cloutReq: 50, auraReq: 40, nextBranches: ['l2'] },
    l2: { id: 'l2', name: 'Pop-Up Tour', level: 2, cost: 100000, yieldCash: 350000, yieldClout: 40, yieldAura: 25, mentalHit: -15, cloutReq: 120, auraReq: 80, nextBranches: ['l3'] },
    l3: { id: 'l3', name: 'Flagship Store', level: 3, cost: 500000, yieldCash: 1800000, yieldClout: 100, yieldAura: 60, mentalHit: -22, cloutReq: 400, auraReq: 400 }
  }
};

HUSTLES.smm = {
  id: 'smm',
  name: 'SMM Agency',
  tier: 'STARTUP',
  icon: '📈',
  description: 'Scale your agency with high-ticket clients',
  miniGame: 'HashtagTap',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Freelance SMM', cost: 15000, yieldCash: 40000, yieldClout: 6, yieldAura: 4, mentalHit: -10, cloutReq: 30, auraReq: 20, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Agency Partner', cost: 120000, yieldCash: 350000, yieldClout: 18, yieldAura: 12, mentalHit: -15, cloutReq: 120, auraReq: 80, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Full Scale Agency', cost: 500000, yieldCash: 1200000, yieldClout: 45, yieldAura: 30, mentalHit: -22, cloutReq: 400, auraReq: 400 }
  }
};

HUSTLES.gig = {
  id: 'gig',
  name: 'Runner Fleet',
  tier: 'STARTUP',
  icon: '🚚',
  description: 'Scale your logistics and fleet management',
  miniGame: 'RunnerRoute',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Hire Runner', cost: 20000, yieldCash: 50000, yieldClout: 4, yieldAura: 2, mentalHit: -10, cloutReq: 40, auraReq: 20, passiveYield: 1000, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'City Dispatch', cost: 150000, yieldCash: 400000, yieldClout: 12, yieldAura: 8, mentalHit: -15, cloutReq: 120, auraReq: 80, passiveYield: 4000, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Logistics Hub', cost: 700000, yieldCash: 1600000, yieldClout: 35, yieldAura: 20, mentalHit: -20, cloutReq: 400, auraReq: 400, passiveYield: 20000 }
  }
};

HUSTLES.meme = {
  id: 'meme',
  name: 'Meme Coins',
  tier: 'STARTUP',
  icon: '🪙',
  description: 'Manipulate the markets for high-tier gains',
  miniGame: 'MemeCoinPump',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Shitcoin Gamble', cost: 1000, yieldCash: 1500, yieldClout: 1, yieldAura: 4, mentalHit: -25, cloutReq: 20, auraReq: 50, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Influencer Launch', cost: 15000, yieldCash: 22000, yieldClout: 3, yieldAura: 10, mentalHit: -40, cloutReq: 100, auraReq: 100, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Exchange Listing', cost: 100000, yieldCash: 150000, yieldClout: 10, yieldAura: 25, mentalHit: -60, cloutReq: 600, auraReq: 400 }
  }
};

HUSTLES.saas_mvp = {
  id: 'saas_mvp',
  name: 'SaaS MVP',
  tier: 'STARTUP',
  icon: '💻',
  description: 'Software as a Service',
  miniGame: 'DragScale',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', cost: 30000, yieldCash: 50000, yieldClout: 5, yieldAura: 2, mentalHit: -15, cloutReq: 50, auraReq: 50, passiveYield: 2000, nextBranches: ['l2'] },
    l2: { id: 'l2', name: 'Series A', level: 2, cost: 100000, yieldCash: 160000, yieldClout: 15, yieldAura: 10, mentalHit: -20, cloutReq: 120, auraReq: 80, passiveYield: 6000, nextBranches: ['l3'] },
    l3: { id: 'l3', name: 'Unicorn', level: 3, cost: 400000, yieldCash: 650000, yieldClout: 40, yieldAura: 20, mentalHit: -30, cloutReq: 250, auraReq: 150, passiveYield: 15000, nextBranches: ['l4'] },
    l4: { id: 'l4', name: 'Tech Hegemony', level: 4, cost: 1500000, yieldCash: 2500000, yieldClout: 100, yieldAura: 50, mentalHit: -45, cloutReq: 600, auraReq: 300, passiveYield: 50000 }
  }
};

HUSTLES.agency_scale = {
  id: 'agency_scale',
  name: 'Agency Scale',
  tier: 'STARTUP',
  icon: '🏢',
  description: 'High-ticket service fulfillment',
  miniGame: 'TapAssign',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', cost: 50000, yieldCash: 85000, yieldClout: 15, yieldAura: 10, mentalHit: -20, cloutReq: 150, auraReq: 100, passiveYield: 4000, nextBranches: ['l2'] },
    l2: { id: 'l2', name: 'Regional Agency', level: 2, cost: 200000, yieldCash: 350000, yieldClout: 30, yieldAura: 20, mentalHit: -18, cloutReq: 200, auraReq: 125, nextBranches: ['l3'] },
    l3: { id: 'l3', name: 'National Network', level: 3, cost: 800000, yieldCash: 1400000, yieldClout: 60, yieldAura: 40, mentalHit: -25, cloutReq: 300, auraReq: 200 }
  }
};

HUSTLES.ecom_brand = {
  id: 'ecom_brand',
  name: 'E-com Brand',
  tier: 'STARTUP',
  icon: '🛒',
  description: 'Private label consumer goods',
  miniGame: 'EcomCatch',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', cost: 40000, yieldCash: 65000, yieldClout: 40, yieldAura: 25, mentalHit: -22, cloutReq: 200, auraReq: 150, passiveYield: 4000, nextBranches: ['l2'] },
    l2: { id: 'l2', name: 'Warehouse Automation', level: 2, cost: 100000, yieldCash: 160000, yieldClout: 80, yieldAura: 40, mentalHit: -22, cloutReq: 300, auraReq: 200, nextBranches: ['l3'] },
    l3: { id: 'l3', name: 'Global Fulfillment', level: 3, cost: 300000, yieldCash: 500000, yieldClout: 200, yieldAura: 100, mentalHit: -30, cloutReq: 500, auraReq: 300 }
  }
};

HUSTLES.therapy_session = {
  id: 'therapy_session',
  name: 'Therapy Session',
  tier: 'STARTUP',
  icon: '🛋️',
  description: 'Regain mental health',
  startBranchId: 'l1',
  hasPanel: true,
  panelType: 'REST',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Therapy Session', cost: 10000, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 40, cloutReq: 0, auraReq: 0, shieldTurns: 3, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Constellation Tracing', cost: 12000, yieldCash: 0, yieldClout: 10, yieldAura: 10, mentalHit: 50, cloutReq: 30, auraReq: 15, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Thought Clouds', cost: 25000, yieldCash: 0, yieldClout: 25, yieldAura: 25, mentalHit: 80, cloutReq: 100, auraReq: 50 },
  },
};

HUSTLES.h_talent_agent = {
  id: 'h_talent_agent',
  name: 'Boutique Talent Agency',
  title: 'Boutique Talent Agency',
  description: 'Sign unpolished local creators and high-school athletes. Exploit their image rights for massive percentages.',
  tier: 'CORPORATE',
  icon: '🎭',
  hasPanel: true,
  panelType: 'TALENT_AGENT_GAME',
  basePayout: 450,
  baseClout: 80,
  mentalHealthCost: 12,
  levels: [
    { level: 1, reqClout: 0, cloutReq: 0, multiplier: 1.0, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 },
    { level: 2, reqClout: 1500, cloutReq: 1500, multiplier: 1.6, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 },
    { level: 3, reqClout: 3500, cloutReq: 3500, multiplier: 2.2, auraReq: 0, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0 }
  ]
};

// CORPORATE Tier Hustles (Target: ~$250,000 profit/month, ~40 months)
HUSTLES.festival = {
  id: 'festival',
  name: 'Music Festival',
  tier: 'CORPORATE',
  icon: '🎸',
  description: 'Organize a massive event',
  miniGame: 'FestivalCrowdSurge',
  hasPanel: true,
  panelType: 'FESTIVAL',
  levels: [
    { level: 1, id: 'l1', cost: 200000, yieldCash: 350000, yieldClout: 20, yieldAura: 20, mentalHit: -40, cloutReq: 300, auraReq: 300 },
  ]
};

HUSTLES.global_franchise = {
  id: 'global_franchise',
  name: 'Global Franchise',
  tier: 'CORPORATE',
  icon: '🍔',
  description: 'Scalable standardized success',
  miniGame: 'Roulette',
  levels: [
    { level: 1, id: 'l1', cost: 500000, yieldCash: 1000000, yieldClout: 12, yieldAura: 6, mentalHit: -30, cloutReq: 400, auraReq: 400, passiveYield: 20000 },
    { level: 2, id: 'l2', cost: 3000000, yieldCash: 6500000, yieldClout: 30, yieldAura: 15, mentalHit: -40, cloutReq: 800, auraReq: 800, passiveYield: 60000 },
    { level: 3, id: 'l3', cost: 12000000, yieldCash: 28000000, yieldClout: 70, yieldAura: 40, mentalHit: -50, cloutReq: 1500, auraReq: 1200, passiveYield: 150000 },
    { level: 4, id: 'l4', cost: 40000000, yieldCash: 100000000, yieldClout: 200, yieldAura: 120, mentalHit: -65, cloutReq: 3000, auraReq: 2500, passiveYield: 400000 },
  ]
};

HUSTLES.data_analytics = {
  id: 'data_analytics',
  name: 'Data Analytics',
  tier: 'CORPORATE',
  icon: '📊',
  description: 'Sell insights to corporations',
  miniGame: 'HigherLower',
  hasPanel: true,
  panelType: 'DATA_ANALYTICS',
  levels: [
    { level: 1, id: 'l1', cost: 1000000, yieldCash: 2500000, yieldClout: 15, yieldAura: 8, mentalHit: -25, cloutReq: 400, auraReq: 400, passiveYield: 25000 },
    { level: 2, id: 'l2', cost: 5000000, yieldCash: 12000000, yieldClout: 40, yieldAura: 20, mentalHit: -35, cloutReq: 1200, auraReq: 1200, passiveYield: 80000 },
    { level: 3, id: 'l3', cost: 20000000, yieldCash: 50000000, yieldClout: 100, yieldAura: 60, mentalHit: -50, cloutReq: 3000, auraReq: 3000, passiveYield: 250000 },
  ]
};

HUSTLES.crypto_mining = {
  id: 'crypto_mining',
  name: 'Crypto Mining',
  tier: 'CORPORATE',
  icon: '⛏️',
  description: 'Secure the network, secure the bag',
  miniGame: 'CryptoMineRush',
  hasPanel: true,
  panelType: 'CRYPTO_MINING',
  levels: [
    { level: 1, id: 'l1', cost: 100000, yieldCash: 0, yieldClout: 20, yieldAura: 50, mentalHit: -10, cloutReq: 400, auraReq: 400, passiveYield: 10000 },
    { level: 2, id: 'l2', cost: 500000, yieldCash: 0, yieldClout: 40, yieldAura: 100, mentalHit: -20, cloutReq: 600, auraReq: 600, passiveYield: 35000 },
    { level: 3, id: 'l3', cost: 2000000, yieldCash: 0, yieldClout: 120, yieldAura: 250, mentalHit: -40, cloutReq: 800, auraReq: 800, passiveYield: 120000 },
  ]
};

HUSTLES.virtual_assistant_agency = {
  id: 'virtual_assistant_agency',
  name: 'VA Agency',
  tier: 'CORPORATE',
  icon: '🤝',
  description: 'Arbitrage global labor',
  miniGame: 'Blackjack',
  hasPanel: true,
  panelType: 'VA_AGENCY',
  levels: [
    { level: 1, id: 'l1', cost: 50000, yieldCash: 80000, yieldClout: 15, yieldAura: 10, mentalHit: -18, cloutReq: 400, auraReq: 400, passiveYield: 2000 },
  ]
};

HUSTLES.lobbying = {
  id: 'lobbying',
  name: 'Lobbying Firm',
  tier: 'CORPORATE',
  icon: '🏛️',
  description: 'Influence politics, reduce negative events',
  miniGame: 'HigherLower',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Local Influence', cost: 5000000, yieldCash: 0, yieldClout: 100, yieldAura: 50, mentalHit: -10, cloutReq: 500, auraReq: 500, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'National Reach', cost: 10000000, yieldCash: 0, yieldClout: 200, yieldAura: 100, mentalHit: -15, cloutReq: 800, auraReq: 800, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'Global Influence', cost: 20000000, yieldCash: 0, yieldClout: 400, yieldAura: 200, mentalHit: -20, cloutReq: 1200, auraReq: 1200 },
  },
};

HUSTLES.disaster = {
  id: 'disaster',
  name: 'Disaster Recovery',
  tier: 'CORPORATE',
  icon: '🛡️',
  description: 'Insurance and crisis management',
  miniGame: 'Roulette',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Basic Insurance', cost: 5000000, yieldCash: 0, yieldClout: 50, yieldAura: 25, mentalHit: -8, cloutReq: 500, auraReq: 500, nextBranches: ['l2'] },
    l2: { level: 2, id: 'l2', name: 'Crisis Team', cost: 10000000, yieldCash: 0, yieldClout: 100, yieldAura: 50, mentalHit: -12, cloutReq: 800, auraReq: 800, nextBranches: ['l3'] },
    l3: { level: 3, id: 'l3', name: 'PR Empire', cost: 20000000, yieldCash: 0, yieldClout: 200, yieldAura: 100, mentalHit: -15, cloutReq: 1200, auraReq: 1200 },
  },
};

HUSTLES.wellness_retreat = {
  id: 'wellness_retreat',
  name: 'Wellness Retreat',
  tier: 'CORPORATE',
  icon: '🧘',
  description: 'Regain mental health',
  miniGame: 'BioFeedbackRetreat',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Wellness Retreat', cost: 100000, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 60, cloutReq: 0, auraReq: 0, shieldTurns: 4 },
  },
};

// ELITE Tier Hustles (Target: ~$1.5M profit/month, ~33 months)
HUSTLES.psychiatrist = {
  id: 'psychiatrist',
  name: 'Psychiatrist',
  tier: 'ELITE',
  icon: '🧠',
  description: 'Elite mental health care',
  miniGame: 'QuickReaction',
  startBranchId: 'l1',
  branches: {
    l1: { id: 'l1', name: 'Psychiatrist Session', level: 1, cost: 5000000, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 80, cloutReq: 0, auraReq: 0, shieldTurns: 6 },
  },
};

HUSTLES.real_estate_empire = {
  id: 'real_estate_empire',
  name: 'Real Estate Empire',
  tier: 'ELITE',
  icon: '🏙️',
  description: 'Dominating the skyline',
  miniGame: 'BoardroomBattle',
  hasPanel: true,
  panelType: 'REAL_ESTATE',
  branches: {
    l1: { level: 1, id: 'l1', cost: 5000000, yieldCash: 0, yieldClout: 100, yieldAura: 80, mentalHit: -30, cloutReq: 1000, auraReq: 1000 },
  }
};

HUSTLES.venture_capital = {
  id: 'venture_capital',
  name: 'Venture Capital',
  tier: 'ELITE',
  icon: '💼',
  description: 'Invest in the next unicorn',
  miniGame: 'VCPitchRoom',
  hasPanel: true,
  panelType: 'VENTURE_CAPITAL',
  branches: {
    l1: { level: 1, id: 'l1', cost: 1000000, yieldCash: 0, yieldClout: 120, yieldAura: 100, mentalHit: -25, cloutReq: 1200, auraReq: 1200 },
  }
};

HUSTLES.hedgefund = {
  id: 'hedgefund',
  name: 'Hedge Fund',
  tier: 'ELITE',
  icon: '📊',
  description: 'High-risk market trading',
  miniGame: 'ReactionGrid',
  startBranchId: 'l1',
  branches: {
    l1: { id: 'l1', name: 'Long/Short Equity', level: 1, cost: 20000000, yieldCash: 35000000, yieldClout: 40, yieldAura: 25, mentalHit: -15, cloutReq: 1000, auraReq: 1000, nextBranches: ['l2'] },
    l2: { id: 'l2', name: 'Global Macro', level: 2, cost: 80000000, yieldCash: 150000000, yieldClout: 100, yieldAura: 60, mentalHit: -20, cloutReq: 2500, auraReq: 2500, nextBranches: ['l3'] },
    l3: { id: 'l3', name: 'Aggressive Strategies', level: 3, cost: 300000000, yieldCash: 650000000, yieldClout: 300, yieldAura: 150, mentalHit: -25, cloutReq: 8000, auraReq: 8000 },
  },
};

HUSTLES.privateequity = {
  id: 'privateequity',
  name: 'Private Equity',
  tier: 'ELITE',
  icon: '🏢',
  description: 'Buy and transform companies',
  miniGame: 'BoardroomBattle',
  startBranchId: 'l1',
  branches: {
    l1: { id: 'l1', name: 'Small Buyouts', level: 1, cost: 30000000, yieldCash: 55000000, yieldClout: 60, yieldAura: 40, mentalHit: -18, cloutReq: 1200, auraReq: 1200, nextBranches: ['l2'] },
    l2: { id: 'l2', name: 'Mid Market', level: 2, cost: 120000000, yieldCash: 250000000, yieldClout: 150, yieldAura: 100, mentalHit: -22, cloutReq: 3500, auraReq: 3500, nextBranches: ['l3'] },
    l3: { id: 'l3', name: 'Leveraged Buyouts', level: 3, cost: 500000000, yieldCash: 1200000000, yieldClout: 500, yieldAura: 350, mentalHit: -28, cloutReq: 10000, auraReq: 10000 },
  },
};

// MOGUL Tier Hustles (Target: ~$5M profit/month, ~40 months)
HUSTLES.film_studio = {
  id: 'film_studio',
  name: 'Film Studio',
  tier: 'MOGUL',
  icon: '🎬',
  description: 'Produce blockbusters. Greenlight or pass?',
  miniGame: 'SwipeAuthentic',
  hasPanel: true,
  panelType: 'FILM_STUDIO',
  levels: [
    { level: 1, cost: 500000000, yieldCash: 1250000000, yieldClout: 500, yieldAura: 500, mentalHit: -15, cloutReq: 2500, auraReq: 2500, passiveYield: 0 }
  ]
};

HUSTLES.fight_promoter = {
  id: 'fight_promoter',
  name: 'Fight Promoter',
  tier: 'MOGUL',
  icon: '🥊',
  description: "High risk, high reward. Early losses are part of the game — stick with it.",
  miniGame: 'MarketPredictor',
  levels: [
    { level: 1, cost: 800000000, yieldCash: 800000000, yieldClout: 800, yieldAura: 400, mentalHit: -10, cloutReq: 3000, auraReq: 3000, passiveYield: 0 }
  ]
};

HUSTLES.space_investment = {
  id: 'space_investment',
  name: 'Space Investment',
  tier: 'MOGUL',
  icon: '🚀',
  description: "Long-term play. Level 1 burns cash. Returns compound at level 3+.",
  miniGame: 'HoldHype',
  hasPanel: true,
  panelType: 'SPACE_INVESTMENT',
  levels: [
    { level: 1, cost: 500000000, yieldCash: 500000000, yieldClout: 250, yieldAura: 200, mentalHit: -20, cloutReq: 4000, auraReq: 4000, passiveYield: 0 }
  ]
};

HUSTLES.philanthropy_empire = {
  id: 'philanthropy_empire',
  name: 'Philanthropy Empire',
  tier: 'MOGUL',
  icon: '🤝',
  description: 'Solve world hunger for the tax break. Buy immortality.',
  miniGame: 'MarketPredictor',
  hasPanel: true,
  panelType: 'PHILANTHROPY',
  levels: [
    { level: 1, cost: 50000000, yieldCash: 0, yieldClout: 200, yieldAura: 500, mentalHit: 20, cloutReq: 4000, auraReq: 4000, passiveYield: 0 }
  ]
};

HUSTLES.media_empire = {
  id: 'media_empire',
  name: 'Media Empire',
  tier: 'MOGUL',
  icon: '📺',
  description: 'Control the narrative across TV and streaming',
  levels: [
    { level: 1, cost: 200000000, yieldCash: 450000000, yieldClout: 100, yieldAura: 60, mentalHit: -15, cloutReq: 3500, auraReq: 3500, passiveYield: 5000000 },
    { level: 2, cost: 800000000, yieldCash: 1800000000, yieldClout: 250, yieldAura: 150, mentalHit: -20, cloutReq: 8000, auraReq: 8000, passiveYield: 25000000 },
    { level: 3, cost: 2500000000, yieldCash: 6000000000, yieldClout: 600, yieldAura: 400, mentalHit: -25, cloutReq: 25000, auraReq: 25000, passiveYield: 150000000 }
  ],
  miniGame: 'TapApprove'
};

HUSTLES.luxury_conglomerate = {
  id: 'luxury_conglomerate',
  name: 'Luxury Conglomerate',
  tier: 'MOGUL',
  icon: '💎',
  description: 'Acquire high-end fashion brands',
  levels: [
    { level: 1, cost: 150000000, yieldCash: 350000000, yieldClout: 60, yieldAura: 100, mentalHit: -12, cloutReq: 3500, auraReq: 3500, passiveYield: 4000000 },
    { level: 2, cost: 600000000, yieldCash: 1400000000, yieldClout: 180, yieldAura: 250, mentalHit: -18, cloutReq: 8000, auraReq: 8000, passiveYield: 20000000 },
    { level: 3, cost: 2000000000, yieldCash: 5000000000, yieldClout: 500, yieldAura: 800, mentalHit: -22, cloutReq: 25000, auraReq: 25000, passiveYield: 100000000 }
  ],
  miniGame: 'DragMerge'
};

// PRESIDENT Tier Hustles (Target: Pinnacle, high scale)
HUSTLES.data_monopoly = {
  id: 'data_monopoly',
  name: 'Data Monopoly',
  tier: 'PRESIDENT',
  icon: '🔒',
  description: 'Own every byte of personal information',
  miniGame: 'ReactionGrid',
  levels: [
    { level: 1, id: 'l1', cost: 10000000000, yieldCash: 18000000000, yieldClout: 1500, yieldAura: 800, mentalHit: -60, cloutReq: 20000, auraReq: 20000, passiveYield: 300000000 },
  ]
};

HUSTLES.central_bank_play = {
  id: 'central_bank_play',
  name: 'Central Bank Play',
  tier: 'PRESIDENT',
  icon: '🏦',
  description: 'Influence interest rates for profit',
  miniGame: 'BalanceScale',
  levels: [
    { level: 1, id: 'l1', cost: 5000000000, yieldCash: 9000000000, yieldClout: 1500, yieldAura: 600, mentalHit: -70, cloutReq: 40000, auraReq: 40000 },
  ]
};

HUSTLES.legacy_fund = {
  id: 'legacy_fund',
  name: 'Legacy Fund',
  tier: 'PRESIDENT',
  icon: '🏛️',
  description: 'Ensuring your name lasts forever',
  miniGame: 'PatternMemory',
  levels: [
    { level: 1, id: 'l1', cost: 2000000000, yieldCash: 0, yieldClout: 2000, yieldAura: 5000, mentalHit: 100, cloutReq: 20000, auraReq: 20000 },
  ]
};

HUSTLES.president_campaign = {
  id: 'president_campaign',
  name: 'Campaign Trail',
  tier: 'PRESIDENT',
  icon: '🇺🇸',
  description: 'Run for the highest office in the land',
  miniGame: 'TapApprove',
  hasPanel: true,
  panelType: 'PRESIDENT_CAMPAIGN',
  levels: [
    { level: 1, cost: 100000000, yieldCash: 0, yieldClout: 500, yieldAura: 500, mentalHit: -50, cloutReq: 6000, auraReq: 6000, passiveYield: 0 }
  ]
};

// OPEN Tier Hustles (Sandbox: PinchToZoom)
HUSTLES.open_island = {
  id: 'open_island',
  name: 'Buy an Island',
  tier: 'OPEN',
  icon: '🏝️',
  description: 'Own a private paradise',
  isRepeatable: true,
  miniGame: 'PinchToZoom',
  levels: [
    { level: 1, cost: 500000000, yieldCash: 0, yieldClout: 0, yieldAura: 500, mentalHit: 20, cloutReq: 0, auraReq: 500, passiveYield: 10000000, isRepeatable: true }
  ]
};

HUSTLES.open_sports_league = {
  id: 'open_sports_league',
  name: 'Buy a Sports League',
  tier: 'OPEN',
  icon: '🏆',
  description: 'Own the game',
  isRepeatable: true,
  miniGame: 'PinchToZoom',
  levels: [
    { level: 1, cost: 2000000000, yieldCash: 0, yieldClout: 2000, yieldAura: 500, mentalHit: -10, cloutReq: 2000, auraReq: 500, passiveYield: 50000000, isRepeatable: true }
  ]
};

HUSTLES.open_crypto = {
  id: 'open_crypto',
  name: 'Create a Cryptocurrency',
  tier: 'OPEN',
  icon: '₿',
  description: 'Pump and dump your own coin',
  miniGame: 'CryptoLeverage',
  levels: [
    { level: 1, cost: 100000000, yieldCash: 0, yieldClout: 500, yieldAura: 200, mentalHit: -30, cloutReq: 500, auraReq: 200, passiveYield: 0 }
  ]
};

HUSTLES.open_celebrity = {
  id: 'open_celebrity',
  name: 'Marry a Celebrity',
  tier: 'OPEN',
  icon: '💍',
  description: 'Power couple status',
  miniGame: 'PinchToZoom',
  levels: [
    { level: 1, cost: 5000000, yieldCash: 0, yieldClout: 100, yieldAura: 200, mentalHit: 10, cloutReq: 100, auraReq: 200, passiveYield: 0 }
  ]
};

HUSTLES.open_movie = {
  id: 'open_movie',
  name: 'Fund a Movie',
  tier: 'OPEN',
  icon: '🎬',
  description: 'Finance a Hollywood blockbuster',
  miniGame: 'PinchToZoom',
  hasPanel: true,
  panelType: 'FUND_MOVIE',
  levels: [
    { level: 1, cost: 100000000, yieldCash: 0, yieldClout: 300, yieldAura: 150, mentalHit: -15, cloutReq: 300, auraReq: 150, passiveYield: 0 }
  ]
};

HUSTLES.unique_hustle_deli = {
  id: 'unique_hustle_deli',
  name: 'Family Deli',
  tier: 'STREET',
  icon: '🥪',
  description: 'A legacy of sandwiches. Stable and respected.',
  miniGame: 'FamilyDeli',
  startBranchId: 'l1',
  branches: {
    l1: { level: 1, id: 'l1', name: 'Service Counter', cost: 0, yieldCash: 1200, yieldClout: 2, yieldAura: 5, mentalHit: -5, cloutReq: 0, auraReq: 0, nextBranches: ['l2'], miniGame: 'FamilyDeli' },
    l2: { level: 2, id: 'l2', name: 'Catering Service', cost: 5000, yieldCash: 8000, yieldClout: 10, yieldAura: 15, mentalHit: -8, cloutReq: 30, auraReq: 40, passiveYield: 1000, nextBranches: ['l3'], miniGame: 'FamilyDeli' },
    l3: { level: 3, id: 'l3', name: 'City Institution', cost: 50000, yieldCash: 60000, yieldClout: 50, yieldAura: 100, mentalHit: -10, cloutReq: 150, auraReq: 200, passiveYield: 5000, miniGame: 'FamilyDeli' },
  }
};

HUSTLES.h_global_conglomerate = {
  id: 'h_global_conglomerate',
  name: 'Global Conglomerate',
  tier: 'ELITE',
  icon: '🏢',
  description: 'Manage a massive global conglomerate with extensive industrial and retail operations.',
  hasPanel: true,
  panelType: 'GLOBAL_CONGLOMERATE',
  miniGame: 'BoardroomBattle',
  levels: [
    { level: 1, reqClout: 0, cloutReq: 0, multiplier: 1.0, auraReq: 0, cost: 15000000, yieldCash: 30000000, yieldClout: 100, yieldAura: 80, mentalHit: -15, passiveYield: 2500000 },
    { level: 2, reqClout: 1000, cloutReq: 1000, multiplier: 1.0, auraReq: 1000, cost: 50000000, yieldCash: 110000000, yieldClout: 250, yieldAura: 200, mentalHit: -20, passiveYield: 8000000 },
    { level: 3, reqClout: 3000, cloutReq: 3000, multiplier: 1.0, auraReq: 3000, cost: 150000000, yieldCash: 350000000, yieldClout: 600, yieldAura: 500, mentalHit: -25, passiveYield: 25000000 }
  ]
};
