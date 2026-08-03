import type { Rival, PlayerStats, MarketType } from '../types/game';
import { isConsequenceActive } from './consequenceEngine';

// Helper to pick a random item from an array
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export interface RivalSimResult {
  updatedRivals: Rival[];
  news: string[];
  playerStatsUpdates: Partial<PlayerStats>;
}

// Map help costs and properties according to player economy rules
const RIVAL_OP_OVERHEAD_RATE = 0.02; // Monthly maintenance rate (2% of net worth) to prevent runaway snowballing

export function getRivalMemories(pl: PlayerStats, rivalName: string): {
  sabotaged: boolean;
  helped: boolean;
  counterBid: boolean;
  retaliated: boolean;
  betrayed: boolean;
  rescued: boolean;
  liquidated: boolean;
  humiliated: boolean;
  earliestInteractionMonth?: number;
  earliestInteractionTier?: string;
  earliestInteractionYearsPassed?: number;
} {
  const history = pl.history || [];
  const rivalEvents = history.filter(h => h.participants?.includes(rivalName));

  const sabotaged = rivalEvents.some(e => e.id.includes('sabotage_success') || e.id === 'first_sabotage');
  const helped = rivalEvents.some(e => e.id.includes('help') || e.id === 'first_partnership' || e.id.includes('partnership_gift') || e.id.includes('recruit'));
  const counterBid = rivalEvents.some(e => e.id.includes('counter_bid'));
  const retaliated = rivalEvents.some(e => e.id.includes('retaliation'));

  // Betrayed means we previously helped them, but then sabotaged them!
  const helpedMonth = rivalEvents.find(e => e.id.includes('help') || e.id === 'first_partnership')?.month;
  const sabotagedMonth = rivalEvents.find(e => e.id.includes('sabotage_success') || e.id === 'first_sabotage')?.month;
  const betrayed = helpedMonth !== undefined && sabotagedMonth !== undefined && sabotagedMonth > helpedMonth;

  // rescued: if helped them when they were weak, or if they are recruited as allies
  const matchingRival = pl.rivals?.find(r => r.name === rivalName);
  const rescued = helped || (matchingRival && (matchingRival.helpedCount || 0) >= 2) || (matchingRival?.status === 'ally');

  // liquidated: if they had to close a business or sell property due to capital crunch
  const liquidated = rivalEvents.some(e => e.id.includes('liquidation') || e.id.includes('business_close') || e.id.includes('dismiss'));

  // humiliated: multiple sabotages or extremely low relationship with high sabotaged count
  const humiliated = (matchingRival && (matchingRival.sabotagedCount || 0) >= 3) || (matchingRival && (matchingRival.relationshipWithPlayer || 0) < -50);

  let earliestInteractionMonth: number | undefined = undefined;
  let earliestInteractionTier: string | undefined = undefined;
  let earliestInteractionYearsPassed: number | undefined = undefined;

  if (rivalEvents.length > 0) {
    earliestInteractionMonth = Math.min(...rivalEvents.map(e => e.month));
    const m = earliestInteractionMonth;
    earliestInteractionYearsPassed = Math.floor((pl.month - m) / 12);
    if (m < 12) earliestInteractionTier = "MUD";
    else if (m < 24) earliestInteractionTier = "STREET";
    else if (m < 48) earliestInteractionTier = "STARTUP";
    else if (m < 72) earliestInteractionTier = "CORPORATE";
    else if (m < 96) earliestInteractionTier = "ELITE";
    else earliestInteractionTier = "MOGUL";
  }

  return {
    sabotaged,
    helped,
    counterBid,
    retaliated,
    betrayed,
    rescued,
    liquidated,
    humiliated,
    earliestInteractionMonth,
    earliestInteractionTier,
    earliestInteractionYearsPassed
  };
}

