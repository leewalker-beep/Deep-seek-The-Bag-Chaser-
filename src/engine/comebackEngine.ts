import type { PlayerStats } from '../types/game';
import * as Bio from './biographyEngine';
import { processWorldReaction } from './reactiveWorldEngine';

/**
 * Handles checking and triggering periodic comebacks (such as Bankruptcy Rebound or Prison Rebound)
 * on monthly timeline ticks. Returns updated player stats and news ticker messages.
 */
export function checkAndTriggerComebacks(pl: PlayerStats): { updatedPl: PlayerStats; news: string[] } {
  let draftPl = { ...pl };
  const news: string[] = [];

  if (!draftPl.narrativeFlags) {
    draftPl.narrativeFlags = {};
  }

  const pName = draftPl.name || 'The Player';

  // 1. BANKRUPTCY REBOUNDS
  const hadBankruptcyCrisis = !!draftPl.narrativeFlags.had_bankruptcy_crisis;
  if (hadBankruptcyCrisis) {
    // Stage 1: Bankruptcy to Multi-Millionaire (Cash >= $5M)
    const hasReboundedMillionaire = !!draftPl.narrativeFlags.rebounded_bankruptcy_millionaire;
    if (draftPl.bag >= 5000000 && !hasReboundedMillionaire) {
      draftPl.narrativeFlags.rebounded_bankruptcy_millionaire = true;
      draftPl.aura = Math.min(100, draftPl.aura + 15);
      draftPl.clout = Math.min(10000, draftPl.clout + 15);
      draftPl.masteredHustles = Array.from(new Set([...(draftPl.masteredHustles || []), 'the_phoenix']));

      const entryText = `After a severe liquidity crisis and facing absolute bankruptcy, ${pName} staged a massive financial recovery, rebuilding the empire to over $5,000,000 in liquid assets.`;
      const bioUpdate = Bio.recordEvent(
        draftPl,
        entryText,
        'comeback_bankruptcy_millionaire',
        'CAREER',
        4,
        'Financial Phoenix Rise'
      );

      if (bioUpdate) {
        draftPl.biography = [...(draftPl.biography || []), bioUpdate.entry];
        draftPl.recordedBioKeys = [...(draftPl.recordedBioKeys || []), bioUpdate.key!];
      }

      // Add to world reaction feed and news
      news.push(`📈 PHOENIX COMING BACK: ${pName} rebuilt his empire from scratch to over $5,000,000!`);
      draftPl = processWorldReaction(draftPl, 'COMEBACK_BANKRUPTCY_MILLIONAIRE', {}).updatedPl;

      // Queue an Advisor Mentor popup indicator
      draftPl.narrativeFlags.trigger_comeback_advisor_popup = 'bankruptcy_millionaire';
    }

    // Stage 2: Bankruptcy to Billionaire (Cash >= $1B)
    const hasReboundedBillionaire = !!draftPl.narrativeFlags.rebounded_bankruptcy_billionaire;
    if (draftPl.bag >= 1000000000 && !hasReboundedBillionaire) {
      draftPl.narrativeFlags.rebounded_bankruptcy_billionaire = true;
      draftPl.aura = Math.min(100, draftPl.aura + 30);
      draftPl.clout = Math.min(10000, draftPl.clout + 50);
      draftPl.masteredHustles = Array.from(new Set([...(draftPl.masteredHustles || []), 'the_phoenix']));

      const entryText = `Completed the ultimate financial phoenix rise: rising from near-bankruptcy all the way to becoming a certified billionaire.`;
      const bioUpdate = Bio.recordEvent(
        draftPl,
        entryText,
        'comeback_bankruptcy_billionaire',
        'CAREER',
        5,
        'From Bankruptcy to Billionaire'
      );

      if (bioUpdate) {
        draftPl.biography = [...(draftPl.biography || []), bioUpdate.entry];
        draftPl.recordedBioKeys = [...(draftPl.recordedBioKeys || []), bioUpdate.key!];
      }

      news.push(`📈 THE IMPOSSIBLE COMEBACK: "From Bankruptcy to Billionaire" — ${pName} is crowned a ten-figure giant!`);
      draftPl = processWorldReaction(draftPl, 'COMEBACK_BANKRUPTCY_BILLIONAIRE', {}).updatedPl;

      // Queue Advisor popup
      draftPl.narrativeFlags.trigger_comeback_advisor_popup = 'bankruptcy_billionaire';
    }
  }

  // 2. PRISON COMEBACK REBOUND
  const releasedMonth = draftPl.narrativeFlags.released_from_prison_month;
  const initialReleaseCash = draftPl.narrativeFlags.prison_release_cash;
  const hasReboundedPrison = !!draftPl.narrativeFlags.rebounded_prison;

  if (typeof releasedMonth === 'number' && typeof initialReleaseCash === 'number' && !hasReboundedPrison) {
    const elapsedMonths = draftPl.month - releasedMonth;
    if (elapsedMonths <= 12) {
      const netGain = draftPl.bag - initialReleaseCash;
      if (netGain >= 500000) {
        draftPl.narrativeFlags.rebounded_prison = true;
        draftPl.aura = Math.min(100, draftPl.aura + 20);
        draftPl.clout = Math.min(10000, draftPl.clout + 20);
        draftPl.masteredHustles = Array.from(new Set([...(draftPl.masteredHustles || []), 'the_phoenix']));

        const entryText = `Silenced all critics by engineering an outstanding post-incarcerated comeback, reclaiming over $500,000 in liquid capital within a year of prison release.`;
        const bioUpdate = Bio.recordEvent(
          draftPl,
          entryText,
          'comeback_prison_release',
          'CAREER',
          4,
          'Post-Prison Comeback'
        );

        if (bioUpdate) {
          draftPl.biography = [...(draftPl.biography || []), bioUpdate.entry];
          draftPl.recordedBioKeys = [...(draftPl.recordedBioKeys || []), bioUpdate.key!];
        }

        news.push(`🔓 THE COMEBACK NOBODY EXPECTED: After months of public criticism, ${pName} rebuilds his empire after release!`);
        draftPl = processWorldReaction(draftPl, 'COMEBACK_PRISON_RELEASE', {}).updatedPl;

        // Queue Advisor popup
        draftPl.narrativeFlags.trigger_comeback_advisor_popup = 'prison_rebound';
      }
    } else {
      // Exceeded 12 months, clear release stats to prevent infinite tracking
      delete draftPl.narrativeFlags.released_from_prison_month;
      delete draftPl.narrativeFlags.prison_release_cash;
    }
  }

  return { updatedPl: draftPl, news };
}

