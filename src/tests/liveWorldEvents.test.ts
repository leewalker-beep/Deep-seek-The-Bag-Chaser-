import { describe, it, expect } from 'vitest';
import { processWorldReaction } from '../engine/reactiveWorldEngine';
import { getInitialStats } from '../store/initialState';
import type { PlayerStats } from '../types/game';

describe('Reactive World Live Event System Tests', () => {
  it('triggers FIRST_BUSINESS_LAUNCH live event on BUSINESS_LAUNCH in Mud tier (local fame)', () => {
    const pl = getInitialStats(3); // Start in MUD tier, local fame
    pl.name = 'Jules';

    const result = processWorldReaction(pl, 'BUSINESS_LAUNCH', {
      hustleName: 'Scrap Collecting',
      cost: 0
    });

    const updatedPl = result.updatedPl;
    expect(updatedPl.activeLiveEvent).toBeDefined();
    expect(updatedPl.activeLiveEvent?.id).toBe('FIRST_BUSINESS_LAUNCH');
    expect(updatedPl.activeLiveEvent?.type).toBe('COMMUNITY_SPOTLIGHT');
    expect(updatedPl.activeLiveEvent?.fameLevel).toBe('local');
    expect(updatedPl.activeLiveEvent?.headline).toContain('NEW STREET SHOP: JULES OPENS SCRAP COLLECTING!');
    expect(updatedPl.activeLiveEvent?.source).toBe('The Neighborhood Gazette');

    // Verify completed list includes it
    expect(updatedPl.completedLiveEvents).toContain('FIRST_BUSINESS_LAUNCH');

    // Verify feed item added
    expect(result.addedItems.length).toBeGreaterThan(0);
    const feedLiveEventItem = result.addedItems.find(item => item.pinned);
    expect(feedLiveEventItem).toBeDefined();
    expect(feedLiveEventItem?.text).toContain('NEW STREET SHOP: JULES OPENS SCRAP COLLECTING!');

    // Verify biography updated
    expect(updatedPl.biography?.length).toBeGreaterThan(0);
    const bioEntry = updatedPl.biography?.find(entry => entry.includes('SCRAP COLLECTING'));
    expect(bioEntry).toBeDefined();

    // Verify milestones updated
    expect(updatedPl.milestones?.length).toBeGreaterThan(0);
    const milestone = updatedPl.milestones?.find(m => m.id === 'LIVE_EVENT_FIRST_BUSINESS_LAUNCH');
    expect(milestone).toBeDefined();
    expect(milestone?.name).toContain('NEW STREET SHOP: JULES OPENS SCRAP COLLECTING!');
  });

  it('triggers FIRST_BUSINESS_LAUNCH live event on regional fame (Startup tier)', () => {
    const pl = getInitialStats(3);
    pl.currentTier = 'STARTUP'; // regional fame
    pl.name = 'Jules';

    const result = processWorldReaction(pl, 'BUSINESS_LAUNCH', {
      hustleName: 'Software Dev',
      cost: 50000
    });

    const updatedPl = result.updatedPl;
    expect(updatedPl.activeLiveEvent?.fameLevel).toBe('regional');
    expect(updatedPl.activeLiveEvent?.type).toBe('SOCIAL_TRENDING');
    expect(updatedPl.activeLiveEvent?.headline).toContain('REGIONAL PLAYER: JULES VENTURES INTO SOFTWARE DEV!');
    expect(updatedPl.activeLiveEvent?.source).toBe('Valley Venture Buzz');
  });

  it('triggers FIRST_MILLION when bag reaches or exceeds $1M', () => {
    const pl = getInitialStats(3);
    pl.name = 'Jules';
    pl.bag = 1200000; // Over $1M

    // Execute any processWorldReaction to trigger check
    const result = processWorldReaction(pl, 'HUGE_PROFIT', {
      profit: 50000,
      hustleName: 'Vending Machines'
    });

    const updatedPl = result.updatedPl;
    expect(updatedPl.activeLiveEvent).toBeDefined();
    expect(updatedPl.completedLiveEvents).toContain('FIRST_MILLION');
    expect(updatedPl.activeLiveEvent?.id).toBe('FIRST_MILLION');
    expect(updatedPl.activeLiveEvent?.type).toBe('MARKET_FLASH');
  });

  it('triggers TIER_PROMOTION and handles prioritization properly', () => {
    const pl = getInitialStats(3);
    pl.name = 'Jules';
    pl.currentTier = 'STREET';

    // Promotion action (Priority 9) vs First Million check (Priority 7)
    pl.bag = 1005000; // Both are true!
    const result = processWorldReaction(pl, 'TIER_PROMOTION', {
      tier: 'MUD'
    });

    const updatedPl = result.updatedPl;
    expect(updatedPl.activeLiveEvent).toBeDefined();
    // TIER_PROMOTION (Priority 9) should win over FIRST_MILLION (Priority 7)
    expect(updatedPl.activeLiveEvent?.id).toBe('PROMOTION_STREET');
    expect(updatedPl.completedLiveEvents).toContain('PROMOTION_STREET');
    // completed list should NOT contain FIRST_MILLION since it was prioritized out
    expect(updatedPl.completedLiveEvents).not.toContain('FIRST_MILLION');
  });

  it('triggers ELECTION_VICTORY as highest priority', () => {
    const pl = getInitialStats(3);
    pl.name = 'Jules';
    pl.currentTier = 'PRESIDENT';
    pl.bag = 15000000;

    const result = processWorldReaction(pl, 'ELECTION_VICTORY', {});
    const updatedPl = result.updatedPl;

    expect(updatedPl.activeLiveEvent).toBeDefined();
    expect(updatedPl.activeLiveEvent?.id).toBe('ELECTION_VICTORY');
    expect(updatedPl.activeLiveEvent?.type).toBe('GOVERNMENT_BULLETIN');
    expect(updatedPl.activeLiveEvent?.headline).toContain('PRESIDENT JULES ELECTED!');
  });
});