export const simulateRivals = (
  pl: PlayerStats,
  currentMarket: MarketType
): RivalSimResult => {
  const news: string[] = [];
  const playerStatsUpdates: Partial<PlayerStats> = {};
  const reputation = pl.narrativeFlags?.publicReputation as string || "The Hustler";

  const updatedRivals = pl.rivals.map(rival => {
    // Re-initialize default personality traits just in case they were missing
    const r: Rival = {
      ...rival,
      riskTolerance: rival.riskTolerance ?? 0.5,
      aggression: rival.aggression ?? 0.5,
      intelligence: rival.intelligence ?? 0.5,
      ambition: rival.ambition ?? 0.5,
      ethics: rival.ethics ?? 0.5,
      politicalLeaning: rival.politicalLeaning ?? 'center',
      preferredIndustries: rival.preferredIndustries ?? ['Retail'],
      relationshipWithPlayer: rival.relationshipWithPlayer ?? 0,
      sabotagedCount: rival.sabotagedCount ?? 0,
      helpedCount: rival.helpedCount ?? 0,
      businesses: rival.businesses ?? [],
      propertiesOwned: rival.propertiesOwned ?? 0,
      companiesAcquired: rival.companiesAcquired ?? [],
      mediaCompaniesOwned: rival.mediaCompaniesOwned ?? 0,
      employeesHired: rival.employeesHired ?? 0,
      politicalInfluence: rival.politicalInfluence ?? 0,
      passiveIncome: rival.passiveIncome ?? 0,
      industries: rival.industries ?? [rival.preferredIndustries?.[0] ?? 'Retail'],
    };

    // --- 1. PERSISTENT RELATIONSHIP DRIFT AND MEMORY ---
    // Instead of resetting, relationship drifts slowly back towards the baseline
    // The baseline is permanently shifted by past player behavior (sabotages/helps)
    const relationshipBaseline = (r.helpedCount! * 15) - (r.sabotagedCount! * 25);
    const cappedBaseline = Math.max(-100, Math.min(100, relationshipBaseline));

    // Slow drift of 5% towards baseline
    r.relationshipWithPlayer = r.relationshipWithPlayer! + (cappedBaseline - r.relationshipWithPlayer!) * 0.05;

    // --- 2. ECONOMIC REALISM & ANTI-SNOWBALLING ---
    // Basic tier growth
    const growthRates: Record<string, number> = {
      MUD: 0.03, STREET: 0.04, STARTUP: 0.05, CORPORATE: 0.06, ELITE: 0.07, MOGUL: 0.08, PRESIDENT: 0.09, OPEN: 0.10
    };
    const baseGrowth = growthRates[r.tier] || 0.05;

    // Adjust growth by market state
    let marketFactor = 1.0;
    if (currentMarket === 'BULL_MARKET') {
      marketFactor = 1.3 + (r.riskTolerance! * 0.3); // High risk excels
    } else if (currentMarket === 'RECESSION') {
      marketFactor = 0.6 - (r.riskTolerance! * 0.3); // High risk suffers
    } else if (currentMarket === 'CRACKDOWN') {
      marketFactor = r.ethics! >= 0.5 ? 1.0 : 0.5;   // Unethical suffers
    }

    // World Event impact
    let eventFactor = 1.0;
    if (pl.activeWorldEvent) {
      if (pl.activeWorldEvent.eventId === 'market_crash') {
        eventFactor = 0.5;
      } else if (pl.activeWorldEvent.eventId === 'economic_boom') {
        eventFactor = 1.25;
      }
    }

    // Natural fluctuation
    const fluctuation = 1 + (Math.random() * (baseGrowth * marketFactor * eventFactor + 0.01) - 0.01);
    r.netWorth = Math.floor(r.netWorth * fluctuation);

    // Passive Yields mapping directly to player economy
    const propertyRentYield = 3000; // Matches player average real estate rent yields
    const businessYield = 4500;     // Average business yield
    const mediaYield = 12000;       // Media business yields
    r.passiveIncome = (r.propertiesOwned! * propertyRentYield) + (r.businesses!.length * businessYield) + (r.mediaCompaniesOwned! * mediaYield);

    // Overhead running costs/maintenance (Prevents infinite snowballing)
    const overheadCost = Math.floor(r.netWorth * RIVAL_OP_OVERHEAD_RATE);
    r.netWorth = Math.max(0, r.netWorth + r.passiveIncome - overheadCost);

    // If rival runs out of capital, liquidate assets to prevent insolvency!
    if (r.netWorth < 1000 && (r.propertiesOwned! > 0 || r.businesses!.length > 0)) {
      if (r.propertiesOwned! > 0) {
        r.propertiesOwned!--;
        r.netWorth += 25000; // Liquidate real estate property
        if (r.tier === pl.currentTier) {
          news.push(`📉 LIQUIDATION: ${r.name} sold off a rental property to cover monthly overhead liabilities.`);
        }
      } else if (r.businesses!.length > 0) {
        const closed = r.businesses!.pop();
        r.netWorth += 10000; // Close business
        if (r.tier === pl.currentTier) {
          news.push(`📉 BUSINESS CLOSE: ${r.name} closed down '${closed}' due to lack of liquid operating capital.`);
        }
      }
    }

    // --- 3. PERSONALITY-DRIVEN DECISION MAKING ---
    const decisionThreshold = 0.25 + (r.ambition! * 0.1);
    if (Math.random() < decisionThreshold && r.netWorth > 1000) {
      // Calculate affinity scores for different potential actions
      const actionScores = {
        START_BUSINESS: r.ambition! * 0.8 + r.riskTolerance! * 0.4 + (r.preferredIndustries!.length > 0 ? 0.3 : 0),
        BUY_PROPERTY: (r.preferredIndustries!.includes('Real Estate') ? 0.8 : 0.3) + (1.0 - r.riskTolerance!) * 0.5,
        BUY_COMPANY: r.ambition! * 0.9 + r.intelligence! * 0.5 + (r.preferredIndustries!.includes('Finance') ? 0.4 : 0),
        HIRE_EMPLOYEE: r.intelligence! * 0.6 + r.ambition! * 0.4,
        INVEST_MEDIA: r.ambition! * 0.8 + (r.preferredIndustries!.includes('Media') || r.preferredIndustries!.includes('Entertainment') ? 0.5 : 0),
        BUILD_POLITICAL_INFLUENCE: r.ambition! * 0.7 + (r.preferredIndustries!.includes('Politics') ? 0.6 : 0.2),
        RUN_ELECTION_CAMPAIGN: r.ambition! * 1.0 + (r.politicalInfluence ?? 0) * 0.005,
        AVOID_SECTOR: (1.0 - r.aggression!) * 0.6 + (1.0 - r.riskTolerance!) * 0.5,
        HOSTILE_COMPETITION: r.aggression! * 0.9 + (1.0 - r.ethics!) * 0.6 + (r.relationshipWithPlayer! < -20 ? 0.5 : 0)
      };

      // Filter actions based on economic affordability rules
      const possibleActions: string[] = [];
      if (r.netWorth > 2500) possibleActions.push('START_BUSINESS');
      if (r.netWorth > 12000) possibleActions.push('HIRE_EMPLOYEE');
      if (r.netWorth > 60000) possibleActions.push('BUY_PROPERTY');
      if (r.netWorth > 200000) possibleActions.push('BUY_COMPANY');
      if (r.netWorth > 350000) possibleActions.push('INVEST_MEDIA');
      if (r.netWorth > 500000) possibleActions.push('BUILD_POLITICAL_INFLUENCE');
      if (r.netWorth > 1500000 && r.isCandidate) possibleActions.push('RUN_ELECTION_CAMPAIGN');
      if (r.industries!.length < 5) possibleActions.push('EXPAND_INDUSTRY');

      // Always allow relational actions
      const playerDominates = pl.bag > r.netWorth * 1.5;
      if (playerDominates && r.tier === pl.currentTier) {
        possibleActions.push('HOSTILE_COMPETITION');
        possibleActions.push('AVOID_SECTOR');
      }

      // Pick the action with the highest personality score among affordable options
      let bestAction = 'START_BUSINESS';
      let maxScore = -999;
      possibleActions.forEach(act => {
        let score = 0.5;
        if (act === 'EXPAND_INDUSTRY') {
          score = r.ambition! * 0.75 + r.riskTolerance! * 0.45;
        } else {
          score = (actionScores as any)[act] ?? 0.5;
        }
        if (score > maxScore) {
          maxScore = score;
          bestAction = act;
        }
      });

      // Execute Best Personality Action
      if (bestAction === 'HOSTILE_COMPETITION' && r.status === 'ally') {
        bestAction = 'START_BUSINESS';
      }

      if (bestAction === 'EXPAND_INDUSTRY') {
        const allPossibleSectors = ['Food', 'Retail', 'Technology', 'Finance', 'Real Estate', 'Entertainment', 'Politics'];
        const unowned = allPossibleSectors.filter(s => !r.industries!.includes(s));
        if (unowned.length > 0) {
          const newSec = randomChoice(unowned);
          r.industries!.push(newSec);
          r.netWorth -= 15000; // Expansion fee
          if (r.tier === pl.currentTier) {
            news.push(`📈 SECTOR EXPANSION: ${r.name} expanded operations into the ${newSec} industry to gain market share.`);
          }
        } else {
          bestAction = 'START_BUSINESS'; // Fallback
        }
      }

      if (bestAction === 'START_BUSINESS') {
        const ind = randomChoice(r.industries!);
        const bizNames: Record<string, string[]> = {
          Food: ['Deli', 'Bistro', 'Food Truck', 'Tavern'],
          Retail: ['Boutique', 'Sneaker Shop', 'E-commerce Store', 'Vintage Hub'],
          Technology: ['SaaS Engine', 'Crypto Miner', 'App Dev Lab', 'Hosting Cell'],
          Finance: ['Brokerage Micro', 'VC Micro-Fund', 'Hedge Node', 'Asset Desk'],
          'Real Estate': ['Renters Hub', 'Agency Desk', 'Flip Shop'],
          Entertainment: ['Label Office', 'Gig Club', 'Agency Cell'],
          Politics: ['PAC Office', 'Lobby Desk']
        };
        const bizType = randomChoice(bizNames[ind] || ['Consulting Desk']);
        const name = `${r.name}'s ${bizType}`;
        r.businesses!.push(name);
        r.netWorth -= Math.floor(r.netWorth * 0.05); // Invest capital
        if (r.tier === pl.currentTier) {
          news.push(`📰 ${r.name} opened a ${ind} company: '${name}' to expand local operations.`);
        }
      }

      else if (bestAction === 'BUY_PROPERTY') {
        r.propertiesOwned!++;
        r.netWorth -= 45000; // Standard property deposit/cost
        if (r.tier === pl.currentTier) {
          news.push(`🏠 Sarah Hamilton's real estate moves? No, ${r.name} acquired another rental property to build passive yields.`);
        }
      }

      else if (bestAction === 'BUY_COMPANY') {
        const sector = randomChoice(r.preferredIndustries!);
        const companyName = `${r.name} ${sector} Holdings ${randomChoice(['Corp', 'LLC', 'Inc'])}`;
        r.companiesAcquired!.push(companyName);
        r.netWorth -= 180000;
        if (r.tier === pl.currentTier) {
          news.push(`📈 CORPORATE TAKEOVER: ${r.name} acquired corporate entity '${companyName}' to scale up.`);
        }
      }

      else if (bestAction === 'HIRE_EMPLOYEE') {
        const hiredCount = Math.floor(Math.random() * 8) + 2;
        r.employeesHired! += hiredCount;
        r.netWorth -= hiredCount * 1200; // payroll invest
      }

      else if (bestAction === 'INVEST_MEDIA') {
        r.mediaCompaniesOwned!++;
        r.netWorth -= 250000;
        if (r.tier === pl.currentTier) {
          news.push(`📺 MEDIA EXPANSION: ${r.name} is buying media companies to capture the regional narrative.`);
        }
      }

      else if (bestAction === 'BUILD_POLITICAL_INFLUENCE') {
        r.politicalInfluence = (r.politicalInfluence ?? 0) + Math.floor(Math.random() * 30) + 15;
        r.netWorth -= 120000;
        r.isCandidate = true;
        if (r.tier === pl.currentTier) {
          news.push(`🗳️ CLOUT MIGRATION: ${r.name} has poured heavy capital into building local political influence.`);
        }
      }

      else if (bestAction === 'RUN_ELECTION_CAMPAIGN') {
        r.campaignProgress = Math.min(100, (r.campaignProgress ?? 0) + Math.floor(Math.random() * 20) + 10);
        r.netWorth -= 300000;
        if (r.tier === pl.currentTier) {
          news.push(`🇺🇸 POLL ALIGNMENT: ${r.name} is leading the latest election polls after an expensive marketing blitz.`);
        }
      }

      else if (bestAction === 'AVOID_SECTOR') {
        if (r.industries!.length > 1) {
          const prevCount = r.industries!.length;
          r.industries = r.industries!.filter(ind => !r.preferredIndustries!.includes(ind));
          if (r.industries!.length === 0) r.industries = [randomChoice(['Retail', 'Food'])];
          if (r.industries!.length < prevCount && r.tier === pl.currentTier) {
            news.push(`🏳️ COMPETITIVE SHIFT: ${r.name} pivoted away from ${r.preferredIndustries!.join('/')} to avoid competing with your massive market dominance.`);
          }
        }
      }

      else if (bestAction === 'HOSTILE_COMPETITION') {
        r.netWorth -= Math.floor(r.netWorth * 0.08);
        r.relationshipWithPlayer = Math.max(-100, r.relationshipWithPlayer! - 15);
        if (r.tier === pl.currentTier) {
          news.push(`🔥 WAR OF ATTRITION: ${r.name} launched aggressive hostile competition, squeezing your profit margins in ${randomChoice(r.preferredIndustries!)}!`);
          playerStatsUpdates.bag = Math.max(0, (pl.bag) - Math.floor(r.netWorth * 0.03));
        }
      }
    }

    // --- 4. REACTIVE PLAYER MEMORY & GRUDGES ---
    const isRetaliationActive = isConsequenceActive(pl, 'sabotage_retaliation');
    const isHaloActive = isConsequenceActive(pl, 'philanthropic_halo');

    // Sabotage retaliation logic (allies never retaliate with hostile sabotage)
    if (r.status !== 'ally') {
      let sabotageChance = (0.2 + r.aggression! * 0.15);
      if (isRetaliationActive) sabotageChance *= 1.5;
      if (isHaloActive) sabotageChance *= 0.5;
      if (reputation === "The Kingmaker") sabotageChance *= 0.5;

      if (r.sabotagedCount! > 0 && Math.random() < sabotageChance) {
        r.relationshipWithPlayer = Math.max(-100, r.relationshipWithPlayer! - 5);
        const retaliations = ['POACH_REVENUE', 'TALK_RUMOURS', 'DIRECT_SABOTAGE'];
        const act = randomChoice(retaliations);

        const mem = getRivalMemories(pl, r.name);

        let quote = '"Stay in your lane."';
        if (mem.betrayed) {
          quote = mem.earliestInteractionYearsPassed !== undefined && mem.earliestInteractionYearsPassed > 0
            ? `"It's been ${mem.earliestInteractionYearsPassed} years since you stabbed me in the back after we partnered. I never forget a betrayal."`
            : '"You pretended to be my partner, then stabbed me in the back. Now it\'s my turn."';
        } else if (mem.earliestInteractionTier && mem.liquidated) {
          quote = mem.earliestInteractionYearsPassed !== undefined && mem.earliestInteractionYearsPassed > 0
            ? `"You took my company ${mem.earliestInteractionYearsPassed} years ago in the ${mem.earliestInteractionTier} years. I've been waiting for this moment."`
            : `"You took my company in the ${mem.earliestInteractionTier} years. I've been waiting for this moment."`;
        } else if (mem.liquidated) {
          quote = '"You forced me to liquidate my assets. I had to claw my way back, and now I\'m coming for yours!"';
        } else if (mem.humiliated) {
          quote = '"You publicly humiliated me in the past, thinking I was weak. This is my payback!"';
        } else if (mem.retaliated) {
          quote = '"You tried to crush me with your retaliation. I don\'t forget. I\'m hitting back twice as hard."';
        } else if (mem.sabotaged) {
          quote = mem.earliestInteractionYearsPassed !== undefined && mem.earliestInteractionYearsPassed > 0
            ? `"I still remember when you sabotaged my logistics ${mem.earliestInteractionYearsPassed} years ago. Time for some long-overdue interest on that debt."`
            : mem.earliestInteractionMonth !== undefined
            ? `"You think you can sabotage my operations and get away with it? I remember what you did back at Month ${mem.earliestInteractionMonth}."`
            : '"You think you can sabotage my operations and get away with it? I remember what you did."';
        } else if (mem.counterBid) {
          quote = '"You out-bid me and took my sector position. Let\'s see how your portfolio handles this strike."';
        } else if (mem.helped) {
          quote = '"I know you helped me before, but business is business. Don\'t take this personally."';
        } else if (reputation === "The Hustler") {
          quote = '"You\'re just a basic street hustler."';
        } else if (reputation === "The Investor") {
          quote = '"Let\'s see if your portfolio can buffer this strike, Investor."';
        } else if (reputation === "The Mogul") {
          quote = '"Even Moguls can bleed."';
        } else if (reputation === "The Celebrity") {
          quote = '"Your flashy fame won\'t shield your bank account."';
        } else if (reputation === "The Crime Boss") {
          quote = '"You think you own the underground?"';
        } else if (reputation === "The Kingmaker") {
          quote = '"Your political puppet strings won\'t save your holdings."';
        } else if (reputation === "The President") {
          quote = '"Not even executive privilege can protect your assets."';
        }

        if (act === 'POACH_REVENUE' && Object.keys(pl.dynamicPassives).length > 0) {
          const target = randomChoice(Object.keys(pl.dynamicPassives));
          playerStatsUpdates.dynamicPassives = { ...pl.dynamicPassives };
          playerStatsUpdates.dynamicPassives[target] = Math.floor((pl.dynamicPassives[target] || 0) * 0.80);
          news.push(`🚨 RETALIATION: ${r.name} said ${quote} and poached 20% of your ${target.replace(/_/g, ' ')} returns!`);
        } else if (act === 'TALK_RUMOURS') {
          playerStatsUpdates.heat = Math.min(100, pl.heat + 15);
          news.push(`🗣️ SMEAR Campaign: ${r.name} declared ${quote} and leaked rumors about your operations. Your Heat surged +15%!`);
        } else {
          playerStatsUpdates.bag = Math.max(0, pl.bag - 15000);
          playerStatsUpdates.aura = Math.max(0, pl.aura - 20);
          news.push(`💥 SABOTAGE: ${r.name} declared ${quote} and directly sabotaged your delivery logistics. Lost $15,000 and 20 Aura!`);
        }
      }
    }

    // Help/Partnership reward logic (allies can trigger this helpful reward loop!)
    if (r.helpedCount! > 0 && r.relationshipWithPlayer! > 25 && Math.random() < (0.15 + r.intelligence! * 0.1)) {
      const benefits = ['CASH_GIFT', 'CLOUT_BOOST', 'AURA_BOOST'];
      const act = randomChoice(benefits);

      if (act === 'CASH_GIFT') {
        const gift = Math.floor(r.netWorth * 0.06);
        playerStatsUpdates.bag = (pl.bag) + gift;
        news.push(`🤝 PARTNERSHIP GIFT: ${r.name} offered a $${gift.toLocaleString()} venture injection to support your hustle!`);
      } else if (act === 'CLOUT_BOOST') {
        playerStatsUpdates.clout = pl.clout + 120;
        news.push(`👑 MEDIA CROSS-PROMO: ${r.name} promoted you on their network! +120 Clout!`);
      } else {
        playerStatsUpdates.aura = pl.aura + 60;
        news.push(`🌟 PUBLIC ALLIANCE: ${r.name} endorsed your business ethics! +60 Aura!`);
      }
    }

    // Politics Opposition and Bidding behavior logic (allies never execute these hostile acts)
    let currentBid = 0;
    if (r.status !== 'ally') {
      const playerInPolitics = pl.currentTier === 'PRESIDENT' || (pl.campaignStage !== undefined && pl.campaignStage > 1);
      if (playerInPolitics && r.tier === pl.currentTier && Math.random() < 0.25) {
        if (r.politicalLeaning !== 'center' && r.ethics! < 0.4) {
          news.push(`🗳️ OPPOSITION FUNDING: ${r.name} is pumping PAC money into your opponent's election campaign! Approval hit.`);
          playerStatsUpdates.approvalRating = Math.max(0, pl.approvalRating - 5);
        }
      }

      let bidChance = 0.05 * (r.vengeance ?? 1);
      if (isRetaliationActive) bidChance *= 1.5;
      if (isHaloActive) bidChance *= 0.5;
      if (reputation === "The Kingmaker") bidChance *= 0.5;
      if (reputation === "The Crime Boss") bidChance *= 0.75;

      if (r.tier === pl.currentTier && Math.random() < bidChance) {
        currentBid = Math.floor(r.netWorth * (0.05 + Math.random() * 0.1));
        news.push(`⚠️ RIVAL ALERT: ${r.name} is aggressively bidding in your sector! Current bid: $${currentBid.toLocaleString()}`);
      }
    }
    r.currentBid = currentBid;

    // Clean currentHustle descriptive tags
    r.currentHustle = r.businesses!.length > 0 ? r.businesses![r.businesses!.length - 1] : undefined;

    return r;
  });

  return {
    updatedRivals,
    news,
    playerStatsUpdates
  };
};
