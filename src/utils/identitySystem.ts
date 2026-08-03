import type { PlayerStats } from '../types/game';
import { analyzeBehavior } from './personalityAnalyzer';

export interface IdentityDimensions {
  compassion: number;     // 0-100
  integrity: number;      // 0-100
  ambition: number;       // 0-100
  patience: number;       // 0-100
  riskTaking: number;     // 0-100
  leadership: number;     // 0-100
  fameSeeking: number;    // 0-100
  resilience: number;     // 0-100
}

export type IdentityArchetype =
  | 'The Builder'
  | 'The Opportunist'
  | 'The Protector'
  | 'The Visionary'
  | 'The Survivor'
  | 'The Statesman';

export interface IdentityProfile {
  dimensions: IdentityDimensions;
  dominantArchetype: IdentityArchetype;
  evolutionTrajectory: string;
  reflection: string;
  advisorObservation: string;
}

/**
 * Computes all 8 non-visible identity dimensions from existing player data.
 * The scores are normalized to 0-100.
 */
export function evaluateIdentityDimensions(pl: PlayerStats): IdentityDimensions {
  const behavior = analyzeBehavior(pl);

  const charityChoices = Number(pl.narrativeFlags?.charity_choices_count || 0);
  const unethicalChoices = Number(pl.narrativeFlags?.unethical_choices_count || 0);
  const educationChoices = Number(pl.narrativeFlags?.education_choices_count || 0);
  const employeeSupportChoices = Number(pl.narrativeFlags?.employee_support_choices_count || 0);
  const employeeExploitChoices = Number(pl.narrativeFlags?.employee_exploit_choices_count || 0);

  const activeRep = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";

  // 1. Compassion / Community Focus
  const philanthropyLvl = pl.hustleLevels?.['philanthropy_empire'] || 0;
  const donation = pl.philanthropyDonation || 0;
  let compassion = charityChoices * 15;
  if (donation > 100000) compassion += 20;
  if (donation > 5000000) compassion += 20;
  if (philanthropyLvl > 0) compassion += 25;
  if (activeRep === "The Philanthropist" || activeRep === "The People's Champion") compassion += 20;
  compassion = Math.max(0, Math.min(100, compassion));

  // 2. Integrity
  let integrity = 50 + charityChoices * 10 - unethicalChoices * 15;
  if ((pl.arrestCount || 0) > 0) integrity -= 20;
  if (pl.heat > 60) integrity -= 15;
  if (activeRep === "The Reformer" || activeRep === "The Philanthropist") integrity += 20;
  if (activeRep === "The Crime Boss") integrity -= 25;
  integrity = Math.max(0, Math.min(100, integrity));

  // 3. Ambition / Power Seeking
  let ambition = employeeExploitChoices * 10 + (pl.currentTier === 'PRESIDENT' ? 30 : 0);
  if (pl.bag > 1000000) ambition += 15;
  if (pl.bag > 50000000) ambition += 15;
  const uniqueHustles = Object.keys(pl.hustleLevels || {}).length;
  ambition += uniqueHustles * 4;
  if (activeRep === "The Mogul" || activeRep === "The Billionaire" || activeRep === "The Kingmaker") ambition += 20;
  ambition = Math.max(0, Math.min(100, ambition));

  // 4. Patience / Long-term Thinking
  let patience = educationChoices * 15 + Math.round(behavior.adviceRatio * 40);
  if (behavior.paceLabel === 'Deliberate') patience += 20;
  if (activeRep === "The Investor") patience += 20;
  patience = Math.max(0, Math.min(100, patience));

  // 5. Risk-taking
  let riskTaking = unethicalChoices * 10 + Math.round(behavior.riskCadenceRatio * 50);
  if (pl.heat > 50) riskTaking += 15;
  if (behavior.paceLabel === 'Fast') riskTaking += 15;
  if (activeRep === "The Crime Boss" || activeRep === "The Controversial Tycoon") riskTaking += 20;
  riskTaking = Math.max(0, Math.min(100, riskTaking));

  // 6. Leadership
  const cabinetSize = pl.cabinet ? Object.keys(pl.cabinet).length : 0;
  const alliesCount = (pl.rivals || []).filter(r => r.status === 'ally').length;
  let leadership = employeeSupportChoices * 12 + Math.round(behavior.loyaltyScore * 0.4);
  if (cabinetSize > 0) leadership += 15;
  if (alliesCount > 0) leadership += 15;
  if (activeRep === "The Reformer" || activeRep === "The Kingmaker" || activeRep === "The President") leadership += 15;
  leadership = Math.max(0, Math.min(100, leadership));

  // 7. Fame Seeking
  let fameSeeking = (activeRep === "The Celebrity" || activeRep === "The Media Emperor") ? 35 : 0;
  if (pl.clout > 1000) fameSeeking += 20;
  if (pl.clout > 10000) fameSeeking += 15;
  if (pl.aura > 75) fameSeeking += 15;
  if ((pl.artists || []).length > 0) fameSeeking += 15;
  fameSeeking = Math.max(0, Math.min(100, fameSeeking));

  // 8. Resilience
  let resilience = 30 + Math.round(behavior.setbackRatio * 30);
  if (pl.masteredHustles?.includes('the_phoenix')) resilience += 25;
  if (pl.narrativeFlags?.rebounded_bankruptcy_millionaire) resilience += 15;
  if (pl.narrativeFlags?.rebounded_bankruptcy_billionaire) resilience += 15;
  if (pl.narrativeFlags?.rebounded_prison) resilience += 15;
  resilience = Math.max(0, Math.min(100, resilience));

  return {
    compassion,
    integrity,
    ambition,
    patience,
    riskTaking,
    leadership,
    fameSeeking,
    resilience,
  };
}

