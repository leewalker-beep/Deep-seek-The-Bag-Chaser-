import type { PlayerStats, MarketType, Rival } from '../types/game';

export interface AdvisorInsight {
  id: string;
  category:
    | 'Economy'
    | 'Businesses'
    | 'Passive'
    | 'Media'
    | 'Politics'
    | 'Relationships'
    | 'Rivals'
    | 'Heat'
    | 'Aura'
    | 'Clout'
    | 'MentalHealth'
    | 'Stress'
    | 'RealEstate'
    | 'Campaigns'
    | 'Consequences'
    | 'WorldMemory'
    | 'Legacy';
  priority: 'Critical' | 'Important' | 'Opportunity' | 'Information';
  title: string;
  whatIsHappening: string;
  whyItHappened: string;
  recommendation: string;
  confidence: number; // percentage (e.g. 90)
}

export interface StrategicAdvisorOutput {
  whatIsHappening: string;
  whyItHappened: string;
  biggestOpportunity: {
    title: string;
    description: string;
    recommendation: string;
  };
  biggestRisk: {
    title: string;
    description: string;
    recommendation: string;
  };
  insights: AdvisorInsight[];
}

/**
 * Core Strategic Intelligence advisor engine.
 * Derives all recommendations purely from existing simulation state without inventing details.
 */
