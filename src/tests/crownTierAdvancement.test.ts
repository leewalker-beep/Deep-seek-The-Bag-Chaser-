import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { TIER_REQUIREMENTS } from '../config/tiers';
import { getMasteryCount } from '../utils/masteryUtils';

describe('Crown Tier Advancement Requirements', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    // Set tutorial skipped so tutorial auto-advance does not trigger
    useGameStore.setState({ isTutorialSkipped: true });
  });

  describe('Cumulative Crown Transitions (3, 5, 7, 9, 11, 13, 15)', () => {
    it('MUD -> STREET: requires 3 Crowns', () => {
      const req = TIER_REQUIREMENTS['STREET'];
      expect(req.crowns).toBe(3);

      // 2/3 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: req.cash + 10000,
          clout: req.clout + 50,
          aura: req.aura + 50,
          masteredHustles: ['r_labor', 'r_delivery'],
          hustlePlays: { r_labor: 10, r_delivery: 10 },
          hustleLevels: { r_labor: 2, r_delivery: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(2);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 3/3 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });

    it('STREET -> STARTUP: requires 5 Crowns', () => {
      const req = TIER_REQUIREMENTS['STARTUP'];
      expect(req.crowns).toBe(5);

      // 4/5 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'STREET',
          bag: req.cash + 10000,
          clout: req.clout + 50,
          aura: req.aura + 50,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma', 'cc'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(4);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 5/5 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma', 'cc', 'pod'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(5);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });

    it('STARTUP -> CORPORATE: requires 7 Crowns', () => {
      const req = TIER_REQUIREMENTS['CORPORATE'];
      expect(req.crowns).toBe(7);

      const baseMastered = ['r_labor', 'r_delivery', 'r_plasma', 'cc', 'pod', 'saas_mvp'];
      // 6/7 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'STARTUP',
          bag: req.cash + 100000,
          clout: req.clout + 100,
          aura: req.aura + 100,
          masteredHustles: baseMastered,
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(6);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 7/7 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: [...baseMastered, 'ecom_brand'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(7);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });

    it('CORPORATE -> ELITE: requires 9 Crowns', () => {
      const req = TIER_REQUIREMENTS['ELITE'];
      expect(req.crowns).toBe(9);

      const baseMastered = ['r_labor', 'r_delivery', 'r_plasma', 'cc', 'pod', 'saas_mvp', 'ecom_brand', 'global_franchise'];
      // 8/9 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'CORPORATE',
          bag: req.cash + 1000000,
          clout: req.clout + 500,
          aura: req.aura + 500,
          masteredHustles: baseMastered,
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(8);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 9/9 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: [...baseMastered, 'data_analytics'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(9);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });

    it('ELITE -> MOGUL: requires 11 Crowns', () => {
      const req = TIER_REQUIREMENTS['MOGUL'];
      expect(req.crowns).toBe(11);

      const baseMastered = ['r_labor', 'r_delivery', 'r_plasma', 'cc', 'pod', 'saas_mvp', 'ecom_brand', 'global_franchise', 'data_analytics', 'privateequity'];
      // 10/11 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'ELITE',
          bag: req.cash + 1000000,
          clout: req.clout + 500,
          aura: req.aura + 500,
          masteredHustles: baseMastered,
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8, privateequity: 5 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1, privateequity: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(10);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 11/11 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: [...baseMastered, 'hedgefund'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8, privateequity: 5, hedgefund: 5 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1, privateequity: 2, hedgefund: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(11);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });

    it('MOGUL -> PRESIDENT: requires 13 Crowns', () => {
      const req = TIER_REQUIREMENTS['PRESIDENT'];
      expect(req.crowns).toBe(13);

      const baseMastered = ['r_labor', 'r_delivery', 'r_plasma', 'cc', 'pod', 'saas_mvp', 'ecom_brand', 'global_franchise', 'data_analytics', 'privateequity', 'hedgefund', 'film_studio'];
      // 12/13 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'MOGUL',
          bag: req.cash + 1000000,
          clout: req.clout + 500,
          aura: req.aura + 500,
          masteredHustles: baseMastered,
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8, privateequity: 5, hedgefund: 5, film_studio: 6 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1, privateequity: 2, hedgefund: 2, film_studio: 1 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(12);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 13/13 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: [...baseMastered, 'fight_promoter'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8, privateequity: 5, hedgefund: 5, film_studio: 6, fight_promoter: 6 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1, privateequity: 2, hedgefund: 2, film_studio: 1, fight_promoter: 1 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(13);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });

    it('PRESIDENT -> OPEN: requires 15 Crowns', () => {
      const req = TIER_REQUIREMENTS['OPEN'];
      expect(req.crowns).toBe(15);

      const baseMastered = ['r_labor', 'r_delivery', 'r_plasma', 'cc', 'pod', 'saas_mvp', 'ecom_brand', 'global_franchise', 'data_analytics', 'privateequity', 'hedgefund', 'film_studio', 'fight_promoter', 'president_campaign'];
      // 14/15 Crowns -> fails
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'PRESIDENT',
          bag: req.cash + 1000000,
          clout: req.clout + 500,
          aura: req.aura + 500,
          masteredHustles: baseMastered,
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8, privateequity: 5, hedgefund: 5, film_studio: 6, fight_promoter: 6, president_campaign: 4 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1, privateequity: 2, hedgefund: 2, film_studio: 1, fight_promoter: 1, president_campaign: 2 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(14);
      expect(useGameStore.getState().advanceTier()).toBe(false);

      // 15/15 Crowns -> succeeds
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: [...baseMastered, 'lobbying'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15, cc: 10, pod: 6, saas_mvp: 6, ecom_brand: 8, global_franchise: 6, data_analytics: 8, privateequity: 5, hedgefund: 5, film_studio: 6, fight_promoter: 6, president_campaign: 4, lobbying: 4 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1, cc: 1, pod: 2, saas_mvp: 2, ecom_brand: 2, global_franchise: 2, data_analytics: 1, privateequity: 2, hedgefund: 2, film_studio: 1, fight_promoter: 1, president_campaign: 2, lobbying: 1 },
        },
      }));
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(15);
      expect(useGameStore.getState().advanceTier()).toBe(true);
    });
  });

  describe('Crown Integrity & Persistence Rules', () => {
    it('Crown earned at different hustle levels counts identically', () => {
      const pl = {
        ...useGameStore.getState().pl,
        masteredHustles: [],
        hustlePlays: { r_plasma: 15, r_labor: 10, street_eats: 10 },
        hustleLevels: { r_plasma: 1, r_labor: 2, street_eats: 5 },
      };

      expect(getMasteryCount(pl)).toBe(3);
    });

    it('Crown count persists across tier advancement and Crowns are not consumed', () => {
      const req = TIER_REQUIREMENTS['STREET'];

      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          currentTier: 'MUD',
          bag: req.cash + 10000,
          clout: req.clout + 50,
          aura: req.aura + 50,
          masteredHustles: ['r_labor', 'r_delivery', 'r_plasma'],
          hustlePlays: { r_labor: 10, r_delivery: 10, r_plasma: 15 },
          hustleLevels: { r_labor: 2, r_delivery: 2, r_plasma: 1 },
        },
      }));

      expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);
      useGameStore.getState().advanceTier();
      useGameStore.getState().selectSpecialization('institutional');

      expect(useGameStore.getState().pl.currentTier).toBe('STREET');
      // Crowns preserved and NOT consumed
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(3);
      expect(useGameStore.getState().pl.masteredHustles).toEqual(['r_labor', 'r_delivery', 'r_plasma']);
    });

    it('repeated mastery / replaying a mastered hustle cannot inflate Crown count', () => {
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: ['r_labor', 'r_labor', 'r_labor'], // duplicate array entries
          hustlePlays: { r_labor: 100 },
          hustleLevels: { r_labor: 2 },
        },
      }));

      expect(getMasteryCount(useGameStore.getState().pl)).toBe(1);

      useGameStore.getState().checkMilestones();
      useGameStore.getState().checkMilestones();
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(1);
    });

    it('the_phoenix comeback badge does not inflate Crown count in getMasteryCount()', () => {
      useGameStore.setState((state) => ({
        pl: {
          ...state.pl,
          masteredHustles: ['the_phoenix'],
        },
      }));

      // the_phoenix is not a valid hustle ID in HUSTLES config
      expect(getMasteryCount(useGameStore.getState().pl)).toBe(0);
    });
  });
});
