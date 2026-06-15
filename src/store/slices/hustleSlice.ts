import type { StateCreator } from 'zustand';
import type { GameState, PendingUpdate, GameAction } from '../../types/game';
import { HUSTLES, type HustleLevel } from '../../config/hustles/base';
import { MARKET_CONFIGS } from '../../config/marketConfig';
import { calculateHustleMath } from '../../engine/mathEngine';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../../config/tiers';
import { enforceStatCaps } from '../../engine/statEngine';
import { advanceMonth } from '../../engine/advancementEngine';
import { DEATH_MESSAGES } from '../../config/deathMessages';
import { getDominantStat } from '../../utils/endingUtils';
import { getEnding } from '../../config/endings';
import { showConfetti } from '../../components/effects/Confetti';
import { FLEX_ASSETS } from '../../config/flexAssets';
import { getUnlockedHustles, getInitialStats } from '../initialState';
import { executeHustleAction } from '../../engine/hustleEngine';
import { checkAchievements } from '../../engine/achievementEngine';
import { calculateLegacyScore } from '../../engine/legacyEngine';

export interface HustleSlice {
  unlockedHustles: Record<string, boolean>;
  pendingUpdate: PendingUpdate | null;

  executeHustle: (hustleId: string, minigameMultiplier?: number, forceSuccess?: boolean, defer?: boolean) => any;
  applyPendingUpdate: () => void;
  executeBranch: (hustleId: string, branchId: string) => any;
  upgradeHustle: (hustleId: string, branchId?: string) => boolean;
  advanceTier: () => boolean;
  purchaseFlexAsset: (assetId: string) => boolean;
  logAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  logEvent: (type: any, metadata?: any) => void;
  checkMilestones: () => void;
  resetGame: (difficulty?: 1 | 2 | 3) => void;
}

