import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HustleCard } from '../components/HustleCard';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Hustle } from '../config/hustles/base';

describe('HustleCard Mobile Gating', () => {
  const mockHustle: Hustle = {
    id: 'r_labor',
    name: 'Labor & Property',
    tier: 'MUD',
    icon: '🏗️',
    description: 'Manual labor to real estate',
    branches: {
      l3a: {
        level: 3,
        id: 'l3a',
        name: 'Commercial Real Estate',
        cost: 100000,
        yieldCash: 150000,
        yieldClout: 15,
        yieldAura: 15,
        mentalHit: -20,
        cloutReq: 100,
        auraReq: 50,
      },
    },
  };

  beforeEach(() => {
    useGameStore.setState({
      currentMarket: 'NORMAL',
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'MUD',
        bag: 999999999, // Avoid confirmation modal for large spend
        hustleLevels: { r_labor: 3 },
        hustleBranchIds: { r_labor: 'l3a' },
      },
    });
  });

  it('should gate a Level 3 gig in MUD tier and prevent touch-bypass exploits', () => {
    const onExecuteMock = vi.fn();
    const onUpgradeMock = vi.fn();
    const player = useGameStore.getState().pl;

    render(
      <HustleCard
        hustle={mockHustle}
        player={player}
        onExecute={onExecuteMock}
        onUpgrade={onUpgradeMock}
        currentBranchId="l3a"
      />
    );

    // Locate the Execute button
    const executeButton = screen.getByRole('button', { name: /GATED BY TIER/ });
    expect(executeButton).toBeDefined();

    // Verify button is disabled
    expect(executeButton.hasAttribute('disabled')).toBe(true);

    // Verify it contains the required classes
    expect(executeButton.className).toContain('cursor-not-allowed');
    expect(executeButton.className).toContain('pointer-events-none');

    // Simulate onClick and onTouchStart events
    const touchEvent = new TouchEvent('touchstart', { bubbles: true, cancelable: true });

    // Spy on preventDefault
    const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');

    // Dispatch touchstart event
    fireEvent(executeButton, touchEvent);

    // Verify preventDefault was called (blocked the bypass)
    expect(preventDefaultSpy).toHaveBeenCalled();

    // Verify trigger mocks were not called
    expect(onExecuteMock).not.toHaveBeenCalled();
  });

  it('should allow normal execution if player tier is NOT MUD', () => {
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        bag: 999999999, // Avoid confirmation modal for large spend
        hustleLevels: { r_labor: 3 },
        hustleBranchIds: { r_labor: 'l3a' },
      },
    });

    const onExecuteMock = vi.fn();
    const onUpgradeMock = vi.fn();
    const player = useGameStore.getState().pl;

    render(
      <HustleCard
        hustle={mockHustle}
        player={player}
        onExecute={onExecuteMock}
        onUpgrade={onUpgradeMock}
        currentBranchId="l3a"
      />
    );

    // Check button text is 'PLAY' because levelData has a miniGame or executes
    const executeButton = screen.getByRole('button', { name: /PLAY|RUN IT|EXECUTE/ });
    expect(executeButton).toBeDefined();
    expect(executeButton.hasAttribute('disabled')).toBe(false);

    // Simulate click
    fireEvent.click(executeButton);
    expect(onExecuteMock).toHaveBeenCalled();
  });

  it('should call preventDefault on touchstart for valid executions to avoid double execution', () => {
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        currentTier: 'STREET',
        bag: 999999999,
        hustleLevels: { r_labor: 3 },
        hustleBranchIds: { r_labor: 'l3a' },
      },
    });

    const onExecuteMock = vi.fn();
    const onUpgradeMock = vi.fn();
    const player = useGameStore.getState().pl;

    render(
      <HustleCard
        hustle={mockHustle}
        player={player}
        onExecute={onExecuteMock}
        onUpgrade={onUpgradeMock}
        currentBranchId="l3a"
      />
    );

    const executeButton = screen.getByRole('button', { name: /PLAY|RUN IT|EXECUTE/ });
    expect(executeButton).toBeDefined();

    const touchEvent = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');

    fireEvent(executeButton, touchEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onExecuteMock).toHaveBeenCalledTimes(1);
  });
});
