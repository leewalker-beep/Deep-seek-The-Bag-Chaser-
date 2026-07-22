import type { PlayerStats } from '../types/game';
import { analyzeBehavior } from './personalityAnalyzer';

export interface InspirationalQuote {
  id: string;
  text: string;
  author: string;
  category: 'risk' | 'investor' | 'leader' | 'resilient' | 'charitable';
}

export const INSPIRATIONAL_QUOTES: InspirationalQuote[] = [
  // Risk-taking player
  {
    id: 'quote_risk_virgil',
    text: "Fortune favours the bold.",
    author: "Virgil",
    category: 'risk'
  },
  {
    id: 'quote_risk_ali',
    text: "He who is not courageous enough to take risks will accomplish nothing in life.",
    author: "Muhammad Ali",
    category: 'risk'
  },
  {
    id: 'quote_risk_eliot',
    text: "Only those who will risk going too far can possibly find out how far one can go.",
    author: "T.S. Eliot",
    category: 'risk'
  },

  // Patient investor
  {
    id: 'quote_investor_buffett',
    text: "The stock market transfers wealth from the impatient to the patient.",
    author: "Warren Buffett",
    category: 'investor'
  },
  {
    id: 'quote_investor_meyer',
    text: "Patience is not simply the ability to wait - it's how we behave while we're waiting.",
    author: "Joyce Meyer",
    category: 'investor'
  },
  {
    id: 'quote_investor_graham',
    text: "The individual investor should act consistently as an investor and not as a speculator.",
    author: "Benjamin Graham",
    category: 'investor'
  },

  // Leader
  {
    id: 'quote_leader_drucker',
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    category: 'leader'
  },
  {
    id: 'quote_leader_welch',
    text: "Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others.",
    author: "Jack Welch",
    category: 'leader'
  },
  {
    id: 'quote_leader_bennis',
    text: "Leadership is the capacity to translate vision into reality.",
    author: "Warren Bennis",
    category: 'leader'
  },

  // Resilient player
  {
    id: 'quote_resilient_confucius',
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: 'resilient'
  },
  {
    id: 'quote_resilient_confucius_glory',
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Confucius",
    category: 'resilient'
  },
  {
    id: 'quote_resilient_jordan',
    text: "The oak fought the wind and was broken, the willow bent when it must and survived.",
    author: "Robert Jordan",
    category: 'resilient'
  },

  // Charitable player
  {
    id: 'quote_charitable_churchill',
    text: "We make a living by what we get. We make a life by what we give.",
    author: "Winston Churchill",
    category: 'charitable'
  },
  {
    id: 'quote_charitable_frank',
    text: "No one has ever become poor by giving.",
    author: "Anne Frank",
    category: 'charitable'
  },
  {
    id: 'quote_charitable_gates',
    text: "Philanthropy is involved with basic cause-and-effect, with trying to modify the issues that create the need.",
    author: "Bill Gates",
    category: 'charitable'
  }
];

export const ELIGIBLE_MOMENTS = [
  // Chapters / Tiers
  'advisor_shown_tier_STREET',
  'advisor_shown_tier_STARTUP',
  'advisor_shown_tier_CORPORATE',
  'advisor_shown_tier_ELITE',
  'advisor_shown_tier_MOGUL',
  'advisor_shown_tier_PRESIDENT',
  'advisor_shown_tier_OPEN',
  // Significant Achievements
  'advisor_shown_first_passive',
  'advisor_shown_first_business',
  'advisor_shown_first_million',
  'advisor_shown_first_employee',
  'advisor_shown_charity',
  'advisor_shown_university'
];

