export interface DiscoverabilityLink {
  label: string;
  actionFlag: 'open_feed' | 'open_scoreboard';
  scoreboardTab?: 'career' | 'portfolio' | 'history' | 'biography' | 'reputation' | 'ledger';
}

export function scanDialogueForNavigationLinks(text: string): DiscoverabilityLink[] {
  const links: DiscoverabilityLink[] = [];
  const lowerText = text.toLowerCase();

  // 1. Reactions & Public Opinion & Media
  if (
    lowerText.includes('talk') ||
    lowerText.includes('interview') ||
    lowerText.includes('chirp') ||
    lowerText.includes('opinion') ||
    lowerText.includes('reaction') ||
    lowerText.includes('scandal') ||
    lowerText.includes('media') ||
    lowerText.includes('news') ||
    lowerText.includes('public') ||
    lowerText.includes('trend') ||
    lowerText.includes('gossip') ||
    lowerText.includes('tabloid') ||
    lowerText.includes('buzz')
  ) {
    links.push({ label: 'See reactions', actionFlag: 'open_feed' });
  }

  // 2. Rivals & Enemies
  if (
    lowerText.includes('rival') ||
    lowerText.includes('kane') ||
    lowerText.includes('enemy') ||
    lowerText.includes('enemies') ||
    lowerText.includes('competitor') ||
    lowerText.includes('sabotage') ||
    lowerText.includes('victor')
  ) {
    // Open Scoreboard Career Tab which hosts the main stats, or they can view rival actions there
    links.push({ label: 'Open rival board', actionFlag: 'open_scoreboard', scoreboardTab: 'career' });
  }

  // 3. Biography & Journey
  if (
    lowerText.includes('how far') ||
    lowerText.includes('biography') ||
    lowerText.includes('journey') ||
    lowerText.includes('climb') ||
    lowerText.includes('story') ||
    lowerText.includes('narrative') ||
    lowerText.includes('pops') ||
    lowerText.includes('come far') ||
    lowerText.includes('history')
  ) {
    links.push({ label: 'Read biography chapter', actionFlag: 'open_scoreboard', scoreboardTab: 'biography' });
  }

  // 4. Reputation & Clout & Aura
  if (
    lowerText.includes('reputation') ||
    lowerText.includes('clout') ||
    lowerText.includes('aura') ||
    lowerText.includes('perception') ||
    lowerText.includes('influence') ||
    lowerText.includes('respect') ||
    lowerText.includes('scandals') ||
    lowerText.includes('status')
  ) {
    links.push({ label: 'View reputation', actionFlag: 'open_scoreboard', scoreboardTab: 'reputation' });
  }

  // 5. Portfolio & Assets
  if (
    lowerText.includes('investor') ||
    lowerText.includes('acquisition') ||
    lowerText.includes('portfolio') ||
    lowerText.includes('asset') ||
    lowerText.includes('assets') ||
    lowerText.includes('real estate') ||
    lowerText.includes('marcus') ||
    lowerText.includes('property')
  ) {
    links.push({ label: 'View portfolio', actionFlag: 'open_scoreboard', scoreboardTab: 'portfolio' });
  }

  // 6. Ledger & Passive Yields & Capital
  if (
    lowerText.includes('ledger') ||
    lowerText.includes('payout') ||
    lowerText.includes('yield') ||
    lowerText.includes('balance sheet') ||
    lowerText.includes('passive') ||
    lowerText.includes('overhead') ||
    lowerText.includes('capital') ||
    lowerText.includes('empire growth')
  ) {
    links.push({ label: 'View ledger', actionFlag: 'open_scoreboard', scoreboardTab: 'ledger' });
  }

  // Cap at 2 shortcuts to prevent modal UI clutter, ensuring we prioritize unique labels
  const uniqueLinks: DiscoverabilityLink[] = [];
  const uniqueLabels = new Set<string>();

  for (const link of links) {
    if (!uniqueLabels.has(link.label)) {
      uniqueLabels.add(link.label);
      uniqueLinks.push(link);
    }
    if (uniqueLinks.length >= 2) break;
  }

  return uniqueLinks;
}
