import { useEffect, useState, useReducer, useCallback, useMemo } from 'react';
import { useGameStore } from './store/gameStore';
import { useSafariCompatible } from './hooks/useSafariCompatible';
import { debounce } from './utils/performance';
import { NavTabs } from './components/NavTabs';
import { HustleCard } from './components/HustleCard';
import { BranchChoice } from './components/BranchChoice';
import { FlexMarket } from './components/FlexMarket';
import { NewsTicker } from './components/NewsTicker';
import { PrologueScreen } from './components/PrologueScreen';
import { DeathScreen } from './components/DeathScreen';
import { EndingModal } from './components/EndingModal';
import { TheReceipts } from './components/TheReceipts';
import { StatsPanel } from './components/StatsPanel';
import { SwipeOrder } from './components/minigames/SwipeOrder';
import { ContentCreation } from './components/minigames/ContentCreation';
import { SwipeAuthentic } from './components/minigames/SwipeAuthentic';
import { BeatSequence } from './components/minigames/BeatSequence';
import { TechRepairDrag } from './components/minigames/TechRepairDrag';
import { WordTap } from './components/minigames/WordTap';
import { PinchToInspect } from './components/minigames/PinchToInspect';
import { TapRhythm } from './components/minigames/TapRhythm';
import { DragScale } from './components/minigames/DragScale';
import { TapAssign } from './components/minigames/TapAssign';
import { HoldHype } from './components/minigames/HoldHype';
import { MagneticSweep } from './components/minigames/MagneticSweep';
import { ShakeToInfluence } from './components/minigames/ShakeToInfluence';
import { PinchToZoom } from './components/minigames/PinchToZoom';
import { RotateToScale } from './components/minigames/RotateToScale';
import { MarketPredictor } from './components/minigames/MarketPredictor';
import { BoardroomBattle } from './components/minigames/BoardroomBattle';
import { SlotMachine } from './components/minigames/SlotMachine';
import { HigherLower } from './components/minigames/HigherLower';
import { Blackjack } from './components/minigames/Blackjack';
import { Roulette } from './components/minigames/Roulette';
import { DiceCraps } from './components/minigames/DiceCraps';
import { QuickReaction } from './components/minigames/QuickReaction';
import { StruggleMash } from './components/minigames/StruggleMash';
import { LaborBuild } from './components/minigames/LaborBuild';
import { TrafficDodge } from './components/minigames/TrafficDodge';
import { PlasmaDonation } from './components/minigames/PlasmaDonation';
import { GhostMode } from './components/minigames/GhostMode';
import { StreetEats } from './components/minigames/StreetEats';
import { StreetwearMatch } from './components/minigames/StreetwearMatch';
import { HashtagTap } from './components/minigames/HashtagTap';
import { RunnerRoute } from './components/minigames/RunnerRoute';
import { MemeCoinPump } from './components/minigames/MemeCoinPump';
import { EcomCatch } from './components/minigames/EcomCatch';
import { TapApprove } from './components/minigames/TapApprove';
import { DragMerge } from './components/minigames/DragMerge';
import { PatternMemory } from './components/minigames/PatternMemory';
import { BalanceScale } from './components/minigames/BalanceScale';
import { ReactionGrid } from './components/minigames/ReactionGrid';
import { RiskMeter } from './components/minigames/RiskMeter';
import { SequenceRecall } from './components/minigames/SequenceRecall';
import { RivalLeaderboard } from './components/RivalLeaderboard';
import { Scoreboard } from './components/Scoreboard';
import { EndgameSummary } from './components/EndgameSummary';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DailyChallenges } from './components/DailyChallenges';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { SimpleFallback } from './components/minigames/SimpleFallback';
import { BigWinCelebration } from './components/effects/BigWinCelebration';
import { RewardCard } from './components/effects/RewardCard';
import { TierBadgeCelebration } from './components/effects/TierBadgeCelebration';
import { MusicProductionPanel } from './components/panels/MusicProductionPanel';
import { StreetwearPanel } from './components/hustles/panels/StreetwearPanel';
import { FestivalPanel } from './components/hustles/panels/FestivalPanel';
import { DataAnalyticsPanel } from './components/hustles/panels/DataAnalyticsPanel';
import { CryptoMiningPanel } from './components/hustles/panels/CryptoMiningPanel';
import { VAAgencyPanel } from './components/hustles/panels/VAAgencyPanel';
import { RealEstatePanel } from './components/hustles/panels/RealEstatePanel';
import { VCPanel } from './components/hustles/panels/VCPanel';
import { FilmStudioPanel } from './components/panels/FilmStudioPanel';
import { SpaceInvestmentPanel } from './components/panels/SpaceInvestmentPanel';
import { PhilanthropyPanel } from './components/panels/PhilanthropyPanel';
import { PresidentCampaignPanel } from './components/panels/PresidentCampaignPanel';
import { PresidentDashboard } from './components/PresidentDashboard';
import { PresidentialCampaign } from './components/minigames/PresidentialCampaign';
import { HUSTLES } from './config/hustles/base';
import { LEVEL_MULTIPLIERS } from './engine/mathEngine';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from './config/tiers';
import { MARKET_CONFIGS } from './config/marketConfig';
import type { Tier } from './types/game';

