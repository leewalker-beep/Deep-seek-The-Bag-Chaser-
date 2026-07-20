import React from 'react';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScreenprintMinigame } from '../components/minigames/ScreenprintMinigame';
import { PopUpFrenzyMinigame } from '../components/minigames/PopUpFrenzyMinigame';
import { WindowDisplayMinigame } from '../components/minigames/WindowDisplayMinigame';

describe('ScreenprintMinigame (Level 1) - Timing / Parts matching', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render correct title and countdown timer', () => {
    const onComplete = vi.fn();
    render(<ScreenprintMinigame onComplete={onComplete} scaling={1.5} />);

    expect(screen.getByText('SCREENPRINT TEES')).toBeTruthy();
    expect(screen.getByText(/Match all parts\/tags before time runs out/i)).toBeTruthy();
  });

  it('should handle matching all parts perfectly and complete with 3.0x multiplier', () => {
    const onComplete = vi.fn();
    // Intercept Math.random so that all targets match the first color ('#ef4444')
    vi.spyOn(Math, 'random').mockImplementation(() => 0.0);

    render(<ScreenprintMinigame onComplete={onComplete} scaling={1.5} />);

    // Click Red (index 0 color) for all 3 parts
    const redButtons = screen.getAllByTitle('Red');
    expect(redButtons.length).toBe(3);

    fireEvent.click(redButtons[0]);
    fireEvent.click(redButtons[1]);
    fireEvent.click(redButtons[2]);

    // Click Approve
    const approveBtn = screen.getByText('APPROVE PRINT BATCH');
    fireEvent.click(approveBtn);

    // Fast-forward completion timeout
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledWith(3.0);
  });

  it('should handle partial match and scale appropriately', () => {
    const onComplete = vi.fn();
    // Intercept Math.random so that target colors are all red ('#ef4444')
    vi.spyOn(Math, 'random').mockImplementation(() => 0.0);

    render(<ScreenprintMinigame onComplete={onComplete} scaling={1.5} />);

    const redButtons = screen.getAllByTitle('Red');
    const blueButtons = screen.getAllByTitle('Blue');

    // Match 1 part correctly, 2 parts incorrectly
    fireEvent.click(redButtons[0]);
    fireEvent.click(blueButtons[1]);
    fireEvent.click(blueButtons[2]);

    const approveBtn = screen.getByText('APPROVE PRINT BATCH');
    fireEvent.click(approveBtn);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledWith(1.0);
  });
});

describe('PopUpFrenzyMinigame (Level 2) - Rush Service Queue Management', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render the Pop-Up Tour minigame with queue and stock', () => {
    const onComplete = vi.fn();
    render(<PopUpFrenzyMinigame onComplete={onComplete} scaling={1.5} />);

    expect(screen.getByText('POP-UP TOUR: RUSH SERVICE')).toBeTruthy();
    expect(screen.getByText(/ACTIVE CUSTOMER/i)).toBeTruthy();
  });

  it('should allow serving customer and reducing stock', () => {
    const onComplete = vi.fn();
    // Intercept Math.random to make the first customer ask for 'Red Tee'
    vi.spyOn(Math, 'random').mockImplementation(() => 0.0);

    render(<PopUpFrenzyMinigame onComplete={onComplete} scaling={1.5} />);

    // Click Red Tee button to serve them
    const redTeeBtn = screen.getByRole('button', { name: /Red Tee/i });
    fireEvent.click(redTeeBtn);

    // Stock should decrement and served count should rise
    const servedText = screen.getByText(/Served:/i).parentElement?.textContent;
    expect(servedText).toContain('Served: 1');
  });
});

describe('WindowDisplayMinigame (Level 3) - Pre-allocation Forecast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should initialize budget, allow allocation and resolve', () => {
    const onComplete = vi.fn();
    render(<WindowDisplayMinigame onComplete={onComplete} scaling={1.5} />);

    expect(screen.getByText(/FLAGSHIP STORE: INVENTORY FORECAST/i)).toBeTruthy();
    expect(screen.getByText(/BUDGET LEFT/i)).toBeTruthy();

    // Allocate 100 units by clicking +10 repeatedly on SKUs
    const add10Buttons = screen.getAllByRole('button', { name: '+10' });
    expect(add10Buttons.length).toBe(4);

    // Add 10 to SKU 0 (10 times = 100 units)
    for (let i = 0; i < 10; i++) {
      fireEvent.click(add10Buttons[0]);
    }

    // Now budget left is 0/100, and "RESOLVE SALES WINDOW" should be clickable
    const resolveBtn = screen.getByRole('button', { name: 'RESOLVE SALES WINDOW' });
    expect(resolveBtn).toBeTruthy();

    fireEvent.click(resolveBtn);

    // Run resolution timers
    act(() => {
      vi.advanceTimersByTime(2500); // analysis time
    });

    act(() => {
      vi.advanceTimersByTime(3000); // resolve wait time
    });

    expect(onComplete).toHaveBeenCalled();
  });
});
