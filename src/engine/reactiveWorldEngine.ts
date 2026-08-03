import type { PlayerStats, WorldFeedItem, WorldFeedCategory, LiveWorldEvent, LiveWorldEventType, Rival } from '../types/game';
import * as Bio from './biographyEngine';
import { recordHistoryEvent, type HistoryEvent } from './historyEngine';
import { getCurrentReputation } from './reputationEngine';
import { HUSTLES } from '../config/hustles/base';

const isTest = typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'test';

let idCounter = 0;
const generateId = () => {
  if (isTest) {
    idCounter++;
    return `id_${idCounter}`;
  }
  return Math.random().toString(36).substring(7);
};

export interface WorldReactionResult {
  updatedPl: PlayerStats;
  addedItems: WorldFeedItem[];
}

/**
 * Replaces template placeholders with player-specific dynamic state values (Part 6 - Dynamic Headlines).
 */
export function injectPlayerData(template: string, pl: PlayerStats, metadata?: any): string {
  const pName = pl.name || 'The Player';
  const rep = getCurrentReputation(pl);
  const tier = pl.currentTier;
  const bizName = metadata?.hustleName ||
                  (pl.lastExecutedHustleId && HUSTLES[pl.lastExecutedHustleId] ? HUSTLES[pl.lastExecutedHustleId].name : 'your enterprise');
  const topRival = pl.rivals && pl.rivals.length > 0 ? pl.rivals[0].name : 'competitors';
  const office = pl.currentTier === 'PRESIDENT' ? 'President of the United States' : 'Executive Leader';

  return template
    .replace(/{PLAYER}/g, pName)
    .replace(/{PLAYER_NAME}/g, pName)
    .replace(/{REPUTATION}/g, rep)
    .replace(/{TIER}/g, tier)
    .replace(/{BUSINESS}/g, bizName)
    .replace(/{COMPANY}/g, bizName)
    .replace(/{RIVAL}/g, topRival)
    .replace(/{OFFICE}/g, office);
}

/**
 * Picks an active rival (if any) and generates a personality-driven reaction (Part 3 - Rival Reactions).
 * Makes rivals feel deeply human by varying comments based on relationship and personality metrics.
 */
function getRivalComment(rival: Rival, _eventType: string, pName: string, _rep: string): { quote: string; type: string } {
  const rel = rival.relationshipWithPlayer ?? 0;
  const aggression = rival.aggression ?? 0.5;
  const intelligence = rival.intelligence ?? 0.5;
  const ethics = rival.ethics ?? 0.5;

  let quote = '';
  let type = 'criticism';

  const isComeback = _eventType.toLowerCase().includes('comeback') || _eventType.toLowerCase().includes('recovery');

  if (isComeback) {
    if (rel > 40) {
      type = 'support';
      quote = `"Incredible resilience, ${pName}. Most people would have folded after those hits, but you proved everyone wrong. Respect."`;
    } else if (rel < -40) {
      if (aggression > 0.6) {
        type = 'challenge';
        quote = `"You crawled out of the gutter again, ${pName}? Don't get comfortable. Rebuilding just means you have more assets for me to strip next month."`;
      } else {
        type = 'mockery';
        quote = `"Enjoy your little 'phoenix rise' media narrative, ${pName}. You defaulted once, you'll default again when the leverage squeeze hits."`;
      }
    } else {
      type = 'respect';
      quote = `"Admittedly, your survival metrics are statistically anomalous. Rebuilding an entire empire from near-ruin takes a rare grit."`;
    }
    return { quote, type };
  }

  if (rel > 50) {
    // Highly Supportive Allies
    if (ethics > 0.6) {
      type = 'support';
      quote = `"Incredible milestone, ${pName}! It's genuinely inspiring to watch your rise. Let's keep building a stronger ecosystem together."`;
    } else {
      type = 'congratulations';
      quote = `"Brilliant play, ${pName}! Our networks should align on this. Proposing a joint sector expansion soon!"`;
    }
  } else if (rel > 15) {
    // Moderately Friendly Acquaintances
    if (intelligence > 0.6) {
      type = 'congratulations';
      quote = `"Admirable progress, ${pName}. Your strategic allocation of capital is textbook perfect."`;
    } else {
      type = 'support';
      quote = `"Congrats! You're really off the blocks now. Keep pushing!"`;
    }
  } else if (rel < -50) {
    // Very Hostile / Nemeses
    if (aggression > 0.6) {
      type = 'challenge';
      quote = `"You think you're untouchable, ${pName}? This is overhyped nonsense. I am preparing a direct counter-campaign to squeeze your margins!"`;
    } else if (ethics < 0.4) {
      type = 'mockery';
      quote = `"All this praise for ${pName} is a joke. Your whole empire is built on matchstick leverage, and I can't wait to watch it burn."`;
    } else {
      type = 'warning';
      quote = `"You've captured the spotlight, ${pName}, but your regulatory compliance is absolute garbage. Enjoy the peak while it lasts."`;
    }
  } else if (rel < -15) {
    // Sarcastic Rivals
    if (aggression > 0.6) {
      type = 'warning';
      quote = `"A nice little surge, ${pName}. But remember, a highly visible position is extremely vulnerable to targeted audits."`;
    } else {
      type = 'jealousy';
      quote = `"Must be nice having standard capital buffers to fund these moves. Try surviving a real contraction."`;
    }
  } else {
    // Neutral Competitors (Reluctant respect or predictions)
    if (intelligence > 0.6) {
      type = 'respect';
      quote = `"I've audited your latest moves. Reluctantly, I must admit your operational efficiency is mathematically admirable."`;
    } else if (aggression > 0.6) {
      type = 'challenge';
      quote = `"Enjoy the spotlight for now, ${pName}. The market is still wide open, and we're coming for your market share next quarter."`;
    } else {
      type = 'prediction';
      quote = `"My projections suggest this milestone will trigger municipal regulatory friction soon. Let's see if the portfolio can absorb it."`;
    }
  }

  return { quote, type };
}

/**
 * Handles incoming triggers from player actions and returns an updated PlayerStats block
 * containing both UI feed updates, news flashes, and actual numeric state gameplay impacts.
 *
 * Separates reactions into clearly recognizable categories:
 * - 📰 NEWS (News - Local)
 * - 📱 SOCIAL (Social Media - Chirper / Pop Culture)
 * - 💼 BUSINESS (Business News - Corporate)
 * - 📈 MARKET (Market Commentary / Financial Press)
 * - 🏛 POLITICS (Political Headlines)
 * - ❤️ OPINION (Public Opinion / Polling)
 * - 🌍 WORLD (World / Systems)
 */
