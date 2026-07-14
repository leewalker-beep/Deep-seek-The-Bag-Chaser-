import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import {
  generateDynamicStoryNews,
  generateHistoricalStories,
  generateMonthlySummaryItem
} from '../engine/storyEngine';
import type { PlayerStats } from '../types/game';

describe('Dynamic Story Engine', () => {
  let mockPlayer: PlayerStats;

  beforeEach(() => {
    // Standard initialization of a dummy player state clone
    useGameStore.getState().resetGame('sk_scrap');
    mockPlayer = { ...useGameStore.getState().pl };
  });

  describe('Contextual state combinations (generateDynamicStoryNews)', () => {
    it('should observe and report when the player has quietly become a tech investor', () => {
      mockPlayer.flexAssets = { 'tech_conglomerate': 1 };
      const stories = generateDynamicStoryNews(mockPlayer);
      expect(stories.some(s => s.text.includes('quietly become the largest technology investor'))).toBe(true);
    });

    it('should observe and report when a rival is a major tech investor instead', () => {
      mockPlayer.flexAssets = {};
      mockPlayer.vcInvestment = 0; // Prevent player from having tech focus from default initial state
      mockPlayer.rivals = [
        {
          id: 'rival_tech',
          name: 'Marcus',
          netWorth: 10000000,
          currentBid: 0,
          isNpc: true,
          tier: 'MOGUL',
          specialty: 'tech',
          preferredIndustries: ['tech']
        }
      ];
      const stories = generateDynamicStoryNews(mockPlayer);
      expect(stories.some(s => s.text.includes('Marcus has quietly become the largest technology investor'))).toBe(true);
    });

    it('should observe housing market pressure on high rental properties', () => {
      mockPlayer.rentalCount = 6;
      const stories = generateDynamicStoryNews(mockPlayer);
      expect(stories.some(s => s.text.includes('The housing market is under pressure'))).toBe(true);
    });

    it('should observe when public confidence falls despite record GDP', () => {
      mockPlayer.currentTier = 'PRESIDENT';
      mockPlayer.gdp = 115;
      mockPlayer.approvalRating = 30;
      const stories = generateDynamicStoryNews(mockPlayer);
      expect(stories.some(s => s.text.includes('Public confidence is falling despite record GDP'))).toBe(true);
    });

    it('should report when the media empire outgrows political parties', () => {
      mockPlayer.hustleLevels = { 'media_empire': 3 };
      mockPlayer.clout = 3000;
      const stories = generateDynamicStoryNews(mockPlayer);
      expect(stories.some(s => s.text.includes('Your media empire has become more influential than several political parties'))).toBe(true);
    });

    it('should observe that past prison sentence affects trust when President', () => {
      mockPlayer.currentTier = 'PRESIDENT';
      mockPlayer.arrestCount = 1;
      const stories = generateDynamicStoryNews(mockPlayer);
      expect(stories.some(s => s.text.includes('Your past prison sentence still affects public trust'))).toBe(true);
    });
  });

  describe('Historical references (generateHistoricalStories)', () => {
    it('should reference financial bubble aftermath if month > 36 and market is RECESSION', () => {
      mockPlayer.month = 40;
      mockPlayer.currentMarket = 'RECESSION';
      mockPlayer.activeSentiment = { category: 'MARKET', label: 'Bear Cycle', multiplier: 0.5, monthsRemaining: 3 };
      const stories = generateHistoricalStories(mockPlayer);
      expect(stories.some(s => s.text.includes('The Financial Bubble created three years ago'))).toBe(true);
    });

    it('should reference Healthcare Reform debate if passed under Presidency', () => {
      mockPlayer.currentTier = 'PRESIDENT';
      mockPlayer.presidentialDiary = [
        { id: '1', month: 12, event: 'Healthcare Reform Act', outcome: 'Passed successfully', type: 'ORDER' }
      ];
      const stories = generateHistoricalStories(mockPlayer);
      expect(stories.some(s => s.text.includes('Citizens still debate your Healthcare Reform'))).toBe(true);
    });

    it('should reference rival media expansion continuing to reshape opinion', () => {
      mockPlayer.rivals = [
        {
          id: 'rival_emily',
          name: 'Emily',
          netWorth: 8000000,
          currentBid: 0,
          isNpc: true,
          tier: 'MOGUL',
          preferredIndustries: ['media']
        }
      ];
      const stories = generateHistoricalStories(mockPlayer);
      expect(stories.some(s => s.text.includes("Emily's media expansion continues to reshape public opinion"))).toBe(true);
    });
  });

  describe('Monthly simulation summary report (generateMonthlySummaryItem)', () => {
    it('should build a comprehensive monthly report with all required dimensions', () => {
      mockPlayer.month = 5;
      mockPlayer.mentalHealth = 30; // Burnout warning
      mockPlayer.rivals = [
        { id: '1', name: 'Emily', netWorth: 5000000, currentBid: 0, isNpc: true, tier: 'MOGUL' }
      ];

      const summary = generateMonthlySummaryItem(mockPlayer, 5000, 1000, 'NORMAL');

      expect(summary.category).toBe('NEWS');
      expect(summary.pinned).toBe(true);
      expect(summary.text).toContain('📅 MONTH 5 SIMULATION REPORT:');
      expect(summary.text).toContain('• Biggest success:');
      expect(summary.text).toContain('• Biggest problem:');
      expect(summary.text).toContain('• Most important world event:');
      expect(summary.text).toContain('• Fastest growing rival:');
      expect(summary.text).toContain('• Strongest economic sector:');
      expect(summary.text).toContain('• Weakest sector:');
      expect(summary.text).toContain('• Biggest financial change:');
      expect(summary.text).toContain('• Key recommendation:');

      // Check contextual results mapped
      expect(summary.text).toContain('Severe exhaustion risk');
      expect(summary.text).toContain('Emily');
      expect(summary.text).toContain('CRITICAL: Take therapeutic rest');
    });
  });
});
