import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, PlayerStats, MarketType, Tier } from '../types/game';
import { HUSTLES, type HustleLevel } from '../config/hustles/base';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { FLEX_ASSETS } from '../config/flexAssets';
import { calculateHustleMath } from '../engine/mathEngine';
import { advanceMonth } from '../engine/advancementEngine';
import { DEATH_MESSAGES } from '../config/deathMessages';

const getInitialStats = (difficulty: 1 | 2 | 3): PlayerStats => {
  const baseStats = {
    mentalHealth: 100,
    heat: 0,
    month: 0,
    hustleLevels: {},
    hustleBranchIds: {},
    flexAssets: {},
    unlockedAchievements: [],
    rentalCount: 0,
    flipCount: 0,
    vendingCount: 0,
    passiveLaborYield: 0,
    mentalShieldTurns: 0,
    artists: [],
    grammyCount: 0,
    recordLabelLevel: 1,
    actionLog: [],
    milestones: [],
    stats: {
      totalHustles: 0,
      successfulHustles: 0,
      lifetimeEarnings: 0,
    },
  };

  if (difficulty === 1) { // Trust Fund
    return {
      ...baseStats,
      bag: 25000,
      clout: 30,
      aura: 30,
      currentTier: 'STREET',
    };
  } else if (difficulty === 2) { // Middle Grind
    return {
      ...baseStats,
      bag: 5000,
      clout: 15,
      aura: 15,
      currentTier: 'MUD',
    };
  } else { // Grinder (default)
    return {
      ...baseStats,
      bag: 1000,
      clout: 5,
      aura: 5,
      currentTier: 'MUD',
    };
  }
};

const getUnlockedHustles = (difficulty: 1 | 2 | 3): Record<string, boolean> => {
  const allMud = [
    'r_labor',
    'r_delivery',
    'r_plasma',
    'r_ghost_mode',
    'r_scrap',
    'r_flyers',
    'r_sleep',
    'r_vending',
  ];

  if (difficulty === 1) {
    // Trust Fund: all hustles unlocked
    return Object.keys(HUSTLES).reduce((acc, id) => ({ ...acc, [id]: true }), {});
  } else {
    // Both Middle Grind and Grinder now get all MUD hustles
    return allMud.reduce((acc, id) => ({ ...acc, [id]: true }), {});
  }
};

