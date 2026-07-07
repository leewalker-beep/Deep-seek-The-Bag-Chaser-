import type { PlayerStats, Tier } from '../types/game';

const TIER_MULTIPLIERS: Record<Tier, number> = {
  MUD: 1,
  STREET: 1.5,
  STARTUP: 2,
  CORPORATE: 3,
  ELITE: 4,
  MOGUL: 6,
  PRESIDENT: 8,
  OPEN: 12,
};

export function calculateLegacyScore(pl: PlayerStats): number {
  const stats = pl.stats || { lifetimeEarnings: 0, successfulHustles: 0, totalHustles: 0 };

  // 1. Total lifetime profit (Bracketed System)
  let profitPoints = 0;
  const profit = stats.lifetimeEarnings || 0;

  if (profit <= 1000000) {
    profitPoints = profit / 1000;
  } else if (profit <= 100000000) {
    profitPoints = 1000 + (profit - 1000000) / 10000;
  } else if (profit <= 10000000000) {
    profitPoints = 1000 + 9900 + (profit - 100000000) / 1000000;
  } else {
    profitPoints = 1000 + 9900 + 9900 + (profit - 10000000000) / 100000000;
  }

  // 2. Total hustles completed (2 points each)
  const hustlePoints = (stats.totalHustles || 0) * 2;

  // 3. Total achievements unlocked (75 points each)
  const achievementPoints = (pl.unlockedAchievements?.length || 0) * 75;

  // 4. Total endings unlocked (250 points each)
  let endingsUnlocked = 0;
  if (typeof window !== 'undefined') {
    try {
      const savedEndings = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');
      endingsUnlocked = savedEndings.length;
    } catch (e) {
      endingsUnlocked = 0;
    }
  }
  const endingPoints = endingsUnlocked * 250;

  // 5. Death badges collected (20 points each)
  const deathBadgePoints = (pl.collectedDeathBadges?.length || 0) * 20;

  // 6. Months played (5 points per month)
  const timePoints = (pl.month || 0) * 5;

  // 7. Mid-run Legacy Points (from Achievements and Philanthropy)
  const midRunPoints = pl.legacyPoints || 0;

  const baseScore = profitPoints + hustlePoints + achievementPoints + endingPoints + deathBadgePoints + timePoints + midRunPoints;

  // 8. Login streak (50 bonus points for long streaks)
  const streakBonus = (pl.loginStreak || 0) * 50;

  // 9. Highest tier reached (multiplier)
  const highestTierReached: Tier = pl.stats?.bestRunTier || pl.currentTier;
  const tierMultiplier = TIER_MULTIPLIERS[highestTierReached] || 1;

  // 10. Legacy Momentum (from total challenges completed)
  // +0.1% per 10 challenges
  const momentumBoost = Math.floor((pl.totalChallengesCompleted || 0) / 10) * 0.001;

  return Math.floor((baseScore + streakBonus) * tierMultiplier * (1 + momentumBoost));
}
