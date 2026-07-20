import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import * as Bio from '../../engine/biographyEngine';
import type { Hustle } from '../../config/hustles/base';
import { ProgressBar } from '../ui/ProgressBar';
import { RosterSelectList } from '../ui/RosterSelectList';

interface MarryCelebrityPanelProps {
  hustle: Hustle;
}

const WEDDING_THEMES = [
  "ROYAL PALACE EXTRAVAGANZA",
  "SUNSET BEACH PARADISE",
  "NEO-TOKYO CYBER WEDDING",
  "CLASSIC CATHEDRAL GRANDEUR"
];

const WEDDING_VOWS = {
  high: [
    "From matching cards to matching rings—this is the real deal! I love you!",
    "Together, we're not just a couple, we're an absolute empire.",
    "A lifetime of spotlight and champagne. There's nobody else I'd rather dominate the headlines with."
  ],
  standard: [
    "I do! Let's make some memories and conquer the high-society columns.",
    "A stunning wedding for a stunning partner. Let's make this official!",
    "Our chemistry is solid, and today, we're the center of the universe."
  ],
  low: [
    "Let's put on a good show for the paparazzi. Smiling on three!",
    "A marriage of convenience, perhaps? Let's just make sure the pre-nup is clean.",
    "Well, the wedding is beautiful. Let's see how long we last under the spotlight."
  ]
};

