import type { CabinetMember, PresidentCrisis, ExecutiveOrder, PlayerStats } from '../types/game';
import { MASTERY_ORDER_MAP } from '../config/masteryOrderMap';

export type { CabinetMember, PresidentCrisis, ExecutiveOrder };

const MASTERY_TO_HUSTLE_ID: Record<string, string> = {
  'music_production': 'audio',
  'tech_flipping': 'techFlip',
  'real_estate': 'real_estate_empire',
  'media_empire': 'media_empire',
  'scrap_metal': 'r_scrap',
  'dropshipping': 'drop',
  'street_eats': 'street_eats',
  'labor': 'r_labor',
  'delivery': 'r_delivery',
  'ghost_mode': 'r_ghost_mode',
};

const MASTERY_DISPLAY_NAMES: Record<string, string> = {
  'music_production': 'Music Production',
  'tech_flipping': 'Tech Flipping',
  'real_estate': 'Real Estate',
  'media_empire': 'Media Empire',
  'scrap_metal': 'Scrap Metal',
  'dropshipping': 'Dropshipping',
  'street_eats': 'Street Eats',
  'labor': 'Labor',
  'delivery': 'Delivery',
  'ghost_mode': 'Ghost Mode',
};

export const RIVAL_CABINET_MAP: Record<string, string> = {
  'rival_corp': 'treasury',
  'rival_startup': 'state',
  'rival_2': 'defense',
  'rival_1': 'press',
};

export const getMasteryBonusDetails = (player: PlayerStats, orderId: string) => {
  let bonus = 0;
  const appliedMasteries: string[] = [];

  for (const [masteryKey, orders] of Object.entries(MASTERY_ORDER_MAP)) {
    const hustleId = MASTERY_TO_HUSTLE_ID[masteryKey];
    if (orders.includes(orderId) && player.masteredHustles?.includes(hustleId)) {
      bonus += 0.05;
      appliedMasteries.push(MASTERY_DISPLAY_NAMES[masteryKey] || masteryKey);
    }
  }

  return {
    bonus: Math.min(0.15, bonus),
    masteries: appliedMasteries
  };
};

export const CABINET_ROLES = [
  { id: 'treasury', role: 'Secretary of Treasury', bonusType: 'cash' as const },
  { id: 'state', role: 'Secretary of State', bonusType: 'clout' as const },
  { id: 'defense', role: 'Secretary of Defense', bonusType: 'aura' as const },
  { id: 'press', role: 'Press Secretary', bonusType: 'approval' as const },
];

