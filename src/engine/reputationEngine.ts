import type { PlayerStats } from '../types/game';
import { recordHistoryEvent } from './historyEngine';

export interface ReputationDetails {
  name: string;
  earnedHow: string;
  contributingFactors: string[];
  positives: string[];
  negatives: string[];
}

export const REPUTATION_METADATA: Record<string, Omit<ReputationDetails, 'name'>> = {
  "The Hustler": {
    earnedHow: "By grinding multiple active hustles on the street and maintaining a busy operational schedule.",
    contributingFactors: [
      "Starting tiers (MUD / STREET)",
      "High frequency of basic active hustles",
      "Low starting cash reserves"
    ],
    positives: [
      "No high-profile spotlight (standard news scan rates)",
      "Slightly faster mental recovery from basic sleep/rest (+5%)"
    ],
    negatives: [
      "Low leverage (no high-tier multipliers)",
      "Fewer organic sponsorship opportunities"
    ]
  },
  "The Investor": {
    earnedHow: "By establishing stable real estate holdings, venture capital strategies, and strong passive cash flows.",
    contributingFactors: [
      "High passive income (> $50,000/month)",
      "Real estate property ownership",
      "Low compliance Heat profile"
    ],
    positives: [
      "Cheaper acquisitions (-10% cost on business upgrades, flex, and real estate)",
      "Business trust (+10% passive business yields)"
    ],
    negatives: [
      "Targeted by smarter rivals in audits and market grabs",
      "Underwear check (slightly increased tax audit scrutiny)"
    ]
  },
  "The Mogul": {
    earnedHow: "By advancing to the elite heights of industry and mastering multiple high-tier business branches.",
    contributingFactors: [
      "Reached MOGUL tier",
      "Mastered 4+ diverse business hustles",
      "High overall net worth"
    ],
    positives: [
      "Massive business leverage (+10% active yields across all owned ventures)",
      "Mental resilience under pressure (-30% mental hits)"
    ],
    negatives: [
      "Higher tax bracket and active overhead fees (+15% running cost)",
      "Substantial Heat hits from aggressive corporate plays (+50% heat hit scaling)"
    ]
  },
  "The Celebrity": {
    earnedHow: "By cultivating massive public Clout and Aura through media networks, record label, and content ventures.",
    contributingFactors: [
      "High player Clout (> 500) and Aura (> 50)",
      "Ownership of record label artists or content creation channels",
      "Frequent SMM or audio releases"
    ],
    positives: [
      "Easier media success (+15% yields on Content, Podcast, and Audio hustles)",
      "Sponsorship injections (+10% active cash yields across other ventures)"
    ],
    negatives: [
      "Public spotlight means scandals spread faster (1.2x Heat hits)",
      "Prone to targeted media smear campaigns"
    ]
  },
  "The Philanthropist": {
    earnedHow: "By donating substantial fortunes to charity and maintaining an exceptionally clean public profile.",
    contributingFactors: [
      "Has philanthropy empire level or philanthropy donations (> $100,000)",
      "Very high Aura (> 75) and very low Heat (< 20)"
    ],
    positives: [
      "Exceptional public admiration (+15% Aura gains)",
      "Slightly lowered rival bid aggression (15% reduction in counter-bidding)"
    ],
    negatives: [
      "Requires constant charitable contributions to sustain",
      "Extremely fragile profile (any criminal arrest immediately destroys this reputation)"
    ]
  },
  "The Crime Boss": {
    earnedHow: "By running high-heat underground activities, facing incarceration, and maintaining an intimidating record.",
    contributingFactors: [
      "Critical Heat profile (> 75) and history of arrests",
      "Currently serving jail sentences",
      "Mastered shady operations like Scrap Flip or Ghost Mode"
    ],
    positives: [
      "Intimidation (+15% sabotage success chance, -25% rival counter-bid chance)",
      "Underground income (+20% yields on Ghost Mode, Scrap, and Plasma donation)"
    ],
    negatives: [
      "Extreme election difficulty (Presidential campaigns cost +30% more)",
      "Aura decay of -2 per month"
    ]
  },
  "The Reformer": {
    earnedHow: "By advocating progressive legislative agendas, passing public-interest acts, and preserving cabinet integrity.",
    contributingFactors: [
      "Passed progressive laws/orders (Healthcare, Housing, or Financial stability)",
      "High congressional support and strong Aura",
      "Active campaigning with clean background metrics"
    ],
    positives: [
      "Bipartisan consensus (+10% Congress support growth rates)",
      "Improved demographic approval (+10% demographic satisfaction)"
    ],
    negatives: [
      "Disliked by hyper-capitalist corporate rivals (aggressive corporate bidding against you)",
      "Restricted from running high-heat shady operations"
    ]
  },
  "The President": {
    earnedHow: "By winning the national general election and steering the country's macroeconomic destiny.",
    contributingFactors: [
      "Currently in the PRESIDENT tier",
      "Steering GDP, Inflation, and National Debt indicators"
    ],
    positives: [
      "Easier diplomacy (+20% foreign relations and world peace gains)",
      "Full executive control and national security access"
    ],
    negatives: [
      "Extremely high public expectations (approval drops faster when macro indicators decay)",
      "Scandal leaks trigger double standard penalties"
    ]
  },
  "The Kingmaker": {
    earnedHow: "By holding absolute sway over political candidates, lobbyists, and elite networks without taking the spotlight.",
    contributingFactors: [
      "Extremely high Clout (> 1000) and Aura (> 80) outside of presidency",
      "Active Lobbying operations and deep cabinet relationships"
    ],
    positives: [
      "Rivals seek alliances (rival sabotages against player reduced by 50%)",
      "Politicians ask for support (+10% starting loyalty for newly appointed cabinet members)"
    ],
    negatives: [
      "Heavy overhead fees to preserve elite shadow networks",
      "Subject to sudden federal conspiracy audits"
    ]
  },
  "The Billionaire": {
    earnedHow: "By accumulating an astronomical liquid fortune of over one billion dollars.",
    contributingFactors: [
      "Liquid bag holdings exceed $1,000,000,000"
    ],
    positives: [
      "Absolute capital leverage (business purchase/upgrade costs reduced by 15%)",
      "Unlocking premium high-end flex opportunities"
    ],
    negatives: [
      "Rivals aggressively prioritize undercut bids on your sectors (+30% rival bid frequency)",
      "Huge targets for tax compliance audits"
    ]
  },
  "The Media Emperor": {
    earnedHow: "By owning and scaling major national media conglomerates, news networks, or film studio syndicates.",
    contributingFactors: [
      "Ownership of Media Empire or Film Studio ventures",
      "High Clout (> 1000)"
    ],
    positives: [
      "Greater media influence (+15% Clout yields)",
      "Scandal defense (media assets buffer approval rating penalties by 15%)"
    ],
    negatives: [
      "Stronger scandals (when a leak does break through, public backlash is 25% harsher)",
      "Requires constant high-stakes content investments"
    ]
  },
  "The Shadow Broker": {
    earnedHow: "By dominating digital data channels, mining networks, and tech analytics while maintaining a low-profile aura.",
    contributingFactors: [
      "High Clout (> 600) with low public Aura (< 35) and moderate Heat (> 40)",
      "Ownership of Data Analytics, Data Monopoly, or Crypto Mining networks"
    ],
    positives: [
      "Stealth profiling (-20% Heat accumulation from tech and digital ventures)",
      "Data dominance (+15% yields on Data and Crypto contracts)"
    ],
    negatives: [
      "Rivals are highly suspicious (-15 relationship baseline penalty)",
      "Zero recovery bonuses from public PR events"
    ]
  },
  "The People's Champion": {
    earnedHow: "By matching clean grassroots backgrounds, low Heat, and exceptionally high public Aura.",
    contributingFactors: [
      "Clean background (Street Kid or Dropout category matches)",
      "Very high public Aura (> 85), low Heat (< 15), and peak mental health"
    ],
    positives: [
      "Sovereign respect (+20% Aura gains, and faster mental recovery +15%)",
      "Grassroots support (unlocked cheaper local political campaigning)"
    ],
    negatives: [
      "Prone to sudden establishment/elite backlash campaigns",
      "Any corporate exploitation action heavily damages public Aura"
    ]
  },
  "The Controversial Tycoon": {
    earnedHow: "By managing multi-million dollar portfolios that trigger active municipal controversies, audits, or rival wars.",
    contributingFactors: [
      "Large active cash bag (> $20,000,000), low public Aura (< 45), and high Heat (> 50)",
      "Frequent rival sabotages, lawsuits, or corporate scandal history"
    ],
    positives: [
      "Aggressive margins (+15% active yields on high-risk capital ventures)",
      "Tough skin (immune to minor rival intimidation effects)"
    ],
    negatives: [
      "Highly volatile public image (consequence triggers are 20% more frequent)",
      "Electoral campaign costs increased by 20%"
    ]
  }
};

