export interface JailSentence {
  months: number;
  charge: string;
  flavour: string;
  bagLossPerMonth: number;
  cloutLossPerMonth: number;
}

export const TIER_SENTENCES: Record<string, JailSentence> = {
  MUD: {
    months: 3,
    charge: 'Petty Theft & Trespassing',
    flavour: 'They got you for small time stuff. Three months. Could have been worse.',
    bagLossPerMonth: 500,
    cloutLossPerMonth: 3,
  },
  STREET: {
    months: 6,
    charge: 'Tax Evasion & Wire Fraud',
    flavour: 'The IRS noticed. Six months to think about your life choices.',
    bagLossPerMonth: 2000,
    cloutLossPerMonth: 5,
  },
  STARTUP: {
    months: 12,
    charge: 'Pyramid Scheme & Securities Fraud',
    flavour: 'Someone talked. A year inside while your empire crumbles.',
    bagLossPerMonth: 10000,
    cloutLossPerMonth: 8,
  },
  CORPORATE: {
    months: 36,
    charge: 'Corporate Espionage & Bribery',
    flavour: 'Three years. The DA made an example of you. Your lawyers tried.',
    bagLossPerMonth: 100000,
    cloutLossPerMonth: 12,
  },
  ELITE: {
    months: 60,
    charge: 'Money Laundering & Racketeering',
    flavour: 'Five years federal. White collar prison but prison is prison.',
    bagLossPerMonth: 500000,
    cloutLossPerMonth: 20,
  },
  MOGUL: {
    months: 120,
    charge: 'Organised Crime & RICO Violation',
    flavour: 'Ten years. They built the case for three years before they moved.',
    bagLossPerMonth: 2000000,
    cloutLossPerMonth: 30,
  },
  OPEN: {
    months: 120,
    charge: 'Crimes Against the Financial System',
    flavour: 'They finally got you. Ten years. At your level they always do eventually.',
    bagLossPerMonth: 500000000,
    cloutLossPerMonth: 50,
  },
};

// Fallback for any unmapped tier
export const DEFAULT_SENTENCE: JailSentence = {
  months: 6,
  charge: 'Unspecified Criminal Activity',
  flavour: 'They got you. Six months.',
  bagLossPerMonth: 1000,
  cloutLossPerMonth: 5,
};

export const getSentence = (tier: string): JailSentence =>
  TIER_SENTENCES[tier] || DEFAULT_SENTENCE;
