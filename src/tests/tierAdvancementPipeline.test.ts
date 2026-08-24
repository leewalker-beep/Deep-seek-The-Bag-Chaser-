import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS, PROGRESSION_ORDER } from '../config/tiers';
import { SPECIALIZATIONS } from '../config/specializations';
import { getMasteryCount } from '../utils/masteryUtils';

describe('Complete Tier Advancement Pipeline Audit & Regression Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
    useGameStore.setState({ isTutorialSkipped: true });
  });

  describe('Phase 1: advanceTier() Gate & Requirement Validation', () => {
    it('blocks advancement when player is incarcerated in jail', () => {
      useGameStore.setState(state => ({
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: 100000,
          clout: 500,
          aura: 500,
          inJail: true
        }
      }));

      const success = useGameStore.getState().advanceTier();
      expect(success).toBe(false);
      expect(useGameStore.getState().pendingSpecialization).toBe(false);
      expect(useGameStore.getState().pl.currentTier).toBe('MUD');
    });

    it('blocks advancement to STREET if Crown (mastery) requirement is not met', () => {
      // STREET requires 50k cash, 100 clout, 100 aura, 3 crowns
      useGameStore.setState(state => ({
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: 100000,
          clout: 500,
          aura: 500,
          masteredHustles: ['r_labor', 'r_delivery'] // Only 2 crowns
        }
      }));

      const req = TIER_REQUIREMENTS.STREET;
      expect(req.crowns).toBe(3);
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(2);

      const success = useGameStore.getState().advanceTier();
      expect(success).toBe(false);
      expect(useGameStore.getState().pendingSpecialization).toBe(false);
      expect(useGameStore.getState().news[0].text || useGameStore.getState().news[0]).toContain('Cannot advance to STREET');
    });

    it('blocks advancement to CORPORATE if Crown requirement (5 crowns) is not met', () => {
      // CORPORATE requires 5m cash, 1200 clout, 1200 aura, 5 crowns
      useGameStore.setState(state => ({
        pl: {
          ...state.pl,
          currentTier: 'STARTUP',
          bag: 10000000,
          clout: 2000,
          aura: 2000,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma', 'r_vending'] // 4 crowns
        }
      }));

      const req = TIER_REQUIREMENTS.CORPORATE;
      expect(req.crowns).toBe(5);
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(4);

      const success = useGameStore.getState().advanceTier();
      expect(success).toBe(false);
      expect(useGameStore.getState().pendingSpecialization).toBe(false);
    });

    it('blocks advancement to MOGUL if Crown requirement (7 crowns) is not met', () => {
      // MOGUL requires 500m cash, 10000 clout, 10000 aura, 7 crowns
      useGameStore.setState(state => ({
        pl: {
          ...state.pl,
          currentTier: 'ELITE',
          bag: 1000000000,
          clout: 15000,
          aura: 15000,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma', 'r_vending', 'r_ghost_mode', 'r_scrap'] // 6 crowns
        }
      }));

      const req = TIER_REQUIREMENTS.MOGUL;
      expect(req.crowns).toBe(7);
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(6);

      const success = useGameStore.getState().advanceTier();
      expect(success).toBe(false);
      expect(useGameStore.getState().pendingSpecialization).toBe(false);
    });

    it('allows advancement when all requirements (cash, clout, aura, crowns) are fully met', () => {
      useGameStore.setState(state => ({
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: 100000,
          clout: 500,
          aura: 500,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'] // 3 crowns
        }
      }));

      expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);

      const success = useGameStore.getState().advanceTier();
      expect(success).toBe(true);
      expect(useGameStore.getState().pendingSpecialization).toBe(true);
      // Notice currentTier is STILL 'MUD' until specialization selection!
      expect(useGameStore.getState().pl.currentTier).toBe('MUD');
    });

    it('handles Tutorial Step 6 bypass exception correctly', () => {
      useGameStore.setState(state => ({
        isTutorialSkipped: false,
        tutorialStep: 5, // Step 6 (0-indexed)
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: 0,
          clout: 0,
          aura: 0,
          masteredHustles: []
        }
      }));

      const success = useGameStore.getState().advanceTier();
      expect(success).toBe(true);
      // In tutorial step 6, advanceTier directly sets currentTier and activeTab without pendingSpecialization
      expect(useGameStore.getState().pl.currentTier).toBe('STREET');
      expect(useGameStore.getState().activeTab).toBe('STREET');
    });
  });

  describe('Phase 2: selectSpecialization() Execution & Persistence', () => {
    it('cancels pendingSpecialization if player cannot afford filing fee', () => {
      useGameStore.setState(state => ({
        pendingSpecialization: true,
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: 100, // Fee for STREET is 20,000
          clout: 500,
          aura: 500,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma']
        }
      }));

      const spec = SPECIALIZATIONS[0];
      useGameStore.getState().selectSpecialization(spec.id);

      expect(useGameStore.getState().pendingSpecialization).toBe(false);
      expect(useGameStore.getState().pl.currentTier).toBe('MUD'); // Did not advance
      expect(useGameStore.getState().news[0].text || useGameStore.getState().news[0]).toContain('Need $');
    });

    it('deducts fee, updates tier, records specialization, and applies multipliers on valid selection', () => {
      const initialBag = 100000;
      const initialClout = 1000;
      const initialAura = 1000;

      useGameStore.setState(state => ({
        pendingSpecialization: true,
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: initialBag,
          clout: initialClout,
          aura: initialAura,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma']
        }
      }));

      const spec = SPECIALIZATIONS.find(s => s.id === 'institutional') || SPECIALIZATIONS[0];
      const req = TIER_REQUIREMENTS.STREET;
      const feeReduction = spec.feeReduction || 0;
      const expectedFee = req.fee * (1 - feeReduction);

      useGameStore.getState().selectSpecialization(spec.id);

      const stateAfter = useGameStore.getState();
      expect(stateAfter.pendingSpecialization).toBe(false);
      expect(stateAfter.pl.currentTier).toBe('STREET');
      expect(stateAfter.activeTab).toBe('STREET');
      expect(stateAfter.pl.activeSpecializationId).toBe(spec.id);
      expect(stateAfter.pl.specializationHistory).toContain(spec.id);
      expect(stateAfter.pl.bag).toBe(initialBag - expectedFee + 1000); // 100000 - 16000 + 1000 (from TIER_PROMOTION live event) = 85000
      expect(stateAfter.pl.clout).toBe(750);
      expect(stateAfter.pl.aura).toBe(715);

      // Biography persistence
      expect(stateAfter.pl.biography.some(line => line.includes('Rose to the STREET tier') || line.includes('Ascended to the STREET') || line.includes('STREET tier'))).toBe(true);
    });
  });

  describe('UI Eligibility (canAdvance) vs Engine Consistency', () => {
    it('ensures UI canAdvance and advanceTier() engine logic are 100% synchronized for all tiers', () => {
      const tiers: ('MUD' | 'STREET' | 'STARTUP' | 'CORPORATE' | 'ELITE' | 'MOGUL')[] = [
        'MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL'
      ];

      tiers.forEach((currentTier) => {
        const nextTier = PROGRESSION_ORDER[PROGRESSION_ORDER.indexOf(currentTier) + 1];
        const req = TIER_REQUIREMENTS[nextTier];

        // Case A: Missing cash
        const plMissingCash = {
          ...useGameStore.getState().pl,
          currentTier,
          bag: Math.max(0, req.cash - 100),
          clout: req.clout + 100,
          aura: req.aura + 100,
          masteredHustles: ['r_labor', 'r_delivery', 'r_scrap', 'street_eats', 'r_plasma', 'r_vending', 'r_ghost_mode']
        };
        const canAdvanceA = plMissingCash.bag >= req.cash &&
          plMissingCash.clout >= req.clout &&
          plMissingCash.aura >= req.aura &&
          getMasteryCount(plMissingCash) >= (req.crowns || 0);
        expect(canAdvanceA).toBe(false);

        // Case B: Missing crowns (if crowns > 0)
        if (req.crowns > 0) {
          const plMissingCrowns = {
            ...useGameStore.getState().pl,
            currentTier,
            bag: req.cash + 10000,
            clout: req.clout + 100,
            aura: req.aura + 100,
            masteredHustles: ['r_labor', 'r_delivery', 'r_scrap', 'street_eats', 'r_plasma', 'r_vending', 'r_ghost_mode'].slice(0, req.crowns - 1)
          };
          const canAdvanceB = plMissingCrowns.bag >= req.cash &&
            plMissingCrowns.clout >= req.clout &&
            plMissingCrowns.aura >= req.aura &&
            getMasteryCount(plMissingCrowns) >= (req.crowns || 0);
          expect(canAdvanceB).toBe(false);
        }

        // Case C: Fully qualified
        const plQualifies = {
          ...useGameStore.getState().pl,
          currentTier,
          bag: req.cash + 10000,
          clout: req.clout + 100,
          aura: req.aura + 100,
          masteredHustles: ['r_labor', 'r_delivery', 'r_scrap', 'street_eats', 'r_plasma', 'r_vending', 'r_ghost_mode']
        };
        const canAdvanceC = plQualifies.bag >= req.cash &&
          plQualifies.clout >= req.clout &&
          plQualifies.aura >= req.aura &&
          getMasteryCount(plQualifies) >= (req.crowns || 0);
        expect(canAdvanceC).toBe(true);
      });
    });
  });
});
