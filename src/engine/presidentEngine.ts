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
    cost: { clout: 50, aura: 20 },
    impact: { approval: 10, passiveCash: 50000, heat: 5 }
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Bill',
    description: 'Large scale jobs program.',
    cost: { cash: 10000000, clout: 100 },
    impact: { approval: 15, passiveCash: 100000, heat: 10 }
  },
  {
    id: 'deregulation',
    name: 'Financial Deregulation',
    description: 'Boost corporate profits at the cost of stability.',
    cost: { aura: 50 },
    impact: { approval: -5, passiveCash: 250000, heat: 20 }
  },
  {
    id: 'healthcare',
    name: 'Universal Healthcare',
    description: 'Significant boost to approval but extremely costly.',
    cost: { cash: 50000000, clout: 200, aura: 100 },
    impact: { approval: 30, passiveCash: -500000, heat: -10 }
  }
];

export const CRISES: PresidentCrisis[] = [
  {
    id: 'recession',
    name: 'Economic Recession',
    description: 'The market is crashing. Action is needed.',
    resolutionCost: { cash: 20000000, clout: 50 },
    impact: { approval: -15, cash: -5000000 }
  },
  {
    id: 'scandal',
    name: 'Political Scandal',
    description: 'A leak from the Oval Office has damaged your reputation.',
    resolutionCost: { clout: 100, aura: 50 },
    impact: { approval: -20, aura: -50 }
  },
  {
    id: 'unrest',
    name: 'Civil Unrest',
    description: 'Protests are erupting across the country.',
    resolutionCost: { aura: 100, cash: 5000000 },
    impact: { approval: -10, heat: 30 }
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
