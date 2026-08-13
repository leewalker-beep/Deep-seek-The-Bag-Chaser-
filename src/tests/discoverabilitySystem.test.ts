import { describe, it, expect } from 'vitest';
import { scanDialogueForNavigationLinks } from '../utils/discoverabilityUtils';

describe('Character-Guided Discoverability System', () => {
  it('should identify reaction feed links based on keywords', () => {
    const text1 = 'People are talking about you after that interview.';
    const links1 = scanDialogueForNavigationLinks(text1);
    expect(links1).toHaveLength(1);
    expect(links1[0]).toEqual({
      label: 'See reactions',
      actionFlag: 'open_feed'
    });

    const text2 = 'The gossip is spreading on the chirp timeline!';
    const links2 = scanDialogueForNavigationLinks(text2);
    expect(links2[0]).toEqual({
      label: 'See reactions',
      actionFlag: 'open_feed'
    });
  });

  it('should identify rival board links based on competitor keywords', () => {
    const text = 'Victor Kane said you’ve made powerful enemies.';
    const links = scanDialogueForNavigationLinks(text);
    expect(links).toHaveLength(1);
    expect(links[0].label).toBe('Open rival board');
    expect(links[0].actionFlag).toBe('open_scoreboard');
    expect(links[0].scoreboardTab).toBe('career');
  });

  it('should identify biography links for milestones and Pops', () => {
    const text = 'Pops: "I can’t believe how far you’ve come."';
    const links = scanDialogueForNavigationLinks(text);
    expect(links.map(l => l.label)).toContain('Read biography chapter');
    const bioLink = links.find(l => l.label === 'Read biography chapter');
    expect(bioLink?.actionFlag).toBe('open_scoreboard');
    expect(bioLink?.scoreboardTab).toBe('biography');
  });

  it('should identify reputation links for aura, clout and perception', () => {
    const text = 'Your public aura and clout have shifted after that event.';
    const links = scanDialogueForNavigationLinks(text);
    expect(links.map(l => l.label)).toContain('View reputation');
    const repLink = links.find(l => l.label === 'View reputation');
    expect(repLink?.scoreboardTab).toBe('reputation');
  });

  it('should identify portfolio links for real estate and acquisitions', () => {
    const text = 'Marcus: "Investors noticed that real estate asset acquisition."';
    const links = scanDialogueForNavigationLinks(text);
    expect(links.map(l => l.label)).toContain('View portfolio');
    const portLink = links.find(l => l.label === 'View portfolio');
    expect(portLink?.scoreboardTab).toBe('portfolio');
  });

  it('should identify ledger links for passive yields and balance sheets', () => {
    const text = 'Your overhead costs have shifted your passive yields on the ledger.';
    const links = scanDialogueForNavigationLinks(text);
    expect(links.map(l => l.label)).toContain('View ledger');
    const ledgerLink = links.find(l => l.label === 'View ledger');
    expect(ledgerLink?.scoreboardTab).toBe('ledger');
  });

  it('should cap the links to max 2 and prevent duplicates', () => {
    const text = 'gossip, scandal, rival, Pops, clout, real estate';
    const links = scanDialogueForNavigationLinks(text);
    expect(links.length).toBeLessThanOrEqual(2);
    const uniqueLabels = new Set(links.map(l => l.label));
    expect(uniqueLabels.size).toBe(links.length);
  });
});
