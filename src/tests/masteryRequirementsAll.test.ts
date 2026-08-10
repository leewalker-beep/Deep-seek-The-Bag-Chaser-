import { describe, it, expect } from 'vitest';
import { HUSTLES } from '../config/hustles/base';
import { MASTERY_REQUIREMENTS, PLAY_LABELS, getCrownProgress, isHustleMastered } from '../utils/masteryUtils';
import type { PlayerStats } from '../types/game';

const EXCLUDED_IDS = [
  'r_sleep', 'power_nap', 'therapy_session', 'wellness_retreat', 'psychiatrist', // recovery
  'disaster', // disaster
  'open_island', 'open_sports_league', 'open_crypto', 'open_celebrity', 'open_movie', // OPEN tier
];

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

describe('Comprehensive Hustle Crown and Mastery Audit', () => {
  it('should ensure every career hustle from MUD through PRESIDENT (except excluded ones) has crown requirement and play label', () => {
    Object.keys(HUSTLES).forEach(hId => {
      const h = HUSTLES[hId];
      if (EXCLUDED_IDS.includes(hId)) {
        // Excluded ones must NOT have requirements in MASTERY_REQUIREMENTS
        expect(MASTERY_REQUIREMENTS[hId]).toBeUndefined();
        expect(getCrownProgress(createMockPlayer(hId, 1, 1), hId)).toBeNull();
        return;
      }

      // Non-excluded career hustles (MUD through PRESIDENT)
      expect(MASTERY_REQUIREMENTS[hId]).toBeDefined();
      expect(PLAY_LABELS[hId]).toBeDefined();

      const progress = getCrownProgress(createMockPlayer(hId, 1, 1), hId);
      expect(progress).not.toBeNull();
      expect(progress?.playsLabel).toBe(PLAY_LABELS[hId]);
    });
  });

  describe('New Early / STREET additions', () => {
    describe('Vintage (vintage)', () => {
      it('should master at level 1 with 8 plays (no level req)', () => {
        const pl = createMockPlayer('vintage', 1, 8);
        expect(isHustleMastered(pl, 'vintage')).toBe(true);
      });
      it('should not master with < 8 plays', () => {
        const pl = createMockPlayer('vintage', 1, 7);
        expect(isHustleMastered(pl, 'vintage')).toBe(false);
      });
    });

    describe('PR Campaign (r_pr_campaign)', () => {
      it('should master at level 2 with 6 plays', () => {
        const pl = createMockPlayer('r_pr_campaign', 2, 6);
        expect(isHustleMastered(pl, 'r_pr_campaign')).toBe(true);
      });
      it('should not master at level 1 even with 6 plays', () => {
        const pl = createMockPlayer('r_pr_campaign', 1, 6);
        expect(isHustleMastered(pl, 'r_pr_campaign')).toBe(false);
      });
      it('should not master at level 2 with 5 plays', () => {
        const pl = createMockPlayer('r_pr_campaign', 2, 5);
        expect(isHustleMastered(pl, 'r_pr_campaign')).toBe(false);
      });
    });

    describe('Review Farm (h_review_farm)', () => {
      it('should master with 8 review campaigns (no level req)', () => {
        const pl = createMockPlayer('h_review_farm', 1, 8);
        expect(isHustleMastered(pl, 'h_review_farm')).toBe(true);
      });
      it('should not master with < 8 review campaigns', () => {
        const pl = createMockPlayer('h_review_farm', 3, 7);
        expect(isHustleMastered(pl, 'h_review_farm')).toBe(false);
      });
    });

    describe('Gig Platform (gig)', () => {
      it('should master at level 2 with 8 contracts', () => {
        const pl = createMockPlayer('gig', 2, 8);
        expect(isHustleMastered(pl, 'gig')).toBe(true);
      });
      it('should not master at level 1 even with 8 contracts', () => {
        const pl = createMockPlayer('gig', 1, 8);
        expect(isHustleMastered(pl, 'gig')).toBe(false);
      });
    });

    describe('Family Deli (unique_hustle_deli)', () => {
      it('should master at level 2 with 8 service runs', () => {
        const pl = createMockPlayer('unique_hustle_deli', 2, 8);
        expect(isHustleMastered(pl, 'unique_hustle_deli')).toBe(true);
      });
    });
  });

  describe('New STARTUP / CORPORATE additions', () => {
    describe('Global Franchise (global_franchise)', () => {
      it('should master at level 2 with 6 expansions', () => {
        const pl = createMockPlayer('global_franchise', 2, 6);
        expect(isHustleMastered(pl, 'global_franchise')).toBe(true);
      });
      it('should not master at level 1 even with 6 expansions', () => {
        const pl = createMockPlayer('global_franchise', 1, 6);
        expect(isHustleMastered(pl, 'global_franchise')).toBe(false);
      });
    });

    describe('Crypto Mining (crypto_mining)', () => {
      it('should master with 8 mining months', () => {
        const pl = createMockPlayer('crypto_mining', 1, 8);
        expect(isHustleMastered(pl, 'crypto_mining')).toBe(true);
      });
    });
  });

  describe('New ELITE additions', () => {
    describe('Hedge Fund (hedgefund)', () => {
      it('should master at level 2 with 5 cycles', () => {
        const pl = createMockPlayer('hedgefund', 2, 5);
        expect(isHustleMastered(pl, 'hedgefund')).toBe(true);
      });
    });

    describe('Film Studio (film_studio)', () => {
      it('should master with 6 productions', () => {
        const pl = createMockPlayer('film_studio', 1, 6);
        expect(isHustleMastered(pl, 'film_studio')).toBe(true);
      });
    });

    describe('Fight Promoter (fight_promoter)', () => {
      it('should master with 6 events', () => {
        const pl = createMockPlayer('fight_promoter', 1, 6);
        expect(isHustleMastered(pl, 'fight_promoter')).toBe(true);
      });
    });

    describe('Space Investment (space_investment)', () => {
      it('should master at level 2 with 5 launches', () => {
        const pl = createMockPlayer('space_investment', 2, 5);
        expect(isHustleMastered(pl, 'space_investment')).toBe(true);
      });
    });

    describe('Data Monopoly (data_monopoly)', () => {
      it('should master at level 2 with 5 expansions', () => {
        const pl = createMockPlayer('data_monopoly', 2, 5);
        expect(isHustleMastered(pl, 'data_monopoly')).toBe(true);
      });
    });

    describe('Central Bank Play (central_bank_play)', () => {
      it('should master at level 2 with 4 operations', () => {
        const pl = createMockPlayer('central_bank_play', 2, 4);
        expect(isHustleMastered(pl, 'central_bank_play')).toBe(true);
      });
    });

    describe('Legacy Fund (legacy_fund)', () => {
      it('should master with 6 distributions', () => {
        const pl = createMockPlayer('legacy_fund', 1, 6);
        expect(isHustleMastered(pl, 'legacy_fund')).toBe(true);
      });
    });
  });
});
