import type { PlayerStats } from '../types/game';

export const getDeathContext = (
  pl: PlayerStats,
  fatalStat: 'clout' | 'aura' | 'mental' | 'bag' | 'heat',
  fatalStatValue: number,
  lastAction: {
    name: string;
    mentalHit: number;
    technicalMath?: { label: string; multiplier: number }[];
    bagHit?: number;
    cloutHit?: number;
    auraHit?: number;
  }
) => {
  const context: any = {
    statReachedZero: fatalStat.toUpperCase(),
    statValueAtDeath: fatalStatValue,
    monthsPlayed: pl.month,
    tier: pl.currentTier,
    lastHustleName: lastAction.name,
    fatalStat,
    fatalStatValue,
  };

  // 1. Determine Cause and Narrative
  if (fatalStat === 'mental') {
    context.cause = 'Burnout';
    context.narrative = `You pushed yourself too hard trying to grow your empire. A ${lastAction.name.includes('Monthly') ? 'relentless month' : 'failed hustle'} caused severe Mental Health damage, leaving you unable to continue.`;
    context.recommendations = [
      'Invest in Mental Health recovery earlier.',
      'Avoid upgrading hustles before improving resilience.',
      'Use "Rest & Recover" or "Therapy" to maintain stability.'
    ];
  } else if (fatalStat === 'bag') {
    context.cause = 'Bankruptcy';
    context.narrative = `Your ambition exceeded your bank account. Between ${lastAction.name} and monthly expenses, you've run out of cash and credit.`;
    context.recommendations = [
      'Build passive income before taking larger risks.',
      'Always keep a buffer for rent and recurring expenses.',
      'Watch out for high-cost upgrades in early tiers.'
    ];
  } else if (fatalStat === 'clout' || fatalStat === 'aura') {
    context.cause = fatalStat === 'clout' ? 'Reputation Collapse' : 'Canceled';
    context.narrative = `Your public image has been destroyed. In this world, perception is reality, and you are no longer a player.`;
    context.recommendations = [
      'Balance high-yield jobs with reputation-building activities.',
      'Defeat rivals to cement your status.',
      'Use PR campaigns to bolster your public standing.'
    ];
  } else if (fatalStat === 'heat') {
    context.cause = 'Heat Caught Up With You';
    context.narrative = `You flew too close to the sun. The authorities have finally caught up with your operations.`;
    context.recommendations = [
      'Reduce Heat before attempting high-risk jobs.',
      'Use "Ghost Mode" to lower your profile.',
      'Avoid back-to-back high-heat actions.'
    ];
  }

  // 2. Build Timeline
  const timeline = [];
  if (fatalStat === 'mental') {
    const prevMental = Math.min(100, Math.max(0, Math.round(pl.mentalHealth - lastAction.mentalHit)));
    timeline.push({ label: 'Mental Health', value: `${prevMental}%` });
    if (lastAction.mentalHit !== 0) {
      timeline.push({
        label: `${lastAction.name}`,
        value: `${lastAction.mentalHit > 0 ? '+' : ''}${Math.round(lastAction.mentalHit)}%`,
        color: lastAction.mentalHit < 0 ? 'text-red-400' : 'text-emerald-400'
      });
    }
    timeline.push({ label: 'Final Mental Health', value: `${Math.max(0, Math.round(pl.mentalHealth))}%`, color: 'text-red-600' });
  } else if (fatalStat === 'bag') {
    timeline.push({ label: 'Cash Balance', value: `$${Math.round(pl.bag - (lastAction.bagHit || 0)).toLocaleString()}` });
    if (lastAction.bagHit) {
        timeline.push({
            label: lastAction.name,
            value: `-$${Math.abs(Math.round(lastAction.bagHit)).toLocaleString()}`,
            color: 'text-red-400'
        });
    }
    timeline.push({ label: 'Final Balance', value: `$${Math.round(pl.bag).toLocaleString()}`, color: 'text-red-600' });
  } else {
    timeline.push({ label: 'Stat Level', value: 'Low' });
    timeline.push({ label: 'Final Action', value: lastAction.name, color: 'text-red-400' });
    timeline.push({ label: 'Final Status', value: '0', color: 'text-red-600' });
  }

  context.timeline = timeline;
  context.technicalMath = lastAction.technicalMath;

  return context;
};
