import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BaseButton } from './ui/BaseButton';

// Lazy load tab components
const CareerTab = lazy(() => import('./scoreboard/CareerTab').then(m => ({ default: m.CareerTab })));
const PortfolioTab = lazy(() => import('./scoreboard/PortfolioTab').then(m => ({ default: m.PortfolioTab })));
const HistoryTab = lazy(() => import('./scoreboard/HistoryTab').then(m => ({ default: m.HistoryTab })));
const BiographyTab = lazy(() => import('./scoreboard/BiographyTab').then(m => ({ default: m.BiographyTab })));
const BadgesTab = lazy(() => import('./scoreboard/BadgesTab').then(m => ({ default: m.BadgesTab })));
const EmpireTab = lazy(() => import('./scoreboard/EmpireTab').then(m => ({ default: m.EmpireTab })));
const ReputationTab = lazy(() => import('./scoreboard/ReputationTab').then(m => ({ default: m.ReputationTab })));
const LedgerTab = lazy(() => import('./scoreboard/LedgerTab').then(m => ({ default: m.LedgerTab })));
const AchievementsTab = lazy(() => import('./scoreboard/AchievementsTab').then(m => ({ default: m.AchievementsTab })));
const EndingsTab = lazy(() => import('./scoreboard/EndingsTab').then(m => ({ default: m.EndingsTab })));
const DeathsTab = lazy(() => import('./scoreboard/DeathsTab').then(m => ({ default: m.DeathsTab })));
const FinanceTab = lazy(() => import('./scoreboard/FinanceTab').then(m => ({ default: m.FinanceTab })));
const PortraitsTab = lazy(() => import('./scoreboard/PortraitsTab').then(m => ({ default: m.PortraitsTab })));

export const Scoreboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { pl, updatePl } = useGameStore();
  const [activeTab, setActiveTab] = useState<'career' | 'portfolio' | 'badges' | 'history' | 'biography' | 'reputation' | 'ledger' | 'empire' | 'achievements' | 'endings' | 'deaths' | 'finance' | 'portraits'>('career');
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const tabContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { setPh } = useGameStore();

  const checkScroll = React.useCallback(() => {
    if (tabContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Tab progressive discovery checks
  const getTabStatus = (tabName: string) => {
    // Core tabs are always unlocked and celebrated
    if (['career', 'portfolio', 'badges', 'achievements', 'endings', 'deaths', 'finance', 'portraits'].includes(tabName)) {
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'career': return <CareerTab />;
      case 'portfolio': return <PortfolioTab />;
      case 'history': return <HistoryTab />;
      case 'biography': return <BiographyTab />;
      case 'badges': return <BadgesTab />;
      case 'empire': return <EmpireTab />;
      case 'reputation': return <ReputationTab />;
      case 'ledger': return <LedgerTab />;
      case 'achievements': return <AchievementsTab />;
      case 'endings': return <EndingsTab />;
      case 'deaths': return <DeathsTab />;
      case 'finance': return <FinanceTab />;
      case 'portraits': return <PortraitsTab />;
      default: return <CareerTab />;
    }
  };

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl lg:max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh] max-h-[920px]"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">The Scoreboard</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="relative mx-4 my-3 group/tabnav">
          {/* Left scroll button & gradient mask */}
          {canScrollLeft && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10 rounded-l-xl" />
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs shadow-md backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                aria-label="Scroll tabs left"
              >
                ‹
              </button>
            </>
          )}

          {/* Right scroll button & gradient mask */}
          {canScrollRight && (
            <>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent z-10 rounded-r-xl flex items-center justify-end pr-1">
                <span className="text-[8px] font-mono font-bold text-emerald-400/80 animate-pulse tracking-tighter uppercase mr-1 hidden sm:inline">
                  MORE →
                </span>
              </div>
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 hover:text-white flex items-center justify-center text-xs shadow-lg shadow-emerald-500/10 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 animate-pulse"
                aria-label="Scroll tabs right"
              >
                ›
              </button>
            </>
          )}

          <div
            ref={tabContainerRef}
            onScroll={checkScroll}
            className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto scroll-smooth gap-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            {['career', 'portfolio', 'badges', 'history', 'biography', 'reputation', 'ledger', 'empire', 'achievements', 'endings', 'deaths', 'finance', 'portraits'].map((tab) => {
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
              <Suspense fallback={
                <div className="p-12 text-center text-xs text-zinc-500 font-mono flex flex-col items-center justify-center">
                  <div className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin mb-3" />
                  LOADING DATABASE METRICS...
                </div>
              }>
                {renderActiveTab()}
              </Suspense>
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
