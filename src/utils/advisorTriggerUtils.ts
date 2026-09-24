export const TIER_ONBOARDING_DATA: Record<string, {
  title: string;
  subtitle: string;
  bullets: string[];
  tabToOpen: 'ALL' | 'CRITICAL' | 'IMPORTANT' | 'OPPORTUNITIES' | 'INFO' | 'AMBITIONS' | 'HISTORY' | 'REPUTATION';
}> = {
  STREET: {
    title: 'STREET TIER: BUILD',
    subtitle: "From surviving to building. Lay brick-by-brick foundations.",
    bullets: [
      'Establish permanent street cred and local business footholds.',
      'Buy passive cash flow assets like Vending Networks and Rent Portfolios.',
      'Master STREET hustles to earn Crowns required for the STARTUP climb.'
    ],
    tabToOpen: 'OPPORTUNITIES'
  },
  STARTUP: {
    title: 'STARTUP TIER: SCALE',
    subtitle: "Incorporated and capitalized. Scale operations exponentially.",
    bullets: [
      'Launch high-growth tech MVPs, E-com brands, and agency pipelines.',
      'Hire staff to automate operations and maximize passive monthly yields.',
      'Out-scale aggressive market rivals attempting to buy up your sectors.'
    ],
    tabToOpen: 'OPPORTUNITIES'
  },
  CORPORATE: {
    title: 'CORPORATE TIER: CONTROL',
    subtitle: "Institutional dominance. Control media and corporate networks.",
    bullets: [
      'Control massive media networks, global franchises, and data analytics firms.',
      'Exert corporate leverage to insulate your holdings from market shocks.',
      'Secure 7 Mastery Crowns to unlock sovereign ELITE syndicate standing.'
    ],
    tabToOpen: 'REPUTATION'
  },
  ELITE: {
    title: 'ELITE TIER: INFLUENCE',
    subtitle: "Sovereign wealth. Dictate markets and wield syndicate power.",
    bullets: [
      'Deploy private equity and sovereign hedge funds across global sectors.',
      'Acquire luxury conglomerates and high-yielding flex prestige assets.',
      'Shield your empire from hostile rival takeovers with high Aura & Clout.'
    ],
    tabToOpen: 'AMBITIONS'
  },
  MOGUL: {
    title: 'MOGUL TIER: DOMINATE',
    subtitle: "Uncontested commercial power. Unify every sector under your empire.",
    bullets: [
      'Dominate film studios, sports leagues, and aerospace megaprojects.',
      'Build massive liquid capital reserves for national political bids.',
      'Master 11 unique careers to unlock the presidential campaign trail.'
    ],
    tabToOpen: 'AMBITIONS'
  },
  PRESIDENT: {
    title: 'PRESIDENTIAL TIER: GOVERN',
    subtitle: "Commander-in-Chief. Exercise executive statecraft and national policy.",
    bullets: [
      'Govern macro GDP, inflation, and national debt indicators.',
      'Form an elite cabinet and pass major congressional executive orders.',
      'Steer the nation through crisis to secure an immortal statesman legacy.'
    ],
    tabToOpen: 'CRITICAL'
  },
  OPEN: {
    title: 'OPEN ERA: CHOOSE YOUR LEGACY',
    subtitle: "Absolute career transcendence. Unrestricted freedom to shape your story.",
    bullets: [
      'Amass infinite wealth across all unlocked sectors without restrictions.',
      'Fulfill all 15 Mastery Crowns to complete total career completion.',
      'Seal your immortal placement in the Hall of Fame.'
    ],
    tabToOpen: 'AMBITIONS'
  }
};

