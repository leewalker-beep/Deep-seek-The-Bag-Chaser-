import { describe, it, expect } from 'vitest';

// Define expected onboarding tiers
const TIER_ONBOARDING_DATA: Record<string, {
  title: string;
  subtitle: string;
  bullets: string[];
  tabToOpen: string;
}> = {
  STREET: {
    title: 'WELCOME TO STREET',
    subtitle: "You're no longer surviving. You're beginning to build.",
    bullets: [
      'Buy your first passive income asset (Vending Machines or Rent Portfolio).',
      'Rivals are becoming more active on the Leaderboard.',
      'Reputation now matters more; your actions shift public perception.'
    ],
    tabToOpen: 'OPPORTUNITIES'
  },
  STARTUP: {
    title: 'WELCOME TO STARTUP',
    subtitle: "Incorporated and ready. You're entering the real business arena.",
    bullets: [
      'Launch scalable high-growth tech startup hustles.',
      'Hire corporate employees and automate your business for passive cash flow.',
      'Rivals are scaling their net worths rapidly—monitor their market moves.'
    ],
    tabToOpen: 'OPPORTUNITIES'
  },
  CORPORATE: {
    title: 'WELCOME TO CORPORATE',
    subtitle: "Institutional compliance, polished suits, and serious leverage.",
    bullets: [
      'Expand into massive financial, tech, or media corporations.',
      'Manage high-ticket media empires or film studios to control public relation slates.',
      'Earn substantial Clout to bypass high-tier advancement tax requirements.'
    ],
    tabToOpen: 'REPUTATION'
  },
  ELITE: {
    title: 'WELCOME TO ELITE',
    subtitle: "Sovereign wealth and global syndicates. The air is extremely thin up here.",
    bullets: [
      'Balance extreme active heat contracts with high-end luxury flex assets.',
      'Acquire premium corporate holdings and sovereign passive assets.',
      'Protect your assets from hostile rival counter-bids on the Leaderboard.'
    ],
    tabToOpen: 'AMBITIONS'
  },
  MOGUL: {
    title: 'WELCOME TO MOGUL',
    subtitle: "The peak of commercial power. Every sector answers to your empire.",
    bullets: [
      'Liquidate massive assets to prep the ultimate presidential campaign trail.',
      'Fund strategic political PACs to ease congressional fundraising costs.',
      'Acknowledge and fulfill remaining life ambitions to lock in final meta-legacy points.'
    ],
    tabToOpen: 'AMBITIONS'
  },
  PRESIDENT: {
    title: 'WELCOME TO THE OVAL OFFICE',
    subtitle: "Commander-in-Chief. You control the government cabinet and nation's policy.",
    bullets: [
      'Keep macro GDP, Inflation, and National Debt indicators stabilized.',
      'Fire corrupt cabinet members to shield your administration from massive scandals.',
      'Build congressional support to pass major executive orders and reforms.'
    ],
    tabToOpen: 'CRITICAL'
  },
  OPEN: {
    title: 'WELCOME TO THE OPEN ERA',
    subtitle: "Absolute transcendence. You have broken past the mortal constraints of the grind.",
    bullets: [
      'Amass infinite passive wealth with zero tier restrictions.',
      'Fulfill supreme legacy milestones to maximize Hall of Fame rankings.',
      'Master every remaining business branch to seal your immortal footprint.'
    ],
    tabToOpen: 'AMBITIONS'
  }
};

