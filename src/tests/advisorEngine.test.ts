import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { generateStrategicAdvice } from '../engine/advisorEngine';
import type { PlayerStats } from '../types/game';

describe('Strategic Intelligence Advisor System', () => {
  beforeEach(() => {
    // Reset state before each test
    useGameStore.getState().resetGame('STREET_KID', 3);
  });

  it('should analyze economic recession and recommend defensive operations', () => {
    const pl = useGameStore.getState().pl;
    const advice = generateStrategicAdvice(pl, 'RECESSION');

    expect(advice.whatIsHappening).toContain('contracting');
    expect(advice.whyItHappened).toContain('macroeconomic');

    const econInsight = advice.insights.find(i => i.category === 'Economy');
    expect(econInsight).toBeDefined();
    expect(econInsight?.priority).toBe('Critical');
    expect(econInsight?.recommendation).toContain('Preserve liquid cash');
    expect(econInsight?.confidence).toBe(95);
  });

  it('should analyze high heat and identify critical policing audit risks', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      heat: 85,
    };

    const advice = generateStrategicAdvice(pl, 'NORMAL');
    const heatInsight = advice.insights.find(i => i.category === 'Heat');

    expect(heatInsight).toBeDefined();
    expect(heatInsight?.priority).toBe('Critical');
    expect(heatInsight?.recommendation).toContain('Ghost Mode');
  });

  it('should detect severe mental health penalty and high stress careless mistakes', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      mentalHealth: 20,
      heat: 75,
    };

    const advice = generateStrategicAdvice(pl, 'NORMAL');

    const mentalInsight = advice.insights.find(i => i.category === 'MentalHealth');
    const stressInsight = advice.insights.find(i => i.category === 'Stress');

    expect(mentalInsight).toBeDefined();
    expect(mentalInsight?.priority).toBe('Critical');
    expect(mentalInsight?.title).toContain('Severe Mental Exhaustion');

    expect(stressInsight).toBeDefined();
    expect(stressInsight?.priority).toBe('Critical');
    expect(stressInsight?.title).toContain('Stress');
  });

  it('should flag dependency on a single passive income source with correct suggestions', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      lastPassiveBreakdown: {
        sources: [
          { id: 'src_deli', name: 'Family Deli', category: 'BUSINESS', amount: 1200 },
        ],
        baseTotal: 1200,
        multipliers: { legacy: 1.0, market: 1.0, specialization: 1.0 },
        finalTotal: 1200,
      },
    };

    const advice = generateStrategicAdvice(pl, 'NORMAL');
    const passiveInsight = advice.insights.find(i => i.category === 'Passive');

    expect(passiveInsight).toBeDefined();
    expect(passiveInsight?.title).toBe('Fragile Income Foundation');
    expect(passiveInsight?.whatIsHappening).toBe('You have become too dependent on one income source.');
    expect(passiveInsight?.recommendation).toContain('Acquire alternative passive streams');
  });

  it('should report falling congress support when inflation is high in presidency', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      currentTier: 'PRESIDENT',
      congressSupport: 35,
      inflation: 6.2,
      gdp: 105,
      nationalDebt: 45,
    };

    const advice = generateStrategicAdvice(pl, 'NORMAL');
    const congressInsight = advice.insights.find(i => i.id === 'politics_congress_weak');

    expect(congressInsight).toBeDefined();
    expect(congressInsight?.priority).toBe('Critical');
    expect(congressInsight?.whatIsHappening).toContain('congressional support is critically low');
    expect(congressInsight?.whyItHappened).toContain('rising inflation');
  });

  it('should identify opportunities such as class specialization synergies and outstanding Aura', () => {
    const pl: PlayerStats = {
      ...useGameStore.getState().pl,
      activeSpecializationId: 'tech_pioneer',
      aura: 80,
    };

    const advice = generateStrategicAdvice(pl, 'NORMAL');

    const specInsight = advice.insights.find(i => i.id === 'biz_specialization');
    const auraInsight = advice.insights.find(i => i.id === 'aura_strong');

    expect(specInsight).toBeDefined();
    expect(specInsight?.priority).toBe('Opportunity');
    expect(specInsight?.recommendation).toContain('permanent +10%');

    expect(auraInsight).toBeDefined();
    expect(auraInsight?.priority).toBe('Opportunity');
    expect(auraInsight?.recommendation).toContain('cabinet member loyalty');
  });
});