/**
 * Triggered immediately when `burnout_state` resolves. Apply rewards, biography entries,
 * history records, and news ticker alerts.
 */
export function triggerBurnoutRecovery(pl: PlayerStats): { updatedPl: PlayerStats; news: string[] } {
  let draftPl = { ...pl };
  if (!draftPl.narrativeFlags) {
    draftPl.narrativeFlags = {};
  }

  const pName = draftPl.name || 'The Player';

  // Apply rewards
  draftPl.aura = Math.min(100, draftPl.aura + 15);
  draftPl.clout = Math.min(10000, draftPl.clout + 10);
  draftPl.masteredHustles = Array.from(new Set([...(draftPl.masteredHustles || []), 'the_phoenix']));

  const entryText = `Survived and triumphed over a period of severe psychological exhaustion and burnout, recovering full mental health and operational stamina.`;
  const bioUpdate = Bio.recordEvent(
    draftPl,
    entryText,
    'recovery_burnout',
    'CAREER',
    3,
    'Mental Resilience Triumph'
  );

  if (bioUpdate) {
    draftPl.biography = [...(draftPl.biography || []), bioUpdate.entry];
    draftPl.recordedBioKeys = [...(draftPl.recordedBioKeys || []), bioUpdate.key!];
  }

  draftPl = processWorldReaction(draftPl, 'COMEBACK_BURNOUT', {}).updatedPl;

  // Queue Advisor popup
  draftPl.narrativeFlags.trigger_comeback_advisor_popup = 'burnout_recovery';

  return {
    updatedPl: draftPl,
    news: [`🧘 RECOVERY SUCCESS: After months of mental exhaustion, ${pName} recovers fully and returns with steel focus!`]
  };
}

/**
 * Triggered immediately when `leverage_squeeze` resolves. Apply rewards, biography entries,
 * history records, and news ticker alerts.
 */
export function triggerDebtRecovery(pl: PlayerStats): { updatedPl: PlayerStats; news: string[] } {
  let draftPl = { ...pl };
  if (!draftPl.narrativeFlags) {
    draftPl.narrativeFlags = {};
  }

  const pName = draftPl.name || 'The Player';

  // Apply rewards
  draftPl.clout = Math.min(10000, draftPl.clout + 15);
  draftPl.aura = Math.min(100, draftPl.aura + 15);
  draftPl.masteredHustles = Array.from(new Set([...(draftPl.masteredHustles || []), 'the_phoenix']));

  const entryText = `Successfully paid down outstanding liabilities and resolved credit leverage freezes, restoring absolute financial confidence.`;
  const bioUpdate = Bio.recordEvent(
    draftPl,
    entryText,
    'recovery_debt_squeeze',
    'BUSINESS',
    3,
    'Debt Leverage Cleared'
  );

  if (bioUpdate) {
    draftPl.biography = [...(draftPl.biography || []), bioUpdate.entry];
    draftPl.recordedBioKeys = [...(draftPl.recordedBioKeys || []), bioUpdate.key!];
  }

  draftPl = processWorldReaction(draftPl, 'COMEBACK_DEBT_SQUEEZE', {}).updatedPl;

  // Queue Advisor popup
  draftPl.narrativeFlags.trigger_comeback_advisor_popup = 'debt_recovery';

  return {
    updatedPl: draftPl,
    news: [`💸 LEVERAGE RESOLVED: ${pName} successfully tamed their massive debt leverage, gaining full market trust!`]
  };
}