const checkAdvisorTriggersMock = (pl: any, currentMarket: string) => {
  if (!pl || !pl.narrativeFlags) return null;

  // 1. HIGH HEAT
  if (pl.heat > 75 && !pl.narrativeFlags.advisor_shown_high_heat) {
    return {
      id: 'advisor_shown_high_heat',
      title: '🚨 CRITICAL HEAT WARNING',
      subtitle: 'The watchdogs and local precinct have built a massive profile on your operations.',
      bullets: [
        'Your Heat is dangerously high (> 75%).',
        'Failing active checks right now is almost guaranteed to result in immediate arrest and heavy prison sentences.',
        'Run "Ghost Mode" or Rest/Recover to cool down compliance review levels immediately.'
      ],
      tabToOpen: 'CRITICAL',
    };
  }

  // 2. VERY LOW MENTAL HEALTH
  if (pl.mentalHealth < 30 && !pl.narrativeFlags.advisor_shown_low_mental_health) {
    return {
      id: 'advisor_shown_low_mental_health',
      title: '🧠 PSYCHOLOGICAL CRITICAL LIMIT',
      subtitle: 'Your mind is completely depleted. Burnout is imminent.',
      bullets: [
        'All active yields (cash, clout, aura) are cut by up to 25% due to severe exhaustion.',
        'High stress triggers careless mistakes, leading to direct financial losses and massive Heat spikes.',
        'Navigate to Rest & Recover immediately to play zero-risk therapeutic minigames.'
      ],
      tabToOpen: 'CRITICAL',
    };
  }

  // 3. FIRST PASSIVE INCOME
  const finalPassiveTotal = pl.lastPassiveBreakdown?.finalTotal || 0;
  if (finalPassiveTotal > 0 && !pl.narrativeFlags.advisor_shown_first_passive) {
    return {
      id: 'advisor_shown_first_passive',
      title: '💸 FIRST PASSIVE REVENUE SECURED',
      subtitle: 'A major milestone. You have unlocked steady baseline passive income.',
      bullets: [
        'Your assets are now generating wealth for you every single month.',
        'Reinvest this passive yield into expanding rent portfolios or vending networks.',
        'Diversify across sectors to cushion against market recession cycles.'
      ],
      tabToOpen: 'OPPORTUNITIES',
    };
  }

  // 4. FIRST BUSINESS
  const activeHustleKeys = Object.keys(pl.hustleLevels || {});
  if (activeHustleKeys.length > 0 && !pl.narrativeFlags.advisor_shown_first_business) {
    return {
      id: 'advisor_shown_first_business',
      title: '🏢 FIRST BUSINESS ENTERPRISE',
      subtitle: 'You are officially an operator. Your business is live and running.',
      bullets: [
        'Execute active operations on this business to gain cash, clout, and aura.',
        'Unlock permanent mastery crowns or badges by executing the same hustle at least 20 times.',
        'Level up and upgrade the hustle branches to scale your active and passive output.'
      ],
      tabToOpen: 'OPPORTUNITIES',
    };
  }

  // 5. FIRST RIVAL
  if (pl.rivals && pl.rivals.length > 0 && !pl.narrativeFlags.advisor_shown_first_rival) {
    return {
      id: 'advisor_shown_first_rival',
      title: '🔥 COMPETITIVE THREAT: RIVALS ACTIVE',
      subtitle: 'An aggressive competitor has entered your local market sectors.',
      bullets: [
        'Rivals will actively buy real estate, expand industries, and launch bids on your holdings.',
        'You can view their personality metrics, aggressive bids, and relationships on the Leaderboard.',
        'Counter-bid to protect your local positions, launch corporate sabotage, or trigger deep retaliations.'
      ],
      tabToOpen: 'CRITICAL',
    };
  }

  // 6. FIRST MILLION
  if (pl.bag >= 1000000 && !pl.narrativeFlags.advisor_shown_first_million) {
    return {
      id: 'advisor_shown_first_million',
      title: '🪙 LIQUID MILLIONAIRE STATUS',
      subtitle: 'One million dollars. You have broken through into high-society capital.',
      bullets: [
        'You possess the critical liquidity required for institutional investments.',
        'Prioritize premium real estate portfolios or high-tier corporate specializations.',
        'Fund larger-scale marketing campaigns to multiply your national Clout footprint.'
      ],
      tabToOpen: 'OPPORTUNITIES',
    };
  }

  // 7. CRIME BECOMING DANGEROUS
  if (pl.heat > 55 && !pl.narrativeFlags.advisor_shown_dangerous_crime) {
    return {
      id: 'advisor_shown_dangerous_crime',
      title: '⚖️ LAW ENFORCEMENT AUDIT IMMINENT',
      subtitle: 'Your active street footprint is drawing high compliance reviewing.',
      bullets: [
        'Heat above 50% significantly increases the risk of random police audits.',
        'Stealth operations and shady deal active gigs accumulate heat rapidly.',
        'Consider cooling down your heat signature before attempting high-stakes challenges.'
      ],
      tabToOpen: 'CRITICAL',
    };
  }

  // 8. HOUSING PROTEST BEGINNING
  const isHousingCrisisActive = pl.consequences?.some((c: any) => c.source === 'housing_affordability_crisis' && c.status === 'active');
  const isLandlordEmpire = (pl.rentPortfolioCount || 0) >= 5 || (pl.rentalCount || 0) >= 3;
  if ((isHousingCrisisActive || isLandlordEmpire) && !pl.narrativeFlags.advisor_shown_housing_protest) {
    return {
      id: 'advisor_shown_housing_protest',
      title: '🏠 HOUSING AFFORDABILITY PROTESTS',
      subtitle: 'Tenant unions are organizing strikes against rapid rent capitalization.',
      bullets: [
        'Your monopolized real estate expansion has drawn severe local backlash.',
        'This triggers rent cap policies and docks passive rent yields by up to 30%.',
        'Prepare to pass legislative executive orders or allocate community philanthropy to restore peace.'
      ],
      tabToOpen: 'CRITICAL',
    };
  }

  // 9. ECONOMY COLLAPSING
  if (currentMarket === 'RECESSION' && !pl.narrativeFlags.advisor_shown_economy_collapse) {
    return {
      id: 'advisor_shown_economy_collapse',
      title: '📉 ECONOMIC RECESSION CYCLE ACTIVE',
      subtitle: 'The macroeconomic markets are in a severe contraction phase.',
      bullets: [
        'Consumer spending and corporate yields are heavily suppressed.',
        'Focus on preserving liquid cash and prioritizing lower-overhead passive operations.',
        'Avoid launching expensive campaign stages until standard cycles stabilize.'
      ],
      tabToOpen: 'CRITICAL',
    };
  }

  return null;
};