export function generateStrategicAdvice(
  pl: PlayerStats,
  currentMarket: MarketType
): StrategicAdvisorOutput {
  const insights: AdvisorInsight[] = [];

  // 1. ECONOMY ANALYSIS
  let economyTitle = 'Market Stabilization';
  let economyHappening = 'The economy is currently in a normal, balanced cycle.';
  let economyWhy = 'Supply and demand curves have reached a standard macroeconomic equilibrium.';
  let economyRec = 'Maintain steady operations and look for high-yield expansion options.';
  let economyPriority: 'Critical' | 'Important' | 'Opportunity' | 'Information' = 'Information';
  let economyConf = 90;

  if (currentMarket === 'RECESSION') {
    economyTitle = 'Economic Recession Contraction';
    economyHappening = 'The economy is contracting. Consumer spending and corporate yields are heavily suppressed.';
    economyWhy = 'Standard macroeconomic downward cycle triggered market corrections.';
    economyRec = 'Preserve liquid cash capital and prioritize lower-overhead passive operations. Avoid launching high-cost capital ventures.';
    economyPriority = 'Critical';
    economyConf = 95;
  } else if (currentMarket === 'BULL_MARKET') {
    economyTitle = 'Economic Bull Market expansion';
    economyHappening = 'The economy is expanding. Speculative capital and active consumer yields are significantly elevated.';
    economyWhy = 'Market euphoria and high risk-tolerance cycles are pushing asset values upward.';
    economyRec = 'Leverage high-yield active ventures and secure premium business acquisitions while multipliers are peaked.';
    economyPriority = 'Opportunity';
    economyConf = 95;
  } else if (currentMarket === 'CRACKDOWN') {
    economyTitle = 'Regulatory Compliance Squeeze';
    economyHappening = 'Active audit and compliance monitoring is squeezed. Shady offshore and tech operations face heavy friction.';
    economyWhy = 'Federal regulatory watchdogs are deploying weaponized audits against high-growth, low-compliance sectors.';
    economyRec = 'Pivot towards clean-operating brick-and-mortar or real estate holdings. Cool down extreme Heat profiles.';
    economyPriority = 'Important';
    economyConf = 90;
  }

  // Handle Presidential Macro indicators
  if (pl.currentTier === 'PRESIDENT') {
    economyConf = 98;
    if (pl.inflation > 5.0) {
      insights.push({
        id: 'econ_inflation',
        category: 'Economy',
        priority: 'Critical',
        title: 'Runaway Inflation Spike',
        whatIsHappening: `National inflation has surged to ${pl.inflation.toFixed(1)}%, heavily eroding public purchasing power.`,
        whyItHappened: 'Aggressive stimulus funding or quantitative easing policies have injected surplus liquidity.',
        recommendation: 'Enact tight-money policies, decrease federal spending, or issue stabilizing trade/housing executive orders immediately.',
        confidence: 95,
      });
    }
    if (pl.gdp < 85) {
      insights.push({
        id: 'econ_gdp',
        category: 'Economy',
        priority: 'Important',
        title: 'Declining GDP Growth',
        whatIsHappening: `National GDP is stagnating at ${pl.gdp.toFixed(1)}%, indicating a stalling productive economy.`,
        whyItHappened: 'High interest rates or regulatory friction are discouraging corporate capital expenditures.',
        recommendation: 'Pass infrastructure investments or middle-class tax cuts to revitalize commercial growth.',
        confidence: 90,
      });
    }
  }

  insights.push({
    id: 'economy_main',
    category: 'Economy',
    priority: economyPriority,
    title: economyTitle,
    whatIsHappening: economyHappening,
    whyItHappened: economyWhy,
    recommendation: economyRec,
    confidence: economyConf,
  });

  // 2. BUSINESSES ANALYSIS
  const activeHustleKeys = Object.keys(pl.hustleLevels || {});
  const hasMatchingSpec = pl.activeSpecializationId !== null;
  if (hasMatchingSpec) {
    insights.push({
      id: 'biz_specialization',
      category: 'Businesses',
      priority: 'Opportunity',
      title: 'Active Specialization Synergy',
      whatIsHappening: `Your character specialization (${pl.activeSpecializationId?.toUpperCase()}) is active.`,
      whyItHappened: 'You selected a matching class specialization during the previous tier promotion.',
      recommendation: 'Target matches in your sector to collect a permanent +10% active and passive yield bonus.',
      confidence: 100,
    });
  }
  const passiveCorporateHustles = ['data_monopoly', 'crypto_mining'];
  const activePassiveCorpHustles = activeHustleKeys.filter(h => passiveCorporateHustles.includes(h));
  if (activePassiveCorpHustles.length > 0) {
    insights.push({
      id: 'biz_passive_zero_cost',
      category: 'Businesses',
      priority: 'Information',
      title: 'Zero Monthly Operating Cost models',
      whatIsHappening: `You own passive corporate enterprises: ${activePassiveCorpHustles.map(h => h.replace(/_/g, ' ')).join(', ')}.`,
      whyItHappened: 'These businesses are architected as passive-focused corporate/presidential models.',
      recommendation: 'Execute active operations on these at any time for $0 monthly running cost. Upgrades require up-front setup capital only.',
      confidence: 100,
    });
  }

  // 3. PASSIVE INCOME ANALYSIS
  const basePassiveTotal = pl.lastPassiveBreakdown?.baseTotal || 0;
  const finalPassiveTotal = pl.lastPassiveBreakdown?.finalTotal || 0;
  const passiveSources = pl.lastPassiveBreakdown?.sources || [];

  if (finalPassiveTotal > 0 && passiveSources.length > 0) {
    let maxSource = passiveSources[0];
    passiveSources.forEach(s => {
      if (s.amount > maxSource.amount) maxSource = s;
    });

    const dependencyRatio = maxSource.amount / basePassiveTotal;
    if (dependencyRatio > 0.75 && passiveSources.length > 1) {
      insights.push({
        id: 'passive_dependency_high',
        category: 'Passive',
        priority: 'Important',
        title: 'Single-Source Passive Dependency',
        whatIsHappening: 'You have become too dependent on one income source.',
        whyItHappened: `The passive revenue stream "${maxSource.name}" contributes ${(dependencyRatio * 100).toFixed(0)}% of your base passive income.`,
        recommendation: 'Diversify your passive portfolio by investing in other categories like Vending Machines, Rent Portfolios, or Media holdings.',
        confidence: 90,
      });
    } else if (passiveSources.length === 1) {
      insights.push({
        id: 'passive_dependency_single',
        category: 'Passive',
        priority: 'Important',
        title: 'Fragile Income Foundation',
        whatIsHappening: 'You have become too dependent on one income source.',
        whyItHappened: `Your entire monthly passive income ($${finalPassiveTotal.toLocaleString()}) relies completely on the single asset "${maxSource.name}".`,
        recommendation: 'Acquire alternative passive streams (e.g. Rent Portfolios, Vending Machines, or SaaS MVPs) to buffer against sector-specific recessions.',
        confidence: 95,
      });
    } else if (finalPassiveTotal > 100000) {
      insights.push({
        id: 'passive_strong',
        category: 'Passive',
        priority: 'Opportunity',
        title: 'Strong Passive Earning Power',
        whatIsHappening: `You are pulling in a massive $${finalPassiveTotal.toLocaleString()}/month completely passively.`,
        whyItHappened: 'Your diversified investments across Real Estate, Businesses, or Licensing royalty models are compounding.',
        recommendation: 'Reinvest this monthly cash injection into expanding high-tier assets or funding political influence campaigns.',
        confidence: 95,
      });
    }
  } else {
    insights.push({
      id: 'passive_none',
      category: 'Passive',
      priority: 'Opportunity',
      title: 'Untapped Passive Income channels',
      whatIsHappening: 'Your current monthly passive yield is $0.',
      whyItHappened: 'You have not acquired rent portfolios, vending machines, or high-tier business branches yet.',
      recommendation: 'Acquire your first passive asset, such as a Vending Machine or Rent Portfolio under Labor, to build a steady baseline cash flow.',
      confidence: 95,
    });
  }

  // 4. MEDIA ANALYSIS
  const mediaLevels = [
    { id: 'media_empire', lvl: pl.hustleLevels?.['media_empire'] || 0, name: 'Media Empire' },
    { id: 'film_studio', lvl: pl.hustleLevels?.['film_studio'] || 0, name: 'Film Studio' },
  ];
  const maxMedia = mediaLevels.reduce((max, curr) => (curr.lvl > max.lvl ? curr : max), { id: '', lvl: 0, name: '' });

  if (maxMedia.lvl > 0) {
    insights.push({
      id: 'media_scandal_buffer',
      category: 'Media',
      priority: 'Opportunity',
      title: 'Media Influence Buffers',
      whatIsHappening: `Your ownership of a ${maxMedia.name} is shielding your administration's reputation.`,
      whyItHappened: 'Major media syndicates and film studios control national public relation slates.',
      recommendation: 'You can take riskier political actions; your media assets buffer approval rating penalties and slow Aura decay by 15%.',
      confidence: 100,
    });
  } else if (pl.currentTier === 'PRESIDENT' || pl.campaignStage !== undefined) {
    insights.push({
      id: 'media_lack_politics',
      category: 'Media',
      priority: 'Important',
      title: 'Vulnerable Public Relations Slate',
      whatIsHappening: 'You do not own a major media channel or film studio to buffer news cycles.',
      whyItHappened: 'You chose not to purchase or focus on media holdings during your climb to Mogul.',
      recommendation: 'Acquire a Media Empire or Film Studio in lower tiers to protect against devastating scandal leaks.',
      confidence: 90,
    });
  }

  // 5. POLITICS ANALYSIS
  if (pl.currentTier === 'PRESIDENT') {
    // Audit Cabinet integrity
    const cabinetValues = Object.values(pl.cabinet || {});
    if (cabinetValues.length > 0) {
      const avgIntegrity = cabinetValues.reduce((sum, member) => sum + (member.integrity || 50), 0) / cabinetValues.length;
      if (avgIntegrity < 40) {
        insights.push({
          id: 'politics_integrity_crisis',
          category: 'Politics',
          priority: 'Critical',
          title: 'Cabinet Integrity Collapse',
          whatIsHappening: `Your average cabinet integrity is extremely low (${avgIntegrity.toFixed(1)}/100).`,
          whyItHappened: 'You appointed or retained highly corruptible, high-ambition members to cabinet roles.',
          recommendation: 'Fire corrupt members and recruit high-integrity candidates immediately to prevent catastrophic national presidential scandals.',
          confidence: 95,
        });
      }
    }

    // Congress support
    if (pl.congressSupport < 40) {
      const whyList = [];
      if (pl.inflation > 4.0) whyList.push('rising inflation');
      if (pl.nationalDebt > 80.0) whyList.push('runaway national debt');
      if (pl.heat > 50) whyList.push('past criminal heat profile');
      const whyMsg = whyList.length > 0 ? whyList.join(' and ') : 'unfavorable administration policies';

      insights.push({
        id: 'politics_congress_weak',
        category: 'Politics',
        priority: 'Critical',
        title: 'Congress Support is Falling',
        whatIsHappening: `Your congressional support is critically low at ${pl.congressSupport}%.`,
        whyItHappened: `Congress support is falling because ${whyMsg} is destabilizing bipartisan trust.`,
        recommendation: 'Enact Executive Orders that directly stabilize macroindicators or run PR events to rebuild legislative consensus.',
        confidence: 95,
      });
    } else {
      insights.push({
        id: 'politics_congress_strong',
        category: 'Politics',
        priority: 'Information',
        title: 'Stable Legislative Consensus',
        whatIsHappening: `Congressional support is currently healthy at ${pl.congressSupport}%.`,
        whyItHappened: 'Balanced macroeconomic policies and low scandal counts are preserving bipartisan legislative trust.',
        recommendation: 'Capitalize on this window to sign major structural executive orders like Universal Healthcare or Financial Deregulation.',
        confidence: 90,
      });
    }
  }

  // 6. RELATIONSHIPS ANALYSIS
  const acquaintances = pl.npcs || [];
  const highDispAlly = acquaintances.find(n => n.disposition > 60);
  const hostileAcquaintance = acquaintances.find(n => n.disposition < -40);

  if (highDispAlly) {
    insights.push({
      id: 'relations_ally',
      category: 'Relationships',
      priority: 'Opportunity',
      title: 'High-Disposition Political Ally',
      whatIsHappening: `Your acquaintance "${highDispAlly.name}" has exceptionally high disposition (${highDispAlly.disposition.toFixed(0)}).`,
      whyItHappened: 'You supported or helped them during previous narrative choices or simulated interactions.',
      recommendation: `Appoint ${highDispAlly.name} to a key cabinet role to secure an automatic +30 starting loyalty bonus.`,
      confidence: 95,
    });
  }

  if (hostileAcquaintance) {
    insights.push({
      id: 'relations_hostile',
      category: 'Relationships',
      priority: 'Important',
      title: 'Hostile Acquaintance Backlash',
      whatIsHappening: `"${hostileAcquaintance.name}" is highly antagonistic towards your rise (disposition: ${hostileAcquaintance.disposition.toFixed(0)}).`,
      whyItHappened: 'Past business sabotages or hostile narrative choices permanently alienated them.',
      recommendation: `Be prepared for smear campaigns or cabinet sabotage. Avoid appointing them, or fire them (which carries a heavy -40 loyalty penalty).`,
      confidence: 90,
    });
  }

  // 7. RIVALS ANALYSIS
  const rivals = pl.rivals || [];
  const activeBidRival = rivals.find(r => r.currentBid > 0);
  let dominantRival: Rival | null = null;
  rivals.forEach(r => {
    if (r.netWorth > pl.bag && (!dominantRival || r.netWorth > dominantRival.netWorth)) {
      dominantRival = r;
    }
  });

  if (activeBidRival) {
    insights.push({
      id: 'rival_aggressive_bid',
      category: 'Rivals',
      priority: 'Critical',
      title: 'Aggressive Rival Market Bid',
      whatIsHappening: `The rival "${activeBidRival.name}" has launched an aggressive bid of $${activeBidRival.currentBid.toLocaleString()} in your sector!`,
      whyItHappened: 'Past competitive friction or aggressive personality metrics triggered hostile bidding behaviors.',
      recommendation: 'Execute a Counter-Bid immediately on the Leaderboard to protect your local holdings, or prepare for margin contractions.',
      confidence: 95,
    });
  }

  if (dominantRival) {
    const dr = dominantRival as unknown as Rival;
    const specialty = dr.specialty || dr.preferredIndustries?.[0] || 'Finance';
    insights.push({
      id: 'rival_dominant_wealth',
      category: 'Rivals',
      priority: 'Important',
      title: 'Rival Dominance Escalating',
      whatIsHappening: `"${dr.name}" is becoming dominant in ${specialty}.`,
      whyItHappened: `Their net worth has escalated to $${dr.netWorth.toLocaleString()}, eclipsing your current liquid bag.`,
      recommendation: 'Coordinate a targeted Sabotage attack on the Leaderboard, or out-buy assets to suppress their monthly passive overhead capitalization.',
      confidence: 90,
    });
  }

  // 8. HEAT ANALYSIS
  if (pl.heat > 70) {
    insights.push({
      id: 'heat_critical',
      category: 'Heat',
      priority: 'Critical',
      title: 'Extreme Law Scrutiny Profile',
      whatIsHappening: `Your criminal Heat profile is critically high at ${pl.heat}%.`,
      whyItHappened: 'Running multiple high-heat active gigs or failing stealth compliance checks.',
      recommendation: 'Run "Ghost Mode" or stealth operations immediately to cool down Heat. High stress triggers careless mistakes and surges Heat +10.',
      confidence: 95,
    });
  } else if (pl.heat > 40) {
    insights.push({
      id: 'heat_important',
      category: 'Heat',
      priority: 'Important',
      title: 'Elevated Compliance Review',
      whatIsHappening: `Your Heat is elevated at ${pl.heat}%. Watchdogs are preparing corporate holdings audits.`,
      whyItHappened: 'Moderate active heat accumulation has begun triggering regulatory compliance radar.',
      recommendation: 'Incorporate low-heat active contracts or rests. Keep Heat below 70% to avoid police raid risks.',
      confidence: 90,
    });
  }

  // 9. AURA ANALYSIS
  if (pl.aura < 20) {
    insights.push({
      id: 'aura_critical',
      category: 'Aura',
      priority: 'Important',
      title: 'Severely Depleted Public Aura',
      whatIsHappening: `Your Aura is critically depleted at ${pl.aura.toFixed(0)}.`,
      whyItHappened: 'Incarceration, failing high-stakes challenges, or executing highly unethical corporate decisions.',
      recommendation: 'Run public relations campaigns, secure high-aura flex assets, or engage in philanthropy. Low Aura decays cabinet member loyalty -3/month.',
      confidence: 95,
    });
  } else if (pl.aura > 60) {
    insights.push({
      id: 'aura_strong',
      category: 'Aura',
      priority: 'Opportunity',
      title: 'Resounding Public Aura',
      whatIsHappening: `Your public Aura is commanding (${pl.aura.toFixed(0)}).`,
      whyItHappened: 'Major philanthropy contributions, flawless minigame executions, or charismatic public statements.',
      recommendation: 'Leverage this: high player Aura automatically triggers +2 cabinet member loyalty monthly growth.',
      confidence: 95,
    });
  }

  // 10. CLOUT ANALYSIS
  if (pl.clout > 800) {
    insights.push({
      id: 'clout_campaign_discount',
      category: 'Clout',
      priority: 'Opportunity',
      title: 'Massive Campaign Clout Leverage',
      whatIsHappening: `Your national Clout has peaked at ${Math.floor(pl.clout)}.`,
      whyItHappened: 'Extensive media channel investments, album releases, or strategic PR campaigns.',
      recommendation: 'Launch or scale your presidential campaign trail now. High player Clout reduces campaign costs by up to 25%.',
      confidence: 100,
    });
  } else if (pl.clout < 50 && (pl.currentTier === 'CORPORATE' || pl.currentTier === 'ELITE' || pl.currentTier === 'MOGUL')) {
    insights.push({
      id: 'clout_weak_high_tier',
      category: 'Clout',
      priority: 'Important',
      title: 'Stagnant Clout in High Tiers',
      whatIsHappening: `Your current Clout is only ${Math.floor(pl.clout)}.`,
      whyItHappened: 'Failing to execute high-ticket media campaigns, or neglecting publicity channels.',
      recommendation: 'Run PR Campaigns or SMM Gigs. High Clout is mandatory to unlock advanced tier promotions.',
      confidence: 95,
    });
  }

  // 11. MENTAL HEALTH ANALYSIS
  if (pl.mentalHealth < 50) {
    const yieldPenalty = Math.round((50 - pl.mentalHealth) * 0.5);
    insights.push({
      id: 'mental_health_penalty',
      category: 'MentalHealth',
      priority: 'Critical',
      title: 'Severe Mental Exhaustion',
      whatIsHappening: `Your mental health has dropped to ${pl.mentalHealth}%. All active yields are penalized.`,
      whyItHappened: 'Over-grinding high-exhaustion contracts without taking restorative breaks.',
      recommendation: `Run "Rest & Recover" or therapeutic/wellness minigames immediately. Your yields are currently cut by ${Math.min(25, yieldPenalty)}%.`,
      confidence: 100,
    });
  }

  // 12. STRESS ANALYSIS
  const isHighStress = pl.mentalHealth < 30 && pl.heat > 60;
  if (isHighStress) {
    insights.push({
      id: 'stress_careless_mistakes',
      category: 'Stress',
      priority: 'Critical',
      title: 'Extreme Operational Stress',
      whatIsHappening: 'Your character is under critical operational stress.',
      whyItHappened: 'Your mental health is depleted (< 30%) and law enforcement Heat is extreme (> 60%).',
      recommendation: 'You risk triggering "Careless Mistakes" (direct financial losses and +10 Heat) on standard actions. Take therapeutic rest immediately.',
      confidence: 95,
    });
  }

  // 13. REAL ESTATE ANALYSIS
  const isLandlordEmpire = (pl.rentPortfolioCount || 0) >= 5 || (pl.rentalCount || 0) >= 3;
  const isHousingCrisisActive = pl.consequences?.some(c => c.source === 'housing_affordability_crisis' && c.status === 'active');

  if (isHousingCrisisActive) {
    insights.push({
      id: 'real_estate_crisis_active',
      category: 'RealEstate',
      priority: 'Critical',
      title: 'Housing Affordability Crisis',
      whatIsHappening: 'Your housing empire is creating political pressure.',
      whyItHappened: 'Widespread property monopolization has triggered severe tenant backlash and rental caps.',
      recommendation: 'Your rent yields are currently docked by 30%. Consider lobbying or passing the Affordable Housing Act.',
      confidence: 95,
    });
  } else if (isLandlordEmpire) {
    insights.push({
      id: 'real_estate_crisis_impending',
      category: 'RealEstate',
      priority: 'Important',
      title: 'Impending Affordable Housing Crisis',
      whatIsHappening: 'Your rapid real estate acquisitions are drawing city legislative scrutiny.',
      whyItHappened: 'Acquiring multiple properties decreased municipal housing affordability.',
      recommendation: 'Tenant unions are preparing city-wide strikes. Balance your portfolio or brace for rental caps.',
      confidence: 90,
    });
  }

  // 14. CAMPAIGNS ANALYSIS
  if (pl.campaignStage !== undefined && pl.campaignStage > 0 && pl.campaignStage < 8) {
    insights.push({
      id: 'campaign_active_trail',
      category: 'Campaigns',
      priority: 'Important',
      title: 'Active Presidential Campaign',
      whatIsHappening: `You are currently on Stage ${pl.campaignStage}/7 of the presidential campaign trail.`,
      whyItHappened: 'You launched a campaign under the president_campaign hustle.',
      recommendation: 'Focus on regional voter demographics, raise federal fundraising PACs, and select high-influence VP runners.',
      confidence: 95,
    });
  }

  // 15. DYNAMIC CONSEQUENCES ANALYSIS
  const activeCons = pl.consequences?.filter(c => c.status === 'active') || [];
  const pendingCons = pl.consequences?.filter(c => c.status === 'pending') || [];

  activeCons.forEach(c => {
    const isPositive = c.source.includes('halo') || c.source.includes('burnout');
    insights.push({
      id: `consequence_active_${c.source}`,
      category: 'Consequences',
      priority: isPositive ? 'Opportunity' : 'Critical',
      title: `Consequence Active: ${c.triggerCondition}`,
      whatIsHappening: `"${c.description}" is in full active effect.`,
      whyItHappened: 'Triggered naturally by past player stats, choices, or high-stakes actions.',
      recommendation: `This consequence expires in ${c.expiry} months. Plan your cash execution loops around its active multipliers.`,
      confidence: 100,
    });
  });

  pendingCons.forEach(c => {
    insights.push({
      id: `consequence_pending_${c.source}`,
      category: 'Consequences',
      priority: 'Important',
      title: `Impending Consequence: ${c.triggerCondition}`,
      whatIsHappening: `"${c.description}" is scheduled to activate soon.`,
      whyItHappened: `Accumulation of triggering state actions. Starts in ${c.delay} months.`,
      recommendation: 'Prepare operational buffers or complete narrative events to mitigate or resolve the impending impact.',
      confidence: 100,
    });
  });

  // 16. WORLD MEMORY ANALYSIS
  const lastMilestone = pl.milestones?.length > 0 ? pl.milestones[pl.milestones.length - 1] : null;
  if (lastMilestone) {
    insights.push({
      id: 'world_memory_milestone',
      category: 'WorldMemory',
      priority: 'Information',
      title: 'Recent Historic Milestone',
      whatIsHappening: `The public remembers your achievement: "${lastMilestone.name}".`,
      whyItHappened: `Achieved at Month ${lastMilestone.achievedAtMonth} in ${lastMilestone.tier} tier.`,
      recommendation: `This milestone contributes to your final biography log, locking in permanent Legacy Point conversion values.`,
      confidence: 100,
    });
  }

  // 17. LEGACY ANALYSIS
  const legacyPt = pl.legacyPoints || 0;
  if (legacyPt > 0) {
    insights.push({
      id: 'legacy_points_shop',
      category: 'Legacy',
      priority: 'Opportunity',
      title: 'Accumulated Meta Legacy Points',
      whatIsHappening: `You have accumulated ${legacyPt} Legacy Points in this lifetime.`,
      whyItHappened: 'Completing high-value active goals, mastering multiple hustles, or advancing across progression tiers.',
      recommendation: 'These points will convert into purchasable meta upgrades (like permanent multipliers) inside the Legacy Shop upon retirement.',
      confidence: 100,
    });
  }

  // --- AMBITIONS ADVISOR RECOGNITION ---
  const ambitions = pl.ambitions || [];
  const activeAmb = ambitions.filter(a => a.status === 'ACTIVE');
  const completedAmb = ambitions.filter(a => a.status === 'COMPLETED');

  if (activeAmb.length > 0) {
    activeAmb.forEach(amb => {
      insights.push({
        id: `advisor_ambition_active_${amb.id}`,
        category: 'Legacy',
        priority: 'Opportunity',
        title: `Active Pursuit: ${amb.title}`,
        whatIsHappening: `Your character is actively chasing the grand life ambition: "${amb.title}".`,
        whyItHappened: `You accepted this ambition from your strategic advisor console.`,
        recommendation: `Focus on progress: ${amb.progressText}. Completing it unlocks profound narrative legacy rewards and unique biographies.`,
        confidence: 100,
      });
    });
  }

  if (completedAmb.length > 0) {
    completedAmb.forEach(amb => {
      insights.push({
        id: `advisor_ambition_completed_${amb.id}`,
        category: 'Legacy',
        priority: 'Information',
        title: `Historic Achievement: ${amb.title}`,
        whatIsHappening: `You have successfully completed "${amb.title}"!`,
        whyItHappened: `You fulfilled the dynamic progression thresholds and locked in permanent recognition.`,
        recommendation: `This historical landmark continues to inspire persistent NPCs and fuel your permanent Hall of Fame biography rating.`,
        confidence: 100,
      });
    });
  }

  // --- DERIVE SUMMARIES AND KEY INSIGHTS ---
  // Prioritize list: Critical, then Important, then Opportunity, then Information
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityMap = { Critical: 1, Important: 2, Opportunity: 3, Information: 4 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });

  // Derive "What is happening" / "Why it happened" summaries from top active items
  let summaryHappening = 'You are currently growing your enterprise across standard parameters.';
  let summaryWhy = 'The current macroeconomic cycle is stable and operations are running smoothly.';

  const topCritical = sortedInsights.find(i => i.priority === 'Critical');
  const topImportant = sortedInsights.find(i => i.priority === 'Important');

  if (topCritical) {
    summaryHappening = topCritical.whatIsHappening;
    summaryWhy = topCritical.whyItHappened;
  } else if (topImportant) {
    summaryHappening = topImportant.whatIsHappening;
    summaryWhy = topImportant.whyItHappened;
  } else if (currentMarket === 'RECESSION') {
    summaryHappening = 'The economy is contracting. Consumer spending and corporate yields are heavily suppressed.';
    summaryWhy = 'Standard macroeconomic downward cycle triggered market corrections.';
  }

  // Derive Biggest Opportunity
  const topOpportunity = sortedInsights.find(i => i.priority === 'Opportunity') || {
    title: 'Diversify Enterprise',
    whatIsHappening: 'You are well-positioned for balanced scaling.',
    recommendation: 'Acquire new passive assets or upgrade active hustle branches to expand your empire.',
  };
  const biggestOpportunity = {
    title: topOpportunity.title,
    description: topOpportunity.whatIsHappening,
    recommendation: topOpportunity.recommendation,
  };

  // Derive Biggest Risk
  const topRisk = sortedInsights.find(i => i.priority === 'Critical' || i.priority === 'Important') || {
    title: 'Frictionless Horizon',
    whatIsHappening: 'No critical threats are currently flagged on compliance radars.',
    recommendation: 'Proceed with aggressive capital operations while buffers are secure.',
  };
  const biggestRisk = {
    title: topRisk.title,
    description: topRisk.whatIsHappening,
    recommendation: topRisk.recommendation,
  };

  return {
    whatIsHappening: summaryHappening,
    whyItHappened: summaryWhy,
    biggestOpportunity,
    biggestRisk,
    insights: sortedInsights,
  };
}
