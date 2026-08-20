import { describe, test, expect } from 'vitest';
import { calculateTransitionDuration, generateDynamicChapterIntro } from '../utils/cinematicUtils';
import { type PlayerStats } from '../types/game';

describe('Cinematic Transitions - Dynamic Duration & PRESIDENT Tier Intro', () => {
  test('calculateTransitionDuration enforces 4000ms minimum floor for short messages', () => {
    const durationShort = calculateTransitionDuration("Back", "Grind"); // 2 words: (2/225)*60000 + 2000 = 2533ms -> floor to 4000
    expect(durationShort).toBe(4000);
  });

  test('calculateTransitionDuration scales dynamically for long multi-chunk narrative text', () => {
    const longAdvisorMessage = "From your origins as a street kid working as a Delivery Hustler, you have completely rewritten your destiny, PRESIDENT CHASER. Starting out with Delivery Hustler, you went on to make Streetwear Fashion Brand your trademark engine of growth. Turning ideas into massive assets like your Streetwear Fashion Brand and Audio & Record Label, you shifted from a simple worker to an empire builder. You chose patience over shortcuts, quietly building an empire one investment at a time. The city has witnessed your ambition unfold across the years. The newspapers once doubted your vision. When setbacks threatened to bury you, you rose like a phoenix, turning near-ruin into your greatest comeback. Today, Commander-in-Chief PRESIDENT CHASER, backed by a hand-picked cabinet of 5 and your specialized POLITICAL leadership, the national stage is yours.";
    const longQuote = "Only those who will risk going too far can possibly find out how far one can go.";

    const durationLong = calculateTransitionDuration(longAdvisorMessage, longQuote);
    // ~140 words at 225 wpm = ~37s + 2s base = ~39s
    expect(durationLong).toBeGreaterThan(15000);
    expect(durationLong).toBeLessThan(60000);
  });

  test('generateDynamicChapterIntro stacks all 7 narrative chunks for PRESIDENT tier late-game', () => {
    const mockPlayerStats: Partial<PlayerStats> = {
      name: 'CHASER',
      categoryId: 'street_kid',
      variationId: 'sk_delivery',
      month: 120,
      actionLog: [
        { hustleId: 'r_delivery', hustleName: 'Delivery Hustler', timestamp: 1000 }
      ],
      hustlePlays: {
        'sw': 50,
        'r_delivery': 10
      },
      hustleLevels: {
        'sw': 3,
        'audio': 2,
        'saas_mvp': 1
      },
      narrativeFlags: {
        publicReputation: 'The Controversial Tycoon'
      },
      scandalCount: 2,
      arrestCount: 1,
      heat: 60,
      masteredHustles: ['the_phoenix'],
      activeSpecializationId: 'POLITICAL',
      cabinet: {
        vp: { name: 'Alex' },
        secState: { name: 'Morgan' }
      },
      rivals: [
        { id: 'rival1', name: 'Rival One', status: 'ally' }
      ]
    };

    const chapterIntro = generateDynamicChapterIntro(mockPlayerStats as PlayerStats, 'PRESIDENT');

    expect(chapterIntro).toContain('From your origins as a Street Kid');
    expect(chapterIntro).toContain('Delivery Hustler');
    expect(chapterIntro).toContain('Streetwear Fashion Brand');
    expect(chapterIntro).toContain('The newspapers once doubted your vision.');
    expect(chapterIntro).toContain('rose like a phoenix');
    expect(chapterIntro).toContain('Commander-in-Chief CHASER');
    expect(chapterIntro).toContain('specialized POLITICAL leadership');
  });
});
