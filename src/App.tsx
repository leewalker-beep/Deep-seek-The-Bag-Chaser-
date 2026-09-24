import { useEffect, useState, useReducer, useMemo, useRef, lazy, Suspense } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store/gameStore';
import { completeConcertPerformanceWithLineup } from './store/slices/hustleSlice';
import * as Bio from './engine/biographyEngine';
import { useSafariCompatible } from './hooks/useSafariCompatible';
import { debounce } from './utils/performance';
import { analyzeBehavior } from './utils/personalityAnalyzer';
import { evaluateIdentityDimensions } from './utils/identitySystem';
import { calculateNetWorth } from './utils/annualReviewCompiler';
import { NavTabs } from './components/NavTabs';
import { HustleCard } from './components/HustleCard';
import { GameViewport } from './components/ui/GameViewport';
import { BranchChoice } from './components/BranchChoice';
import { FlexMarket } from './components/FlexMarket';
import { NewsTicker } from './components/NewsTicker';
import { PrologueScreen } from './components/PrologueScreen';
import { DeathScreen } from './components/DeathScreen';
import { AnimatePresence, motion } from 'framer-motion';
import { CinematicTransition } from './components/effects/CinematicTransition';
import { MarketShiftOverlay } from './components/effects/MarketShiftOverlay';
import { HERO_ARTWORK } from './config/heroArtwork';
import TierBackground from './components/TierBackground';
import { TheReceipts } from './components/TheReceipts';
import Avatar from './components/Avatar';
import { WorldReactionFeed } from './components/WorldReactionFeed';

// Lazy Loaded Minigames
const SwipeOrder = lazy(() => import('./components/minigames/SwipeOrder').then(m => ({ default: m.SwipeOrder })));
const ContentCreation = lazy(() => import('./components/minigames/ContentCreation').then(m => ({ default: m.ContentCreation })));
const SwipeAuthentic = lazy(() => import('./components/minigames/SwipeAuthentic').then(m => ({ default: m.SwipeAuthentic })));
const BeatSequence = lazy(() => import('./components/minigames/BeatSequence').then(m => ({ default: m.BeatSequence })));
const TechRepairDrag = lazy(() => import('./components/minigames/TechRepairDrag').then(m => ({ default: m.TechRepairDrag })));
const WordTap = lazy(() => import('./components/minigames/WordTap').then(m => ({ default: m.WordTap })));
const PinchToInspect = lazy(() => import('./components/minigames/PinchToInspect').then(m => ({ default: m.PinchToInspect })));
const TapRhythm = lazy(() => import('./components/minigames/TapRhythm').then(m => ({ default: m.TapRhythm })));
const DragScale = lazy(() => import('./components/minigames/DragScale').then(m => ({ default: m.DragScale })));
const TapAssign = lazy(() => import('./components/minigames/TapAssign').then(m => ({ default: m.TapAssign })));
const HoldHype = lazy(() => import('./components/minigames/HoldHype').then(m => ({ default: m.HoldHype })));
const MagneticSweep = lazy(() => import('./components/minigames/MagneticSweep').then(m => ({ default: m.MagneticSweep })));
const ShakeToInfluence = lazy(() => import('./components/minigames/ShakeToInfluence').then(m => ({ default: m.ShakeToInfluence })));
const PinchToZoom = lazy(() => import('./components/minigames/PinchToZoom').then(m => ({ default: m.PinchToZoom })));
const RotateToScale = lazy(() => import('./components/minigames/RotateToScale').then(m => ({ default: m.RotateToScale })));
const MarketPredictor = lazy(() => import('./components/minigames/MarketPredictor').then(m => ({ default: m.MarketPredictor })));
const BoardroomBattle = lazy(() => import('./components/minigames/BoardroomBattle').then(m => ({ default: m.BoardroomBattle })));
const CryptoLeverage = lazy(() => import('./components/minigames/CryptoLeverage').then(m => ({ default: m.CryptoLeverage })));
const BioFeedbackRetreat = lazy(() => import('./components/minigames/BioFeedbackRetreat').then(m => ({ default: m.BioFeedbackRetreat })));
const HigherLower = lazy(() => import('./components/minigames/HigherLower').then(m => ({ default: m.HigherLower })));
const Blackjack = lazy(() => import('./components/minigames/Blackjack').then(m => ({ default: m.Blackjack })));
const Roulette = lazy(() => import('./components/minigames/Roulette').then(m => ({ default: m.Roulette })));
const DiceCraps = lazy(() => import('./components/minigames/DiceCraps').then(m => ({ default: m.DiceCraps })));
const QuickReaction = lazy(() => import('./components/minigames/QuickReaction').then(m => ({ default: m.QuickReaction })));
const StruggleMash = lazy(() => import('./components/minigames/StruggleMash').then(m => ({ default: m.StruggleMash })));
const LaborBuild = lazy(() => import('./components/minigames/LaborBuild').then(m => ({ default: m.LaborBuild })));
const TrafficDodge = lazy(() => import('./components/minigames/TrafficDodge').then(m => ({ default: m.TrafficDodge })));
const PlasmaDonation = lazy(() => import('./components/minigames/PlasmaDonation').then(m => ({ default: m.PlasmaDonation })));
const GhostMode = lazy(() => import('./components/minigames/GhostMode').then(m => ({ default: m.GhostMode })));
const StreetEats = lazy(() => import('./components/minigames/StreetEats').then(m => ({ default: m.StreetEats })));
const FamilyDeli = lazy(() => import('./components/minigames/FamilyDeli').then(m => ({ default: m.FamilyDeli })));
const ScoopThePoop = lazy(() => import('./components/minigames/ScoopThePoop').then(m => ({ default: m.ScoopThePoop })));
const StreetwearMatch = lazy(() => import('./components/minigames/StreetwearMatch').then(m => ({ default: m.StreetwearMatch })));
const HashtagTap = lazy(() => import('./components/minigames/HashtagTap').then(m => ({ default: m.HashtagTap })));
const RunnerRoute = lazy(() => import('./components/minigames/RunnerRoute').then(m => ({ default: m.RunnerRoute })));
const MemeCoinPump = lazy(() => import('./components/minigames/MemeCoinPump').then(m => ({ default: m.MemeCoinPump })));
const EcomCatch = lazy(() => import('./components/minigames/EcomCatch').then(m => ({ default: m.EcomCatch })));
const TapApprove = lazy(() => import('./components/minigames/TapApprove').then(m => ({ default: m.TapApprove })));
const ReadTheRoom = lazy(() => import('./components/minigames/ReadTheRoom').then(m => ({ default: m.ReadTheRoom })));
const CodeBreaker = lazy(() => import('./components/minigames/CodeBreaker').then(m => ({ default: m.CodeBreaker })));
const DragMerge = lazy(() => import('./components/minigames/DragMerge').then(m => ({ default: m.DragMerge })));
const PatternMemory = lazy(() => import('./components/minigames/PatternMemory').then(m => ({ default: m.PatternMemory })));
const BalanceScale = lazy(() => import('./components/minigames/BalanceScale').then(m => ({ default: m.BalanceScale })));
const ReactionGrid = lazy(() => import('./components/minigames/ReactionGrid').then(m => ({ default: m.ReactionGrid })));
const RiskMeter = lazy(() => import('./components/minigames/RiskMeter').then(m => ({ default: m.RiskMeter })));
const SequenceRecall = lazy(() => import('./components/minigames/SequenceRecall').then(m => ({ default: m.SequenceRecall })));
const PresidentialCampaign = lazy(() => import('./components/minigames/PresidentialCampaign').then(m => ({ default: m.PresidentialCampaign })));
const SimpleFallback = lazy(() => import('./components/minigames/SimpleFallback').then(m => ({ default: m.SimpleFallback })));

const CaptchaDrone = lazy(() => import('./components/minigames/CaptchaDrone').then(m => ({ default: m.CaptchaDrone })));
const ClickbaitGame = lazy(() => import('./components/minigames/ClickbaitGame').then(m => ({ default: m.ClickbaitGame })));
const TalentAgencyGame = lazy(() => import('./components/minigames/TalentAgencyGame').then(m => ({ default: m.TalentAgencyGame })));
const SignSpinner = lazy(() => import('./components/minigames/SignSpinner').then(m => ({ default: m.SignSpinner })));
const ReviewFarm = lazy(() => import('./components/minigames/ReviewFarm').then(m => ({ default: m.ReviewFarm })));
const ConcertJam = lazy(() => import('./components/minigames/ConcertJam').then(m => ({ default: m.ConcertJam })));

// Thematic Wrappers
const FestivalCrowdSurge = lazy(() => import('./components/hustles/panels/FestivalCrowdSurge').then(m => ({ default: m.FestivalCrowdSurge })));
const CryptoMineRush = lazy(() => import('./components/hustles/panels/CryptoMineRush').then(m => ({ default: m.CryptoMineRush })));
const PodcastFlowState = lazy(() => import('./components/hustles/panels/PodcastFlowState').then(m => ({ default: m.PodcastFlowState })));
const VCPitchRoom = lazy(() => import('./components/hustles/panels/VCPitchRoom').then(m => ({ default: m.VCPitchRoom })));

import { RivalLeaderboard } from './components/RivalLeaderboard';
import { SpecializationModal } from './components/SpecializationModal';
import { FirstCrownModal } from './components/FirstCrownModal';
import { NarrativeEventModal } from './components/NarrativeEventModal';
import { LiveWorldEventModal } from './components/LiveWorldEventModal';
import { InteractiveStoryModal } from './components/InteractiveStoryModal';
import { EndgameSummary } from './components/EndgameSummary';
import { StrategicAdvisorModal } from './components/StrategicAdvisorModal';
import { AdvisorMentorModal } from './components/AdvisorMentorModal';
import { getOrAssignQuoteForPrompt } from './utils/mentorQuotes';

// Heavy Screens
const HallOfFame = lazy(() => import('./components/HallOfFame').then(m => ({ default: m.HallOfFame })));
const LegacyShop = lazy(() => import('./components/LegacyShop').then(m => ({ default: m.LegacyShop })));
const PresidentDashboard = lazy(() => import('./components/PresidentDashboard').then(m => ({ default: m.PresidentDashboard })));
const Scoreboard = lazy(() => import('./components/Scoreboard').then(m => ({ default: m.Scoreboard })));
const EntertainmentDashboard = lazy(() => import('./components/dashboard/EntertainmentDashboard').then(m => ({ default: m.EntertainmentDashboard })));
const VCPanel = lazy(() => import('./components/hustles/panels/VCPanel').then(m => ({ default: m.VCPanel })));
const FundMoviePanel = lazy(() => import('./components/panels/FundMoviePanel').then(m => ({ default: m.FundMoviePanel })));
const MarryCelebrityPanel = lazy(() => import('./components/panels/MarryCelebrityPanel').then(m => ({ default: m.MarryCelebrityPanel })));