export const EXECUTIVE_ORDERS: ExecutiveOrder[] = [
  {
    id: 'tax_cut',
    name: 'Middle Class Tax Cut',
    description: 'Boost approval and stimulate the economy.',
    quotes: {
      treasury: "This will stimulate growth but increase the deficit.",
      press: "The voters will love this, sir. It's a guaranteed win in the polls.",
      state: "Domestic focus might worry our allies about our commitment to foreign aid.",
      defense: "Economic strength is the foundation of national security."
    },
    cost: { clout: 50, aura: 20 },
    impact: {
      approval: 10,
      gdp: 5,
      inflation: 1,
      debt: 2,
      demographics: { economy: 15, foreign: -5 },
      passiveCash: 50000,
      heat: 5
    }
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Bill',
    description: 'Large scale jobs program.',
    quotes: {
      treasury: "A long-term investment that will pay dividends for decades.",
      press: "Cutting ribbons on new bridges makes for great TV.",
      state: "Our modernized ports will be the envy of the world.",
      defense: "Strategic infrastructure is vital for rapid troop deployment."
    },
    cost: { cash: 10000000, clout: 100 },
    impact: {
      approval: 15,
      gdp: 10,
      inflation: 0.5,
      debt: 5,
      demographics: { economy: 10, healthcare: 5 },
      passiveCash: 100000,
      heat: 10
    },
    regionalImpacts: { 'Northeast': 10, 'South': 10, 'Midwest': 10, 'West': 10 }
  },
  {
    id: 'deregulation',
    name: 'Financial Deregulation',
    description: 'Boost corporate profits at the cost of stability.',
    quotes: {
      treasury: "Let the markets breathe. Efficiency will soar.",
      press: "Business leaders are cheering, but we need to manage the 'fat cat' narrative.",
      state: "Foreign investors are already lining up.",
      defense: "A strong financial sector is a tool of national power."
    },
    cost: { clout: 20 },
    impact: {
      approval: 5,
      gdp: 8,
      inflation: 2,
      debt: -2,
      demographics: { economy: 20, foreign: 5 },
      passiveCash: 250000,
      heat: 20
    },
    marketEffect: { type: 'CRACKDOWN', duration: 3 },
    delayedImpacts: [
      {
        delay: 3,
        impact: { demographics: { economy: 5 } },
        message: "Financial sectors reporting increased efficiency from deregulation."
      },
      {
        delay: 9,
        impact: { approval: -5, heat: 15 },
        message: "Market volatility increasing due to lack of oversight."
      }
    ]
  },
  {
    id: 'qe',
    name: 'Quantitative Easing',
    description: 'Federal Reserve announces quantitative easing. Markets are surging.',
    quotes: {
      treasury: "This will stimulate growth but may lead to inflation later.",
      press: "Cheap money for everyone. The headline practically writes itself.",
      state: "A strong dollar is good for our global standing.",
      defense: "Economic dominance is key to national security."
    },
    cost: { clout: 50 },
    impact: {
      approval: 5,
      gdp: 12,
      inflation: 4,
      debt: 5,
      demographics: { economy: 15 }
    },
    marketEffect: { type: 'BULL_MARKET', duration: 6 },
    delayedImpacts: [
      {
        delay: 6,
        impact: { approval: -10, inflation: 2 },
        message: "Inflation hit from Quantitative Easing."
      }
    ]
  },
  {
    id: 'tariffs',
    name: 'Trade Tariffs',
    description: 'New trade tariffs imposed. Markets are bracing for impact.',
    quotes: {
      treasury: "This will disrupt supply chains in the short term.",
      press: "Protectionism is popular in the rust belt, but hurts the coasts.",
      state: "Our trading partners are already drafting retaliatory measures.",
      defense: "Reducing reliance on foreign manufacturing is a strategic win."
    },
    cost: { clout: 30 },
    impact: {
      approval: -10,
      gdp: -2,
      inflation: 3,
      debt: -1,
      demographics: { economy: -5, foreign: -10 }
    },
    marketEffect: { type: 'RECESSION', duration: 6 },
    regionalImpacts: { 'Midwest': 5, 'Northeast': -10 },
    delayedImpacts: [
      {
        delay: 12,
        impact: { approval: 15, gdp: 2 },
        message: "Domestic manufacturing boost from Trade Tariffs."
      }
    ]
  },
  {
    id: 'stimulus',
    name: 'Stimulus Package',
    description: 'Massive stimulus package approved. Economy is stabilizing.',
    quotes: {
      treasury: "A necessary injection of liquidity to prevent total collapse.",
      press: "Checks in pockets mean votes in boxes.",
      state: "Showing the world we can take care of our own.",
      defense: "Internal stability is our greatest defense."
    },
    cost: { cash: 5000000, clout: 40 },
    impact: {
      approval: 10,
      gdp: 5,
      inflation: 5,
      debt: 8,
      demographics: { economy: 10, healthcare: 5 }
    },
    marketEffect: { type: 'NORMAL', duration: 3 }
  },
  {
    id: 'healthcare',
    name: 'Universal Healthcare',
    description: 'Significant boost to approval but extremely costly.',
    quotes: {
      treasury: "The cost is astronomical. We'll need to print money or raise taxes.",
      press: "This is your legacy. You'll be the President who finally did it.",
      state: "We're finally catching up to the rest of the developed world.",
      defense: "A healthy population is a more resilient workforce and military."
    },
    cost: { cash: 50000000, clout: 200, aura: 100 },
    impact: {
      approval: 30,
      gdp: 15,
      inflation: 2,
      debt: 15,
      demographics: { healthcare: 40, economy: -10 },
      passiveCash: -500000,
      heat: -10
    }
  },
  {
    id: 'festival',
    name: 'National Arts Festival',
    description: 'A massive celebration of culture and music.',
    cost: { cash: 5000000, clout: 40 },
    impact: { approval: 12, gdp: 2, inflation: 1, debt: 1, demographics: { economy: 5, foreign: 10 } }
  },
  {
    id: 'data_analytics',
    name: 'National Data Initiative',
    description: 'Modernizing government data infrastructure.',
    cost: { cash: 10000000, clout: 60 },
    impact: { approval: 5, gdp: 8, demographics: { economy: 15 }, heat: 5 }
  },
  {
    id: 'crypto_mining',
    name: 'Federal Crypto Reserve',
    description: 'Establishing a national digital asset reserve.',
    cost: { cash: 25000000, clout: 100 },
    impact: { approval: 2, gdp: 10, demographics: { economy: 20 }, heat: 15 }
  },
  {
    id: 'housing_policy',
    name: 'Affordable Housing Act',
    description: 'Subsidies and deregulation to boost housing supply.',
    cost: { cash: 15000000, clout: 80 },
    impact: { approval: 20, gdp: 5, inflation: 1, debt: 3, demographics: { economy: 10, healthcare: 5 } }
  },
  {
    id: 'media_policy',
    name: 'Public Media Grant',
    description: 'Funding for independent and public broadcasting.',
    cost: { cash: 2000000, clout: 30 },
    impact: { approval: 8, debt: 1, demographics: { economy: 5 } }
  },
  {
    id: 'crisis_response',
    name: 'Emergency Relief Fund',
    description: 'Pre-emptive funding for disaster response.',
    cost: { cash: 20000000, clout: 50 },
    impact: { approval: 10, heat: -10, debt: 2 }
  },
  {
    id: 'trade_policy',
    name: 'Open Trade Agreement',
    description: 'Reducing tariffs and boosting global trade.',
    cost: { clout: 60 },
    impact: { approval: 5, gdp: 12, demographics: { foreign: 20, economy: 10 }, heat: 5 }
  },
  {
    id: 'working_class_policy',
    name: 'Street Vendor Protection',
    description: 'Legalizing and supporting small scale street commerce.',
    cost: { clout: 20 },
    impact: { approval: 15, debt: 1, demographics: { economy: 5 }, heat: 5 }
  },
  {
    id: 'labor_policy',
    name: 'Workers Rights Reform',
    description: 'Strengthening unions and labor protections.',
    cost: { clout: 70 },
    impact: { approval: 18, demographics: { economy: -5, healthcare: 10 } }
  },
  {
    id: 'infrastructure_policy',
    name: 'National Highway System',
    description: 'Massive upgrade to national logistics networks.',
    cost: { cash: 30000000, clout: 120 },
    impact: { approval: 10, gdp: 15, inflation: 1, debt: 4, demographics: { economy: 15 } }
  },
  {
    id: 'security_policy',
    name: 'Cybersecurity Act',
    description: 'Protecting national infrastructure from digital threats.',
    cost: { cash: 12000000, clout: 90 },
    impact: { approval: 5, aura: 20, debt: 2, demographics: { foreign: 5 } }
  }
];

