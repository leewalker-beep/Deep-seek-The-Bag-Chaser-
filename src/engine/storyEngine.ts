import type { PlayerStats, TickerMessage, WorldFeedItem, MarketType } from '../types/game';

const generateId = () => Math.random().toString(36).substring(7);

/**
 * Pure observer module that monitors the simulation state (Businesses, Rivals, Living Economy,
 * Dynamic Consequences, Politics, Presidency, Media, Relationships, Crime, Heat, Aura, Clout,
 * Legacy, Real Estate, Passive Income) and generates contextual narrative, dynamic story headlines,
 * and an expanded Monthly Summary.
 */

export function generateDynamicStoryNews(pl: PlayerStats): TickerMessage[] {
  const stories: TickerMessage[] = [];
  const pName = pl.name || 'You';

  // 1. Tech Investor Observation
  const hasTechFocus =
    (pl.flexAssets && (pl.flexAssets['tech_conglomerate'] || 0) > 0) ||
    pl.activeSpecializationId?.toLowerCase().includes('tech') ||
    pl.hustleLevels['data_monopoly'] !== undefined ||
    pl.hustleLevels['crypto_mining'] !== undefined ||
    (pl.vcSector === 'tech' && pl.vcInvestment > 0);

  if (hasTechFocus) {
    stories.push({
      text: `📰 ${pName} has quietly become the largest technology investor in the country.`,
      colorClass: 'text-blue-400 font-bold',
      tier: pl.currentTier,
    });
  } else {
    // Check if any rival has a tech specialty
    const techRival = pl.rivals?.find(r => r.specialty?.toLowerCase().includes('tech') || r.preferredIndustries?.includes('tech'));
    if (techRival) {
      stories.push({
        text: `📰 ${techRival.name} has quietly become the largest technology investor in the country.`,
        colorClass: 'text-blue-400',
        tier: pl.currentTier,
      });
    }
  }

  // 2. Housing Market Pressure
  const highProperties = (pl.rentalCount || 0) > 5 || (pl.rentPortfolioCount || 0) > 5;
  if (highProperties || pl.marketCycle?.realEstate === 'boom') {
    stories.push({
      text: `📰 The housing market is under pressure after years of rapid expansion.`,
      colorClass: 'text-orange-400',
      tier: pl.currentTier,
    });
  }

  // 3. Public Confidence vs GDP
  const isPresident = pl.currentTier === 'PRESIDENT';
  if (isPresident && pl.gdp > 110 && pl.approvalRating < 45) {
    stories.push({
      text: `📰 Public confidence is falling despite record GDP.`,
      colorClass: 'text-red-400 font-bold',
      tier: pl.currentTier,
    });
  }

  // 4. Media Empire Influence
  const hasMediaEmpire =
    (pl.hustleLevels && pl.hustleLevels['media_empire'] !== undefined) ||
    (pl.hustleLevels && pl.hustleLevels['film_studio'] !== undefined) ||
    pl.activeSpecializationId?.toLowerCase().includes('media');

  if (hasMediaEmpire && pl.clout > 2500) {
    stories.push({
      text: `📰 Your media empire has become more influential than several political parties.`,
      colorClass: 'text-purple-400 font-extrabold',
      tier: pl.currentTier,
    });
  }

  // 5. Prison Sentence Public Trust
  if (pl.arrestCount && pl.arrestCount > 0 && isPresident) {
    stories.push({
      text: `📰 Your past prison sentence still affects public trust twenty years later.`,
      colorClass: 'text-red-500 font-bold',
      tier: pl.currentTier,
    });
  }

  // 6. Extra contextual observers
  if (pl.heat > 85 && pl.clout > 3000) {
    stories.push({
      text: `📰 Elite circles continue to overlook ${pName}'s escalating criminal heat due to overwhelming clout.`,
      colorClass: 'text-amber-500 italic',
      tier: pl.currentTier,
    });
  }

  if (pl.mentalHealth < 35 && pl.bag > 10000000) {
    stories.push({
      text: `📰 Trapped in gold: Insiders report ${pName}'s extreme wealth builds up while mental stability hangs by a thread.`,
      colorClass: 'text-rose-400',
      tier: pl.currentTier,
    });
  }

  return stories;
}

