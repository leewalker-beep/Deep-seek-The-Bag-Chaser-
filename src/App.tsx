import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { StatsPanel } from './components/StatsPanel';
import { NavTabs } from './components/NavTabs';
import { HustleCard } from './components/HustleCard';
import { FlexMarket } from './components/FlexMarket';
import { NewsTicker } from './components/NewsTicker';
import { PrologueScreen } from './components/PrologueScreen';
import { DeathScreen } from './components/DeathScreen';
import { HUSTLES } from './config/hustles/base';
import { PROGRESSION_ORDER, TIER_REQUIREMENTS } from './config/tiers';

function App() {
  const {
    pl,
    ph,
    currentMarket,
    news,
    activeTab,
    unlockedHustles,
    deathBadge,
    fatalCause,
    executeHustle,
    upgradeHustle,
    advanceTier,
    setActiveTab,
    setPlayerName,
    resetGame,
  } = useGameStore();

  const [displayedCash, setDisplayedCash] = useState(pl?.bag || 0);
  const [cashSplash, setCashSplash] = useState<{ text: string; isWin: boolean } | null>(null);

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
    return Object.values(HUSTLES).filter(h => h.tier === activeTab);
  };

  const hustles = getHustlesForTab();
  const showFlexMarket = activeTab === 'FLEX';

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

      {/* Stats Panel */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <StatsPanel stats={pl} market={currentMarket} />
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

        {/* Hustle Cards */}
        {!showFlexMarket && hustles.map(hustle => {
          const isUnlocked = unlockedHustles[hustle.id];
          if (!isUnlocked) return null;

          const currentLevel = pl.hustleLevels[hustle.id] || 1;
          const levelData = hustle.levels.find(l => l.level === currentLevel);
          const nextLevelData = hustle.levels.find(l => l.level === currentLevel + 1);

          const canAfford = levelData ? pl.bag >= levelData.cost : false;
          const canUpgrade = nextLevelData ? (
            pl.bag >= nextLevelData.cost &&
            pl.clout >= nextLevelData.cloutReq &&
            pl.aura >= nextLevelData.auraReq
          ) : false;

          return (
            <HustleCard
              key={hustle.id}
              hustle={hustle}
              currentLevel={currentLevel}
              canAfford={canAfford}
              canUpgrade={canUpgrade}
              upgradeCost={nextLevelData?.cost}
              onExecute={() => executeHustle(hustle.id)}
              onUpgrade={() => upgradeHustle(hustle.id)}
            />
          );
        })}

        {/* No hustles message */}
        {!showFlexMarket && hustles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-600 text-sm">No hustles available in {activeTab} tier yet.</div>
            <div className="text-slate-700 text-xs mt-2">Advance from lower tiers to unlock more.</div>
          </div>
        )}
      </div>

      {/* News Ticker */}
      <NewsTicker news={news} />
    </div>
  );
}

export default App;