export const MarryCelebrityPanel: React.FC<MarryCelebrityPanelProps> = ({ hustle }) => {
  const { pl, executeHustle, setActiveHustleView } = useGameStore();

  const [panelState, setPanelState] = useState<'selection' | 'planning' | 'outcome'>('selection');
  const [selectedSpouse, setSelectedSpouse] = useState<any | null>(null);
  const [weddingTheme, setWeddingTheme] = useState(WEDDING_THEMES[0]);
  const [customTheme, setCustomTheme] = useState('');
  const [isWeddinProgress, setIsWeddinProgress] = useState(false);

  // Synchronous double-dispatch guard
  const marryClickedRef = useRef(false);

  // Outcome data stored after marriage
  const [outcomeData, setOutcomeData] = useState<{
    multiplier: number;
    cloutEarned: number;
    auraEarned: number;
    vows: string;
    success: boolean;
  } | null>(null);

  const levelData = hustle.levels?.[0] || { cost: 5000000, yieldClout: 100, yieldAura: 200 };
  const totalCost = levelData.cost;

  const handleSelectSpouse = (spouse: any) => {
    setSelectedSpouse(spouse);
    setWeddingTheme(WEDDING_THEMES[0]);
    setCustomTheme('');
    marryClickedRef.current = false;
    setPanelState('planning');
  };

  const handleMarry = () => {
    if (!selectedSpouse || marryClickedRef.current) return;

    // Set guard immediately and synchronously to block rapid click double-dispatches
    marryClickedRef.current = true;
    setIsWeddinProgress(true);

    setTimeout(() => {
      const score = selectedSpouse.relationshipScore || 0;

      // Relationship score meaningfully affects outcome yield
      // higher relationship score yields a larger clout/aura boost (from 0.8x up to 2.0x)
      const relationshipMultiplier = 0.8 + (score / 100) * 1.2;

      // Execute hustle directly in Zustand store
      const result = executeHustle(hustle.id, relationshipMultiplier);

      const state = useGameStore.getState();
      const bioUpdate = Bio.recordCelebrityMarriage(
        state.pl,
        selectedSpouse.name,
        score
      );
      if (bioUpdate) {
        state.updatePl({
          biography: [...(state.pl.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate.key!]
        });
      }

      // Vows quote based on relationship tier
      const vowsPool = score >= 80 ? WEDDING_VOWS.high :
                        score >= 40 ? WEDDING_VOWS.standard : WEDDING_VOWS.low;
      const chosenVows = vowsPool[Math.floor(Math.random() * vowsPool.length)];

      setOutcomeData({
        multiplier: relationshipMultiplier,
        cloutEarned: result.yieldClout || 0,
        auraEarned: result.yieldAura || 0,
        vows: chosenVows,
        success: result.success
      });

      setIsWeddinProgress(false);
      setPanelState('outcome');
    }, 1200);
  };

  const currentRolodex = pl.rolodex || [];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 max-w-[500px] mx-auto overflow-hidden relative shadow-2xl">
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />

      {panelState === 'selection' && (
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{hustle.icon}</div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{hustle.name}</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                PLAN THE ULTIMATE ROYAL NUPTIALS
              </p>
            </div>
          </div>

          <div className="text-slate-400 text-xs leading-relaxed uppercase font-bold tracking-wide border-l-4 border-purple-500 pl-3">
            To hold a high-society royal wedding, select your prospective spouse from your signed Rolodex. Their relationship score dramatically influences the public fallout, clout, and aura multipliers.
          </div>

          {currentRolodex.length === 0 ? (
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-800 space-y-6 text-center">
              <div className="text-5xl animate-pulse">📭</div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm uppercase tracking-tight">Casting Board is Empty</h4>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                  Sign talent via Boutique Talent Agency first
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setActiveHustleView(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold uppercase rounded-xl transition-all text-[10px] tracking-wider"
                >
                  Close Marriage Panel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  SELECT PROSPECTIVE SPOUSE ({currentRolodex.length} SIGNED)
                </label>
              </div>

              <RosterSelectList
                roster={currentRolodex}
                onSelect={handleSelectSpouse}
                renderCard={(celeb, handleSelect) => {
                  const score = celeb.relationshipScore || 0;
                  let perkText = "Paparazzi nightmare. Very low relationship.";
                  let perkColor = "text-red-400";

                  if (score >= 80) {
                    perkText = "Power couple goals! Unparalleled public prestige & massive bonuses.";
                    perkColor = "text-yellow-400";
                  } else if (score >= 40) {
                    perkText = "Happy union. Solid public clout & aura bonuses.";
                    perkColor = "text-emerald-400";
                  } else if (score >= 20) {
                    perkText = "Distant partner. Modest public reception.";
                    perkColor = "text-blue-400";
                  }

                  return (
                    <div
                      key={celeb.id}
                      onClick={handleSelect}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/80 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl bg-slate-900 w-12 h-12 rounded-lg border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {celeb.avatar || '👑'}
                        </div>
                        <div className="text-left space-y-0.5">
                          <h5 className="text-white font-black text-sm group-hover:text-purple-400 transition-colors">
                            {celeb.name}
                          </h5>
                          <p className={`text-[9px] uppercase font-bold tracking-wider ${perkColor}`}>
                            {perkText}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
                          AFFINITY
                        </span>
                        <div className="w-20">
                          <ProgressBar value={score} max={100} colorClass={score >= 80 ? 'bg-emerald-500' : score >= 40 ? 'bg-blue-500' : 'bg-red-500'} />
                        </div>
                        <span className="block text-[9px] font-mono font-bold text-slate-400">
                          {score}/100
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}
        </div>
      )}

      {panelState === 'planning' && selectedSpouse && (
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                marryClickedRef.current = false;
                setPanelState('selection');
              }}
              className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-wider"
            >
              ← BACK
            </button>
            <div className="w-px h-4 bg-slate-800" />
            <h4 className="text-sm font-black text-purple-400 uppercase tracking-wider">
              WEDDING PLANNING
            </h4>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="text-4xl">{selectedSpouse.avatar || '👑'}</div>
            <div className="text-left space-y-1">
              <span className="block text-[8px] text-purple-400 font-black uppercase tracking-widest">
                PROSPECTIVE SPOUSE
              </span>
              <h5 className="text-white font-black text-lg">{selectedSpouse.name}</h5>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 font-black uppercase">Affinity:</span>
                <span className="text-emerald-400 font-mono text-xs font-black">{selectedSpouse.relationshipScore}/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">
              SELECT THE WEDDING VENUE / THEME
            </label>
            <div className="grid gap-2">
              {WEDDING_THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    setWeddingTheme(theme);
                    setCustomTheme('');
                  }}
                  className={`p-3 text-left rounded-xl text-xs font-black border-2 transition-all uppercase ${
                    weddingTheme === theme && !customTheme
                      ? 'bg-purple-950/80 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[9px] text-slate-500 font-black uppercase">OR DEFINE A CUSTOM VENUE/THEME:</span>
              <input
                type="text"
                placeholder="Enter custom theme/venue..."
                value={customTheme}
                onChange={(e) => {
                  setCustomTheme(e.target.value);
                  setWeddingTheme(e.target.value);
                }}
                className="w-full bg-slate-950 text-white font-bold text-xs uppercase p-3 rounded-xl border-2 border-slate-800 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase">Wedding Expenses</span>
              <span className="text-red-400">${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase">Estimated Yield Multiplier</span>
              <span className="text-emerald-400">
                {(0.8 + (selectedSpouse.relationshipScore / 100) * 1.2).toFixed(2)}x
              </span>
            </div>
          </div>

          <button
            onClick={handleMarry}
            disabled={isWeddinProgress}
            className={`w-full py-4 text-white font-black uppercase rounded-xl transition-all border-b-4 text-sm tracking-widest flex items-center justify-center gap-3 ${
              isWeddinProgress
                ? 'bg-purple-800 border-purple-950 opacity-80 cursor-wait'
                : 'bg-purple-600 hover:bg-purple-500 border-purple-800 active:border-b-0 active:translate-y-1 shadow-[0_0_25px_rgba(147,51,234,0.4)]'
            }`}
          >
            {isWeddinProgress ? (
              <>
                <span className="animate-spin text-lg">⏳</span>
                <span>CONSTRUCTING THE VENUE...</span>
              </>
            ) : (
              <>
                <span>💍 HOST HIGH-SOCIETY WEDDING</span>
              </>
            )}
          </button>
        </div>
      )}

      {panelState === 'outcome' && outcomeData && selectedSpouse && (
        <div className="space-y-6 relative z-10 text-center">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              NUPTIAL CELEBRATION
            </span>
            <h4 className="text-white font-black text-xl uppercase tracking-tight italic">
              "THE MARRIAGE OF JULES & {selectedSpouse.name.toUpperCase()}"
            </h4>
            <div className="text-xs text-slate-400 uppercase font-black">
              VENUE: <span className="text-white">{weddingTheme || customTheme || 'ROYAL PALACE'}</span>
            </div>
          </div>

          {/* Glowing Animated Rating Badge */}
          <div className="py-4">
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], rotate: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="inline-block px-8 py-3 rounded-2xl font-black text-xl italic tracking-tighter uppercase border-2 shadow-2xl bg-yellow-950/80 border-yellow-500 text-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.35)]"
            >
              POWER COUPLE ESTABLISHED
            </motion.div>
          </div>

          <div className="grid gap-4 text-left">
            {/* Spouse Vows */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
              <span className="absolute -top-2 left-4 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[7px] text-purple-400 font-black uppercase">
                {selectedSpouse.name} ({selectedSpouse.avatar})
              </span>
              <p className="text-slate-300 text-xs italic font-bold leading-relaxed pt-1">
                "{outcomeData.vows}"
              </p>
            </div>
          </div>

          {/* Expenses Statement */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-left">
            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800 pb-1">
              EXPENSES STATEMENT
            </span>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase">Wedding Cost</span>
              <span className="text-red-400">-${totalCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Social Fame Earned */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">CLOUT GAINED</span>
              <span className="text-blue-400 font-mono font-black text-lg">+{outcomeData.cloutEarned}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">AURA GAINED</span>
              <span className="text-purple-400 font-mono font-black text-lg">+{outcomeData.auraEarned}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveHustleView(null)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase rounded-xl transition-all border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm tracking-widest"
          >
            COMMENCE THE HONEYMOON
          </button>
        </div>
      )}
    </div>
  );
};
