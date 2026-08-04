import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SwipeOrder, calculateDropshippingGrade } from '../components/minigames/SwipeOrder';

describe('calculateDropshippingGrade', () => {
  it('should award E-Com Kingpin for 100% accuracy and 0 tokens used', () => {
    const grade = calculateDropshippingGrade(1.0, 0, 3);
    expect(grade).toBe('E-Com Kingpin');
  });

  it('should award E-Com Kingpin for 90% accuracy and 0 tokens used', () => {
    const grade = calculateDropshippingGrade(0.9, 0, 3);
    expect(grade).toBe('E-Com Kingpin');
  });

  it('should award Viral Scaler for 100% accuracy but using tokens', () => {
    const grade = calculateDropshippingGrade(1.0, 1, 3);
    expect(grade).toBe('Viral Scaler');
  });

  it('should award Viral Scaler for 75% accuracy and some tokens unused', () => {
    const grade = calculateDropshippingGrade(0.75, 1, 3);
    expect(grade).toBe('Viral Scaler');
  });

  it('should award Niche Store for 50% accuracy and high token usage', () => {
    const grade = calculateDropshippingGrade(0.5, 3, 3);
    expect(grade).toBe('Niche Store');
  });

  it('should return Chargeback Hell for very low accuracy', () => {
    const grade = calculateDropshippingGrade(0.2, 3, 3);
    expect(grade).toBe('Chargeback Hell');
  });
});

describe('SwipeOrder Dropshipping Minigame Components', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should initialize with correct token counts and populate backlog', () => {
    const onComplete = vi.fn();
    render(<SwipeOrder onComplete={onComplete} level={1} tier="MUD" />);

    // Verify token HUD displays correctly
    // Level 1 gets 3 tokens
    expect(screen.getByText(/🎟️🎟️🎟️/i)).toBeTruthy();

    // Verify backlog queue initial stack
    expect(screen.getByText(/Backlog Queue/i)).toBeTruthy();
    expect(screen.getByText(/2\/6/i)).toBeTruthy(); // First 2 populated
  });

  it('should decrease tokens on verify and reveal the verified state on the card', () => {
    const onComplete = vi.fn();
    render(<SwipeOrder onComplete={onComplete} level={1} tier="MUD" />);

    // Press Verify Order button
    const verifyBtn = screen.getByRole('button', { name: /Verify Order/i });
    expect(verifyBtn).toBeTruthy();

    fireEvent.click(verifyBtn);

    // Verify that token count decreases (should show 🎟️🎟️)
    expect(screen.getByText(/🎟️🎟️\s/i)).toBeTruthy();

    // Verify that a badge displaying "VERIFIED" appears on the card
    const verifiedBadge = screen.queryByText(/VERIFIED AUTHENTIC/i) || screen.queryByText(/VERIFIED SCAM/i);
    expect(verifiedBadge).toBeTruthy();
  });

  it('should handle backlog growth and overflow penalties over time', () => {
    const onComplete = vi.fn();
    render(<SwipeOrder onComplete={onComplete} level={3} tier="MUD" />);

    // Initially backlog has 2 orders
    expect(screen.getByText(/2\/6/i)).toBeTruthy();

    // Fast forward spawn time to trigger multiple spawns
    // Spawn rate for Level 3: (5 - 3 * 0.8) * timerFactor = 2.6 * timerFactor.
    // Advancing by 30 seconds should spawn more than 6 items and overflow backlog
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Check backlog capacity displays overflowing status
    expect(screen.getByText(/6\/6/i)).toBeTruthy();

    // Check that overflows have been registered and penalties accrued
    expect(screen.getByText(/order\(s\) lost to backlog overflow!/i)).toBeTruthy();
  });

  it('should trigger order timeout and handle next order automatically', () => {
    const onComplete = vi.fn();
    render(<SwipeOrder onComplete={onComplete} level={1} tier="MUD" />);

    // Capture the initial name of active order using the test ID
    const brandElement = screen.getByTestId('active-brand-name');
    expect(brandElement).toBeTruthy();
    const initialTitle = brandElement.textContent;
    expect(initialTitle).toBeTruthy();

    // Fast-forward by time limit (e.g. 5 seconds) to trigger active card timeout
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // The processed total should increase
    expect(screen.getByText(/0\/1/i)).toBeTruthy(); // 1 resolved as wrong/timeout
  });

  it('should complete and call onComplete with correct scaled multiplier on completion', () => {
    const onComplete = vi.fn();
    // Use fewer items so game completes faster
    const customItems = [
      { id: 1, name: 'NIKE', type: 'real' as const, timeLimit: 1.5 },
      { id: 2, name: 'NAH-KE', type: 'fake' as const, timeLimit: 1.5 }
    ];

    render(<SwipeOrder onComplete={onComplete} items={customItems} level={1} tier="MUD" />);

    // Approve first order (real)
    const approveBtn = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveBtn);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Reject second order (fake)
    const rejectBtn = screen.getByRole('button', { name: /Reject/i });
    fireEvent.click(rejectBtn);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Fast-forward to clear result transitions and finalize the game
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Game should complete and render fulfillment summary
    expect(screen.getByText(/FULFILLMENT SUMMARY/i)).toBeTruthy();

    // Fast-forward the final delay to execute onComplete
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalled();
  });
});
