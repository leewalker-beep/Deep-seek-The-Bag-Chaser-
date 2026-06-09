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
import { StatsPanel } from './components/StatsPanel';
import { SwipeOrder } from './components/minigames/SwipeOrder';
import { TapRhythm } from './components/minigames/TapRhythm';
import { DragScale } from './components/minigames/DragScale';
import { TapAssign } from './components/minigames/TapAssign';
import { HoldHype } from './components/minigames/HoldHype';
import { MagneticSweep } from './components/minigames/MagneticSweep';
import { BigWinCelebration } from './components/effects/BigWinCelebration';
import { RewardCard } from './components/effects/RewardCard';
import { MusicProductionPanel } from './components/panels/MusicProductionPanel';
import { HUSTLES } from './config/hustles/base';
import { LEVEL_MULTIPLIERS } from './engine/mathEngine';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from './config/tiers';
import { MARKET_CONFIGS } from './config/marketConfig';
import type { Tier } from './types/game';

function App() {
  const [showMinigame, setShowMinigame] = useState(false);

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
  const [bigWin, setBigWin] = useState<{ amount: number } | null>(null);
  const [magneticSweepResult, setMagneticSweepResult] = useState<{
    hustleId: string;
    earned: number;
    speedMult: number;
    outcomeMult: number;
    isRare: boolean;
    baseYield: number;
  } | null>(null);

  useEffect(() => {
    document.body.className = pl.currentTier.toLowerCase();
  }, [pl.currentTier]);

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

  const tierClass = `${pl.currentTier.toLowerCase()}-tier`;

  return (
    <div className={`min-h-screen ${tierClass} text-white pb-16 transition-colors duration-1000`}>
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
            <div id="bag-amount" className="text-2xl font-black text-emerald-400 font-mono leading-none">
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
              <span id="clout-stat" className={`text-xs font-bold ${pl.clout < 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {Math.round(pl.clout)}{pl.clout < 5 && '!'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Mental</span>
              <span id="mental-stat" className={`text-xs font-bold ${pl.mentalHealth < 30 ? 'text-red-500' : 'text-white'}`}>
                {pl.mentalHealth}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Aura</span>
              <span id="aura-stat" className={`text-xs font-bold ${pl.aura < 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                {Math.round(pl.aura)}{pl.aura < 5 && '!'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase">Heat</span>
              <span id="heat-stat" className={`text-xs font-bold ${pl.heat > 70 ? 'text-red-500' : 'text-orange-400'}`}>
                {pl.heat}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NavTabs
        activeTab={activeTab}
        currentTier={pl.currentTier}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setShowMinigame(false);
        }}
      />

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-4 pb-24">
        {!activeHustleView ? (
          <>
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
                    onClick={() => {
                      setActiveHustleView(hustle.id);
                      setShowMinigame(false);
                    }}
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

              if (showMinigame && hustle.miniGame) {
                const onComplete = (multiplier: number) => {
                  try {
                    executeHustle(hustle.id, multiplier);
                  } catch (err) {
                    console.error('Minigame execution failed, falling back to standard', err);
                    executeHustle(hustle.id);
                  } finally {
                    setActiveHustleView(null);
                    setShowMinigame(false);
                  }
                };

                if (hustle.miniGame === 'SwipeOrder') return <SwipeOrder onComplete={onComplete} />;
                if (hustle.miniGame === 'TapRhythm') return <TapRhythm onComplete={onComplete} />;
                if (hustle.miniGame === 'DragScale') return <DragScale onComplete={onComplete} />;
                if (hustle.miniGame === 'TapAssign') return <TapAssign onComplete={onComplete} />;
                if (hustle.miniGame === 'HoldHype') return <HoldHype onComplete={onComplete} />;
                if (hustle.miniGame === 'MagneticSweep') {
                  return (
                    <MagneticSweep
                      onComplete={(result) => {
                        const levelData = currentBranch || (hustle.levels?.find(l => l.level === (pl.hustleLevels[hustle.id] || 1)));
                        const levelMult = LEVEL_MULTIPLIERS[levelData?.level || 1] || 1;
                        const market = MARKET_CONFIGS[currentMarket];

                        // Trigger the hustle execution
                        // We use forceSuccess: true because the minigame outcome logic (win/loss/rare)
                        // is already handled within MagneticSweep and passed via result.multiplier
                        const execution = executeHustle(hustle.id, result.multiplier, true);

                        if (result.isRare) {
                          setBigWin({ amount: execution.netChange + (levelData?.cost || 0) * levelMult * market.expenseMultiplier });
                        }

                        setMagneticSweepResult({
                          hustleId: hustle.id,
                          earned: execution.netChange + (levelData?.cost || 0) * levelMult * market.expenseMultiplier,
                          speedMult: result.speedMult,
                          outcomeMult: result.outcomeMult,
                          isRare: result.isRare,
                          baseYield: (levelData?.yieldCash || 0) * levelMult * market.yieldMultiplier
                        });

                        setShowMinigame(false);
                      }}
                    />
                  );
                }
              }

              if (hustle.hasPanel && hustle.panelType === 'MUSIC_PRODUCTION') {
                return (
                  <MusicProductionPanel
                    hustle={hustle}
                    onExecute={() => {
                      setShowMinigame(true);
                    }}
                  />
                );
              }

              if (hasNextBranches) {
                return (
                  <BranchChoice
                    hustle={hustle}
                    currentBranchId={currentBranchId!}
                    onSelectBranch={(branchId) => executeBranch(hustle.id, branchId)}
                    onExecute={() => {
                      if (hustle.miniGame) {
                        setShowMinigame(true);
                      } else {
                        executeHustle(hustle.id);
                        setActiveHustleView(null);
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
                    if (hustle.miniGame) {
                      setShowMinigame(true);
                    } else {
                      executeHustle(hustle.id);
                      setActiveHustleView(null);
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

      {/* Magnetic Sweep Reward Card */}
      {magneticSweepResult && (
        <RewardCard
          title={magneticSweepResult.isRare ? "💎 RARE METAL!" : "📦 SCRAP COLLECTED"}
          subtitle="Magnetic Sweep Results"
          isRare={magneticSweepResult.isRare}
          stats={[
            { label: 'Scrap Value', value: magneticSweepResult.baseYield },
            { label: 'Speed Mult', value: `x${magneticSweepResult.speedMult.toFixed(2)}`, colorClass: 'text-blue-400' },
            {
              label: magneticSweepResult.isRare ? 'Rare Bonus' : 'Outcome',
              value: magneticSweepResult.isRare ? 'x30.00' : `x${magneticSweepResult.outcomeMult.toFixed(2)}`,
              colorClass: magneticSweepResult.outcomeMult > 0 ? 'text-emerald-400' : 'text-red-400'
            },
            { label: 'Total Earned', value: magneticSweepResult.earned, colorClass: 'text-emerald-400' },
          ]}
          onDismiss={() => {
            setMagneticSweepResult(null);
            setActiveHustleView(null);
          }}
        />
      )}

      {/* News Ticker */}
      <NewsTicker news={news} />
    </div>
  );
}

export default App;