/**
 * Determines the dominant player archetype based on evaluated behavior.
 */
export function determineDominantIdentityArchetype(pl: PlayerStats): IdentityArchetype {
  const dim = evaluateIdentityDimensions(pl);
  const activeRep = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";

  // Statesman takes absolute priority if President or high Leadership
  if (pl.currentTier === 'PRESIDENT' || activeRep === "The President" || (dim.leadership >= 75 && dim.integrity >= 60)) {
    return 'The Statesman';
  }

  // Survivor high priority if phoenix badge or multiple comebacks
  const isPhoenix = pl.masteredHustles?.includes('the_phoenix') ||
                    pl.narrativeFlags?.rebounded_bankruptcy_millionaire ||
                    pl.narrativeFlags?.rebounded_bankruptcy_billionaire ||
                    pl.narrativeFlags?.rebounded_prison;
  if (isPhoenix && dim.resilience >= 60) {
    return 'The Survivor';
  }

  // Match other archetypes based on dominant scores
  const scores: { archetype: IdentityArchetype; score: number }[] = [
    { archetype: 'The Statesman', score: dim.leadership * 0.8 + dim.integrity * 0.5 },
    { archetype: 'The Survivor', score: dim.resilience },
    { archetype: 'The Protector', score: dim.compassion * 0.8 + dim.leadership * 0.5 },
    { archetype: 'The Builder', score: dim.patience * 0.8 + dim.integrity * 0.4 },
    { archetype: 'The Visionary', score: dim.fameSeeking * 0.7 + dim.ambition * 0.6 },
    { archetype: 'The Opportunist', score: dim.riskTaking * 0.8 + (100 - dim.integrity) * 0.5 }
  ];

  scores.sort((a, b) => b.score - a.score);
  return scores[0].archetype;
}

/**
 * Detects dynamic trajectory changes and evolutions like "Redemption" or "Maturity".
 */
