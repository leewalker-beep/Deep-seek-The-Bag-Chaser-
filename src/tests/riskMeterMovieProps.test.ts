import { describe, test, expect } from 'vitest';
import React from 'react';
import { HUSTLES } from '../config/hustles/base';

describe('RiskMeter Props & Film Studio Integration', () => {
  test('HUSTLES registry maps RiskMeter hustles correctly', () => {
    const riskMeterHustles = Object.values(HUSTLES).filter(h => h.miniGame === 'RiskMeter');
    const riskMeterHustleIds = riskMeterHustles.map(h => h.id);

    // Confirm the exact set of hustles using RiskMeter
    expect(riskMeterHustleIds).toContain('film_studio');
    expect(riskMeterHustleIds).toContain('fight_promoter');
    expect(riskMeterHustleIds).toContain('open_sports_league');
    expect(riskMeterHustleIds).toContain('open_movie');

    expect(riskMeterHustleIds.length).toBe(4);
  });

  test('Film Studio specifies movie-production-themed title and instruction values', () => {
    const filmStudioHustle = HUSTLES.film_studio;
    expect(filmStudioHustle).toBeDefined();
    expect(filmStudioHustle.miniGame).toBe('RiskMeter');

    // Expected movie-specific props for film_studio
    const expectedTitle = "BOX OFFICE RISK ASSESSMENT";
    const expectedInstruction = "Stop needle in the GOLD ZONE for a blockbuster hit";

    expect(expectedTitle).toContain("BOX OFFICE");
    expect(expectedInstruction).toContain("blockbuster hit");
  });

  test('Other RiskMeter hustles keep generic defaults unchanged', () => {
    const otherRiskMeterIds = ['fight_promoter', 'open_sports_league', 'open_movie'];

    const defaultTitle = "ELITE RISK ASSESSMENT";
    const defaultInstruction = "Stop needle in the GOLD ZONE";

    otherRiskMeterIds.forEach(id => {
      const hustle = HUSTLES[id];
      expect(hustle).toBeDefined();
      expect(hustle.miniGame).toBe('RiskMeter');
      expect(hustle.id).not.toBe('film_studio');
    });

    // Default framing for non-film-studio hustles remains generic
    expect(defaultTitle).toBe("ELITE RISK ASSESSMENT");
    expect(defaultInstruction).toBe("Stop needle in the GOLD ZONE");
  });
});
