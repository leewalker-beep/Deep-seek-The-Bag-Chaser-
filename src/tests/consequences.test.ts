import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInitialStats } from '../store/initialState';
import { advanceMonth } from '../engine/advancementEngine';
import { detectAndCreateConsequences, tickConsequences, getConsequenceMultiplier, isConsequenceActive } from '../engine/consequenceEngine';
import { calculateHustleStatsAdditive, calculateHustleMath } from '../engine/mathEngine';
import { executeHustleAction } from '../engine/hustleEngine';
import { HUSTLES } from '../config/hustles/base';

describe('Dynamic Consequence Engine Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect and queue sabotage_retaliation when the player repeatedly sabotages rivals', () => {
    const pl = getInitialStats(3);
    pl.consequences = [];
    pl.philanthropyDonation = 0; // prevent philanthropic_halo auto-trigger
    pl.rivals = pl.rivals.map(r => ({ ...r, sabotagedCount: 2 })); // 2 sabotages per rival

    const news: any[] = [];
    const updatedPl = detectAndCreateConsequences(pl, news);

    expect(updatedPl.consequences?.some(c => c.source === 'sabotage_retaliation')).toBe(true);
    const sabotageCons = updatedPl.consequences?.find(c => c.source === 'sabotage_retaliation');
    expect(sabotageCons?.status).toBe('pending');
    expect(sabotageCons?.delay).toBe(3);
    expect(news.some(n => n.text.includes('Rumors swirl'))).toBe(true);
  });

  it('should transition sabotage_retaliation from pending to active when delay reaches 0', () => {
    let pl = getInitialStats(3);
    pl.consequences = [];
    pl.philanthropyDonation = 0;
    pl.rivals = pl.rivals.map(r => ({ ...r, sabotagedCount: 2 }));

    const news: any[] = [];
    pl = detectAndCreateConsequences(pl, news);

    // Tick month 1 (delay goes 3 -> 2)
    pl = tickConsequences(pl, news);
    let sabotageCons = pl.consequences?.find(c => c.source === 'sabotage_retaliation');
    expect(sabotageCons?.status).toBe('pending');
    expect(sabotageCons?.delay).toBe(2);

    // Tick month 2 (delay goes 2 -> 1)
    pl = tickConsequences(pl, news);
    sabotageCons = pl.consequences?.find(c => c.source === 'sabotage_retaliation');
    expect(sabotageCons?.status).toBe('pending');
    expect(sabotageCons?.delay).toBe(1);

    // Tick month 3 (delay goes 1 -> 0, becomes active)
    pl = tickConsequences(pl, news);
    sabotageCons = pl.consequences?.find(c => c.source === 'sabotage_retaliation');
    expect(sabotageCons?.status).toBe('active');
    expect(news.some(n => n.text.includes('CONSEQUENCE ACTIVATED'))).toBe(true);
  });

  it('should apply passive business yield penalty of 25% when sabotage_retaliation is active', () => {
    let pl = getInitialStats(3);
    pl.consequences = [];
    pl.philanthropyDonation = 0;
    pl.rivals = pl.rivals.map(r => ({ ...r, sabotagedCount: 2 }));
    pl.hustleLevels['cleaning'] = 1; // has passive yield

    // Advance months to activate
    const news: any[] = [];
    pl = detectAndCreateConsequences(pl, news);
    // delay = 3
    pl = tickConsequences(pl, news); // delay = 2
    pl = tickConsequences(pl, news); // delay = 1
    pl = tickConsequences(pl, news); // active

    expect(isConsequenceActive(pl, 'sabotage_retaliation')).toBe(true);

    const mult = getConsequenceMultiplier(pl, 'businesses', 'yieldCashMult', 1.0);
    expect(mult).toBe(0.75); // 25% penalty
  });

  it('should detect and queue housing_affordability_crisis when the player has high rental portfolio count', () => {
    const pl = getInitialStats(3);
    pl.consequences = [];
    pl.philanthropyDonation = 0;
    pl.rentPortfolioCount = 5;

    const news: any[] = [];
    const updatedPl = detectAndCreateConsequences(pl, news);

    expect(updatedPl.consequences?.some(c => c.source === 'housing_affordability_crisis')).toBe(true);
    const housingCons = updatedPl.consequences?.find(c => c.source === 'housing_affordability_crisis');
    expect(housingCons?.delay).toBe(4);
    expect(news.some(n => n.text.includes('HOUSING MARKET WATCH'))).toBe(true);
  });

  it('should reduce rent/real estate yields by 30% when housing_affordability_crisis is active', () => {
    let pl = getInitialStats(3);
    pl.consequences = [];
    pl.philanthropyDonation = 0;
    pl.rentPortfolioCount = 5;

    const news: any[] = [];
    pl = detectAndCreateConsequences(pl, news);
    // Ticking 4 times to activate
    pl = tickConsequences(pl, news); // delay 3
    pl = tickConsequences(pl, news); // delay 2
    pl = tickConsequences(pl, news); // delay 1
    pl = tickConsequences(pl, news); // active

    expect(isConsequenceActive(pl, 'housing_affordability_crisis')).toBe(true);
    const rentMult = getConsequenceMultiplier(pl, 'real_estate', 'rentMult', 1.0);
    expect(rentMult).toBe(0.7); // 30% penalty
  });

  it('should stack multiple consequence modifiers naturally', () => {
    let pl = getInitialStats(3);
    // Add both active consequences manually for testing
    pl.consequences = [
      {
        id: 'cons_1',
        source: 'sabotage_retaliation',
        triggerCondition: 'Espionage',
        delay: 0,
        severity: 'severe',
        expiry: 5,
        affectedSystems: ['businesses'],
        status: 'active',
        description: 'Smear campaign',
        effectModifier: { yieldCashMult: 0.75 }
      },
      {
        id: 'cons_2',
        source: 'regulatory_crackdown',
        triggerCondition: 'Audits',
        delay: 0,
        severity: 'severe',
        expiry: 5,
        affectedSystems: ['businesses'],
        status: 'active',
        description: 'Audit',
        effectModifier: { yieldCashMult: 0.75 }
      }
    ];

    const finalMult = getConsequenceMultiplier(pl, 'businesses', 'yieldCashMult', 1.0);
    // 0.75 * 0.75 = 0.5625
    expect(finalMult).toBeCloseTo(0.5625, 4);
  });

  it('should apply burnout_immunity to halve mental hits and block stress careless mistakes', () => {
    let pl = getInitialStats(3);
    pl.consequences = [];
    pl.philanthropyDonation = 0;
    pl.currentTier = 'STARTUP'; // set to non-MUD tier to bypass MUD multiplier of 1.5x
    pl.mentalHealth = 10; // Extremely low, high stress
    pl.consequences = [
      {
        id: 'cons_burnout',
        source: 'burnout_immunity',
        triggerCondition: 'Mindfulness',
        delay: 0,
        severity: 'moderate',
        expiry: 5,
        affectedSystems: ['mental_health', 'stress'],
        status: 'active',
        description: 'Zen state',
        effectModifier: { mentalHitMult: 0.5 }
      }
    ];

    // Math engine test: verify base yield multiplier reduces negative mental hits
    const levelData = { level: 1, cost: 0, yieldCash: 1000, yieldClout: 10, yieldAura: 10, mentalHit: -20, cloutReq: 0, auraReq: 0 };
    const baseMath = calculateHustleMath('cleaning', levelData, 1, 1, 1, 1, 1, true);

    // Check base math output (should be -20 since raw mentalHit is -20)
    expect(baseMath.mentalHit).toBe(-20);

    const result = calculateHustleStatsAdditive('cleaning', levelData, pl, 1, baseMath);

    // -20 * 0.5 = -10
    expect(result.mentalHit).toBe(-10);

    // Hustle execution: stress careless mistake should be blocked entirely!
    const runResult = executeHustleAction('cleaning', pl, 'NORMAL', levelData, 1, 1.0, true);
    expect(runResult.tickerMessages?.some(m => m.text.includes('CARELESS MISTAKE'))).toBe(false);
  });
});
