import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EcomCatch } from '../components/minigames/EcomCatch';

describe('EcomCatch Redesigned Progression and Scaling', () => {
  const originalRandom = Math.random;

  beforeEach(() => {
    Math.random = originalRandom;
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    Math.random = originalRandom;
    vi.restoreAllMocks();
  });

  it('should render correct title and level indicators', () => {
    const onComplete = vi.fn();
    render(<EcomCatch onComplete={onComplete} level={1} tier="STARTUP" />);
    expect(screen.getByText('E-COM BRAND')).toBeTruthy();
    expect(screen.getByText('L1')).toBeTruthy();
  });

  it('should scale difficulty parameters across levels in STARTUP tier', () => {
    const { container: containerL1 } = render(<EcomCatch onComplete={vi.fn()} level={1} tier="STARTUP" />);
    const speedTextL1 = containerL1.querySelector('.mt-2.flex.justify-between')?.textContent;
    expect(speedTextL1).toContain('Quota: 67');
    expect(speedTextL1).toContain('Speed: 2.4x');
    cleanup();

    const { container: containerL2 } = render(<EcomCatch onComplete={vi.fn()} level={2} tier="STARTUP" />);
    const speedTextL2 = containerL2.querySelector('.mt-2.flex.justify-between')?.textContent;
    expect(speedTextL2).toContain('Quota: 15');
    expect(speedTextL2).toContain('Speed: 3.3x');
    cleanup();

    const { container: containerL3 } = render(<EcomCatch onComplete={vi.fn()} level={3} tier="STARTUP" />);
    const speedTextL3 = containerL3.querySelector('.mt-2.flex.justify-between')?.textContent;
    expect(speedTextL3).toContain('Quota: 3');
    expect(speedTextL3).toContain('Speed: 4.2x');
  });

  it('should correctly implement Level 2 matching set target match & wrong-item-miss logic', () => {
    vi.spyOn(Math, 'random').mockImplementation(() => 0.0);

    const onComplete = vi.fn();
    render(<EcomCatch onComplete={onComplete} level={2} tier="STARTUP" />);

    expect(screen.getByText('TARGET:')).toBeTruthy();
    expect(screen.getByText('Nuke Sneakers')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(450);
    });

    const sneakersBtn = screen.getByRole('button', { name: /Nuke Sneakers/i });
    expect(sneakersBtn).toBeTruthy();

    fireEvent.click(sneakersBtn);

    let scoreText = screen.getByText('ORDERS').parentElement?.textContent;
    expect(scoreText).toContain('1');
    let missedText = screen.getByText('MISSED').parentElement?.textContent;
    expect(missedText).toContain('0/');

    vi.restoreAllMocks();
    let randomCalls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCalls++;
      if (randomCalls === 1) return 0.5; // skips skew
      return 0.2; // Adibas Tee
    });

    act(() => {
      vi.advanceTimersByTime(450);
    });

    const teeBtn = screen.getByRole('button', { name: /Adibas Tee/i });
    expect(teeBtn).toBeTruthy();

    fireEvent.click(teeBtn);

    missedText = screen.getByText('MISSED').parentElement?.textContent;
    expect(missedText).toContain('1/');
  });

  it('should correctly implement Level 3 collection-checklist logic and duplicate catches neutrality', () => {
    const onComplete = vi.fn();
    const { container } = render(<EcomCatch onComplete={onComplete} level={3} tier="STARTUP" />);

    expect(screen.getByText('COLLECTION CHECKLIST:')).toBeTruthy();

    // Dynamically retrieve the name of the first checklist item from the container
    const checklistItemEls = container.querySelectorAll('.mt-2 .flex.gap-2 .text-\\[8px\\]');
    expect(checklistItemEls.length).toBeGreaterThan(0);
    const targetName = checklistItemEls[0].textContent;
    expect(targetName).toBeTruthy();

    const TIERED_PRODUCTS = [
      { icon: '👟', name: 'Nuke Sneakers' },
      { icon: '👕', name: 'Adibas Tee' },
      { icon: '📱', name: 'Samesung Phone' },
      { icon: '👜', name: 'LB Bag' },
      { icon: '🎧', name: 'AirPots' },
      { icon: '⌚', name: 'Casio G' },
      { icon: '👟', name: 'Nike SB' },
      { icon: '💻', name: 'Lenovo X1' },
      { icon: '⌚', name: 'Ralex Watch' },
      { icon: '👜', name: 'Luton Bag' },
      { icon: '💎', name: 'Diamondique' },
      { icon: '🕶️', name: 'Versage Frames' },
      { icon: '⌚', name: 'Rolex Daytona' },
      { icon: '👜', name: 'Birkin Bag' },
      { icon: '💎', name: 'VVS Chain' },
      { icon: '🛥️', name: 'Yacht Share' }
    ];
    const targetProduct = TIERED_PRODUCTS.find(p => p.name.toUpperCase() === targetName!.toUpperCase());
    expect(targetProduct).toBeTruthy();

    // Mock Math.random to spawn our checklist target product
    vi.restoreAllMocks();
    let randomCalls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCalls++;
      if (randomCalls === 1) return 0.1; // trigger skew (< 0.5)
      if (randomCalls === 2) return 0.0; // choose index 0 from uncaught checklist items
      return 0.5;
    });

    // Spawn 1 item
    act(() => {
      vi.advanceTimersByTime(350);
    });

    const targetBtn = screen.getByRole('button', { name: new RegExp(targetProduct!.name, 'i') });
    expect(targetBtn).toBeTruthy();

    // Catch target listed item
    fireEvent.click(targetBtn);

    // Score is 1
    let caughtCountText = screen.getByText('CAUGHT').parentElement?.textContent;
    expect(caughtCountText).toContain('1');

    // Missed count is 0
    let missedText = screen.getByText('MISSED').parentElement?.textContent;
    expect(missedText).toContain('0/');

    // Duplicate Catch Neutrality:
    // Let's spawn and catch the exact same target item again.
    vi.restoreAllMocks();
    let randomCalls2 = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCalls2++;
      if (randomCalls2 === 1) return 0.1; // skew spawn
      if (randomCalls2 === 2) return 0.0; // choose index 0
      return 0.5;
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    const duplicateTargetBtn = screen.getByRole('button', { name: new RegExp(targetProduct!.name, 'i') });
    expect(duplicateTargetBtn).toBeTruthy();

    const missedBefore = screen.getByText('MISSED').parentElement?.textContent;
    fireEvent.click(duplicateTargetBtn);
    const missedAfter = screen.getByText('MISSED').parentElement?.textContent;

    // Missed count must not have changed (duplicate neutrality)
    expect(missedBefore).toEqual(missedAfter);

    // Distractor catch miss:
    // Spawn a distractor item (e.g. AirPots if it is not on the checklist)
    // To ensure it's a distractor, let's find a product not on checklist.
    const checklistProductNames = Array.from(container.querySelectorAll('.tracking-tight')).map(el => el.textContent?.toUpperCase());
    const distractorProduct = TIERED_PRODUCTS.find(p => !checklistProductNames.includes(p.name.toUpperCase()) && p.name.toUpperCase() !== targetProduct!.name.toUpperCase());
    expect(distractorProduct).toBeTruthy();

    vi.restoreAllMocks();
    let randomCalls3 = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCalls3++;
      if (randomCalls3 === 1) return 0.9; // bypass skew spawn
      const index = TIERED_PRODUCTS.findIndex(p => p.name === distractorProduct!.name);
      return index / TIERED_PRODUCTS.length;
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    const distractorBtn = screen.getByRole('button', { name: new RegExp(distractorProduct!.name, 'i') });
    expect(distractorBtn).toBeTruthy();

    fireEvent.click(distractorBtn);

    // Missed count must increment (caught a distractor item)
    missedText = screen.getByText('MISSED').parentElement?.textContent;
    expect(missedText).toContain('1/');
  });
});