describe('Strategic Advisor Mentor - Trigger Evaluation', () => {
  it('should have onboarding briefs for all required progression tiers', () => {
    const requiredTiers = ['STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];
    for (const tier of requiredTiers) {
      const brief = TIER_ONBOARDING_DATA[tier];
      expect(brief).toBeDefined();
      expect(brief.title).toContain(tier === 'PRESIDENT' ? 'OVAL OFFICE' : tier);
      expect(brief.bullets.length).toBeGreaterThan(1);
    }
  });

  it('should trigger high heat advice under matching conditions', () => {
    const pl = {
      heat: 80,
      narrativeFlags: {},
    };

    const trigger = checkAdvisorTriggersMock(pl, 'NORMAL');
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBe('advisor_shown_high_heat');
    expect(trigger?.tabToOpen).toBe('CRITICAL');
  });

  it('should trigger low mental health advice under matching conditions', () => {
    const pl = {
      mentalHealth: 15,
      narrativeFlags: {},
    };

    const trigger = checkAdvisorTriggersMock(pl, 'NORMAL');
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBe('advisor_shown_low_mental_health');
  });

  it('should not trigger advice if the narrative flag is already set', () => {
    const pl = {
      heat: 80,
      narrativeFlags: {
        advisor_shown_high_heat: true,
        advisor_shown_dangerous_crime: true,
      },
    };

    const trigger = checkAdvisorTriggersMock(pl, 'NORMAL');
    expect(trigger).toBeNull();
  });

  it('should trigger first passive income advice when passive income starts', () => {
    const pl = {
      lastPassiveBreakdown: { finalTotal: 500 },
      narrativeFlags: {},
    };

    const trigger = checkAdvisorTriggersMock(pl, 'NORMAL');
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBe('advisor_shown_first_passive');
  });

  it('should trigger economy collapsing advice under recession', () => {
    const pl = {
      narrativeFlags: {},
    };

    const trigger = checkAdvisorTriggersMock(pl, 'RECESSION');
    expect(trigger).not.toBeNull();
    expect(trigger?.id).toBe('advisor_shown_economy_collapse');
  });
});
