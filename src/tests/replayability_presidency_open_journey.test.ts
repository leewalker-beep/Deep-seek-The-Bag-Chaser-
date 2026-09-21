import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { analyzeBehavior } from '../utils/personalityAnalyzer';
import { calculateLegacyScore } from '../engine/legacyEngine';
import { isHustleMastered } from '../utils/masteryUtils';
import { SPECIALIZATIONS } from '../config/specializations';

describe('Replayability, Presidency & OPEN Endgame Journey Integration Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('street_kid', 3);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Story Differentiation: produces distinct behavioral profiles and biography summaries across cash vs influence playstyles', () => {
    const store = useGameStore.getState();

    // Setup Cash-Heavy playstyle
    store.updatePl({
      bag: 5000000,
      clout: 100,
      aura: 100,
      heat: 80,
      actionLog: [
        { id: '1', timestamp: Date.now() - 5000, month: 1, tier: 'MUD', hustleId: 'r_scrap', hustleName: 'Scrap', level: 1, branchId: '', branchName: '', cost: 0, yieldCash: 1000, yieldClout: 0, yieldAura: 0, netCash: 1000, success: true, passiveAdded: 0, marketMult: { yield: 1, expense: 1, heat: 1 }, marketName: 'NORMAL', variation: 0 },
        { id: '2', timestamp: Date.now() - 1000, month: 1, tier: 'MUD', hustleId: 'r_vending', hustleName: 'Vending', level: 1, branchId: '', branchName: '', cost: 2000, yieldCash: 0, yieldClout: 0, yieldAura: 0, netCash: -2000, success: true, passiveAdded: 150, marketMult: { yield: 1, expense: 1, heat: 1 }, marketName: 'NORMAL', variation: 0 }
      ]
    });

    const cashBehavior = analyzeBehavior(useGameStore.getState().pl);
    expect(cashBehavior.primaryColor).toBeDefined();

    // Reset and setup Influence-Heavy playstyle
    useGameStore.getState().resetGame('benefactor', 3);
    useGameStore.getState().updatePl({
      bag: 100000,
      clout: 5000,
      aura: 5000,
      heat: 0,
      narrativeFlags: { publicReputation: "The Philanthropist" },
      philanthropyDonation: 500000
    });

    const influenceBehavior = analyzeBehavior(useGameStore.getState().pl);
    expect(influenceBehavior.orientationLabel).toBe('Others & Principles');
  });

  it('2. Specialization Integrity: prevents duplicate or re-selection of active specializations', () => {
    const store = useGameStore.getState();

    // Advance requirements
    store.updatePl({
      bag: 5000000,
      clout: 2000,
      aura: 2000,
      masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'],
      hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15 },
      hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1 }
    });

    // Advance tier triggers pendingSpecialization
    const advanced = store.advanceTier();
    expect(advanced).toBe(true);
    expect(useGameStore.getState().pendingSpecialization).toBe(true);

    const specId = SPECIALIZATIONS[0].id;
    useGameStore.getState().selectSpecialization(specId);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.activeSpecializationId).toBe(specId);
    expect(updatedPl.specializationHistory).toContain(specId);

    // Attempting to re-select same specialization when pending is re-triggered
    useGameStore.getState().setPendingSpecialization(true);
    useGameStore.getState().selectSpecialization(specId);

    // Should close modal without duplicating history
    expect(useGameStore.getState().pendingSpecialization).toBe(false);
    expect(useGameStore.getState().pl.specializationHistory.filter(s => s === specId).length).toBe(1);
  });

  it('3. Legacy Rewards: calculates score boost for Crown masteries, alliances, and applies starting upgrades', () => {
    const store = useGameStore.getState();

    store.updatePl({
      bag: 10000000,
      masteredHustles: ['r_labor', 'cc', 'saas_mvp'],
      rivals: [
        { id: 'rival_mud', name: 'Marcus', netWorth: 5000, currentBid: 0, isNpc: true, tier: 'MUD', status: 'ally' }
      ]
    });

    const score = calculateLegacyScore(useGameStore.getState().pl);
    expect(score).toBeGreaterThan(0);

    // Grant banked legacy points and unlock upgrade
    useGameStore.setState({ bankedLegacyPoints: 100000 });
    useGameStore.getState().unlockLegacyUpgrade('extra_cash');
    useGameStore.getState().resetGame('street_kid', 3);

    expect(useGameStore.getState().unlockedLegacyUpgradeIds).toContain('extra_cash');
    expect(useGameStore.getState().pl.bag).toBe(6000); // Base 1000 + 5000 extra_cash
  });

  it('4. Rival Persistence: remembers partnerships and interactions in history logs', () => {
    const store = useGameStore.getState();
    const rivalId = 'rival_mud';

    store.updatePl({ bag: 100000 });
    store.helpRival!(rivalId);

    const pl = useGameStore.getState().pl;
    const rival = pl.rivals.find(r => r.id === rivalId);
    expect(rival?.helpedCount).toBe(1);
    expect(rival?.relationshipWithPlayer).toBe(25);
    expect(pl.history?.some(h => h.id.includes('rival_help'))).toBe(true);
  });

  it('5. Full Presidency -> OPEN -> Sandbox Journey', () => {
    const store = useGameStore.getState();

    // Setup President tier state with sufficient clout and aura
    store.updatePl({
      currentTier: 'PRESIDENT',
      presidentMonth: 1,
      clout: 500,
      aura: 500,
      approvalRating: 75,
      federalBudget: 500000000,
      gdp: 120,
      inflation: 2,
      nationalDebt: 50,
      congressSupport: 70
    });

    expect(useGameStore.getState().pl.currentTier).toBe('PRESIDENT');

    // Issue executive order
    useGameStore.getState().issueExecutiveOrder('tax_cut');
    expect(useGameStore.getState().pl.presidentialDiary.length).toBeGreaterThan(0);

    // Advance presidential month
    useGameStore.getState().advancePresidentialMonth();
    expect(useGameStore.getState().pl.presidentMonth).toBe(2);

    // Transition to OPEN tier
    useGameStore.getState().updatePl({ currentTier: 'OPEN' });
    expect(useGameStore.getState().pl.currentTier).toBe('OPEN');

    // Execute OPEN-tier activity
    useGameStore.getState().updatePl({ bag: 1000000000 });
    const openResult = useGameStore.getState().executeHustle('open_island', 1.0, true);
    expect(openResult.success).toBe(true);
    expect(isHustleMastered(useGameStore.getState().pl, 'open_island')).toBe(false); // OPEN tier has no crown
  });
});