export const checkAdvisorTriggers = (pl: any, currentMarket: string) => {
  if (!pl || !pl.narrativeFlags) return null;

  // Comeback Popup Triggers (Supreme Priority)
  const comebackTrigger = pl.narrativeFlags.trigger_comeback_advisor_popup;
  if (comebackTrigger) {
    if (comebackTrigger === 'bankruptcy_millionaire') {
      return {
        id: 'advisor_shown_comeback_bankruptcy_millionaire',
        title: '📈 THE RESILIENT PHOENIX',
        subtitle: `"You've taken some hard hits, Chaser... Most people would have quit. You didn't. Going from completely broke to clearing over $5,000,000 takes an elite mindset."`,
        bullets: [
          'You survived a catastrophic liquidity crunch and rebuilt your foundation.',
          'Markets have fully regained confidence in your operational stamina (+15 Clout, +15 Aura).',
          'Leverage your new fortune to lock in advanced specializations.'
        ],
        tabToOpen: 'OPPORTUNITIES' as const,
        onCloseExtra: (store: any) => {
          store.updatePl({
            narrativeFlags: {
              ...store.pl.narrativeFlags,
              trigger_comeback_advisor_popup: null
            }
          });
        }
      };
    }
    if (comebackTrigger === 'bankruptcy_billionaire') {
      return {
        id: 'advisor_shown_comeback_bankruptcy_billionaire',
        title: '🏙️ FROM BANKRUPTCY TO BILLIONAIRE',
        subtitle: `"This is a historic, decadal comeback. Rebuilding from Chapter 11 insolvency all the way to a ten-figure sovereign is near impossible. You have completed the ultimate phoenix rise."`,
        bullets: [
          'You are officially a certified billionaire giant.',
          'Rivals are terrified of your sheer resilience (+50 Clout, +30 Aura).',
          'Your legacy retirement rating is permanently secured.'
        ],
        tabToOpen: 'AMBITIONS' as const,
        onCloseExtra: (store: any) => {
          store.updatePl({
            narrativeFlags: {
              ...store.pl.narrativeFlags,
              trigger_comeback_advisor_popup: null
            }
          });
        }
      };
    }
    if (comebackTrigger === 'prison_rebound') {
      return {
        id: 'advisor_shown_comeback_prison_rebound',
        title: '🔓 THE PRISON COMEBACK',
        subtitle: `"They thought the handcuffs would end your story, Chaser. Instead, you served your time and engineered an outstanding post-release recovery of over $500,000. That is true grit."`,
        bullets: [
          'Reclaiming half a million within a year of prison release is a masterclass.',
          'Public perception has shifted to respect your relentless focus (+20 Clout, +20 Aura).',
          'Your name is feared on the street and in the boardroom.'
        ],
        tabToOpen: 'HISTORY' as const,
        onCloseExtra: (store: any) => {
          store.updatePl({
            narrativeFlags: {
              ...store.pl.narrativeFlags,
              trigger_comeback_advisor_popup: null
            }
          });
        }
      };
    }
    if (comebackTrigger === 'burnout_recovery') {
      return {
        id: 'advisor_shown_comeback_burnout_recovery',
        title: '🧘 MIND OF STEEL',
        subtitle: `"Severe operational burnout and low mental health can crush any leader. You stepped back, recovered your focus, and cleared your exhaustion. Your mental stamina is now steel."`,
        bullets: [
          'Cleared the devastating 30% yield and clout penalties of active burnout.',
          'Public trust in your leadership has surged (+10 Clout, +15 Aura).',
          'A true leader knows when to rest and when to strike.'
        ],
        tabToOpen: 'REPUTATION' as const,
        onCloseExtra: (store: any) => {
          store.updatePl({
            narrativeFlags: {
              ...store.pl.narrativeFlags,
              trigger_comeback_advisor_popup: null
            }
          });
        }
      };
    }
    if (comebackTrigger === 'debt_recovery') {
      return {
        id: 'advisor_shown_comeback_debt_recovery',
        title: '💸 LEVERAGE TAMED',
        subtitle: `"You paid down your outstanding liabilities and resolved creditor solvency freezes. Operating completely debt-free is a massive strategic relief."`,
        bullets: [
          'Outstanding liability principals reduced under $10,000.',
          'Solvency worries cleared, restoring full public Clout (+15 Clout, +15 Aura).',
          'Your cash flow channels are running at absolute maximum efficiency.'
        ],
        tabToOpen: 'HISTORY' as const,
        onCloseExtra: (store: any) => {
          store.updatePl({
            narrativeFlags: {
              ...store.pl.narrativeFlags,
              trigger_comeback_advisor_popup: null
            }
          });
        }
      };
    }
  }

  // A. FIRST EMPLOYEE HIRED (Leadership & delegation)
  if (pl.narrativeFlags.just_hired_employee && !pl.narrativeFlags.advisor_shown_first_employee) {
    return {
      id: 'advisor_shown_first_employee',
      title: '👥 THE POWER OF DELEGATION',
      subtitle: 'You have hired your very first employee! Corporate leadership is about leveraging other people\'s time while you focus on macro strategy.',
      bullets: [
        'Hiring employees automates manual labor, paving the path to scalable passive cash flow.',
        'Keep scaling your businesses by upgrading their levels to generate higher passive and active returns.',
        'Be mindful of your monthly overheads and maintain healthy capital buffers.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_hired_employee: false,
            advisor_shown_first_employee: true
          }
        });
      }
    };
  }

  // B. DONATE TO CHARITY (Charitable Halo / Suggest break)
  if (pl.narrativeFlags.just_donated_charity && !pl.narrativeFlags.advisor_shown_charity) {
    return {
      id: 'advisor_shown_charity',
      title: '🕊️ THE HALO OF GENEROSITY',
      subtitle: 'Your significant charitable contribution has established incredible public goodwill. To maximize your efficiency, the Advisor suggests taking a well-earned break.',
      bullets: [
        'A local public relations halo is forming, shielding you from minor Heat spikes.',
        'Your mind and body need recuperation after such a massive deployment of capital.',
        'Take a rest protocol now to claim a small, temporary recovery bonus (+10 MH on your next rest).'
      ],
      ctaLabel: 'Open Recovery Deck',
      onTakeMeThereCustom: (store: any) => {
        const currentTier = store.pl.currentTier;
        let recoveryHustle = 'r_sleep';
        if (currentTier === 'STREET') recoveryHustle = 'power_nap';
        else if (currentTier === 'STARTUP') recoveryHustle = 'therapy_session';
        else if (currentTier === 'CORPORATE') recoveryHustle = 'wellness_retreat';
        else if (currentTier !== 'MUD') recoveryHustle = 'psychiatrist';

        store.setActiveHustleView(recoveryHustle);
        store.setShowMinigame(false);
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_donated_charity: false,
            advisor_shown_charity: true,
            charity_recovery_bonus: true
          }
        });
      },
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_donated_charity: false,
            advisor_shown_charity: true,
            charity_recovery_bonus: true
          }
        });
      }
    };
  }

  // C. PURCHASE INSIDER INFORMATION
  if (pl.narrativeFlags.just_bought_insider && !pl.narrativeFlags.advisor_shown_insider) {
    return {
      id: 'advisor_shown_insider',
      title: '📈 INSIDER OPPORTUNITY SECURED',
      subtitle: 'Your purchase of insider information from Cassie has positioned you perfectly. The Advisor suggests checking high-tier business expansions.',
      bullets: [
        'The shipping merger details Cassie shared are highly lucrative, adding $25,000 monthly passive income.',
        'Use this momentum to look into other high-tier corporate ventures or real estate investments.',
        'Maintain absolute discretion to avoid drawing regulatory antitrust investigations.'
      ],
      ctaLabel: 'Review Businesses',
      onTakeMeThereCustom: (store: any) => {
        const currentTier = store.pl.currentTier;
        const targetTab = (currentTier === 'STREET' || currentTier === 'STARTUP') ? 'STARTUP' : 'ELITE';
        store.setActiveTab(targetTab);
        if (targetTab === 'ELITE') {
          store.setActiveHustleView('venture_capital');
        } else {
          store.setActiveHustleView('saas_mvp');
        }
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_bought_insider: false,
            advisor_shown_insider: true
          }
        });
      },
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_bought_insider: false,
            advisor_shown_insider: true
          }
        });
      }
    };
  }

  // D. ENROLLED IN UNIVERSITY
  if (pl.narrativeFlags.just_accepted_university && !pl.narrativeFlags.advisor_shown_university) {
    return {
      id: 'advisor_shown_university',
      title: '🎓 IVY LEAGUE ACADEMIC PRESTIGE',
      subtitle: 'Your acceptance into the Ivy League business program provides phenomenal long-term benefits and credentials.',
      bullets: [
        'Academic credentials amplify your Clout and build prestigious networking rings.',
        'Your profile as an educated, structured leader makes you highly attractive for board memberships.',
        'Review your strategic opportunities to see how this credential influences your campaign or ventures.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_accepted_university: false,
            advisor_shown_university: true
          }
        });
      }
    };
  }

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
      tabToOpen: 'CRITICAL' as const,
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
      tabToOpen: 'CRITICAL' as const,
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
      tabToOpen: 'OPPORTUNITIES' as const,
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
      tabToOpen: 'OPPORTUNITIES' as const,
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
      tabToOpen: 'CRITICAL' as const,
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
      tabToOpen: 'OPPORTUNITIES' as const,
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
      tabToOpen: 'CRITICAL' as const,
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
      tabToOpen: 'REPUTATION' as const,
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
      tabToOpen: 'OPPORTUNITIES' as const,
    };
  }

  // LIVING MEMORY ADVISOR EVENTS
  // A. Reflection on the Climb
  if (['CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'].includes(pl.currentTier) && pl.bag >= 1000000 && pl.month > 24 && !pl.narrativeFlags.advisor_shown_memory_concern) {
    return {
      id: 'advisor_shown_memory_concern',
      title: '💭 REFLECTIONS ON THE CLIMB',
      subtitle: `"I was looking over your early ledger sheets today. I remember when your biggest concern was making your first $500... Today, you are directing a colossal multi-million dollar empire. Never lose that hunger."`,
      bullets: [
        'You started from nothing and broke through every structural ceiling.',
        'Your net worth is now counted in the millions, but the lessons of survival remain the same.',
        'Remember your humble beginnings when negotiating your next high-stakes contract.'
      ],
      tabToOpen: 'BIOGRAPHY' as const,
    };
  }

  // B. Scars of Experience
  if (pl.mentalHealth < 45 && ((pl.arrestCount && pl.arrestCount > 0) || pl.narrativeFlags.had_bankruptcy_crisis || pl.narrativeFlags.rebounded_bankruptcy_millionaire) && !pl.narrativeFlags.advisor_shown_memory_setback) {
    return {
      id: 'advisor_shown_memory_setback',
      title: '🛡️ TRUST YOUR EXPERIENCE',
      subtitle: `"You're feeling the pressure right now, Chaser. But look back at where you've been. You've overcome severe setbacks before—the legal battles, the close calls, the cash squeezes. Trust your experience. This is just another bump on a historic rise."`,
      bullets: [
        'You have the operational scars and the tactical wisdom to survive this storm.',
        'Do not panic-sell assets or over-leverage to cover temporary operational deficits.',
        'Prioritize a tactical retreat, clear your Heat, and rest to restore your strategic focus.'
      ],
      tabToOpen: 'CRITICAL' as const,
    };
  }

  // C. The Deliberate Architect
  if (pl.month > 36 && (pl.arrestCount || 0) === 0 && (pl.scandalCount || 0) === 0 && !pl.narrativeFlags.advisor_shown_memory_growth) {
    return {
      id: 'advisor_shown_memory_growth',
      title: '📈 THE DELIBERATE ARCHITECT',
      subtitle: `"I've been analyzing your historical cadence. You've always favoured steady growth over risky expansion, Chaser. That patient, disciplined architecture is exactly why your empire is still standing while more volatile competitors have burned out."`,
      bullets: [
        'Consistently clean compliance records have protected you from federal audits.',
        'A stable portfolio of passive yields buffers you against sudden macroeconomic contractions.',
        'Continue to execute with precision; patience is the ultimate leverage.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
    };
  }

  return null;
};