export function detectIdentityEvolution(pl: PlayerStats): string {
  const dim = evaluateIdentityDimensions(pl);
  const unethicalChoices = Number(pl.narrativeFlags?.unethical_choices_count || 0);
  const charityChoices = Number(pl.narrativeFlags?.charity_choices_count || 0);

  // 1. Redemption / Corruption Mutual Exclusivity
  if (unethicalChoices >= 3 && charityChoices >= 3) {
    if (pl.heat >= 50) {
      return "Corruption: You built your early reputation on community trust and welfare, but have gradually adopted ruthless grey-market strategies to secure your power.";
    } else {
      return "Redemption: You started your journey cutting corners and making high-stakes compromises, but have evolved into a major community philanthropist.";
    }
  }
  if (unethicalChoices >= 3 && pl.philanthropyDonation && pl.philanthropyDonation >= 1000000) {
    return "Redemption: You started your journey cutting corners and making high-stakes compromises, but have evolved into a major community philanthropist.";
  }

  // 3. Maturity / Steady Investor: Started with fast-paced risk taking but transitioned to slow deliberate patience
  const behavior = analyzeBehavior(pl);
  if (behavior.riskCadenceRatio > 0.4 && behavior.paceLabel === 'Deliberate' && dim.patience >= 65) {
    return "Maturity: Once a highly volatile risk-taker, you have matured into a highly calculated and patient investor who values fortress-like stability.";
  }

  // 4. Celebrity to Statesman: Grew massive celebrity/fame, but transitioned to leading cabinet/allies
  const cabinetSize = pl.cabinet ? Object.keys(pl.cabinet).length : 0;
  if (dim.fameSeeking >= 60 && (pl.currentTier === 'PRESIDENT' || cabinetSize >= 2)) {
    return "Statesmanship: Having conquered the national media and public adoration as a high-society celebrity, you pivoted to mobilize systemic executive authority and statecraft.";
  }

  // 5. Failed Entrepreneur to Respected Mentor: Suffered bankruptcy or failure but became highly supportive
  if (pl.narrativeFlags?.had_bankruptcy_crisis && dim.leadership >= 65 && behavior.loyaltyScore >= 70) {
    return "Resilience & Mentorship: Having faced the absolute lowest points of chapter 11 bankruptcy, you rebuilt your wealth while standing fiercely by your core executives and inner circle.";
  }

  // 6. Consistent Baseline
  const archetype = determineDominantIdentityArchetype(pl);
  switch (archetype) {
    case 'The Builder':
      return "Consistency: You have pursued a flawless, methodical strategy from day one, refusing to trade long-term stability for quick, volatile wins.";
    case 'The Opportunist':
      return "Opportunism: You move like a storm, capitalising aggressively on active risk and leveraging every transactional loophole.";
    case 'The Protector':
      return "Altruism: Your entire empire is an ecosystem of support, protecting both your workforce and local grassroots districts.";
    case 'The Visionary':
      return "Visionary Expansion: You trade heavily in cultural assets, fame, and media networks, making your name the absolute ultimate asset.";
    case 'The Survivor':
      return "Survivalism: Rebounding with absolute resilience, you treat near-ruin as merely a blank canvas to build larger dynasties.";
    case 'The Statesman':
    default:
      return "Sovereign Leadership: You are a deliberate architect of institutional power, commanding vast cabinet resources and legislative leverage.";
  }
}

/**
 * Generates an observational, non-judgmental short reflection based on current behaviour patterns.
 */
export function generatePeriodicReflection(pl: PlayerStats): string {
  const dim = evaluateIdentityDimensions(pl);
  const behavior = analyzeBehavior(pl);

  const charityChoices = Number(pl.narrativeFlags?.charity_choices_count || 0);
  const unethicalChoices = Number(pl.narrativeFlags?.unethical_choices_count || 0);

  // Dimension-based reflections (Observational & non-judgmental)
  if (dim.patience >= 70 && dim.riskTaking <= 35) {
    return "You have consistently chosen long-term investments over quick profits.";
  }
  if (dim.ambition >= 45 && behavior.loyaltyScore <= 40) {
    return "Your empire has grown rapidly, but your relationships have become increasingly transactional.";
  }
  if (dim.compassion >= 65 && dim.ambition <= 55) {
    return "Communities trust you more than investors.";
  }
  if (dim.fameSeeking >= 70 && Object.keys(pl.hustleLevels || {}).length <= 4) {
    return "Your reputation has become larger than your businesses.";
  }
  if (behavior.loyaltyScore >= 75 && dim.riskTaking <= 45) {
    return "You have repeatedly chosen loyalty over opportunity.";
  }
  if (unethicalChoices >= 3 && dim.resilience >= 60) {
    return "You’ve become increasingly comfortable with difficult decisions.";
  }
  if (charityChoices >= 3 && unethicalChoices === 0) {
    return "I’ve noticed that you rarely sacrifice principles for profit.";
  }
  if (dim.patience >= 65 && behavior.setbackRatio >= 0.6) {
    return "Your greatest strength has become consistency.";
  }

  // Balanced fallback
  if (dim.integrity >= 50) {
    return "You have balanced steady expansion with a highly respected public profile.";
  } else {
    return "You have capitalized aggressively on volatility while preserving absolute self-reliance.";
  }
}

