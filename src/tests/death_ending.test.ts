import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHustleSlice } from '../store/slices/hustleSlice';
import { getInitialStats } from '../store/initialState';
import { DEATH_MESSAGES } from '../config/deathMessages';

// Mock dependencies
vi.mock('../components/effects/Confetti', () => ({
  showConfetti: vi.fn(),
}));

vi.mock('../../utils/saveUtils', () => ({
  backupSave: vi.fn(),
}));

describe('Death and Ending Logic', () => {
  let store: any;

  beforeEach(() => {
    // Basic mock of Zustand's set/get for the slice
    const state: any = {
      pl: getInitialStats(3),
      currentMarket: 'NORMAL',
      news: [],
      ph: 'PLAYING',
      deathBadge: null,
      fatalCause: null,
      difficulty: 3,
      addTickerMessage: vi.fn(),
      logEvent: vi.fn(),
      logAction: vi.fn(),
      checkMilestones: vi.fn(),
      unlockAchievement: vi.fn(),
      setActiveTab: vi.fn(),
    };

    const set = (fn: any) => {
      const next = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, next);
    };
    const get = () => state;

    store = createHustleSlice(set, get, {} as any);
  });

  it('verifies r_labor death message exists', () => {
    const laborDeath = DEATH_MESSAGES['r_labor'];
    expect(laborDeath.badge).toBe('BONE CRUSHER');
    expect(laborDeath.message).toContain('back finally gave out');
  });

  it('verifies meme death message exists', () => {
    const memeDeath = DEATH_MESSAGES['meme'];
    expect(memeDeath.badge).toBe('DIAMOND HANDS');
  });

  it('verifies all 52 hustles have death messages', () => {
    const hustleIds = [
      'r_labor', 'r_delivery', 'r_plasma', 'r_vending', 'r_ghost_mode', 'r_scrap', 'r_sleep', 'street_eats',
      'cc', 'pod', 'drop', 'vintage', 'techFlip', 'audio', 'r_pr_campaign', 'power_nap',
      'sw', 'smm', 'gig', 'meme', 'saas_mvp', 'agency_scale', 'ecom_brand', 'therapy_session',
      'festival', 'global_franchise', 'data_analytics', 'crypto_mining', 'virtual_assistant_agency', 'lobbying', 'disaster', 'wellness_retreat',
      'psychiatrist', 'real_estate_empire', 'venture_capital', 'hedgefund', 'privateequity',
      'film_studio', 'fight_promoter', 'space_investment', 'philanthropy_empire', 'media_empire', 'luxury_conglomerate',
      'data_monopoly', 'central_bank_play', 'legacy_fund', 'president_campaign',
      'open_island', 'open_sports_league', 'open_crypto', 'open_celebrity', 'open_movie'
    ];

    hustleIds.forEach(id => {
      expect(DEATH_MESSAGES[id], `Missing death message for ${id}`).toBeDefined();
      expect(DEATH_MESSAGES[id].badge).toBeDefined();
      expect(DEATH_MESSAGES[id].message).toBeDefined();
    });
  });
});
