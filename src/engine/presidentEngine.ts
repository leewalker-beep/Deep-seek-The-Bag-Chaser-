import type { CabinetMember, PresidentCrisis, ExecutiveOrder } from '../types/game';

export type { CabinetMember, PresidentCrisis, ExecutiveOrder };

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
    }
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
    marketEffect: { type: 'CRACKDOWN', duration: 3 }
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
    delayedImpact: {
      approval: -10,
      delay: 6,
      message: "Inflation hit from Quantitative Easing."
    }
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
    delayedImpact: {
      approval: 15,
      delay: 12,
      message: "Domestic manufacturing boost from Trade Tariffs."
    }
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

export function generateCrisis(isSecondTerm: boolean, debt: number = 0): PresidentCrisis | null {
  let chance = isSecondTerm ? 0.11 : 0.06;
  if (debt > 80) chance += 0.10;
  if (Math.random() > chance) return null;

  const crisis = CRISES[Math.floor(Math.random() * CRISES.length)];
  return {
    ...crisis,
    id: `${crisis.id}_${Date.now()}`
  };
}
