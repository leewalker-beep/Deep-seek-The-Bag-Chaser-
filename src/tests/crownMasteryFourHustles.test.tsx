import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getCrownProgress, isHustleMastered, getMasteryCount, MASTERY_REQUIREMENTS } from '../utils/masteryUtils';
import { CrownProgress } from '../components/hustles/CrownProgress';
import { useGameStore } from '../store/gameStore';

describe('Crown Mastery Regression Suite for Core Four Hustles', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('validates configured mastery requirements for all four target hustles', () => {
    expect(MASTERY_REQUIREMENTS['r_delivery']).toEqual({ minPlays: 10, minLevel: 2 });
    expect(MASTERY_REQUIREMENTS['r_scrap']).toEqual({ minPlays: 10, minLevel: 2 });
    expect(MASTERY_REQUIREMENTS['r_plasma']).toEqual({ minPlays: 15, noLevelReq: true });
    expect(MASTERY_REQUIREMENTS['r_vending']).toEqual({ minPlays: 20, noLevelReq: true });
  });

  it('correctly calculates crown progress below threshold for all four hustles', () => {
    const pl = useGameStore.getState().pl;

    // Below threshold for r_delivery (5 plays, branch l1 level 1)
    pl.hustlePlays['r_delivery'] = 5;
    pl.hustleBranchIds['r_delivery'] = 'l1';
    pl.hustleLevels['r_delivery'] = 1;
    const deliveryProgress = getCrownProgress(pl, 'r_delivery');
    expect(deliveryProgress).not.toBeNull();
    expect(deliveryProgress?.actualPlays).toBe(5);
    expect(deliveryProgress?.targetPlays).toBe(10);
    expect(deliveryProgress?.actualLevel).toBe(1);
    expect(deliveryProgress?.targetLevel).toBe(2);
    expect(deliveryProgress?.isMastered).toBe(false);
    expect(deliveryProgress?.progressPercent).toBe(50); // (0.5 * 0.5 + 0.5 * 0.5) * 100

    // Below threshold for r_scrap (5 plays, branch l1 level 1)
    pl.hustlePlays['r_scrap'] = 5;
    pl.hustleBranchIds['r_scrap'] = 'l1';
    pl.hustleLevels['r_scrap'] = 1;
    const scrapProgress = getCrownProgress(pl, 'r_scrap');
    expect(scrapProgress).not.toBeNull();
    expect(scrapProgress?.actualPlays).toBe(5);
    expect(scrapProgress?.targetPlays).toBe(10);
    expect(scrapProgress?.actualLevel).toBe(1);
    expect(scrapProgress?.targetLevel).toBe(2);
    expect(scrapProgress?.isMastered).toBe(false);

    // Below threshold for r_plasma (10 donations out of 15)
    pl.hustlePlays['r_plasma'] = 10;
    const plasmaProgress = getCrownProgress(pl, 'r_plasma');
    expect(plasmaProgress).not.toBeNull();
    expect(plasmaProgress?.actualPlays).toBe(10);
    expect(plasmaProgress?.targetPlays).toBe(15);
    expect(plasmaProgress?.targetLevel).toBeUndefined();
    expect(plasmaProgress?.isMastered).toBe(false);

    // Below threshold for r_vending (12 purchases out of 20)
    pl.vendingCount = 12;
    const vendingProgress = getCrownProgress(pl, 'r_vending');
    expect(vendingProgress).not.toBeNull();
    expect(vendingProgress?.actualPlays).toBe(12);
    expect(vendingProgress?.targetPlays).toBe(20);
    expect(vendingProgress?.targetLevel).toBeUndefined();
    expect(vendingProgress?.isMastered).toBe(false);
  });

  it('correctly calculates crown progress and mastery status at exact threshold for all four hustles', () => {
    const pl = useGameStore.getState().pl;

    // Delivery Gigs at threshold (10 plays, Level 2 Car Delivery branch l2)
    pl.hustlePlays['r_delivery'] = 10;
    pl.hustleBranchIds['r_delivery'] = 'l2';
    pl.hustleLevels['r_delivery'] = 2;
    expect(isHustleMastered(pl, 'r_delivery')).toBe(true);
    const deliveryProgress = getCrownProgress(pl, 'r_delivery');
    expect(deliveryProgress?.isMastered).toBe(true);
    expect(deliveryProgress?.progressPercent).toBe(100);

    // Scrap Metal at threshold (10 plays, Level 2 Yard Owner branch l2)
    pl.hustlePlays['r_scrap'] = 10;
    pl.hustleBranchIds['r_scrap'] = 'l2';
    pl.hustleLevels['r_scrap'] = 2;
    expect(isHustleMastered(pl, 'r_scrap')).toBe(true);
    const scrapProgress = getCrownProgress(pl, 'r_scrap');
    expect(scrapProgress?.isMastered).toBe(true);
    expect(scrapProgress?.progressPercent).toBe(100);

    // Plasma Donation at threshold (15 donations)
    pl.hustlePlays['r_plasma'] = 15;
    expect(isHustleMastered(pl, 'r_plasma')).toBe(true);
    const plasmaProgress = getCrownProgress(pl, 'r_plasma');
    expect(plasmaProgress?.isMastered).toBe(true);
    expect(plasmaProgress?.progressPercent).toBe(100);

    // Vending Machine at threshold (20 purchases)
    pl.vendingCount = 20;
    expect(isHustleMastered(pl, 'r_vending')).toBe(true);
    const vendingProgress = getCrownProgress(pl, 'r_vending');
    expect(vendingProgress?.isMastered).toBe(true);
    expect(vendingProgress?.progressPercent).toBe(100);
  });

  it('derives actualLevel safely from active branch data even if hustleLevels is unpopulated', () => {
    const pl = useGameStore.getState().pl;

    // Branch l2 (Car Delivery) is level 2
    pl.hustleBranchIds['r_delivery'] = 'l2';
    delete pl.hustleLevels['r_delivery'];
    pl.hustlePlays['r_delivery'] = 10;

    expect(isHustleMastered(pl, 'r_delivery')).toBe(true);
    const progress = getCrownProgress(pl, 'r_delivery');
    expect(progress?.actualLevel).toBe(2);
    expect(progress?.isMastered).toBe(true);
  });

  it('renders CrownProgress component for all four hustles in DOM', () => {
    const pl = useGameStore.getState().pl;
    pl.hustlePlays['r_delivery'] = 4;
    pl.hustleBranchIds['r_delivery'] = 'l1';
    pl.hustleLevels['r_delivery'] = 1;

    pl.hustlePlays['r_scrap'] = 6;
    pl.hustleBranchIds['r_scrap'] = 'l2';
    pl.hustleLevels['r_scrap'] = 2;

    pl.hustlePlays['r_plasma'] = 8;
    pl.vendingCount = 10;

    // Render CrownProgress for r_delivery
    const { rerender } = render(<CrownProgress player={pl} hustleId="r_delivery" />);
    expect(screen.getByText(/👑 Crown Progress/i)).toBeDefined();
    expect(screen.getByText(/Runs completed:/i)).toBeDefined();

    // Render CrownProgress for r_scrap
    rerender(<CrownProgress player={pl} hustleId="r_scrap" />);
    expect(screen.getByText(/Successful salvage runs:/i)).toBeDefined();

    // Render CrownProgress for r_plasma
    rerender(<CrownProgress player={pl} hustleId="r_plasma" />);
    expect(screen.getByText(/Donations:/i)).toBeDefined();

    // Render CrownProgress for r_vending
    rerender(<CrownProgress player={pl} hustleId="r_vending" />);
    expect(screen.getByText(/Purchases:/i)).toBeDefined();
  });

  it('executing hustles via game store updates plays, progress, and prevents duplicate crowns', () => {
    const store = useGameStore.getState();

    // Set player bag high enough for testing executions
    store.updatePl({
      bag: 100000,
      clout: 500,
      aura: 500,
      hustleBranchIds: { r_delivery: 'l2', r_scrap: 'l2' },
      hustleLevels: { r_delivery: 2, r_scrap: 2 }
    });

    // Execute Delivery Gigs 10 times with forceSuccess
    for (let i = 0; i < 10; i++) {
      store.executeHustle('r_delivery', 1.0, true);
    }

    const pl = useGameStore.getState().pl;
    expect(pl.hustlePlays['r_delivery']).toBeGreaterThanOrEqual(10);
    expect(pl.masteredHustles).toContain('r_delivery');

    const crownCountAfterMastery = getMasteryCount(pl);

    // Execute Delivery Gigs additional times
    store.executeHustle('r_delivery', 1.0, true);
    store.executeHustle('r_delivery', 1.0, true);

    const plAfter = useGameStore.getState().pl;
    // Verify masteredHustles does not contain duplicates
    const deliveryMasteryCount = plAfter.masteredHustles.filter(h => h === 'r_delivery').length;
    expect(deliveryMasteryCount).toBe(1);
    expect(getMasteryCount(plAfter)).toBe(crownCountAfterMastery);
  });

  it('verifies earned mastery persists across state serialization / store reload', () => {
    const store = useGameStore.getState();

    store.updatePl({
      bag: 100000,
      clout: 500,
      aura: 500,
      hustlePlays: { r_plasma: 15 },
      masteredHustles: ['r_plasma']
    });

    const pl = useGameStore.getState().pl;
    expect(isHustleMastered(pl, 'r_plasma')).toBe(true);
    const progress = getCrownProgress(pl, 'r_plasma');
    expect(progress?.isMastered).toBe(true);
  });
});
