import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';
import { CONGLOMERATE_CANDIDATES } from '../config/conglomerateCandidates';

describe('Global Conglomerate Regional CEOs System Tests', () => {
  beforeEach(() => {
    // Clear all persistent/global pollutions BEFORE calling resetGame
    useGameStore.setState({
      unlockedLegacyUpgradeIds: []
    });

    // Reset the game to starting conditions
    useGameStore.getState().resetGame('STREET_KID', 3);

    // Initial state setup to ELITE tier with plenty of starting stats, clearing all pollutions
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        currentTier: 'ELITE',
        bag: 100000000, // Give plenty of cash
        clout: 5000,
        aura: 5000,
        streak: 0,
        hustlePlays: {},
        tierBadges: [],
        marketLeaderTiers: [],
        masteredHustles: [],
        unlockedLegacyUpgradeIds: [],
        activeSentiment: null,
        activeWorldEvent: null,
        conglomerateCEOs: {},
        conglomerateCandidates: [...CONGLOMERATE_CANDIDATES]
      }
    }));
  });

  it('should configure global conglomerate with panelType: GLOBAL_CONGLOMERATE', () => {
    const hustle = HUSTLES.h_global_conglomerate;
    expect(hustle).toBeDefined();
    expect(hustle.hasPanel).toBe(true);
    expect(hustle.panelType).toBe('GLOBAL_CONGLOMERATE');
  });

  it('should appoint executives and properly return them to candidates list on removal', () => {
    const store = useGameStore.getState();
    const candidate = store.pl.conglomerateCandidates?.find(c => c.id === 'ceo_jack_sterling');
    expect(candidate).toBeDefined();

    // Appoint Jack Sterling to NA Technology
    store.appointConglomerateCEO!('na_tech', candidate!);

    const updatedPl = useGameStore.getState().pl;
    expect(updatedPl.conglomerateCEOs?.['na_tech']).toBeDefined();
    expect(updatedPl.conglomerateCEOs?.['na_tech']?.id).toBe(candidate!.id);
    expect(updatedPl.conglomerateCEOs?.['na_tech']?.assignedDivision).toBe('na_tech');

    // Jack Sterling should be removed from candidate pool
    expect(updatedPl.conglomerateCandidates?.some(c => c.id === candidate!.id)).toBe(false);

    // Remove Jack Sterling
    store.fireConglomerateCEO!('na_tech');

    const finalPl = useGameStore.getState().pl;
    expect(finalPl.conglomerateCEOs?.['na_tech']).toBeUndefined();
    // Jack Sterling should be returned to candidate pool
    expect(finalPl.conglomerateCandidates?.some(c => c.id === candidate!.id)).toBe(true);
  });

  it('should correctly calculate active yield with NO CEOs appointed (baseline 50% yield)', () => {
    const store = useGameStore.getState();
    const result = store.executeHustle('h_global_conglomerate', 1.0, true);

    expect(result.success).toBe(true);
    // Baseline raw yield for LEVEL 1 with NO CEOs is exactly 15,000,000 before multipliers.
    expect(result.yieldCash).toBeGreaterThanOrEqual(15000000);
  });

  it('should correctly calculate active yield with appointed CEOs and verify yield increases', () => {
    const store = useGameStore.getState();

    // Measure the baseline first (with NO CEOs appointed) in this exact state
    const resultNoCEOs = store.executeHustle('h_global_conglomerate', 1.0, true);

    // Reset store state for clean CEO appointment execution
    useGameStore.setState(s => ({
      pl: {
        ...s.pl,
        bag: 100000000,
        conglomerateCEOs: {}
      }
    }));

    // Get high-risk high-competence CEO Viktor Vance (competence: 95, loyalty: 45, riskTolerance: 85)
    const viktor = CONGLOMERATE_CANDIDATES.find(c => c.id === 'ceo_viktor_vance')!;
    // Get steady Jack Sterling (competence: 85, loyalty: 90, riskTolerance: 20)
    const jack = CONGLOMERATE_CANDIDATES.find(c => c.id === 'ceo_jack_sterling')!;

    // Appoint Viktor Vance to EU Manufacturing and Jack Sterling to NA Technology
    store.appointConglomerateCEO!('eu_mfg', viktor);
    store.appointConglomerateCEO!('na_tech', jack);

    // Execute Global Conglomerate operations
    const result = store.executeHustle('h_global_conglomerate', 1.0, true);

    expect(result.success).toBe(true);
    // Yield with CEOs should be significantly higher than with NO CEOs appointed!
    expect(result.yieldCash).toBeGreaterThan(resultNoCEOs.yieldCash);
  });

  it('should update dynamicPassives immediately on appointment', () => {
    const store = useGameStore.getState();
    const jack = CONGLOMERATE_CANDIDATES.find(c => c.id === 'ceo_jack_sterling')!;

    const levelData = HUSTLES.h_global_conglomerate.levels![0];
    const basePassive = levelData.passiveYield || 0;

    // Appoint Jack Sterling to NA Technology
    store.appointConglomerateCEO!('na_tech', jack);

    const updatedPl = useGameStore.getState().pl;
    const currentConglomeratePassive = updatedPl.dynamicPassives?.['h_global_conglomerate'] || 0;

    // Calculated contribution with Jack:
    const jackMult = (0.5 + 85 / 100) * (0.8 + 90 / 100 * 0.2) * (1.0 + 20 / 100 * 0.5);
    const expectedPassive = Math.floor(basePassive / 4 * jackMult) + Math.floor(basePassive / 4 * 0.5) * 3;

    expect(currentConglomeratePassive).toBeCloseTo(expectedPassive, -1);
  });
});
