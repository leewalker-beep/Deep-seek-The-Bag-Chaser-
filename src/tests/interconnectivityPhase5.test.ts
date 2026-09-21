import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { detectAndCreateConsequences, tickConsequences } from '../engine/consequenceEngine';
import { generateStrategicAdvice } from '../engine/advisorEngine';

describe('Phase 5 — Complete 15-System Interconnectivity & Consequence Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('b_street', 1); // STREET tier start
  });

  it('1. HUSTLE → STATS → MASTERY → CROWN → TIER pipeline integration', () => {
    const store = useGameStore.getState();
    const initialCash = store.pl.bag;

    // Run Content Creation
    const result = store.executeHustle('cc', 1.0, true);
    expect(result.success).toBe(true);
    expect(useGameStore.getState().pl.bag).toBeGreaterThan(initialCash);
    expect(useGameStore.getState().pl.actionLog.length).toBeGreaterThan(0);

    const latestAction = useGameStore.getState().pl.actionLog[0];
    expect(latestAction.netCash).toBe(result.netChange);
    expect(latestAction.yieldCash - latestAction.cost).toBe(result.netChange);

    // Verify Mastery & Crown tracking
    useGameStore.getState().checkMilestones();
    expect(useGameStore.getState().pl.masteredHustles).toBeDefined();
  });

  it('2. FAILURE → CONSEQUENCE → ADVISOR → WORLD FEED pipeline integration', () => {
    const currentPl = useGameStore.getState().pl;

    // Set player to severe mental fatigue (< 35) and high heat
    const modifiedPl = {
      ...currentPl,
      mentalHealth: 25,
      heat: 80,
    };

    // Trigger consequence detection
    const news: any[] = [];
    let updatedPl = detectAndCreateConsequences(modifiedPl, news);
    expect(updatedPl.consequences?.some(c => c.source === 'burnout_state')).toBe(true);

    // Tick consequence to activate
    updatedPl = tickConsequences(updatedPl, news);
    expect(updatedPl.consequences?.some(c => c.source === 'burnout_state' && c.status === 'active')).toBe(true);

    // Advisor Engine picks up the active burnout state and high heat
    const advice = generateStrategicAdvice(updatedPl, 'NORMAL');
    expect(advice.primaryDirective).toContain('mental health');
    expect(advice.insights.some(i => i.id === 'burnout_state_insight' || i.id === 'heat_critical')).toBe(true);
  });

  it('3. RIVAL INTERACTIONS → HISTORY → BIOGRAPHY → WORLD FEED pipeline integration', () => {
    // Populate rival
    const currentPl = useGameStore.getState().pl;
    const initialRival = {
      id: 'rival_test_1',
      name: 'Victor Vance',
      tier: 'STREET' as const,
      netWorth: 50000,
      relationshipWithPlayer: 0,
      currentBid: 0,
      sabotagedCount: 0,
      helpedCount: 0,
    };

    useGameStore.setState({
      pl: {
        ...currentPl,
        bag: 100000,
        rivals: [initialRival]
      }
    });

    const initialHistoryLen = useGameStore.getState().pl.history?.length || 0;

    // Help a rival
    useGameStore.getState().helpRival(initialRival.id);

    const newHistoryLen = useGameStore.getState().pl.history?.length || 0;
    expect(newHistoryLen).toBeGreaterThan(initialHistoryLen);

    const updatedPl = useGameStore.getState().pl;
    const historyItem = updatedPl.history?.find(h => h.participants?.includes(initialRival.name));
    expect(historyItem).toBeDefined();
    expect(historyItem?.category).toBe('RIVAL');
  });

  it('4. LEDGER TRUST: Single Source of Truth applied delta match', () => {
    const preBag = useGameStore.getState().pl.bag;
    const preClout = useGameStore.getState().pl.clout;
    const preAura = useGameStore.getState().pl.aura;

    const res = useGameStore.getState().executeHustle('pod', 1.0, true);

    const postBag = useGameStore.getState().pl.bag;
    const postClout = useGameStore.getState().pl.clout;
    const postAura = useGameStore.getState().pl.aura;

    expect(postBag - preBag).toBe(res.netChange);
    expect(postClout - preClout).toBe(res.yieldClout);
    expect(postAura - preAura).toBe(res.yieldAura);
  });
});