export function generateHistoricalStories(pl: PlayerStats): TickerMessage[] {
  const stories: TickerMessage[] = [];

  // Occasional Historical Story Reference based on older choices / milestones
  if (pl.month > 36 && pl.activeSentiment?.category === 'MARKET') {
    stories.push({
      text: `📰 The Financial Bubble created three years ago continues to affect investment.`,
      colorClass: 'text-slate-400 italic',
      tier: pl.currentTier,
    });
  }

  // Healthcare Reform Debate
  if (pl.currentTier === 'PRESIDENT' && pl.presidentialDiary) {
    const passedHealthcare = pl.presidentialDiary.some(
      d => d.event.toLowerCase().includes('healthcare') || d.outcome.toLowerCase().includes('healthcare')
    );
    if (passedHealthcare) {
      stories.push({
        text: `📰 Citizens still debate your Healthcare Reform.`,
        colorClass: 'text-indigo-400',
        tier: pl.currentTier,
      });
    }
  }

  // Rival Media Expansion
  if (pl.rivals && pl.rivals.length > 0) {
    const mediaRival = pl.rivals.find(
      r => r.preferredIndustries?.includes('media') || r.preferredIndustries?.includes('entertainment') || r.specialty?.toLowerCase().includes('media')
    );
    if (mediaRival && mediaRival.netWorth > 5000000) {
      stories.push({
        text: `📰 ${mediaRival.name}'s media expansion continues to reshape public opinion.`,
        colorClass: 'text-slate-400',
        tier: pl.currentTier,
      });
    }
  }

  return stories;
}

