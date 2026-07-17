import { useEffect, useState, useReducer, useMemo, useRef, lazy, Suspense } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './store/gameStore';
import { completeConcertPerformanceWithLineup } from './store/slices/hustleSlice';
import { useSafariCompatible } from './hooks/useSafariCompatible';
import { debounce } from './utils/performance';
import { NavTabs } from './components/NavTabs';
import { HustleCard } from './components/HustleCard';
import { BranchChoice } from './components/BranchChoice';
import { FlexMarket } from './components/FlexMarket';
import { NewsTicker } from './components/NewsTicker';
import { PrologueScreen } from './components/PrologueScreen';
import { DeathScreen } from './components/DeathScreen';
import { AnimatePresence } from 'framer-motion';
import { CinematicTransition } from './components/effects/CinematicTransition';
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
const SignSpinner = lazy(() => import('./components/minigames/SignSpinner').then(m => ({ default: m.SignSpinner })));
const ReviewFarm = lazy(() => import('./components/minigames/ReviewFarm').then(m => ({ default: m.ReviewFarm })));
const ConcertJam = lazy(() => import('./components/minigames/ConcertJam').then(m => ({ default: m.ConcertJam })));

// Thematic Wrappers
const FestivalCrowdSurge = lazy(() => import('./components/hustles/panels/FestivalCrowdSurge').then(m => ({ default: m.FestivalCrowdSurge })));
const CryptoMineRush = lazy(() => import('./components/hustles/panels/CryptoMineRush').then(m => ({ default: m.CryptoMineRush })));
const PodcastFlowState = lazy(() => import('./components/hustles/panels/PodcastFlowState').then(m => ({ default: m.PodcastFlowState })));
const VCPitchRoom = lazy(() => import('./components/hustles/panels/VCPitchRoom').then(m => ({ default: m.VCPitchRoom })));

import { RivalLeaderboard } from './components/RivalLeaderboard';
import { Scoreboard } from './components/Scoreboard';
import { SpecializationModal } from './components/SpecializationModal';
import { NarrativeEventModal } from './components/NarrativeEventModal';
import { LiveWorldEventModal } from './components/LiveWorldEventModal';
import { InteractiveStoryModal } from './components/InteractiveStoryModal';
import { EndgameSummary } from './components/EndgameSummary';
import { StrategicAdvisorModal } from './components/StrategicAdvisorModal';
import { AdvisorMentorModal } from './components/AdvisorMentorModal';

// Heavy Screens
const HallOfFame = lazy(() => import('./components/HallOfFame').then(m => ({ default: m.HallOfFame })));
const LegacyShop = lazy(() => import('./components/LegacyShop').then(m => ({ default: m.LegacyShop })));
const PresidentDashboard = lazy(() => import('./components/PresidentDashboard').then(m => ({ default: m.PresidentDashboard })));

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
import { RestPanel } from './components/panels/RestPanel';
import { PresidentialTermEnd } from './components/PresidentialTermEnd';
import { MinigameLoader } from './components/ui/MinigameLoader';
import { PremiumLoader } from './components/ui/PremiumLoader';
import { saveHallOfFameEntry } from './utils/hallOfFame';
import { getEnding } from './config/endings';
import { getDominantStat } from './utils/endingUtils';
import { HUSTLES } from './config/hustles/base';
import { LEVEL_MULTIPLIERS } from './engine/mathEngine';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from './config/tiers';
import { MARKET_CONFIGS } from './config/marketConfig';
import type { Tier, AppTab } from './types/game';

