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
    cost: { aura: 50 },
    impact: {
      approval: -5,
      demographics: { economy: 20, foreign: 5 },
      passiveCash: 250000,
      heat: 20
    }
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
      demographics: { healthcare: -5, economy: -5 },
      heat: 30
    }
  }
];

export function generateCrisis(isSecondTerm: boolean): PresidentCrisis | null {
  const chance = isSecondTerm ? 0.11 : 0.06;
  if (Math.random() > chance) return null;

  const crisis = CRISES[Math.floor(Math.random() * CRISES.length)];
  return {
    ...crisis,
    id: `${crisis.id}_${Date.now()}`
  };
}
