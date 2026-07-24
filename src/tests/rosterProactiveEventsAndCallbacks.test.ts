import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { processEntertainmentTimelineTick } from '../engine/advancementEngine';
import { getCharacterCallbackLine } from '../utils/rivalUtils';

describe('Roster Proactive Events and Character-Memory Callbacks', () => {
  const originalRandom = Math.random;

  beforeEach(() => {
    useGameStore.getState().resetGame('sk_scrap');
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  describe('Roster Proactive Events in advancementEngine', () => {
    it('should generate Founders proactive events (crisis and poaching) on timeline tick', () => {
      const pl = {
        ...useGameStore.getState().pl,
        foundersBacked: [
          {
            id: 'f_test_1',
            name: 'Alice Croft',
            avatar: '💼',
            companyName: 'Croft Industries',
            pitchIdea: 'Treasure hunting tech',
            stats: { execution: 50, vision: 60, burnDiscipline: 70 }
          }
        ]
      };

      const newsFeed: string[] = [];

      // Mock Math.random to trigger the first check (pivot/crisis: Math.random() < 0.05)
      Math.random = () => 0.02;

      processEntertainmentTimelineTick(pl, newsFeed);

      expect(newsFeed.length).toBeGreaterThan(0);
      expect(newsFeed[0]).toContain('🚨 PORTFOLIO CRISIS');
      expect(newsFeed[0]).toContain('Croft Industries');
      expect(newsFeed[0]).toContain('Alice Croft');
      expect(pl.foundersBacked[0].stats.burnDiscipline).toBe(60); // 70 - 10

      // Reset feed
      const newsFeed2: string[] = [];
      // Mock Math.random to skip crisis but trigger poaching threat
      // first check: random < 0.05 (fails at 0.06), second check: random < 0.05 (succeeds at 0.04)
      let count = 0;
      Math.random = () => {
        count++;
        if (count === 1) return 0.06; // skips crisis
        return 0.02; // triggers poaching
      };

      processEntertainmentTimelineTick(pl, newsFeed2);
      expect(newsFeed2.length).toBeGreaterThan(0);
      expect(newsFeed2[0]).toContain('🦹 POACHING THREAT');
      expect(newsFeed2[0]).toContain('Alice Croft');
      expect(newsFeed2[0]).toContain('Croft Industries');
    });

    it('should generate Regional Executives proactive events (headhunting and risk-based scandal)', () => {
      const pl = {
        ...useGameStore.getState().pl,
        conglomerateCEOs: {
          'na_tech': {
            id: 'exec_test_1',
            name: 'Viktor Doom',
            avatar: '👔',
            competence: 80,
            loyalty: 75,
            riskTolerance: 90,
            bio: 'Risky executor'
          }
        },
        conglomerateCandidates: [
          {
            id: 'exec_test_candidate',
            name: 'Bob Candidate',
            competence: 50,
            loyalty: 50,
            riskTolerance: 50
          }
        ]
      };

      const newsFeed: string[] = [];

      // Mock Math.random to trigger first check (headhunting: Math.random() < 0.05)
      Math.random = () => 0.02;

      processEntertainmentTimelineTick(pl, newsFeed);

      expect(newsFeed.length).toBeGreaterThan(0);
      expect(newsFeed.some(msg => msg.includes('🦹 HEADHUNTING THREAT') && msg.includes('Viktor Doom'))).toBe(true);
      expect(pl.conglomerateCEOs['na_tech'].loyalty).toBe(60); // 75 - 15

      // Test candidate headhunting
      expect(newsFeed.some(msg => msg.includes('🦹 HEADHUNTING THREAT') && msg.includes('Bob Candidate'))).toBe(true);

      // Reset feed
      const newsFeed2: string[] = [];
      // Mock Math.random to skip headhunting but trigger risk scandal
      // CEO na_tech checks:
      // - headhunting: random < 0.05 (return 0.06 to fail)
      // - scandal: random < (riskTolerance/100) * 0.10 => 0.90 * 0.10 = 0.09. Return 0.04 to succeed.
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.06; // skip headhunting for CEO na_tech
        if (callCount === 2) return 0.04; // trigger scandal for CEO na_tech (0.04 < 0.09)
        return 0.10; // skip candidate headhunting
      };

      processEntertainmentTimelineTick(pl, newsFeed2);
      expect(newsFeed2.length).toBeGreaterThan(0);
      expect(newsFeed2.some(msg => msg.includes('🚨 EXECUTIVE SCANDAL') && msg.includes('Viktor Doom'))).toBe(true);
      expect(pl.heat).toBe(15); // increased by 15
    });

    it('should generate Rolodex Celebrities proactive tabloid events (positive and negative)', () => {
      const pl = {
        ...useGameStore.getState().pl,
        rolodex: [
          {
            id: 'cel_test_1',
            name: 'Gamer-Girl Chloe',
            avatar: '🎮',
            relationshipScore: 70,
            isUnlocked: true
          }
        ]
      };

      // Test Tabloid Buzz (Positive)
      const newsFeedPositive: string[] = [];
      let callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.05; // tabloid triggered (random < 0.08)
        return 0.2; // positive tabloid (random < 0.5)
      };

      processEntertainmentTimelineTick(pl, newsFeedPositive);
      expect(newsFeedPositive.length).toBeGreaterThan(0);
      expect(newsFeedPositive[0]).toContain('📸 TABLOID BUZZ');
      expect(newsFeedPositive[0]).toContain('Gamer-Girl Chloe');
      expect(pl.rolodex[0].relationshipScore).toBe(80); // 70 + 10

      // Test Tabloid Scandal (Negative)
      const newsFeedNegative: string[] = [];
      callCount = 0;
      Math.random = () => {
        callCount++;
        if (callCount === 1) return 0.05; // tabloid triggered (random < 0.08)
        return 0.8; // negative tabloid (random >= 0.5)
      };

      processEntertainmentTimelineTick(pl, newsFeedNegative);
      expect(newsFeedNegative.length).toBeGreaterThan(0);
      expect(newsFeedNegative[0]).toContain('📸 TABLOID SCANDAL');
      expect(newsFeedNegative[0]).toContain('Gamer-Girl Chloe');
      expect(pl.rolodex[0].relationshipScore).toBe(70); // 80 - 10
    });
  });

  describe('Character-Memory Callbacks', () => {
    it('should correctly return appropriate callback lines based on player history', () => {
      const player = {
        crushedRivals: ['char_marcus'],
        completedNarrativeEvents: ['event_char_ashley'],
        narrativeFlags: {
          'rel_char_cole': '85',
          'rel_char_vance': '20'
        },
        npcs: [
          { id: 'char_jenny', disposition: 80 },
          { id: 'char_shane', disposition: 15 }
        ]
      };

      // Crushed Rival check
      const lineMarcus = getCharacterCallbackLine(player, 'char_marcus');
      expect(lineMarcus).toContain('crushed them as a rival');

      // Completed Narrative Event check
      const lineAshley = getCharacterCallbackLine(player, 'char_ashley');
      expect(lineAshley).toContain('prior key turning point');

      // Relationship Narrative Flag checks (High and Low)
      const lineCole = getCharacterCallbackLine(player, 'char_cole');
      expect(lineCole).toContain('past generosity and support');

      const lineVance = getCharacterCallbackLine(player, 'char_vance');
      expect(lineVance).toContain('Past tensions still linger');

      // Persistent NPC disposition checks (High and Low)
      const lineJenny = getCharacterCallbackLine(player, 'char_jenny');
      expect(lineJenny).toContain('close contact who remembers your loyalty');

      const lineShane = getCharacterCallbackLine(player, 'char_shane');
      expect(lineShane).toContain('Tense past history. Watch your back.');

      // Non-matching character
      const lineNone = getCharacterCallbackLine(player, 'char_nonexistent');
      expect(lineNone).toBeNull();
    });
  });
});
