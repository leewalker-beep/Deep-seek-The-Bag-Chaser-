import { describe, it, expect } from 'vitest';
import { isHustleMastered } from '../utils/masteryUtils';
import type { PlayerStats } from '../types/game';

const createMockPlayer = (hId: string, level: number, plays: number): PlayerStats => {
  return {
    bag: 1000,
    clout: 100,
    aura: 100,
    currentTier: 'STARTUP',
    hustleLevels: { [hId]: level },
    hustlePlays: { [hId]: plays },
    hustleBranchIds: { [hId]: `l${level}` },
    masteredHustles: [],
    vendingCount: 0,
    rentPortfolioCount: 0,
    flipCount: 0,
    biography: [],
    narrativeFlags: {},
  } as unknown as PlayerStats;
};

describe('STARTUP Tier Rebalanced Crowns', () => {
  describe('SaaS MVP (saas_mvp)', () => {
    it('should not master SaaS at Level 1 even with 6+ launches', () => {
      const pl = createMockPlayer('saas_mvp', 1, 6);
      expect(isHustleMastered(pl, 'saas_mvp')).toBe(false);
    });

    it('should not master SaaS at Level 2 with under 6 launches', () => {
      const pl = createMockPlayer('saas_mvp', 2, 5);
      expect(isHustleMastered(pl, 'saas_mvp')).toBe(false);
    });

    it('should master SaaS at Level 2 with exactly 6 launches', () => {
      const pl = createMockPlayer('saas_mvp', 2, 6);
      expect(isHustleMastered(pl, 'saas_mvp')).toBe(true);
    });
  });

  describe('E-com Brand (ecom_brand)', () => {
    it('should not master E-commerce at Level 1 even with 8+ sales cycles', () => {
      const pl = createMockPlayer('ecom_brand', 1, 8);
      expect(isHustleMastered(pl, 'ecom_brand')).toBe(false);
    });

    it('should not master E-commerce at Level 2 with under 8 sales cycles', () => {
      const pl = createMockPlayer('ecom_brand', 2, 7);
      expect(isHustleMastered(pl, 'ecom_brand')).toBe(false);
    });

    it('should master E-commerce at Level 2 with exactly 8 sales cycles', () => {
      const pl = createMockPlayer('ecom_brand', 2, 8);
      expect(isHustleMastered(pl, 'ecom_brand')).toBe(true);
    });
  });

  describe('Crypto Trading (meme)', () => {
    it('should not master Crypto Trading with under 10 trading months', () => {
      const pl = createMockPlayer('meme', 1, 9);
      expect(isHustleMastered(pl, 'meme')).toBe(false);
    });

    it('should master Crypto Trading at Level 1 with 10 trading months', () => {
      const pl = createMockPlayer('meme', 1, 10);
      expect(isHustleMastered(pl, 'meme')).toBe(true);
    });
  });

  describe('Music Production (audio)', () => {
    it('should not master Music Production with under 8 releases', () => {
      const pl = createMockPlayer('audio', 1, 7);
      expect(isHustleMastered(pl, 'audio')).toBe(false);
    });

    it('should master Music Production at Level 1 with 8 releases', () => {
      const pl = createMockPlayer('audio', 1, 8);
      expect(isHustleMastered(pl, 'audio')).toBe(true);
    });
  });

  describe('AI Automation (agency_scale)', () => {
    it('should not master AI Automation at Level 1 even with 6+ deployments', () => {
      const pl = createMockPlayer('agency_scale', 1, 6);
      expect(isHustleMastered(pl, 'agency_scale')).toBe(false);
    });

    it('should not master AI Automation at Level 2 with under 6 deployments', () => {
      const pl = createMockPlayer('agency_scale', 2, 5);
      expect(isHustleMastered(pl, 'agency_scale')).toBe(false);
    });

    it('should master AI Automation at Level 2 with exactly 6 deployments', () => {
      const pl = createMockPlayer('agency_scale', 2, 6);
      expect(isHustleMastered(pl, 'agency_scale')).toBe(true);
    });
  });

  describe('App Development (smm)', () => {
    it('should not master App Development at Level 1 even with 6+ launches', () => {
      const pl = createMockPlayer('smm', 1, 6);
      expect(isHustleMastered(pl, 'smm')).toBe(false);
    });

    it('should not master App Development at Level 2 with under 6 launches', () => {
      const pl = createMockPlayer('smm', 2, 5);
      expect(isHustleMastered(pl, 'smm')).toBe(false);
    });

    it('should master App Development at Level 2 with exactly 6 launches', () => {
      const pl = createMockPlayer('smm', 2, 6);
      expect(isHustleMastered(pl, 'smm')).toBe(true);
    });
  });
});
