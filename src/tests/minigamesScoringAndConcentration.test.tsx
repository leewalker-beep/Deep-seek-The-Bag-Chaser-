import React from 'react';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { TapAssign } from '../components/minigames/TapAssign';
import { ConcentrationMatch } from '../components/minigames/ConcentrationMatch';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('TapAssign Consecutive-Pairing Scoring Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should initialize score to 0 and display matches', () => {
    const onComplete = vi.fn();
    render(<TapAssign level={1} tier="MUD" onComplete={onComplete} />);

    // Header matches should be displayed
    expect(screen.getByText(/MATCHES: 0/i)).toBeTruthy();
    expect(screen.getByText(/Active Selection: None/i)).toBeTruthy();
  });

  it('should handle tapping the same icon type consecutively as a match', () => {
    const onComplete = vi.fn();
    // Intercept Math.random to always yield 0 (type 0, envelope)
    vi.spyOn(Math, 'random').mockImplementation(() => 0);

    render(<TapAssign level={1} tier="MUD" onComplete={onComplete} />);

    // Let 2 tasks spawn
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // We should see envelopes
    const envelopes = screen.getAllByText('✉️');
    expect(envelopes.length).toBeGreaterThanOrEqual(2);

    // Tap first envelope
    fireEvent.pointerDown(envelopes[0]);
    expect(screen.getByText(/Active Selection: ✉️/i)).toBeTruthy();
    expect(screen.getByText(/MATCHES: 0/i)).toBeTruthy();

    // Tap second envelope (same type)
    fireEvent.pointerDown(envelopes[1]);
    expect(screen.getByText(/Active Selection: None/i)).toBeTruthy();
    expect(screen.getByText(/MATCHES: 1/i)).toBeTruthy();
  });

  it('should not score a match when consecutively tapping different icon types', () => {
    const onComplete = vi.fn();

    // We will control Math.random to spawn specific types
    let randomCalls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomCalls++;
      // Return 0 for type 0 (envelope) first, then 0.5 (which is 1, type 1, phone)
      if (randomCalls === 1) return 0.05; // type 0
      if (randomCalls === 2) return 0.5;  // type 1
      return 0.5; // type 1
    });

    render(<TapAssign level={1} tier="MUD" onComplete={onComplete} />);

    // Spawn tasks
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const envelopes = screen.getAllByText('✉️');
    const phones = screen.getAllByText('📞');

    // Tap envelope first
    fireEvent.pointerDown(envelopes[0]);
    expect(screen.getByText(/Active Selection: ✉️/i)).toBeTruthy();
    expect(screen.getByText(/MATCHES: 0/i)).toBeTruthy();

    // Tap phone next (mismatch)
    fireEvent.pointerDown(phones[0]);
    expect(screen.getByText(/Active Selection: 📞/i)).toBeTruthy();
    expect(screen.getByText(/MATCHES: 0/i)).toBeTruthy();
  });
});

describe('ConcentrationMatch Minigame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render start screen, start game, and initialize card pairs for Level 1', () => {
    const onComplete = vi.fn();
    render(<ConcentrationMatch level={1} tier="MUD" onComplete={onComplete} />);

    // Check title and start button
    expect(screen.getByText(/MARKET SYNC/i)).toBeTruthy();
    expect(screen.getByText(/CONCENTRATION MATCH/i)).toBeTruthy();
    const startBtn = screen.getByText(/START SYNC/i);
    expect(startBtn).toBeTruthy();

    // Start game
    fireEvent.click(startBtn);

    // Cards should now be visible (face down with ❓)
    // Level 1 = 6 pairs = 12 cards
    const questionMarks = screen.getAllByText('❓');
    expect(questionMarks.length).toBe(12);
  });

  it('should initialize card pairs based on high level', () => {
    const onCompleteHigh = vi.fn();
    render(<ConcentrationMatch level={5} tier="MUD" onComplete={onCompleteHigh} />);
    const startBtnHigh = screen.getByText(/START SYNC/i);
    fireEvent.click(startBtnHigh);
    const questionMarksHigh = screen.getAllByText('❓');
    // Level 5 = 10 pairs = 20 cards
    expect(questionMarksHigh.length).toBe(20);
  });
});