function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const forceUpdate = useReducer(() => ({}), {})[1];

  useEffect(() => {
    // Check if the store has hydrated
    const checkHydration = () => {
      const state = useGameStore.getState();
      // If we have player name or some initial state, we consider it hydrated
      // Or we can just wait a small bit for the persist middleware
      if (state.pl) {
        setIsHydrated(true);
      }
    };

    // Tiny delay to ensure persist middleware has finished
    const timer = setTimeout(checkHydration, 100);
    return () => clearTimeout(timer);
  }, []);

  // Wrap critical handlers with Safari compatibility and ensure stability
  const debouncedResize = useMemo(() => debounce(() => {
    // Force re-render on resize for mobile
    forceUpdate();
  }, 250), []);

  const handleResize = useSafariCompatible(debouncedResize);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const [showMinigame, setShowMinigame] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showEnding, setShowEnding] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return !localStorage.getItem('bag-chaser-tutorial-complete');
  });
  const [showChallenges, setShowChallenges] = useState(false);

  const handleTutorialComplete = useCallback(() => {
    setShowTutorial(false);
  }, []);

  const {
    pl,
    ph,
    currentMarket,
    news,
    activeTab,
    activeHustleView,
    activeTierBadge,
    deathBadge,
    fatalCause,
    tutorialStep,
    executeHustle,
    executeBranch,
    upgradeHustle,
    advanceTier,
    setActiveTab,
    setActiveHustleView,
    setActiveTierBadge,
    setPlayerName,
    resetGame,
    addTickerMessage,
    processLogin,
    setTutorialStep,
  } = useGameStore();

  useEffect(() => {
    processLogin();
  }, [processLogin]);

  const [displayedCash, setDisplayedCash] = useState(pl?.bag || 0);
  const [cashSplash, setCashSplash] = useState<{ text: string; isWin: boolean } | null>(null);
  const [showReceipts, setShowReceipts] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number } | null>(null);

  const [activeHustleResult, setActiveHustleResult] = useState<{
    hustleId: string;
    success: boolean;
    netChange: number;
    cost: number;
    yieldCash: number;
    yieldClout: number;
    yieldAura: number;
    mentalHit: number;
    heatHit: number;
  } | null>(null);

  useEffect(() => {
    if (pl?.currentTier) {
      document.body.className = pl.currentTier.toLowerCase();
    }
  }, [pl?.currentTier]);

  // Animate cash changes
  useEffect(() => {
    if (pl?.bag !== undefined && pl.bag !== displayedCash) {
      const netChange = pl.bag - displayedCash;
      setDisplayedCash(pl.bag);
      if (netChange !== 0) {
        setCashSplash({
          text: `${netChange > 0 ? '+' : ''}$${Math.abs(netChange).toLocaleString()}`,
          isWin: netChange > 0
        });
        setTimeout(() => setCashSplash(null), 800);
      }
    }
  }, [pl?.bag, displayedCash]);

  const currentTierIndex = useMemo(() => pl ? PROGRESSION_ORDER.indexOf(pl.currentTier) : -1, [pl]);

  const canAdvance = useMemo(() => {
    if (!pl) return false;
    const nextTier = PROGRESSION_ORDER[currentTierIndex + 1];
    if (!nextTier) return false;
    if (showTutorial && tutorialStep === 12) return true;
    const req = TIER_REQUIREMENTS[nextTier];
    return pl.bag >= req.cash && pl.clout >= req.clout && pl.aura >= req.aura;
  }, [pl, currentTierIndex, showTutorial, tutorialStep]);

  useEffect(() => {
    if (showTutorial && tutorialStep < 12 && activeTab !== 'MUD') {
      const timer = setTimeout(() => setActiveTab('MUD'), 10);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, tutorialStep, activeTab, setActiveTab]);

  if (!isHydrated) {
    return <LoadingSkeleton />;
  }

  // Prologue screen
  if (ph === 'PROLOGUE') {
    return (
      <PrologueScreen
        onStart={(name, backgroundId, categoryId, variationId) => {
          resetGame(backgroundId, 3, categoryId, variationId);
          setPlayerName(name);
        }}
      />
    );
  }

  // Death screen
  if (ph === 'POST_MORTEM') {
    return (
      <>
        {showSummary ? (
          <EndgameSummary
            onRestart={() => {
              resetGame();
              window.location.reload();
            }}
          />
        ) : showEnding ? (
          <EndingModal
            onClose={() => setShowEnding(false)}
            onNewGamePlus={() => {
              setShowEnding(false);
              setShowSummary(true);
            }}
          />
        ) : (
          <DeathScreen
            deathBadge={deathBadge}
            fatalCause={fatalCause}
            lastHustleId={pl?.lastExecutedHustleId}
            onReset={() => setShowSummary(true)}
          />
        )}
      </>
    );
  }


  // Get hustles for current tab
  const getHustlesForTab = () => {
    if (activeTab === 'FLEX') return [];

    // Show hustles whose tier matches the active tab
    // AND whose tier is <= current player tier
    let filtered = Object.values(HUSTLES).filter(h => {
      const hustleTierIndex = PROGRESSION_ORDER.indexOf(h.tier as Tier);
      const currentTierIndex = PROGRESSION_ORDER.indexOf(pl.currentTier);
      return h.tier === activeTab && hustleTierIndex <= currentTierIndex;
    });

    if (showTutorial && activeTab === 'MUD') {
      // During tutorial, simplify the grid to ONLY the target hustle
      if (tutorialStep >= 0 && tutorialStep <= 2) {
        filtered = [HUSTLES['r_delivery']];
      } else if (tutorialStep >= 3 && tutorialStep <= 5) {
        filtered = [HUSTLES['cc']];
      } else if (tutorialStep >= 6 && tutorialStep <= 8) {
        filtered = [HUSTLES['r_ghost_mode']];
      } else if (tutorialStep >= 9 && tutorialStep <= 11) {
        filtered = [HUSTLES['r_sleep']];
      } else if (tutorialStep === 12) {
        filtered = []; // Grid empty to highlight ADVANCE button
      }
    }

    return filtered;
  };

  const hustles = getHustlesForTab();
  const showFlexMarket = activeTab === 'FLEX';

  const ageYears = 18 + Math.floor(pl.month / 12);
  const ageMonths = pl.month % 12;

  const tierClass = `${pl.currentTier.toLowerCase()}-tier`;

  const TierDecoration = () => {
    switch (pl.currentTier) {
      case 'MUD':
        return (
          <>
            <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
          </>
        );
      case 'STREET':
        return (
          <>
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.3),transparent_70%)]" />
            <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10" />
          </>
        );
      case 'STARTUP':
        return <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-5" />;
      case 'CORPORATE':
        return (
          <>
            <div className="fixed inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fbbf24_1px,#fbbf24_2px)] bg-[size:100%_4px]" />
            <div className="fixed inset-0 pointer-events-none border-[1px] border-yellow-500/10" />
          </>
        );
      case 'ELITE':
        return <div className="fixed inset-0 pointer-events-none border-[30px] border-purple-950/30" />;
      case 'MOGUL':
        return (
          <>
            <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-10" />
            <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
          </>
        );
      case 'PRESIDENT':
        return (
          <>
             <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/padded.png')]" />
             <div className="fixed inset-0 pointer-events-none border-x-[50px] border-blue-900/10" />
          </>
        );
      case 'OPEN':
        return (
          <>
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.4),transparent)]" />
            <div className="fixed inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/beach-dust.png')]" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${tierClass} text-white pb-16 transition-colors duration-1000 relative overflow-x-hidden`}>
      <TierDecoration />
      {/* Hidden StatsPanel to run its side effects (warning system) */}
      <div className="hidden">
        <StatsPanel stats={pl} market={currentMarket} />
      </div>

      {/* Big Win Celebration */}
      {bigWin && (
        <BigWinCelebration
          amount={bigWin.amount}
          onComplete={() => setBigWin(null)}
        />
      )}

      {/* Cash Splash Animation */}
      {cashSplash && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <span className={`text-4xl font-black font-mono drop-shadow-lg transition-all duration-700 ${
            cashSplash.isWin ? 'text-emerald-400 scale-110' : 'text-red-500 scale-100'
          }`}>
            {cashSplash.text}
          </span>
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-4 py-2">
        <div className="max-w-md mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div>RANK: <span className="text-white">{pl.currentTier}</span></div>
          {pl.activeSentiment ? (
            <div className={`animate-pulse ${pl.activeSentiment.multiplier > 1 ? 'text-emerald-400' : 'text-red-400'}`}>
              📰 {pl.activeSentiment.label} ({pl.activeSentiment.monthsRemaining}m)
            </div>
          ) : (
            <div>OP: <span className="text-white">{pl.name}</span></div>
          )}
          <div className="flex items-center gap-1">
            {MARKET_CONFIGS[currentMarket].icon} <span className="text-white">{MARKET_CONFIGS[currentMarket].name}</span>
          </div>
          <div>AGE: <span className="text-white">{ageYears}y {ageMonths}m</span></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="sticky top-[33px] z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800/50 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-end mb-1">
            <div id="bag-amount" className="text-2xl font-black text-emerald-400 font-mono leading-none">
              ${pl.bag.toLocaleString()}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowScoreboard(true)}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded font-bold transition-colors uppercase tracking-tighter"
              >
                📊 Stats
              </button>
              <button
                onClick={() => setShowChallenges(true)}
                className="text-[9px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded font-bold transition-colors uppercase tracking-tighter border border-blue-500/20"
              >
                🔥 Goals
              </button>
              <button
                onClick={() => setShowReceipts(true)}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded font-bold transition-colors uppercase tracking-tighter"
              >
                Receipts
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Clout</span>
              <span id="clout-stat" className={`text-xs font-bold ${pl.clout < 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {Math.floor(pl.clout)}{pl.clout < 5 && '!'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Mental</span>
              <span id="mental-stat" className={`text-xs font-bold ${pl.mentalHealth < 30 ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(pl.mentalHealth)}%
                {pl.mentalShieldTurns > 0 && (
                  <span className="text-blue-400 ml-0.5 text-[10px]">🛡️{pl.mentalShieldTurns}</span>
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Aura</span>
              <span id="aura-stat" className={`text-xs font-bold ${pl.aura < 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                {Math.floor(pl.aura)}{pl.aura < 5 && '!'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Heat</span>
              <span id="heat-stat" className={`text-xs font-bold ${pl.heat > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                {Math.floor(pl.heat)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NavTabs
        activeTab={activeTab}
        currentTier={pl.currentTier}
        isTutorialActive={showTutorial && tutorialStep < 13}
        onTabChange={(tab) => {
          setActiveTab(tab as any);
          setShowMinigame(false);
        }}
      />

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-4 pb-24">
        {activeTab === 'PRESIDENCY' ? (
          <PresidentDashboard />
        ) : !activeHustleView ? (
          <>
            {/* Advance Tier Button */}
            {canAdvance && activeTab !== 'FLEX' && (
              <button
                id="advance-tier-button"
                onClick={() => advanceTier()}
                className="w-full mb-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                ⚡ ADVANCE TO NEXT TIER ⚡
              </button>
            )}

            {/* Flex Market */}
            {showFlexMarket && <FlexMarket />}

            {/* Rival Leaderboard */}
            {!showFlexMarket && activeTab !== ('PRESIDENCY' as any) && (
              <RivalLeaderboard
                playerBag={pl.bag}
                playerName={pl.name || 'You'}
                rivals={pl.rivals.filter(r => r.tier === activeTab || r.tier === pl.currentTier)}
              />
            )}

            {/* Hustle Grid */}
            {!showFlexMarket && (
              <div className="grid grid-cols-2 gap-3">
                {hustles.map((hustle) => {
                  const isMastered = pl.masteredHustles?.includes(hustle.id);
                  const tierCardClass = `hustle-card-${hustle.tier.toLowerCase()}`;

                  return (
                    <button
                      key={hustle.id}
                      id={`hustle-card-${hustle.id}`}
                      onClick={() => {
                        setActiveHustleView(hustle.id);
                        setShowMinigame(false);
                      }}
                      className={`${tierCardClass} rounded-xl p-4 text-center border transition-all active:scale-95 relative overflow-hidden`}
                    >
                      {isMastered && (
                        <div className="absolute top-1 right-1 text-xs">👑</div>
                      )}
                      <div className="text-4xl mb-2">{hustle.icon}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">
                        {hustle.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No hustles message */}
            {!showFlexMarket && hustles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-600 text-sm">No hustles available in {activeTab} tier yet.</div>
                <div className="text-slate-700 text-xs mt-2">Advance from lower tiers to unlock more.</div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setActiveHustleView(null);
                setShowMinigame(false);
              }}
              className="mb-3 text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Back to {activeTab} hustles
            </button>
            {(() => {
              const hustle = HUSTLES[activeHustleView];
              if (!hustle) return null;
              const currentBranchId = pl.hustleBranchIds[hustle.id] || hustle.startBranchId;
              const hasBranches = !!hustle.branches && !!currentBranchId;
              const currentBranch = hasBranches ? hustle.branches![currentBranchId] : null;
              const hasNextBranches = currentBranch?.nextBranches && currentBranch.nextBranches.length > 0;
              const activeMiniGame = currentBranch?.miniGame || hustle.miniGame;

              if (showMinigame && activeMiniGame) {
                const onComplete = (multiplier: number) => {
                  console.log('🔧 Minigame completed, multiplier:', multiplier);

                  requestAnimationFrame(() => {
                    const result = executeHustle(hustle.id, multiplier);
                    console.log('🔧 executeHustle result:', result);

                    if (result.success) {
                      setActiveHustleResult({
                        hustleId: hustle.id,
                        success: result.success,
                        netChange: result.netChange,
                        cost: result.cost,
                        yieldCash: result.yieldCash,
                        yieldClout: result.yieldClout,
                        yieldAura: result.yieldAura,
                        mentalHit: result.mentalHit,
                        heatHit: result.heatHit,
                      });
                      forceUpdate();
                    }
                    setShowMinigame(false);
                  });
                };

                const hustleLevel = pl.hustleLevels[hustle.id] || 1;
                if (activeMiniGame === 'SwipeOrder') return <SwipeOrder onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'SwipeUpViral' || activeMiniGame === 'ContentCreation') return <ContentCreation onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'SwipeAuthentic') return <SwipeAuthentic onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'BeatSequence') return <BeatSequence onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'TechRepairDrag') return <TechRepairDrag onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'WordTap') return <WordTap onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'PinchToInspect') return <PinchToInspect onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'TapRhythm') return <TapRhythm onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'DragScale') return <DragScale onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'TapAssign') return <TapAssign onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'HoldHype') return <HoldHype onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'ShakeToInfluence') return <ShakeToInfluence onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'PinchToZoom') return <PinchToZoom onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'SlotMachine') return <SlotMachine onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'HigherLower') return <HigherLower onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'Blackjack') return <Blackjack onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'Roulette') return <Roulette onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'DiceCraps') return <DiceCraps onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'QuickReaction') return <QuickReaction onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'StruggleMash') return <StruggleMash onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'LaborBuild') return <LaborBuild onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'TrafficDodge') return <TrafficDodge onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'PlasmaDonation') return <PlasmaDonation onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'GhostTap' || activeMiniGame === 'GhostMode') return (
                  <GhostMode
                    key={hustleLevel}
                    level={hustleLevel}
                    onComplete={onComplete}
                  />
                );
                if (activeMiniGame === 'StreetEats') return <StreetEats onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'PatternMemory') return <PatternMemory onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'SequenceRecall') return <SequenceRecall onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'StreetwearDesign' || activeMiniGame === 'StreetwearMatch') return (
                  <StreetwearMatch
                    key={hustleLevel}
                    level={hustleLevel}
                    onComplete={onComplete}
                  />
                );
                if (activeMiniGame === 'HashtagTap') return <HashtagTap onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'RunnerRoute') return <RunnerRoute onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'MemeCoinPump') return <MemeCoinPump onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'EcomCatch') return <EcomCatch onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'TapApprove') return <TapApprove onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'DragMerge') return <DragMerge onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'BalanceScale') return <BalanceScale onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'ReactionGrid') return <ReactionGrid onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'RiskMeter') return <RiskMeter onComplete={onComplete} level={hustleLevel} />;
                if (activeMiniGame === 'RotateToScale') return (
                  <RotateToScale
                    level={hustleLevel}
                    onComplete={onComplete}
                  />
                );

                if (activeMiniGame === 'MarketPredictor') {
                  const rival = pl.rivals?.find(r => r.currentBid > 0);
                  const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                  return (
                    <MarketPredictor
                      onComplete={onComplete}
                      playerBid={levelData?.cost || 10000000}
                      rivalBid={rival?.currentBid || 0}
                      onOutbid={(amount) => {
                        addTickerMessage(`Outbid by rival! They offered $${amount.toLocaleString()}`, 'text-red-400');
                      }}
                    />
                  );
                }

                if (activeMiniGame === 'ShakeForHype' || activeMiniGame === 'PresidentialCampaign') {
                  return <PresidentialCampaign onComplete={onComplete} />;
                }

                if (activeMiniGame === 'BoardroomBattle') {
                  const rival = pl.rivals?.find(r => r.currentBid > 0);
                  const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                  return (
                    <BoardroomBattle
                      onComplete={onComplete}
                      playerBid={levelData?.cost || 20000000}
                      rivalBid={rival?.currentBid || 0}
                      onOutbid={(amount) => {
                        addTickerMessage(`Outbid by rival! They offered $${amount.toLocaleString()}`, 'text-red-400');
                      }}
                    />
                  );
                }
                if (activeMiniGame === 'MagneticSweep') {
                  return (
                    <MagneticSweep
                      onComplete={(sweepRes) => {
                        requestAnimationFrame(() => {
                          const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                          const levelMult = LEVEL_MULTIPLIERS[levelData?.level || 1] || 1;
                          const market = MARKET_CONFIGS[currentMarket];

                          // Trigger the hustle execution
                          // We use forceSuccess: true because the minigame outcome logic (win/loss/rare)
                          // is already handled within MagneticSweep and passed via sweepRes.multiplier
                          const result = executeHustle(hustle.id, sweepRes.multiplier, true);

                          if (sweepRes.isRare) {
                            setBigWin({ amount: result.netChange + (levelData?.cost || 0) * levelMult * market.expenseMultiplier });
                          }

                          if (result.success) {
                            setActiveHustleResult({
                              hustleId: hustle.id,
                              success: result.success,
                              netChange: result.netChange,
                              cost: result.cost,
                              yieldCash: result.yieldCash,
                              yieldClout: result.yieldClout,
                              yieldAura: result.yieldAura,
                              mentalHit: result.mentalHit,
                              heatHit: result.heatHit,
                            });
                            forceUpdate();
                          }
                          setShowMinigame(false);
                        });
                      }}
                    />
                  );
                }

                // Fallback for unknown minigames
                return <SimpleFallback name={activeMiniGame} onComplete={onComplete} />;
              }

              if (hustle.hasPanel) {
                if (hustle.panelType === 'MUSIC_PRODUCTION') {
                  return (
                    <MusicProductionPanel
                      hustle={hustle}
                      onExecute={() => {
                        setShowMinigame(true);
                      }}
                    />
                  );
                }
                if (hustle.panelType === 'STREETWEAR') {
                  return (
                    <StreetwearPanel
                      hustle={hustle}
                      onComplete={() => {
                        setActiveHustleView(null);
                      }}
                    />
                  );
                }
                if (hustle.panelType === 'FESTIVAL') {
                  return <FestivalPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'DATA_ANALYTICS') {
                  return <DataAnalyticsPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'CRYPTO_MINING') {
                  return <CryptoMiningPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'VA_AGENCY') {
                  return <VAAgencyPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'REAL_ESTATE') {
                  return <RealEstatePanel hustle={hustle} />;
                }
                if (hustle.panelType === 'VENTURE_CAPITAL') {
                  return <VCPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'FILM_STUDIO') {
                  return <FilmStudioPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'SPACE_INVESTMENT') {
                  return <SpaceInvestmentPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'PHILANTHROPY') {
                  return <PhilanthropyPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'PRESIDENT_CAMPAIGN') {
                  return <PresidentCampaignPanel hustle={hustle} />;
                }
              }

              if (hasNextBranches) {
                return (
                  <BranchChoice
                    hustle={hustle}
                    currentBranchId={currentBranchId!}
                    onSelectBranch={(branchId) => executeBranch(hustle.id, branchId)}
                    onExecute={() => {
                      if (currentBranch?.miniGame || hustle.miniGame) {
                        setShowMinigame(true);
                      } else {
                        const result = executeHustle(hustle.id);
                        if (showTutorial && result.success) {
                          setActiveHustleResult({
                            hustleId: hustle.id,
                            success: result.success,
                            netChange: result.netChange,
                            cost: result.cost,
                            yieldCash: result.yieldCash,
                            yieldClout: result.yieldClout,
                            yieldAura: result.yieldAura,
                            mentalHit: result.mentalHit,
                            heatHit: result.heatHit,
                          });
                        } else {
                          setActiveHustleView(null);
                        }
                      }
                    }}
                  />
                );
              }


              return (
                <HustleCard
                  hustle={hustle}
                  player={pl}
                  currentBranchId={currentBranchId}
                  onExecute={() => {
                    const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                    if (levelData?.miniGame || hustle.miniGame) {
                      setShowMinigame(true);
                    } else {
                      const result = executeHustle(hustle.id);
                      if (showTutorial && result.success) {
                        setActiveHustleResult({
                          hustleId: hustle.id,
                          success: result.success,
                          netChange: result.netChange,
                          cost: result.cost,
                          yieldCash: result.yieldCash,
                          yieldClout: result.yieldClout,
                          yieldAura: result.yieldAura,
                          mentalHit: result.mentalHit,
                          heatHit: result.heatHit,
                        });
                      } else {
                        setActiveHustleView(null);
                      }
                    }
                  }}
                  onUpgrade={(branchId) => {
                    if (hustle.branches && branchId) {
                      executeBranch(hustle.id, branchId);
                    } else {
                      upgradeHustle(hustle.id, branchId);
                    }
                  }}
                />
              );
            })()}
          </div>
        )}
      </div>

      {/* Receipts Modal */}
      {showReceipts && (
        <TheReceipts onClose={() => setShowReceipts(false)} />
      )}


      {/* Generic Hustle Reward Card */}
      {activeHustleResult && !showTutorial && (
        <RewardCard
          title={activeHustleResult.success ? "HUSTLE SUCCESS" : "HUSTLE FAILURE"}
          subtitle={HUSTLES[activeHustleResult.hustleId]?.name || "Hustle Results"}
          isRare={activeHustleResult.yieldCash > (HUSTLES[activeHustleResult.hustleId]?.levels?.[0]?.yieldCash || 0) * 5}
          stats={[
            {
              label: 'Cash Flow',
              value: activeHustleResult.yieldCash - activeHustleResult.cost,
              colorClass: (activeHustleResult.yieldCash - activeHustleResult.cost) >= 0 ? 'text-emerald-400' : 'text-red-400'
            },
            { label: 'Clout', value: activeHustleResult.yieldClout, colorClass: 'text-blue-400' },
            { label: 'Aura', value: activeHustleResult.yieldAura, colorClass: 'text-purple-400' },
            {
              label: 'Mental Health',
              value: activeHustleResult.mentalHit,
              colorClass: activeHustleResult.mentalHit >= 0 ? 'text-emerald-400' : 'text-red-400'
            },
          ].filter(s => s.value !== 0)}
          onDismiss={() => {
            setActiveHustleResult(null);
            setActiveHustleView(null);
          }}
        />
      )}

      {showScoreboard && <Scoreboard onClose={() => setShowScoreboard(false)} />}
      {showTutorial && (
        <TutorialOverlay
          tutorialStep={tutorialStep}
          setTutorialStep={setTutorialStep}
          setActiveHustleView={setActiveHustleView}
          setActiveHustleResult={setActiveHustleResult}
          activeHustleView={activeHustleView}
          activeHustleResult={activeHustleResult}
          currentTier={pl.currentTier}
          onComplete={handleTutorialComplete}
        />
      )}
      {activeTierBadge && (
        <TierBadgeCelebration
          tier={activeTierBadge}
          onClose={() => setActiveTierBadge(null)}
        />
      )}
      <DailyChallenges isOpen={showChallenges} onClose={() => setShowChallenges(false)} />

      {/* News Ticker */}
      <NewsTicker news={news} />
    </div>
  );
}

export default App;
