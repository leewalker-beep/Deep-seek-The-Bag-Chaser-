import React, { useState } from 'react';

interface FieldGuideModalProps {
  onClose: () => void;
}

export const FieldGuideModal: React.FC<FieldGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'GOAL' | 'MINIGAMES' | 'STATS' | 'HELP'>('GOAL');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-white relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block">
                PLAYER FIELD GUIDE & RULES
              </span>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                How Bag Chaser Works
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-xl rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
            aria-label="Close Field Guide"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 my-4 shrink-0">
          {[
            { id: 'GOAL', label: '🎯 Goal', color: 'text-emerald-400' },
            { id: 'MINIGAMES', label: '🎮 Hustles', color: 'text-blue-400' },
            { id: 'STATS', label: '📊 Stats', color: 'text-purple-400' },
            { id: 'HELP', label: '💡 Advice', color: 'text-amber-400' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[44px] py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Tab Content */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed custom-scrollbar flex-grow">
          {activeTab === 'GOAL' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  1. The Core Objective
                </span>
                <p className="text-slate-300">
                  Climb social classes from poverty in the <span className="font-bold text-emerald-400">MUD</span> tier all the way to the Oval Office in <span className="font-bold text-blue-400">PRESIDENT</span> and the unrestricted <span className="font-bold text-amber-400">OPEN</span> tier.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 block">
                  2. Permanent Mastery Crowns
                </span>
                <p className="text-slate-300">
                  Master hustles by completing their play/performance targets. Earning a <span className="font-bold text-yellow-400">👑 Crown</span> is <span className="font-bold text-white underline">PERMANENT</span>—Crowns are NEVER consumed when advancing tiers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                  3. Tier Advancement Gates
                </span>
                <p className="text-slate-300">
                  Advancing to a higher tier requires meeting four criteria simultaneously: <span className="font-bold text-emerald-400">Cash</span>, <span className="font-bold text-blue-400">Clout</span>, <span className="font-bold text-purple-400">Aura</span>, and required <span className="font-bold text-yellow-400">Crowns</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'MINIGAMES' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/20 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                  Skill-Based Yield Multipliers
                </span>
                <p className="text-slate-300">
                  Every hustle launches a minigame. High performance scores (100%) award up to <span className="font-mono font-bold text-emerald-400">2.5x</span> yield multipliers on Cash and Clout!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  Starter Hustles (MUD Tier)
                </span>
                <p className="text-slate-300">
                  <span className="font-bold text-white">Delivery Gigs</span> and <span className="font-bold text-white">Day Labor</span> require zero upfront capital and are perfect for building initial funds.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Business Upgrades & Passive Income
                </span>
                <p className="text-slate-300">
                  Upgrading hustles increases base payouts and unlocks monthly <span className="font-bold text-emerald-400">Passive Income</span> that flows directly into your capital every month.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'STATS' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-start gap-3">
                <span className="text-xl">💵</span>
                <div>
                  <span className="font-black text-emerald-400 text-[10px] uppercase block">Cash (Liquid Capital)</span>
                  <p className="text-[11px] text-slate-300">Used for funding businesses, upgrades, rent, and emergency bail. Keep liquid reserves for bad months.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/30 flex items-start gap-3">
                <span className="text-xl">📣</span>
                <div>
                  <span className="font-black text-blue-400 text-[10px] uppercase block">Clout (Public Sway)</span>
                  <p className="text-[11px] text-slate-300">Your social and political reach. Required for scouting talent and qualifying for higher tiers.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-start gap-3">
                <span className="text-xl">✨</span>
                <div>
                  <span className="font-black text-purple-400 text-[10px] uppercase block">Aura (Personal Charisma)</span>
                  <p className="text-[11px] text-slate-300">Your respect and star presence. Prevents public scrutiny and opens elite corporate deals.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-orange-500/30 flex items-start gap-3">
                <span className="text-xl">🔥</span>
                <div>
                  <span className="font-black text-orange-400 text-[10px] uppercase block">Heat (WANTED Level)</span>
                  <p className="text-[11px] text-slate-300">Law enforcement attention. Reaching 100% triggers police arrest and jail time. Lay low with <span className="font-bold text-white">Ghost Mode</span>.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-red-500/30 flex items-start gap-3">
                <span className="text-xl">🧠</span>
                <div>
                  <span className="font-black text-red-400 text-[10px] uppercase block">Mental Health (Burnout)</span>
                  <p className="text-[11px] text-slate-300">Your psychological stamina. Reaching <span className="font-black text-red-400">0% causes fatal burnout (Death)</span>. Recover via <span className="font-bold text-white">Sleep or Rest</span>.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HELP' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  🧠 Systemic Strategic Advisor
                </span>
                <p className="text-slate-300">
                  Tap the <span className="font-bold text-emerald-400">Advisor</span> button in the top header anytime to get personalized advice based on your current stats, threats, and market conditions.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
                  🔍 Stat Transparency & Badges
                </span>
                <p className="text-slate-300">
                  Tap any HUD metric or modifier badge (Exhaustion, Scrutiny, Clean Record) to inspect exact monthly changes and active percentage modifiers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  ⌨️ Controls & Accessibility
                </span>
                <p className="text-slate-300">
                  Press <span className="font-mono font-bold text-white bg-slate-800 px-1 rounded">Esc</span> to close any active modal overlay. All buttons feature clear focus rings for keyboard navigation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-2">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/10"
          >
            Return to Main Game
          </button>
        </div>
      </div>
    </div>
  );
};
