import type { PlayerStats } from '../types/game';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';
import { getMasteryCount } from './masteryUtils';

export interface ImmediateGoal {
  type: 'RECOVER' | 'RISK' | 'ADVANCE' | 'CROWN' | 'GOAL' | 'EMPIRE' | 'PRIORITY' | 'LEGACY';
  label: string; // e.g. "RECOVER", "RISK", "NEXT GOAL", "ADVANCE", "EMPIRE", "PRIORITY", "LEGACY"
  message: string; // e.g. "Rest before your next major hustle", "Earn your first Crown"
  subtext?: string;
  actionHint?: string;
  badgeClass: string;
  borderClass: string;
}

export function getImmediateGoal(pl: PlayerStats): ImmediateGoal {
  // 1. Low Mental Health
  if (pl.mentalHealth <= 30) {
    return {
      type: 'RECOVER',
      label: 'RECOVER',
      message: 'Rest before your next major hustle',
      subtext: `Mental health is critical (${Math.floor(pl.mentalHealth)}%). Danger of burnout death!`,
      actionHint: 'Run Sleep or Power Nap to recover mental health',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
      borderClass: 'border-red-500/40 bg-red-950/20'
    };
  }

  // 2. High Heat
  if (pl.heat >= 75 && !pl.inJail && !(pl as any).isIncarcerated) {
    return {
      type: 'RISK',
      label: 'RISK',
      message: 'Heat is approaching the arrest zone',
      subtext: `Heat is at ${Math.floor(pl.heat)}%. Federal raids and police arrest are imminent!`,
      actionHint: 'Run Ghost Mode or lay low to cool down Heat',
      badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse',
      borderClass: 'border-orange-500/40 bg-orange-950/20'
    };
  }

  // 3. Incarcerated
  if (pl.inJail || (pl as any).isIncarcerated) {
    return {
      type: 'RISK',
      label: 'INCARCERATED',
      message: 'Serve your sentence or arrange a legal defense',
      subtext: pl.jailSentenceMonths ? `${pl.jailSentenceMonths} month(s) remaining on sentence.` : 'In police custody.',
      actionHint: 'Pass months or bribe officials to regain freedom',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
      borderClass: 'border-red-500/40 bg-red-950/20'
    };
  }

  // 4. OPEN Tier
  if (pl.currentTier === 'OPEN') {
    return {
      type: 'LEGACY',
      label: 'LEGACY',
      message: 'Your career is now unrestricted',
      subtext: 'Build global sports leagues, movie studios, or eternal dynasties.',
      actionHint: 'Explore OPEN tier opportunities and Flex assets',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderClass: 'border-amber-500/40 bg-amber-950/20'
    };
  }

  // 5. President Tier
  if (pl.currentTier === 'PRESIDENT') {
    return {
      type: 'PRIORITY',
      label: 'PRIORITY',
      message: 'Stabilize the current national situation',
      subtext: `Approval: ${Math.floor(pl.approvalRating || 50)}% • Inflation: ${(pl.inflation || 3).toFixed(1)}%`,
      actionHint: 'Issue Executive Orders and balance national priorities',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      borderClass: 'border-blue-500/40 bg-blue-950/20'
    };
  }

  // Check progression
  const currentIndex = PROGRESSION_ORDER.indexOf(pl.currentTier);
  const nextTier = PROGRESSION_ORDER[currentIndex + 1];
  const nextReqs = nextTier ? TIER_REQUIREMENTS[nextTier] : null;

  if (nextReqs && nextTier) {
    const masteredCount = getMasteryCount(pl);
    const hasCash = pl.bag >= nextReqs.cash;
    const hasClout = pl.clout >= nextReqs.clout;
    const hasAura = pl.aura >= nextReqs.aura;
    const hasCrowns = masteredCount >= nextReqs.crowns;

    // 6. Can Advance
    if (hasCash && hasClout && hasAura && hasCrowns) {
      return {
        type: 'ADVANCE',
        label: 'ADVANCE',
        message: `You meet all requirements for ${nextTier} tier`,
        subtext: 'Tap ADVANCE TIER to upgrade your headquarters and unlock new ventures!',
        actionHint: `Ready to advance to ${nextTier}`,
        badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
        borderClass: 'border-purple-500/40 bg-purple-950/20'
      };
    }

    // 7. Missing Crowns
    if (!hasCrowns) {
      const remainingCrowns = nextReqs.crowns - masteredCount;
      if (masteredCount === 0) {
        return {
          type: 'CROWN',
          label: 'NEXT GOAL',
          message: 'Earn your first Crown',
          subtext: `Master a hustle by hitting its completion target (need ${nextReqs.crowns} Crown${nextReqs.crowns > 1 ? 's' : ''} for ${nextTier}).`,
          actionHint: 'Execute hustles repeatedly to earn permanent Mastery Crowns',
          badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          borderClass: 'border-yellow-500/40 bg-yellow-950/20'
        };
      }
      return {
        type: 'CROWN',
        label: 'NEXT GOAL',
        message: `Master ${remainingCrowns} more hustle${remainingCrowns > 1 ? 's' : ''}`,
        subtext: `Crown Progress: ${masteredCount}/${nextReqs.crowns} Crowns earned for ${nextTier} tier.`,
        actionHint: 'Check Crown progress bars on your hustle cards',
        badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        borderClass: 'border-yellow-500/40 bg-yellow-950/20'
      };
    }

    // 8. Passive Income Milestone
    const totalPassive = pl.passiveIncome || 0;
    if (totalPassive > 0) {
      return {
        type: 'EMPIRE',
        label: 'EMPIRE',
        message: 'Your assets now generate monthly income',
        subtext: `+$${Math.floor(totalPassive).toLocaleString()}/month passive cashflow active.`,
        actionHint: 'Reinvest earnings into high-yield business upgrades',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        borderClass: 'border-emerald-500/40 bg-emerald-950/20'
      };
    }

    // 9. Missing Cash / Clout / Aura
    if (!hasCash) {
      const needed = nextReqs.cash - pl.bag;
      return {
        type: 'GOAL',
        label: 'NEXT GOAL',
        message: `Earn $${needed.toLocaleString()} more to qualify for ${nextTier}`,
        subtext: `Capital: $${pl.bag.toLocaleString()} / $${nextReqs.cash.toLocaleString()}`,
        actionHint: 'Execute high-yield hustles and maintain minigame multipliers',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        borderClass: 'border-emerald-500/40 bg-emerald-950/20'
      };
    }

    if (!hasClout) {
      const needed = Math.ceil(nextReqs.clout - pl.clout);
      return {
        type: 'GOAL',
        label: 'NEXT GOAL',
        message: `Earn ${needed} more Clout to qualify for ${nextTier}`,
        subtext: `Clout: ${Math.floor(pl.clout)} / ${nextReqs.clout}`,
        actionHint: 'Run media, podcasting, or social street hustles',
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        borderClass: 'border-blue-500/40 bg-blue-950/20'
      };
    }

    if (!hasAura) {
      const needed = Math.ceil(nextReqs.aura - pl.aura);
      return {
        type: 'GOAL',
        label: 'NEXT GOAL',
        message: `Earn ${needed} more Aura to qualify for ${nextTier}`,
        subtext: `Aura: ${Math.floor(pl.aura)} / ${nextReqs.aura}`,
        actionHint: 'Run PR campaigns or high-presence street plays',
        badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        borderClass: 'border-purple-500/40 bg-purple-950/20'
      };
    }
  }

  // 10. Default Passive Income Fallback
  const totalPassive = pl.passiveIncome || 0;
  if (totalPassive > 0) {
    return {
      type: 'EMPIRE',
      label: 'EMPIRE',
      message: 'Your assets now generate monthly income',
      subtext: `+$${Math.floor(totalPassive).toLocaleString()}/month passive cashflow active.`,
      actionHint: 'Reinvest earnings into high-yield business upgrades',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderClass: 'border-emerald-500/40 bg-emerald-950/20'
    };
  }

  // 10. Default / Early Game Goal
  return {
    type: 'GOAL',
    label: 'NEXT GOAL',
    message: 'Build cash and clout to advance',
    subtext: 'Execute hustles, score high in minigames, and protect your stats.',
    actionHint: 'Tap any active hustle card to start',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-500/40 bg-emerald-950/20'
  };
}