export function getReputationDetails(name: string): ReputationDetails {
  const meta = REPUTATION_METADATA[name] || REPUTATION_METADATA["The Hustler"];
  return {
    name,
    ...meta
  };
}

/**
 * Exposes a clean, future-proof query function for other systems (DLC, careers, events)
 * to fetch the canonical player reputation without duplicating any scoring or evaluation logic.
 */
export function getCurrentReputation(pl: PlayerStats): string {
  return (pl.narrativeFlags?.publicReputation as string) || "The Hustler";
}

/**
 * Pure evaluation function. Calculates scores for each potential reputation.
 */
export function calculateReputationScores(pl: PlayerStats): Record<string, number> {
  const scores: Record<string, number> = {
    "The Hustler": 10,
    "The Investor": 0,
    "The Mogul": 0,
    "The Celebrity": 0,
    "The Philanthropist": 0,
    "The Crime Boss": 0,
    "The Reformer": 0,
    "The President": 0,
    "The Kingmaker": 0,
    "The Billionaire": 0,
    "The Media Emperor": 0,
    "The Shadow Broker": 0,
    "The People's Champion": 0,
    "The Controversial Tycoon": 0
  };

  const isJailed = pl.inJail === true || pl.isIncarcerated === true;

  // 1. The President (Highest priority override)
  if (pl.currentTier === 'PRESIDENT') {
    scores["The President"] += 1000;
  }

  // 2. The Billionaire
  if (pl.bag >= 1000000000) {
    scores["The Billionaire"] += 900;
  }

  // 3. The Kingmaker
  if (pl.clout > 1000 && pl.aura > 80 && pl.currentTier !== 'PRESIDENT') {
    scores["The Kingmaker"] += 150;
    if (pl.hustleLevels?.['lobbying'] > 0) scores["The Kingmaker"] += 50;
    if (pl.clout > 2000) scores["The Kingmaker"] += 50;
  }

  // 4. The Media Emperor
  const ownsMedia = (pl.hustleLevels?.['media_empire'] || 0) > 0 || (pl.hustleLevels?.['film_studio'] || 0) > 0;
  if (ownsMedia) {
    scores["The Media Emperor"] += 150;
    if (pl.clout > 800) scores["The Media Emperor"] += 100;
  }

  // 5. The Crime Boss
  if (pl.heat > 75 && (pl.arrestCount || 0) > 0) {
    scores["The Crime Boss"] += 150;
  }
  if (isJailed) {
    scores["The Crime Boss"] += 150;
  }
  if ((pl.hustleLevels?.['r_ghost_mode'] || 0) > 0 || (pl.hustleLevels?.['r_scrap'] || 0) > 0) {
    scores["The Crime Boss"] += 50;
  }

  // 6. The Philanthropist (Requires post-STREET tiers to distinguish from placeholder starting donations)
  const isPostStreet = pl.currentTier !== 'MUD' && pl.currentTier !== 'STREET';
  const ownsPhilanthropy = (pl.hustleLevels?.['philanthropy_empire'] || 0) > 0;
  const donatedLots = (pl.philanthropyDonation || 0) > 100000;
  if (isPostStreet && (ownsPhilanthropy || donatedLots)) {
    scores["The Philanthropist"] += 150;
  }
  if (isPostStreet && pl.aura > 80 && pl.heat < 20) {
    scores["The Philanthropist"] += 100;
  }

  // 7. The Reformer
  if (pl.currentTier === 'PRESIDENT' || (pl.campaignStage || 0) > 0) {
    if (pl.aura > 70 && pl.congressSupport > 60) {
      scores["The Reformer"] += 120;
    }
  }
  if (pl.hustleBranchIds?.['r_labor'] === 'l2b') {
    scores["The Reformer"] += 50;
  }

  // 8. The People's Champion
  if (pl.aura > 85 && pl.heat < 15 && pl.mentalHealth > 80) {
    scores["The People's Champion"] += 150;
    if (pl.chosenBackgroundCategory === 'street_kid' || pl.chosenBackgroundCategory === 'dropout') {
      scores["The People's Champion"] += 50;
    }
  }

  // 9. The Shadow Broker
  if (pl.clout > 600 && pl.aura < 35 && pl.heat > 40) {
    scores["The Shadow Broker"] += 150;
    if (pl.hustleLevels?.['data_analytics'] > 0 || pl.hustleLevels?.['crypto_mining'] > 0 || pl.hustleLevels?.['data_monopoly'] > 0) {
      scores["The Shadow Broker"] += 100;
    }
  }

  // 10. The Controversial Tycoon
  if (pl.bag > 20000000 && pl.heat > 50 && pl.aura < 45) {
    scores["The Controversial Tycoon"] += 150;
    if ((pl.scandalCount || 0) > 1 || pl.consequences?.some(c => c.status === 'active')) {
      scores["The Controversial Tycoon"] += 100;
    }
  }

  // 11. The Mogul
  if (pl.currentTier === 'MOGUL') {
    scores["The Mogul"] += 150;
    const masteredCount = pl.masteredHustles?.length || 0;
    if (masteredCount >= 4) {
      scores["The Mogul"] += 100;
    }
  }

  // 12. The Investor
  const passiveTotal = pl.lastPassiveBreakdown?.finalTotal || 0;
  if (passiveTotal > 50000) {
    scores["The Investor"] += 120;
    if (pl.rentalCount > 0 || pl.rentPortfolioCount > 0) {
      scores["The Investor"] += 80;
    }
  }

  // 13. The Celebrity
  if (pl.clout > 500 && pl.aura > 50) {
    scores["The Celebrity"] += 120;
    if (pl.artists && pl.artists.length > 0) {
      scores["The Celebrity"] += 80;
    }
  }

  // 14. The Hustler (Baseline bump if active / starting)
  if (pl.currentTier === 'MUD' || pl.currentTier === 'STREET') {
    scores["The Hustler"] += 50;
  }

  return scores;
}

