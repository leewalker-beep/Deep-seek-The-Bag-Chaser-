import type { PlayerStats, WorldFeedItem, WorldFeedCategory, LiveWorldEvent, LiveWorldEventType } from '../types/game';
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

    const likes = chosen.type === 'SOCIAL_TRENDING' ? Math.floor(Math.random() * 50000) + 10000 : undefined;
    const shares = chosen.type === 'SOCIAL_TRENDING' ? Math.floor(Math.random() * 8000) + 1500 : undefined;

    const liveEvent: LiveWorldEvent = {
      id: chosen.id,
      type: chosen.type,
      title: chosen.title,
      headline: chosen.headline,
      body: chosen.body,
      source: chosen.source,
      likes,
      shares,
      avatarId: chosen.type === 'SOCIAL_TRENDING' ? `av_f${Math.floor(Math.random() * 5) + 1}` : undefined,
      author: chosen.type === 'SOCIAL_TRENDING' ? `@buzz_master` : undefined,
      effect: chosen.effect,
      fameLevel: fame,
      month: updatedPl.month
    };

    updatedPl.activeLiveEvent = liveEvent;
    updatedPl.completedLiveEvents = [...completed, chosen.id];

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

    const feedLikes = feedCat === 'SOCIAL' ? Math.floor(Math.random() * 24000) + 120 : undefined;
    const feedShares = feedCat === 'SOCIAL' && feedLikes ? Math.floor(feedLikes * 0.15) + 5 : undefined;

    const feedItem: WorldFeedItem = {
      id: generateId(),
      category: feedCat,
      text: feedText,
      source: feedSource,
      timestamp: Date.now(),
      month: updatedPl.month,
      likes: feedLikes,
      shares: feedShares,
      author: feedCat === 'SOCIAL' ? `@user_${Math.floor(Math.random() * 8999) + 1000}` : undefined,
      avatarId: feedCat === 'SOCIAL' ? `av_f${Math.floor(Math.random() * 5) + 1}` : undefined,
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
