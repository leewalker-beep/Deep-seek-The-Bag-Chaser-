import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, PlayerStats, MarketType, Tier } from '../types/game';
import { HUSTLES } from '../config/hustles/base';
import { PROGRESSION_ORDER } from '../config/tiers';
import { MARKET_CONFIGS } from '../config/marketConfig';
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