/**
 * Main Reputation Evaluation Tick.
 * Evaluates candidate state machine, updates publicReputation, and returns news ticker references.
 * Resolves ties deterministically by preferring current reputation/candidate.
 */
export function evaluateReputationTick(pl: PlayerStats): { newPl: PlayerStats; news: string[] } {
  const newPl = { ...pl };

  // Safety initialize narrative flags and structures
  if (!newPl.narrativeFlags) newPl.narrativeFlags = {};
  if (!newPl.history) newPl.history = [];
  if (!newPl.biography) newPl.biography = [];

  const currentRep = (newPl.narrativeFlags.publicReputation as string) || "The Hustler";
  newPl.narrativeFlags.publicReputation = currentRep;

  // Calculate scores
  const scores = calculateReputationScores(newPl);

  // Find the maximum score among all reputations
  let maxScore = -999;
  for (const [_, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
    }
  }

  // Gather all reputations that hold this maximum score
  const highestReps = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([rep]) => rep);

  // Tie-breaker logic:
  // 1. If current active reputation is among the highest scoring, keep it to maximize stability.
  // 2. If current candidate is among the highest scoring, keep it to allow lock-in progression.
  // 3. Otherwise, sort alphabetically to achieve pure determinism and select the first.
  let highestRep = currentRep;
  const prevCandidate = (newPl.narrativeFlags.reputationCandidate as string) || "";

  if (highestReps.includes(currentRep)) {
    highestRep = currentRep;
  } else if (prevCandidate && highestReps.includes(prevCandidate)) {
    highestRep = prevCandidate;
  } else {
    highestReps.sort();
    highestRep = highestReps[0];
  }

  // Stability Gating: To trigger a change, the candidate must either be a massive override (President/Billionaire)
  // or strictly outperform the current reputation's score by at least 15 points.
  const currentRepScore = scores[currentRep] || 0;
  const isOverride = highestRep === "The President" || highestRep === "The Billionaire";
  const satisfiesThreshold = maxScore > currentRepScore + 15;

  const targetRep = (isOverride || satisfiesThreshold) ? highestRep : currentRep;

  const news: string[] = [];

  if (targetRep !== currentRep) {
    if (targetRep === prevCandidate) {
      const sustained = ((newPl.narrativeFlags.reputationSustainedMonths as number) || 0) + 1;
      newPl.narrativeFlags.reputationSustainedMonths = sustained;

      if (sustained >= 3) {
        // Officially LOCK IN and transition persona
        newPl.narrativeFlags.publicReputation = targetRep;
        newPl.narrativeFlags.reputationCandidate = "";
        newPl.narrativeFlags.reputationSustainedMonths = 0;

        // Record major historical milestone and biography reference
        const desc = `The public increasingly views you as "${targetRep}". The business community now sees you as "${targetRep}". This reputation may open opportunities across your operations.`;
        recordHistoryEvent(newPl, {
          id: `reputation_shift_${targetRep.toLowerCase().replace(/ /g, '_')}_${newPl.month}`,
          title: `Persona Evolved: ${targetRep}`,
          description: desc,
          category: 'LEGACY',
          importance: 4,
          month: newPl.month
        });

        // Add explicit biography entry
        const bioEntry = `[Legacy Milestone] Gained national recognition. Publicly defined as "${targetRep}".`;
        if (!newPl.biography.includes(bioEntry)) {
          newPl.biography.push(bioEntry);
        }

        // Post multiple outlet reports for reputation lock-in (Part 2, 4)
        const feedBusiness = {
          id: `rep_feed_biz_${newPl.month}_${Math.random().toString(36).substring(7)}`,
          category: 'BUSINESS' as const,
          text: `📢 CONFLICT RESOLVED: The business community now sees you as "${targetRep}", transforming executive and trade relations.`,
          source: 'Wall Street Ledger',
          timestamp: Date.now(),
          month: newPl.month,
          pinned: true
        };
        const feedPop = {
          id: `rep_feed_pop_${newPl.month}_${Math.random().toString(36).substring(7)}`,
          category: 'SOCIAL' as const,
          text: `🔥 TRENDING: The public increasingly views you as "${targetRep}"! Absolute main-character energy across all platforms!`,
          source: 'Chirper Trend',
          timestamp: Date.now(),
          month: newPl.month,
          author: '@IndustryWatcher',
          likes: Math.floor(Math.random() * 45000) + 5000,
          shares: Math.floor(Math.random() * 9000) + 1000,
          pinned: true
        };
        const feedFinance = {
          id: `rep_feed_fin_${newPl.month}_${Math.random().toString(36).substring(7)}`,
          category: 'MARKET' as const,
          text: `📊 PORTFOLIO OPTIMIZATION: This reputation may open opportunities to scale capital assets and reduce overhead margins.`,
          source: 'Global Finance Tracker',
          timestamp: Date.now(),
          month: newPl.month,
          pinned: true
        };

        newPl.worldFeed = [feedBusiness, feedPop, feedFinance, ...(newPl.worldFeed || [])].slice(0, 100);

        // News alerts and world feed placement
        news.push(`📰 PUBLIC PERSONA SHIFT: You are now widely recognized as "${targetRep}"!`);
      }
    } else {
      // Set new candidate
      newPl.narrativeFlags.reputationCandidate = targetRep;
      newPl.narrativeFlags.reputationSustainedMonths = 1;
    }
  } else {
    // Current is maintained, reset candidates
    newPl.narrativeFlags.reputationCandidate = "";
    newPl.narrativeFlags.reputationSustainedMonths = 0;
  }

  return { newPl, news };
}
