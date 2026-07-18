import React from 'react';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { TalentAgencyGame } from '../components/minigames/TalentAgencyGame';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('TalentAgencyGame Wrapper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render the start screen and initialize a purple-themed game', () => {
    const onComplete = vi.fn();
    render(<TalentAgencyGame level={1} onComplete={onComplete} />);

    // Check title and start button
    expect(screen.getByText(/TALENT RECRUIT/i)).toBeTruthy();
    expect(screen.getByText(/"GUESS WHO\?" AUDITION MATRIX/i)).toBeTruthy();
    const startBtn = screen.getByText(/START RECRUITMENT/i);
    expect(startBtn).toBeTruthy();

    // Start game
    fireEvent.click(startBtn);

    // Cards should now be visible face down as 🎭
    const cardBacks = screen.getAllByText('🎭');
    // Level 1 = 6 pairs = 12 cards
    expect(cardBacks.length).toBe(12);
  });

  it('should increase card pool size based on higher difficulty levels', () => {
    const onComplete = vi.fn();
    render(<TalentAgencyGame level={5} onComplete={onComplete} />);

    const startBtn = screen.getByText(/START RECRUITMENT/i);
    fireEvent.click(startBtn);

    const cardBacks = screen.getAllByText('🎭');
    // Level 5 = 10 pairs = 20 cards
    expect(cardBacks.length).toBe(20);
  });
});
