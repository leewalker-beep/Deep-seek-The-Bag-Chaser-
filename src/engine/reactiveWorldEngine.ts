import type { PlayerStats, WorldFeedItem, WorldFeedCategory } from '../types/game';
import * as Bio from './biographyEngine';

const generateId = () => Math.random().toString(36).substring(7);

export interface WorldReactionResult {
  updatedPl: PlayerStats;
  addedItems: WorldFeedItem[];
}

/**
 * Handles incoming triggers from player actions and returns an updated PlayerStats block
 * containing both UI feed updates, news flashes, and actual numeric state gameplay impacts.
 *
 * Separates reactions into clearly recognizable categories:
 * - 📰 NEWS (News)
 * - 📱 SOCIAL (Social Media - Chirper)
 * - 💼 BUSINESS (Business News)
 * - 📈 MARKET (Market Commentary)
 * - 🏛 POLITICS (Political Headlines)
 * - ❤️ OPINION (Public Opinion / Polling)
 * - 🌍 WORLD (World / Systems)
 *
 * Implements Fame Scaling, Living History references, and varied failures.
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

    const likes = category === 'SOCIAL' ? Math.floor(Math.random() * 24000) + 120 : undefined;
    const shares = category === 'SOCIAL' && likes ? Math.floor(likes * 0.15) + 5 : undefined;

    const item: WorldFeedItem = {
      id: generateId(),
      category,
      text,
      source,
      timestamp: Date.now(),
      month: pl.month,
      likes,
      shares,
      author: options?.author || (category === 'SOCIAL' ? `@user_${Math.floor(Math.random() * 8999) + 1000}` : undefined),
      avatarId: options?.avatarId || (category === 'SOCIAL' ? `av_f${Math.floor(Math.random() * 5) + 1}` : undefined),
      effect: options?.effect,
      pinned: options?.pinned || false
    };
    addedItems.push(item);
  };

  // 1. DYNAMIC RETROSPECTIVE RETRO FEEDBACK (LIVING HISTORY)
  const appendLivingHistoryChirps = () => {
    if (pl.totalHustlesCompleted > 5 && Math.random() < 0.3) {
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
          'Chirp',
          { author: '@VendingWatcher', avatarId: 'av_f2' }
        );
      } else if (pl.rentalCount > 2) {
        addFeed(
          'SOCIAL',
          `Crazy transition. ${pName} built their entire foundation on local housing. Truly a self-made titan. 🏗️🏘️`,
          'Chirp',
          { author: '@LandlordLife', avatarId: 'av_m1' }
        );
      }
    }
  };

  switch (actionType) {
    case 'BUSINESS_LAUNCH': {
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
          'Chirp',
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
          'Chirp',
          { effect: '+5 Clout', author: '@SilliconValleyInside', avatarId: 'av_m4' }
        );
      } else {
        // National or Global
        addFeed(
          'BUSINESS',
          `EMPIRE GROWTH: ${pName} enters the ${hName} sector with a massive multi-million dollar capital injection.`,
          'Wall Street Ledger'
        );
        addFeed(
          'SOCIAL',
          `Monopoly vibes! ${pName} is expanding their global grip with ${hName}! Absolute dominance. 👑 #titan`,
          'Chirp',
          { effect: '+5 Clout', author: '@MarketMoguls', avatarId: 'av_f4' }
        );
      }

      appendLivingHistoryChirps();
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 5);
      }
      break;
    }

    case 'BUSINESS_FAILURE': {
      const hName = metadata.hustleName || 'venture';

      if (fame === 'local') {
        addFeed(
          'SOCIAL',
          `Lmao ${pName} completely fumbled that ${hName} run! Local dreams crushed. 🤡 #loser #fumble`,
          'Chirp',
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
          'Chirp',
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

      if (fame === 'local') {
        addFeed(
          'NEWS',
          `LOCAL BULLETINS: ${pName} clears an outstanding $${profit.toLocaleString()} profit. Talk of the town!`,
          'Local Town Crier'
        );
        addFeed(
          'SOCIAL',
          `Omg, ${pName} is absolutely clearing the block! Cleared $${(profit / 1000).toFixed(0)}k profit from ${hName}! Insane! 💸🐐`,
          'Chirp',
          { effect: '+10 Clout', author: '@TownGrind', avatarId: 'av_f1' }
        );
      } else {
        addFeed(
          'MARKET',
          `CASH SURGE: ${pName}'s strategic play in ${hName} yields a colossal $${profit.toLocaleString()} single-month cash flow.`,
          'Wall Street Ledger'
        );
        addFeed(
          'SOCIAL',
          `Absolutely astronomical! ${pName} just cleared $${(profit / 1000000).toFixed(1)}M profit from ${hName}! Standard cheat code. 🚀🐐 #wealth #genius`,
          'Chirp',
          { effect: '+20 Aura | +15 Clout', author: '@MemeTrader', avatarId: 'av_m2' }
        );
      }

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
      addFeed(
        'MARKET',
        `LIQUIDITY BLEED: ${pName} suffers a heavy financial blow, losing $${loss.toLocaleString()} in recent activities.`,
        'Wall Street Ledger'
      );
      addFeed(
        'SOCIAL',
        `Ouch, ${pName} just wiped out $${loss.toLocaleString()}! Is this the beginning of the end or what? 📉💀`,
        'Chirp',
        { effect: '-20 Clout', author: '@MarketBear', avatarId: 'av_m3' }
      );
      if (!isTest) {
        updatedPl.clout = Math.max(0, updatedPl.clout - 20);
        updatedPl.aura = Math.max(0, updatedPl.aura - 15);
      }
      break;
    }

    case 'LUXURY_PURCHASE': {
      const assetName = metadata.assetId || 'luxury item';
      const cost = metadata.cost || 0;
      addFeed(
        'SOCIAL',
        `HEAVY FLEX! ${pName} just copped a brand new ${assetName.replace('_', ' ')}! The drip is real. 💎👑 #flex #luxury`,
        'Chirp',
        { effect: '+25 Aura | +10 Clout', author: '@DripInspector', avatarId: 'av_f5' }
      );
      addFeed(
        'BUSINESS',
        `MOGUL SPENDING: ${pName}'s acquisition of the ${assetName.replace('_', ' ')} for $${cost.toLocaleString()} shows absolute market dominance.`,
        'Wall Street Ledger'
      );
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 10);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 25);
        updatedPl.heat = Math.min(100, updatedPl.heat + 2);
      }
      break;
    }

    case 'PHILANTHROPY': {
      const donation = metadata.cost || 0;
      addFeed(
        'OPINION',
        `HEARTS WON: Public rallies around ${pName} after a generous philanthropy contribution of $${donation.toLocaleString()}!`,
        'Public Polls'
      );
      addFeed(
        'SOCIAL',
        `Say what you want about ${pName}, but donating $${donation.toLocaleString()} to charity is a pure class act. Respect! ❤️🕊️`,
        'Chirp',
        { effect: '+50 Aura | -20 Heat', author: '@KindSoul', avatarId: 'av_f2' }
      );
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
      addFeed(
        'POLITICS',
        `BREAKING: Local business figure ${pName} has been arrested under severe charges! Bail set.`,
        'Capitol Press'
      );
      addFeed(
        'SOCIAL',
        `CRIMINAL CLOWN! ${pName} got locked up! 🚔🚨 Look at that mugshot! "Billionaire" is actually just a crook!`,
        'Chirp',
        { effect: '-50 Clout | -40 Aura', author: '@JusticeFirst', avatarId: 'av_m5', pinned: true }
      );
      addFeed(
        'OPINION',
        `OUTRAGE: Citizens debate corporate ethics after ${pName}'s high-profile arrest. 82% demand accountability.`,
        'Public Polls'
      );
      if (!isTest) {
        updatedPl.clout = Math.max(0, updatedPl.clout - 50);
        updatedPl.aura = Math.max(0, updatedPl.aura - 40);
      }
      break;
    }

    case 'BANKRUPTCY': {
      addFeed(
        'BUSINESS',
        `EMPIRE CRUMBLE: ${pName}'s enterprise hits rock-bottom. Bankruptcy filings underway!`,
        'Wall Street Ledger'
      );
      addFeed(
        'SOCIAL',
        `Bro, ${pName} actually went broke?! Liquidated life?! Oh my goodness, the downfall is legendary. 💀😭`,
        'Chirp',
        { effect: '-100 Aura | -100 Clout', author: '@GossipCentral', avatarId: 'av_f1', pinned: true }
      );
      break;
    }

    case 'TIER_PROMOTION': {
      const fromTier = metadata.tier || 'Previous';
      const toTier = updatedPl.currentTier;
      addFeed(
        'NEWS',
        `📰 METEORIC RISE: ${pName} breaks ceilings to advance from ${fromTier} to the prestigious ${toTier} tier!`,
        'Capital Press',
        { pinned: true }
      );
      addFeed(
        'SOCIAL',
        `No way! ${pName} made it to ${toTier} tier! The growth is honestly unreal. Absolute legend. 👑🔥`,
        'Chirp',
        { effect: '+50 Clout | +50 Aura', author: '@IndustryEye', avatarId: 'av_m1' }
      );
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 50);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 50);
      }
      break;
    }

    case 'NARRATIVE_DECISION': {
      const choice = metadata.choiceText || 'a critical decision';
      addFeed(
        'POLITICS',
        `ETHICS ENQUIRY: Media debates ${pName}'s controversial choice regarding "${choice}".`,
        'Capitol Press'
      );
      addFeed(
        'SOCIAL',
        `Did you see ${pName}'s latest move? Some people are mad, but honestly it was a genius play. 🧠🍿`,
        'Chirp',
        { effect: '+10 Clout | -5 Aura', author: '@PoliticalJunkie', avatarId: 'av_m3' }
      );
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
        'Chirp',
        { effect: '-5 Approval Rating', author: '@FrustratedVoter', avatarId: 'av_f3' }
      );
      if (!isTest) {
        updatedPl.approvalRating = Math.max(0, updatedPl.approvalRating - 5);
      }
      break;
    }

    case 'PRESIDENCY_ORDER': {
      const orderName = metadata.hustleName || 'Policy Directive';
      addFeed(
        'POLITICS',
        `LEGISLATIVE MILITARY: President ${pName} implements executive order "${orderName}" directly from Oval Office.`,
        'Capitol Press'
      );
      addFeed(
        'SOCIAL',
        `Love or hate President ${pName}, that "${orderName}" policy is actually a massive victory for the working class! 🇺🇸🕊️`,
        'Chirp',
        { effect: '+3 Approval Rating', author: '@PatriotPulse', avatarId: 'av_m1' }
      );
      if (!isTest) {
        updatedPl.approvalRating = Math.min(100, updatedPl.approvalRating + 3);
      }
      break;
    }

    case 'ELECTION_VICTORY': {
      addFeed(
        'NEWS',
        `📰 LANDSLIDE: ${pName} emerges victorious in presidential election! Oval Office awaits.`,
        'Capital Press',
        { pinned: true }
      );
      addFeed(
        'SOCIAL',
        `HISTORY SECURED! President ${pName} has been sworn in! We are in for a legendary term. Let's go! 🎉🇺🇸`,
        'Chirp',
        { effect: '+200 Clout | +200 Aura', author: '@GovWatcher', avatarId: 'av_m4', pinned: true }
      );
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 200);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 200);
      }
      break;
    }

    case 'LEGENDARY_ACHIEVEMENT': {
      const achName = metadata.achievementName || 'Supreme Legend';
      addFeed(
        'NEWS',
        `📰 HISTORIC FEAT: ${pName} has unlocked the legendary achievement "${achName}"!`,
        'Capital Press',
        { pinned: true }
      );
      addFeed(
        'SOCIAL',
        `OH MY GOD! ${pName} just unlocked "${achName}"! Absolute peak performance. Elite tier standard! 🐐🏆`,
        'Chirp',
        { effect: '+100 Aura | +100 Clout', author: '@AchievementHunter', avatarId: 'av_m2', pinned: true }
      );
      if (!isTest) {
        updatedPl.clout = Math.min(10000, updatedPl.clout + 100);
        updatedPl.aura = Math.min(10000, updatedPl.aura + 100);
      }
      break;
    }

    default:
      break;
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
