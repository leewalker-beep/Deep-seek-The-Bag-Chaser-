export interface Specialization {
  id: string;
  name: string;
  description: string;
  cloutTaxMultiplier: number; // 0.1 means 10% kept, 0.9 means 90% kept
  auraTaxMultiplier: number;
  yieldCashMult?: number;
  yieldCloutMult?: number;
  yieldAuraMult?: number;
  heatMult?: number;
  mentalHitMult?: number;
  feeReduction?: number;
  icon: string;
}

export const SPECIALIZATIONS: Specialization[] = [
  {
    id: 'influencer',
    name: 'The Influencer',
    description: 'Protect your Clout at all costs. Gains 20% more Clout but attracts 10% more Heat.',
    cloutTaxMultiplier: 0.9,
    auraTaxMultiplier: 0.5,
    yieldCloutMult: 1.2,
    heatMult: 1.1,
    icon: '🤳'
  },
  {
    id: 'shadow',
    name: 'The Shadow',
    description: 'Keep a low profile. Protect your Aura and reduce Heat gain by 25%.',
    cloutTaxMultiplier: 0.5,
    auraTaxMultiplier: 0.9,
    yieldAuraMult: 1.2,
    heatMult: 0.75,
    icon: '👤'
  },
  {
    id: 'institutional',
    name: 'The Institutionalist',
    description: 'Focus on the bottom line. 15% more Cash and 20% lower fees for the next tier.',
    cloutTaxMultiplier: 0.7,
    auraTaxMultiplier: 0.7,
    yieldCashMult: 1.15,
    feeReduction: 0.2,
    icon: '🏛️'
  },
  {
    id: 'grinder',
    name: 'The Grinder',
    description: 'Tough as nails. Reduces Mental Health hits from all hustles by 20%.',
    cloutTaxMultiplier: 0.8,
    auraTaxMultiplier: 0.8,
    mentalHitMult: 0.8,
    icon: '⛓️'
  },
  {
    id: 'vanguard',
    name: 'The Vanguard',
    description: 'High risk, high reward. 25% more Clout and Aura, but 15% more stress.',
    cloutTaxMultiplier: 0.6,
    auraTaxMultiplier: 0.6,
    yieldCloutMult: 1.25,
    yieldAuraMult: 1.25,
    mentalHitMult: 1.15,
    icon: '🚀'
  },
  {
    id: 'veteran',
    name: 'The Veteran',
    description: 'Experience pays off. A balanced 10% bonus to all yields with no drawbacks.',
    cloutTaxMultiplier: 0.75,
    auraTaxMultiplier: 0.75,
    yieldCashMult: 1.1,
    yieldCloutMult: 1.1,
    yieldAuraMult: 1.1,
    icon: '🎖️'
  }
];