export function determineDominantIdentity(pl: PlayerStats): 'risk' | 'investor' | 'leader' | 'resilient' | 'charitable' {
  const behavior = analyzeBehavior(pl);
  const flags = pl.narrativeFlags || {};
  const publicReputation = (flags.publicReputation as string) || "The Hustler";

  let risk = 0;
  let investor = 0;
  let leader = 0;
  let resilient = 0;
  let charitable = 0;

  // 1. Charitable
  if (publicReputation === 'The Philanthropist') charitable += 50;
  if (publicReputation === "The People's Champion") charitable += 30;
  if ((pl.hustleLevels?.['philanthropy_empire'] || 0) > 0) charitable += 40;
  if (pl.philanthropyDonation && pl.philanthropyDonation > 100000) charitable += 30;
  if (behavior.orientationScore > 0) {
    charitable += behavior.orientationScore * 0.5;
  }

  // 2. Risk-taking
  if (publicReputation === 'The Controversial Tycoon') risk += 50;
  if (publicReputation === 'The Crime Boss') risk += 50;
  if (behavior.riskCadenceRatio > 0.4) risk += 30;
  if (pl.heat > 60) risk += 20;
  if (pl.arrestCount && pl.arrestCount > 0) risk += 25;

  // 3. Patient investor
  if (publicReputation === 'The Investor') investor += 50;
  if (publicReputation === 'The Billionaire') investor += 45;
  const passiveTotal = pl.lastPassiveBreakdown?.finalTotal || 0;
  if (passiveTotal > 50000) investor += 40;
  if ((pl.rentPortfolioCount || 0) >= 2) investor += 20;
  if (behavior.paceLabel === 'Deliberate') investor += 20;

  // 4. Leader
  if (publicReputation === 'The Kingmaker') leader += 50;
  if (pl.employeeCount && pl.employeeCount > 0) leader += 30;
  if (Object.keys(pl.cabinet || {}).length > 0) leader += 45;
  if ((pl.conglomerateCandidates || []).some((c: any) => c.assignedDivision)) leader += 40;
  if (flags.advisor_shown_first_employee) leader += 20;

  // 5. Resilient
  if (pl.mentalHealth < 50) resilient += 30;
  if (behavior.setbackRatio > 0.5) resilient += 25;
  if (pl.sabotagedCount && pl.sabotagedCount > 0) resilient += 20;
  if (pl.arrestCount && pl.arrestCount > 0) resilient += 20;
  const setbackTotal = (pl.escalationCount || 0) + (pl.retreatCount || 0);
  if (setbackTotal > 0) {
    resilient += Math.min(30, setbackTotal * 5);
  }

  const scores: { id: 'risk' | 'investor' | 'leader' | 'resilient' | 'charitable'; score: number }[] = [
    { id: 'resilient', score: resilient },
    { id: 'charitable', score: charitable },
    { id: 'leader', score: leader },
    { id: 'investor', score: investor },
    { id: 'risk', score: risk },
  ];

  // Sort descending by score. In case of ties, resilient / charitable are preferred.
  scores.sort((a, b) => b.score - a.score);
  return scores[0].id;
}

export function getOrAssignQuoteForPrompt(
  pl: PlayerStats,
  promptId: string,
  updateFlags: (newFlags: Record<string, string | number | boolean>) => void
): { text: string; author: string } | null {
  if (!ELIGIBLE_MOMENTS.includes(promptId)) {
    return null;
  }

  const flags = pl.narrativeFlags || {};

  // 1. If we have already assigned a quote for this prompt, look it up
  const assignedQuoteId = flags[`assigned_quote_${promptId}`] as string | undefined;
  if (assignedQuoteId) {
    const q = INSPIRATIONAL_QUOTES.find(item => item.id === assignedQuoteId);
    if (q) {
      return { text: q.text, author: q.author };
    }
  }

  // 2. Determine dominant identity
  const identity = determineDominantIdentity(pl);

  // 3. Find unshown quotes in this category
  const categoryQuotes = INSPIRATIONAL_QUOTES.filter(q => q.category === identity);
  let selectedQuote = categoryQuotes.find(q => !flags[`quote_shown_${q.id}`]);

  // 4. If all are shown, fall back to any unshown quote in other categories
  if (!selectedQuote) {
    selectedQuote = INSPIRATIONAL_QUOTES.find(q => !flags[`quote_shown_${q.id}`]);
  }

  // 5. If still none (all 15 quotes are shown, extremely rare), reset shown quotes for this category and try again
  if (!selectedQuote) {
    const newFlagsToClear: Record<string, string | number | boolean> = {};
    categoryQuotes.forEach(q => {
      newFlagsToClear[`quote_shown_${q.id}`] = false;
    });
    // This is safe since we can update narrative flags
    updateFlags(newFlagsToClear);
    selectedQuote = categoryQuotes[0];
  }

  if (selectedQuote) {
    // Save to narrativeFlags
    updateFlags({
      [`assigned_quote_${promptId}`]: selectedQuote.id,
      [`quote_shown_${selectedQuote.id}`]: true
    });
    return { text: selectedQuote.text, author: selectedQuote.author };
  }

  return null;
}
