import type { PlayerStats, LastStatBreakdown, StatChangeSource } from '../types/game';
import { HUSTLES } from '../config/hustles/base';

export function calculateAndSetStatBreakdown(
  plBefore: PlayerStats,
  plAfter: PlayerStats,
  hustleId?: string | null,
  activeResult?: any,
  passiveIncome: number = 0,
  totalRent: number = 0
): LastStatBreakdown {
  const cashSources: StatChangeSource[] = [];
  const auraSources: StatChangeSource[] = [];
  const cloutSources: StatChangeSource[] = [];
  const heatSources: StatChangeSource[] = [];
  const mentalSources: StatChangeSource[] = [];

  // --- CASH BREAKDOWN ---
  if (hustleId && HUSTLES[hustleId]) {
    const hustle = HUSTLES[hustleId];
    if (activeResult) {
      if (activeResult.yieldCash > 0) {
        cashSources.push({
          name: hustle.name,
          amount: activeResult.yieldCash
        });
      }
      if (activeResult.cost > 0) {
        cashSources.push({
          name: `${hustle.name} Cost`,
          amount: -activeResult.cost
        });
      }
    }
  }

  if (passiveIncome > 0) {
    cashSources.push({
      name: 'Passive income',
      amount: passiveIncome
    });
  }

  if (totalRent > 0) {
    cashSources.push({
      name: 'Rent',
      amount: -totalRent
    });
  }

  const computedCashSum = cashSources.reduce((sum, s) => sum + s.amount, 0);
  const actualCashDelta = plAfter.bag - plBefore.bag;
  const unaccountedCash = actualCashDelta - computedCashSum;

  if (unaccountedCash !== 0) {
    if (unaccountedCash < 0 && plBefore.mentalHealth < 50 && hustleId) {
      cashSources.push({
        name: 'Mental Health penalty',
        amount: unaccountedCash
      });
    } else {
      cashSources.push({
        name: unaccountedCash > 0 ? 'Other passive yields' : 'Rent & upkeep deductions',
        amount: unaccountedCash
      });
    }
  }

  // --- AURA BREAKDOWN ---
  if (hustleId && HUSTLES[hustleId]) {
    const hustle = HUSTLES[hustleId];
    if (activeResult) {
      if (activeResult.yieldAura > 0) {
        auraSources.push({
          name: hustleId === 'r_pr_campaign' ? 'PR Campaign' : (['r_sleep', 'power_nap'].includes(hustleId) ? 'Rest bonus' : hustle.name),
          amount: activeResult.yieldAura
        });
      } else if (activeResult.yieldAura < 0) {
        auraSources.push({
          name: 'Operational Setback',
          amount: activeResult.yieldAura
        });
      }
    }
  }

  const computedAuraSum = auraSources.reduce((sum, s) => sum + s.amount, 0);
  const actualAuraDelta = plAfter.aura - plBefore.aura;
  const unaccountedAura = actualAuraDelta - computedAuraSum;

  if (unaccountedAura !== 0) {
    if (unaccountedAura < 0 && plBefore.heat >= 70) {
      auraSources.push({
        name: 'Heat erosion',
        amount: unaccountedAura
      });
    } else if (unaccountedAura < 0 && plBefore.mentalHealth <= 30) {
      auraSources.push({
        name: 'Burnout penalty',
        amount: unaccountedAura
      });
    } else {
      auraSources.push({
        name: unaccountedAura > 0 ? 'Rest bonus' : 'Heat erosion',
        amount: unaccountedAura
      });
    }
  }

  // --- CLOUT BREAKDOWN ---
  if (hustleId && HUSTLES[hustleId]) {
    const hustle = HUSTLES[hustleId];
    if (activeResult && activeResult.yieldClout !== 0) {
      cloutSources.push({
        name: hustle.name,
        amount: activeResult.yieldClout
      });
    }
  }

  const computedCloutSum = cloutSources.reduce((sum, s) => sum + s.amount, 0);
  const actualCloutDelta = plAfter.clout - plBefore.clout;
  const unaccountedClout = actualCloutDelta - computedCloutSum;

  if (unaccountedClout !== 0) {
    if (unaccountedClout < 0 && plBefore.heat >= 70) {
      cloutSources.push({
        name: 'Public Scandal',
        amount: unaccountedClout
      });
    } else {
      cloutSources.push({
        name: unaccountedClout > 0 ? 'Passive increase' : 'Being Forgotten decay',
        amount: unaccountedClout
      });
    }
  }

  // --- HEAT BREAKDOWN ---
  if (hustleId && HUSTLES[hustleId]) {
    const hustle = HUSTLES[hustleId];
    if (activeResult && activeResult.heatHit !== 0) {
      heatSources.push({
        name: hustleId === 'r_ghost_mode' ? 'Ghost Mode' : (activeResult.heatHit > 0 ? 'Crime activity' : hustle.name),
        amount: activeResult.heatHit
      });
    }
  }

  const computedHeatSum = heatSources.reduce((sum, s) => sum + s.amount, 0);
  const actualHeatDelta = plAfter.heat - plBefore.heat;
  const unaccountedHeat = actualHeatDelta - computedHeatSum;

  if (unaccountedHeat !== 0) {
    if (unaccountedHeat < 0) {
      heatSources.push({
        name: 'Monthly cooldown',
        amount: unaccountedHeat
      });
    } else {
      heatSources.push({
        name: 'Crime activity',
        amount: unaccountedHeat
      });
    }
  }

  // --- MENTAL HEALTH BREAKDOWN ---
  if (hustleId && HUSTLES[hustleId]) {
    if (activeResult && activeResult.mentalHit !== 0) {
      mentalSources.push({
        name: activeResult.mentalHit > 0 ? 'Rest recovery' : 'Work Exhaustion',
        amount: activeResult.mentalHit
      });
    }
  }

  const computedMentalSum = mentalSources.reduce((sum, s) => sum + s.amount, 0);
  const actualMentalDelta = plAfter.mentalHealth - plBefore.mentalHealth;
  const unaccountedMental = actualMentalDelta - computedMentalSum;

  if (unaccountedMental !== 0) {
    if (unaccountedMental > 0) {
      mentalSources.push({
        name: 'Rest recovery',
        amount: unaccountedMental
      });
    } else {
      mentalSources.push({
        name: 'Work Exhaustion',
        amount: unaccountedMental
      });
    }
  }

  return {
    cash: cashSources,
    aura: auraSources,
    clout: cloutSources,
    heat: heatSources,
    mental: mentalSources,
    netCash: actualCashDelta,
    netAura: actualAuraDelta,
    netClout: actualCloutDelta,
    netHeat: actualHeatDelta,
    netMental: actualMentalDelta
  };
}

