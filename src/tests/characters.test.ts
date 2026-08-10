import { describe, it, expect } from 'vitest';
import { CHARACTERS } from '../config/characters';
import { NARRATIVE_EVENTS } from '../config/narrativeEvents';

describe('Character Database Expansion', () => {
  it('should have at least 60 characters in the database', () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(60);
  });

  it('should have expanded metadata for all characters', () => {
    CHARACTERS.forEach(char => {
      expect(char.profession).toBeDefined();
      expect(char.speakingStyle).toBeDefined();
      expect(char.moralAlignment).toBeDefined();
      expect(char.preferredIndustries).toBeInstanceOf(Array);
      expect(char.strengths).toBeInstanceOf(Array);
      expect(char.weaknesses).toBeInstanceOf(Array);
      expect(char.relationshipTags).toBeInstanceOf(Array);
    });
  });

  it('should have characters for all gameplay tiers', () => {
    const tiers = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT'];
    const charactersPerTier = tiers.map(tier =>
      CHARACTERS.filter(c => c.firstAppearanceTier === tier).length
    );

    charactersPerTier.forEach((count, index) => {
      expect(count, `Tier ${tiers[index]} should have at least 3 unique characters starting there`).toBeGreaterThanOrEqual(3);
    });
  });

  it('should have narrative events linking to many of the new characters', () => {
    const characterIdsInEvents = new Set(
      NARRATIVE_EVENTS
        .map(e => e.characterId)
        .filter(id => id !== undefined)
    );

    // Check that we've integrated a significant number of new characters into events
    expect(characterIdsInEvents.size).toBeGreaterThanOrEqual(25);
  });

  it('should ensure all character portrait IDs are valid player avatars or registry portraits', () => {
    // Check that it's either a legacy player avatar or one of our 60+ new registry portrait IDs
    CHARACTERS.forEach(char => {
      expect(char.portraitId).toMatch(/^av_[mf][1-4]$|^p_[a-z]+_[0-9]+$/);
    });
  });
});