export const createHustleSlice: StateCreator<GameState, [], [], HustleSlice> = (set, get) => ({
  unlockedHustles: getUnlockedHustles(3),
  pendingUpdate: null,

  resetGame: (difficulty = 3) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bag-chaser-save');
    }
    set({
      pl: enforceStatCaps(getInitialStats(difficulty)),
      ph: 'PROLOGUE',
      currentMarket: 'NORMAL',
      news: ['Game reset. Welcome back.'],
      unlockedHustles: getUnlockedHustles(difficulty),
      activeTab: difficulty === 1 ? 'STREET' : 'MUD',
      activeHustleView: null,
      activeNarrative: null,
      deathBadge: null,
      fatalCause: null,
      difficulty,
      pendingUpdate: null,
    });
  },

  logAction: (action) => {
    const state = get();
    const newAction = {
      ...action,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
    set({
      pl: enforceStatCaps({
        ...state.pl,
        actionLog: [newAction, ...(state.pl.actionLog || [])].slice(0, 500),
      }),
    });
  },

  logEvent: (type, metadata = {}) => {
    const state = get();
    const newEvent = {
      id: Math.random().toString(36).substring(7),
      type,
      timestamp: Date.now(),
      playerStats: {
        bag: state.pl.bag,
        clout: state.pl.clout,
        aura: state.pl.aura,
        mental: state.pl.mentalHealth,
        heat: state.pl.heat,
        tier: state.pl.currentTier,
      },
      metadata,
    };
    const updatedPl = enforceStatCaps({
      ...state.pl,
      events: [newEvent, ...(state.pl.events || [])].slice(0, 1000),
    });
    updatedPl.legacyScore = calculateLegacyScore(updatedPl);

    set({
      pl: updatedPl,
    });

    // Check for achievements after logging the event
    if (type !== 'SPECIAL_EVENT' || metadata.type !== 'ACHIEVEMENT_UNLOCKED') {
      const newlyUnlocked = checkAchievements(get(), newEvent);
      newlyUnlocked.forEach(id => get().unlockAchievement(id));
    }
  },

  checkMilestones: () => {
    const state = get();
    const actions = state.pl.actionLog || [];
    const newMilestones = [];

    const vendingCount = actions.filter(a => a.hustleId === 'r_vending').length;
    const houseFlips = actions.filter(a => a.branchId === 'l2a').length;
    const rentals = actions.filter(a => a.branchId === 'l2b').length;
    const totalProfit = actions.reduce((sum, a) => sum + a.netCash, 0);

    if (vendingCount >= 10 && !state.pl.milestones?.some(m => m.id === 'VENDING_KING')) {
      newMilestones.push({ id: 'VENDING_KING', name: 'Vending King', description: 'Own 10 vending machines', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (houseFlips >= 5 && !state.pl.milestones?.some(m => m.id === 'FLIP_MASTER')) {
      newMilestones.push({ id: 'FLIP_MASTER', name: 'Flip Master', description: 'Flip 5 houses', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (rentals >= 5 && !state.pl.milestones?.some(m => m.id === 'LANDLORD')) {
      newMilestones.push({ id: 'LANDLORD', name: 'Landlord', description: 'Own 5 rental properties', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (totalProfit >= 100000 && !state.pl.milestones?.some(m => m.id === 'SIX_FIGURES')) {
      newMilestones.push({ id: 'SIX_FIGURES', name: 'Six Figures', description: 'Earn $100,000 total profit', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }
    if (totalProfit >= 1000000 && !state.pl.milestones?.some(m => m.id === 'MILLIONAIRE')) {
      newMilestones.push({ id: 'MILLIONAIRE', name: 'Millionaire', description: 'Earn $1,000,000 total profit', achievedAtMonth: state.pl.month, tier: state.pl.currentTier });
    }

    // Mastery Check
    const masteredHustles = [...state.pl.masteredHustles];
    Object.keys(HUSTLES).forEach(hId => {
      if (masteredHustles.includes(hId)) return;

      const h = HUSTLES[hId];
      let isMastered = false;

      if (h.levels) {
        const currentLvl = state.pl.hustleLevels[hId] || 1;
        if (currentLvl >= h.levels.length) {
          isMastered = true;
        }
      } else if (h.branches) {
        const nodeId = state.pl.hustleBranchIds[hId] || h.startBranchId;
        const node = nodeId ? h.branches[nodeId] : undefined;

        // Repeatables are mastered at a threshold or if they are terminal
        const isTerminal = node && (!node.nextBranches || node.nextBranches.length === 0);
        const isRepeatableMastery = node?.isRepeatable && (
          (hId === 'r_vending' && state.pl.vendingCount >= 10) ||
          (hId === 'street_eats' && node.level >= 5) ||
          (node.id === 'l2b' && state.pl.rentalCount >= 10)
        );

        if (isTerminal || isRepeatableMastery) {
          isMastered = true;
        }
      }

      if (isMastered) {
        masteredHustles.push(hId);
        newMilestones.push({
          id: `MASTERED_${hId}`,
          name: `Mastered ${h.name}`,
          description: `You've reached the peak of ${h.name}. Mastery Badge awarded!`,
          achievedAtMonth: state.pl.month,
          tier: state.pl.currentTier
        });
        get().logEvent('SPECIAL_EVENT', { type: 'HUSTLE_MASTERY', hustleId: hId, hustleName: h.name });
        showConfetti();
      }
    });

    if (newMilestones.length > 0) {
      set({
        pl: enforceStatCaps({
          ...state.pl,
          milestones: [...(state.pl.milestones || []), ...newMilestones],
          masteredHustles,
        }),
        news: [`🏆 MILESTONE: ${newMilestones.map(m => m.name).join(', ')}`, ...state.news],
      });
    }
  },

  executeBranch: (hustleId, branchId) => {
    const state = get();
    const hustle = HUSTLES[hustleId];
    const branch = hustle?.branches?.[branchId];

    if (!branch) return { success: false, message: 'Branch not found' };

    const market = MARKET_CONFIGS[state.currentMarket];
    const isVending = hustleId === 'r_vending';

    const result = calculateHustleMath(
      hustleId,
      branch,
      branch.level,
      isVending ? 1 : market.expenseMultiplier,
      market.yieldMultiplier,
      market.heatMultiplier,
      1,
      true,
      state.pl.mentalShieldTurns
    );

    if (state.pl.bag < result.cost) return { success: false, message: `Need $${result.cost.toLocaleString()}` };
    if (state.pl.clout < branch.cloutReq) return { success: false, message: `Need ${branch.cloutReq} clout` };
    if (state.pl.aura < branch.auraReq) return { success: false, message: `Need ${branch.auraReq} aura` };

    if (branch.isRepeatable) {
      const currentCount = (hustleId === 'r_vending')
        ? state.pl.vendingCount
        : (branch.id === 'l2a' ? state.pl.flipCount : state.pl.rentalCount);

      if (branch.maxRepeat !== undefined && currentCount >= branch.maxRepeat) {
        return { success: false, message: `Maximum ${branch.maxRepeat} reached` };
      }
    }

    const newBag = state.pl.bag - result.cost + result.yieldCash;
    const newClout = state.pl.clout + result.yieldClout;
    const newAura = state.pl.aura + result.yieldAura;
    const newMental = state.pl.mentalHealth + result.mentalHit;
    const newHeat = state.pl.heat + result.heatHit;

    let newRentalCount = state.pl.rentalCount || 0;
    let newFlipCount = state.pl.flipCount || 0;
    let newVendingCount = state.pl.vendingCount || 0;

    if (hustleId === 'r_vending') {
      newVendingCount++;
    } else if (branch.id === 'l2a') {
      newFlipCount++;
    } else if (branch.id === 'l2b') {
      newRentalCount++;
    }

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    newStats.successfulHustles += 1;
    newStats.lifetimeEarnings += result.yieldCash;

    const nextPl = enforceStatCaps({
      ...state.pl,
      bag: newBag,
      clout: newClout,
      aura: newAura,
      mentalHealth: newMental,
      heat: newHeat,
      mentalShieldTurns: state.pl.mentalShieldTurns + result.shieldTurns,
      rentalCount: newRentalCount,
      flipCount: newFlipCount,
      vendingCount: newVendingCount,
      hustleBranchIds: { ...state.pl.hustleBranchIds, [hustleId]: branchId },
      hustleLevels: { ...state.pl.hustleLevels, [hustleId]: branch.level },
      stats: newStats,
    });
    nextPl.legacyScore = calculateLegacyScore(nextPl);

    set({
      pl: nextPl,
      news: [`${branch.name}: +$${result.yieldCash.toLocaleString()}`, ...state.news.slice(0, 49)],
    });

    const isVendingBuy = hustleId === 'r_vending';
    const isRealEstateBuy = ['l2a', 'l2b', 'l3a'].includes(branchId) && hustleId === 'r_labor';

    if (isVendingBuy) {
      get().logEvent('BUSINESS_PURCHASED', { assetId: 'vending', cost: result.cost });
    } else if (isRealEstateBuy) {
      get().logEvent('PROPERTY_PURCHASED', { branchId, branchName: branch.name, cost: result.cost });
    }

    get().logEvent('HUSTLE_COMPLETED', {
      hustleId,
      hustleName: hustle.name,
      success: true,
      profit: result.yieldCash - result.cost,
      branchId,
      miniGame: hustle.miniGame || branch.miniGame,
      multiplier: 1.0
    });

    (get() as any).updateChallengeProgress('hustle_count', 1);
    (get() as any).updateChallengeProgress('earn_cash', result.yieldCash);
    (get() as any).updateChallengeProgress('clout_gain', result.yieldClout);

    get().logAction({
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: branch.level,
      branchId,
      branchName: branch.name || hustle.name,
      cost: result.cost,
      yieldCash: result.yieldCash,
      yieldClout: result.yieldClout,
      yieldAura: result.yieldAura,
      netCash: result.yieldCash - result.cost,
      success: true,
      passiveAdded: branch.passiveYield || 0,
      marketMult: { yield: market.yieldMultiplier, expense: market.expenseMultiplier, heat: market.heatMultiplier },
      marketName: market.name,
      variation: 0
    });
    get().checkMilestones();

    return { success: true, message: '' };
  },

  executeHustle: (hustleId, minigameMultiplier = 1, forceSuccess, defer) => {
    const state = get();
    const hustle = HUSTLES[hustleId];

    if (!hustle) {
      return {
        success: false, netChange: 0, message: 'Hustle not found',
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    const currentTierIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
    const hustleTierIndex = PROGRESSION_ORDER.indexOf(hustle.tier as any);

    if (hustleTierIndex > currentTierIndex) {
      return {
        success: false, netChange: 0, message: `${hustle.tier} tier locked. Advance your rank first.`,
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    let levelData: any;
    const currentLevel = state.pl.hustleLevels[hustleId] || 1;

    if (hustle.branches) {
      const nodeId = state.pl.hustleBranchIds[hustleId] || hustle.startBranchId;
      levelData = nodeId ? hustle.branches[nodeId] : undefined;
    } else if (hustle.levels) {
      levelData = hustle.levels.find(l => l.level === currentLevel);
    }

    if (!levelData) {
      levelData = { level: 1, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, cloutReq: 0, auraReq: 0 };
    }

    if (state.pl.clout < levelData.cloutReq) {
      return {
        success: false, netChange: 0, message: `Need ${levelData.cloutReq} clout`,
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    if (state.pl.aura < levelData.auraReq) {
      return {
        success: false, netChange: 0, message: `Need ${levelData.auraReq} aura`,
        cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
      };
    }

    if (state.pl.bag < levelData.cost) {
        return {
          success: false, netChange: 0, message: `Need $${levelData.cost.toLocaleString()}`,
          cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
        };
    }

    const result = executeHustleAction(
      hustleId,
      state.pl,
      state.currentMarket,
      levelData,
      currentLevel,
      minigameMultiplier,
      forceSuccess
    );

    const newBag = state.pl.bag - result.cost + result.yieldCash;
    const newDynamicPassives = { ...state.pl.dynamicPassives };
    if (result.passiveAdded !== undefined) {
       newDynamicPassives[hustleId] = (newDynamicPassives[hustleId] || 0) + (result.passiveAdded - (levelData.passiveYield || 0));
    }

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    if (result.success) newStats.successfulHustles += 1;
    newStats.lifetimeEarnings += result.yieldCash;

    const hustleResultPl = enforceStatCaps({
      ...state.pl,
      bag: newBag,
      clout: state.pl.clout + result.yieldClout,
      aura: state.pl.aura + result.yieldAura,
      mentalHealth: state.pl.mentalHealth + result.mentalHit,
      heat: state.pl.heat + result.heatHit,
      legacyPoints: (state.pl.legacyPoints || 0) + (result.legacyGain || 0),
      dynamicPassives: newDynamicPassives,
      rentalCount: state.pl.rentalCount + (hustleId === 'real_estate_empire' && state.pl.realEstateStrategy === 'hold' ? 1 : 0),
      flipCount: state.pl.flipCount + (hustleId === 'real_estate_empire' && state.pl.realEstateStrategy === 'flip' ? 1 : 0),
      stats: newStats,
      lastExecutedHustleId: hustleId,
      streak: result.success ? (state.pl.streak || 0) + 1 : 0,
      hustleLevels: {
        ...state.pl.hustleLevels,
        [hustleId]: currentLevel
      },
      hustleBranchIds: hustle.branches ? {
        ...state.pl.hustleBranchIds,
        [hustleId]: state.pl.hustleBranchIds[hustleId] || hustle.startBranchId || ''
      } : state.pl.hustleBranchIds,
    });

    (get() as any).updateChallengeProgress('hustle_count', 1);
    (get() as any).updateChallengeProgress('earn_cash', result.yieldCash);
    (get() as any).updateChallengeProgress('clout_gain', result.yieldClout);


    if (result.tickerMessages?.some(m => m.text.includes('DATA BREACH'))) {
      get().logEvent('SCANDAL_TRIGGERED', { type: 'DATA_BREACH' });
    }
    if (hustleResultPl.heat > 90) {
      get().logEvent('SCANDAL_TRIGGERED', { type: 'POLICE_RAID_RISK', heat: hustleResultPl.heat });
    }

    const actionLogData = {
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: currentLevel,
      branchId: levelData.id || '',
      branchName: levelData.name || hustle.name,
      cost: result.cost,
      yieldCash: result.yieldCash,
      yieldClout: result.yieldClout,
      yieldAura: result.yieldAura,
      netCash: result.yieldCash - result.cost,
      success: result.success,
      passiveAdded: result.passiveAdded !== undefined ? result.passiveAdded : (levelData.passiveYield || 0),
      marketMult: { yield: 1, expense: 1, heat: 1 },
      marketName: state.currentMarket,
      variation: 0
    };

    const { newPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
      hustleResultPl,
      state.currentMarket
    );

    if (newMarket !== state.currentMarket) {
      get().logEvent('ECONOMIC_EVENT', { from: state.currentMarket, to: newMarket });
    }

    newPl.mentalShieldTurns += (result.shieldTurns || 0);

    if (newPl.rivals) {
      newPl.rivals = newPl.rivals.map(r => ({ ...r, currentBid: 0 }));
    }

    const cappedPl = enforceStatCaps(newPl);

    const executionNews = ` ${result.success ? '✅' : '❌'} ${hustle.name}: ${result.success ? 'Success' : 'Failure'} - Net $${(newBag - state.pl.bag).toLocaleString()}`;
    const finalNews = [
      ...monthNews,
      ...(result.bigWinMessage ? [{ text: result.bigWinMessage, colorClass: 'text-emerald-400 font-black animate-bounce' }] : []),
      executionNews,
      ...(result.tickerMessages || []),
      ...get().news
    ].slice(0, 50);

    let finalPh = state.ph;

    // Recalculate legacy score before saving
    cappedPl.legacyScore = calculateLegacyScore(cappedPl);

    let finalDeathBadge = state.deathBadge;
    let finalFatalCause = state.fatalCause;

    if (shouldDie) {
      const lastHustleId = cappedPl.lastExecutedHustleId || 'DEFAULT';
      const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];
      finalPh = 'POST_MORTEM';
      finalDeathBadge = deathInfo.badge;
      finalFatalCause = deathCause;

      if (finalDeathBadge && !cappedPl.collectedDeathBadges.includes(finalDeathBadge)) {
        cappedPl.collectedDeathBadges.push(finalDeathBadge);
      }

      const finalStat = getDominantStat(cappedPl);
      const ending = getEnding(cappedPl.legacyPoints || 0, finalStat);
      const savedEndings = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');
      if (!savedEndings.includes(ending.title)) {
        savedEndings.push(ending.title);
        localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
      }

      get().logEvent('SPECIAL_EVENT', {
        type: 'ENDING_UNLOCKED',
        title: ending.title,
        legacyPoints: cappedPl.legacyPoints || 0
      });

      // Update best run
      if (cappedPl.stats) {
        if (!cappedPl.stats.bestRunBag || cappedPl.bag > cappedPl.stats.bestRunBag) {
          cappedPl.stats.bestRunBag = cappedPl.bag;
          cappedPl.stats.bestRunTier = cappedPl.currentTier;
          cappedPl.stats.bestRunEnding = ending.title;
        }
      }
    }

    const eventToLog = {
      type: 'HUSTLE_COMPLETED' as const,
      metadata: {
        hustleId,
        hustleName: hustle.name,
        success: result.success,
        profit: result.yieldCash - result.cost,
        level: currentLevel,
        miniGame: hustle.miniGame || levelData.miniGame,
        multiplier: minigameMultiplier
      }
    };

    if (defer) {
      set({
        pendingUpdate: {
          pl: enforceStatCaps(cappedPl),
          news: finalNews,
          currentMarket: newMarket,
          ph: finalPh,
          deathBadge: finalDeathBadge,
          fatalCause: finalFatalCause,
          action: actionLogData,
          event: eventToLog
        }
      });
    } else {
      set({
        pl: cappedPl,
        currentMarket: newMarket,
        news: finalNews,
        ph: finalPh,
        deathBadge: finalDeathBadge,
        fatalCause: finalFatalCause,
      });

      get().logEvent(eventToLog.type, eventToLog.metadata);

      if (result.success) {
        if (hustleId === 'real_estate_empire') {
          get().logEvent('PROPERTY_PURCHASED', { type: state.pl.realEstateType, cost: result.cost });
        } else if (hustleId === 'privateequity') {
          get().logEvent('COMPANY_ACQUIRED', { level: currentLevel, cost: result.cost });
        } else if (hustleId === 'venture_capital') {
          get().logEvent('INVESTMENT_MADE', { sector: state.pl.vcSector, investment: result.cost });
          if (result.yieldCash > result.cost) {
            get().logEvent('MARKET_WIN', { type: 'VC_EXIT', profit: result.yieldCash - result.cost });
          }
        } else if (hustleId === 'hedgefund') {
          if (result.yieldCash > result.cost) {
            get().logEvent('MARKET_WIN', { type: 'TRADE_SUCCESS', profit: result.yieldCash - result.cost });
          }
        } else if (hustleId === 'data_monopoly' || hustleId === 'central_bank_play') {
          get().logEvent('LAW_PASSED', { hustleId, name: hustle.name });
        }

        const activeRival = state.pl.rivals?.find(r => r.currentBid > 0);
        if (activeRival) {
          get().logEvent('RIVAL_DEFEATED', { rivalName: activeRival.name, bid: activeRival.currentBid });
        }
      }

      get().logAction(actionLogData);
      get().checkMilestones();
    }

    return result;
  },

  applyPendingUpdate: () => {
    const state = get();
    if (!state.pendingUpdate) return;

    const { pl, news, currentMarket, ph, deathBadge, fatalCause, action, event } = state.pendingUpdate;
    const updatedPl = enforceStatCaps(pl);
    updatedPl.legacyScore = calculateLegacyScore(updatedPl);

    set({
      pl: updatedPl,
      news,
      currentMarket,
      ph,
      deathBadge,
      fatalCause,
      pendingUpdate: null,
      activeHustleView: null,
    });

    if (event) {
      get().logEvent(event.type, event.metadata);
    }

    get().logAction(action);
    get().checkMilestones();
  },

  upgradeHustle: (hustleId, branchId) => {
    const state = get();
    const hustle = HUSTLES[hustleId];

    if (!hustle) return false;

    let targetNodeData: HustleLevel | undefined;
    let isRepeat = false;

    if (hustle.branches) {
      const currentNodeId = state.pl.hustleBranchIds[hustleId] || hustle.startBranchId;
      const currentNode = currentNodeId ? hustle.branches[currentNodeId] : undefined;

      if (branchId) {
        if (currentNode?.nextBranches?.includes(branchId)) {
          targetNodeData = hustle.branches[branchId];
        }
        else if (branchId === currentNodeId && currentNode?.isRepeatable) {
          const currentCount = (hustleId === 'r_vending')
            ? state.pl.vendingCount
            : (branchId === 'l2a' ? state.pl.flipCount : (branchId === 'l2b' ? state.pl.rentalCount : 0));

          if (!currentNode.maxRepeat || currentCount < currentNode.maxRepeat) {
            targetNodeData = currentNode;
            isRepeat = true;
          }
        }
      }
    } else if (hustle.levels) {
      const currentLevel = state.pl.hustleLevels[hustleId] || 1;
      targetNodeData = hustle.levels.find(l => l.level === currentLevel + 1);
    }

    if (!targetNodeData) return false;

    const market = MARKET_CONFIGS[state.currentMarket];
    const isVending = hustleId === 'r_vending';

    const result = calculateHustleMath(
      hustleId,
      targetNodeData,
      targetNodeData.level,
      isVending ? 1 : market.expenseMultiplier,
      market.yieldMultiplier,
      market.heatMultiplier,
      1,
      true,
      state.pl.mentalShieldTurns
    );

    if (state.pl.bag < result.cost) return false;
    if (state.pl.clout < targetNodeData.cloutReq) return false;
    if (state.pl.aura < targetNodeData.auraReq) return false;

    const newStats = state.pl.stats
      ? { ...state.pl.stats }
      : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

    newStats.totalHustles += 1;
    newStats.successfulHustles += 1;
    newStats.lifetimeEarnings += result.yieldCash;

    const newPl = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - result.cost,
      clout: state.pl.clout + result.yieldClout,
      aura: state.pl.aura + result.yieldAura,
      mentalHealth: state.pl.mentalHealth + result.mentalHit,
      heat: state.pl.heat + result.heatHit,
      mentalShieldTurns: state.pl.mentalShieldTurns + result.shieldTurns,
      stats: newStats,
    });
    newPl.legacyScore = calculateLegacyScore(newPl);

    if (hustle.branches && (branchId || targetNodeData.id)) {
      const nodeId = branchId || targetNodeData.id!;
      newPl.hustleBranchIds = {
        ...state.pl.hustleBranchIds,
        [hustleId]: nodeId
      };
      newPl.hustleLevels = {
        ...state.pl.hustleLevels,
        [hustleId]: targetNodeData.level
      };

      if (hustleId === 'r_vending') {
        newPl.vendingCount += 1;
      } else {
        if (nodeId === 'l2a') newPl.flipCount += 1;
        if (nodeId === 'l2b') newPl.rentalCount += 1;
      }
    } else {
      newPl.hustleLevels = {
        ...state.pl.hustleLevels,
        [hustleId]: targetNodeData.level
      };
    }

    set({
      pl: enforceStatCaps(newPl),
      news: [`${isRepeat ? '🔄' : '⬆️'} ${isRepeat ? 'Purchased' : 'Upgraded'}: ${targetNodeData.name || hustle.name}`, ...state.news.slice(0, 49)]
    });

    get().logAction({
      month: state.pl.month,
      tier: state.pl.currentTier,
      hustleId,
      hustleName: hustle.name,
      level: targetNodeData.level,
      branchId: targetNodeData.id || '',
      branchName: targetNodeData.name || hustle.name,
      cost: result.cost,
      yieldCash: result.yieldCash,
      yieldClout: result.yieldClout,
      yieldAura: result.yieldAura,
      netCash: result.yieldCash - result.cost,
      success: true,
      passiveAdded: targetNodeData.passiveYield || 0,
      marketMult: { yield: market.yieldMultiplier, expense: market.expenseMultiplier, heat: market.heatMultiplier },
      marketName: market.name,
      variation: 0
    });
    get().checkMilestones();

    return true;
  },

  advanceTier: () => {
    const state = get();
    const currentIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
    const nextTier = PROGRESSION_ORDER[currentIndex + 1];

    if (!nextTier) return false;

    const req = TIER_REQUIREMENTS[nextTier];
    const totalFee = req.fee;

    if (state.pl.bag >= req.cash &&
        state.pl.clout >= req.clout &&
        state.pl.aura >= req.aura) {

      if (state.pl.bag < totalFee) {
        set({
          news: [`❌ Cannot advance to ${nextTier}: Need $${Math.floor(totalFee).toLocaleString()} for filing fees and institutional buy-in`, ...state.news.slice(0, 49)]
        });
        return false;
      }

      const nextPl = enforceStatCaps({
        ...state.pl,
        bag: state.pl.bag - totalFee,
        clout: Math.floor(state.pl.clout * 0.6),
        aura: Math.floor(state.pl.aura * 0.6),
        currentTier: nextTier,
      });
      nextPl.legacyScore = calculateLegacyScore(nextPl);

      set({
        pl: nextPl,
        activeTab: nextTier,
        news: [`🎉 ADVANCED to ${nextTier} tier! ${req.description}`, ...state.news.slice(0, 49)]
      });

      get().logEvent('PROMOTION_EARNED', { from: state.pl.currentTier, to: nextTier, fee: totalFee });
      showConfetti();
      get().setActiveTab(nextTier);

      return true;
    }

    const missing = [];
    if (state.pl.bag < req.cash) missing.push(`$${req.cash.toLocaleString()} cash`);
    if (state.pl.clout < req.clout) missing.push(`${req.clout} clout`);
    if (state.pl.aura < req.aura) missing.push(`${req.aura} aura`);

    set({
      news: [`❌ Cannot advance to ${nextTier}: Need ${missing.join(', ')}`, ...state.news.slice(0, 49)]
    });

    return false;
  },

  purchaseFlexAsset: (assetId) => {
    const state = get();
    const asset = FLEX_ASSETS.find(a => a.id === assetId);

    if (!asset) return false;
    if (state.pl.bag < asset.cost) return false;

    const newCount = (state.pl.flexAssets[assetId] || 0) + 1;
    const isVending = assetId === 'vending';

    const plAfterPurchase = enforceStatCaps({
      ...state.pl,
      bag: state.pl.bag - asset.cost,
      flexAssets: {
        ...state.pl.flexAssets,
        [assetId]: newCount
      },
      vendingCount: isVending ? (state.pl.vendingCount + 1) : state.pl.vendingCount
    });
    plAfterPurchase.legacyScore = calculateLegacyScore(plAfterPurchase);

    if (isVending) {
      get().logEvent('BUSINESS_PURCHASED', { assetId: 'vending', cost: asset.cost });
      const { newPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
        plAfterPurchase,
        state.currentMarket
      );

      if (newMarket !== state.currentMarket) {
        get().logEvent('ECONOMIC_EVENT', { from: state.currentMarket, to: newMarket });
      }

      const cappedPl = enforceStatCaps(newPl);

      if (shouldDie) {
        const finalStat = getDominantStat(cappedPl);
        const ending = getEnding(cappedPl.legacyPoints || 0, finalStat);
        const savedEndings = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');
        if (!savedEndings.includes(ending.title)) {
          savedEndings.push(ending.title);
          localStorage.setItem('bag-chaser-endings', JSON.stringify(savedEndings));
        }

        set({
          pl: cappedPl,
          currentMarket: newMarket,
          news: [...monthNews, `💎 Purchased ${asset.name}`, ...state.news.slice(0, 45)],
          ph: 'POST_MORTEM',
          fatalCause: deathCause,
        });
      } else {
        set({
          pl: cappedPl,
          currentMarket: newMarket,
          news: [...monthNews, `💎 Purchased ${asset.name}`, ...state.news.slice(0, 45)]
        });
      }
    } else {
      set({
        pl: plAfterPurchase,
        news: [`💎 Purchased ${asset.name}`, ...state.news.slice(0, 49)]
      });
      get().logEvent('BUSINESS_PURCHASED', { assetId, cost: asset.cost });
    }

    return true;
  },
});
