import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { NavTabs } from './components/NavTabs';
import { HustleCard } from './components/HustleCard';
import { BranchChoice } from './components/BranchChoice';
import { FlexMarket } from './components/FlexMarket';
import { NewsTicker } from './components/NewsTicker';
import { PrologueScreen } from './components/PrologueScreen';
import { DeathScreen } from './components/DeathScreen';
import { TheReceipts } from './components/TheReceipts';
import { HUSTLES } from './config/hustles/base';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from './config/tiers';
import { MARKET_CONFIGS } from './config/marketConfig';
import type { Tier } from './types/game';

function App() {
  const {
    pl,
    ph,
    currentMarket,
    news,
    activeTab,
    activeHustleView,
    deathBadge,
    fatalCause,
    executeHustle,
    executeBranch,
    upgradeHustle,
    advanceTier,
    setActiveTab,
    setActiveHustleView,
    setPlayerName,
    resetGame,
  } = useGameStore();

  const [displayedCash, setDisplayedCash] = useState(pl?.bag || 0);
  const [cashSplash, setCashSplash] = useState<{ text: string; isWin: boolean } | null>(null);
  const [showReceipts, setShowReceipts] = useState(false);

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

  // Prologue screen
  if (ph === 'PROLOGUE') {
    return (
      <PrologueScreen
        onStart={(name, difficulty) => {
          resetGame(difficulty);
          setPlayerName(name);
        }}
      />
    );
  }

  // Death screen
  if (ph === 'POST_MORTEM') {
    return (
      <DeathScreen
        deathBadge={deathBadge}
        fatalCause={fatalCause}
        lastHustleId={pl?.lastExecutedHustleId}
        onReset={() => {
          resetGame();
          window.location.reload();
        }}
      />
    );
  }

  // Main game
  const currentTierIndex = PROGRESSION_ORDER.indexOf(pl.currentTier);
  const canAdvance = (() => {
    const nextTier = PROGRESSION_ORDER[currentTierIndex + 1];
    if (!nextTier) return false;
    const req = TIER_REQUIREMENTS[nextTier];
    return pl.bag >= req.cash && pl.clout >= req.clout && pl.aura >= req.aura;
  })();

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

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
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
          <div>OP: <span className="text-white">{pl.name}</span></div>
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
            <div className="text-2xl font-black text-emerald-400 font-mono leading-none">
              ${pl.bag.toLocaleString()}
            </div>
            <button
              onClick={() => setShowReceipts(true)}
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded font-bold transition-colors uppercase tracking-tighter"
            >
              Receipts
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Clout</span>
              <span className={`text-xs font-bold ${pl.clout < 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {pl.clout}{pl.clout < 5 && '!'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Mental</span>
              <span className={`text-xs font-bold ${pl.mentalHealth < 30 ? 'text-red-500' : 'text-white'}`}>
                {pl.mentalHealth}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Aura</span>
              <span className={`text-xs font-bold ${pl.aura < 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                {pl.aura}{pl.aura < 5 && '!'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Heat</span>
              <span className={`text-xs font-bold ${pl.heat > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                {pl.heat}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NavTabs activeTab={activeTab} currentTier={pl.currentTier} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-4 pb-24">
        {/* Advance Tier Button */}
        {canAdvance && activeTab !== 'FLEX' && (
          <button
            onClick={() => advanceTier()}
            className="w-full mb-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            ⚡ ADVANCE TO NEXT TIER ⚡
          </button>
        )}

        {/* Flex Market */}
        {showFlexMarket && <FlexMarket />}

        {/* Hustle Grid */}
        {!showFlexMarket && (
          <div className="grid grid-cols-2 gap-3">
            {hustles.map((hustle) => (
              <button
                key={hustle.id}
                onClick={() => setActiveHustleView(hustle.id)}
                className="bg-slate-900 rounded-xl p-4 text-center border border-slate-800 transition-all hover:border-slate-700 active:scale-95"
              >
                <div className="text-4xl mb-2">{hustle.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">
                  {hustle.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No hustles message */}
        {!showFlexMarket && hustles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-600 text-sm">No hustles available in {activeTab} tier yet.</div>
            <div className="text-slate-700 text-xs mt-2">Advance from lower tiers to unlock more.</div>
          </div>
        )}
      </div>

      {/* Detailed Hustle Panel */}
      {activeHustleView && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-6 animate-in fade-in zoom-in duration-200">
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <button
              onClick={() => setActiveHustleView(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white text-2xl"
            >
              ✕
            </button>
            {(() => {
              const hustle = HUSTLES[activeHustleView];
              if (!hustle) return null;

              const currentBranchId = pl.hustleBranchIds[hustle.id] || hustle.startBranchId;
              const hasBranches = !!hustle.branches && !!currentBranchId;
              const currentBranch = hasBranches ? hustle.branches![currentBranchId] : null;
              const hasNextBranches = currentBranch?.nextBranches && currentBranch.nextBranches.length > 0;

              if (hasNextBranches) {
                return (
                  <BranchChoice
                    hustle={hustle}
                    currentBranchId={currentBranchId!}
                    onSelectBranch={(branchId) => executeBranch(hustle.id, branchId)}
                    onExecute={() => {
                      executeHustle(hustle.id);
                      setActiveHustleView(null);
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
                    executeHustle(hustle.id);
                    setActiveHustleView(null);
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
        </div>
      )}

      {/* Receipts Modal */}
      {showReceipts && (
        <TheReceipts onClose={() => setShowReceipts(false)} />
      )}

      {/* News Ticker */}
      <NewsTicker news={news} />
    </div>
  );
}

export default App;
