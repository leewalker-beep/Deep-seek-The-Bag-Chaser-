import React from 'react';
import { useGameStore } from '../store/gameStore';
import { HUSTLES } from '../config/hustles/base';

export const TutorialBox: React.FC = () => {
  const {
    pl,
    tutorialStep,
    setTutorialStep,
    setTutorialSkipped,
    executeHustle,
    advanceTier,
    isTutorialSkipped
  } = useGameStore();

  if (isTutorialSkipped) return null;

  const steps = [
    {
      title: "Step 1: Earn Bag",
      text: "Money is how you buy upgrades and progress.",
      hustles: ['r_delivery', 'r_scrap'],
      goalText: "Goal: Earn $500 total",
      check: () => pl.bag >= 500,
      progress: () => Math.min(100, (pl.bag / 500) * 100),
    },
    {
      title: "Step 2: Minigames",
      text: "Minigames boost your payout — the better you play, the bigger the multiplier. Tap the hustle card to see its minigame.",
      hustles: ['r_delivery', 'r_scrap'],
      goalText: "Goal: Try a hustle",
      check: () => pl.hustlePlays && Object.values(pl.hustlePlays).reduce((a, b) => a + b, 0) > 0,
      progress: () => (pl.hustlePlays && Object.values(pl.hustlePlays).reduce((a, b) => a + b, 0) > 0) ? 100 : 0,
    },
    {
      title: "Step 3: Earn Clout",
      text: "Reputation unlocks new hustles and tiers.",
      hustles: ['cc', 'pod'],
      goalText: "Goal: Earn 10 Clout",
      check: () => pl.clout >= 10,
      progress: () => Math.min(100, (pl.clout / 10) * 100),
    },
    {
      title: "Step 4: Earn Aura",
      text: "Influence gives you access to special opportunities.",
      hustles: ['r_ghost_mode', 'street_eats'],
      goalText: "Goal: Earn 10 Aura",
      check: () => pl.aura >= 10,
      progress: () => Math.min(100, (pl.aura / 10) * 100),
    },
    {
      title: "Step 5: Rest & Recover",
      text: "Mental health and heat affect your performance. Keep them balanced.",
      hustles: ['r_sleep'],
      goalText: "Goal: Restore mental health",
      check: () => pl.mentalHealth >= 100,
      progress: () => pl.mentalHealth,
    },
    {
      title: "Step 6: Advance Tier",
      text: "Meet the requirements and move up to unlock new content.",
      hustles: [],
      goalText: "Goal: Tap to advance",
      check: () => pl.currentTier === 'STREET',
      progress: () => pl.currentTier === 'STREET' ? 100 : 0,
    }
  ];

  const currentStep = steps[tutorialStep];
  if (!currentStep) return null;

  const isMet = currentStep.check();

  const handleHustle = (id: string) => {
    executeHustle(id, 1, true); // Force success for tutorial
  };

  const handleContinue = () => {
    if (tutorialStep >= 5) {
      setTutorialSkipped(true);
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm pointer-events-none">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden pointer-events-auto">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                {currentStep.title.split(': ')[0]}
              </h2>
              <div className="text-emerald-400 font-bold text-sm uppercase tracking-widest mt-1">
                {currentStep.title.split(': ')[1]}
              </div>
            </div>
            <button
              onClick={() => setTutorialSkipped(true)}
              onTouchEnd={(e) => { e.preventDefault(); setTutorialSkipped(true); }}
              className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-tighter border border-slate-800 px-2 py-1 rounded"
            >
              Skip
            </button>
          </div>

          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            {currentStep.text}
          </p>

          <div className="space-y-3 mb-10">
            {currentStep.hustles.map(hId => {
              const h = HUSTLES[hId];
              return (
                <button
                  key={hId}
                  onClick={() => handleHustle(hId)}
                  onTouchEnd={(e) => { e.preventDefault(); handleHustle(hId); }}
                  className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 rounded-2xl flex items-center px-5 gap-4 transition-all active:scale-95 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{h?.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase text-white tracking-wide">{h?.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Execute Hustle</div>
                  </div>
                  <div className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ➜
                  </div>
                </button>
              );
            })}

            {tutorialStep === 5 && pl.currentTier === 'MUD' && (
              <button
                onClick={() => advanceTier()}
                onTouchEnd={(e) => { e.preventDefault(); advanceTier(); }}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all active:scale-95 uppercase tracking-wider shadow-lg shadow-purple-900/20 border border-purple-400/30"
              >
                ⚡ ADVANCE TO STREET ⚡
              </button>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
               <div
                  className="bg-emerald-500 h-full transition-all duration-700 ease-out"
                  style={{ width: `${currentStep.progress()}%` }}
               />
            </div>

            <div className="flex justify-between w-full mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {currentStep.goalText}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                {Math.floor(currentStep.progress())}%
              </span>
            </div>

            {isMet && (
              <button
                onClick={handleContinue}
                onTouchEnd={(e) => { e.preventDefault(); handleContinue(); }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(16,185,129,0.3)]"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
