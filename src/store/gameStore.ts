import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, PlayerStats, MarketType, Tier } from '../types/game';
import { HUSTLES } from '../config/hustles/base';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { FLEX_ASSETS } from '../config/flexAssets';
import { calculateHustleMath } from '../engine/mathEngine';
import { advanceMonth } from '../engine/advancementEngine';
import { DEATH_MESSAGES } from '../config/deathMessages';

const INITIAL_STATS: PlayerStats = {
  bag: 1000,
  clout: 0,
  aura: 0,
  mentalHealth: 100,
  heat: 0,
  month: 0,
  currentTier: 'MUD',
  hustleLevels: {},
  hustleNodeIds: {},
  flexAssets: {},
  unlockedAchievements: [],
  stats: {
    totalHustles: 0,
    successfulHustles: 0,
    lifetimeEarnings: 0,
  },
};

const INITIAL_UNLOCKED: Record<string, boolean> = {
  r_labor: true,
  r_delivery: true,
  r_plasma: true,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      pl: INITIAL_STATS,
      ph: 'PROLOGUE',
      currentMarket: 'NORMAL' as MarketType,
      news: ['Welcome to Bag Chaser. The grind begins now.'],
      unlockedHustles: INITIAL_UNLOCKED,
      activeTab: 'MUD' as Tier,
      activeHustleView: null,
      deathBadge: null,
      fatalCause: null,

      // Reset game
      resetGame: () => {
        set({
          pl: INITIAL_STATS,
          ph: 'PROLOGUE',
          currentMarket: 'NORMAL',
          news: ['Game reset. Welcome back.'],
          unlockedHustles: INITIAL_UNLOCKED,
          activeTab: 'MUD',
          activeHustleView: null,
          deathBadge: null,
          fatalCause: null,
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
        const currentLevel = state.pl.hustleLevels[hustleId] || 1;
        const levelData = hustle.levels.find(l => l.level === currentLevel);

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

        const result = calculateHustleMath(
          levelData,
          currentLevel,
          market.expenseMultiplier,
          market.yieldMultiplier,
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

        // Update player state
        set({
          pl: {
            ...state.pl,
            bag: newBag,
            clout: newClout,
            aura: newAura,
            mentalHealth: newMental,
            heat: newHeat,
            stats: newStats,
            lastExecutedHustleId: hustleId,
            streak: success ? (state.pl.streak || 0) + 1 : 0,
          },
          news: [`${success ? '✅' : '❌'} ${hustle.name}: ${success ? 'Success' : 'Failure'} - Net $${(newBag - state.pl.bag).toLocaleString()}`, ...state.news.slice(0, 49)],
        });

        // Advance month
        const { newPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
          { ...get().pl, bag: newBag, clout: newClout, aura: newAura, mentalHealth: newMental, heat: newHeat },
          get().currentMarket
        );

        // Handle death
        if (shouldDie) {
          const lastHustleId = newPl.lastExecutedHustleId || 'DEFAULT';
          const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];

          set({
            pl: newPl,
            currentMarket: newMarket,
            news: [...monthNews, ...get().news.slice(0, 45)],
            ph: 'POST_MORTEM',
            deathBadge: deathInfo.badge,
            fatalCause: deathCause,
          });

          return { success, netChange: newBag - state.pl.bag, message: 'GAME OVER' };
        }

        set({
          pl: newPl,
          currentMarket: newMarket,
          news: [...monthNews, ...get().news.slice(0, 45)],
        });

        return { success, netChange: newBag - state.pl.bag, message: '' };
      },

      // Upgrade a hustle to the next level
      upgradeHustle: (hustleId: string) => {
        const state = get();
        const hustle = HUSTLES[hustleId];

        if (!hustle) return false;

        const currentLevel = state.pl.hustleLevels[hustleId] || 1;
        const nextLevelData = hustle.levels.find(l => l.level === currentLevel + 1);

        if (!nextLevelData) return false;

        // Check requirements
        if (state.pl.bag < nextLevelData.cost) return false;
        if (state.pl.clout < nextLevelData.cloutReq) return false;
        if (state.pl.aura < nextLevelData.auraReq) return false;

        // Apply upgrade
        set({
          pl: {
            ...state.pl,
            bag: state.pl.bag - nextLevelData.cost,
            hustleLevels: {
              ...state.pl.hustleLevels,
              [hustleId]: currentLevel + 1
            },
            hustleNodeIds: {
              ...state.pl.hustleNodeIds,
              [hustleId]: `l${currentLevel + 1}`
            }
          },
          news: [`⬆️ Upgraded ${hustle.name} to Level ${currentLevel + 1}`, ...state.news.slice(0, 49)]
        });

        return true;
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
    }),
    {
      name: 'bag-chaser-save',
      partialize: (state) => ({
        pl: state.pl,
        currentMarket: state.currentMarket,
        unlockedHustles: state.unlockedHustles,
        activeTab: state.activeTab,
      }),
    }
  )
);