const renderHustlePanel = (panelType: string, currentLevel: number, handleGameFinished: (result: any) => void) => {
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
          case 'TALENT_AGENT_GAME':
            return <ClickbaitGame level={currentLevel} onComplete={handleGameFinished} />;

          case 'SIGN_SPINNER_GAME':
            return <SignSpinner level={currentLevel} onComplete={handleGameFinished} />;

          case 'REVIEW_FARM_GAME':
            return <ReviewFarm level={currentLevel} onComplete={handleGameFinished} />;

          case 'CONCERT_JAM_GAME':
            return <ConcertJam level={currentLevel} onComplete={handleGameFinished} />;

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

const TIER_ONBOARDING_DATA: Record<string, {
  title: string;
  subtitle: string;
  bullets: string[];
  tabToOpen: 'ALL' | 'CRITICAL' | 'IMPORTANT' | 'OPPORTUNITIES' | 'INFO' | 'AMBITIONS' | 'HISTORY' | 'REPUTATION';
}> = {
  STREET: {
    title: 'WELCOME TO STREET',
    subtitle: "You're no longer surviving. You're beginning to build.",
    bullets: [
      'Buy your first passive income asset (Vending Machines or Rent Portfolio).',
      'Rivals are becoming more active on the Leaderboard.',
      'Reputation now matters more; your actions shift public perception.'
    ],
    tabToOpen: 'OPPORTUNITIES'
  },
  STARTUP: {
    title: 'WELCOME TO STARTUP',
    subtitle: "Incorporated and ready. You're entering the real business arena.",
    bullets: [
      'Launch scalable high-growth tech startup hustles.',
      'Hire corporate employees and automate your business for passive cash flow.',
      'Rivals are scaling their net worths rapidly—monitor their market moves.'
    ],
    tabToOpen: 'OPPORTUNITIES'
  },
  CORPORATE: {
    title: 'WELCOME TO CORPORATE',
    subtitle: "Institutional compliance, polished suits, and serious leverage.",
    bullets: [
      'Expand into massive financial, tech, or media corporations.',
      'Manage high-ticket media empires or film studios to control public relation slates.',
      'Earn substantial Clout to bypass high-tier advancement tax requirements.'
    ],
    tabToOpen: 'REPUTATION'
  },
  ELITE: {
    title: 'WELCOME TO ELITE',
    subtitle: "Sovereign wealth and global syndicates. The air is extremely thin up here.",
    bullets: [
      'Balance extreme active heat contracts with high-end luxury flex assets.',
      'Acquire premium corporate holdings and sovereign passive assets.',
      'Protect your assets from hostile rival counter-bids on the Leaderboard.'
    ],
    tabToOpen: 'AMBITIONS'
  },
  MOGUL: {
    title: 'WELCOME TO MOGUL',
    subtitle: "The peak of commercial power. Every sector answers to your empire.",
    bullets: [
      'Liquidate massive assets to prep the ultimate presidential campaign trail.',
      'Fund strategic political PACs to ease congressional fundraising costs.',
      'Acknowledge and fulfill remaining life ambitions to lock in final meta-legacy points.'
    ],
    tabToOpen: 'AMBITIONS'
  },
  PRESIDENT: {
    title: 'WELCOME TO THE OVAL OFFICE',
    subtitle: "Commander-in-Chief. You control the government cabinet and nation's policy.",
    bullets: [
      'Keep macro GDP, Inflation, and National Debt indicators stabilized.',
      'Fire corrupt cabinet members to shield your administration from massive scandals.',
      'Build congressional support to pass major executive orders and reforms.'
    ],
    tabToOpen: 'CRITICAL'
  },
  OPEN: {
    title: 'WELCOME TO THE OPEN ERA',
    subtitle: "Absolute transcendence. You have broken past the mortal constraints of the grind.",
    bullets: [
      'Amass infinite passive wealth with zero tier restrictions.',
      'Fulfill supreme legacy milestones to maximize Hall of Fame rankings.',
      'Master every remaining business branch to seal your immortal footprint.'
    ],
    tabToOpen: 'AMBITIONS'
  }
};

const checkAdvisorTriggers = (pl: any, currentMarket: string) => {
  if (!pl || !pl.narrativeFlags) return null;

  // A. FIRST EMPLOYEE HIRED (Leadership & delegation)
  if (pl.narrativeFlags.just_hired_employee && !pl.narrativeFlags.advisor_shown_first_employee) {
    return {
      id: 'advisor_shown_first_employee',
      title: '👥 THE POWER OF DELEGATION',
      subtitle: 'You have hired your very first employee! Corporate leadership is about leveraging other people\'s time while you focus on macro strategy.',
      bullets: [
        'Hiring employees automates manual labor, paving the path to scalable passive cash flow.',
        'Keep scaling your businesses by upgrading their levels to generate higher passive and active returns.',
        'Be mindful of your monthly overheads and maintain healthy capital buffers.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_hired_employee: false,
            advisor_shown_first_employee: true
          }
        });
      }
    };
  }

  // B. DONATE TO CHARITY (Charitable Halo / Suggest break)
  if (pl.narrativeFlags.just_donated_charity && !pl.narrativeFlags.advisor_shown_charity) {
    return {
      id: 'advisor_shown_charity',
      title: '🕊️ THE HALO OF GENEROSITY',
      subtitle: 'Your significant charitable contribution has established incredible public goodwill. To maximize your efficiency, the Advisor suggests taking a well-earned break.',
      bullets: [
        'A local public relations halo is forming, shielding you from minor Heat spikes.',
        'Your mind and body need recuperation after such a massive deployment of capital.',
        'Take a rest protocol now to claim a small, temporary recovery bonus (+10 MH on your next rest).'
      ],
      ctaLabel: 'Open Recovery Deck',
      onTakeMeThereCustom: (store: any) => {
        const currentTier = store.pl.currentTier;
        let recoveryHustle = 'r_sleep';
        if (currentTier === 'STREET') recoveryHustle = 'power_nap';
        else if (currentTier === 'STARTUP') recoveryHustle = 'therapy_session';
        else if (currentTier === 'CORPORATE') recoveryHustle = 'wellness_retreat';
        else if (currentTier !== 'MUD') recoveryHustle = 'psychiatrist';

        store.setActiveHustleView(recoveryHustle);
        store.setShowMinigame(false);
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_donated_charity: false,
            advisor_shown_charity: true,
            charity_recovery_bonus: true
          }
        });
      },
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_donated_charity: false,
            advisor_shown_charity: true,
            charity_recovery_bonus: true
          }
        });
      }
    };
  }

  // C. PURCHASE INSIDER INFORMATION
  if (pl.narrativeFlags.just_bought_insider && !pl.narrativeFlags.advisor_shown_insider) {
    return {
      id: 'advisor_shown_insider',
      title: '📈 INSIDER OPPORTUNITY SECURED',
      subtitle: 'Your purchase of insider information from Cassie has positioned you perfectly. The Advisor suggests checking high-tier business expansions.',
      bullets: [
        'The shipping merger details Cassie shared are highly lucrative, adding $25,000 monthly passive income.',
        'Use this momentum to look into other high-tier corporate ventures or real estate investments.',
        'Maintain absolute discretion to avoid drawing regulatory antitrust investigations.'
      ],
      ctaLabel: 'Review Businesses',
      onTakeMeThereCustom: (store: any) => {
        const currentTier = store.pl.currentTier;
        const targetTab = (currentTier === 'STREET' || currentTier === 'STARTUP') ? 'STARTUP' : 'ELITE';
        store.setActiveTab(targetTab);
        if (targetTab === 'ELITE') {
          store.setActiveHustleView('venture_capital');
        } else {
          store.setActiveHustleView('saas_mvp');
        }
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_bought_insider: false,
            advisor_shown_insider: true
          }
        });
      },
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_bought_insider: false,
            advisor_shown_insider: true
          }
        });
      }
    };
  }

  // D. ENROLLED IN UNIVERSITY
  if (pl.narrativeFlags.just_accepted_university && !pl.narrativeFlags.advisor_shown_university) {
    return {
      id: 'advisor_shown_university',
      title: '🎓 IVY LEAGUE ACADEMIC PRESTIGE',
      subtitle: 'Your acceptance into the Ivy League business program provides phenomenal long-term benefits and credentials.',
      bullets: [
        'Academic credentials amplify your Clout and build prestigious networking rings.',
        'Your profile as an educated, structured leader makes you highly attractive for board memberships.',
        'Review your strategic opportunities to see how this credential influences your campaign or ventures.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
      onCloseExtra: (store: any) => {
        store.updatePl({
          narrativeFlags: {
            ...store.pl.narrativeFlags,
            just_accepted_university: false,
            advisor_shown_university: true
          }
        });
      }
    };
  }

  // 1. HIGH HEAT
  if (pl.heat > 75 && !pl.narrativeFlags.advisor_shown_high_heat) {
    return {
      id: 'advisor_shown_high_heat',
      title: '🚨 CRITICAL HEAT WARNING',
      subtitle: 'The watchdogs and local precinct have built a massive profile on your operations.',
      bullets: [
        'Your Heat is dangerously high (> 75%).',
        'Failing active checks right now is almost guaranteed to result in immediate arrest and heavy prison sentences.',
        'Run "Ghost Mode" or Rest/Recover to cool down compliance review levels immediately.'
      ],
      tabToOpen: 'CRITICAL' as const,
    };
  }

  // 2. VERY LOW MENTAL HEALTH
  if (pl.mentalHealth < 30 && !pl.narrativeFlags.advisor_shown_low_mental_health) {
    return {
      id: 'advisor_shown_low_mental_health',
      title: '🧠 PSYCHOLOGICAL CRITICAL LIMIT',
      subtitle: 'Your mind is completely depleted. Burnout is imminent.',
      bullets: [
        'All active yields (cash, clout, aura) are cut by up to 25% due to severe exhaustion.',
        'High stress triggers careless mistakes, leading to direct financial losses and massive Heat spikes.',
        'Navigate to Rest & Recover immediately to play zero-risk therapeutic minigames.'
      ],
      tabToOpen: 'CRITICAL' as const,
    };
  }

  // 3. FIRST PASSIVE INCOME
  const finalPassiveTotal = pl.lastPassiveBreakdown?.finalTotal || 0;
  if (finalPassiveTotal > 0 && !pl.narrativeFlags.advisor_shown_first_passive) {
    return {
      id: 'advisor_shown_first_passive',
      title: '💸 FIRST PASSIVE REVENUE SECURED',
      subtitle: 'A major milestone. You have unlocked steady baseline passive income.',
      bullets: [
        'Your assets are now generating wealth for you every single month.',
        'Reinvest this passive yield into expanding rent portfolios or vending networks.',
        'Diversify across sectors to cushion against market recession cycles.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
    };
  }

  // 4. FIRST BUSINESS
  const activeHustleKeys = Object.keys(pl.hustleLevels || {});
  if (activeHustleKeys.length > 0 && !pl.narrativeFlags.advisor_shown_first_business) {
    return {
      id: 'advisor_shown_first_business',
      title: '🏢 FIRST BUSINESS ENTERPRISE',
      subtitle: 'You are officially an operator. Your business is live and running.',
      bullets: [
        'Execute active operations on this business to gain cash, clout, and aura.',
        'Unlock permanent mastery crowns or badges by executing the same hustle at least 20 times.',
        'Level up and upgrade the hustle branches to scale your active and passive output.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
    };
  }

  // 5. FIRST RIVAL
  if (pl.rivals && pl.rivals.length > 0 && !pl.narrativeFlags.advisor_shown_first_rival) {
    return {
      id: 'advisor_shown_first_rival',
      title: '🔥 COMPETITIVE THREAT: RIVALS ACTIVE',
      subtitle: 'An aggressive competitor has entered your local market sectors.',
      bullets: [
        'Rivals will actively buy real estate, expand industries, and launch bids on your holdings.',
        'You can view their personality metrics, aggressive bids, and relationships on the Leaderboard.',
        'Counter-bid to protect your local positions, launch corporate sabotage, or trigger deep retaliations.'
      ],
      tabToOpen: 'CRITICAL' as const,
    };
  }

  // 6. FIRST MILLION
  if (pl.bag >= 1000000 && !pl.narrativeFlags.advisor_shown_first_million) {
    return {
      id: 'advisor_shown_first_million',
      title: '🪙 LIQUID MILLIONAIRE STATUS',
      subtitle: 'One million dollars. You have broken through into high-society capital.',
      bullets: [
        'You possess the critical liquidity required for institutional investments.',
        'Prioritize premium real estate portfolios or high-tier corporate specializations.',
        'Fund larger-scale marketing campaigns to multiply your national Clout footprint.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
    };
  }

  // 7. CRIME BECOMING DANGEROUS
  if (pl.heat > 55 && !pl.narrativeFlags.advisor_shown_dangerous_crime) {
    return {
      id: 'advisor_shown_dangerous_crime',
      title: '⚖️ LAW ENFORCEMENT AUDIT IMMINENT',
      subtitle: 'Your active street footprint is drawing high compliance reviewing.',
      bullets: [
        'Heat above 50% significantly increases the risk of random police audits.',
        'Stealth operations and shady deal active gigs accumulate heat rapidly.',
        'Consider cooling down your heat signature before attempting high-stakes challenges.'
      ],
      tabToOpen: 'CRITICAL' as const,
    };
  }

  // 8. HOUSING PROTEST BEGINNING
  const isHousingCrisisActive = pl.consequences?.some((c: any) => c.source === 'housing_affordability_crisis' && c.status === 'active');
  const isLandlordEmpire = (pl.rentPortfolioCount || 0) >= 5 || (pl.rentalCount || 0) >= 3;
  if ((isHousingCrisisActive || isLandlordEmpire) && !pl.narrativeFlags.advisor_shown_housing_protest) {
    return {
      id: 'advisor_shown_housing_protest',
      title: '🏠 HOUSING AFFORDABILITY PROTESTS',
      subtitle: 'Tenant unions are organizing strikes against rapid rent capitalization.',
      bullets: [
        'Your monopolized real estate expansion has drawn severe local backlash.',
        'This triggers rent cap policies and docks passive rent yields by up to 30%.',
        'Prepare to pass legislative executive orders or allocate community philanthropy to restore peace.'
      ],
      tabToOpen: 'REPUTATION' as const,
    };
  }

  // 9. ECONOMY COLLAPSING
  if (currentMarket === 'RECESSION' && !pl.narrativeFlags.advisor_shown_economy_collapse) {
    return {
      id: 'advisor_shown_economy_collapse',
      title: '📉 ECONOMIC RECESSION CYCLE ACTIVE',
      subtitle: 'The macroeconomic markets are in a severe contraction phase.',
      bullets: [
        'Consumer spending and corporate yields are heavily suppressed.',
        'Focus on preserving liquid cash and prioritizing lower-overhead passive operations.',
        'Avoid launching expensive campaign stages until standard cycles stabilize.'
      ],
      tabToOpen: 'OPPORTUNITIES' as const,
    };
  }

  return null;
};

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
    title: string;
    subtitle: string;
    bullets?: string[];
    ctaLabel?: string;
    tabToOpen?: 'ALL' | 'CRITICAL' | 'IMPORTANT' | 'OPPORTUNITIES' | 'INFO' | 'AMBITIONS' | 'HISTORY' | 'REPUTATION';
    onTakeMeThereCustom?: (store: any) => void;
    onCloseExtra?: (store: any) => void;
  } | null>(null);

  const prevTierRef = useRef<string | null>(null);

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
  } = useGameStore();

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

      setActiveAdvisorPrompt(nextPrompt);
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
              setActiveAdvisorPrompt(promptObj);
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

    const matchedTrigger = checkAdvisorTriggers(pl, currentMarket);
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
          setActiveAdvisorPrompt(promptObj);
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

  const currentTierIndex = useMemo(() => pl ? PROGRESSION_ORDER.indexOf(pl.currentTier) : -1, [pl]);

  const canAdvance = useMemo(() => {
    if (!pl) return false;
    const nextTier = PROGRESSION_ORDER[currentTierIndex + 1];
    if (!nextTier) return false;
    const req = TIER_REQUIREMENTS[nextTier];
    return pl.bag >= req.cash && pl.clout >= req.clout && pl.aura >= req.aura;
  }, [pl, currentTierIndex]);

  // Automatically save to Hall of Fame when entering post-mortem
  useEffect(() => {
    if (ph === 'POST_MORTEM' && pl?.runId) {
      const saveKey = `bc_run_saved_${pl.runId}`;
      if (!sessionStorage.getItem(saveKey)) {
        const finalStat = getDominantStat(pl);
        const ending = getEnding(pl.legacyScore || 0, finalStat);

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
    <div className={`min-h-screen ${tierClass} text-white pb-16 transition-colors duration-1000 relative`}>
      {activeMinigame && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {renderHustlePanel(activeMinigame.panelType, activeMinigame.level, (win) => {
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

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-4 py-2">
        <div className="max-w-md mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div>RANK: <span className="text-white">{pl.currentTier}</span></div>
          {pl.activeSentiment ? (
            <div className={`animate-pulse ${pl.activeSentiment.multiplier > 1 ? 'text-emerald-400' : 'text-red-400'}`}>
              📰 {pl.activeSentiment.label} ({pl.activeSentiment.monthsRemaining}m)
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Avatar
                avatarId={pl.avatarId || 'av_m1'}
                size={22}
                ring="ring-emerald-500/50"
              />
              <span className="text-white font-black
                text-[10px]">{pl.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {MARKET_CONFIGS[currentMarket].icon} <span className="text-white">{MARKET_CONFIGS[currentMarket].name}</span>
          </div>
          <div>AGE: <span className="text-white">{ageYears}y {ageMonths}m</span></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="sticky top-[33px] z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 px-4 py-2">
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
              <button
                onClick={() => setShowPhoneFeed(true)}
                className="text-[9px] bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-2 py-1 rounded font-bold transition-colors uppercase tracking-tighter border border-indigo-500/20 flex items-center gap-1"
              >
                📱 Feed
              </button>
              <button
                onClick={() => setShowAdvisor(true)}
                className="text-[9px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-2 py-1 rounded font-bold transition-colors uppercase tracking-tighter border border-emerald-500/20 flex items-center gap-1"
              >
                🧠 Advisor
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="flex flex-col group relative cursor-help">
              <span className="text-[8px] text-slate-500 uppercase">Clout</span>
              <span id="clout-stat" className={`text-xs font-bold ${pl.clout < 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {Math.floor(pl.clout)}{pl.clout < 5 && '!'}
              </span>
              <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl text-left leading-relaxed">
                <span className="font-black text-blue-400 uppercase block mb-1">👑 Clout (Influence)</span>
                Represents your public reach, street rep, and political sway. Reaching the max allows tier promotions. Failing active checks reduces your fame.
              </div>
            </div>
            <div className="flex flex-col group relative cursor-help">
              <span className="text-[8px] text-slate-500 uppercase">Mental</span>
              <span id="mental-stat" className={`text-xs font-bold ${pl.mentalHealth < 30 ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(pl.mentalHealth)}%
                {pl.mentalShieldTurns > 0 && (
                  <span className="text-blue-400 ml-0.5 text-[10px]">🛡️{pl.mentalShieldTurns}</span>
                )}
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl text-left leading-relaxed">
                <span className="font-black text-red-400 uppercase block mb-1">🧠 Mental Health</span>
                Your psychological capacity. Exhausting work drains your mental health. Reaching <span className="font-black text-red-500">0% causes burnout (Death)</span>. Restore it via sleep/recreation.
              </div>
            </div>
            <div className="flex flex-col group relative cursor-help">
              <span className="text-[8px] text-slate-500 uppercase">Aura</span>
              <span id="aura-stat" className={`text-xs font-bold ${pl.aura < 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                {Math.floor(pl.aura)}{pl.aura < 5 && '!'}
              </span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl text-left leading-relaxed">
                <span className="font-black text-purple-400 uppercase block mb-1">✨ Aura (Mystique)</span>
                Represents your personal presence, charisma, and star power. Necessary for massive negotiations, business deals, and general respect.
              </div>
            </div>
            <div className="flex flex-col group relative cursor-help">
              <span className="text-[8px] text-slate-500 uppercase">Heat</span>
              <span id="heat-stat" className={`text-xs font-bold ${pl.heat > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                {Math.floor(pl.heat)}%
              </span>
              <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl text-left leading-relaxed">
                <span className="font-black text-orange-400 uppercase block mb-1">🔥 Heat (WANTED)</span>
                Represents law enforcement attention. High heat triggers sudden raids, arrests, and prison time. Use Ghost Mode to lay low and cool down.
              </div>
            </div>
          </div>
        </div>
      </div>

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
                if (activeMiniGame === 'RiskMeter') return <RiskMeter onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
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
                if (activeMiniGame === 'SignSpinner' || activeMiniGame === 'SIGN_SPINNER_GAME') return <SignSpinner onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;
                if (activeMiniGame === 'ReviewFarm' || activeMiniGame === 'REVIEW_FARM_GAME') return <ReviewFarm onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;
                if (activeMiniGame === 'ConcertJam' || activeMiniGame === 'CONCERT_JAM_GAME') return <ConcertJam onComplete={(win) => onComplete(win ? 1.5 : 0.5)} level={hustleLevel} />;

                // Fallback for unknown minigames
                return <SimpleFallback name={activeMiniGame} onComplete={onComplete} level={hustleLevel} tier={pl.currentTier} />;
                };

                return (
                  <Suspense fallback={<MinigameLoader icon={hustle.icon} name={hustle.name} />}>
                    {renderMinigame()}
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
                  return <FestivalPanel hustle={hustle} onExecute={() => setShowMinigame(true)} />;
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
                if (hustle.panelType === 'VENTURE_CAPITAL') {
                  return <VCPanel hustle={hustle} onExecute={() => setShowMinigame(true)} />;
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
                  return renderHustlePanel(hustle.panelType!, hustleLevel, (win) => {
                    const multiplier = win ? 1.5 : 0.5;
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

      {/* Receipts Modal */}
      {showReceipts && (
        <TheReceipts onClose={() => setShowReceipts(false)} />
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
          ].filter(s => s.value !== 0)}
          onDismiss={() => {
            setActiveHustleResult(null);
            setActiveHustleView(null);
          }}
        />
      )}

      {showScoreboard && <Scoreboard onClose={() => setShowScoreboard(false)} />}
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
      <NarrativeEventModal />
      <LiveWorldEventModal />
      <InteractiveStoryModal />

      {/* News Ticker */}
      <NewsTicker news={news} currentTier={pl.currentTier} />

      {pl.pendingAnnualStatement && (
        <AnnualStatement
          onDismiss={() =>
            useGameStore.getState().updatePl({
              pendingAnnualStatement: false,
              annualCashEarned: 0,
              annualCashSpent: 0,
              annualHustlesRun: 0,
            })
          }
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
          onContinue={() =>
            useGameStore.getState().updatePl({
              pendingTermEnd: false,
              currentTier: 'OPEN'
            })
          }
        />
      )}
    </div>
  );
}

export default App;