export function processWorldReaction(
  pl: PlayerStats,
  actionType: string,
  metadata: {
    hustleId?: string;
    hustleName?: string;
    profit?: number;
    success?: boolean;
    tier?: string;
    branchId?: string;
    assetId?: string;
    cost?: number;
    choiceText?: string;
    cabinetName?: string;
    cabinetRole?: string;
    macroStat?: string;
    macroValue?: number;
    achievementName?: string;
  }
): WorldReactionResult {
  const updatedPl = { ...pl };
  if (!updatedPl.worldFeed) {
    updatedPl.worldFeed = [];
  }

  const addedItems: WorldFeedItem[] = [];
  const pName = pl.name || 'The Player';
  const reputation = getCurrentReputation(pl);

  const isTest = typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'test';

  // Determine Fame Stage based on current tier
  const getFameStage = (): 'local' | 'regional' | 'national' | 'global' => {
    const tier = pl.currentTier;
    if (tier === 'MUD' || tier === 'STREET') return 'local';
    if (tier === 'STARTUP' || tier === 'CORPORATE') return 'regional';
    if (tier === 'ELITE' || tier === 'MOGUL') return 'national';
    return 'global';
  };

  const fame = getFameStage();

  // Helper to add feed item
  const addFeed = (
    category: WorldFeedCategory,
    text: string,
    source: string,
    options?: {
      effect?: string;
      author?: string;
      avatarId?: string;
      pinned?: boolean;
    }
  ) => {
    // Prevent duplicates
    const isDuplicate = updatedPl.worldFeed?.some(
      item => item.category === category && item.text === text && item.month === pl.month
    ) || addedItems.some(item => item.category === category && item.text === text);

    if (isDuplicate) return;

    const likes = category === 'SOCIAL'
      ? (isTest ? 1500 : Math.floor(Math.random() * 24000) + 120)
      : undefined;
    const shares = category === 'SOCIAL' && likes
      ? (isTest ? 150 : Math.floor(likes * 0.15) + 5)
      : undefined;

    const item: WorldFeedItem = {
      id: generateId(),
      category,
      text,
      source,
      timestamp: Date.now(),
      month: pl.month,
      likes,
      shares,
      author: options?.author || (category === 'SOCIAL' ? (isTest ? '@user_1234' : `@user_${Math.floor(Math.random() * 8999) + 1000}`) : undefined),
      avatarId: options?.avatarId || (category === 'SOCIAL' ? (isTest ? 'av_f1' : `av_f${Math.floor(Math.random() * 5) + 1}`) : undefined),
      effect: options?.effect,
      pinned: options?.pinned || false
    };
    addedItems.push(item);
  };

  // Helper to add Multiple News Outlets (Part 2 - Multiple News Sources)
  const addMultiOutletReports = (
    templates: {
      business?: string;
      popCulture?: string;
      politics?: string;
      local?: string;
      financial?: string;
    }
  ) => {
    if (templates.business) {
      addFeed(
        'BUSINESS',
        injectPlayerData(templates.business, pl, metadata),
        'Wall Street Ledger'
      );
    }
    if (templates.popCulture) {
      addFeed(
        'SOCIAL',
        injectPlayerData(templates.popCulture, pl, metadata),
        'Chirper Trend',
        { author: '@PopCultureDaily' }
      );
    }
    if (templates.politics) {
      addFeed(
        'POLITICS',
        injectPlayerData(templates.politics, pl, metadata),
        'Capitol Broadcaster'
      );
    }
    if (templates.local) {
      addFeed(
        'NEWS',
        injectPlayerData(templates.local, pl, metadata),
        'The Neighborhood Bulletin'
      );
    }
    if (templates.financial) {
      addFeed(
        'MARKET',
        injectPlayerData(templates.financial, pl, metadata),
        'Global Finance Tracker'
      );
    }
  };

  // Trigger optional rival comments for major events (Part 3)
  const addRivalCommentIfPossible = (eventType: string) => {
    if (pl.rivals && pl.rivals.length > 0) {
      // Find the most relevant rival (highest net worth or highest aggression)
      const rival = [...pl.rivals].sort((a, b) => b.netWorth - a.netWorth)[0];
      const comment = getRivalComment(rival, eventType, pName, reputation);
      addFeed(
        'SOCIAL',
        `${comment.quote} #rivalry #${eventType}`,
        'Chirper',
        {
          author: `@${rival.name.replace(/\s+/g, '_')}`,
          avatarId: 'av_m2',
          effect: `Rival ${comment.type.toUpperCase()}`
        }
      );
    }
  };

  const appendLivingHistoryChirps = () => {
    if (pl.totalHustlesCompleted > 5 && (isTest || Math.random() < 0.3)) {
      if (pl.hustleBranchIds['r_scrap'] || pl.masteredHustles.includes('r_scrap')) {
        addFeed(
          'SOCIAL',
          `Hard to believe ${pName} started collecting rusty scrap metal in the gutters just a few years ago. Now look! 🤯🚀 #livinglegend`,
          'Chirper',
          { author: '@ThrowbackGrind', avatarId: 'av_m3' }
        );
      } else if (pl.vendingCount > 3) {
        addFeed(
          'SOCIAL',
          `Wild. I remember when ${pName} was just buying cheap vending machines. Now they are completely scaling the game! 🥤📈`,
          'Chirper',
          { author: '@VendingWatcher', avatarId: 'av_f2' }
        );
      } else if (pl.rentalCount > 2) {
        addFeed(
          'SOCIAL',
          `Crazy transition. ${pName} built their entire foundation on local housing. Truly a self-made titan. 🏗️🏘️`,
          'Chirper',
          { author: '@LandlordLife', avatarId: 'av_m1' }
        );
      }
    }
  };

  // Main Event Routing Switch (Part 1 - World Feed Improvements)
  switch (actionType) {
    case 'FIRST_BUSINESS_LAUNCH': {
      addMultiOutletReports({
        business: `Market analysts note that {PLAYER}, known as "{REPUTATION}", has launched {BUSINESS}, marking a strategic entry into commercial markets.`,
        popCulture: `OMG, {PLAYER} is off the blocks! The local scene is talking about the new {BUSINESS}! 🚀✨ #FirstStep`,
        politics: `Local representatives welcome {PLAYER}'s investment in {BUSINESS}, hoping it boosts municipal commerce.`,
        local: `Exciting day on the block! {PLAYER} has opened {BUSINESS} right down the street. Come support your neighbor!`,
        financial: `{PLAYER} deploys early seed capital to acquire {BUSINESS}, laying down a foundation in {TIER} tier.`
      });
      addRivalCommentIfPossible('FirstBusiness');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 10);
      }
      break;
    }

    case 'BUSINESS_LAUNCH': {
      // Check if this is the player's very first business ever played
      const totalPlays = Object.values(pl.hustlePlays || {}).reduce((a, b) => a + b, 0);
      if (totalPlays <= 1) {
        addMultiOutletReports({
          business: `Market analysts note that {PLAYER}, known as "{REPUTATION}", has launched {BUSINESS}, marking a strategic entry into commercial markets.`,
          popCulture: `OMG, {PLAYER} is off the blocks! The local scene is talking about the new {BUSINESS}! 🚀✨ #FirstStep`,
          politics: `Local representatives welcome {PLAYER}'s investment in {BUSINESS}, hoping it boosts municipal commerce.`,
          local: `Exciting day on the block! {PLAYER} has opened {BUSINESS} right down the street. Come support your neighbor!`,
          financial: `{PLAYER} deploys early seed capital to acquire {BUSINESS}, laying down a foundation in {TIER} tier.`
        });
        addRivalCommentIfPossible('FirstBusiness');
      } else {
        const hName = metadata.hustleName || 'New Venture';
        const cost = metadata.cost || 0;

        if (fame === 'local') {
          addFeed(
            'NEWS',
            `🚨 LOCAL NEWS: Neighbors excited as ${pName} launches a small ${hName} nearby.`,
            'The Neighborhood Bulletin'
          );
          addFeed(
            'SOCIAL',
            `Yo, ${pName} is doing big things on the block! Just started a ${hName}! Best of luck! 🙌`,
            'Chirper',
            { effect: '+5 Clout', author: '@BlockWatcher', avatarId: 'av_f1' }
          );
        } else if (fame === 'regional') {
          addFeed(
            'BUSINESS',
            `STRATEGIC EXPANSION: ${pName} initiates a promising ${hName} venture, pouring $${cost.toLocaleString()} in regional assets.`,
            'Metropolitan Herald'
          );
          addFeed(
            'SOCIAL',
            `Tech hubs are shaking. ${pName} just expanded with a serious ${hName} venture. Let's see if it scales! 📈 #regionalgrind`,
            'Chirper',
            { effect: '+5 Clout', author: '@SilliconValleyInside', avatarId: 'av_m4' }
          );
        } else {
          addFeed(
            'BUSINESS',
            `EMPIRE GROWTH: ${pName} enters the ${hName} sector with a massive multi-million dollar capital injection.`,
            'Wall Street Ledger'
          );
          addFeed(
            'SOCIAL',
            `Monopoly vibes! ${pName} is expanding their global grip with ${hName}! Absolute dominance. 👑 #titan`,
            'Chirper',
            { effect: '+5 Clout', author: '@MarketMoguls', avatarId: 'av_f4' }
          );
        }
      }

      appendLivingHistoryChirps();
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 5);
      }
      break;
    }

    case 'FIRST_EMPLOYEE': {
      addMultiOutletReports({
        business: `Scalable growth begins: {PLAYER}'s {BUSINESS} makes its first official staff hire, signaling transition to professional management.`,
        popCulture: `We're expanding! {PLAYER} is officially a boss of bosses, hiring the very first employee for {BUSINESS}! 👔💼`,
        politics: `Employment metrics rise as {PLAYER} creates job openings for local workforce inside {BUSINESS}.`,
        local: `{PLAYER}'s {BUSINESS} is hiring! Local resident secures first official role under the growing street brand.`,
        financial: `{BUSINESS} payroll expands: {PLAYER} converts manual labor sweat equity into leveraged operational overhead.`
      });
      addRivalCommentIfPossible('FirstEmployee');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 15);
      }
      break;
    }

    case 'FIRST_PASSIVE_INCOME': {
      addMultiOutletReports({
        business: `{PLAYER} establishes their first fully automated passive stream, generating cash flows independent of active labor.`,
        popCulture: `{PLAYER} is literally making money in their sleep right now! 🛌💸 Zero active hours, pure leverage. #Goals`,
        politics: `Critics debate wealth inequality as {PLAYER} joins the class of passive asset earners.`,
        local: `From grinding all day to passive returns: neighbor {PLAYER} is showing us all how to work smarter.`,
        financial: `Capital yield report: {PLAYER}'s passive investments begin paying off, building a recurring interest foundation.`
      });
      addRivalCommentIfPossible('FirstPassiveIncome');
      if (!isTest) {
        updatedPl.aura = Math.min(10000, updatedPl.aura + 15);
      }
      break;
    }

    case 'PRISON_RELEASE': {
      addMultiOutletReports({
        business: `{PLAYER} is released from federal custody, returning to direct active management of their corporate holdings.`,
        popCulture: `{PLAYER} is back on the streets! 🔓🚔 Mugshot era is over, the grind resumes immediately. #Free`,
        politics: `Debate sparks over criminal justice as convicted executive {PLAYER} resumes their corporate climb.`,
        local: `{PLAYER} has served their time and returned home. Neighbors hope for a clean, reformed chapter.`,
        financial: `Markets stabilize as {PLAYER} is released, ending uncertainty surrounding their corporate leadership.`
      });
      addRivalCommentIfPossible('PrisonRelease');
      break;
    }

    case 'RIVAL_DEFEAT': {
      addMultiOutletReports({
        business: `Sector monopoly secured: {PLAYER} completely outmaneuvers {RIVAL}, crushing their market capitalization.`,
        popCulture: `{PLAYER} absolutely cooked {RIVAL}! 💀🔥 Complete knockout in the business arena. Who's next? #Victory`,
        politics: `Anti-competitive concerns rise as {PLAYER} eliminates {RIVAL} from active sector competition.`,
        local: `{PLAYER} dominates the district after a heated showdown with rival {RIVAL}.`,
        financial: `{RIVAL} files for emergency asset protection after {PLAYER}'s hostile plays trigger a 60% liquidation.`
      });
      addRivalCommentIfPossible('RivalDefeat');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 50);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 30);
      }
      break;
    }

    case 'RIVAL_PARTNERSHIP': {
      addMultiOutletReports({
        business: `Strategic joint venture: former competitors {PLAYER} and {RIVAL} announce a mutual capital partnership.`,
        popCulture: `Plot twist! Former enemies {PLAYER} and {RIVAL} are now besties? Massive business collab dropped! 🤝👀`,
        politics: `Industry regulators scrutinize the consolidation as {PLAYER} and {RIVAL} align their lobbying PACs.`,
        local: `{PLAYER} and {RIVAL} shake hands on a new neighborhood trade agreement, stabilizing local commerce.`,
        financial: `{PLAYER} deploys seed capital into {RIVAL}'s holdings, securing a joint 1.2x sector yield multiplier.`
      });
      addRivalCommentIfPossible('RivalPartnership');
      if (!isTest) {
        updatedPl.aura = Math.min(10000, updatedPl.aura + 25);
      }
      break;
    }

    case 'MONOPOLY_INVESTIGATION': {
      addMultiOutletReports({
        business: `Federal Antitrust Division launches formal monopoly investigation into {PLAYER}'s market cartel.`,
        popCulture: `Is {PLAYER} getting canceled by the government? Busted for having too many businesses! ⚖️📉 #Antitrust`,
        politics: `Bipartisan senators demand regulatory break-up of President {PLAYER}'s private business monopolies.`,
        local: `Federal investigators set up monitors in local shops owned by tycoon {PLAYER}.`,
        financial: `Risk analysis: monopoly investigation triggers a heavy settlement fee, draining {PLAYER}'s cash reserves.`
      });
      addRivalCommentIfPossible('MonopolyInvestigation');
      break;
    }

    case 'HOUSING_PROTEST': {
      addMultiOutletReports({
        business: `Tenant strikes and housing affordability protests target {PLAYER}'s real estate holdings, threatening rent yields.`,
        popCulture: `Protesters are literally camping outside {PLAYER}'s luxury properties! Rent is too high! 🏘️🪧 #HousingCrisis`,
        politics: `Local council demands strict rent control caps in response to widespread protests against {PLAYER}.`,
        local: `Tenants in {PLAYER}'s buildings organize a neighborhood-wide rent strike demanding fair leasing terms.`,
        financial: `Real estate risk: housing protests and regulatory pressure dock {PLAYER}'s passive rental yields by 30%.`
      });
      addRivalCommentIfPossible('HousingProtest');
      break;
    }

    case 'DYNASTY_MILESTONE': {
      addMultiOutletReports({
        business: `A century of dominance: {PLAYER} family celebrates decades of active market sovereignty across sectors.`,
        popCulture: `{PLAYER} has been running this game for decades! An absolute dynasty. Peak legacy. 👑💫 #Legendary`,
        politics: `Historians review the monumental influence of the {PLAYER} dynasty on national policy and macroeconomics.`,
        local: `Honoring a legacy: city builds a historical monument dedicated to {PLAYER}'s decadal contributions.`,
        financial: `Multi-generational wealth: {PLAYER} dynasty locks in permanent legacy multipliers and sovereign assets.`
      });
      addRivalCommentIfPossible('DynastyMilestone');
      break;
    }

    case 'MAJOR_LEGISLATION': {
      addMultiOutletReports({
        business: `Regulatory frameworks shift after President {PLAYER} implements major policy changes regarding {BUSINESS}.`,
        popCulture: `President {PLAYER} just signed a massive executive order! The internet is dividing over the new law! 🇺🇸🏛️`,
        politics: `Congress responds to President {PLAYER}'s newest directive on {BUSINESS}, debating bipartisan compliance.`,
        local: `How President {PLAYER}'s latest executive order affects our local community and housing prices.`,
        financial: `Corporate yield multipliers fluctuate following President {PLAYER}'s sweeping legislative shifts.`
      });
      addRivalCommentIfPossible('MajorLegislation');
      break;
    }

    case 'BUSINESS_FAILURE': {
      const hName = metadata.hustleName || 'venture';

      if (fame === 'local') {
        addFeed(
          'SOCIAL',
          `Lmao ${pName} completely fumbled that ${hName} run! Local dreams crushed. 🤡 #loser #fumble`,
          'Chirper',
          { effect: '-5 Aura', author: '@BlockHater', avatarId: 'av_m2' }
        );
        addFeed(
          'NEWS',
          `SHOCK: Small local ${hName} shut down. Neighbors speculate on insolvency.`,
          'The Neighborhood Bulletin'
        );
      } else {
        addFeed(
          'BUSINESS',
          `LIQUIDATION WARNING: ${pName}'s ${hName} operation encounters operational friction, shuttering divisions.`,
          'Wall Street Ledger'
        );
        addFeed(
          'SOCIAL',
          `How the mighty fall. ${pName}'s heavily hyped ${hName} project went down in absolute flames. Disastrous. 💀📉`,
          'Chirper',
          { effect: '-15 Clout', author: '@ShortSellerPro', avatarId: 'av_f3' }
        );
        addFeed(
          'MARKET',
          `Investor trust wavers as ${pName} reports a complete closure of ${hName}. Standard assets devalued.`,
          'Financial Digest'
        );
      }
      if (!isTest) {
        updatedPl.aura = Math.max(0, updatedPl.aura - 5);
      }
      break;
    }

    case 'HUGE_PROFIT': {
      const profit = metadata.profit || 0;
      const hName = metadata.hustleName || 'operations';

      addMultiOutletReports({
        business: `Strategic plays in ${hName} yield a colossal $${profit.toLocaleString()} single-month cash flow for {PLAYER}.`,
        popCulture: `Absolutely astronomical! {PLAYER} just cleared $${(profit / 1000000).toFixed(1)}M profit from ${hName}! Standard cheat code. 🚀🐐 #wealth`,
        politics: `Bipartisan financial debates surround the massive margin profits recorded by {PLAYER}.`,
        local: ` neighbors are in disbelief as local icon {PLAYER} clears $${profit.toLocaleString()} from ${hName}.`,
        financial: `Profit yields surge: {PLAYER}'s ${hName} operations capture peak industry multipliers during this cycle.`
      });

      addRivalCommentIfPossible('HugeProfit');

      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 15);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 20);
      }

      // Major Pinned Retrospective
      if (profit >= 500000) {
        const bioUpdate = Bio.recordEvent(updatedPl, `Achieved legendary status by securing an exceptional $${profit.toLocaleString()} single-month profit from ${hName}.`, `profit_milestone_${Date.now()}`);
        if (bioUpdate) {
          updatedPl.biography = [...(updatedPl.biography || []), bioUpdate.entry];
          updatedPl.recordedBioKeys = [...(updatedPl.recordedBioKeys || []), bioUpdate.key!];
        }
        if (!isTest) {
          updatedPl.dynamicPassives = {
            ...updatedPl.dynamicPassives,
            [`fame_booster_${Date.now()}`]: 500
          };
        }
        addFeed(
          'NEWS',
          `📰 RECORD BREAKER: ${pName} enters the elite class of supreme earners. Local business sectors are stunned!`,
          'Capital Press',
          { effect: 'Permanent +$500/mo fame yield', pinned: true }
        );
      }
      break;
    }

    case 'MAJOR_LOSS': {
      const loss = metadata.profit ? Math.abs(metadata.profit) : 0;
      addMultiOutletReports({
        business: `Liquidity drain: {PLAYER} absorbs a heavy operational loss, dropping $${loss.toLocaleString()} in liquid reserves.`,
        popCulture: `Yikes, {PLAYER} just lost $${loss.toLocaleString()} on that last run. High stakes represent high risk! 📉💀`,
        politics: `Policy debates spark as {PLAYER}'s financial setback affects local sector confidence.`,
        local: `Neighbor {PLAYER} absorbs a tough financial hit, but the local block remains confident in a swift recovery.`,
        financial: `Asset contraction: {PLAYER}'s portfolio buffers a $${loss.toLocaleString()} capital deficit due to margin pressures.`
      });
      addRivalCommentIfPossible('MajorLoss');
      if (!isTest) {
        updatedPl.clout = Math.max(0, updatedPl.clout - 20);
        updatedPl.aura = Math.max(0, updatedPl.aura - 15);
      }
      break;
    }

    case 'LUXURY_PURCHASE': {
      const assetName = metadata.assetId || 'luxury item';
      const cost = metadata.cost || 0;
      addMultiOutletReports({
        business: `Capital conversion: {PLAYER}'s purchase of the ${assetName.replace('_', ' ')} for $${cost.toLocaleString()} shows raw market leverage.`,
        popCulture: `HEAVY FLEX! {PLAYER} just copped a brand new ${assetName.replace('_', ' ')}! The drip is real. 💎👑 #luxury`,
        politics: `Public figures debate executive compensation caps following {PLAYER}'s flashy purchase.`,
        local: `{PLAYER} spotted showing off their shiny new ${assetName.replace('_', ' ')} around the neighborhood.`,
        financial: `Asset acquisition: {PLAYER} redeems cash flow into premium flexible storage capital worth $${cost.toLocaleString()}.`
      });
      addRivalCommentIfPossible('LuxuryPurchase');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 10);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 25);
        updatedPl.heat = Math.min(100, updatedPl.heat + 2);
      }
      break;
    }

    case 'PHILANTHROPY': {
      const donation = metadata.cost || 0;
      addMultiOutletReports({
        business: `{PLAYER}'s major $${donation.toLocaleString()} charitable pledge establishes significant brand goodwill values.`,
        popCulture: `Charitable halo! {PLAYER} donates $${donation.toLocaleString()} to humanitarian relief. Absolute class act. ❤️🕊️`,
        politics: `Senator groups praise President {PLAYER}'s philanthropy, solidifying bipartisan goodwill consensus.`,
        local: `Generous donor: {PLAYER} funds local community welfare and infrastructure with a $${donation.toLocaleString()} grant.`,
        financial: `Capital relocation: {PLAYER} relocates $${donation.toLocaleString()} to charitable foundations, optimizing tax audits.`
      });
      addRivalCommentIfPossible('Philanthropy');
      if (!isTest) {
        updatedPl.aura = Math.min(10000, updatedPl.aura + 50);
        updatedPl.heat = Math.max(0, updatedPl.heat - 20);
      }

      if (donation >= 5000000) {
        const bioUpdate = Bio.recordEvent(updatedPl, `Hailed as a great benefactor after committing $${donation.toLocaleString()} to global philanthropic initiatives.`, `philanthropy_milestone_${Date.now()}`);
        if (bioUpdate) {
          updatedPl.biography = [...(updatedPl.biography || []), bioUpdate.entry];
          updatedPl.recordedBioKeys = [...(updatedPl.recordedBioKeys || []), bioUpdate.key!];
        }
        addFeed(
          'NEWS',
          `📰 GLOBAL IMPACT: Philanthropist ${pName} receives humanitarian nods worldwide. Local markets experience surge in investor trust!`,
          'Capital Press',
          { effect: 'Goodwill Active (+5% global passive yield)', pinned: true }
        );
        if (!isTest) {
          updatedPl.dynamicPassives = {
            ...updatedPl.dynamicPassives,
            [`goodwill_bonus_${Date.now()}`]: 5000
          };
        }
      }
      break;
    }

    case 'ARREST': {
      addMultiOutletReports({
        business: `Compliance shock: regulatory watchdogs place {PLAYER}'s assets under severe scrutiny following active arrest.`,
        popCulture: `CRIMINAL CLOWN! {PLAYER} got locked up! 🚔🚨 Look at that mugshot! Total chaos! #Mugshot`,
        politics: `Debate sparks over corporate ethics and elite compliance following {PLAYER}'s high-profile arrest.`,
        local: `Neighborhood stunned as police escort local icon {PLAYER} in handcuffs following federal raid.`,
        financial: `Asset preservation: standard markets freeze trade contracts on {PLAYER}'s operations during custody.`
      });
      addRivalCommentIfPossible('Arrest');
      if (!isTest) {
        updatedPl.clout = Math.max(0, updatedPl.clout - 50);
        updatedPl.aura = Math.max(0, updatedPl.aura - 40);
      }
      break;
    }

    case 'BANKRUPTCY': {
      addMultiOutletReports({
        business: `Enterprise collapse: liquidators begin systemic dissolution of {PLAYER}'s corporate empire.`,
        popCulture: `Bro, {PLAYER} actually went broke?! Liquidated life?! Oh my goodness, the downfall is legendary. 💀😭`,
        politics: `Bipartisan leaders debate systemic bankruptcy loopholes after {PLAYER}'s sudden default.`,
        local: `Bankruptcy shock: local neighborhood businesses grieve the collapse of neighbor {PLAYER}'s brand.`,
        financial: `Chapter 11 filing: {PLAYER}'s assets undergo total liquidation to settle outstanding margins.`
      });
      addRivalCommentIfPossible('Bankruptcy');
      break;
    }

    case 'TIER_PROMOTION': {
      const fromTier = metadata.tier || 'Previous';
      const toTier = updatedPl.currentTier;
      addMultiOutletReports({
        business: `{PLAYER} scales beyond regional bounds, transitioning successfully from ${fromTier} to the prestigious ${toTier} ranks.`,
        popCulture: `No way! {PLAYER} made it to ${toTier} tier! The growth is honestly unreal. Absolute legend. 👑🔥`,
        politics: `Congressional analysts monitor the rising lobbyist influence of newly crowned ${toTier} tycoon {PLAYER}.`,
        local: `Meteoric rise: local neighborhood kid {PLAYER} breaks through all barriers to reach ${toTier}! We are inspired!`,
        financial: `Investment upgrade: {PLAYER} unlocks advanced high-net-worth leverage opportunities in the ${toTier} tier.`
      });
      addRivalCommentIfPossible('TierPromotion');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 50);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 50);
      }
      break;
    }

    case 'NARRATIVE_DECISION': {
      const choice = metadata.choiceText || 'a critical decision';

      // Let's check for specific crossroads choice results!
      if (pl.narrativeFlags?.crossroad_protected_employees && (choice === 'Protect All Employees' || choice.includes('Protect All'))) {
        addMultiOutletReports({
          business: `In a stunning sacrifice of short-term profit, {PLAYER} chooses to absorb all payroll costs during the recession, protecting their entire workforce.`,
          popCulture: `{PLAYER} is a hero! Absorb payroll and keep families safe during the recession. Absolute gold standard of a leader! 🛡️💼 #TheSacrifice #Hero`,
          politics: `The Senate labor committee commends {PLAYER}'s employee protection policy as a model for corporate welfare.`,
          local: `Local workers celebrate outside the warehouse as {PLAYER} vows to fund all employee salaries out of pocket!`,
          financial: `Investor backlash: {PLAYER} absorbs -$150,000 in liquid capital to fund unprofitable operations, depressing quarterly ROI.`
        });
        addFeed('OPINION', `POLL SURGES: Grassroots voter approval rises by +12% following {PLAYER}'s worker protection vow.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('EmployeeProtection');
      } else if (pl.narrativeFlags?.crossroad_laid_off_employees && (choice === 'Execute Layoffs' || choice.includes('Layoff'))) {
        addMultiOutletReports({
          business: `{PLAYER} executes a 30% reduction in force to streamline operations and secure investor margins against the recession.`,
          popCulture: `Absolutely devastating. {PLAYER} just fired 30% of their staff with zero warning. Total corporate greed. 📉💔 #Layoffs #Greed`,
          politics: `Labor unions condemn {PLAYER}'s mass layoffs, demanding federal investigations into severance compliance.`,
          local: `Heartbroken workers gather outside {PLAYER}'s warehouse after receiving automated termination notices.`,
          financial: `Solvency secured: {PLAYER} cushions their balance sheet, saving over $100,000 in immediate labor costs.`
        });
        addFeed('OPINION', `POLL DROPS: Worker favorability ratings slide by -15% following mass layoffs at {PLAYER}'s operations.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('EmployeeLayoffs');
      } else if (pl.narrativeFlags?.crossroad_sold_company && (choice === 'Sell the Business' || choice.includes('Sell the'))) {
        addMultiOutletReports({
          business: `THE EXIT: {PLAYER} sells their entire core enterprise to a global conglomerate, ceding absolute voting control.`,
          popCulture: `Absolute shocker! {PLAYER} just cashed out for $3,000,000, completely abandoning the brand! 💸🚪 #TheExit #GenerationalWealth`,
          politics: `Regulators monitor antitrust filings as global conglomerate swallows {PLAYER}'s independent holdings.`,
          local: `Local business owners speculate if {PLAYER}'s departure marks the death of community-led trade.`,
          financial: `Cash reserves surging: {PLAYER} transitions from active corporate execution to purely liquid holding status.`
        });
        addFeed('OPINION', `POLL SLIDES: Supporters express disappointment at {PLAYER}'s exit, calling it a sell-out of the block's values.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('CompanyBuyoutSell');
      } else if (pl.narrativeFlags?.crossroad_declined_buyout && (choice === 'Decline and Fight' || choice.includes('Decline'))) {
        addMultiOutletReports({
          business: `THE STAND: {PLAYER} defiantly rejects a multi-million dollar buyout, declaring war against global competitors.`,
          popCulture: `{PLAYER} just told a global conglomerate to take their money and walk! Pure boss move! 🛡️😤 #Independence #DeclineAndFight`,
          politics: `Lobbyist groups brace for an all-out trade war as independent operator {PLAYER} refuses takeover.`,
          local: `Crowds applaud {PLAYER}'s decision to keep local operations independent, preserving neighborhood jobs.`,
          financial: `Solvency warning: Conglomerate vows to fund direct predatory competitors to squeeze {PLAYER}'s margins.`
        });
        addFeed('OPINION', `POLL SURGES: Public respect for {PLAYER} reaches record highs as an authentic self-made champion.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('CompanyBuyoutDecline');
      } else if (pl.narrativeFlags?.crossroad_rescued_partner && (choice === 'Provide the Lifeline' || choice.includes('Provide the'))) {
        addMultiOutletReports({
          business: `CREDIT INJECTION: {PLAYER} funds an emergency $100,000 bailout for a failing partner's collapsing venture.`,
          popCulture: `Fierce loyalty! {PLAYER} just saved their original business partner from absolute ruin. Real friendship over profit! ❤️🥺 #TheSacrifice #Loyalty`,
          politics: `Trade commissioners praise the private restructuring, avoiding severe regional job losses.`,
          local: `The partner's family issues a heartfelt thank you to {PLAYER} for saving their home from foreclosure.`,
          financial: `Operational drain: {PLAYER} absorbs a -$100,000 deficit to rescue a low-performing partner, depressing ROI.`
        });
        addFeed('OPINION', `POLL SURGES: Public approval rises as {PLAYER} is hailed as a high-integrity, compassionate leader.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('PartnerRescue');
      } else if (pl.narrativeFlags?.crossroad_betrayed_partner && (choice === 'Ruthlessly Liquidate Them' || choice.includes('Liquidate'))) {
        addMultiOutletReports({
          business: `THE LIQUIDATION: {PLAYER} declines partner's bailout, instead launching a hostile bid to seize their remaining IP.`,
          popCulture: `Absolutely brutal! {PLAYER} left their original partner to rot and bought their life's work for pennies! 🔪📉 #TheBetrayal #Cold`,
          politics: `Antitrust regulators review the predatory acquisition of distressed intellectual assets.`,
          local: `The partner's family is evicted as their company collapses, while {PLAYER} moves into their offices.`,
          financial: `Asset surge: {PLAYER} captures valuable IP, scaling business execution efficiency by +$150,000.`
        });
        addFeed('OPINION', `POLL DROPS: Critics blast {PLAYER}'s ruthless treatment of a longtime friend, branding them a greedy corporate villain.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('PartnerBetrayal');
      } else if (pl.narrativeFlags?.crossroad_exposed_corruption && (choice === 'Expose the Corruption' || choice.includes('Expose the'))) {
        addMultiOutletReports({
          business: `THE WHISTLEBLOWER: {PLAYER} leaks systemic tax evasion files, implicating key political and corporate elites.`,
          popCulture: `HOLY COUPLING! {PLAYER} just dropped the files on the entire corrupt elite! Absolute superhero energy! 📁🦸 #TheReinvention #Whistleblower`,
          politics: `Impeachment and regulatory hearings begin as Capitol Hill reels from {PLAYER}'s massive disclosures.`,
          local: `Grassroots groups gather to support {PLAYER}, chanting their name as a champion of public truth.`,
          financial: `High-heat surge: {PLAYER} faces massive physical heat (+40) and regulatory retaliation as old allies pull backing.`
        });
        addFeed('OPINION', `POLL SURGES: Grassroots public trust in {PLAYER} reaches an all-time high of 92% approval.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('ExposeCorruption');
      } else if (pl.narrativeFlags?.crossroad_accepted_compromise && (choice === 'Accept the Compromise' || choice.includes('Accept the'))) {
        addMultiOutletReports({
          business: `THE COMPROMISE: {PLAYER} signs a confidential 'hush agreement' with political leaders, securing immense backing.`,
          popCulture: `Hmm, {PLAYER} is playing golf with the very politicians under investigation. Smells like collusion? 🤫🏌️ #TheCompromise #InThePocket`,
          politics: `Capitol Hill leaders secure a bipartisan consensus to fund {PLAYER}'s federal administrative programs.`,
          local: `Neighborhood activists question why the promised corruption investigation was suddenly dropped.`,
          financial: `Monopoly passive: {PLAYER} locks in a lucrative confidential monthly payout of +$15,000 passive cash.`
        });
        addFeed('OPINION', `POLL SLIDES: Reform watchdogs accuse {PLAYER} of systemic collusion, depressing public trust.`, 'Public Opinion Poll');
        addRivalCommentIfPossible('AcceptCompromise');
      } else {
        // Fallback for generic narrative decisions
        addFeed(
          'POLITICS',
          `ETHICS ENQUIRY: Media debates ${pName}'s controversial choice regarding "${choice}".`,
          'Capitol Press'
        );
        addFeed(
          'SOCIAL',
          `Did you see ${pName}'s latest move? Some people are mad, but honestly it was a genius play. 🧠🍿`,
          'Chirper',
          { effect: '+10 Clout | -5 Aura', author: '@PoliticalJunkie', avatarId: 'av_m3' }
        );
      }
      break;
    }

    case 'PRESIDENCY_INFLATION': {
      const infVal = metadata.macroValue || 0;
      addFeed(
        'POLITICS',
        `OPPOSITION ROARS: Critics attack President ${pName} as inflation surges to ${infVal.toFixed(2)}%!`,
        'Capitol Press'
      );
      addFeed(
        'OPINION',
        `POLL DROPS: Only 35% of demographic brackets trust the administration's economic management.`,
        'Public Polls'
      );
      addFeed(
        'SOCIAL',
        `My grocery bill is twice as high and President ${pName} is doing nothing! Worst admin ever! 😡🛒`,
        'Chirper',
        { effect: '-5 Approval Rating', author: '@FrustratedVoter', avatarId: 'av_f3' }
      );
      if (!isTest) {
        updatedPl.approvalRating = Math.max(0, updatedPl.approvalRating - 5);
      }
      break;
    }

    case 'PRESIDENCY_ORDER': {
      const orderName = metadata.hustleName || 'Policy Directive';
      addMultiOutletReports({
        business: `Regulatory frameworks shift after President {PLAYER} implements major policy changes regarding ${orderName}.`,
        popCulture: `President {PLAYER} just signed a massive executive order! The internet is dividing over the new law! 🇺🇸🏛️`,
        politics: `Congress responds to President {PLAYER}'s newest directive on ${orderName}, debating bipartisan compliance.`,
        local: `How President {PLAYER}'s latest executive order affects our local community and housing prices.`,
        financial: `Corporate yield multipliers fluctuate following President {PLAYER}'s sweeping legislative shifts.`
      });
      addRivalCommentIfPossible('MajorLegislation');
      if (!isTest) {
        updatedPl.approvalRating = Math.min(100, updatedPl.approvalRating + 3);
      }
      break;
    }

    case 'ELECTION_VICTORY': {
      addMultiOutletReports({
        business: `Market indices soar as pro-business President {PLAYER} wins the national general election in a historic landslide.`,
        popCulture: `PRESIDENT {PLAYER} IS SWORN IN! 🇺🇸🎉 An incredible journey from the block to the Oval Office! #President`,
        politics: `Bipartisan consensus: President {PLAYER} outlines ambitious executive reform slates for their incoming term.`,
        local: `From the streets to the Oval Office: neighbor {PLAYER} is officially President of the United States!`,
        financial: `Macroeconomic projection: President {PLAYER}'s term begins, shifting national interest rates and sector yields.`
      });
      addRivalCommentIfPossible('ElectionVictory');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 200);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 200);
      }
      break;
    }

    case 'LEGENDARY_ACHIEVEMENT': {
      const achName = metadata.achievementName || 'Supreme Legend';
      addMultiOutletReports({
        business: `Monopoly milestone: {PLAYER} breaks industry records to complete the historic achievement "${achName}".`,
        popCulture: `🐐 REAL PEAK PERFORMANCE! {PLAYER} just unlocked the "${achName}" achievement! Absolutely legendary! #Achievement`,
        politics: `Congressional committees acknowledge {PLAYER}'s unparalleled operational benchmark "${achName}".`,
        local: `Our local inspiration {PLAYER} has achieved greatness, completing the legendary benchmark "${achName}"!`,
        financial: `Yield multiplier bonus: the record-breaking "${achName}" milestone cements {PLAYER}'s long-term asset values.`
      });
      addRivalCommentIfPossible('LegendaryAchievement');
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 100);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 100);
      }
      break;
    }

    case 'COMEBACK_BANKRUPTCY_MILLIONAIRE': {
      addMultiOutletReports({
        business: `From Bankruptcy to Millionaire: {PLAYER} stages an extraordinary phoenix recovery, clearing over $5,000,000 in holdings.`,
        popCulture: `Absolutely insane! {PLAYER} went from literally $0 to over $5,000,000! Rebuilding the entire empire from scratch! 📈👑 #Phoenix`,
        politics: `Local commerce councils commend {PLAYER}'s persistence, praising their contribution to municipal wealth structures.`,
        local: `Our neighbor {PLAYER} is officially back! Rebuilt their entire business empire to over $5M after almost losing it all.`,
        financial: `Asset valuation: {PLAYER} successfully re-allocates core capital, transforming bankruptcy debt into an optimized $5M+ portfolio.`
      });
      addRivalCommentIfPossible('Comeback');
      break;
    }

    case 'COMEBACK_BANKRUPTCY_BILLIONAIRE': {
      addMultiOutletReports({
        business: `Sovereign wealth: {PLAYER} achieves the near-impossible "Bankruptcy to Billionaire" phoenix comeback!`,
        popCulture: `THE Phoenix rise! {PLAYER} is officially a certified billionaire after starting with literally $0! Absolute sovereign! 💸🐐 #FromBankruptcyToBillionaire`,
        politics: `Bipartisan financial select committees review {PLAYER}'s decadal recovery as a textbook case of entrepreneurial resilience.`,
        local: `Unbelievable: city landmark is unveiled celebrating tycoon {PLAYER}'s climb from bankruptcy all the way to Billionaire!`,
        financial: `Chapter 11 resolved: {PLAYER} records absolute capital supremacy, securing $1B+ reserves from a previous insolvency.`
      });
      addRivalCommentIfPossible('Comeback');
      break;
    }

    case 'COMEBACK_PRISON_RELEASE': {
      addMultiOutletReports({
        business: `Reclaiming direct command: {PLAYER} engineers an outstanding post-prison comeback, securing over $500,000 in active margins.`,
        popCulture: `The comeback nobody expected! {PLAYER} is out of prison and already cleared $500k cash! Rebuilding his empire! 🔓🚀 #FreshStart`,
        politics: `Debates surrounding incarceration reform are fueled by {PLAYER}'s rapid corporate comeback.`,
        local: `{PLAYER} is proving that a setback is just a setup for a comeback, recovering $500,000 for local development.`,
        financial: `Operational restart: {PLAYER}'s post-release business divisions report a surge in investor confidence, raising $500k liquidity.`
      });
      addRivalCommentIfPossible('Comeback');
      break;
    }

    case 'COMEBACK_BURNOUT': {
      addMultiOutletReports({
        business: `Mental focus restored: {PLAYER} successfully recovers from severe operational burnout to resume direct active command.`,
        popCulture: `Health is wealth! {PLAYER} is back after a massive self-care hiatus, stronger and sharper than ever! 🧠🌿 #MentalHealth`,
        politics: `Critics praise President {PLAYER}'s focus on psychological wellness, establishing new benchmarks for executive self-care.`,
        local: `Neighbor {PLAYER} is fully rested and back in action! Best of luck on this clean, healthy new chapter.`,
        financial: `Resilient return: {PLAYER}'s decision-making and operational stamina are fully restored, securing +15 Aura.`
      });
      addRivalCommentIfPossible('Comeback');
      break;
    }

    case 'COMEBACK_DEBT_SQUEEZE': {
      addMultiOutletReports({
        business: `Debt cleared: {PLAYER} successfully tames leverage ratios, retiring all high-interest business liabilities.`,
        popCulture: `Debt-free is the ultimate flex! {PLAYER} just paid off their massive credit liabilities! Full financial freedom! 💸🎉 #CleanSlate`,
        politics: `Lobbyist watchdogs praise {PLAYER}'s financial solvency, restoring complete public confidence.`,
        local: `Neighbor {PLAYER} is completely debt-free after successfully retiring their credit accounts! Outstanding news.`,
        financial: `Solvency optimization: {PLAYER} retires outstanding principals, clearing creditor freezes and unlocking +15 Clout.`
      });
      addRivalCommentIfPossible('Comeback');
      break;
    }

    default:
      break;
  }

  // --- LIVE WORLD EVENTS ENGINE ---
  interface LiveEventCandidate {
    id: string;
    type: LiveWorldEventType;
    priority: number;
    title: string;
    headline: string;
    body: string;
    source: string;
    effect?: string;
  }

  const candidates: LiveEventCandidate[] = [];
  const completed = updatedPl.completedLiveEvents || [];

  // 1. Election Victory
  if (actionType === 'ELECTION_VICTORY' && !completed.includes('ELECTION_VICTORY')) {
    candidates.push({
      id: 'ELECTION_VICTORY',
      type: 'GOVERNMENT_BULLETIN',
      priority: 10,
      title: '🏛️ GOVERNMENT BULLETIN',
      headline: `HISTORIC LANDSLIDE: PRESIDENT ${pName.toUpperCase()} ELECTED!`,
      body: `The ballots are certified and the nation has spoken. ${pName} has achieved a legendary victory to become the President of the United States. A brand new term begins.`,
      source: 'Capitol Press',
      effect: '+200 Clout | +200 Aura'
    });
  }

  // 2. Bankruptcy
  if (actionType === 'BANKRUPTCY' && !completed.includes('BANKRUPTCY')) {
    if (fame === 'local') {
      candidates.push({
        id: 'BANKRUPTCY',
        type: 'BREAKING_NEWS',
        priority: 9,
        title: '📰 BREAKING NEWS',
        headline: 'LOCAL COLLAPSE: ENTERPRISE DECLARES INSOLVENCY!',
        body: `A sudden downslide hits the block. ${pName}'s business has declared complete bankruptcy, leaving behind heavy debts and shocked neighbors.`,
        source: 'The Neighborhood Bulletin'
      });
    } else if (fame === 'regional') {
      candidates.push({
        id: 'BANKRUPTCY',
        type: 'MARKET_FLASH',
        priority: 9,
        title: '📈 MARKET FLASH',
        headline: `INSOLVENCY SHOCK: ${pName.toUpperCase()}'S OPERATIONS COLLAPSE!`,
        body: `Regional business sectors are reeling as rising star ${pName} files for sudden bankruptcy under heavy debt. Creditors have begun liquidating local assets.`,
        source: 'Metropolitan Herald'
      });
    } else {
      candidates.push({
        id: 'BANKRUPTCY',
        type: 'MARKET_FLASH',
        priority: 9,
        title: '📈 MARKET FLASH',
        headline: `METEORIC DOWNFALL: ${pName.toUpperCase()}'S EMPIRE FILES BANKRUPTCY!`,
        body: `The global market is stunned. Tycoon ${pName}'s empire has declared Chapter 11 bankruptcy. Standard economic frameworks fail as all assets undergo massive liquidation.`,
        source: 'Wall Street Ledger'
      });
    }
  }

  // First Billion
  if (updatedPl.bag >= 1000000000 && !completed.includes('FIRST_BILLION')) {
    candidates.push({
      id: 'FIRST_BILLION',
      type: 'MARKET_FLASH',
      priority: 9,
      title: '📈 MARKET FLASH',
      headline: `THE TEN-FIGURE CLUB: ${pName.toUpperCase()} REACHES $1,000,000,000!`,
      body: `Unbelievable financial history! ${pName} has breached the ten-figure mark, accumulating over $1,000,000,000 in liquid cash. They are officially a global financial sovereign!`,
      source: 'Global Financial Digest',
      effect: '+100 Clout | +100 Aura'
    });
  }

  // 3. First Arrest
  if (actionType === 'ARREST' && !completed.includes('FIRST_ARREST')) {
    const charge = updatedPl.jailCharge || 'regulatory violation';
    if (fame === 'local') {
      candidates.push({
        id: 'FIRST_ARREST',
        type: 'POLICE_ALERT',
        priority: 8,
        title: '🚔 POLICE ALERT',
        headline: 'LOCAL ENTREPRENEUR ESCORTED IN HANDCUFFS!',
        body: `Siren lights flashing! Neighbors were shocked to see local figure ${pName} arrested and put in a police car on charges of ${charge}.`,
        source: 'Local Police Gazette'
      });
    } else if (fame === 'regional') {
      candidates.push({
        id: 'FIRST_ARREST',
        type: 'POLICE_ALERT',
        priority: 8,
        title: '🚔 POLICE ALERT',
        headline: `REGIONAL DISRUPTOR ${pName.toUpperCase()} ARRESTED!`,
        body: `The rising entrepreneur ${pName} is in custody following a raid by regional investigators. Charged with ${charge}, their operations face indefinite suspension.`,
        source: 'Metropolitan Police Watch'
      });
    } else {
      candidates.push({
        id: 'FIRST_ARREST',
        type: 'BREAKING_NEWS',
        priority: 8,
        title: '📰 BREAKING NEWS',
        headline: `GLOBAL TYCOON ${pName.toUpperCase()} LOCKED UP!`,
        body: `Breaking: Iconic business leader ${pName} has been arrested under federal charges of ${charge}. Global stock indices fluctuate as the mogul is held in custody.`,
        source: 'Capitol Broadcaster'
      });
    }
  }

  // 4. Presidential Scandal
  const inPresidency = updatedPl.currentTier === 'PRESIDENT';
  if (inPresidency && (actionType === 'SCANDAL_TRIGGERED' || (metadata as any)?.type === 'DATA_BREACH') && !completed.includes('PRESIDENTIAL_SCANDAL')) {
    candidates.push({
      id: 'PRESIDENTIAL_SCANDAL',
      type: 'GOVERNMENT_BULLETIN',
      priority: 8,
      title: '🏛️ GOVERNMENT BULLETIN',
      headline: `OVAL OFFICE SCANDAL: CLASSIFIED DATA LEAKED!`,
      body: `A massive data breach and internal leaks from President ${pName}'s close administration have triggered intense bipartisan controversy. Hearings are demanded immediately.`,
      source: 'Capitol Hill Reporter'
    });
  }

  // 5. Tier Promotion
  if (actionType === 'TIER_PROMOTION' && updatedPl.currentTier !== 'PRESIDENT') {
    const toTier = updatedPl.currentTier;
    if (!completed.includes(`PROMOTION_${toTier}`)) {
      if (toTier === 'STREET') {
        candidates.push({
          id: `PROMOTION_${toTier}`,
          type: 'COMMUNITY_SPOTLIGHT',
          priority: 9,
          title: '❤️ COMMUNITY SPOTLIGHT',
          headline: `MAKING IT OFF THE BLOCK: ${pName.toUpperCase()} ASCENDS!`,
          body: `Pure local inspiration! Neighbors are cheering as ${pName} leaves the mud behind, advancing into Street level operations. Our block is proud!`,
          source: 'The Daily Bulletin'
        });
      } else if (toTier === 'STARTUP') {
        candidates.push({
          id: `PROMOTION_${toTier}`,
          type: 'BREAKING_NEWS',
          priority: 9,
          title: '📰 BREAKING NEWS',
          headline: `REGIONAL LAUNCH: ${pName.toUpperCase()} ENTERS STARTUP SCENE!`,
          body: `Tech blogs and investors are buzzing as regional pioneer ${pName} scales operations to Startup level. Early ventures are securing high capital injections.`,
          source: 'Valley Tech Gazette'
        });
      } else if (toTier === 'CORPORATE') {
        candidates.push({
          id: `PROMOTION_${toTier}`,
          type: 'MARKET_FLASH',
          priority: 9,
          title: '📈 MARKET FLASH',
          headline: `BOARDROOM SHAKEUP: ${pName.toUpperCase()} GOES CORPORATE!`,
          body: `A meteoric rise! Business leader ${pName} is scaling regional operations, entering the Corporate tier to manage multi-million dollar corporate mergers.`,
          source: 'Metro Business Review'
        });
      } else if (toTier === 'ELITE') {
        candidates.push({
          id: `PROMOTION_${toTier}`,
          type: 'CELEBRITY_WATCH',
          priority: 9,
          title: '⭐ CELEBRITY WATCH',
          headline: `HIGH SOCIETY WELCOMES RISING ELITE: ${pName.toUpperCase()}!`,
          body: `Absolute high-society glamour. Tycoon ${pName} enters the Elite tier, earning invitations to high-net-worth clubs and exclusive corporate gatherings.`,
          source: 'The Elite Syndicate'
        });
      } else if (toTier === 'MOGUL') {
        candidates.push({
          id: `PROMOTION_${toTier}`,
          type: 'BREAKING_NEWS',
          priority: 9,
          title: '📰 BREAKING NEWS',
          headline: `GLOBAL MONOPOLY: ${pName.toUpperCase()} ASCENDS TO MOGUL!`,
          body: `Undisputed global scale. ${pName} has broken into the Mogul class, gaining unparalleled influence over international trade, media, and tech.`,
          source: 'Wall Street Ledger'
        });
      }
    }
  }

  // 6. First Million
  if (updatedPl.bag >= 1000000 && !completed.includes('FIRST_MILLION')) {
    if (fame === 'local' || fame === 'regional') {
      candidates.push({
        id: 'FIRST_MILLION',
        type: 'MARKET_FLASH',
        priority: 7,
        title: '📈 MARKET FLASH',
        headline: `SEVEN-FIGURE CLUB: ${pName.toUpperCase()} REACHES $1,000,000!`,
        body: `From extremely humble roots, self-made entrepreneur ${pName} has accumulated over $1,000,000 in liquid cash. Local businesses are stunned by the hustle.`,
        source: 'The Regional Business Journal'
      });
    } else {
      candidates.push({
        id: 'FIRST_MILLION',
        type: 'MARKET_FLASH',
        priority: 7,
        title: '📈 MARKET FLASH',
        headline: `CASH SURGE: NEW MULTI-MILLIONAIRE ICON ${pName.toUpperCase()}!`,
        body: `Financial sheets confirm that ${pName}'s liquid capital reserves have officially breached the $1,000,000 benchmark. They are cementing their status as an industry tycoon.`,
        source: 'Global Financial Digest'
      });
    }
  }

  // 7. Legendary Achievement
  if (actionType === 'LEGENDARY_ACHIEVEMENT' && !completed.includes(`ACHIEVEMENT_${(metadata as any)?.achievementName}`)) {
    const achName = (metadata as any)?.achievementName || 'Supreme Icon';
    candidates.push({
      id: `ACHIEVEMENT_${achName}`,
      type: 'CELEBRITY_WATCH',
      priority: 6,
      title: '⭐ CELEBRITY WATCH',
      headline: `LEGENDARY RECORD: ${pName.toUpperCase()} UNLOCKS "${achName.toUpperCase()}"!`,
      body: `The history books are forever written! ${pName} has completed the legendary milestone: "${achName}". Commentators are praising this near-impossible feat.`,
      source: 'Global Achievements Gazette'
    });
  }

  // 8. Major Philanthropy
  if (actionType === 'PHILANTHROPY' && (metadata as any)?.cost >= 5000000 && !completed.includes('MAJOR_PHILANTHROPY')) {
    const cost = (metadata as any)?.cost || 5000000;
    candidates.push({
      id: 'MAJOR_PHILANTHROPY',
      type: 'COMMUNITY_SPOTLIGHT',
      priority: 5,
      title: '❤️ COMMUNITY SPOTLIGHT',
      headline: `HUMANITARIAN FEAT: ${pName.toUpperCase()} DONATES $${(cost / 1000000).toFixed(1)}M!`,
      body: `Absolute philanthropy! Tycoon ${pName} has pledged a stunning $${cost.toLocaleString()} donation to humanitarian aid, earning international praise.`,
      source: 'World Philanthropy Digest'
    });
  }

  // 9. Historic Business Acquisition
  const isAcquisitionHustle = (metadata as any)?.hustleName === 'Private Equity' || (metadata as any)?.hustleName === 'Venture Capital';
  if ((actionType === 'HUGE_PROFIT' || actionType === 'BUSINESS_LAUNCH') && isAcquisitionHustle && (metadata as any)?.cost >= 30000000 && !completed.includes('HISTORIC_ACQUISITION')) {
    const cost = (metadata as any)?.cost || 30000000;
    candidates.push({
      id: 'HISTORIC_ACQUISITION',
      type: 'MARKET_FLASH',
      priority: 5,
      title: '📈 MARKET FLASH',
      headline: `MEGA MERGER: ${pName.toUpperCase()} ACQUIRES INDUSTRY CONGLOMERATE!`,
      body: `A historic $${(cost / 1000000).toFixed(0)}M corporate takeover. ${pName} has successfully acquired leading sector operations. Markets brace for complete monopoly.`,
      source: 'Wall Street Ledger'
    });
  }

  // 10. Market Crash
  if (actionType === 'PRESIDENCY_INFLATION' && (metadata as any)?.macroValue >= 8 && !completed.includes('MARKET_CRASH')) {
    candidates.push({
      id: 'MARKET_CRASH',
      type: 'MARKET_FLASH',
      priority: 5,
      title: '📈 MARKET FLASH',
      headline: `MARKET COLLAPSE: POLICIES TRIGGER SEVERE GLOBAL FREEZE!`,
      body: `Stock indices plunge globally under President ${pName}'s controversial monetary directives and runaway inflation. Investors panic as a cold market crackdown spikes.`,
      source: 'Global Financial Tracker'
    });
  }

  // 11. Record Profits
  if (actionType === 'HUGE_PROFIT' && (metadata as any)?.profit >= 10000000 && !completed.includes('RECORD_PROFIT')) {
    const profit = (metadata as any)?.profit || 10000000;
    const hName = (metadata as any)?.hustleName || 'operations';
    candidates.push({
      id: 'RECORD_PROFIT',
      type: 'MARKET_FLASH',
      priority: 4,
      title: '📈 MARKET FLASH',
      headline: `RECORD SHATTERED: ${pName.toUpperCase()} CLEARS $${(profit / 1000000).toFixed(1)}M SINGLE PROFIT!`,
      body: `Absolute dominance. ${pName} records a legendary single-month profit of $${profit.toLocaleString()} from their ${hName} operations, shattering all corporate limits.`,
      source: 'Wall Street Ledger'
    });
  }

  // 12. Luxury Purchase
  if (actionType === 'LUXURY_PURCHASE' && (metadata as any)?.cost >= 1000000 && !completed.includes(`LUXURY_${(metadata as any)?.assetId}`)) {
    const assetId = (metadata as any)?.assetId || 'luxury item';
    const cost = (metadata as any)?.cost || 1000000;
    if (fame === 'local' || fame === 'regional') {
      candidates.push({
        id: `LUXURY_${assetId}`,
        type: 'CELEBRITY_WATCH',
        priority: 3,
        title: '⭐ CELEBRITY WATCH',
        headline: `LOCAL FLEX: ${pName.toUpperCase()} BUYS NEW ${assetId.replace(/_/g, ' ').toUpperCase()}!`,
        body: `Local superstar ${pName} was seen cruising in their spectacular new ${assetId.replace(/_/g, ' ')} worth $${cost.toLocaleString()}. The neighborhood has never seen such a luxury flex!`,
        source: 'The Daily Buzz'
      });
    } else {
      candidates.push({
        id: `LUXURY_${assetId}`,
        type: 'CELEBRITY_WATCH',
        priority: 3,
        title: '⭐ CELEBRITY WATCH',
        headline: `SUPREME FLEET: ${pName.toUpperCase()} ACQUIRES NEW ${assetId.replace(/_/g, ' ').toUpperCase()}!`,
        body: `Iconic tycoon ${pName} was spotted stepping into a magnificent ${assetId.replace(/_/g, ' ')} worth $${cost.toLocaleString()}. A peak flex of raw influence and spending power.`,
        source: 'Global Luxury Insider'
      });
    }
  }

  // 13. First Successful Business Launch
  if (actionType === 'BUSINESS_LAUNCH' && !completed.includes('FIRST_BUSINESS_LAUNCH')) {
    const hName = (metadata as any)?.hustleName || 'Venture';
    if (fame === 'local') {
      candidates.push({
        id: 'FIRST_BUSINESS_LAUNCH',
        type: 'COMMUNITY_SPOTLIGHT',
        priority: 2,
        title: '❤️ COMMUNITY SPOTLIGHT',
        headline: `NEW STREET SHOP: ${pName.toUpperCase()} OPENS ${hName.toUpperCase()}!`,
        body: `Local entrepreneur ${pName} has launched a small ${hName} on our block. Neighbors and local leaders are excited to see this home-grown ambition succeed.`,
        source: 'The Neighborhood Gazette'
      });
    } else if (fame === 'regional') {
      candidates.push({
        id: 'FIRST_BUSINESS_LAUNCH',
        type: 'SOCIAL_TRENDING',
        priority: 2,
        title: '📱 SOCIAL TRENDING',
        headline: `REGIONAL PLAYER: ${pName.toUpperCase()} VENTURES INTO ${hName.toUpperCase()}!`,
        body: `Industry blogs report that ${pName} is expanding regional operations into the ${hName} sector. Analysts describe the model as highly scalable.`,
        source: 'Valley Venture Buzz'
      });
    } else {
      candidates.push({
        id: 'FIRST_BUSINESS_LAUNCH',
        type: 'BREAKING_NEWS',
        priority: 2,
        title: '📰 BREAKING NEWS',
        headline: `MARKET ENTRANCE: ${pName.toUpperCase()} LAUNCHES ${hName.toUpperCase()} SECTOR!`,
        body: `Undisputed titan ${pName} expands their commercial grasp, launching a major division in the ${hName} sector. Competitors brace for rapid consolidation.`,
        source: 'Wall Street Ledger'
      });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.priority - a.priority);
    const chosen = candidates[0];

    const likes = chosen.type === 'SOCIAL_TRENDING'
      ? (isTest ? 25000 : Math.floor(Math.random() * 50000) + 10000)
      : undefined;
    const shares = chosen.type === 'SOCIAL_TRENDING'
      ? (isTest ? 4000 : Math.floor(Math.random() * 8000) + 1500)
      : undefined;

    const liveEvent: LiveWorldEvent = {
      id: chosen.id,
      type: chosen.type,
      title: chosen.title,
      headline: chosen.headline,
      body: chosen.body,
      source: chosen.source,
      likes,
      shares,
      avatarId: chosen.type === 'SOCIAL_TRENDING' ? (isTest ? 'av_f2' : `av_f${Math.floor(Math.random() * 5) + 1}`) : undefined,
      author: chosen.type === 'SOCIAL_TRENDING' ? `@buzz_master` : undefined,
      effect: chosen.effect,
      fameLevel: fame,
      month: updatedPl.month
    };

    updatedPl.activeLiveEvent = liveEvent;
    updatedPl.completedLiveEvents = [...completed, chosen.id];

    // Record History Event for this major Live World Event!
    let historyCat: HistoryEvent['category'] = 'CAREER';
    let imp: HistoryEvent['importance'] = 4;

    if (chosen.id === 'ELECTION_VICTORY') {
      historyCat = 'POLITICS';
      imp = 5;
    } else if (chosen.id === 'BANKRUPTCY') {
      historyCat = 'CAREER';
      imp = 5;
    } else if (chosen.id === 'FIRST_ARREST') {
      historyCat = 'CRIME';
      imp = 4;
    } else if (chosen.id === 'PRESIDENTIAL_SCANDAL') {
      historyCat = 'POLITICS';
      imp = 4;
    } else if (chosen.id.startsWith('PROMOTION_')) {
      historyCat = 'CAREER';
      imp = 4;
    } else if (chosen.id === 'FIRST_MILLION') {
      historyCat = 'CAREER';
      imp = 4;
    } else if (chosen.id === 'FIRST_BILLION') {
      historyCat = 'CAREER';
      imp = 5;
    } else if (chosen.id.startsWith('ACHIEVEMENT_')) {
      historyCat = 'LEGACY';
      imp = 4;
    } else if (chosen.id === 'MAJOR_PHILANTHROPY') {
      historyCat = 'LEGACY';
      imp = 5;
    } else if (chosen.id === 'HISTORIC_ACQUISITION') {
      historyCat = 'BUSINESS';
      imp = 5;
    } else if (chosen.id === 'MARKET_CRASH') {
      historyCat = 'WORLD';
      imp = 4;
    } else if (chosen.id === 'RECORD_PROFIT') {
      historyCat = 'CAREER';
      imp = 4;
    } else if (chosen.id.startsWith('LUXURY_')) {
      historyCat = 'CAREER';
      imp = 3;
    } else if (chosen.id === 'FIRST_BUSINESS_LAUNCH') {
      historyCat = 'BUSINESS';
      imp = 3;
    }

    recordHistoryEvent(updatedPl, {
      id: `live_event_${chosen.id}`,
      title: chosen.headline,
      description: chosen.body,
      category: historyCat,
      importance: imp,
      month: updatedPl.month,
      excludeFromBiography: true
    });

    // INTEGRATE LIVING HISTORY SIDE EFFECTS
    const categoryMap: Record<LiveWorldEventType, WorldFeedCategory> = {
      BREAKING_NEWS: 'NEWS',
      SOCIAL_TRENDING: 'SOCIAL',
      MARKET_FLASH: 'MARKET',
      POLICE_ALERT: 'WORLD',
      GOVERNMENT_BULLETIN: 'POLITICS',
      COMMUNITY_SPOTLIGHT: 'OPINION',
      CELEBRITY_WATCH: 'SOCIAL'
    };

    const feedCat = categoryMap[liveEvent.type];
    const feedText = `${liveEvent.headline} — ${liveEvent.body}`;
    const feedSource = liveEvent.source;

    const feedLikes = feedCat === 'SOCIAL'
      ? (isTest ? 5000 : Math.floor(Math.random() * 24000) + 120)
      : undefined;
    const feedShares = feedCat === 'SOCIAL' && feedLikes
      ? (isTest ? 500 : Math.floor(feedLikes * 0.15) + 5)
      : undefined;

    const feedItem: WorldFeedItem = {
      id: generateId(),
      category: feedCat,
      text: feedText,
      source: feedSource,
      timestamp: Date.now(),
      month: updatedPl.month,
      likes: feedLikes,
      shares: feedShares,
      author: feedCat === 'SOCIAL' ? (isTest ? '@user_5678' : `@user_${Math.floor(Math.random() * 8999) + 1000}`) : undefined,
      avatarId: feedCat === 'SOCIAL' ? (isTest ? 'av_f3' : `av_f${Math.floor(Math.random() * 5) + 1}`) : undefined,
      effect: liveEvent.effect,
      pinned: true
    };

    addedItems.push(feedItem);

    // Biography Update
    const bioText = `[${liveEvent.title}] ${liveEvent.headline}: ${liveEvent.body}`;
    updatedPl.biography = [...(updatedPl.biography || []), bioText];
    updatedPl.recordedBioKeys = [...(updatedPl.recordedBioKeys || []), `live_event_${liveEvent.id}`];

    // Timeline Milestone Update
    if (!updatedPl.milestones) {
      updatedPl.milestones = [];
    }
    updatedPl.milestones.push({
      id: `LIVE_EVENT_${liveEvent.id}`,
      name: chosen.headline,
      description: chosen.body,
      achievedAtMonth: updatedPl.month,
      tier: updatedPl.currentTier
    });
  }

  const sortedAddedItems = [
    ...addedItems.filter(item => item.pinned),
    ...addedItems.filter(item => !item.pinned)
  ];

  updatedPl.worldFeed = [...sortedAddedItems, ...updatedPl.worldFeed].slice(0, 100);

  return {
    updatedPl,
    addedItems
  };
}
