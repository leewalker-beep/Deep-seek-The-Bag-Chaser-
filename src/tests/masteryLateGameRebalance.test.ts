import { describe, it, expect } from 'vitest';
import { isHustleMastered } from '../utils/masteryUtils';
import type { PlayerStats } from '../types/game';

const createMockPlayer = (hId: string, level: number, plays: number): PlayerStats => {
  return {
    bag: 1000,
    clout: 100,
    aura: 100,
    currentTier: 'CORPORATE',
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

describe('Late-Game Rebalanced Crowns', () => {
  describe('CORPORATE TIER', () => {
    describe('Real Estate Empire (real_estate_empire)', () => {
      it('should not master at Level 1 even with 6+ expansions', () => {
        const pl = createMockPlayer('real_estate_empire', 1, 6);
        expect(isHustleMastered(pl, 'real_estate_empire')).toBe(false);
      });

      it('should not master at Level 2 with under 6 expansions', () => {
        const pl = createMockPlayer('real_estate_empire', 2, 5);
        expect(isHustleMastered(pl, 'real_estate_empire')).toBe(false);
      });

      it('should master at Level 2 with exactly 6 expansions', () => {
        const pl = createMockPlayer('real_estate_empire', 2, 6);
        expect(isHustleMastered(pl, 'real_estate_empire')).toBe(true);
      });
    });

    describe('Venture Capital (venture_capital)', () => {
      it('should not master at Level 1 even with 6+ investments', () => {
        const pl = createMockPlayer('venture_capital', 1, 6);
        expect(isHustleMastered(pl, 'venture_capital')).toBe(false);
      });

      it('should not master at Level 2 with under 6 investments', () => {
        const pl = createMockPlayer('venture_capital', 2, 5);
        expect(isHustleMastered(pl, 'venture_capital')).toBe(false);
      });

      it('should master at Level 2 with exactly 6 investments', () => {
        const pl = createMockPlayer('venture_capital', 2, 6);
        expect(isHustleMastered(pl, 'venture_capital')).toBe(true);
      });
    });

    describe('Data Analytics (data_analytics)', () => {
      it('should not master with under 8 projects', () => {
        const pl = createMockPlayer('data_analytics', 1, 7);
        expect(isHustleMastered(pl, 'data_analytics')).toBe(false);
      });

      it('should master at Level 1 with 8 projects', () => {
        const pl = createMockPlayer('data_analytics', 1, 8);
        expect(isHustleMastered(pl, 'data_analytics')).toBe(true);
      });
    });

    describe('Music Festival (festival)', () => {
      it('should not master with under 8 events', () => {
        const pl = createMockPlayer('festival', 1, 7);
        expect(isHustleMastered(pl, 'festival')).toBe(false);
      });

      it('should master at Level 1 with 8 events', () => {
        const pl = createMockPlayer('festival', 1, 8);
        expect(isHustleMastered(pl, 'festival')).toBe(true);
      });
    });

    describe('Corporate Services / VA Agency (virtual_assistant_agency)', () => {
      it('should not master at Level 1 even with 6+ contracts', () => {
        const pl = createMockPlayer('virtual_assistant_agency', 1, 6);
        expect(isHustleMastered(pl, 'virtual_assistant_agency')).toBe(false);
      });

      it('should not master at Level 2 with under 6 contracts', () => {
        const pl = createMockPlayer('virtual_assistant_agency', 2, 5);
        expect(isHustleMastered(pl, 'virtual_assistant_agency')).toBe(false);
      });

      it('should master at Level 2 with exactly 6 contracts', () => {
        const pl = createMockPlayer('virtual_assistant_agency', 2, 6);
        expect(isHustleMastered(pl, 'virtual_assistant_agency')).toBe(true);
      });
    });

    describe('Media Network / Media Empire (media_empire)', () => {
      it('should not master with under 6 campaigns', () => {
        const pl = createMockPlayer('media_empire', 1, 5);
        expect(isHustleMastered(pl, 'media_empire')).toBe(false);
      });

      it('should master at Level 1 with 6 campaigns', () => {
        const pl = createMockPlayer('media_empire', 1, 6);
        expect(isHustleMastered(pl, 'media_empire')).toBe(true);
      });
    });
  });

  describe('ELITE TIER', () => {
    describe('Private Equity (privateequity)', () => {
      it('should not master at Level 1 even with 5+ acquisitions', () => {
        const pl = createMockPlayer('privateequity', 1, 5);
        expect(isHustleMastered(pl, 'privateequity')).toBe(false);
      });

      it('should not master at Level 2 with under 5 acquisitions', () => {
        const pl = createMockPlayer('privateequity', 2, 4);
        expect(isHustleMastered(pl, 'privateequity')).toBe(false);
      });

      it('should master at Level 2 with exactly 5 acquisitions', () => {
        const pl = createMockPlayer('privateequity', 2, 5);
        expect(isHustleMastered(pl, 'privateequity')).toBe(true);
      });
    });

    describe('Luxury Brand (luxury_conglomerate)', () => {
      it('should not master with under 6 launches', () => {
        const pl = createMockPlayer('luxury_conglomerate', 1, 5);
        expect(isHustleMastered(pl, 'luxury_conglomerate')).toBe(false);
      });

      it('should master at Level 1 with 6 launches', () => {
        const pl = createMockPlayer('luxury_conglomerate', 1, 6);
        expect(isHustleMastered(pl, 'luxury_conglomerate')).toBe(true);
      });
    });

    describe('Global Holdings (h_global_conglomerate)', () => {
      it('should not master at Level 1 even with 5+ expansions', () => {
        const pl = createMockPlayer('h_global_conglomerate', 1, 5);
        expect(isHustleMastered(pl, 'h_global_conglomerate')).toBe(false);
      });

      it('should not master at Level 2 with under 5 expansions', () => {
        const pl = createMockPlayer('h_global_conglomerate', 2, 4);
        expect(isHustleMastered(pl, 'h_global_conglomerate')).toBe(false);
      });

      it('should master at Level 2 with exactly 5 expansions', () => {
        const pl = createMockPlayer('h_global_conglomerate', 2, 5);
        expect(isHustleMastered(pl, 'h_global_conglomerate')).toBe(true);
      });
    });

    describe('Philanthropy Foundation (philanthropy_empire)', () => {
      it('should not master with under 8 initiatives', () => {
        const pl = createMockPlayer('philanthropy_empire', 1, 7);
        expect(isHustleMastered(pl, 'philanthropy_empire')).toBe(false);
      });

      it('should master at Level 1 with 8 initiatives', () => {
        const pl = createMockPlayer('philanthropy_empire', 1, 8);
        expect(isHustleMastered(pl, 'philanthropy_empire')).toBe(true);
      });
    });
  });

  describe('PRESIDENT TIER', () => {
    describe('National Leadership (president_campaign)', () => {
      it('should not master at Level 1 even with 4+ terms', () => {
        const pl = createMockPlayer('president_campaign', 1, 4);
        expect(isHustleMastered(pl, 'president_campaign')).toBe(false);
      });

      it('should not master at Level 2 with under 4 terms', () => {
        const pl = createMockPlayer('president_campaign', 2, 3);
        expect(isHustleMastered(pl, 'president_campaign')).toBe(false);
      });

      it('should master at Level 2 with exactly 4 terms', () => {
        const pl = createMockPlayer('president_campaign', 2, 4);
        expect(isHustleMastered(pl, 'president_campaign')).toBe(true);
      });
    });

    describe('Global Influence (lobbying)', () => {
      it('should not master with under 4 initiatives', () => {
        const pl = createMockPlayer('lobbying', 1, 3);
        expect(isHustleMastered(pl, 'lobbying')).toBe(false);
      });

      it('should master at Level 1 with 4 initiatives', () => {
        const pl = createMockPlayer('lobbying', 1, 4);
        expect(isHustleMastered(pl, 'lobbying')).toBe(true);
      });
    });
  });
});