import { DailyChallenges } from './components/DailyChallenges';
import { TutorialBox } from './components/TutorialBox';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { FlexOpportunityModal } from './components/FlexOpportunityModal';
import { AnnualStatement } from './components/AnnualStatement';
import { JailOverlay } from './components/JailOverlay';
import { BigWinCelebration } from './components/effects/BigWinCelebration';
import { RewardCard } from './components/effects/RewardCard';
import { TierBadgeCelebration } from './components/effects/TierBadgeCelebration';
import { MusicProductionPanel } from './components/panels/MusicProductionPanel';
import { StreetwearPanel } from './components/hustles/panels/StreetwearPanel';
import { DataAnalyticsPanel } from './components/hustles/panels/DataAnalyticsPanel';
import { CryptoMiningPanel } from './components/hustles/panels/CryptoMiningPanel';
import { VAAgencyPanel } from './components/hustles/panels/VAAgencyPanel';
import { RealEstatePanel } from './components/hustles/panels/RealEstatePanel';
import { GlobalConglomeratePanel } from './components/hustles/panels/GlobalConglomeratePanel';
import { FilmStudioPanel } from './components/panels/FilmStudioPanel';
import { SpaceInvestmentPanel } from './components/panels/SpaceInvestmentPanel';
import { PhilanthropyPanel } from './components/panels/PhilanthropyPanel';
import { PresidentCampaignPanel } from './components/panels/PresidentCampaignPanel';
import { RestPanel } from './components/panels/RestPanel';
import { PresidentialTermEnd } from './components/PresidentialTermEnd';
import { MinigameLoader } from './components/ui/MinigameLoader';
import { PremiumLoader } from './components/ui/PremiumLoader';
import { saveHallOfFameEntry } from './utils/hallOfFame';
import { getEnding } from './config/endings';
import { getDominantStat } from './utils/endingUtils';
import { getMasteryCount } from './utils/masteryUtils';
import { HUSTLES } from './config/hustles/base';
import { ImmediateGoalCard } from './components/ui/ImmediateGoalCard';
import { LEVEL_MULTIPLIERS } from './engine/mathEngine';
import { calculateMonthlyUpkeep, calculateMonthlyDebtService } from './utils/financialObligationsUtils';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from './config/tiers';
import { MARKET_CONFIGS } from './config/marketConfig';
import type { Tier, AppTab } from './types/game';
import { Z_INDEX } from './utils/zLayers';
import { TIER_ONBOARDING_DATA, checkAdvisorTriggers } from './utils/advisorTriggerUtils';

const renderHustlePanel = (
  panelType: string,
  currentLevel: number,
  activeMinigame: any,
  pl: any,
  handleGameFinished: (result: any) => void
) => {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-xl border border-zinc-900 font-mono text-[10px] text-zinc-500">
        <div className="w-4 h-4 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin mb-2" />
        INITIALIZING HUSTLE INTERFACE...
      </div>
    }>
      {(() => {
        switch (panelType) {
          case 'CAPTCHA_GAME':
            return <CaptchaDrone level={currentLevel} onComplete={handleGameFinished} />;

          case 'CLICKBAIT_GAME':
            return <ClickbaitGame level={currentLevel} onComplete={handleGameFinished} />;

          case 'TALENT_AGENT_GAME':
            return <TalentAgencyGame level={currentLevel} onComplete={handleGameFinished} />;

          case 'SIGN_SPINNER_GAME':
            return <SignSpinner level={currentLevel} onComplete={handleGameFinished} />;

          case 'REVIEW_FARM_GAME':
            return <ReviewFarm level={currentLevel} onComplete={handleGameFinished} />;

          case 'CONCERT_JAM_GAME': {
            const performingArtists = pl?.artists?.filter((a: any) =>
              activeMinigame?.performingArtistIds?.includes(a.id)
            ) || [];
            return (
              <ConcertJam
                level={currentLevel}
                onComplete={handleGameFinished}
                performingArtists={performingArtists}
              />
            );
          }

          default:
            return (
              <div className="p-4 text-center text-xs text-zinc-500 font-mono bg-zinc-900 rounded-lg">
                ⚠️ Interface module [ {panelType} ] is currently booting down.
              </div>
            );
        }
      })()}
    </Suspense>
  );
};

const isPassiveHustle = (hustle: any) => {
  if (hustle.isPassive) return true;
  if (hustle.levels) {
    return hustle.levels.some((l: any) => l.passiveYield !== undefined && l.passiveYield > 0);
  }
  if (hustle.branches) {
    return Object.values(hustle.branches).some((b: any) => b.passiveYield !== undefined && b.passiveYield > 0);
  }
  return false;
};