/**
 * Generates rare and memorable life-level observation comments for the Strategic Advisor.
 */
export function generateAdvisorIdentityObservation(pl: PlayerStats): string {
  const dim = evaluateIdentityDimensions(pl);
  const behavior = analyzeBehavior(pl);

  if (dim.patience >= 70) {
    return "I've been watching your climb, Chaser. Your greatest asset isn't your bank balance—it's your near-limitless patience. You survive the cycles that break everyone else.";
  }
  if (dim.riskTaking >= 70) {
    return "You play with absolute fire, kid. I've noticed you rarely hesitate when a high-stakes, high-heat deal appears. It's a thrill to watch, but remember: gravity is absolute.";
  }
  if (dim.compassion >= 70) {
    return "Most tycoons in this city forget the streets the second they buy a suit. But you? You've built a real protective sanctuary around your community. It's an honorable path.";
  }
  if (behavior.loyaltyScore >= 75) {
    return "They say everyone has a price in this town. But looking at your roster, you've stood fiercely by your inner circle. Fierce loyalty is the only currency that doesn't decay.";
  }
  if (behavior.loyaltyScore <= 35) {
    return "You treat people like replaceable cogs in a spreadsheet. It's highly efficient for the bottom line, absolutely. Just make sure you can fight your own wars when the heat builds up.";
  }

  return "Every period of a player's life should answer one key question: 'What kind of person am I becoming?' Watch the reaction of the world; they will tell you exactly who you are.";
}

/**
 * Full identity profile compilation.
 */
export function compileIdentityProfile(pl: PlayerStats): IdentityProfile {
  return {
    dimensions: evaluateIdentityDimensions(pl),
    dominantArchetype: determineDominantIdentityArchetype(pl),
    evolutionTrajectory: detectIdentityEvolution(pl),
    reflection: generatePeriodicReflection(pl),
    advisorObservation: generateAdvisorIdentityObservation(pl),
  };
}

/**
 * Returns an identity-aligned description of the player as a billionaire or multi-millionaire,
 * illustrating how the world perceives their immense wealth.
 */
export function getIdentityAlignedBillionaireTone(pl: PlayerStats): string {
  const dim = evaluateIdentityDimensions(pl);
  const archetype = determineDominantIdentityArchetype(pl);
  const activeRep = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";
  const name = pl.name || "the Chaser";

  if ((pl.monthsSinceLastHustle || 0) >= 12) {
    return `the forgotten billionaire ${name}, largely absent from public circles while maintaining ten-figure bank vaults`;
  }
  if (archetype === 'The Protector' || dim.compassion >= 65) {
    return `the compassionate billionaire ${name}, whose vast fortune actively funds local grassroots aid and neighborhood centers`;
  }
  if (archetype === 'The Opportunist' || activeRep === 'The Crime Boss' || dim.riskTaking >= 70) {
    return `the feared billionaire ${name}, whose cold, aggressive leverage strikes absolute terror into industry rivals`;
  }
  if (activeRep === 'The Controversial Tycoon' || dim.integrity < 40) {
    return `the controversial billionaire ${name}, continuously triggering high-stakes compliance debates and regulatory audits`;
  }
  return `the respected billionaire ${name}, widely celebrated by trade boards as a model of methodical wealth and stability`;
}