export const CRISES: PresidentCrisis[] = [
  {
    id: 'recession',
    name: 'Economic Recession',
    description: 'The market is crashing. Action is needed.',
    monthsRemaining: 3,
    resolutionCost: { cash: 20000000, clout: 50 },
    impact: {
      approval: -15,
      gdp: -10,
      inflation: -2,
      debt: 10,
      demographics: { economy: -25 },
      cash: -5000000
    }
  },
  {
    id: 'scandal',
    name: 'Political Scandal',
    description: 'A leak from the Oval Office has damaged your reputation.',
    monthsRemaining: 2,
    resolutionCost: { clout: 100, aura: 50 },
    impact: {
      approval: -20,
      gdp: -2,
      debt: 2,
      demographics: { foreign: -10 },
      aura: -50
    }
  },
  {
    id: 'unrest',
    name: 'Civil Unrest',
    description: 'Protests are erupting across the country.',
    monthsRemaining: 4,
    resolutionCost: { aura: 100, cash: 5000000 },
    impact: {
      approval: -10,
      gdp: -5,
      inflation: 2,
      debt: 5,
      demographics: { healthcare: -5, economy: -5 },
      heat: 30
    }
  }
];

export function generateCrisis(isSecondTerm: boolean, debt: number = 0, extraRisk: number = 0): PresidentCrisis | null {
  let chance = isSecondTerm ? 0.11 : 0.06;
  if (debt > 80) chance += 0.10;
  chance += extraRisk;

  if (Math.random() > chance) return null;

  const crisis = CRISES[Math.floor(Math.random() * CRISES.length)];
  return {
    ...crisis,
    id: `${crisis.id}_${Date.now()}`
  };
}
