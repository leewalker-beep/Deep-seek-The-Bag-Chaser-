import type { PlayerStats, Tier } from '../types/game';

const TIER_MULTIPLIERS: Record<Tier, number> = {
  MUD: 1,
  STREET: 2,
  STARTUP: 3,
  CORPORATE: 4,
  ELITE: 5,
  MOGUL: 6,
  PRESIDENT: 7,
  OPEN: 10,
};

export function calculateLegacyScore(pl: PlayerStats): number {
  const stats = pl.stats || { lifetimeEarnings: 0, successfulHustles: 0, totalHustles: 0 };

  // 1. Total lifetime profit ($1 = 1 point, capped at 1M points)
  const profitPoints = Math.min(stats.lifetimeEarnings, 1000000);

  // 2. Total hustles completed (10 points each)
  const hustlePoints = (stats.totalHustles || 0) * 10;

  // 3. Total achievements unlocked (100 points each)
  const achievementPoints = (pl.unlockedAchievements?.length || 0) * 100;

  // 4. Total endings unlocked (500 points each)
  // Endings are stored in localStorage, but for the engine we'll try to get them if possible
  // or assume they are passed/tracked. However, the requirement says "Total endings unlocked".
  // Since engine doesn't have access to localStorage easily in a clean way (it might run on server or tests),
  // but this is a client-side game.
  // Let's check how many endings are currently unlocked from a helper if we can.
  let endingsUnlocked = 0;
  if (typeof window !== 'undefined') {
    try {
      const savedEndings = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');
      endingsUnlocked = savedEndings.length;
    } catch (e) {
      endingsUnlocked = 0;
    }
  }
  const endingPoints = endingsUnlocked * 500;

  // 5. Death badges collected (50 points each)
  const deathBadgePoints = (pl.collectedDeathBadges?.length || 0) * 50;

  // 6. Days played (10 points per day)
  // In game, time is months. We'll treat 1 month = 1 day for scoring or as 1 month = 30 days?
  // "10 points per day" usually implies the in-game time unit.
  const timePoints = (pl.month || 0) * 10;

  const baseScore = profitPoints + hustlePoints + achievementPoints + endingPoints + deathBadgePoints + timePoints;

  // 7. Login streak (bonus points for long streaks)
  const streakBonus = (pl.loginStreak || 0) * 100;

  // 8. Highest tier reached (multiplier)
  // We'll use the currentTier or the bestRunTier if available
  const highestTierReached: Tier = pl.stats?.bestRunTier || pl.currentTier;
  const tierMultiplier = TIER_MULTIPLIERS[highestTierReached] || 1;

  return Math.floor((baseScore + streakBonus) * tierMultiplier);
}
