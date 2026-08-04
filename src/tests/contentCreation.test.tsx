import React from 'react';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { ContentCreation, calculateGrade } from '../components/minigames/ContentCreation';
import { useGameStore } from '../store/gameStore';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock framer-motion to render children synchronously and avoid animation delays under JSDOM
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, className, style, ...props }: any, ref: any) => (
      <div ref={ref} className={className} style={style} {...props}>
        {children}
      </div>
    )),
    button: React.forwardRef(({ children, className, style, ...props }: any, ref: any) => (
      <button ref={ref} className={className} style={style} {...props}>
        {children}
      </button>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Define the TOPICS pool locally for lookup in tests
const TEST_TOPICS = [
  { id: 1, label: 'Lofi Beats to Study To', isViral: true },
  { id: 2, label: 'ASMR Satisfying Slime Cutting', isViral: true },
  { id: 3, label: '100 Layers of Lipstick Challenge', isViral: true },
  { id: 4, label: 'Dancing Cat in a Hat', isViral: true },
  { id: 5, label: 'How to Fold Socks Neatly', isViral: false },
  { id: 6, label: 'Watching Paint Dry 10 Hour Loop', isViral: false },
  { id: 7, label: 'Boring Meeting', isViral: false },
  { id: 8, label: 'Tax Returns Tutorial 2024', isViral: false },
  { id: 9, label: 'Speedrunning Minecraft BUT every block is lava', isViral: true },
  { id: 10, label: 'Minecraft: Building a basic dirt house (No Audio)', isViral: false },
  { id: 11, label: 'Unboxing a $10,000 Mystery Box from the Dark Web', isViral: true },
  { id: 12, label: 'Unboxing a box of cardboard folders for office use', isViral: false },
  { id: 13, label: 'Eating the World\'s Spiciest Pepper (GONE WRONG)', isViral: true },
  { id: 14, label: 'Eating a moderately salted cracker in complete silence', isViral: false },
  { id: 15, label: 'My $5,000/Month Passive Income Strategy', isViral: true },
  { id: 16, label: 'Reviewing the IRS tax code section 179 for depreciation', isViral: false },
  { id: 17, label: 'Reacting to my old cringey TikToks (extremely emotional)', isViral: true },
  { id: 18, label: 'Reacting to a 3-hour legislative senate debate on agricultural zoning', isViral: false },
  { id: 19, label: 'Giving a Tesla away to a random subscriber!', isViral: true },
  { id: 20, label: 'Giving my car keys to my brother so he can buy milk', isViral: false },
  { id: 21, label: 'I spent 100 Days in a VR Metaverse Prison', isViral: true },
  { id: 22, label: 'I spent 10 minutes looking at real estate listings in Ohio', isViral: false },
];

const triggerAction = (isPost: boolean) => {
  if (isPost) {
    fireEvent.click(screen.getByTestId('post-button'));
  } else {
    fireEvent.click(screen.getByTestId('decline-button'));
  }
};

const findActiveTopicOnScreen = () => {
  const activeLabel = screen.queryByTestId('active-topic-label')?.textContent;
  return TEST_TOPICS.find(t => t.label === activeLabel);
};

describe('ContentCreation Grading and Helper Logic', () => {
  it('should correctly grade Level 1 performances', () => {
    // Legendary: accuracy >= 0.90, peakMomentum >= 5
    expect(calculateGrade(0.95, 5, 1)).toBe('Legendary');
    expect(calculateGrade(1.0, 7, 1)).toBe('Legendary');
    expect(calculateGrade(0.95, 4, 1)).toBe('Viral');

    // Viral: accuracy >= 0.75, peakMomentum >= 3
    expect(calculateGrade(0.80, 3, 1)).toBe('Viral');
    expect(calculateGrade(0.75, 4, 1)).toBe('Viral');
    expect(calculateGrade(0.80, 2, 1)).toBe('Solid');

    // Solid: accuracy >= 0.50, peakMomentum >= 2
    expect(calculateGrade(0.60, 2, 1)).toBe('Solid');
    expect(calculateGrade(0.50, 3, 1)).toBe('Solid');

    // Flopped
    expect(calculateGrade(0.40, 1, 1)).toBe('Flopped');
    expect(calculateGrade(0.90, 1, 1)).toBe('Flopped');
  });

  it('should correctly grade Level 2 performances', () => {
    // Legendary: accuracy >= 0.90, peakMomentum >= 8
    expect(calculateGrade(0.90, 8, 2)).toBe('Legendary');
    expect(calculateGrade(0.95, 7, 2)).toBe('Viral');

    // Viral: accuracy >= 0.75, peakMomentum >= 5
    expect(calculateGrade(0.75, 5, 2)).toBe('Viral');
    expect(calculateGrade(0.80, 4, 2)).toBe('Solid');

    // Solid: accuracy >= 0.50, peakMomentum >= 4
    expect(calculateGrade(0.50, 4, 2)).toBe('Solid');
    expect(calculateGrade(0.45, 4, 2)).toBe('Flopped');
  });

  it('should correctly grade Level 3 performances', () => {
    // Legendary: accuracy >= 0.90, peakMomentum >= 10
    expect(calculateGrade(0.90, 10, 3)).toBe('Legendary');
    expect(calculateGrade(0.90, 9, 3)).toBe('Viral');

    // Viral: accuracy >= 0.75, peakMomentum >= 7
    expect(calculateGrade(0.75, 7, 3)).toBe('Viral');
    expect(calculateGrade(0.75, 6, 3)).toBe('Solid');

    // Solid: accuracy >= 0.50, peakMomentum >= 4
    expect(calculateGrade(0.50, 4, 3)).toBe('Solid');
    expect(calculateGrade(0.50, 3, 3)).toBe('Flopped');
  });
});

describe('ContentCreation Component Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({
      pl: {
        ...useGameStore.getState().pl,
        narrativeFlags: {}
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should initialize and display correct number of preview items based on level', () => {
    const onComplete = vi.fn();

    // Level 1: 1 preview item
    const { rerender } = render(<ContentCreation level={1} onComplete={onComplete} />);
    expect(screen.getByText('NEXT UP')).toBeTruthy();
    expect(screen.queryAllByText(/^\+1$/i).length).toBe(1);

    // Level 2: 2 preview items
    rerender(<ContentCreation level={2} onComplete={onComplete} />);
    expect(screen.queryAllByText(/^\+1$/i).length).toBe(1);
    expect(screen.queryAllByText(/^\+2$/i).length).toBe(1);

    // Level 3: 3 preview items
    rerender(<ContentCreation level={3} onComplete={onComplete} />);
    expect(screen.queryAllByText(/^\+1$/i).length).toBe(1);
    expect(screen.queryAllByText(/^\+2$/i).length).toBe(1);
    expect(screen.queryAllByText(/^\+3$/i).length).toBe(1);
  });

  it('should build momentum and trigger boost on correct swipes', () => {
    const onComplete = vi.fn();
    render(<ContentCreation level={1} onComplete={onComplete} />);

    // Swiping correct 3 times should build momentum to 3 and trigger 1.5x boost for L1
    for (let i = 0; i < 3; i++) {
      const activeTopic = findActiveTopicOnScreen();
      expect(activeTopic).toBeTruthy();
      if (!activeTopic) return;

      act(() => {
        triggerAction(activeTopic.isViral);
        vi.advanceTimersByTime(310); // Allow card index increment timeout
      });
    }

    // After 3 correct swipes: momentum peak is 3, triggering the boost!
    expect(screen.getByText(/Peak Streak: 3/i)).toBeTruthy();
    expect(screen.getByText(/1.5x Boost/i)).toBeTruthy();
  });

  it('should immediately reset momentum to zero and cancel boost on incorrect swipe', () => {
    const onComplete = vi.fn();
    render(<ContentCreation level={1} onComplete={onComplete} />);

    // Do 3 correct swipes to build momentum and trigger boost
    for (let i = 0; i < 3; i++) {
      const activeTopic = findActiveTopicOnScreen();
      expect(activeTopic).toBeTruthy();
      if (!activeTopic) return;

      act(() => {
        triggerAction(activeTopic.isViral);
        vi.advanceTimersByTime(310);
      });
    }

    // Verify boost is active
    expect(screen.getByText(/1.5x Boost/i)).toBeTruthy();

    // Now make 1 INCORRECT swipe (swipe contrary to viral status)
    const activeTopic = findActiveTopicOnScreen();
    expect(activeTopic).toBeTruthy();
    if (!activeTopic) return;

    act(() => {
      // Swipe opposite of correct viral status to make a mistake
      triggerAction(!activeTopic.isViral);
      vi.advanceTimersByTime(310);
    });

    // Momentum and boost should reset immediately!
    expect(screen.queryByText(/Boost/i)).toBeNull();
    expect(screen.getByText(/Momentum: 0x/i)).toBeTruthy();
  });

  it('should reset momentum and cancel boost on timeout', () => {
    const onComplete = vi.fn();
    render(<ContentCreation level={1} onComplete={onComplete} />);

    // Swipe 3 times correctly
    for (let i = 0; i < 3; i++) {
      const activeTopic = findActiveTopicOnScreen();
      expect(activeTopic).toBeTruthy();
      if (!activeTopic) return;

      act(() => {
        triggerAction(activeTopic.isViral);
        vi.advanceTimersByTime(310);
      });
    }

    expect(screen.getByText(/1.5x Boost/i)).toBeTruthy();

    // Force a timeout (advance timers by 1000 seconds, which exceeds 999s timePerTopic)
    act(() => {
      vi.advanceTimersByTime(1000000);
    });

    // Verify momentum is reset to 0 and boost cancelled
    expect(screen.queryByText(/Boost/i)).toBeNull();
    expect(screen.getByText(/Momentum: 0x/i)).toBeTruthy();
  });

  it('should let boost expire naturally over time while keeping momentum', () => {
    const onComplete = vi.fn();
    render(<ContentCreation level={1} onComplete={onComplete} />);

    // Swipe 3 times correctly
    for (let i = 0; i < 3; i++) {
      const activeTopic = findActiveTopicOnScreen();
      expect(activeTopic).toBeTruthy();
      if (!activeTopic) return;

      act(() => {
        triggerAction(activeTopic.isViral);
        vi.advanceTimersByTime(310);
      });
    }

    expect(screen.getByText(/1.5x Boost/i)).toBeTruthy();

    // Advance timers by 6.5s to expire boost (L1 duration is 6s) without timing out active card
    act(() => {
      vi.advanceTimersByTime(6500);
    });

    // Boost should expire, but momentum remains 3!
    expect(screen.queryByText(/Boost/i)).toBeNull();
    expect(screen.getByText(/Momentum: 3x/i)).toBeTruthy();
  });

  it('should end game, display graded result and save personal best to store', () => {
    const onComplete = vi.fn();
    render(<ContentCreation level={1} onComplete={onComplete} />);

    // Swipe all 7 correct to guarantee 100% accuracy, peak momentum 7, and Legendary grade!
    for (let i = 0; i < 7; i++) {
      const activeTopic = findActiveTopicOnScreen();
      if (!activeTopic) break;

      act(() => {
        triggerAction(activeTopic.isViral);
        vi.advanceTimersByTime(310);
      });
    }

    // Verify result overlay with Legendary grade is visible
    expect(screen.getByText(/PERFORMANCE GRADE/i)).toBeTruthy();
    expect(screen.getByText(/LEGENDARY/i)).toBeTruthy();
    expect(screen.getByText(/NEW PERSONAL BEST!/i)).toBeTruthy();

    // Verify personal best was persisted in the store
    const storeState = useGameStore.getState().pl;
    expect(storeState.narrativeFlags.cc_level_1_best_grade).toBe('Legendary');
    expect(storeState.narrativeFlags.cc_level_1_best_score).toBe(7);

    // Tap Claim Reward to trigger completion callback
    const claimBtn = screen.getByText(/Claim Reward/i);
    expect(claimBtn).toBeTruthy();
    act(() => {
      fireEvent.click(claimBtn);
    });

    expect(onComplete).toHaveBeenCalled();
  });
});