const enforceStatCaps = (pl: PlayerStats): PlayerStats => {
  let maxClout = 50;
  let maxAura = 50;
  const maxMental = 100;

  if (pl.currentTier === 'STREET') { maxClout = 100; maxAura = 100; }
  if (pl.currentTier === 'STARTUP') { maxClout = 200; maxAura = 200; }
  if (pl.currentTier === 'CORPORATE') { maxClout = 500; maxAura = 500; }
  if (pl.currentTier === 'ELITE') { maxClout = 1000; maxAura = 1000; }
  if (pl.currentTier === 'MOGUL') { maxClout = 2000; maxAura = 2000; }
  if (pl.currentTier === 'PRESIDENT') { maxClout = 5000; maxAura = 5000; }

  return {
    ...pl,
    clout: Math.min(pl.clout, maxClout),
    aura: Math.min(pl.aura, maxAura),
    mentalHealth: Math.min(pl.mentalHealth, maxMental),
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      pl: getInitialStats(3),
      ph: 'PROLOGUE',
      currentMarket: 'NORMAL' as MarketType,
      news: ['Welcome to Bag Chaser. The grind begins now.'],
      unlockedHustles: getUnlockedHustles(3),
      activeTab: 'MUD' as Tier,
      activeHustleView: null,
      deathBadge: null,
      fatalCause: null,
      difficulty: 3 as 1 | 2 | 3,

      // Reset game
      resetGame: (difficulty: 1 | 2 | 3 = 3) => {
        set({
          pl: getInitialStats(difficulty),
          ph: 'PROLOGUE',
          currentMarket: 'NORMAL',
          news: ['Game reset. Welcome back.'],
          unlockedHustles: getUnlockedHustles(difficulty),
          activeTab: difficulty === 1 ? 'STREET' : 'MUD',
          activeHustleView: null,
          deathBadge: null,
          fatalCause: null,
          difficulty,
        });
      },

      // Set player name (for prologue)
      setPlayerName: (name: string) => {
        set((state) => ({
          pl: { ...state.pl, name },
          ph: 'PLAYING',
        }));
      },

      // Change active tab
      setActiveTab: (tab: Tier | 'FLEX') => {
        set({ activeTab: tab, activeHustleView: null });
      },

      // Set active hustle view (for detailed panel)
      setActiveHustleView: (hustleId: string | null) => {
        set({ activeHustleView: hustleId });
      },

      // Dismiss narrative
      dismissNarrative: () => {
        set({ activeNarrative: null });
      },

      executeBranch: (hustleId: string, branchId: string) => {
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
          true
        );

        // Check requirements
        if (state.pl.bag < result.cost) return { success: false, message: `Need $${result.cost.toLocaleString()}` };
        if (state.pl.clout < branch.cloutReq) return { success: false, message: `Need ${branch.cloutReq} clout` };
        if (state.pl.aura < branch.auraReq) return { success: false, message: `Need ${branch.auraReq} aura` };

        // Check repeatable limit
        if (branch.isRepeatable) {
          const currentCount = (hustleId === 'r_vending')
            ? state.pl.vendingCount
            : (branch.id === 'l2a' ? state.pl.flipCount : state.pl.rentalCount);

          if (branch.maxRepeat !== undefined && currentCount >= branch.maxRepeat) {
            return { success: false, message: `Maximum ${branch.maxRepeat} reached` };
          }
        }

        // Apply cost and one-time yield
        const newBag = state.pl.bag - result.cost + result.yieldCash;
        const newClout = Math.min(1000, state.pl.clout + result.yieldClout);
        const newAura = Math.min(1000, state.pl.aura + result.yieldAura);
        const newMental = Math.max(0, state.pl.mentalHealth + result.mentalHit);
        const newHeat = Math.min(100, state.pl.heat + result.heatHit);

        // Apply passive income
        let newPassiveYield = state.pl.passiveLaborYield || 0;
        let newRentalCount = state.pl.rentalCount || 0;
        let newFlipCount = state.pl.flipCount || 0;
        let newVendingCount = state.pl.vendingCount || 0;

        if (hustleId === 'r_vending') {
          newVendingCount++;
          // We don't add to newPassiveYield here because vending is handled dynamically in advancementEngine
        } else if (branch.id === 'l2a') {
          newFlipCount++;
        } else if (branch.id === 'l2b') {
          newRentalCount++;
          newPassiveYield += branch.passiveYield || 0;
        } else if (branch.passiveYield) {
          newPassiveYield += branch.passiveYield;
        }

        const nextPl = enforceStatCaps({
          ...state.pl,
          bag: newBag,
          clout: newClout,
          aura: newAura,
          mentalHealth: newMental,
          heat: newHeat,
          rentalCount: newRentalCount,
          flipCount: newFlipCount,
          vendingCount: newVendingCount,
          passiveLaborYield: newPassiveYield,
          hustleBranchIds: { ...state.pl.hustleBranchIds, [hustleId]: branchId },
        });

        set({
          pl: nextPl,
          news: [`${branch.name}: +$${result.yieldCash.toLocaleString()}`, ...state.news.slice(0, 49)],
        });

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

      // Execute a hustle
      executeHustle: (hustleId: string, minigameMultiplier: number = 1, forceSuccess?: boolean) => {
        const state = get();
        const hustle = HUSTLES[hustleId];

        if (!hustle) {
          return { success: false, netChange: 0, message: 'Hustle not found' };
        }

        // Check if tier is unlocked
        const currentTierIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
        const hustleTierIndex = PROGRESSION_ORDER.indexOf(hustle.tier as Tier);

        if (hustleTierIndex > currentTierIndex) {
          return { success: false, netChange: 0, message: `${hustle.tier} tier locked. Advance your rank first.` };
        }

        // Get current level data
        let levelData;
        const currentLevel = state.pl.hustleLevels[hustleId] || 1;

        if (hustle.branches) {
          const nodeId = state.pl.hustleBranchIds[hustleId] || hustle.startBranchId;
          levelData = nodeId ? hustle.branches[nodeId] : undefined;
        } else if (hustle.levels) {
          levelData = hustle.levels.find(l => l.level === currentLevel);
        }

        if (!levelData) {
          return { success: false, netChange: 0, message: 'Level data missing' };
        }

        // Check clout/aura requirements
        if (state.pl.clout < levelData.cloutReq) {
          return { success: false, netChange: 0, message: `Need ${levelData.cloutReq} clout` };
        }

        if (state.pl.aura < levelData.auraReq) {
          return { success: false, netChange: 0, message: `Need ${levelData.auraReq} aura` };
        }

        const market = MARKET_CONFIGS[state.currentMarket];
        const success = forceSuccess !== undefined ? forceSuccess : Math.random() < 0.8;
        const isVending = hustleId === 'r_vending';

        const result = calculateHustleMath(
          hustleId,
          levelData,
          currentLevel,
          isVending ? 1 : market.expenseMultiplier,
          market.yieldMultiplier,
          market.heatMultiplier,
          minigameMultiplier,
          success
        );

        // Check if player can afford
        if (state.pl.bag < result.cost) {
          return { success: false, netChange: 0, message: `Need $${result.cost.toLocaleString()}` };
        }

        // Apply results
        const newBag = state.pl.bag - result.cost + result.yieldCash;
        const newClout = Math.min(1000, state.pl.clout + result.yieldClout);
        const newAura = Math.min(1000, state.pl.aura + result.yieldAura);
        const newMental = Math.max(0, state.pl.mentalHealth + result.mentalHit);
        const newHeat = Math.min(100, state.pl.heat + result.heatHit);

        // Update stats tracking
        const newStats = state.pl.stats
          ? { ...state.pl.stats }
          : { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };

        newStats.totalHustles += 1;
        if (success) newStats.successfulHustles += 1;
        newStats.lifetimeEarnings += result.yieldCash;

        const hustleResultPl = enforceStatCaps({
          ...state.pl,
          bag: newBag,
          clout: newClout,
          aura: newAura,
          mentalHealth: newMental,
          heat: newHeat,
        });

        // Update player state
        set({
          pl: {
            ...hustleResultPl,
            stats: newStats,
            lastExecutedHustleId: hustleId,
            streak: success ? (state.pl.streak || 0) + 1 : 0,
          },
          news: [`${success ? '✅' : '❌'} ${hustle.name}: ${success ? 'Success' : 'Failure'} - Net $${(newBag - state.pl.bag).toLocaleString()}`, ...state.news.slice(0, 49)],
        });

        get().logAction({
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
          success: success,
          passiveAdded: levelData.passiveYield || 0,
          marketMult: { yield: market.yieldMultiplier, expense: market.expenseMultiplier, heat: market.heatMultiplier },
          marketName: market.name,
          variation: 0
        });
        get().checkMilestones();

        // Advance month
        const { newPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
          { ...get().pl },
          get().currentMarket
        );

        const cappedPl = enforceStatCaps(newPl);

        // Handle death
        if (shouldDie) {
          const lastHustleId = cappedPl.lastExecutedHustleId || 'DEFAULT';
          const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];

          set({
            pl: cappedPl,
            currentMarket: newMarket,
            news: [...monthNews, ...get().news.slice(0, 45)],
            ph: 'POST_MORTEM',
            deathBadge: deathInfo.badge,
            fatalCause: deathCause,
          });

          return { success, netChange: newBag - state.pl.bag, message: 'GAME OVER' };
        }

        set({
          pl: cappedPl,
          currentMarket: newMarket,
          news: [...monthNews, ...get().news.slice(0, 45)],
        });

        return { success, netChange: newBag - state.pl.bag, message: '' };
      },

      // Upgrade a hustle to the next level
      upgradeHustle: (hustleId: string, branchId?: string) => {
        const state = get();
        const hustle = HUSTLES[hustleId];

        if (!hustle) return false;

        let targetNodeData: HustleLevel | undefined;
        let isRepeat = false;

        if (hustle.branches) {
          const currentNodeId = state.pl.hustleBranchIds[hustleId] || hustle.startBranchId;
          const currentNode = currentNodeId ? hustle.branches[currentNodeId] : undefined;

          if (branchId) {
            // Check if it's a valid next branch
            if (currentNode?.nextBranches?.includes(branchId)) {
              targetNodeData = hustle.branches[branchId];
            }
            // Check if it's a repeat
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
          true
        );

        // Check requirements
        if (state.pl.bag < result.cost) return false;
        if (state.pl.clout < targetNodeData.cloutReq) return false;
        if (state.pl.aura < targetNodeData.auraReq) return false;

        // Apply upgrade
        const newPl = enforceStatCaps({
          ...state.pl,
          bag: state.pl.bag - result.cost,
          clout: Math.min(1000, state.pl.clout + result.yieldClout),
          aura: Math.min(1000, state.pl.aura + result.yieldAura),
          mentalHealth: Math.max(0, state.pl.mentalHealth + result.mentalHit),
          heat: Math.min(100, state.pl.heat + result.heatHit),
        });

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

          // Stats tracking
          if (hustleId === 'r_vending') {
            newPl.vendingCount += 1;
            // No passiveLaborYield update for vending
          } else {
            if (nodeId === 'l2a') newPl.flipCount += 1;
            if (nodeId === 'l2b') newPl.rentalCount += 1;

            if (targetNodeData.passiveYield) {
              newPl.passiveLaborYield += targetNodeData.passiveYield;
            }
          }
        } else {
          newPl.hustleLevels = {
            ...state.pl.hustleLevels,
            [hustleId]: targetNodeData.level
          };
        }

        set({
          pl: newPl,
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

      scoutArtist: (tier: 'local' | 'regional' | 'global') => {
        const state = get();

        if (state.pl.artists.length >= 10) {
          return { success: false, message: 'Maximum 10 artists allowed in roster' };
        }

        const config = {
          local: { cost: 10000, successRate: 0.8, royalty: 2000 },
          regional: { cost: 50000, successRate: 0.5, royalty: 10000 },
          global: { cost: 200000, successRate: 0.2, royalty: 50000 }
        };

        const { cost, successRate, royalty } = config[tier];

        if (state.pl.bag < cost) {
          return { success: false, message: `Need $${cost.toLocaleString()} to scout ${tier} talent` };
        }

        // Deduct cost immediately
        set({ pl: { ...state.pl, bag: state.pl.bag - cost } });

        const isSuccess = Math.random() < successRate;

        if (!isSuccess) {
          set({ news: [`❌ Scouting failed: No ${tier} talent found this month`, ...get().news.slice(0, 49)] });
          return { success: false, message: 'Scouting failed' };
        }

        const firstNames = ['Lil', 'Yung', 'Big', 'MC', 'DJ', 'The', 'Kid', 'Bad', 'Rich', 'Ice', 'A$AP', 'Cardi', 'Megan'];
        const lastNames = ['Bag', 'Chain', 'Ghost', 'Money', 'Wave', 'Vibe', 'Flex', 'Chaser', 'Mogul', 'Star', 'Flow', 'Beat'];
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;

        const newArtist = {
          id: Math.random().toString(36).substring(7),
          name,
          tier,
          royaltyRate: royalty,
          monthsActive: 0,
          hasReleased: false,
        };

        set({
          pl: {
            ...get().pl,
            artists: [...get().pl.artists, newArtist],
          },
          news: [`🎤 SUCCESS! Signed ${tier} artist: ${name}`, ...get().news.slice(0, 49)]
        });

        return { success: true, artist: newArtist, message: 'Success' };
      },

      dropArtist: (artistId: string) => {
        const state = get();
        const artist = state.pl.artists.find(a => a.id === artistId);
        if (!artist) return;

        set({
          pl: {
            ...state.pl,
            artists: state.pl.artists.filter(a => a.id !== artistId),
          },
          news: [`📉 Dropped artist: ${artist.name}`, ...state.news.slice(0, 49)]
        });
      },

      addTickerMessage: (text: string, colorClass?: string) => {
        set((state) => ({
          news: [{ text, colorClass }, ...state.news.slice(0, 49)]
        }));
      },

      // Advance to next tier
      advanceTier: () => {
        const state = get();
        const currentIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
        const nextTier = PROGRESSION_ORDER[currentIndex + 1];

        if (!nextTier) return false;

        const req = TIER_REQUIREMENTS[nextTier];

        if (state.pl.bag >= req.cash &&
            state.pl.clout >= req.clout &&
            state.pl.aura >= req.aura) {

          // Check if player can afford the fee
          if (state.pl.bag < req.fee) {
            set({
              news: [`❌ Cannot advance to ${nextTier}: Need $${req.fee.toLocaleString()} for filing fees`, ...state.news.slice(0, 49)]
            });
            return false;
          }

          set({
            pl: {
              ...state.pl,
              bag: state.pl.bag - req.fee,
              currentTier: nextTier,
            },
            activeTab: nextTier,
            news: [`🎉 ADVANCED to ${nextTier} tier! ${req.description}`, ...state.news.slice(0, 49)]
          });

          // Force refresh of the active tab
          get().setActiveTab(nextTier);

          return true;
        }

        // Show what's missing
        const missing = [];
        if (state.pl.bag < req.cash) missing.push(`$${req.cash.toLocaleString()} cash`);
        if (state.pl.clout < req.clout) missing.push(`${req.clout} clout`);
        if (state.pl.aura < req.aura) missing.push(`${req.aura} aura`);

        set({
          news: [`❌ Cannot advance to ${nextTier}: Need ${missing.join(', ')}`, ...state.news.slice(0, 49)]
        });

        return false;
      },

      // Purchase a flex asset
      purchaseFlexAsset: (assetId: string) => {
        const state = get();
        const asset = FLEX_ASSETS.find(a => a.id === assetId);

        if (!asset) return false;
        if (state.pl.bag < asset.cost) return false;

        const newCount = (state.pl.flexAssets[assetId] || 0) + 1;

        set({
          pl: {
            ...state.pl,
            bag: state.pl.bag - asset.cost,
            flexAssets: {
              ...state.pl.flexAssets,
              [assetId]: newCount
            }
          },
          news: [`💎 Purchased ${asset.name}`, ...state.news.slice(0, 49)]
        });

        return true;
      },

      // Set the game phase (for death/reset)
      setPh: (ph: 'PLAYING' | 'POST_MORTEM' | 'PROLOGUE') => {
        set({ ph });
      },

      logAction: (action) => {
        const state = get();
        const newAction = {
          ...action,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now(),
        };
        set({
          pl: {
            ...state.pl,
            actionLog: [newAction, ...(state.pl.actionLog || [])].slice(0, 500),
          },
        });
      },

      checkMilestones: () => {
        const state = get();
        const actions = state.pl.actionLog || [];
        const newMilestones = [];

        // Count actions by type
        const vendingCount = actions.filter(a => a.hustleId === 'r_vending').length;
        const houseFlips = actions.filter(a => a.branchId === 'l2a').length;
        const rentals = actions.filter(a => a.branchId === 'l2b').length;
        const totalProfit = actions.reduce((sum, a) => sum + a.netCash, 0);

        // Milestone definitions
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

        if (newMilestones.length > 0) {
          set({
            pl: {
              ...state.pl,
              milestones: [...(state.pl.milestones || []), ...newMilestones],
            },
            news: [`🏆 MILESTONE: ${newMilestones.map(m => m.name).join(', ')}`, ...state.news],
          });
        }
      },
    }),
    {
      name: 'bag-chaser-save',
      partialize: (state) => ({
        pl: state.pl,
        currentMarket: state.currentMarket,
        unlockedHustles: state.unlockedHustles,
        activeTab: state.activeTab,
        difficulty: state.difficulty,
      }),
    }
  )
);
