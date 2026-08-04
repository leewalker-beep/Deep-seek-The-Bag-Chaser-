import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';
import { HUSTLE_BADGES } from '../config/badges';
import { PROGRESSION_ORDER } from '../config/tiers';
import { ACHIEVEMENTS } from '../config/achievements';
import { ProgressBar } from './ui/ProgressBar';
import { HUSTLES } from '../config/hustles/base';
import { FLEX_ASSETS } from '../config/flexAssets';
import { ScrollableList } from './ui/ScrollableList';
import { EmptyState } from './ui/EmptyState';
import { getReputationDetails } from '../engine/reputationEngine';
import { compileBiographyChapters } from '../utils/biographyCompiler';

export const Scoreboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { pl, achievements, isTutorialSkipped, tutorialStep } = useGameStore();
  const [activeTab, setActiveTab] = useState<'career' | 'portfolio' | 'badges' | 'history' | 'biography' | 'reputation' | 'ledger' | 'empire' | 'achievements' | 'endings' | 'deaths' | 'finance'>('career');
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [bioViewMode, setBioViewMode] = useState<'book' | 'log'>('book');

  const { setPh, updatePl, takeLoan, repayLoan } = useGameStore();

  const targetTab = pl.narrativeFlags?.target_scoreboard_tab as string;
  useEffect(() => {
    if (targetTab) {
      setActiveTab(targetTab as any);
      updatePl({
        narrativeFlags: {
          ...(pl.narrativeFlags || {}),
          target_scoreboard_tab: ''
        }
      });
    }
  }, [targetTab, updatePl, pl.narrativeFlags]);

  const stats = pl.stats || { totalHustles: 0, successfulHustles: 0, lifetimeEarnings: 0 };
  const successRate = stats.totalHustles > 0
    ? Math.floor((stats.successfulHustles / stats.totalHustles) * 100)
    : 0;

  // Tab progressive discovery checks
  const getTabStatus = (tabName: string) => {
    // Core tabs are always unlocked and celebrated
    if (['career', 'portfolio', 'badges', 'achievements', 'endings', 'deaths', 'finance'].includes(tabName)) {
      return { isUnlocked: true, isCelebrated: true };
    }

    let isUnlocked = false;
    let explanation = '';
    let whyItMatters = '';
    let requirement = '';
    let currentProgress = '';
    let progressPercent = 0;
    let icon = '';

    switch (tabName) {
      case 'history':
        isUnlocked = stats.totalHustles > 0 || (pl.actionLog && pl.actionLog.length > 0);
        explanation = "Every legend starts somewhere. Complete your first hustle to begin recording your journey.";
        whyItMatters = "History logs provide a transaction record of every job, level up, and action you execute, helping you audit your financial career.";
        requirement = "Complete 1 Hustle";
        currentProgress = `${isUnlocked ? 1 : 0} / 1 Hustles`;
        progressPercent = isUnlocked ? 100 : 0;
        icon = "📋";
        break;
      case 'biography':
        isUnlocked = pl.clout >= 50;
        explanation = "The world doesn't know your story yet. As your influence grows the media will begin documenting your rise.";
        whyItMatters = "Your biography dynamically records high-importance chronological lore events, from signing top-tier artists to political appointments, shaping your permanent legacy and retirement score.";
        requirement = "Reach 50 Clout";
        currentProgress = `${Math.min(50, pl.clout)} / 50 Clout`;
        progressPercent = Math.min(100, (pl.clout / 50) * 100);
        icon = "📖";
        break;
      case 'reputation':
        isUnlocked = pl.month >= 3;
        explanation = "Your public identity has not yet formed. Continue making decisions and the world will decide who you become.";
        whyItMatters = "Reputation shifts lock you into dynamic archetypes (e.g., The Reformer, The Philanthropist, The Crime Boss) which grant powerful late-game passive multipliers and unique narrative arcs.";
        requirement = "Survive until Month 3";
        currentProgress = `Month ${Math.min(3, pl.month)} / 3`;
        progressPercent = Math.min(100, (pl.month / 3) * 100);
        icon = "🏆";
        break;
      case 'ledger':
        const passiveIncome = pl.lastPassiveBreakdown?.finalTotal || 0;
        isUnlocked = passiveIncome > 0;
        explanation = "Your finances are still simple. When passive income becomes an important part of your wealth you'll unlock detailed financial reporting.";
        whyItMatters = "The Ledger acts as your personal financial audit system, breaking down every month's passive yields, base assets, and compounding multipliers in absolute detail.";
        requirement = "Generate any Passive Monthly Income";
        currentProgress = `$${passiveIncome.toLocaleString()} / $1+ monthly passive yield`;
        progressPercent = isUnlocked ? 100 : 0;
        icon = "💸";
        break;
      case 'empire':
        isUnlocked = pl.currentTier !== 'MUD';
        explanation = "You don't own an empire...yet. Grow your businesses and investments to unlock executive management.";
        whyItMatters = "Empire management consolidates all active linear businesses, real estate, and flex assets into a centralized, high-level control panel.";
        requirement = "Advance to STREET Tier";
        currentProgress = `Tier ${pl.currentTier} / STREET`;
        progressPercent = isUnlocked ? 100 : 0;
        icon = "👑";
        break;
      default:
        isUnlocked = true;
    }

    const isCelebrated = !!pl.narrativeFlags?.[`unlocked_${tabName}_celebrated`];

    return {
      isUnlocked,
      isCelebrated,
      explanation,
      whyItMatters,
      requirement,
      currentProgress,
      progressPercent,
      icon
    };
  };

  const handleEndRun = () => {
    setPh('POST_MORTEM');
    onClose();
  };

  const showTutorial = !isTutorialSkipped && tutorialStep < 6;

  // Active Businesses Elements calculation
  const activeBusinessesElements: React.ReactNode[] = [];

  Object.keys(HUSTLES).forEach(hId => {
    const level = pl.hustleLevels[hId] || 0;
    const branchId = pl.hustleBranchIds[hId];
    if (level === 0 && !branchId) return;

    const hustle = HUSTLES[hId];
    let details = '';
    let passiveYieldAmount = 0;

    if (hustle.branches && branchId) {
      const branch = hustle.branches[branchId];
      details = `Branch: ${branch?.name || branchId}`;
      passiveYieldAmount = branch?.passiveYield || 0;
    } else if (hustle.levels) {
      const lvlData = hustle.levels.find(l => l.level === level);
      details = `Level: ${level}`;
      passiveYieldAmount = lvlData?.passiveYield || 0;
    }

    let countModifier = 1;
    if (hId === 'r_vending') countModifier = pl.vendingCount || 0;
    else if (hId === 'r_labor' && branchId === 'l2b') countModifier = pl.rentPortfolioCount || 1;

    const totalPassiveYield = passiveYieldAmount * countModifier;

    activeBusinessesElements.push(
      <div key={hId} className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{hustle.icon}</span>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">
              {hustle.name}
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
              {details} {countModifier > 1 ? `• ${countModifier} Units` : ''}
            </div>
          </div>
        </div>
        <div className="text-right">
          {totalPassiveYield > 0 ? (
            <div className="text-[11px] font-mono font-black text-emerald-400">
              +${totalPassiveYield.toLocaleString()}/mo
            </div>
          ) : (
            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
              Active Cash Focus
            </div>
          )}
        </div>
      </div>
    );
  });

  if (pl.vendingCount > 0 && !pl.hustleLevels['r_vending']) {
    activeBusinessesElements.push(
      <div key="explicit_vending" className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🥤</span>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">
              Vending Machines
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
              {pl.vendingCount} Units Owned
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono font-black text-emerald-400">
            +${(pl.vendingCount * 150).toLocaleString()}/mo
          </div>
        </div>
      </div>
    );
  }

  if (pl.artists && pl.artists.length > 0) {
    activeBusinessesElements.push(
      <div key="signed_artists" className="p-3.5 bg-slate-950 border border-slate-800/60 rounded-2xl space-y-2 shrink-0">
        <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
          🎙️ Signed Artists (Music Production)
        </div>
        <div className="space-y-1.5">
          {pl.artists.map(artist => (
            <div key={artist.id} className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{artist.avatar || '🎙️'}</span>
                <span className="text-slate-300 font-bold uppercase tracking-tight">{artist.name} ({artist.tier})</span>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono font-black text-emerald-400">
                  +${artist.monthlyRevenue.toLocaleString()}/mo
                </div>
                <div className="text-[7px] text-red-400 uppercase font-black">
                  Retainer: -${artist.monthlyRetainer.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Real Estate Portfolio Elements calculation
  const realEstateElements: React.ReactNode[] = [];

  if (pl.rentPortfolioCount > 0) {
    realEstateElements.push(
      <div key="rent_portfolio" className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">
              Rent Portfolio
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
              {pl.rentPortfolioCount} Residential Units
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono font-black text-emerald-400">
            +${(pl.rentPortfolioCount * 500).toLocaleString()}/mo
          </div>
        </div>
      </div>
    );
  }

  if (pl.rentalCount > 0) {
    realEstateElements.push(
      <div key="real_estate_empire" className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-tight">
                Real Estate Empire
              </div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                {pl.rentalCount} properties owned ({pl.realEstateType})
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono font-black text-emerald-400">
              +${(pl.rentalCount * 50000).toLocaleString()}/mo (est)
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[8px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-900 pt-2">
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-600 block text-[7px] font-black">Leverage</span>
            <span className="text-white font-mono">{pl.realEstateLeverage}%</span>
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-600 block text-[7px] font-black">Strategy</span>
            <span className="text-white">{pl.realEstateStrategy}</span>
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-600 block text-[7px] font-black">Market Cycle</span>
            <span className="text-emerald-400">{pl.marketCycle?.realEstate}</span>
          </div>
        </div>
      </div>
    );
  }

  // Flex Assets Elements calculation
  const flexAssetElements: React.ReactNode[] = [];

  FLEX_ASSETS.forEach(asset => {
    const count = pl.flexAssets[asset.id] || 0;
    if (count > 0) {
      const assetPassive = asset.passiveYield * count;
      flexAssetElements.push(
        <div key={asset.id} className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{asset.icon}</span>
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-tight">
                {asset.name}
              </div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                {count} owned
              </div>
            </div>
          </div>
          <div className="text-right">
            {assetPassive > 0 ? (
              <div className="text-[11px] font-mono font-black text-emerald-400">
                +${assetPassive.toLocaleString()}/mo
              </div>
            ) : (
              <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                Prestige Asset
              </div>
            )}
          </div>
        </div>
      );
    }
  });

  return (
    <div className={`fixed inset-0 ${showTutorial ? 'z-[200]' : 'z-50'} flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">The Scoreboard</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex bg-slate-950/80 p-1 m-4 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar gap-1">
          {['career', 'portfolio', 'badges', 'history', 'biography', 'reputation', 'ledger', 'empire', 'achievements', 'endings', 'deaths', 'finance'].map((tab) => {
            const status = getTabStatus(tab);
            let tabLabel = tab;
            let indicator = null;

            if (!status.isUnlocked) {
              indicator = <span className="text-[9px] mr-1">🔒</span>;
            } else if (!status.isCelebrated) {
              indicator = <span className="text-[10px] mr-1 text-emerald-400 animate-pulse">✨</span>;
            }

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-shrink-0 flex items-center gap-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-emerald-400 border border-slate-700/50 shadow-md'
                    : !status.isUnlocked
                      ? 'text-slate-500 hover:text-slate-300 opacity-60'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                {indicator}
                <span>{tabLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          <AnimatePresence mode="wait">
            {!getTabStatus(activeTab).isUnlocked ? (
              <motion.div
                key={`locked_${activeTab}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-6 bg-slate-950 border border-slate-800/80 rounded-3xl space-y-6 text-center max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner text-slate-500">
                  {getTabStatus(activeTab).icon || '🔒'}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white flex justify-center items-center gap-2">
                    <span>{activeTab}</span>
                    <span className="text-xs bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-widest">Locked</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase tracking-tight max-w-sm mx-auto">
                    "{getTabStatus(activeTab).explanation}"
                  </p>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl space-y-3 text-left">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Why it matters</div>
                  <p className="text-[10px] text-slate-300 uppercase tracking-tight font-medium leading-relaxed">
                    {getTabStatus(activeTab).whyItMatters}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Unlock Requirement</span>
                    <span>{getTabStatus(activeTab).currentProgress}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className="h-full bg-slate-700 rounded-full transition-all duration-500"
                      style={{ width: `${getTabStatus(activeTab).progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold text-center mt-1">
                    {getTabStatus(activeTab).requirement}
                  </p>
                </div>
              </motion.div>
            ) : !getTabStatus(activeTab).isCelebrated ? (
              <motion.div
                key={`celebrate_${activeTab}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/30 rounded-3xl space-y-6 text-center max-w-md mx-auto relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]"
              >
                {/* Gentle glow effect */}
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl pointer-events-none" />

                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-500/10 animate-bounce relative z-10">
                  {getTabStatus(activeTab).icon || '✨'}
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] animate-pulse">
                    NEW FEATURE UNLOCKED
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">
                    {activeTab}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight max-w-xs mx-auto leading-relaxed">
                    "{getTabStatus(activeTab).explanation}"
                  </p>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl space-y-1 relative z-10 text-left">
                  <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">SYSTEM SUMMARY</div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight">
                    {getTabStatus(activeTab).whyItMatters}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const currentFlags = pl.narrativeFlags || {};
                    updatePl({
                      narrativeFlags: {
                        ...currentFlags,
                        [`unlocked_${activeTab}_celebrated`]: true
                      }
                    });
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black uppercase tracking-[0.15em] rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  ACTIVATE SYSTEM
                </button>
              </motion.div>
            ) : (
              <>
                {activeTab === 'career' && (
              <motion.div
                key="career"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
                  <span className="font-black text-white block mb-1">💼 Career Overview</span>
                  Tracks your global performance and accomplishments across this lifetime. All activities shape your eventual retirement score.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group relative">
                    <StatCard label="Lifetime Profit" value={`$${stats.lifetimeEarnings.toLocaleString()}`} colorClass="text-emerald-400" />
                    <div className="absolute top-full left-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
                      The sum total of all cash cleared from successful contracts, deals, and revenue streams.
                    </div>
                  </div>

                  <div className="group relative">
                    <StatCard label="Success Rate" value={`${successRate}%`} colorClass="text-blue-400" />
                    <div className="absolute top-full right-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
                      Your historical accuracy rate in minigames. Higher rate means optimal payout multipliers.
                    </div>
                  </div>

                  <div className="group relative">
                    <StatCard label="Total Hustles" value={stats.totalHustles} />
                    <div className="absolute top-full left-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
                      Total number of months spent running active gigs or strategic actions.
                    </div>
                  </div>

                  <div className="group relative">
                    <StatCard label="Legacy Score" value={pl.legacyPoints || 0} colorClass="text-yellow-400" />
                    <div className="absolute top-full right-0 mt-1 w-44 p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
                      Current rating of your character's life. Converts to buyable meta upgrades upon death.
                    </div>
                  </div>

                  <StatCard label="Login Streak" value={`${pl.loginStreak || 0} Days`} icon="🔥" />
                  <StatCard label="Endings Found" value={`${JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').length}/16`} icon="🎬" />
                  <StatCard label="Grammys" value={pl.grammyCount || 0} icon="🏆" />
                  <StatCard label="Vending Machines" value={pl.vendingCount || 0} icon="🥤" />
                  <StatCard label="Flex Assets" value={Object.keys(pl.flexAssets || {}).length} icon="💎" />
                </div>

                <div className="p-4 bg-slate-950 border border-yellow-500/20 rounded-2xl group relative">
                  <div className="absolute bottom-full left-0 mb-2 w-full p-2 bg-slate-950 border border-slate-800 rounded text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-snug">
                    Completed goals award Momentum. Every 10 milestones provide a permanent cross-lifetime multiplier for all cash yields.
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legacy Momentum</div>
                    <div className="text-[10px] font-black text-yellow-400">
                      +{(Math.floor((pl.totalChallengesCompleted || 0) / 10) * 0.1).toFixed(1)}% Multiplier
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>Next Boost</span>
                      <span>{(pl.totalChallengesCompleted || 0) % 10} / 10 Challenges</span>
                    </div>
                    <ProgressBar
                      value={((pl.totalChallengesCompleted || 0) % 10) * 10}
                      colorClass="bg-yellow-500"
                      className="h-1.5"
                    />
                  </div>
                  <p className="text-[7px] text-slate-600 uppercase font-bold mt-2 text-center">
                    Permanent cross-run boost for every 10 challenges completed
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Total Earning Power HUD */}
                <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <div className="text-6xl uppercase font-black italic tracking-tighter text-white rotate-12">EMPIRE</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Total Earning Power</div>
                        <div className="text-4xl font-black text-white font-mono tracking-tighter">
                            ${(pl.lastPassiveBreakdown?.finalTotal || 0).toLocaleString()}
                            <span className="text-lg text-slate-500 font-normal"> / mo</span>
                        </div>
                        <div className="mt-4 flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Base Value</span>
                                <span className="text-xs font-mono text-slate-300">${(pl.lastPassiveBreakdown?.baseTotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Active Multipliers</span>
                                <span className="text-xs font-mono text-emerald-400">
                                    x{((pl.lastPassiveBreakdown?.finalTotal || 1) / (pl.lastPassiveBreakdown?.baseTotal || 1)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Attribution */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Streams</h3>
                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Source Contribution</span>
                    </div>

                    {!pl.lastPassiveBreakdown || pl.lastPassiveBreakdown.sources.length === 0 ? (
                        <EmptyState
                          message="No passive assets acquired yet. Build your first revenue stream."
                          className="bg-slate-950/30 text-slate-700 text-xs rounded-3xl"
                        />
                    ) : (
                        <ScrollableList maxHeight="max-h-[260px]" fadeColor="from-slate-900">
                            <div className="space-y-2 pb-8">
                                {pl.lastPassiveBreakdown.sources
                                    .sort((a, b) => b.amount - a.amount)
                                    .map((src, idx) => (
                                        <div key={src.id} className="group p-4 bg-slate-950 border border-slate-800/50 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                                                    idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500 border border-slate-800'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                                        {src.name}
                                                    </div>
                                                    <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                                                        {src.category} {src.count ? `• ${src.count} Units` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-mono font-black text-emerald-400">
                                                    +${src.amount.toLocaleString()}
                                                </div>
                                                <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">
                                                    {((src.amount / pl.lastPassiveBreakdown!.baseTotal) * 100).toFixed(0)}% SHARE
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </ScrollableList>
                    )}
                </div>

                {/* Specialization Impact Card */}
                {pl.activeSpecializationId && (
                    <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">⚡</span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.1em]">Specialization Synergy</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Your <span className="text-white font-black">{pl.activeSpecializationId.toUpperCase()}</span> perk is amplifying all passive yields by <span className="text-emerald-400 font-black">
                                +{Math.round(((pl.lastPassiveBreakdown?.multipliers.specialization || 1) - 1) * 100)}%
                            </span>.
                        </div>
                    </div>
                )}
              </motion.div>
            )}

            {activeTab === 'empire' && (
              <motion.div
                key="empire"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Total Net Passive Income & Cash Summary */}
                <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <div className="text-6xl uppercase font-black italic tracking-tighter text-white rotate-12">EMPIRE</div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Empire Value Summary</div>
                        <div className="text-3xl font-black text-white font-mono tracking-tighter">
                            ${pl.bag.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Liquid Cash Capital</div>
                        <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Active Businesses</span>
                                <span className="text-sm font-mono font-black text-white">
                                    {Object.keys(pl.hustleLevels || {}).filter(hId => (pl.hustleLevels[hId] || 0) > 0 || pl.hustleBranchIds[hId]).length} Active
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Real Estate Holdings</span>
                                <span className="text-sm font-mono font-black text-emerald-400">
                                    {((pl.rentalCount || 0) + (pl.rentPortfolioCount || 0))} Properties
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Total Monthly Yield</span>
                                <span className="text-sm font-mono font-black text-emerald-400">
                                    +${(pl.lastPassiveBreakdown?.finalTotal || 0).toLocaleString()}/mo
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIVE BUSINESSES SECTION */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Businesses</h3>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Venture List</span>
                  </div>

                  {activeBusinessesElements.length === 0 ? (
                    <EmptyState
                      message="No active businesses owned. Build your first venture."
                      className="text-slate-700 text-xs bg-slate-950/30"
                    />
                  ) : (
                    <ScrollableList maxHeight="max-h-[250px]">
                      <div className="space-y-2 pb-8 flex flex-col">
                        {activeBusinessesElements}
                      </div>
                    </ScrollableList>
                  )}
                </div>

                {/* REAL ESTATE HOLDINGS SECTION */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real Estate Portfolio</h3>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Property Holdings</span>
                  </div>

                  {realEstateElements.length === 0 ? (
                    <EmptyState
                      message="No Real Estate holdings in your portfolio."
                      className="text-slate-700 text-[9px] uppercase font-black bg-slate-950/30"
                      paddingClass="py-6"
                    />
                  ) : (
                    <ScrollableList maxHeight="max-h-[220px]">
                      <div className="space-y-2 pb-8 flex flex-col">
                        {realEstateElements}
                      </div>
                    </ScrollableList>
                  )}
                </div>

                {/* PASSIVE HOLDINGS / FLEX ASSETS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flex Assets & Capital holdings</h3>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Sovereign Assets</span>
                  </div>

                  {flexAssetElements.length === 0 ? (
                    <EmptyState
                      message="No Flex Assets purchased yet. Build your prestige."
                      className="text-slate-700 text-[9px] uppercase font-black bg-slate-950/30"
                      paddingClass="py-6"
                    />
                  ) : (
                    <ScrollableList maxHeight="max-h-[220px]">
                      <div className="space-y-2 pb-8 flex flex-col">
                        {flexAssetElements}
                      </div>
                    </ScrollableList>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* TIER BADGES SECTION */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tier Badges</div>
                  {pl.tierBadges.length === 0 ? (
                    <EmptyState
                      message="No tiers mastered yet. Complete every hustle in a tier to earn its badge."
                      className="text-slate-600 text-[10px] uppercase font-black bg-slate-950/30"
                      paddingClass="py-6"
                    />
                  ) : (
                    <ScrollableList maxHeight="max-h-[180px]">
                      <div className="grid grid-cols-2 gap-2 pb-8">
                        {pl.tierBadges.map(tier => (
                          <div key={tier} className="p-3 bg-slate-950 border border-yellow-500/30 rounded-2xl flex flex-col items-center text-center gap-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 bg-yellow-500/10 text-[6px] font-bold text-yellow-400 border-l border-b border-yellow-500/20 uppercase tracking-tighter">MASTER</div>
                            <span className="text-2xl mb-1">🏆</span>
                            <span className="font-black text-white text-[10px] uppercase italic tracking-tighter">{tier} MASTER</span>
                            <span className="text-[8px] text-emerald-400 font-bold">+2% YIELD</span>
                          </div>
                        ))}
                      </div>
                    </ScrollableList>
                  )}
                </div>

                {/* HUSTLE MASTERY SECTION */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mastery Badges</div>
                  {pl.masteredHustles.length === 0 ? (
                    <EmptyState
                      message="No hustles mastered yet. Max out a hustle to earn a badge."
                      className="text-slate-600 text-sm bg-slate-950/30"
                    />
                  ) : (
                    <ScrollableList maxHeight="max-h-[280px]">
                      <div className="space-y-3 pb-8 flex flex-col">
                        {pl.masteredHustles.map(hId => {
                          const badge = HUSTLE_BADGES[hId];
                          if (!badge) return null;
                          return (
                            <div key={badge.id} className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center gap-4 relative overflow-hidden shrink-0">
                              <div className="absolute top-0 right-0 p-1 bg-emerald-500/10 text-[8px] font-bold text-emerald-400 border-l border-b border-emerald-500/20">MASTERED</div>
                              <div className="text-4xl bg-slate-900 w-16 h-16 flex items-center justify-center rounded-xl shadow-inner border border-slate-800 shrink-0">
                                {badge.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-black text-white text-lg tracking-tight leading-none mb-1">{badge.name}</div>
                                <div className="text-xs text-slate-400 italic mb-2">{badge.description}</div>
                                <div className="flex flex-wrap gap-2">
                                  <div className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">
                                    BUFF: {badge.buff.value}x {badge.buff.type}
                                  </div>
                                  {badge.futureBenefit && badge.relevantTier && (
                                    (() => {
                                      const currentTierIdx = PROGRESSION_ORDER.indexOf(pl.currentTier);
                                      const relevantTierIdx = PROGRESSION_ORDER.indexOf(badge.relevantTier);
                                      const isActive = currentTierIdx >= relevantTierIdx;
                                      return isActive ? (
                                        <div className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                          ACTIVE: {badge.futureBenefit}
                                        </div>
                                      ) : null;
                                    })()
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollableList>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'reputation' && (
              <motion.div
                key="reputation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {(() => {
                  const currentRepName = pl.narrativeFlags?.publicReputation as string || "The Hustler";
                  const repDetails = getReputationDetails(currentRepName);
                  const candidate = pl.narrativeFlags?.reputationCandidate as string;
                  const sustainedMonths = pl.narrativeFlags?.reputationSustainedMonths as number || 0;

                  const charityScore = Math.min(100, Math.round(
                    (pl.aura * 0.4) +
                    ((pl.philanthropyDonation || 0) > 100000 ? 30 : 0) +
                    ((pl.hustleLevels?.['philanthropy_empire'] || 0) > 0 ? 30 : 0)
                  ));

                  const crimeScore = Math.min(100, Math.round(
                    (pl.heat * 0.5) +
                    (Math.min(30, (pl.arrestCount || 0) * 10)) +
                    ((pl.hustleLevels?.['r_ghost_mode'] || 0) > 0 ? 10 : 0) +
                    ((pl.hustleLevels?.['r_scrap'] || 0) > 0 ? 10 : 0)
                  ));

                  const commerceScore = Math.min(100, Math.round(
                    (Object.keys(pl.hustleLevels || {}).length * 8) +
                    ((pl.rentalCount || 0) * 6) +
                    (pl.bag > 1000000 ? 30 : 10)
                  ));

                  const socialScore = Math.min(100, Math.round(
                    (pl.clout / 12) +
                    ((pl.artists || []).length * 12)
                  ));

                  return (
                    <div className="space-y-5">
                      {/* Persona Contributing Vectors Tracker */}
                      <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex justify-between items-center">
                          <span>📊 Persona Contributing Vectors</span>
                          <span className="text-[7px] text-slate-500 lowercase font-medium">real-time factors</span>
                        </h4>
                        <div className="space-y-2">
                          {/* Charity Vector */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                              <span className="text-emerald-400">🕊️ Charity & Philanthropy</span>
                              <span className="text-slate-400">{charityScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${charityScore}%` }} />
                            </div>
                          </div>

                          {/* Crime Vector */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                              <span className="text-red-400">⚖️ Crime & Underworld Activity</span>
                              <span className="text-slate-400">{crimeScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${crimeScore}%` }} />
                            </div>
                          </div>

                          {/* Social/Celebrity Vector */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                              <span className="text-blue-400">👑 Social Clout & Celebrity</span>
                              <span className="text-slate-400">{socialScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${socialScore}%` }} />
                            </div>
                          </div>

                          {/* Commerce/Mogul Vector */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                              <span className="text-yellow-400">🏢 Commerce & Mogul Leverage</span>
                              <span className="text-slate-400">{commerceScore}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${commerceScore}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reputation Title Card */}
                      <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden text-center shadow-lg">
                        <div className="absolute top-2 right-2 bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-black tracking-widest text-emerald-400 px-2 py-0.5 rounded uppercase">
                          Active Profile
                        </div>
                        <span className="text-4xl block mb-2 animate-pulse">🏆</span>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">
                          {repDetails.name}
                        </h3>
                        <p className="text-[10px] text-slate-300 uppercase tracking-tight font-medium max-w-sm mx-auto leading-relaxed pt-1">
                          {repDetails.earnedHow}
                        </p>
                      </div>

                      {/* Shifting perception helper */}
                      {candidate && (
                        <div className="p-4 bg-yellow-950/15 border border-yellow-500/25 rounded-2xl space-y-2">
                          <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest block">
                            ⚡ Public Perception Shifting
                          </span>
                          <p className="text-[10px] text-slate-300 uppercase tracking-tight font-medium leading-relaxed">
                            Sustained trend noticed: Public focus is shifting towards <strong className="text-yellow-400">"{candidate}"</strong>.
                          </p>
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 flex-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${(sustainedMonths / 3) * 100}%` }} />
                            </div>
                            <span className="text-[8px] font-mono font-bold text-yellow-400 uppercase shrink-0">{sustainedMonths}/3 Months</span>
                          </div>
                        </div>
                      )}

                      {/* Contributing Factors */}
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                          Contributing Factors
                        </h4>
                        <ul className="space-y-1.5 pl-1">
                          {repDetails.contributingFactors.map((factor, idx) => (
                            <li key={idx} className="text-[10px] text-slate-300 uppercase tracking-tight font-medium flex items-start gap-2">
                              <span className="text-indigo-400 shrink-0">⚡</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Positives & Negatives */}
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Positives */}
                        <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl space-y-2.5">
                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-500/10 pb-1.5">
                            <span>✅</span> Positive Effects
                          </h4>
                          <ul className="space-y-1.5">
                            {repDetails.positives.map((pos, idx) => (
                              <li key={idx} className="text-[9px] text-slate-300 uppercase tracking-tight font-semibold leading-normal">
                                • {pos}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Negatives */}
                        <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-2xl space-y-2.5">
                          <h4 className="text-[10px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-red-500/10 pb-1.5">
                            <span>❌</span> Negative Effects
                          </h4>
                          <ul className="space-y-1.5">
                            {repDetails.negatives.map((neg, idx) => (
                              <li key={idx} className="text-[9px] text-slate-300 uppercase tracking-tight font-semibold leading-normal">
                                • {neg}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === 'ledger' && (
              <motion.div
                key="ledger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {(() => {
                  const events = pl.events || [];
                  const totalProfitVal = events
                    .filter(e => e.type === 'HUSTLE_COMPLETED')
                    .reduce((sum, e) => {
                      const m = e.metadata as any;
                      return sum + (m.profit || 0);
                    }, 0);

                  const houseFlipsVal = events.filter(e => {
                    if (e.type !== 'PROPERTY_PURCHASED') return false;
                    const m = e.metadata as any;
                    return m.branchId === 'l2a';
                  }).length;

                  const vendingCountVal = events.filter(e => {
                    if (e.type !== 'BUSINESS_PURCHASED') return false;
                    const m = e.metadata as any;
                    return m.assetId === 'vending';
                  }).length;

                  return (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
                        <span className="font-black text-emerald-400 block mb-1">💸 The Financial Ledger</span>
                        A transaction history of all cash flows, active hustle profits, passive earnings, and capital investments recorded throughout this life.
                      </div>

                      {/* Stats Grid */}
                      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-[8px] text-slate-500 font-black uppercase">TOTAL PROFIT</div>
                            <div className="text-sm font-black text-emerald-400 font-mono">${totalProfitVal.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 font-black uppercase">HOUSES FLIPPED</div>
                            <div className="text-sm font-black text-white font-mono">{houseFlipsVal}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 font-black uppercase">VENDING UNITS</div>
                            <div className="text-sm font-black text-white font-mono">{vendingCountVal}</div>
                          </div>
                        </div>
                      </div>

                      {/* Financial Records List */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Imperial Audit Trail</div>
                        {events.length === 0 ? (
                          <EmptyState
                            message="No transactions recorded yet."
                            className="bg-slate-950/30 text-slate-700 text-xs rounded-3xl"
                          />
                        ) : (
                          <ScrollableList maxHeight="max-h-[300px]" fadeColor="from-slate-900">
                            <div className="space-y-2 pb-8 flex flex-col">
                              {events.slice(0, 30).map((e) => {
                                const m = e.metadata as any;
                                let title = e.type.replace(/_/g, ' ');
                                let subtitle = '';
                                let valStr = '';
                                let isPositive = true;

                                if (e.type === 'HUSTLE_COMPLETED') {
                                  title = m.hustleName || title;
                                  subtitle = m.success ? 'Hustle Success' : 'Hustle Fail';
                                  valStr = `${m.profit >= 0 ? '+' : ''}$${m.profit.toLocaleString()}`;
                                  isPositive = m.profit >= 0;
                                } else if (e.type === 'BUSINESS_PURCHASED') {
                                  title = `Acquired ${m.assetId?.replace('_', ' ')}`;
                                  subtitle = 'Business Asset';
                                  valStr = `-$${m.cost?.toLocaleString()}`;
                                  isPositive = false;
                                } else if (e.type === 'PROPERTY_PURCHASED') {
                                  title = `Acquired ${m.branchName || m.type || 'Property'}`;
                                  subtitle = 'Real Estate';
                                  valStr = `-$${m.cost?.toLocaleString()}`;
                                  isPositive = false;
                                } else if (e.type === 'LAW_PASSED') {
                                  title = `Order: ${m.name}`;
                                  subtitle = 'Executive Decree';
                                  valStr = `-$${m.cost?.toLocaleString()}`;
                                  isPositive = false;
                                } else if (e.type === 'CRISIS_RESOLVED') {
                                  title = `Resolved: ${m.name}`;
                                  subtitle = 'National Security';
                                  valStr = `-$${m.cost?.toLocaleString()}`;
                                  isPositive = false;
                                } else if (m && typeof m.profit === 'number') {
                                  valStr = `${m.profit >= 0 ? '+' : ''}$${m.profit.toLocaleString()}`;
                                  isPositive = m.profit >= 0;
                                } else if (m && typeof m.cost === 'number') {
                                  valStr = `-$${m.cost.toLocaleString()}`;
                                  isPositive = false;
                                } else {
                                  return null; // Skip non-financial events
                                }

                                return (
                                  <div key={e.id} className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl flex justify-between items-center shrink-0">
                                    <div>
                                      <div className="text-[10px] font-black text-white uppercase tracking-tight">{title}</div>
                                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{subtitle}</div>
                                    </div>
                                    <div className={`text-xs font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {valStr}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollableList>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Achievements</div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">
                    {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
                  </div>
                </div>

                {achievements.length === 0 ? (
                  <EmptyState message="No achievements found." className="bg-slate-950/30 text-slate-700" />
                ) : (
                  <ScrollableList maxHeight="max-h-[320px]">
                    <div className="space-y-2 pb-8 flex flex-col">
                      {achievements.map((a) => {
                        const config = ACHIEVEMENTS.find(c => c.id === a.id);
                        const prog = config?.requirement.progress(useGameStore.getState());
                        const progressValue = prog ? (prog.current / prog.target) * 100 : 0;

                        return (
                          <div
                            key={a.id}
                            className={`p-3 rounded-2xl border transition-all shrink-0 ${
                              a.isUnlocked
                                ? 'bg-slate-950 border-emerald-500/30'
                                : 'bg-slate-900/50 border-slate-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-black uppercase italic ${a.isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                {a.name}
                              </span>
                              {a.isUnlocked && <span className="text-emerald-400 text-[10px]">🏆</span>}
                            </div>
                            <div className="text-[8px] text-slate-400 mb-2 uppercase tracking-tight">{a.description}</div>

                            {!a.isUnlocked && prog && prog.target > 1 && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                                  <span>Progress</span>
                                  <span>{Math.floor(prog.current).toLocaleString()} / {prog.target.toLocaleString()}</span>
                                </div>
                                <ProgressBar value={progressValue} colorClass="bg-slate-700" className="h-1" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollableList>
                )}
              </motion.div>
            )}

            {activeTab === 'endings' && (
              <motion.div
                key="endings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Unlocked Endings</div>
                {JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').length === 0 ? (
                  <EmptyState
                    message="No endings unlocked yet. Complete the journey to fill your gallery."
                    className="text-slate-600 text-sm bg-slate-950/30"
                  />
                ) : (
                  <ScrollableList maxHeight="max-h-[250px]">
                    <div className="grid grid-cols-2 gap-2 pb-8">
                      {JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]').map((title: string) => (
                        <div key={title} className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex flex-col items-center text-center gap-2">
                          <span className="text-3xl">🏆</span>
                          <span className="font-black text-white text-[10px] uppercase">{title}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollableList>
                )}
              </motion.div>
            )}

            {activeTab === 'deaths' && (
              <motion.div
                key="deaths"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Death Badges</div>
                {!pl.collectedDeathBadges || pl.collectedDeathBadges.length === 0 ? (
                  <EmptyState
                    message="No death badges collected yet. Complete different playthroughs to find new ways to go out."
                    className="text-red-500/40 border-red-500/20 bg-slate-950/30"
                  />
                ) : (
                  <ScrollableList maxHeight="max-h-[220px]">
                    <div className="grid grid-cols-3 gap-3 pb-8">
                      {pl.collectedDeathBadges.map((badge: string) => (
                        <div key={badge} className="aspect-square bg-slate-950 border border-red-500/20 rounded-xl flex items-center justify-center text-3xl shadow-inner grayscale hover:grayscale-0 transition-all duration-500">
                          {badge}
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 9 - (pl.collectedDeathBadges?.length || 0)) }).map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-950/30 border border-slate-800 border-dashed rounded-xl flex items-center justify-center text-slate-700 text-xl font-black">
                          ?
                        </div>
                      ))}
                    </div>
                  </ScrollableList>
                )}
                <p className="text-[8px] text-slate-500 text-center uppercase font-bold mt-4">Collect every unique way to go out</p>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                {!pl.actionLog || pl.actionLog.length === 0 ? (
                  <EmptyState message="No transactions recorded yet." className="text-slate-700 text-xs bg-slate-950/30" />
                ) : (
                  <ScrollableList maxHeight="max-h-[320px]">
                    <div className="space-y-2 pb-8 flex flex-col">
                       {pl.actionLog.slice(0, 20).map((log) => (
                         <div key={log.id} className="p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl flex justify-between items-center shrink-0">
                           <div>
                             <div className="text-[10px] font-bold text-white uppercase">{log.hustleName}</div>
                             <div className="text-[8px] text-slate-500">{log.branchName || 'Standard'}</div>
                           </div>
                           <div className={`text-xs font-mono font-bold ${log.netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                             {log.netCash >= 0 ? '+' : ''}${log.netCash.toLocaleString()}
                           </div>
                         </div>
                       ))}
                    </div>
                  </ScrollableList>
                )}
              </motion.div>
            )}

            {activeTab === 'biography' && (
              <motion.div
                key="biography"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Life Story</h3>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Living Biography</span>
                  </div>

                  {/* Elegant View Mode Toggle */}
                  <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 gap-0.5">
                    <button
                      onClick={() => setBioViewMode('book')}
                      className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all ${
                        bioViewMode === 'book'
                          ? 'bg-slate-800 text-emerald-400 font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      📖 Book View
                    </button>
                    <button
                      onClick={() => setBioViewMode('log')}
                      className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded transition-all ${
                        bioViewMode === 'log'
                          ? 'bg-slate-800 text-emerald-400 font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      📜 Log View
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
                  <span className="font-black text-white block mb-1">📖 The Chronicled Legend</span>
                  What is this? This biography dynamically compiles your life achievements into an elegant narrative. Read it like a professionally published autobiography of your rise to absolute power.
                </div>

                {!pl.biography || pl.biography.length === 0 ? (
                  <EmptyState
                    message="Your story is still being written. Every major move you make will be recorded here."
                    className="bg-slate-950/30 text-slate-700 text-xs rounded-3xl"
                  />
                ) : bioViewMode === 'book' ? (
                  /* Elegant Book Layout View */
                  <ScrollableList maxHeight="max-h-[340px]">
                    <div className="space-y-6 pb-12 pr-1">
                      {compileBiographyChapters(pl).map((chapter, cIdx) => (
                        <div
                          key={chapter.id}
                          className="p-5 bg-gradient-to-b from-slate-950/90 to-slate-950/40 border border-slate-800/80 rounded-3xl hover:border-emerald-500/20 transition-all space-y-4 shadow-xl relative overflow-hidden"
                        >
                          {/* Delicate background card glow */}
                          <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none" />

                          {/* Chapter Header */}
                          <div className="flex items-center gap-3 border-b border-slate-900 pb-3 relative z-10">
                            <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-inner">
                              {chapter.icon}
                            </div>
                            <div>
                              <div className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.25em]">
                                CHAPTER {String(cIdx + 1).padStart(2, '0')}
                              </div>
                              <h4 className="text-sm font-black text-white uppercase tracking-tight italic leading-tight">
                                {chapter.title}
                              </h4>
                            </div>
                          </div>

                          {/* Introductory Prose Paragraph */}
                          <p className="text-[11px] text-slate-300 leading-relaxed font-serif tracking-tight italic select-text relative z-10 pl-2 border-l border-emerald-500/20">
                            "{chapter.intro}"
                          </p>

                          {/* Historical Log Entries Under This Chapter */}
                          {chapter.entries.length > 0 && (
                            <div className="space-y-2.5 relative z-10 pt-2 border-t border-slate-900/50">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block pl-2">
                                KEY ACCOMPLISHMENTS
                              </span>
                              <div className="space-y-2 pl-2">
                                {chapter.entries.map((entry, eIdx) => (
                                  <div key={eIdx} className="text-[10px] text-slate-400 leading-relaxed tracking-tight select-text flex items-start gap-2.5">
                                    <span className="text-emerald-500 text-[9px] mt-0.5 select-none">✦</span>
                                    <span>{entry}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bridging Transition Paragraph */}
                          {chapter.transition && (
                            <div className="text-[9px] text-slate-500 italic leading-relaxed pt-3 border-t border-slate-950 font-medium tracking-tight">
                              {chapter.transition}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollableList>
                ) : (
                  /* Classic Checkpoint Timeline Log View (100% Save Compatibility) */
                  <ScrollableList maxHeight="max-h-[340px]">
                    <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800 pb-8">
                      {pl.biography.map((entry, idx) => (
                        <div key={idx} className="relative pl-12 shrink-0">
                          <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10">
                            <span className="text-yellow-500 font-black text-[10px] italic">{(idx + 1).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="bg-slate-950 border border-slate-800/50 p-4 rounded-2xl hover:border-emerald-500/30 transition-all">
                            <p className="text-[11px] text-slate-300 leading-relaxed font-medium uppercase tracking-tight">{entry}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollableList>
                )}
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Intro / Financial Health */}
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
                  <span className="font-black text-emerald-400 block mb-1">🏦 Strategic Financing</span>
                  Debt is an accelerator when used on high-ROI assets, and a liability when mismanaged. Standard active loans are capped to a maximum of 3 concurrent accounts.
                </div>

                {/* Active Liabilities */}
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Your Active Liabilities</div>

                  {(!pl.financialDebts || pl.financialDebts.length === 0) ? (
                    <EmptyState
                      message="You are completely debt-free. Outstanding liabilities: $0"
                      className="bg-slate-950/30 text-slate-500 text-xs rounded-3xl"
                    />
                  ) : (
                    <div className="space-y-2">
                      {pl.financialDebts.map((debt) => {
                        const remainingCost = debt.monthlyPayment * debt.remainingTerm;
                        return (
                          <div key={debt.id} className="p-4 bg-slate-950 border border-slate-800/60 hover:border-red-500/20 rounded-2xl flex items-center justify-between transition-all">
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-tight">{debt.loanType} LOAN</div>
                              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                                Principal: ${debt.principal.toLocaleString()} • Rate: {Math.round(debt.interestRate * 100)}% • {debt.remainingTerm} Months Left
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">MONTHLY</div>
                                <div className="text-[11px] font-mono font-black text-red-400 font-semibold">
                                  -${debt.monthlyPayment.toLocaleString()}
                                </div>
                              </div>
                              <button
                                onClick={() => repayLoan(debt.id)}
                                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 hover:text-white text-[8px] font-black uppercase rounded-lg transition-colors"
                                title={`Pay off early for $${remainingCost.toLocaleString()}`}
                              >
                                Pay Early
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Financial Products */}
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Financial Products (Optional)</div>
                  <div className="space-y-2">
                    {[
                      { type: 'STUDENT' as const, name: 'Student Loan', desc: 'Education and early setup', principal: 15000, rate: 0.04, term: 24, minTier: 'MUD' },
                      { type: 'EMERGENCY' as const, name: 'Emergency Loan', desc: 'Crucial liquidity squeezes', principal: 10000, rate: 0.15, term: 6, minTier: 'MUD' },
                      { type: 'EQUIPMENT' as const, name: 'Equipment Finance', desc: 'Accelerate machinery/infrastructure', principal: 75000, rate: 0.08, term: 18, minTier: 'STREET' },
                      { type: 'BUSINESS' as const, name: 'Business Loan', desc: 'Scale operational cash flow', principal: 500000, rate: 0.06, term: 36, minTier: 'STARTUP' },
                      { type: 'MORTGAGE' as const, name: 'Property Mortgage', desc: 'Real Estate acquisition leverage', principal: 2500000, rate: 0.05, term: 60, minTier: 'CORPORATE' }
                    ].map((prod) => {
                      const tierHierarchy = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];
                      const isUnlocked = tierHierarchy.indexOf(pl.currentTier) >= tierHierarchy.indexOf(prod.minTier);
                      const activeLoansCount = pl.financialDebts?.length || 0;
                      const hasSpace = activeLoansCount < 3;
                      const canTake = isUnlocked && hasSpace;

                      return (
                        <div key={prod.type} className={`p-4 bg-slate-950 border rounded-2xl flex items-center justify-between transition-all ${
                          isUnlocked ? 'border-slate-800/60 hover:border-emerald-500/20' : 'border-slate-900/50 opacity-40'
                        }`}>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black text-white uppercase tracking-tight">{prod.name}</span>
                              {!isUnlocked && (
                                <span className="text-[7px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">
                                  Locks at {prod.minTier}
                                </span>
                              )}
                            </div>
                            <div className="text-[8px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">{prod.desc}</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                              {Math.round(prod.rate * 100)}% Interest • {prod.term} Months Term
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Available</div>
                              <div className="text-xs font-mono font-black text-emerald-400">
                                ${prod.principal.toLocaleString()}
                              </div>
                            </div>
                            <button
                              disabled={!canTake}
                              onClick={() => takeLoan(prod.type)}
                              className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg border transition-all ${
                                canTake
                                  ? 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-400 hover:text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              Take Loan
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex flex-col gap-2">
          <BaseButton variant="secondary" onClick={onClose} className="w-full">Close</BaseButton>

          {!confirmingEnd ? (
            <button
              onClick={() => setConfirmingEnd(true)}
              className="w-full py-3 border border-red-900/40 text-red-800 text-xs font-black uppercase tracking-widest rounded-xl mt-8 hover:border-red-700 hover:text-red-500 transition-all"
            >
              End Run
            </button>
          ) : (
            <div className="mt-8 p-4 border border-red-500/30 rounded-xl bg-red-950/20 space-y-3">
              <div className="text-xs text-red-400 font-black uppercase tracking-widest text-center">
                Are you sure you want to retire?
              </div>
              <div className="text-[10px] text-slate-300 text-center uppercase tracking-tight font-serif italic">
                "Your current lifetime accomplishments and accumulated wealth will be locked in. They will convert permanently into Legacy Points, which can be spent inside the Legacy Shop for next-lifetime permanent boosts."
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => setConfirmingEnd(false)}
                  className="py-3 border border-slate-700 text-slate-400 text-xs font-black uppercase rounded-xl"
                >
                  No, Keep Grinding
                </button>
                <button
                  onClick={() => {
                    setConfirmingEnd(false);
                    handleEndRun();
                  }}
                  className="py-3 bg-red-900/60 border border-red-700 text-red-300 text-xs font-black uppercase rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse"
                >
                  Yes, Liquidate Life
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
