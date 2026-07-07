import type { PlayerStats } from '../types/game';

/**
 * Calculates a financial comfort score (0-100).
 * High score means the player is in a stable position to spend on luxury.
 */
export function calculateFinancialComfortScore(
  pl: PlayerStats,
  threshold: number,
  passiveIncome: number,
  totalRent: number
): number {
  let score = 0;

  // 1. Liquidity Component (Up to 40 points)
  // We want the player to have a comfortable buffer above the threshold
  const safetyMargin = getRequiredSafetyMargin(threshold);
  const targetBag = threshold * safetyMargin;
  const liquidityRatio = Math.min(1, pl.bag / targetBag);
  score += liquidityRatio * 40;

  // 2. Cash Flow Component (Up to 20 points)
  // Can the player afford their lifestyle?
  const monthlyNet = passiveIncome - totalRent;
  if (monthlyNet > 0) {
    // If net income can cover the asset cost in 24 months, that's very stable
    const cashFlowRatio = Math.min(1, (monthlyNet * 24) / threshold);
    score += cashFlowRatio * 20;
  }

  // 3. Mental Stability Component (Up to 20 points)
  if (pl.mentalHealth > 30) {
    const mentalRatio = Math.min(1, (pl.mentalHealth - 30) / 50);
    score += mentalRatio * 20;
  }

  // 4. Heat / Legal Component (Up to 20 points)
  if (pl.heat < 70) {
    const heatRatio = Math.min(1, (70 - pl.heat) / 50);
    score += heatRatio * 20;
  }

  return Math.floor(score);
}

/**
 * Higher cost assets require a larger safety margin.
 * 10k -> 2.0x
 * 100M -> 5.0x
 */
export function getRequiredSafetyMargin(threshold: number): number {
  if (threshold <= 10000) return 2.0;
  if (threshold <= 50000) return 2.5;
  if (threshold <= 500000) return 3.0;
  if (threshold <= 1000000) return 3.5;
  if (threshold <= 5000000) return 4.0;
  if (threshold <= 25000000) return 4.5;
  return 5.0; // 100M+
}

/**
 * Main logic to determine if a Flex offer should trigger.
 */
export function shouldOfferFlex(
  pl: PlayerStats,
  threshold: number,
  passiveIncome: number,
  totalRent: number
): boolean {
  // 1. Basic Guards (Do not interrupt during crisis)
  if (pl.inJail) return false;
  if (pl.mentalHealth < 25) return false;
  if (pl.heat > 80) return false;
  if (pl.activeNarrative) return false;
  if (pl.flexOfferCooldown > 0) return false;

  // Bankruptcy risk: If buying this would leave them with less than 2 months of rent
  if (pl.bag - threshold < totalRent * 2) return false;

  // 2. Safety Margin Check (Hard requirement)
  const margin = getRequiredSafetyMargin(threshold);
  if (pl.bag < threshold * margin) return false;

  // 3. Comfort Score Check (Soft requirement)
  const comfortScore = calculateFinancialComfortScore(pl, threshold, passiveIncome, totalRent);
  if (comfortScore < 70) return false;

  return true;
}

const CELEBRATION_MESSAGES = [
  "Business is booming...",
  "You've finally made real money...",
  "You've earned something special.",
  "The world is taking notice of your success.",
  "It's time to show them what you're really worth.",
  "A new level of prestige awaits you.",
  "Your empire is growing, and so should your status.",
  "Legacy isn't just built, it's displayed."
];

export function getFlexCelebration(): string {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}
