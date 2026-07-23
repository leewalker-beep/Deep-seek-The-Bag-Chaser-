import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInitialStats } from '../store/initialState';
import { advanceMonth } from '../engine/advancementEngine';
import { detectAndCreateConsequences } from '../engine/consequenceEngine';
import { checkAndTriggerComebacks, triggerBurnoutRecovery, triggerDebtRecovery } from '../engine/comebackEngine';
import { ACHIEVEMENTS } from '../config/achievements';
import type { PlayerStats } from '../types/game';

describe('Failure, Recovery & Comeback System', () => {
  let pl: PlayerStats;

  beforeEach(() => {
    vi.restoreAllMocks();
    pl = getInitialStats(3, undefined, undefined, undefined, []);
    pl.name = 'Test Chaser';
    pl.narrativeFlags = {};
    pl.biography = [];
    pl.recordedBioKeys = [];
    pl.history = [];
    pl.financialDebts = [];
  });

  it('should set the bankruptcy crisis flag during LIQUIDITY CRUNCH', () => {
    pl.bag = 1000;
    // Set high expenses/rent to trigger a crunch
    pl.currentTier = 'STREET'; // Rent is 1000
    pl.month = 1;

    const result = advanceMonth(pl, 'NORMAL', []);
    expect(result.newPl.narrativeFlags.had_bankruptcy_crisis).toBe(true);
  });

  it('should trigger Bankruptcy to Millionaire rebound when cash reaches $5M after a crisis', () => {
    pl.narrativeFlags.had_bankruptcy_crisis = true;
    pl.bag = 5000000;
    pl.clout = 100;
    pl.aura = 50;

    const result = checkAndTriggerComebacks(pl);
    expect(result.updatedPl.narrativeFlags.rebounded_bankruptcy_millionaire).toBe(true);
    expect(result.updatedPl.clout).toBeGreaterThan(100);
    expect(result.updatedPl.aura).toBeGreaterThan(50);
    expect(result.updatedPl.narrativeFlags.trigger_comeback_advisor_popup).toBe('bankruptcy_millionaire');
    expect(result.updatedPl.biography.some(b => b.includes('rebuilding the empire to over $5,000,000'))).toBe(true);
  });

  it('should trigger Bankruptcy to Billionaire rebound when cash reaches $1B after a crisis', () => {
    pl.narrativeFlags.had_bankruptcy_crisis = true;
    pl.bag = 1000000000;

    const result = checkAndTriggerComebacks(pl);
    expect(result.updatedPl.narrativeFlags.rebounded_bankruptcy_billionaire).toBe(true);
    expect(result.updatedPl.narrativeFlags.trigger_comeback_advisor_popup).toBe('bankruptcy_billionaire');
    expect(result.updatedPl.biography.some(b => b.includes('certified billionaire'))).toBe(true);
  });

  it('should set release markers when player is released from prison', () => {
    pl.inJail = true;
    pl.isIncarcerated = true;
    pl.jailMonthsRemaining = 1;
    pl.jailCharge = 'Tax Evasion';
    pl.month = 5;
    pl.bag = 10000;

    const result = advanceMonth(pl, 'NORMAL', []);
    expect(result.newPl.inJail).toBe(false);
    expect(result.newPl.narrativeFlags.released_from_prison_month).toBe(6);
    expect(result.newPl.narrativeFlags.prison_release_cash).toBeLessThanOrEqual(10000);
  });

  it('should trigger Prison Rebound when player earns $500,000 within 12 months after release', () => {
    pl.narrativeFlags.released_from_prison_month = 5;
    pl.narrativeFlags.prison_release_cash = 10000;
    pl.month = 10; // Within 12 months (elapsed: 5 months)
    pl.bag = 515000; // Over $500,000 gain

    const result = checkAndTriggerComebacks(pl);
    expect(result.updatedPl.narrativeFlags.rebounded_prison).toBe(true);
    expect(result.updatedPl.narrativeFlags.trigger_comeback_advisor_popup).toBe('prison_rebound');
    expect(result.updatedPl.biography.some(b => b.includes('post-incarcerated comeback'))).toBe(true);
  });

  it('should expire prison comeback tracking after 12 months has elapsed', () => {
    pl.narrativeFlags.released_from_prison_month = 5;
    pl.narrativeFlags.prison_release_cash = 10000;
    pl.month = 18; // Elapsed: 13 months
    pl.bag = 515000;

    const result = checkAndTriggerComebacks(pl);
    expect(result.updatedPl.narrativeFlags.rebounded_prison).toBeFalsy();
    expect(result.updatedPl.narrativeFlags.released_from_prison_month).toBeUndefined();
    expect(result.updatedPl.narrativeFlags.prison_release_cash).toBeUndefined();
  });

  it('should trigger Burnout Recovery when burnout_state consequence is resolved', () => {
    pl.mentalHealth = 30;
    pl = detectAndCreateConsequences(pl, []);
    expect(pl.consequences.some(c => c.source === 'burnout_state')).toBe(true);

    // Increase mental health to resolve burnout
    pl.mentalHealth = 100;
    const resultPl = detectAndCreateConsequences(pl, []);
    expect(resultPl.consequences.some(c => c.source === 'burnout_state')).toBe(false);
    expect(resultPl.narrativeFlags.trigger_comeback_advisor_popup).toBe('burnout_recovery');
    expect(resultPl.biography.some(b => b.includes('exhaustion and burnout'))).toBe(true);
  });

  it('should trigger Debt Recovery when leverage_squeeze consequence is resolved', () => {
    // Add heavy debt
    pl.financialDebts = [
      { id: '1', loanType: 'BUSINESS', principal: 50000, interestRate: 0.05, remainingTerm: 12, monthlyPayment: 2000, totalTerm: 12 }
    ];
    pl = detectAndCreateConsequences(pl, []);
    expect(pl.consequences.some(c => c.source === 'leverage_squeeze')).toBe(true);

    // Pay off debt to resolve
    pl.financialDebts = [];
    const resultPl = detectAndCreateConsequences(pl, []);
    expect(resultPl.consequences.some(c => c.source === 'leverage_squeeze')).toBe(false);
    expect(resultPl.narrativeFlags.trigger_comeback_advisor_popup).toBe('debt_recovery');
    expect(resultPl.biography.some(b => b.includes('credit leverage freezes'))).toBe(true);
  });

  it('should award the_phoenix badge to masteredHustles on successful comeback', () => {
    pl.narrativeFlags.had_bankruptcy_crisis = true;
    pl.bag = 5000000;
    pl.masteredHustles = [];

    const result = checkAndTriggerComebacks(pl);
    expect(result.updatedPl.masteredHustles).toContain('the_phoenix');
  });

  it('should unlock comebacks achievements correctly', () => {
    const stateMock: any = {
      pl: {
        narrativeFlags: {
          rebounded_bankruptcy_millionaire: true,
          rebounded_bankruptcy_billionaire: true,
          rebounded_prison: true
        }
      }
    };

    const millionAch = ACHIEVEMENTS.find(a => a.id === 'COMEBACK_MILLIONAIRE')!;
    const billionAch = ACHIEVEMENTS.find(a => a.id === 'COMEBACK_BILLIONAIRE')!;
    const prisonAch = ACHIEVEMENTS.find(a => a.id === 'COMEBACK_PRISON')!;

    expect(millionAch.requirement.check(stateMock)).toBe(true);
    expect(billionAch.requirement.check(stateMock)).toBe(true);
    expect(prisonAch.requirement.check(stateMock)).toBe(true);

    const progressMillion = millionAch.requirement.progress(stateMock);
    expect(progressMillion.current).toBe(1);
    expect(progressMillion.target).toBe(1);
  });
});