export function accumulateStatBreakdown(
  currentBreakdown: LastStatBreakdown | undefined,
  plBefore: PlayerStats,
  plAfter: PlayerStats,
  hustleId?: string | null,
  activeResult?: any,
  passiveIncome: number = 0,
  totalRent: number = 0
): LastStatBreakdown {
  const fresh = calculateAndSetStatBreakdown(plBefore, plAfter, hustleId, activeResult, passiveIncome, totalRent);

  if (!currentBreakdown || plBefore.month !== plAfter.month) {
    return fresh;
  }

  const mergeSources = (existing: StatChangeSource[], incoming: StatChangeSource[]): StatChangeSource[] => {
    const map = new Map<string, number>();
    existing.forEach(s => map.set(s.name, s.amount));
    incoming.forEach(s => {
      const current = map.get(s.name) || 0;
      map.set(s.name, current + s.amount);
    });
    return Array.from(map.entries()).map(([name, amount]) => ({ name, amount }));
  };

  return {
    cash: mergeSources(currentBreakdown.cash, fresh.cash),
    aura: mergeSources(currentBreakdown.aura, fresh.aura),
    clout: mergeSources(currentBreakdown.clout, fresh.clout),
    heat: mergeSources(currentBreakdown.heat, fresh.heat),
    mental: mergeSources(currentBreakdown.mental, fresh.mental),
    netCash: currentBreakdown.netCash + fresh.netCash,
    netAura: currentBreakdown.netAura + fresh.netAura,
    netClout: currentBreakdown.netClout + fresh.netClout,
    netHeat: currentBreakdown.netHeat + fresh.netHeat,
    netMental: currentBreakdown.netMental + fresh.netMental
  };
}