export function generateMonthlySummaryItem(
  pl: PlayerStats,
  passiveIncome: number,
  totalRent: number,
  currentMarket: MarketType
): WorldFeedItem {
  const month = pl.month;

  // 1. Biggest Success
  let biggestSuccess = 'Steady portfolio retention';
  const lastAction = pl.actionLog?.[0];
  if (lastAction) {
    if (lastAction.success) {
      if (lastAction.netCash > 0) {
        biggestSuccess = `Highly lucrative run on ${lastAction.hustleName} (+$${lastAction.netCash.toLocaleString()})`;
      } else if (lastAction.yieldClout > 0) {
        biggestSuccess = `Significant clout boost from ${lastAction.hustleName} (+${lastAction.yieldClout} Clout)`;
      } else {
        biggestSuccess = `Disruption of sector competitors via ${lastAction.hustleName}`;
      }
    }
  } else if (passiveIncome > totalRent) {
    biggestSuccess = `Passive cash flow yield (+$${(passiveIncome - totalRent).toLocaleString()})`;
  }

  // 2. Biggest Problem
  let biggestProblem = 'None detected';
  if (pl.mentalHealth < 40) {
    biggestProblem = `Severe exhaustion risk (Mental Health at ${Math.floor(pl.mentalHealth)}%)`;
  } else if (pl.heat > 75) {
    biggestProblem = `Aggressive federal investigation pending (Heat at ${Math.floor(pl.heat)}%)`;
  } else if (pl.inJail || pl.isIncarcerated) {
    biggestProblem = `Incarcerated in federal isolation lockup (${pl.jailMonthsRemaining}m left)`;
  } else if (totalRent > pl.bag * 0.4) {
    biggestProblem = `Stifling operational overhead: Rent is $${totalRent.toLocaleString()}`;
  } else if (pl.consequences && pl.consequences.some(c => c.status === 'active' && c.severity === 'severe')) {
    const activeCon = pl.consequences.find(c => c.status === 'active' && c.severity === 'severe');
    biggestProblem = `Active bottleneck: ${activeCon?.description}`;
  } else if (pl.currentTier === 'PRESIDENT' && pl.approvalRating < 45) {
    biggestProblem = `Low public trust crisis (Presidential Approval at ${Math.floor(pl.approvalRating)}%)`;
  } else if (lastAction && !lastAction.success) {
    biggestProblem = `Complete operational failure during ${lastAction.hustleName}`;
  }

  // 3. Most Important World Event
  let mostImportantEvent = `Standard market operations (${currentMarket})`;
  if (pl.activeWorldEvent) {
    mostImportantEvent = `Global Crisis: Event ${pl.activeWorldEvent.eventId} is active`;
  } else if (pl.activeSentiment) {
    mostImportantEvent = `Public Hype Cycle: ${pl.activeSentiment.label}`;
  } else if (currentMarket === 'RECESSION') {
    mostImportantEvent = 'Severe Macroeconomic Recession Cycle';
  } else if (currentMarket === 'BULL_MARKET') {
    mostImportantEvent = 'Unprecedented National Stock Bull Market';
  }

  // 4. Fastest Growing Rival
  let growingRival = 'None active';
  if (pl.rivals && pl.rivals.length > 0) {
    const sortedRivals = [...pl.rivals].sort((a, b) => b.netWorth - a.netWorth);
    const topRival = sortedRivals[0];
    growingRival = `${topRival.name} (Net Worth: $${topRival.netWorth.toLocaleString()})`;
  }

  // 5. Strongest Economic Sector
  let strongestSector = 'Technology';
  if (pl.marketCycle?.realEstate === 'boom') {
    strongestSector = 'Real Estate (Booming)';
  } else if (pl.marketCycle?.vc && Object.values(pl.marketCycle.vc).includes('boom')) {
    const boomSect = Object.keys(pl.marketCycle.vc).find(k => pl.marketCycle.vc[k] === 'boom');
    strongestSector = `Venture Capital (${boomSect?.toUpperCase()})`;
  } else if (currentMarket === 'BULL_MARKET') {
    strongestSector = 'Financial Markets & Equity';
  }

  // 6. Weakest Sector
  let weakestSector = 'Services';
  if (pl.marketCycle?.realEstate === 'bust') {
    weakestSector = 'Real Estate (Bust)';
  } else if (pl.marketCycle?.vc && Object.values(pl.marketCycle.vc).includes('bust')) {
    const bustSect = Object.keys(pl.marketCycle.vc).find(k => pl.marketCycle.vc[k] === 'bust');
    weakestSector = `Venture Capital (${bustSect?.toUpperCase()})`;
  } else if (currentMarket === 'RECESSION') {
    weakestSector = 'Consumer Discretionary & Retail';
  } else if (currentMarket === 'CRACKDOWN') {
    weakestSector = 'Unregulated Digital Currencies';
  }

  // 7. Biggest Financial Change
  const totalChange = (pl.actionLog && pl.actionLog[0]) ? pl.actionLog[0].netCash : (passiveIncome - totalRent);
  const financialChangeSign = totalChange >= 0 ? '+' : '';
  const biggestFinancialChange = `${financialChangeSign}$${totalChange.toLocaleString()} net change in liquid reserves`;

  // 8. Key Recommendation
  let recommendation = 'Seek opportunities to advance to the next progression tier.';
  if (pl.mentalHealth < 50) {
    recommendation = 'CRITICAL: Take therapeutic rest via the Sleep hustle or Wellness retreat to avoid total collapse.';
  } else if (pl.heat > 60) {
    recommendation = 'LOWER PROFILE: Cease high-heat activities and invest in PR/lobbying to clear criminal investigations.';
  } else if (pl.bag < totalRent * 2.5) {
    recommendation = 'LIQUIDITY CRUNCH: Avoid high up-front costs. Focus on high-profit-margin ventures like vintage flips or gig jobs.';
  } else if (pl.currentTier === 'PRESIDENT') {
    if (pl.approvalRating < 55) {
      recommendation = 'PUBLIC RELATIONS: Pass popular Executive Orders or address cabinet alignment to recover national approval.';
    } else {
      recommendation = 'GOVERNMENT DIRECTIVES: Balance national debt, manage inflation, and complete presidential activities.';
    }
  } else if (pl.clout < 50) {
    recommendation = 'CLOUT DEFICIT: Run marketing campaigns or launch public-facing media products to build your brand.';
  } else if (pl.aura < 50) {
    recommendation = 'REPUTATION DAMAGE: Establish charitable philanthropy foundations or resolve public conflicts to salvage your Aura.';
  }

  // Construct full detailed multiline text
  const bodyText = `• Biggest success: ${biggestSuccess}
• Biggest problem: ${biggestProblem}
• Most important world event: ${mostImportantEvent}
• Fastest growing rival: ${growingRival}
• Strongest economic sector: ${strongestSector}
• Weakest sector: ${weakestSector}
• Biggest financial change: ${biggestFinancialChange}
• Key recommendation: ${recommendation}`;

  return {
    id: generateId(),
    category: 'NEWS',
    text: `📅 MONTH ${month} SIMULATION REPORT:\n${bodyText}`,
    source: 'Central Simulation Monitor',
    timestamp: Date.now(),
    month,
    pinned: true,
  };
}
