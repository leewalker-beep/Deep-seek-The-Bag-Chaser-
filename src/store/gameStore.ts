import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, MarketType, Tier } from '../types/game';
import { HUSTLES, type HustleLevel } from '../config/hustles/base';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from '../config/tiers';
import { MARKET_CONFIGS } from '../config/marketConfig';
import { FLEX_ASSETS } from '../config/flexAssets';
import { calculateHustleMath } from '../engine/mathEngine';
import { advanceMonth } from '../engine/advancementEngine';
import { showConfetti } from '../components/effects/Confetti';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { getInitialStats, getUnlockedHustles } from './initialState';
import { enforceStatCaps } from '../engine/statEngine';

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
      pendingUpdate: null,

      // Reset game
      resetGame: (difficulty: 1 | 2 | 3 = 3) => {
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

      // Set player name (for prologue)
      setPlayerName: (name: string) => {
        set((state) => ({
          pl: enforceStatCaps({ ...state.pl, name }),
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
          true,
          state.pl.mentalShieldTurns
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
        const newClout = state.pl.clout + result.yieldClout;
        const newAura = state.pl.aura + result.yieldAura;
        const newMental = state.pl.mentalHealth + result.mentalHit;
        const newHeat = state.pl.heat + result.heatHit;

        // Apply passive income
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
      executeHustle: (hustleId: string, minigameMultiplier: number = 1, forceSuccess?: boolean, defer?: boolean) => {
        const state = get();
        const hustle = HUSTLES[hustleId];
        const pendingNews: (string | { text: string; colorClass: string })[] = [];

        const addLocalTicker = (text: string, colorClass?: string) => {
          pendingNews.push(colorClass ? { text, colorClass } : text);
        };

        if (!hustle) {
          return {
            success: false, netChange: 0, message: 'Hustle not found',
            cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
          };
        }

        const isRecovery = (hustleId === 'psychiatrist' || hustleId === 'r_sleep' || hustleId === 'power_nap' || hustleId === 'therapy_session' || hustleId === 'wellness_retreat');
        const isStrategic = (hustleId === 'real_estate_empire' || hustleId === 'venture_capital' || hustleId === 'festival' || hustleId === 'data_analytics' || hustleId === 'crypto_mining' || hustleId === 'virtual_assistant_agency');

        // Check if tier is unlocked
        const currentTierIndex = PROGRESSION_ORDER.indexOf(state.pl.currentTier);
        const hustleTierIndex = PROGRESSION_ORDER.indexOf(hustle.tier as Tier);

        if (hustleTierIndex > currentTierIndex) {
          return {
            success: false, netChange: 0, message: `${hustle.tier} tier locked. Advance your rank first.`,
            cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
          };
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

        if (!levelData && !isStrategic) {
          return {
            success: false, netChange: 0, message: 'Level data missing',
            cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
          };
        }

        // Mock levelData for strategic hustles that don't use it for core yield
        if (!levelData && isStrategic) {
          levelData = { level: 1, cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, cloutReq: 0, auraReq: 0 };
        }

        if (!levelData) {
          return {
            success: false, netChange: 0, message: 'Level data missing',
            cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
          };
        }

        // Check clout/aura requirements
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

        const market = MARKET_CONFIGS[state.currentMarket];
        let success = forceSuccess !== undefined ? forceSuccess : (isRecovery || isStrategic ? true : Math.random() < 0.8);
        const isVending = hustleId === 'r_vending';

        let result = calculateHustleMath(
          hustleId,
          levelData,
          currentLevel,
          isVending ? 1 : market.expenseMultiplier,
          market.yieldMultiplier,
          market.heatMultiplier,
          minigameMultiplier,
          success,
          state.pl.mentalShieldTurns
        );

        // --- Strategic Choice Logic ---
        if (hustleId === 'festival') {
          const choices = state.pl.festivalChoices || { headliner: 'budget', venue: 'small', marketing: 'basic', insurance: false };
          const headlinerMult = { budget: 1.0, premium: 1.5, luxury: 2.5 }[choices.headliner];
          const venueCap = { small: 5000, medium: 20000, large: 50000 }[choices.venue];
          const marketingMult = { basic: 1.0, standard: 1.5, aggressive: 2.5 }[choices.marketing];

          const headlinerCost = { budget: 50000, premium: 200000, luxury: 500000 }[choices.headliner];
          const marketingCost = { basic: 10000, standard: 50000, aggressive: 100000 }[choices.marketing];
          const insuranceCost = choices.insurance ? 50000 : 0;
          const totalCost = (headlinerCost + marketingCost + insuranceCost) * market.expenseMultiplier;

          const ticketPrice = 50;
          let attendanceMult = marketingMult;
          if (Math.random() < 0.15) { // Rain event
            if (!choices.insurance) {
              attendanceMult *= 0.5;
              addLocalTicker('⛈️ RAIN EVENT! Attendance slashed by 50% without insurance!', 'text-red-400');
            } else {
              addLocalTicker('⛈️ RAIN EVENT! Insurance covered the losses!', 'text-blue-400');
            }
          }

          const yieldCash = Math.floor((ticketPrice * venueCap * headlinerMult * attendanceMult) * market.yieldMultiplier);
          result = { ...result, cost: totalCost, yieldCash };
        }
        else if (hustleId === 'data_analytics') {
          const choice = state.pl.dataAnalyticsChoice || 'consumer';
          let yieldCash = 0, yieldClout = 0, yieldAura = 0, heatHit = 5;

          if (choice === 'consumer') { yieldCash = 100000; yieldClout = 50; }
          else if (choice === 'financial') { yieldCash = 500000; heatHit = 10; }
          else if (choice === 'social') { yieldCash = 50000; yieldAura = 100; }
          else if (choice === 'all' && currentLevel >= 3) {
            yieldCash = 1000000; yieldClout = 150; yieldAura = 150; heatHit = 30;
            if (Math.random() < 0.10) { // Data breach
              heatHit += 50; yieldClout -= 100;
              addLocalTicker('🚨 DATA BREACH! Massive heat spike and clout loss!', 'text-red-500 font-bold');
            }
          }

          result = {
            ...result,
            yieldCash: yieldCash * market.yieldMultiplier,
            yieldClout,
            yieldAura,
            heatHit: heatHit * market.heatMultiplier
          };
        }
        else if (hustleId === 'crypto_mining') {
          const strategy = state.pl.cryptoStrategy || 'solo';
          let yieldCash = 0, heatHit = 5, risk = 0;

          if (strategy === 'solo') { yieldCash = 50000; }
          else if (strategy === 'pool') { yieldCash = 200000; heatHit = 10; risk = 0.05; }
          else if (strategy === 'cloud') { yieldCash = 500000; heatHit = 20; risk = 0.20; }
          else if (strategy === 'asic' && currentLevel >= 3) { yieldCash = 2000000; heatHit = 30; risk = 0.10; }

          if (Math.random() < risk) {
            yieldCash = 0;
            const msg = strategy === 'cloud' ? 'Scammed by cloud provider!' : 'Mining failure!';
            addLocalTicker(`❌ ${msg} Yield is 0.`, 'text-red-400');
          }

          result = {
            ...result,
            yieldCash: yieldCash * market.yieldMultiplier,
            heatHit: heatHit * market.heatMultiplier
          };
        }
        else if (hustleId === 'virtual_assistant_agency') {
          const staff = state.pl.vaStaff || 5;
          const training = state.pl.vaTraining || 'none';
          const client = state.pl.vaClient || 'small';

          const costMap = { 5: 10000, 10: 25000, 20: 50000 };
          const cost = costMap[staff as keyof typeof costMap];

          const trainingMult = { none: 1.0, basic: 1.3, advanced: 1.6 };
          const trainingMultiplier = trainingMult[training as keyof typeof trainingMult];

          const baseYieldMap = { small: 50000, medium: 200000, large: 1000000 };
          const baseYield = baseYieldMap[client as keyof typeof baseYieldMap];

          const successChance = Math.min(0.95, (staff / 20) * trainingMultiplier);
          const isSuccessRoll = Math.random() < successChance;

          let yieldCash = Math.floor(baseYield * market.yieldMultiplier);
          let yieldClout = Math.floor(20 * trainingMultiplier);
          let yieldAura = Math.floor(10 * trainingMultiplier);

          if (!isSuccessRoll) {
            success = false;
            yieldCash = Math.floor(yieldCash * 0.3);
            yieldClout = Math.floor(yieldClout * 0.5);
            yieldAura = Math.floor(yieldAura * 0.5);
            addLocalTicker('❌ Agency fulfillment failed! Client lost.', 'text-red-400');
          } else {
            success = true;
          }

          result = {
            ...result,
            cost: cost * market.expenseMultiplier,
            yieldCash,
            yieldClout,
            yieldAura,
            passiveAdded: Math.floor(baseYieldMap[client as keyof typeof baseYieldMap] * 0.08) // 8% of base as monthly passive
          };
        }
        else if (hustleId === 'lobbying') {
          const intensity = Math.floor(minigameMultiplier); // 1, 2, 3, or 4
          let yieldCash = 0, heatHit = 5, successRate = 0.5;
          let label = 'gentle';

          if (intensity === 1) { yieldCash = 500000; heatHit = 5; successRate = 0.5; label = 'gentle'; }
          else if (intensity === 2) { yieldCash = 2000000; heatHit = 10; successRate = 0.7; label = 'medium'; }
          else if (intensity === 3) { yieldCash = 10000000; heatHit = 20; successRate = 0.3; label = 'hard'; }
          else if (intensity === 4) { yieldCash = 50000000; heatHit = 40; successRate = 0.1; label = 'violent'; }

          const isLobbySuccess = Math.random() < successRate;
          success = isLobbySuccess;
          if (isLobbySuccess) addLocalTicker(`✅ Influence successful (${label})! +$${yieldCash.toLocaleString()}`, 'text-emerald-400');
          else addLocalTicker(`❌ Influence failed (${label})! Investment lost and heat increased.`, 'text-red-400');

          result = {
            ...result,
            yieldCash: isLobbySuccess ? yieldCash : 0,
            yieldClout: isLobbySuccess ? 100 : -50,
            heatHit: isLobbySuccess ? heatHit : (heatHit * 2),
          };
        }
        else if (hustleId === 'disaster') {
          const accuracy = minigameMultiplier; // 0.0 to 1.0
          let costMult = 2.0;
          if (accuracy >= 0.9) { costMult = 0.5; addLocalTicker('🎯 Precise assessment! Costs reduced by 50%.', 'text-emerald-400'); }
          else if (accuracy >= 0.8) { costMult = 0.75; addLocalTicker('✅ Good assessment! Costs reduced by 25%.', 'text-blue-400'); }
          else { addLocalTicker('❌ Poor assessment! Costs doubled.', 'text-red-400'); }


          result = {
            ...result,
            cost: result.cost * costMult,
            yieldClout: Math.floor(50 * (accuracy + 0.5)),
            yieldAura: Math.floor(25 * (accuracy + 0.5)),
          };
        }
        else if (hustleId === 'global_franchise') {
          const performance = minigameMultiplier / (state.pl.hustleLevels[hustleId] || 1);
          let cost, passive, risk;

          if (performance <= 0.35) { cost = 5000000; passive = 500000; risk = 0.05; }
          else if (performance <= 0.65) { cost = 10000000; passive = 1500000; risk = 0.15; }
          else if (performance <= 0.85) { cost = 20000000; passive = 3000000; risk = 0.30; }
          else { cost = 40000000; passive = 5000000; risk = 0.50; }

          const isExpansionSuccess = Math.random() > risk;
          success = isExpansionSuccess;
          if (!isExpansionSuccess) {
             addLocalTicker('❌ Global expansion failed! Investment lost.', 'text-red-400');
             result = { ...result, cost: cost * market.expenseMultiplier, yieldCash: 0, yieldClout: 0, yieldAura: 0 };
          } else {
             addLocalTicker(`🌎 Global expansion successful! Passive income boosted.`, 'text-emerald-400');
             result = {
               ...result,
               cost: cost * market.expenseMultiplier,
               yieldCash: 0,
               yieldClout: 200,
               yieldAura: 100,
               passiveAdded: (levelData.passiveYield || 0) + passive
             };
          }
        }
        else if (hustleId === 'real_estate_empire') {
          const type = state.pl.realEstateType;
          const leverage = state.pl.realEstateLeverage;
          const strategy = state.pl.realEstateStrategy;

          const typeMult = { residential: 1.0, commercial: 1.5, industrial: 2.0 }[type];
          const leverageMult = leverage === 0 ? 1.0 : (leverage === 50 ? 1.5 : 2.5);

          const cycle = state.pl.marketCycle.realEstate;
          const cycleMult = cycle === 'boom' ? 1.5 : (cycle === 'bust' ? 0.6 : 1.0);

          const baseYield = 1000000; // Base profit per unit
          let yieldCash = baseYield * typeMult * leverageMult * cycleMult * market.yieldMultiplier;

          if (strategy === 'hold') {
            yieldCash = 0;
            addLocalTicker(`🏙️ Property acquired for HOLD. Passive income updated.`, 'text-blue-400');
          } else {
            addLocalTicker(`🏙️ Property FLIPPED for $${Math.floor(yieldCash).toLocaleString()}!`, 'text-emerald-400');
          }

          result = { ...result, yieldCash: Math.floor(yieldCash) };
        }
        else if (hustleId === 'venture_capital') {
          const stage = state.pl.vcStage;
          const sector = state.pl.vcSector;
          const investment = state.pl.vcInvestment * 1000000; // in millions

          if (state.pl.bag < investment) {
            return {
              success: false, netChange: 0, message: `Need $${investment.toLocaleString()} for investment`,
              cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
            };
          }

          const stageData = {
            seed: { multRange: [10, 50], failRate: 0.7 },
            seriesA: { multRange: [5, 20], failRate: 0.5 },
            growth: { multRange: [2, 5], failRate: 0.3 },
          }[stage as 'seed' | 'seriesA' | 'growth'];

          const sectorCycle = state.pl.marketCycle.vc[sector];
          const sectorMult = sectorCycle === 'boom' ? 1.4 : (sectorCycle === 'bust' ? 0.7 : 1.0);

          let yieldCash = 0;
          const outcomeRoll = Math.random();

          if (outcomeRoll > stageData.failRate) {
            success = true;
            const successTypeRoll = Math.random();
            let exitMult;
            if (successTypeRoll < 0.25) { // IPO
              exitMult = stageData.multRange[1];
              addLocalTicker(`🚀 UNICORN IPO! ${sector.toUpperCase()} exit at ${exitMult}x!`, 'text-emerald-400 font-black animate-bounce');
            } else { // Acquisition
              exitMult = Math.random() * (stageData.multRange[1] - stageData.multRange[0]) + stageData.multRange[0];
              addLocalTicker(`💰 ACQUISITION! ${sector.toUpperCase()} company sold at ${exitMult.toFixed(1)}x.`, 'text-emerald-400');
            }
            yieldCash = investment * exitMult * sectorMult * market.yieldMultiplier;
          } else {
            success = false;
            addLocalTicker(`📉 STARTUP FAILED. ${sector.toUpperCase()} investment lost.`, 'text-red-400');
          }

          result = { ...result, cost: investment, yieldCash: Math.floor(yieldCash) };
        }

        const bigWinMsg = (result.isBigWin && result.bigWinMessage)
          ? { text: result.bigWinMessage, colorClass: 'text-emerald-400 font-black animate-bounce' }
          : null;

        // Check if player can afford
        if (state.pl.bag < result.cost) {
          return {
            success: false, netChange: 0, message: `Need $${result.cost.toLocaleString()}`,
            cost: 0, yieldCash: 0, yieldClout: 0, yieldAura: 0, mentalHit: 0, heatHit: 0
          };
        }

        // Apply results
        const newBag = state.pl.bag - result.cost + result.yieldCash;
        const newDynamicPassives = { ...state.pl.dynamicPassives };
        if (result.passiveAdded !== undefined) {
           newDynamicPassives[hustleId] = (newDynamicPassives[hustleId] || 0) + (result.passiveAdded - (levelData.passiveYield || 0));
        }
        const newClout = state.pl.clout + result.yieldClout;
        const newAura = state.pl.aura + result.yieldAura;
        const newMental = state.pl.mentalHealth + result.mentalHit;
        const newHeat = state.pl.heat + result.heatHit;

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
          dynamicPassives: newDynamicPassives,
          rentalCount: state.pl.rentalCount + (hustleId === 'real_estate_empire' && state.pl.realEstateStrategy === 'hold' ? 1 : 0),
          flipCount: state.pl.flipCount + (hustleId === 'real_estate_empire' && state.pl.realEstateStrategy === 'flip' ? 1 : 0),
          // We don't add result.shieldTurns here because we want it to survive advanceMonth below
          stats: newStats,
          lastExecutedHustleId: hustleId,
          streak: success ? (state.pl.streak || 0) + 1 : 0,
          hustleLevels: {
            ...state.pl.hustleLevels,
            [hustleId]: currentLevel
          },
          hustleBranchIds: hustle.branches ? {
            ...state.pl.hustleBranchIds,
            [hustleId]: state.pl.hustleBranchIds[hustleId] || hustle.startBranchId || ''
          } : state.pl.hustleBranchIds,
        });

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
          success: success,
          passiveAdded: result.passiveAdded !== undefined ? result.passiveAdded : (levelData.passiveYield || 0),
          marketMult: { yield: market.yieldMultiplier, expense: market.expenseMultiplier, heat: market.heatMultiplier },
          marketName: market.name,
          variation: 0
        };

        // Advance month using the result of the hustle
        const { newPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
          hustleResultPl,
          state.currentMarket
        );

        // Apply shield turns AFTER advanceMonth so they aren't immediately decremented
        newPl.mentalShieldTurns += result.shieldTurns;

        const cappedPl = enforceStatCaps(newPl);

        const executionNews = ` ${success ? '✅' : '❌'} ${hustle.name}: ${success ? 'Success' : 'Failure'} - Net $${(newBag - state.pl.bag).toLocaleString()}`;
        const finalNews = [
          ...monthNews,
          ...(bigWinMsg ? [bigWinMsg] : []),
          executionNews,
          ...pendingNews,
            ...get().news
        ].slice(0, 50);

        let finalPh = state.ph;
        let finalDeathBadge = state.deathBadge;
        let finalFatalCause = state.fatalCause;

        if (shouldDie) {
          const lastHustleId = cappedPl.lastExecutedHustleId || 'DEFAULT';
          const deathInfo = DEATH_MESSAGES[lastHustleId] || DEATH_MESSAGES['DEFAULT'];
          finalPh = 'POST_MORTEM';
          finalDeathBadge = deathInfo.badge;
          finalFatalCause = deathCause;
        }

        if (defer) {
          set({
            pendingUpdate: {
              pl: enforceStatCaps(cappedPl),
              news: finalNews,
              currentMarket: newMarket,
              ph: finalPh,
              deathBadge: finalDeathBadge,
              fatalCause: finalFatalCause,
              action: actionLogData
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

          get().logAction(actionLogData);
          get().checkMilestones();
        }

        return {
          success,
          netChange: newBag - state.pl.bag,
          message: shouldDie ? 'GAME OVER' : '',
          cost: result.cost,
          yieldCash: result.yieldCash,
          yieldClout: result.yieldClout,
          yieldAura: result.yieldAura,
          mentalHit: result.mentalHit,
          heatHit: result.heatHit
        };
      },

      applyPendingUpdate: () => {
        const state = get();
        if (!state.pendingUpdate) return;

        const { pl, news, currentMarket, ph, deathBadge, fatalCause, action } = state.pendingUpdate;

        set({
          pl: enforceStatCaps(pl),
          news,
          currentMarket,
          ph,
          deathBadge,
          fatalCause,
          pendingUpdate: null,
          activeHustleView: null,
        });

        get().logAction(action);
        get().checkMilestones();
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
          true,
          state.pl.mentalShieldTurns
        );

        // Check requirements
        if (state.pl.bag < result.cost) return false;
        if (state.pl.clout < targetNodeData.cloutReq) return false;
        if (state.pl.aura < targetNodeData.auraReq) return false;

        // Apply upgrade
        const newPl = enforceStatCaps({
          ...state.pl,
          bag: state.pl.bag - result.cost,
          clout: state.pl.clout + result.yieldClout,
          aura: state.pl.aura + result.yieldAura,
          mentalHealth: state.pl.mentalHealth + result.mentalHit,
          heat: state.pl.heat + result.heatHit,
          mentalShieldTurns: state.pl.mentalShieldTurns + result.shieldTurns,
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

        // Apply cost
        const plAfterCost = enforceStatCaps({ ...state.pl, bag: state.pl.bag - cost });

        const isSuccess = Math.random() < successRate;

        if (!isSuccess) {
          set({
            pl: plAfterCost,
            news: [`❌ Scouting failed: No ${tier} talent found this month`, ...state.news.slice(0, 49)]
          });
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
          pl: enforceStatCaps({
            ...plAfterCost,
            artists: [...plAfterCost.artists, newArtist],
          }),
          news: [`🎤 SUCCESS! Signed ${tier} artist: ${name}`, ...state.news.slice(0, 49)]
        });

        return { success: true, artist: newArtist, message: 'Success' };
      },

      dropArtist: (artistId: string) => {
        const state = get();
        const artist = state.pl.artists.find(a => a.id === artistId);
        if (!artist) return;

        set({
          pl: enforceStatCaps({
            ...state.pl,
            artists: state.pl.artists.filter(a => a.id !== artistId),
          }),
          news: [`📉 Dropped artist: ${artist.name}`, ...state.news.slice(0, 49)]
        });
      },

      setFestivalChoices: (choices) => {
        set((state) => ({ pl: enforceStatCaps({ ...state.pl, festivalChoices: choices }) }));
      },

      setDataAnalyticsChoice: (choice) => {
        set((state) => ({ pl: enforceStatCaps({ ...state.pl, dataAnalyticsChoice: choice }) }));
      },

      setCryptoStrategy: (strategy) => {
        set((state) => ({ pl: enforceStatCaps({ ...state.pl, cryptoStrategy: strategy }) }));
      },

      setVASettings: (staff, training, client) => {
        set((state) => ({
          pl: enforceStatCaps({
            ...state.pl,
            vaStaff: staff,
            vaTraining: training,
            vaClient: client
          })
        }));
      },

    setRealEstateChoices: (type, leverage, strategy) => {
      set((state) => ({
        pl: enforceStatCaps({
          ...state.pl,
          realEstateType: type,
          realEstateLeverage: leverage,
          realEstateStrategy: strategy
        })
      }));
    },

    setVCChoices: (stage, sector, investment) => {
      set((state) => ({
        pl: enforceStatCaps({
          ...state.pl,
          vcStage: stage,
          vcSector: sector,
          vcInvestment: investment
        })
      }));
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
        const totalFee = req.fee;

        if (state.pl.bag >= req.cash &&
            state.pl.clout >= req.clout &&
            state.pl.aura >= req.aura) {

          // Check if player can afford the fee
          if (state.pl.bag < totalFee) {
            set({
              news: [`❌ Cannot advance to ${nextTier}: Need $${Math.floor(totalFee).toLocaleString()} for filing fees and institutional buy-in`, ...state.news.slice(0, 49)]
            });
            return false;
          }

          set({
            pl: enforceStatCaps({
              ...state.pl,
              bag: state.pl.bag - totalFee,
              clout: Math.floor(state.pl.clout * 0.6),
              aura: Math.floor(state.pl.aura * 0.6),
              currentTier: nextTier,
            }),
            activeTab: nextTier,
            news: [`🎉 ADVANCED to ${nextTier} tier! ${req.description}`, ...state.news.slice(0, 49)]
          });

          showConfetti();

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

        if (isVending) {
          const { newPl, newMarket, news: monthNews, shouldDie, deathCause } = advanceMonth(
            plAfterPurchase,
            state.currentMarket
          );

          const cappedPl = enforceStatCaps(newPl);

          if (shouldDie) {
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
        }

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
          pl: enforceStatCaps({
            ...state.pl,
            actionLog: [newAction, ...(state.pl.actionLog || [])].slice(0, 500),
          }),
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
            pl: enforceStatCaps({
              ...state.pl,
              milestones: [...(state.pl.milestones || []), ...newMilestones],
            }),
            news: [`🏆 MILESTONE: ${newMilestones.map(m => m.name).join(', ')}`, ...state.news],
          });
        }
      },
    }),
    {
      name: 'bag-chaser-save',
      partialize: (state) => ({
        pl: state.pl,
        ph: state.ph,
        currentMarket: state.currentMarket,
        unlockedHustles: state.unlockedHustles,
        activeTab: state.activeTab,
        difficulty: state.difficulty,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}