function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const forceUpdate = useReducer(() => ({}), {})[1];
  const [isLedgerPinned, setIsLedgerPinned] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<'clout' | 'mental' | 'aura' | 'heat' | null>(null);
  const [selectedCharacterForMinigame, setSelectedCharacterForMinigame] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.stat-tooltip-container')) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

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

  useEffect(() => {
    (window as any).__gameStore__ = useGameStore;
  }, []);

  const showMinigame = useGameStore(state => state.showMinigame);

  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showPhoneFeed, setShowPhoneFeed] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorTab, setAdvisorTab] = useState<'ALL' | 'CRITICAL' | 'IMPORTANT' | 'OPPORTUNITIES' | 'INFO' | 'AMBITIONS' | 'HISTORY' | 'REPUTATION'>('ALL');
  const [activeAdvisorPrompt, setActiveAdvisorPrompt] = useState<{
    id?: string;
    title: string;
    subtitle: string;
    bullets?: string[];
    ctaLabel?: string;
    quote?: { text: string; author: string } | null;
    tabToOpen?: 'ALL' | 'CRITICAL' | 'IMPORTANT' | 'OPPORTUNITIES' | 'INFO' | 'AMBITIONS' | 'HISTORY' | 'REPUTATION';
    onTakeMeThereCustom?: (store: any) => void;
    onCloseExtra?: (store: any) => void;
  } | null>(null);

  const prevTierRef = useRef<string | null>(null);
  const prevMarketRef = useRef<string | null>(null);
  const [marketShiftAlert, setMarketShiftAlert] = useState<string | null>(null);

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
    isTutorialSkipped,
    activeTransition,
  } = useGameStore(useShallow(state => ({
    pl: state.pl,
    ph: state.ph,
    currentMarket: state.currentMarket,
    news: state.news,
    activeTab: state.activeTab,
    activeHustleView: state.activeHustleView,
    activeTierBadge: state.activeTierBadge,
    deathBadge: state.deathBadge,
    fatalCause: state.fatalCause,
    isTutorialSkipped: state.isTutorialSkipped,
    activeTransition: state.activeTransition,
  })));

  const {
    executeHustle,
    executeBranch,
    upgradeHustle,
    advanceTier,
    setActiveTab,
    setActiveHustleView,
    setActiveTierBadge,
    setShowMinigame,
    setPlayerName,
    resetGame,
    addTickerMessage,
    processLogin,
    triggerTransition,
    clearTransition,
    pendingSpecialization,
    updatePl,
  } = useGameStore();

  const [isStatDrawerOpen, setIsStatDrawerOpen] = useState(false);
  const [statDrawerActiveTab, setStatDrawerActiveTab] = useState<'thisMonth' | 'modifiers'>('thisMonth');
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [lastSeenMonth, setLastSeenMonth] = useState(pl.month);

  useEffect(() => {
    if (pl.month > lastSeenMonth) {
      setShowMonthlySummary(true);
      setLastSeenMonth(pl.month);
    }
  }, [pl.month, lastSeenMonth]);

  const handleStatTap = (_stat: 'cash' | 'clout' | 'mental' | 'aura' | 'heat') => {
    setStatDrawerActiveTab('thisMonth');
    setIsStatDrawerOpen(true);
  };

  const handleModifierBadgeTap = (_badge: 'exhaustion' | 'aura_discount' | 'public_scrutiny' | 'clean_record') => {
    setStatDrawerActiveTab('modifiers');
    setIsStatDrawerOpen(true);
  };

  const navigateToHustle = (hustleId: string, tierTab: any) => {
    useGameStore.getState().setActiveTab(tierTab);
    useGameStore.getState().setActiveHustleView(hustleId);
    setIsStatDrawerOpen(false); // Close the drawer upon navigation!
  };

  const handleQuickStart = () => {
    const bgId = pl?.backgroundId;
    const catId = pl?.categoryId;
    const varId = pl?.variationId;
    const avId = pl?.avatarId;
    if (bgId && catId && varId) {
      resetGame(bgId, 3, catId, varId, avId || 'av_m1');
    } else {
      resetGame();
    }
  };

  useEffect(() => {
    processLogin();
  }, [processLogin]);

  // Detect Tier Advancement
  const lastTierRef = useRef<Tier | null>(null);
  useEffect(() => {
    if (pl?.currentTier && lastTierRef.current && lastTierRef.current !== pl.currentTier) {
      const artwork = HERO_ARTWORK[pl.currentTier];
      if (artwork) {
        triggerTransition(artwork);
      }
    }
    if (pl?.currentTier) {
      lastTierRef.current = pl.currentTier;
    }
  }, [pl?.currentTier, triggerTransition]);

  // Discoverability / Contextual Navigation Dispatcher
  useEffect(() => {
    if (!pl || !pl.narrativeFlags) return;

    let updatedFlags = null;

    if (pl.narrativeFlags.open_feed) {
      setShowPhoneFeed(true);
      updatedFlags = { ...(updatedFlags || pl.narrativeFlags), open_feed: false };
    }

    if (pl.narrativeFlags.open_advisor) {
      setShowAdvisor(true);
      updatedFlags = { ...(updatedFlags || pl.narrativeFlags), open_advisor: false };
    }

    if (pl.narrativeFlags.open_scoreboard) {
      setShowScoreboard(true);
      const targetTab = pl.narrativeFlags.open_scoreboard_tab as string;
      updatedFlags = {
        ...(updatedFlags || pl.narrativeFlags),
        open_scoreboard: false,
        ...(targetTab ? { target_scoreboard_tab: targetTab, open_scoreboard_tab: '' } : {})
      };
    }

    if (updatedFlags) {
      updatePl({
        narrativeFlags: updatedFlags
      });
    }
  }, [
    pl?.narrativeFlags?.open_feed,
    pl?.narrativeFlags?.open_advisor,
    pl?.narrativeFlags?.open_scoreboard,
    pl?.narrativeFlags?.open_scoreboard_tab,
    updatePl,
    pl?.narrativeFlags
  ]);

  // Warning system side-effects
  useEffect(() => {
    if (!pl) return;

    if (pl.mentalHealth <= 25) {
      document.getElementById('mental-stat')?.classList.add('flash-red');
      addTickerMessage('Your mind is fracturing. One more hit could end you.', 'text-red-500');
    } else {
      document.getElementById('mental-stat')?.classList.remove('flash-red');
    }

    if (pl.clout <= 10) {
      document.getElementById('clout-stat')?.classList.add('flash-blue');
      addTickerMessage('Your influence is fading. The streets are forgetting you.', 'text-blue-400');
    } else {
      document.getElementById('clout-stat')?.classList.remove('flash-blue');
    }

    if (pl.aura <= 10) {
      document.getElementById('aura-stat')?.classList.add('flash-purple');
      addTickerMessage('Your mystique is gone. You are becoming invisible.', 'text-purple-400');
    } else {
      document.getElementById('aura-stat')?.classList.remove('flash-purple');
    }

    if (pl.heat >= 80) {
      document.getElementById('heat-stat')?.classList.add('flash-orange');
      addTickerMessage('The feds are circling. One wrong move and you are done.', 'text-orange-400');
    } else {
      document.getElementById('heat-stat')?.classList.remove('flash-orange');
    }

    if (pl.bag <= 1000) {
      document.getElementById('bag-amount')?.classList.add('flash-red-border');
      addTickerMessage('Your funds are critically low. One bad month ends everything.', 'text-red-500');
    } else {
      document.getElementById('bag-amount')?.classList.remove('flash-red-border');
    }
  }, [pl, addTickerMessage]);

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

  useEffect(() => {
    if (ph !== 'PLAYING' || !pl) return;

    const guidance = pl.guidanceSettings || 'Recommended';
    if (guidance === 'Off') return;

    const resolvePromptWithQuote = (prompt: any) => {
      if (!prompt || !prompt.id) return prompt;
      const quote = getOrAssignQuoteForPrompt(pl, prompt.id, (newFlags) => {
        useGameStore.setState(state => ({
          pl: {
            ...state.pl,
            narrativeFlags: {
              ...(state.pl.narrativeFlags || {}),
              ...newFlags
            }
          }
        }));
      });
      return { ...prompt, quote };
    };

    // Ensure queue is initialized on pl safely
    const currentQueue = pl.advisorQueue || [];

    // If an advisor prompt is already active on the screen, wait until it is closed.
    if (activeAdvisorPrompt) return;

    // Check if we already displayed a prompt during the current month.
    const hasShownPopupThisMonth = pl.lastAdvisorPopupMonth === pl.month;

    // If we haven't shown a popup this month, and there are pending prompts in the queue, dequeue and show the next one.
    if (!hasShownPopupThisMonth && currentQueue.length > 0) {
      const [nextPrompt, ...remainingQueue] = currentQueue;

      useGameStore.setState(state => {
        const updatedFlags = { ...(state.pl.narrativeFlags || {}) };
        if (nextPrompt.id) {
          updatedFlags[nextPrompt.id] = true;
        }
        return {
          pl: {
            ...state.pl,
            lastAdvisorPopupMonth: state.pl.month,
            advisorQueue: remainingQueue,
            narrativeFlags: updatedFlags
          }
        };
      });

      setActiveAdvisorPrompt(resolvePromptWithQuote(nextPrompt));
      return;
    }

    // --- 1. Tier Onboarding welcome/briefing triggers ---
    // If pendingSpecialization or activeTransition is true, do NOT trigger (do not interrupt the cinematic).
    if (!pendingSpecialization && !activeTransition) {
      const currentTier = pl.currentTier;
      const prevTier = prevTierRef.current;

      // Update prevTierRef so we track transitions
      if (prevTier === null) {
        prevTierRef.current = currentTier;
      } else if (prevTier !== currentTier) {
        prevTierRef.current = currentTier;
      }

      const flagKey = `advisor_shown_tier_${currentTier}`;
      if (!pl.narrativeFlags?.[flagKey]) {
        const onboarding = TIER_ONBOARDING_DATA[currentTier];
        if (onboarding) {
          const isAlreadyQueued = currentQueue.some((item: any) => item.id === flagKey);
          if (!isAlreadyQueued) {
            const promptObj = {
              id: flagKey,
              title: onboarding.title,
              subtitle: onboarding.subtitle,
              bullets: onboarding.bullets,
              ctaLabel: 'Take me there',
              tabToOpen: onboarding.tabToOpen,
            };

            if (!hasShownPopupThisMonth) {
              // Show immediately and set narrative flags
              useGameStore.setState(state => ({
                pl: {
                  ...state.pl,
                  lastAdvisorPopupMonth: state.pl.month,
                  narrativeFlags: {
                    ...(state.pl.narrativeFlags || {}),
                    [flagKey]: true
                  }
                }
              }));
              setActiveAdvisorPrompt(resolvePromptWithQuote(promptObj));
            } else {
              // Queue it!
              useGameStore.setState(state => ({
                pl: {
                  ...state.pl,
                  advisorQueue: [...(state.pl.advisorQueue || []), promptObj]
                }
              }));
            }
          }
          return; // Skip contextual checks in the same frame
        }
      }
    }

    // --- 2. Contextual Advisor triggers ---
    // Minimal guidance suppresses all contextual triggers
    if (guidance === 'Minimal') return;

    const hasMetThreshold = pl.month >= 3 || (pl.totalHustlesCompleted || 0) >= 5;
    const matchedTrigger = hasMetThreshold ? checkAdvisorTriggers(pl, currentMarket) : null;
    if (matchedTrigger) {
      // Recommended guidance only allows critical or survival-level alerts
      if (guidance === 'Recommended') {
        const isCritical =
          matchedTrigger.tabToOpen === 'CRITICAL' ||
          matchedTrigger.title.includes('CRITICAL') ||
          matchedTrigger.title.includes('LIMIT') ||
          matchedTrigger.title.includes('WARNING') ||
          matchedTrigger.title.includes('DANGEROUS');
        if (!isCritical) return;
      }

      const isAlreadyQueued = currentQueue.some((item: any) => item.id === matchedTrigger.id);
      if (!isAlreadyQueued) {
        const promptObj = {
          id: matchedTrigger.id,
          title: matchedTrigger.title,
          subtitle: matchedTrigger.subtitle,
          bullets: matchedTrigger.bullets,
          ctaLabel: 'Take me there',
          tabToOpen: matchedTrigger.tabToOpen,
          onTakeMeThereCustom: matchedTrigger.onTakeMeThereCustom,
          onCloseExtra: matchedTrigger.onCloseExtra,
        };

        if (!hasShownPopupThisMonth) {
          // Show immediately and set narrative flags
          useGameStore.setState(state => ({
            pl: {
              ...state.pl,
              lastAdvisorPopupMonth: state.pl.month,
              narrativeFlags: {
                ...(state.pl.narrativeFlags || {}),
                [matchedTrigger.id]: true
              }
            }
          }));
          setActiveAdvisorPrompt(resolvePromptWithQuote(promptObj));
        } else {
          // Queue it!
          useGameStore.setState(state => ({
            pl: {
              ...state.pl,
              advisorQueue: [...(state.pl.advisorQueue || []), promptObj]
            }
          }));
        }
      }
    }
  }, [pl, ph, currentMarket, pendingSpecialization, activeTransition, activeAdvisorPrompt]);


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

  // Track market changes and display full-screen brief overlay
  useEffect(() => {
    if (!pl) return;
    if (prevMarketRef.current === null) {
      prevMarketRef.current = currentMarket;
      return;
    }
    if (prevMarketRef.current !== currentMarket) {
      setMarketShiftAlert(currentMarket);
      prevMarketRef.current = currentMarket;
      const timer = setTimeout(() => {
        setMarketShiftAlert(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentMarket, pl]);

  const currentTierIndex = useMemo(() => pl ? PROGRESSION_ORDER.indexOf(pl.currentTier) : -1, [pl]);

  const canAdvance = useMemo(() => {
    if (!pl) return false;
    const nextTier = PROGRESSION_ORDER[currentTierIndex + 1];
    if (!nextTier) return false;
    const req = TIER_REQUIREMENTS[nextTier];
    const currentCrowns = getMasteryCount(pl);
    return pl.bag >= req.cash && pl.clout >= req.clout && pl.aura >= req.aura && currentCrowns >= (req.crowns || 0);
  }, [pl, currentTierIndex]);

  // Automatically save to Hall of Fame when entering post-mortem
  useEffect(() => {
    if (ph === 'POST_MORTEM' && pl?.runId) {
      const saveKey = `bc_run_saved_${pl.runId}`;
      if (!sessionStorage.getItem(saveKey)) {
        const finalStat = getDominantStat(pl);
        const ending = getEnding(pl.legacyScore || 0, finalStat);
        const behavior = analyzeBehavior(pl);

        saveHallOfFameEntry({
          runId: pl.runId,
          playerName: pl.name,
          avatarId: pl.avatarId,
          tier: pl.currentTier,
          legacyScore: pl.legacyScore || 0,
          finalBag: pl.bag,
          ending: ending.title,
          deathBadge: deathBadge || undefined,
          lastHustle: pl.lastExecutedHustleId,
          date: new Date().toISOString(),
          month: pl.month,
          biography: pl.biography || [],
          blueprint: {
            primaryColor: behavior.primaryColor,
            dominantPersona: behavior.dominantPersona,
            paceSeconds: behavior.paceSeconds,
            paceLabel: behavior.paceLabel,
            adviceRatio: behavior.adviceRatio,
            setbackRatio: behavior.setbackRatio,
            riskCadenceRatio: behavior.riskCadenceRatio,
            orientationLabel: behavior.orientationLabel,
            headlineSynthesis: behavior.synthesisLines[0] || ''
          }
        });
        sessionStorage.setItem(saveKey, 'true');
      }
    }
  }, [ph, pl?.runId, pl?.currentTier, pl?.legacyScore, pl?.bag, pl?.month, deathBadge]);

  if (!isHydrated) {
    return <LoadingSkeleton />;
  }

  // Legacy Shop screen
  if (ph === 'LEGACY_SHOP') {
    return (
      <Suspense fallback={<PremiumLoader message="Opening the Vault..." subtitle="Your legacy awaits" />}>
        <LegacyShop
          onProceed={() => {
             // We can't use setPh directly as it's not exported in the same way
             // and resetGame will handle it usually, but here we want to go to PROLOGUE
             useGameStore.setState({ ph: 'PROLOGUE' });
          }}
        />
      </Suspense>
    );
  }

  // Prologue screen
  if (ph === 'PROLOGUE') {
    return (
      <PrologueScreen
        onStart={(name, backgroundId, categoryId, variationId, avatarId, prologueStats) => {
          resetGame(backgroundId, 3, categoryId, variationId, avatarId, prologueStats);
          setPlayerName(name);
          // Set isTutorialSkipped explicitly in the store as well
          useGameStore.setState({ isTutorialSkipped: true });
        }}
      />
    );
  }

  // Death screen
  if (ph === 'POST_MORTEM') {
    return (
      <>
        {showHallOfFame ? (
          <Suspense fallback={<PremiumLoader message="Reading the History Books..." subtitle="Retrieving Legends" />}>
            <HallOfFame
              onNewRun={() => {
                resetGame();
                window.location.reload();
              }}
            />
          </Suspense>
        ) : showSummary ? (
          <EndgameSummary
            onRestart={() => resetGame()}
            onViewHallOfFame={() => setShowHallOfFame(true)}
          />
        ) : (
          <DeathScreen
            deathBadge={deathBadge}
            fatalCause={fatalCause}
            lastHustleId={pl?.lastExecutedHustleId}
            deathContext={pl?.deathContext}
            onReset={() => resetGame()}
            onQuickStart={handleQuickStart}
            onViewSummary={() => setShowSummary(true)}
            onLegacyShop={() => useGameStore.setState({ ph: 'LEGACY_SHOP' })}
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
    return Object.values(HUSTLES).filter(h => {
      const hustleTierIndex = PROGRESSION_ORDER.indexOf(h.tier as Tier);
      const currentTierIndex = PROGRESSION_ORDER.indexOf(pl.currentTier);
      return h.tier === activeTab && hustleTierIndex <= currentTierIndex;
    });
  };

  const hustles = getHustlesForTab();
  const showFlexMarket = activeTab === 'FLEX';

  const ageYears = 18 + Math.floor(pl.month / 12);
  const ageMonths = pl.month % 12;

  const tierClass = `${pl.currentTier.toLowerCase()}-tier`;

  const activeMinigame = pl?.activeMinigame;

  return (
    <div className={`h-screen flex flex-col ${tierClass} text-white transition-colors duration-1000 relative overflow-hidden`}>
      {activeMinigame && (
        <div className="fixed inset-0 bg-slate-950/95 z-[4000] flex items-center justify-center p-4" style={{ zIndex: Z_INDEX.CRITICAL_MINIGAME }}>
          <div className="w-full max-w-md">
            {renderHustlePanel(activeMinigame.panelType, activeMinigame.level, activeMinigame, pl, (win: any) => {
              const resultScore = typeof win === 'number' ? win : (win ? 15 : 5);
              useGameStore.setState((state: any) => {
                const performingIds = activeMinigame.performingArtistIds || [];
                // Create a copy to be mutated safely
                const draftPl = JSON.parse(JSON.stringify(state.pl));
                const draftNewsFeed = [...state.news];
                completeConcertPerformanceWithLineup(draftPl, resultScore, activeMinigame.level, performingIds, draftNewsFeed);
                draftPl.activeMinigame = null;
                return {
                  pl: draftPl,
                  news: draftNewsFeed
                };
              });
            })}
          </div>
        </div>
      )}
      <AnimatePresence>
        {activeTransition && (
          <CinematicTransition
            key={activeTransition.id}
            artwork={activeTransition}
            onComplete={clearTransition}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {marketShiftAlert && (
          <MarketShiftOverlay
            key={marketShiftAlert}
            market={marketShiftAlert as any}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <TierBackground
          key={pl.currentTier}
          tier={pl.currentTier}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        />
      </AnimatePresence>

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

      {/* STATUS BAR & GAME NAVIGATION (Always Fixed) */}
      <div className="flex-shrink-0 w-full z-30 bg-slate-950/95 border-b border-slate-800">
        {/* Top Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 scroll-hint-wrapper">
          <div className="max-w-md mx-auto flex flex-nowrap overflow-x-auto gap-3 items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400 no-scrollbar pr-8 py-0.5">
            {pl.activeSentiment ? (
              <div className={`rounded-full py-1 px-2.5 text-[9px] font-bold tracking-tight uppercase flex items-center gap-1 border shrink-0 animate-pulse ${
                pl.activeSentiment.multiplier > 1
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                📰 {pl.activeSentiment.label} ({pl.activeSentiment.monthsRemaining}m)
              </div>
            ) : (
              <div className="rounded-full py-0.5 pl-0.5 pr-2.5 text-[9px] font-bold tracking-tight uppercase flex items-center gap-1.5 border bg-slate-800/40 text-slate-300 border-slate-800/60 shrink-0">
                <Avatar
                  avatarId={pl.avatarId || 'av_m1'}
                  size={18}
                  ring="ring-emerald-500/30"
                />
                <span className="text-white font-black">{pl.name}</span>
              </div>
            )}
            <div className={`rounded-full py-1 px-2.5 text-[9px] font-bold tracking-tight uppercase flex items-center gap-1 border shrink-0 ${
              currentMarket === 'RECESSION'
                ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                : currentMarket === 'CRACKDOWN'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse'
                : currentMarket === 'BULL_MARKET'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse'
                : 'bg-slate-800/40 text-slate-300 border-slate-800/60'
            }`}>
              <span>{MARKET_CONFIGS[currentMarket].icon}</span>
              <span className="text-white font-black">{MARKET_CONFIGS[currentMarket].name}</span>
            </div>
            <div className="rounded-full py-1 px-2.5 text-[9px] font-bold tracking-tight uppercase flex items-center gap-1 border bg-slate-800/40 text-slate-300 border-slate-800/60 shrink-0">
              📅 AGE: <span className="text-white font-black">{ageYears}y {ageMonths}m</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 px-4 py-2">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <div
                id="bag-amount"
                onClick={() => handleStatTap('cash')}
                className="text-2xl font-black text-emerald-400 font-mono leading-none cursor-pointer hover:opacity-80 transition-opacity"
              >
                ${pl.bag.toLocaleString()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-1 text-center mb-3">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(prev => prev === 'clout' ? null : 'clout');
                  handleStatTap('clout');
                }}
                className="flex flex-col group relative cursor-help stat-tooltip-container"
              >
                <span className="text-[8px] text-slate-500 uppercase">Clout</span>
                <span id="clout-stat" className={`text-xs font-bold ${pl.clout < 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                  {Math.floor(pl.clout)}{pl.clout < 5 && '!'}
                </span>
                <div className={`absolute top-full left-0 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left leading-relaxed ${
                  activeTooltip === 'clout' ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'
                }`}>
                  <span className="font-black text-blue-400 uppercase block mb-1">👑 Clout (Influence)</span>
                  Represents your public reach, street rep, and political sway. Reaching the max allows tier promotions. Failing active checks reduces your fame.
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(prev => prev === 'mental' ? null : 'mental');
                  handleStatTap('mental');
                }}
                className="flex flex-col group relative cursor-help stat-tooltip-container"
              >
                <span className="text-[8px] text-slate-500 uppercase">Mental</span>
                <span id="mental-stat" className={`text-xs font-bold ${pl.mentalHealth < 30 ? 'text-red-500' : 'text-white'}`}>
                  {Math.floor(pl.mentalHealth)}%
                  {pl.mentalShieldTurns > 0 && (
                    <span className="text-blue-400 ml-0.5 text-[10px]">🛡️{pl.mentalShieldTurns}</span>
                  )}
                </span>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left leading-relaxed ${
                  activeTooltip === 'mental' ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'
                }`}>
                  <span className="font-black text-red-400 uppercase block mb-1">🧠 Mental Health</span>
                  Your psychological capacity. Exhausting work drains your mental health. Reaching <span className="font-black text-red-500">0% causes burnout (Death)</span>. Restore it via sleep/recreation.
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(prev => prev === 'aura' ? null : 'aura');
                  handleStatTap('aura');
                }}
                className="flex flex-col group relative cursor-help stat-tooltip-container"
              >
                <span className="text-[8px] text-slate-500 uppercase">Aura</span>
                <span id="aura-stat" className={`text-xs font-bold ${pl.aura < 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                  {Math.floor(pl.aura)}{pl.aura < 5 && '!'}
                </span>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left leading-relaxed ${
                  activeTooltip === 'aura' ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'
                }`}>
                  <span className="font-black text-purple-400 uppercase block mb-1">✨ Aura (Mystique)</span>
                  Represents your personal presence, charisma, and star power. Necessary for massive negotiations, business deals, and general respect.
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(prev => prev === 'heat' ? null : 'heat');
                  handleStatTap('heat');
                }}
                className="flex flex-col group relative cursor-help stat-tooltip-container"
              >
                <span className="text-[8px] text-slate-500 uppercase">Heat</span>
                <span id="heat-stat" className={`text-xs font-bold ${pl.heat > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                  {Math.floor(pl.heat)}%
                </span>
                <div className={`absolute top-full right-0 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl text-left leading-relaxed ${
                  activeTooltip === 'heat' ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'
                }`}>
                  <span className="font-black text-orange-400 uppercase block mb-1">🔥 Heat (WANTED)</span>
                  Represents law enforcement attention. High heat triggers sudden raids, arrests, and prison time. Use Ghost Mode to lay low and cool down.
                </div>
              </div>
            </div>

            {/* Active Modifier Badges */}
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {pl.mentalHealth < 50 && (
                <button
                  onClick={() => handleModifierBadgeTap('exhaustion')}
                  className="rounded-full py-0.5 px-2 text-[8px] font-bold tracking-tight uppercase flex items-center gap-1 border bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-all shrink-0"
                >
                  <span className="text-[9px]">💤</span>
                  <span>Exhaustion (-{Math.round((1 - (0.75 + 0.25 * (pl.mentalHealth / 50))) * 100)}%)</span>
                </button>
              )}
              {pl.aura >= 100 && (
                <button
                  onClick={() => handleModifierBadgeTap('aura_discount')}
                  className="rounded-full py-0.5 px-2 text-[8px] font-bold tracking-tight uppercase flex items-center gap-1 border bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20 transition-all shrink-0"
                >
                  <span className="text-[9px]">👑</span>
                  <span>Aura discount (-10%)</span>
                </button>
              )}
              {pl.heat >= 70 && (
                <button
                  onClick={() => handleModifierBadgeTap('public_scrutiny')}
                  className="rounded-full py-0.5 px-2 text-[8px] font-bold tracking-tight uppercase flex items-center gap-1 border bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 transition-all shrink-0"
                >
                  <span className="text-[9px]">👁️</span>
                  <span>Public scrutiny</span>
                </button>
              )}
              {pl.heat === 0 && (
                <button
                  onClick={() => handleModifierBadgeTap('clean_record')}
                  className="rounded-full py-0.5 px-2 text-[8px] font-bold tracking-tight uppercase flex items-center gap-1 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 transition-all shrink-0"
                >
                  <span className="text-[9px]">🛡️</span>
                  <span>Clean record bonus</span>
                </button>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex w-full gap-[6px]">
              <button
                onClick={() => setShowScoreboard(true)}
                className="flex-1 flex flex-col items-center justify-center gap-[4px] py-[6px] px-[2px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold transition-colors uppercase tracking-tighter border border-slate-700/50"
              >
                <span className="text-[15px] leading-none">📊</span>
                <span className="text-[9.5px] leading-none font-black uppercase">Stats</span>
              </button>
              <button
                onClick={() => setShowChallenges(true)}
                className="flex-1 flex flex-col items-center justify-center gap-[4px] py-[6px] px-[2px] rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold transition-colors uppercase tracking-tighter border border-blue-500/20"
              >
                <span className="text-[15px] leading-none">🔥</span>
                <span className="text-[9.5px] leading-none font-black uppercase">Goals</span>
              </button>
              <button
                onClick={() => setShowReceipts(true)}
                className="flex-1 flex flex-col items-center justify-center gap-[4px] py-[6px] px-[2px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold transition-colors uppercase tracking-tighter border border-slate-700/50"
              >
                <span className="text-[15px] leading-none">🧾</span>
                <span className="text-[9.5px] leading-none font-black uppercase">Receipts</span>
              </button>
              <button
                onClick={() => setShowPhoneFeed(true)}
                className="flex-1 flex flex-col items-center justify-center gap-[4px] py-[6px] px-[2px] rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold transition-colors uppercase tracking-tighter border border-indigo-500/20 relative"
              >
                <span className="text-[15px] leading-none">📱</span>
                <span className="text-[9.5px] leading-none font-black uppercase">Feed</span>
                {pl.worldReactions && pl.worldReactions.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                )}
              </button>
              <button
                onClick={() => setShowAdvisor(true)}
                className="flex-1 flex flex-col items-center justify-center gap-[4px] py-[6px] px-[2px] rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold transition-colors uppercase tracking-tighter border border-emerald-500/20 relative"
              >
                <span className="text-[15px] leading-none">🧠</span>
                <span className="text-[9.5px] leading-none font-black uppercase">Advisor</span>
                {(pl.mentalHealth <= 30 || pl.heat >= 75 || canAdvance) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Condensed Live Ledger */}
        {isLedgerPinned && (
          <div className="max-w-md mx-auto px-4 mt-2 mb-1 animate-in slide-in-from-top duration-300">
            <div className="bg-slate-950/95 border-2 border-emerald-500/30 rounded-2xl p-3 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative">
              <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-slate-900">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">📌</span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Ledger Summary</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowReceipts(true)}
                    className="text-[7.5px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase hover:text-white tracking-tighter"
                  >
                    Expand Receipts
                  </button>
                  <button
                    onClick={() => setIsLedgerPinned(false)}
                    className="text-slate-500 hover:text-white font-black text-[9px] bg-slate-900 hover:bg-slate-800 rounded px-1"
                    title="Unpin Ledger"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Monthly Net Summary */}
              <div className="scroll-hint-wrapper">
                <div className="flex flex-nowrap overflow-x-auto justify-between items-center text-[8.5px] font-mono text-slate-400 mb-1.5 bg-slate-900/40 p-1.5 rounded-lg border border-slate-900 no-scrollbar pr-8">
                  <div className="shrink-0 mr-4">
                    RENT: <span className="text-red-400 font-bold">-${((pl.currentTier ? { MUD: 50, STREET: 1000, STARTUP: 5000, CORPORATE: 20000, ELITE: 100000, MOGUL: 500000, PRESIDENT: 2000000, OPEN: 0 }[pl.currentTier] || 0 : 0) * (MARKET_CONFIGS[currentMarket]?.expenseMultiplier || 1.0)).toLocaleString()}</span>
                  </div>
                  <div className="shrink-0 mr-4">
                    UPKEEP: <span className="text-red-400 font-bold">-${calculateMonthlyUpkeep(pl).toLocaleString()}</span>
                  </div>
                  {calculateMonthlyDebtService(pl) > 0 && (
                    <div className="shrink-0 mr-4">
                      DEBT: <span className="text-red-400 font-bold">-${calculateMonthlyDebtService(pl).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="shrink-0">
                    PASSIVE: <span className="text-emerald-400 font-bold">+${(pl.lastPassiveBreakdown?.finalTotal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Last 3 Cash Actions */}
              <div className="space-y-1">
                {(pl.events || []).filter(e => ['HUSTLE_COMPLETED', 'BUSINESS_PURCHASED', 'PROPERTY_PURCHASED', 'RIVAL_DEFEATED'].includes(e.type)).slice(0, 3).map((event) => {
                  let text = '';
                  let cashChange = 0;
                  let isProfit = true;

                  if (event.type === 'HUSTLE_COMPLETED') {
                    const m = event.metadata as any;
                    text = m.hustleName || 'Hustle';
                    cashChange = m.profit || 0;
                    isProfit = cashChange >= 0;
                  } else if (event.type === 'BUSINESS_PURCHASED') {
                    const m = event.metadata as any;
                    text = `Asset: ${m.assetId?.replace('_', ' ')}`;
                    cashChange = m.cost || 0;
                    isProfit = false;
                  } else if (event.type === 'PROPERTY_PURCHASED') {
                    const m = event.metadata as any;
                    text = `RE: ${m.branchName || m.type || 'Property'}`;
                    cashChange = m.cost || 0;
                    isProfit = false;
                  } else if (event.type === 'RIVAL_DEFEATED') {
                    const m = event.metadata as any;
                    text = `Defeated ${m.rivalName}`;
                    cashChange = m.bonus || 0;
                    isProfit = true;
                  }

                  return (
                    <div key={event.id} className="flex justify-between items-center text-[9px] bg-slate-900/20 px-2 py-1 rounded-lg border border-slate-900/50">
                      <span className="text-slate-300 font-bold uppercase tracking-tight truncate max-w-[180px]">{text}</span>
                      <span className={`font-mono font-black ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : '-'}${Math.abs(cashChange).toLocaleString()}
                      </span>
                    </div>
                  );
                })}

                {(!pl.events || pl.events.filter(e => ['HUSTLE_COMPLETED', 'BUSINESS_PURCHASED', 'PROPERTY_PURCHASED', 'RIVAL_DEFEATED'].includes(e.type)).length === 0) && (
                  <div className="text-[8px] text-slate-600 text-center italic py-1">
                    No cash events logged yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {!(pl.inJail || pl.isIncarcerated) && (
          <div className="-mt-px">
            <NavTabs
              activeTab={activeTab}
              currentTier={pl.currentTier}
              onTabChange={(tab) => {
                setActiveTab(tab as AppTab);
                setShowMinigame(false);
              }}
            />
          </div>
        )}
      </div>

      {/* SCROLLABLE GAME AREA */}
      <div className="flex-grow overflow-y-auto relative no-scrollbar">
        {/* Main Content */}
        <div className="max-w-md mx-auto px-4 py-3 pb-24">
        {pl.inJail || pl.isIncarcerated ? (
          <JailOverlay />
        ) : activeTab === 'PRESIDENCY' ? (
          <Suspense fallback={<PremiumLoader message="Preparing the Situation Room..." subtitle="Briefing the Cabinet" />}>
            <PresidentDashboard />
          </Suspense>
        ) : !activeHustleView ? (
          <>
            {/* Contextual Immediate Player Goal Banner */}
            <div className="mb-4">
              <ImmediateGoalCard />
            </div>

            {/* Advance Tier Button */}
            {canAdvance && activeTab !== 'FLEX' && (
              <button
                id="advance-tier-button"
                onClick={() => advanceTier()}
                className="w-full mb-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              >
                <span>⚡ ADVANCE TO NEXT TIER ⚡</span>
                {(() => {
                  const nextTierName = PROGRESSION_ORDER[currentTierIndex + 1];
                  const nextReq = nextTierName ? TIER_REQUIREMENTS[nextTierName] : null;
                  const currentCrowns = pl ? getMasteryCount(pl) : 0;
                  if (nextReq && nextReq.crowns > 0) {
                    return (
                      <span className="text-[10px] font-mono text-purple-200 tracking-wider">
                        CROWNS {currentCrowns} / {nextReq.crowns} • READY TO ADVANCE
                      </span>
                    );
                  }
                  return null;
                })()}
              </button>
            )}

            {/* Next Tier Crown Requirement Banner */}
            {(() => {
              const nextTierName = PROGRESSION_ORDER[currentTierIndex + 1];
              const nextReq = nextTierName ? TIER_REQUIREMENTS[nextTierName] : null;
              const currentCrowns = pl ? getMasteryCount(pl) : 0;

              if (!showFlexMarket && nextReq && nextReq.crowns > 0 && !canAdvance) {
                const remaining = Math.max(0, nextReq.crowns - currentCrowns);
                const crownRequirementMet = remaining === 0;

                return (
                  <div className="mb-4 p-3 bg-slate-900/90 border border-yellow-500/30 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider flex items-center gap-1">
                        👑 NEXT TIER ({nextTierName}) REQUIREMENT: CROWNS
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-300">
                        {currentCrowns} / {nextReq.crowns}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentCrowns / nextReq.crowns) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-center mt-1">
                      {crownRequirementMet ? (
                        <span className="text-emerald-400 uppercase tracking-wider">
                          CROWNS {currentCrowns} / {nextReq.crowns} • CROWN REQUIREMENT MET
                        </span>
                      ) : (
                        <span className="text-amber-400 uppercase tracking-wider">
                          CROWNS {currentCrowns} / {nextReq.crowns} • {remaining} MORE CROWN{remaining > 1 ? 'S' : ''} NEEDED
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Flex Market */}
            {showFlexMarket && <FlexMarket />}

            {/* Rival Leaderboard */}
            {!showFlexMarket && (
              <RivalLeaderboard
                playerBag={pl.bag}
                playerName={pl.name || 'You'}
                rivals={pl.rivals.filter(r => r.tier === activeTab || r.tier === pl.currentTier)}
              />
            )}

            {/* Hustle Grid */}
            {!showFlexMarket && (
              <div className="grid grid-cols-2 gap-3">
                {hustles.map((hustle, index) => {
                  const isMastered = pl.masteredHustles?.includes(hustle.id);
                  const tierCardClass = `hustle-card-${hustle.tier.toLowerCase()}`;
                  const isHot = index === 0;
                  const isPassive = isPassiveHustle(hustle);

                  return (
                    <button
                      key={hustle.id}
                      id={`hustle-card-${hustle.id}`}
                      data-testid={`hustle-card-${hustle.id}`}
                      onClick={() => {
                        setActiveHustleView(hustle.id);
                        setShowMinigame(false);
                      }}
                      className={`${tierCardClass} rounded-xl p-4 text-center border transition-all active:scale-95 relative overflow-hidden ${
                        isHot ? 'ring-1 ring-emerald-500/30 shadow-emerald-900/40 shadow-lg' : ''
                      }`}
                    >
                      {isHot && (
                        <span className="absolute top-2 right-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-500/20 rounded px-1.5 py-0.5">
                          HOT
                        </span>
                      )}
                      {isMastered && (
                        <div className={`absolute ${isHot ? 'top-1 left-1' : 'top-1 right-1'} text-xs`}>👑</div>
                      )}
                      <div className="text-4xl mb-2">{hustle.icon}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">
                        {hustle.name}
                      </div>
                      <div className="mt-2">
                        {isPassive ? (
                          <span className="text-[8px] px-1.5 py-0.5 bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 rounded font-black tracking-widest uppercase">
                            PASSIVE FOCUS
                          </span>
                        ) : (
                          <span className="text-[8px] px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 rounded font-black tracking-widest uppercase">
                            ACTIVE CASH
                          </span>
                        )}
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
                  requestAnimationFrame(() => {
                    const result = executeHustle(hustle.id, multiplier);

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
                const renderMinigame = () => {
                if (activeMiniGame === 'SwipeOrder') return <SwipeOrder onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'FestivalCrowdSurge') return <FestivalCrowdSurge onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'CryptoMineRush') return <CryptoMineRush onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'PodcastFlowState') return <PodcastFlowState onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'SwipeUpViral' || activeMiniGame === 'ContentCreation') return <ContentCreation onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'SwipeAuthentic') return <SwipeAuthentic onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'BeatSequence') return <BeatSequence onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'TechRepairDrag') return <TechRepairDrag onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'WordTap') return <WordTap onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'PinchToInspect') return <PinchToInspect onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'TapRhythm') return <TapRhythm onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'DragScale') return <DragScale onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'TapAssign') return <TapAssign onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'HoldHype') return <HoldHype onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'ShakeToInfluence') return <ShakeToInfluence onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'PinchToZoom') return <PinchToZoom onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'CryptoLeverage' || activeMiniGame === 'SlotMachine') return <CryptoLeverage onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'BioFeedbackRetreat') {
                  return (
                    <BioFeedbackRetreat
                      level={hustleLevel}
                      onComplete={(healAmount) => {
                        const threshold = 30 + (hustleLevel * 5);
                        onComplete(
                          healAmount >= threshold ? 1.5 :
                          healAmount >= threshold * 0.5 ? 1.0 : 0.5
                        );
                      }}
                    />
                  );
                }
                if (activeMiniGame === 'HigherLower') return <HigherLower onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'Blackjack') return <Blackjack onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'Roulette') return <Roulette onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'DiceCraps') return <DiceCraps onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'QuickReaction') return <QuickReaction onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'StruggleMash') return <StruggleMash onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'LaborBuild') return <LaborBuild onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'TrafficDodge') return <TrafficDodge onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'PlasmaDonation') return <PlasmaDonation onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'GhostTap' || activeMiniGame === 'GhostMode') return (
                  <GhostMode
                    key={hustleLevel}
                    level={hustleLevel}
                    tier={pl.currentTier}
                    onComplete={onComplete}
                  />
                );
                if (activeMiniGame === 'StreetEats') return <StreetEats onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'FamilyDeli') return <FamilyDeli onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'ScoopThePoop') return <ScoopThePoop onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'PatternMemory') return <PatternMemory onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'SequenceRecall') return <SequenceRecall onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'StreetwearDesign' || activeMiniGame === 'StreetwearMatch') return (
                  <StreetwearMatch
                    key={hustleLevel}
                    level={hustleLevel}
                    tier={pl.currentTier}
                    onComplete={onComplete}
                  />
                );
                if (activeMiniGame === 'HashtagTap') return <HashtagTap onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'RunnerRoute') return <RunnerRoute onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'MemeCoinPump') return <MemeCoinPump onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'EcomCatch') return <EcomCatch onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'TapApprove') return <TapApprove onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'DragMerge') return <DragMerge onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'BalanceScale') return <BalanceScale onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'ReactionGrid') return <ReactionGrid onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'RiskMeter') {
                  if (hustle.id === 'film_studio') {
                    return (
                      <RiskMeter
                        onComplete={onComplete}
                        level={hustleLevel}
                        tier={pl.currentTier}
                        title="BOX OFFICE RISK ASSESSMENT"
                        instruction="Stop needle in the GOLD ZONE for a blockbuster hit"
                      />
                    );
                  }
                  return <RiskMeter onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                }
                if (activeMiniGame === 'RotateToScale') return (
                  <RotateToScale
                    level={hustleLevel}
                    tier={pl.currentTier}
                    onComplete={onComplete}
                  />
                );

                if (activeMiniGame === 'MarketPredictor') {
                  const rival = pl.rivals?.find(r => r.currentBid > 0);
                  const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                  return (
                    <MarketPredictor
                      onComplete={onComplete}
                      level={hustleLevel}
                      tier={pl.currentTier}
                      playerBid={levelData?.cost || 10000000}
                      rivalBid={rival?.currentBid || 0}
                      onOutbid={(amount) => {
                        addTickerMessage(`Outbid by rival! They offered $${amount.toLocaleString()}`, 'text-red-400');
                      }}
                    />
                  );
                }

                if (activeMiniGame === 'VCPitchRoom') {
                  const rival = pl.rivals?.find(r => r.currentBid > 0);
                  const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                  return (
                    <VCPitchRoom
                      onComplete={onComplete}
                      level={hustleLevel}
                      tier={pl.currentTier}
                      playerBid={levelData?.cost || 20000000}
                      rivalBid={rival?.currentBid || 0}
                      onOutbid={(amount) => {
                        addTickerMessage(`Outbid by rival! They offered $${amount.toLocaleString()}`, 'text-red-400');
                      }}
                      selectedCharacter={selectedCharacterForMinigame}
                    />
                  );
                }

                if (activeMiniGame === 'ShakeForHype' || activeMiniGame === 'PresidentialCampaign') {
                  return <PresidentialCampaign onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                }

                if (activeMiniGame === 'BoardroomBattle') {
                  const rival = pl.rivals?.find(r => r.currentBid > 0);
                  const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                  return (
                    <BoardroomBattle
                      onComplete={onComplete}
                      level={hustleLevel}
                      tier={pl.currentTier}
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
                      level={hustleLevel}
                      tier={pl.currentTier}
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

                if (activeMiniGame === 'CaptchaDrone' || activeMiniGame === 'CAPTCHA_GAME') return <CaptchaDrone onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;
                if (activeMiniGame === 'ClickbaitGame' || activeMiniGame === 'CLICKBAIT_GAME') return <ClickbaitGame onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;
                if (activeMiniGame === 'ReadTheRoom') return <ReadTheRoom onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'CodeBreaker') return <CodeBreaker onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                if (activeMiniGame === 'SignSpinner' || activeMiniGame === 'SIGN_SPINNER_GAME') return <SignSpinner onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;
                if (activeMiniGame === 'ReviewFarm' || activeMiniGame === 'REVIEW_FARM_GAME') return <ReviewFarm onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;
                if (activeMiniGame === 'ConcertJam' || activeMiniGame === 'CONCERT_JAM_GAME') return <ConcertJam onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;

                // Fallback for unknown minigames
                return <SimpleFallback name={activeMiniGame} onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                };

                return (
                  <Suspense fallback={<MinigameLoader icon={hustle.icon} name={hustle.name} />}>
                    <GameViewport
                      title={hustle.name}
                      level={hustleLevel}
                      onExit={() => onComplete(0.5)}
                    >
                      {renderMinigame()}
                    </GameViewport>
                  </Suspense>
                );
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
                  return (
                    <Suspense fallback={<PremiumLoader message="Tuning Instruments..." subtitle="Setting up the Main Stage" />}>
                      <EntertainmentDashboard />
                    </Suspense>
                  );
                }
                if (hustle.panelType === 'DATA_ANALYTICS') {
                  return <DataAnalyticsPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'CRYPTO_MINING') {
                  return <CryptoMiningPanel hustle={hustle} onExecute={() => setShowMinigame(true)} />;
                }
                if (hustle.panelType === 'VA_AGENCY') {
                  return <VAAgencyPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'REAL_ESTATE') {
                  return <RealEstatePanel hustle={hustle} />;
                }
                if (hustle.panelType === 'GLOBAL_CONGLOMERATE') {
                  return <GlobalConglomeratePanel hustle={hustle} />;
                }
                if (hustle.panelType === 'VENTURE_CAPITAL') {
                  return (
                    <Suspense fallback={<PremiumLoader message="Reviewing Pitches..." subtitle="Reading Founder Decks" />}>
                      <VCPanel
                        hustle={hustle}
                        onExecute={(founder) => {
                          setSelectedCharacterForMinigame(founder || null);
                          setShowMinigame(true);
                        }}
                      />
                    </Suspense>
                  );
                }
                if (hustle.panelType === 'FILM_STUDIO') {
                  return <FilmStudioPanel hustle={hustle} />;
                }
                if (hustle.panelType === 'FUND_MOVIE') {
                  return (
                    <Suspense fallback={<PremiumLoader message="Casting Lead Actors..." subtitle="Reading Script Screenplays" />}>
                      <FundMoviePanel hustle={hustle} />
                    </Suspense>
                  );
                }
                if (hustle.panelType === 'MARRY_CELEBRITY') {
                  return (
                    <Suspense fallback={<PremiumLoader message="Sending Invitations..." subtitle="Renting a Hollywood Mansion" />}>
                      <MarryCelebrityPanel hustle={hustle} />
                    </Suspense>
                  );
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
                if (hustle.panelType === 'REST') {
                  const baseRecovery = currentBranch ? (currentBranch.mentalHit || 15) : 15;
                  return (
                    <RestPanel
                      baseRecovery={baseRecovery}
                      hustleId={hustle.id}
                      onClose={() => setActiveHustleView(null)}
                    />
                  );
                }

                const customPanelTypes = ['CAPTCHA_GAME', 'CLICKBAIT_GAME', 'SIGN_SPINNER_GAME', 'REVIEW_FARM_GAME', 'CONCERT_JAM_GAME', 'TALENT_AGENT_GAME'];
                if (customPanelTypes.includes(hustle.panelType || '')) {
                  const hustleLevel = pl.hustleLevels[hustle.id] || 1;
                  return renderHustlePanel(hustle.panelType!, hustleLevel, null, pl, (win: any) => {
                    const isWinObject = typeof win === 'object';
                    const multiplier = isWinObject ? win.multiplier : (win ? 1.5 : 0.5);
                    const result = executeHustle(hustle.id, multiplier);
                    if (result.success) {
                      let signedCelebrity: any = null;
                      if (isWinObject && win.celebrity) {
                        signedCelebrity = win.celebrity;
                        const store = useGameStore.getState();
                        const currentRolodex = store.pl.rolodex || [];
                        const updatedRolodex = [...currentRolodex, signedCelebrity];
                        const bioUpdate = Bio.recordTalentSigning(store.pl, signedCelebrity.name, signedCelebrity.relationshipScore);
                        const biography = bioUpdate ? [...(store.pl.biography || []), bioUpdate.entry] : (store.pl.biography || []);
                        const recordedBioKeys = bioUpdate ? [...(store.pl.recordedBioKeys || []), bioUpdate.key!] : (store.pl.recordedBioKeys || []);
                        store.updatePl({
                          rolodex: updatedRolodex,
                          biography,
                          recordedBioKeys
                        });
                        store.addTickerMessage(`🤝 SIGNED: New talent ${signedCelebrity.name} added to Rolodex! Starting Rel: ${signedCelebrity.relationshipScore}`, 'text-yellow-400 font-bold');
                      }

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
                        ...(signedCelebrity ? {
                          signedCelebrityName: signedCelebrity.name,
                          signedCelebrityAvatar: signedCelebrity.avatar,
                          relationshipScore: signedCelebrity.relationshipScore
                        } : {})
                      } as any);
                      forceUpdate();
                    }
                    setActiveHustleView(null);
                  });
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
      </div>

      {/* Receipts Modal */}
      {showReceipts && (
        <TheReceipts
          onClose={() => setShowReceipts(false)}
          isPinned={isLedgerPinned}
          onTogglePin={() => setIsLedgerPinned(!isLedgerPinned)}
        />
      )}

      {/* World Reaction Phone Feed Modal */}
      {showPhoneFeed && (
        <WorldReactionFeed onClose={() => setShowPhoneFeed(false)} />
      )}


      {/* Generic Hustle Reward Card */}
      {activeHustleResult && (
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
            ...((activeHustleResult as any).signedCelebrityName ? [
              {
                label: 'Signed Creator',
                value: `${(activeHustleResult as any).signedCelebrityAvatar || '🎭'} ${(activeHustleResult as any).signedCelebrityName}`,
                colorClass: 'text-yellow-400 font-black'
              },
              {
                label: 'Starting Relationship',
                value: `${(activeHustleResult as any).relationshipScore || 50}/100`,
                colorClass: 'text-amber-400 font-black font-mono'
              }
            ] : [])
          ].filter(s => s.value !== 0)}
          onDismiss={() => {
            setActiveHustleResult(null);
            setActiveHustleView(null);
          }}
        />
      )}

      {showScoreboard && (
        <Suspense fallback={<PremiumLoader message="Compiling Biography..." subtitle="Gathering Milestones" />}>
          <Scoreboard onClose={() => setShowScoreboard(false)} />
        </Suspense>
      )}
      {showAdvisor && (
        <StrategicAdvisorModal
          onClose={() => setShowAdvisor(false)}
          initialTab={advisorTab}
        />
      )}
      {activeAdvisorPrompt && (
        <AdvisorMentorModal
          title={activeAdvisorPrompt.title}
          subtitle={activeAdvisorPrompt.subtitle}
          bullets={activeAdvisorPrompt.bullets}
          ctaLabel={activeAdvisorPrompt.ctaLabel}
          quote={activeAdvisorPrompt.quote}
          onClose={() => {
            if (activeAdvisorPrompt.onCloseExtra) {
              activeAdvisorPrompt.onCloseExtra(useGameStore.getState());
            }
            setActiveAdvisorPrompt(null);
          }}
          onTakeMeThere={
            activeAdvisorPrompt.onTakeMeThereCustom
              ? () => {
                  activeAdvisorPrompt.onTakeMeThereCustom!(useGameStore.getState());
                  setActiveAdvisorPrompt(null);
                }
              : activeAdvisorPrompt.tabToOpen
              ? () => {
                  setAdvisorTab(activeAdvisorPrompt.tabToOpen!);
                  setShowAdvisor(true);
                  if (activeAdvisorPrompt.onCloseExtra) {
                    activeAdvisorPrompt.onCloseExtra(useGameStore.getState());
                  }
                  setActiveAdvisorPrompt(null);
                }
              : undefined
          }
        />
      )}
      {activeTierBadge && (
        <TierBadgeCelebration
          tier={activeTierBadge}
          onClose={() => setActiveTierBadge(null)}
        />
      )}

      {/* New Tutorial Box */}
      {!isTutorialSkipped && <TutorialBox />}
      <DailyChallenges isOpen={showChallenges} onClose={() => setShowChallenges(false)} />
      <SpecializationModal />
      <FirstCrownModal />
      <NarrativeEventModal />
      <LiveWorldEventModal />
      <InteractiveStoryModal />

      {/* Stat Breakdown Drawer */}
      <AnimatePresence>
        {isStatDrawerOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[2000] flex items-end justify-center">
            {/* Backdrop tap to close */}
            <div className="absolute inset-0" onClick={() => setIsStatDrawerOpen(false)} />

            {/* Slide-up container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl w-full max-w-md h-[72vh] flex flex-col shadow-2xl z-10 overflow-hidden"
            >
              {/* Header drag handle line */}
              <div className="flex justify-center py-2 shrink-0">
                <div className="w-12 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="px-5 pb-3 flex justify-between items-center border-b border-slate-800 shrink-0">
                <div>
                  <h2 className="text-sm font-black uppercase text-slate-200 tracking-wider">Stat Analysis Console</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Detailed monthly tracking & tactical interventions</p>
                </div>
                <button
                  onClick={() => setIsStatDrawerOpen(false)}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 p-1.5 transition-colors text-[10px]"
                >
                  ✕
                </button>
              </div>

              {/* Tabs Row */}
              <div className="flex bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider shrink-0">
                <button
                  onClick={() => setStatDrawerActiveTab('thisMonth')}
                  className={`flex-1 py-3 text-center transition-colors ${
                    statDrawerActiveTab === 'thisMonth'
                      ? 'text-emerald-400 bg-slate-900 border-b-2 border-emerald-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  📊 This Month
                </button>
                <button
                  onClick={() => setStatDrawerActiveTab('modifiers')}
                  className={`flex-1 py-3 text-center transition-colors ${
                    statDrawerActiveTab === 'modifiers'
                      ? 'text-emerald-400 bg-slate-900 border-b-2 border-emerald-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ⚡ Active Modifiers
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 leading-relaxed text-[11px] text-slate-300">
                {statDrawerActiveTab === 'thisMonth' ? (
                  <div className="space-y-4">
                    {/* Cash Breakdown Section */}
                    <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-emerald-400 uppercase tracking-wide">💵 Cash Flow</span>
                        <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netCash && (pl.lastStatBreakdown as any).netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          Net: {(pl.lastStatBreakdown as any)?.netCash && (pl.lastStatBreakdown as any).netCash >= 0 ? '+' : ''}
                          {((pl.lastStatBreakdown as any)?.netCash || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1.5 font-medium text-slate-400">
                        {(pl.lastStatBreakdown as any)?.cash && (pl.lastStatBreakdown as any).cash.length > 0 ? (
                          ((pl.lastStatBreakdown as any).cash as any[]).map((src, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex items-center gap-1">• {src.name}</span>
                              <span className={`font-mono ${src.amount >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}`}>
                                {src.amount >= 0 ? '+' : ''}{src.amount.toLocaleString()} {src.display ? `(${src.display})` : ''}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 italic">No cash flow events registered this month.</div>
                        )}
                      </div>
                    </div>

                    {/* Aura Breakdown Section */}
                    <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-purple-400 uppercase tracking-wide">✨ Aura Breakdown</span>
                        <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netAura && (pl.lastStatBreakdown as any).netAura >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                          Net: {(pl.lastStatBreakdown as any)?.netAura && (pl.lastStatBreakdown as any).netAura >= 0 ? '+' : ''}
                          {(pl.lastStatBreakdown as any)?.netAura || 0}
                        </span>
                      </div>
                      <div className="space-y-1.5 font-medium text-slate-400">
                        {(pl.lastStatBreakdown as any)?.aura && (pl.lastStatBreakdown as any).aura.length > 0 ? (
                          ((pl.lastStatBreakdown as any).aura as any[]).map((src, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex items-center gap-1">• {src.name}</span>
                              <span className={`font-mono ${src.amount >= 0 ? 'text-purple-400/90' : 'text-red-400/90'}`}>
                                {src.amount >= 0 ? '+' : ''}{src.amount}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 italic">No aura events registered this month.</div>
                        )}
                      </div>
                    </div>

                    {/* Clout Breakdown Section */}
                    <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-blue-400 uppercase tracking-wide">👑 Clout Breakdown</span>
                        <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netClout && (pl.lastStatBreakdown as any).netClout >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          Net: {(pl.lastStatBreakdown as any)?.netClout && (pl.lastStatBreakdown as any).netClout >= 0 ? '+' : ''}
                          {(pl.lastStatBreakdown as any)?.netClout || 0}
                        </span>
                      </div>
                      <div className="space-y-1.5 font-medium text-slate-400">
                        {(pl.lastStatBreakdown as any)?.clout && (pl.lastStatBreakdown as any).clout.length > 0 ? (
                          ((pl.lastStatBreakdown as any).clout as any[]).map((src, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex items-center gap-1">• {src.name}</span>
                              <span className={`font-mono ${src.amount >= 0 ? 'text-blue-400/90' : 'text-red-400/90'}`}>
                                {src.amount >= 0 ? '+' : ''}{src.amount}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 italic">No clout events registered this month.</div>
                        )}
                      </div>
                    </div>

                    {/* Heat Breakdown Section */}
                    <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-orange-400 uppercase tracking-wide">🔥 Heat (WANTED)</span>
                        <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netHeat && (pl.lastStatBreakdown as any).netHeat >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          Net: {(pl.lastStatBreakdown as any)?.netHeat && (pl.lastStatBreakdown as any).netHeat >= 0 ? '+' : ''}
                          {(pl.lastStatBreakdown as any)?.netHeat || 0}%
                        </span>
                      </div>
                      <div className="space-y-1.5 font-medium text-slate-400">
                        {(pl.lastStatBreakdown as any)?.heat && (pl.lastStatBreakdown as any).heat.length > 0 ? (
                          ((pl.lastStatBreakdown as any).heat as any[]).map((src, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex items-center gap-1">• {src.name}</span>
                              <span className={`font-mono ${src.amount >= 0 ? 'text-red-400/90' : 'text-emerald-400/90'}`}>
                                {src.amount >= 0 ? '+' : ''}{src.amount}%
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 italic">No heat events registered this month.</div>
                        )}
                      </div>
                    </div>

                    {/* Mental Health Breakdown Section */}
                    <div className="bg-slate-950/60 p-3.5 border border-slate-800/80 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-slate-200 uppercase tracking-wide">🧠 Mental Health</span>
                        <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netMental && (pl.lastStatBreakdown as any).netMental >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          Net: {(pl.lastStatBreakdown as any)?.netMental && (pl.lastStatBreakdown as any).netMental >= 0 ? '+' : ''}
                          {(pl.lastStatBreakdown as any)?.netMental || 0}%
                        </span>
                      </div>
                      <div className="space-y-1.5 font-medium text-slate-400">
                        {(pl.lastStatBreakdown as any)?.mental && (pl.lastStatBreakdown as any).mental.length > 0 ? (
                          ((pl.lastStatBreakdown as any).mental as any[]).map((src, i) => (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex items-center gap-1">• {src.name}</span>
                              <span className={`font-mono ${src.amount >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}`}>
                                {src.amount >= 0 ? '+' : ''}{src.amount}%
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 italic">No mental health events registered this month.</div>
                        )}
                      </div>
                    </div>

                    {/* Re-Open Monthly Summary */}
                    <div className="border-t border-slate-800 pt-4 shrink-0">
                      <button
                        onClick={() => {
                          setIsStatDrawerOpen(false);
                          setShowMonthlySummary(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold transition-all uppercase text-[9px] tracking-wide"
                      >
                        📋 Re-Open Monthly Summary Report
                      </button>
                    </div>

                    {/* EMPIRE RECOVERY INTERVENTIONS */}
                    <div className="border-t border-slate-800 pt-4 space-y-2.5 shrink-0">
                      <span className="font-black text-slate-400 uppercase tracking-widest text-[9px] block">Empire Tactical Interventions</span>
                      <div className="grid grid-cols-1 gap-2">
                        {pl.heat >= 30 && (
                          <button
                            onClick={() => navigateToHustle('r_ghost_mode', 'MUD')}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold transition-all uppercase text-[9px] tracking-wide"
                          >
                            <span>🔥 High Heat Level ({Math.floor(pl.heat)}%)</span>
                            <span className="flex items-center gap-1 font-black">Play Ghost Mode ➔</span>
                          </button>
                        )}
                        {pl.aura < 50 && (
                          <button
                            onClick={() => navigateToHustle('r_pr_campaign', 'STREET')}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold transition-all uppercase text-[9px] tracking-wide"
                          >
                            <span>✨ Low Aura Standing ({Math.floor(pl.aura)})</span>
                            <span className="flex items-center gap-1 font-black">Run PR Campaign ➔</span>
                          </button>
                        )}
                        {pl.mentalHealth < 50 && (
                          <button
                            onClick={() => navigateToHustle('r_sleep', 'MUD')}
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold transition-all uppercase text-[9px] tracking-wide"
                          >
                            <span>🧠 Mental Exhaustion ({Math.floor(pl.mentalHealth)}%)</span>
                            <span className="flex items-center gap-1 font-black">Rest Now ➔</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="font-black text-slate-400 uppercase tracking-widest text-[9px] block">Active Strategic Modifiers</span>

                    {/* Exhaustion Badge Info */}
                    {pl.mentalHealth < 50 ? (
                      <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-2xl leading-relaxed">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs">💤</span>
                          <span className="font-black text-red-400 uppercase text-[10px]">Exhaustion Penalty Active</span>
                        </div>
                        <p className="text-slate-400">
                          Your Mental Health is critically low (<span className="text-white font-bold">{Math.floor(pl.mentalHealth)}%</span>). All active yields (cash, clout, aura) are cut by up to <span className="text-red-400 font-bold">{Math.round((1 - (0.75 + 0.25 * (pl.mentalHealth / 50))) * 100)}%</span>.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-2xl text-slate-500 text-[10px] italic">
                        💤 Exhaustion is inactive (Mental Health is normal).
                      </div>
                    )}

                    {/* Aura Discount Info */}
                    {pl.aura >= 100 ? (
                      <div className="p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-2xl leading-relaxed">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs">👑</span>
                          <span className="font-black text-purple-300 uppercase text-[10px]">Aura Discount Active</span>
                        </div>
                        <p className="text-slate-400">
                          Your immense Star Aura is commanding (<span className="text-white font-bold">{Math.floor(pl.aura)}</span>). You receive a permanent <span className="text-purple-300 font-bold">10% discount</span> on all Business branch & scaling upgrades!
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-2xl text-slate-500 text-[10px] italic">
                        👑 Aura Discount is inactive (Aura is below 100).
                      </div>
                    )}

                    {/* Public Scrutiny Info */}
                    {pl.heat >= 70 ? (
                      <div className="p-3.5 bg-orange-500/5 border border-orange-500/20 rounded-2xl leading-relaxed">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs">👁️</span>
                          <span className="font-black text-orange-400 uppercase text-[10px]">Public Scrutiny Escalated</span>
                        </div>
                        <p className="text-slate-400">
                          Your legal Wanted Heat is critical (<span className="text-white font-bold">{Math.floor(pl.heat)}%</span>). Police presence is heightened, dramatically multiplying the risk of sudden courtroom raids, arrests, and asset confiscation.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-2xl text-slate-500 text-[10px] italic">
                        👁️ Public Scrutiny is normal (Heat is below 70%).
                      </div>
                    )}

                    {/* Clean Record Info */}
                    {pl.heat === 0 ? (
                      <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl leading-relaxed">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs">🛡️</span>
                          <span className="font-black text-emerald-400 uppercase text-[10px]">Clean Record Bonus Active</span>
                        </div>
                        <p className="text-slate-400">
                          You are running a perfectly clean enterprise (<span className="text-white font-bold">0% Heat</span>). Maintaining a clean wanted record for 6 continuous months will award a massive <span className="text-emerald-400 font-bold">+50 Clout & +50 Aura</span> bonus!
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-2xl text-slate-500 text-[10px] italic">
                        🛡️ Clean Record is inactive (Wanted Heat is currently active).
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Concise Monthly Summary Modal */}
      <AnimatePresence>
        {showMonthlySummary && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Simulation Report</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Operations Overview • Month {pl.month}</p>
                </div>
                <button
                  onClick={() => setShowMonthlySummary(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs rounded-full bg-slate-800 p-1.5 leading-none shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Summary Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 leading-relaxed text-[11px] text-slate-300 animate-fade-in">

                {/* Cash Flow */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="font-black uppercase text-emerald-400">💵 Cash</span>
                    <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(pl.lastStatBreakdown as any)?.netCash >= 0 ? '+' : ''}
                      {((pl.lastStatBreakdown as any)?.netCash || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="pl-2 space-y-1 text-slate-400 font-medium">
                    {(pl.lastStatBreakdown as any)?.cash && (pl.lastStatBreakdown as any).cash.length > 0 ? (
                      ((pl.lastStatBreakdown as any).cash as any[]).map((src, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{src.name}</span>
                          <span className={src.amount >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}>
                            {src.amount >= 0 ? '+' : ''}{src.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="italic text-slate-600">No events</div>
                    )}
                  </div>
                </div>

                {/* Aura */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="font-black uppercase text-purple-400">✨ Aura</span>
                    <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netAura >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                      {(pl.lastStatBreakdown as any)?.netAura >= 0 ? '+' : ''}
                      {(pl.lastStatBreakdown as any)?.netAura || 0}
                    </span>
                  </div>
                  <div className="pl-2 space-y-1 text-slate-400 font-medium">
                    {(pl.lastStatBreakdown as any)?.aura && (pl.lastStatBreakdown as any).aura.length > 0 ? (
                      ((pl.lastStatBreakdown as any).aura as any[]).map((src, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{src.name}</span>
                          <span className={src.amount >= 0 ? 'text-purple-400/90' : 'text-red-400/90'}>
                            {src.amount >= 0 ? '+' : ''}{src.amount}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="italic text-slate-600">No events</div>
                    )}
                  </div>
                </div>

                {/* Clout */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="font-black uppercase text-blue-400">👑 Clout</span>
                    <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netClout >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {(pl.lastStatBreakdown as any)?.netClout >= 0 ? '+' : ''}
                      {(pl.lastStatBreakdown as any)?.netClout || 0}
                    </span>
                  </div>
                  <div className="pl-2 space-y-1 text-slate-400 font-medium">
                    {(pl.lastStatBreakdown as any)?.clout && (pl.lastStatBreakdown as any).clout.length > 0 ? (
                      ((pl.lastStatBreakdown as any).clout as any[]).map((src, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{src.name}</span>
                          <span className={src.amount >= 0 ? 'text-blue-400/90' : 'text-red-400/90'}>
                            {src.amount >= 0 ? '+' : ''}{src.amount}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="italic text-slate-600">No events</div>
                    )}
                  </div>
                </div>

                {/* Heat */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="font-black uppercase text-orange-400">🔥 Heat</span>
                    <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netHeat >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {(pl.lastStatBreakdown as any)?.netHeat >= 0 ? '+' : ''}
                      {(pl.lastStatBreakdown as any)?.netHeat || 0}%
                    </span>
                  </div>
                  <div className="pl-2 space-y-1 text-slate-400 font-medium">
                    {(pl.lastStatBreakdown as any)?.heat && (pl.lastStatBreakdown as any).heat.length > 0 ? (
                      ((pl.lastStatBreakdown as any).heat as any[]).map((src, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{src.name}</span>
                          <span className={src.amount >= 0 ? 'text-red-400/90' : 'text-emerald-400/90'}>
                            {src.amount >= 0 ? '+' : ''}{src.amount}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="italic text-slate-600">No events</div>
                    )}
                  </div>
                </div>

                {/* Mental Health */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="font-black uppercase text-slate-200">🧠 Mental Health</span>
                    <span className={`font-mono font-bold ${(pl.lastStatBreakdown as any)?.netMental >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(pl.lastStatBreakdown as any)?.netMental >= 0 ? '+' : ''}
                      {(pl.lastStatBreakdown as any)?.netMental || 0}%
                    </span>
                  </div>
                  <div className="pl-2 space-y-1 text-slate-400 font-medium">
                    {(pl.lastStatBreakdown as any)?.mental && (pl.lastStatBreakdown as any).mental.length > 0 ? (
                      ((pl.lastStatBreakdown as any).mental as any[]).map((src, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{src.name}</span>
                          <span className={src.amount >= 0 ? 'text-emerald-400/90' : 'text-red-400/90'}>
                            {src.amount >= 0 ? '+' : ''}{src.amount}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="italic text-slate-600">No events</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end shrink-0">
                <button
                  onClick={() => setShowMonthlySummary(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-wider transition-colors shadow-lg"
                >
                  Continue Operations
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* News Ticker */}
      <NewsTicker news={news} currentTier={pl.currentTier} />

      {pl.pendingAnnualStatement && (
        <AnnualStatement
          onDismiss={() => {
            const nextStartDimensions = evaluateIdentityDimensions(pl);
            const nextStartNetWorth = calculateNetWorth(pl);
            const updatedFlags = {
              ...(pl.narrativeFlags || {}),
              year_start_bag: pl.bag,
              year_start_net_worth: nextStartNetWorth,
              year_start_clout: pl.clout,
              year_start_aura: pl.aura,
              year_start_tier: pl.currentTier,
              year_start_reputation: (pl.narrativeFlags?.publicReputation as string) || 'The Hustler',
              year_start_dimensions: JSON.stringify(nextStartDimensions),
              annualPassiveEarned: 0,
              annualPassiveSpent: 0,
            };

            useGameStore.getState().updatePl({
              pendingAnnualStatement: false,
              annualCashEarned: 0,
              annualCashSpent: 0,
              annualHustlesRun: 0,
              narrativeFlags: updatedFlags,
            });
          }}
        />
      )}

      {pl.pendingFlexOffer && (
        <FlexOpportunityModal
          threshold={pl.pendingFlexOffer}
          onDismiss={() =>
            useGameStore.getState().updatePl({
              pendingFlexOffer: null
            })
          }
        />
      )}

      {pl.pendingTermEnd && (
        <PresidentialTermEnd
          onContinue={() => {
            useGameStore.getState().updatePl({
              pendingTermEnd: false,
              currentTier: 'OPEN'
            });
            useGameStore.getState().setActiveTab('OPEN');
          }}
        />
      )}
    </div>
  );
}

export default App;
