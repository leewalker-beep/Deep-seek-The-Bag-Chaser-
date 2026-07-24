import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import * as Bio from '../../engine/biographyEngine';
import type { Hustle } from '../../config/hustles/base';
import { ProgressBar } from '../ui/ProgressBar';
import { RosterSelectList } from '../ui/RosterSelectList';
import { getCharacterCallbackLine } from '../../utils/rivalUtils';

interface FundMoviePanelProps {
  hustle: Hustle;
}

const REVIEW_TEMPLATES = {
  flop: [
    "A massive, unmitigated disaster. What were they thinking?",
    "A box office tragedy of epic proportions.",
    "Boring, bloated, and incredibly painful to sit through.",
  ],
  average: [
    "A solid popcorn flick that gets the job done, barely.",
    "Forgettable but serves as decent weekend entertainment.",
    "Standard Hollywood fare. Dynamic action, hollow story.",
  ],
  hit: [
    "Highly entertaining, visually spectacular, and extremely profitable.",
    "A box office darling that delivers pure, unadulterated fun.",
    "Exceptional casting and smart pacing elevate this blockbuster.",
  ],
  blockbuster: [
    "An absolute masterpiece! A cultural phenomenon of our time.",
    "A breathtaking cinematic triumph that shatters all box office records!",
    "Flawless and historic. This is why we go to the movies.",
  ],
};

const CELEB_QUOTES = {
  flop: [
    "I... I think there was a problem with the editing. This isn't on me!",
    "My agent promised me this would be an Oscar contender. I'm firing them.",
    "At least we got paid. Let's never speak of this project again.",
  ],
  average: [
    "It's a solid mid-tier entry. The fans of the genre will appreciate it.",
    "Hey, we survived the shoot and broke even. That's a win in Hollywood!",
    "It has some good moments. I did my best with the script.",
  ],
  hit: [
    "Wow! The response is incredible. Fans are loving every second of it!",
    "I knew we had something special during the table read. On to the sequel!",
    "This is going straight into my highlight reel. Absolutely loved this shoot.",
  ],
  blockbuster: [
    "Oh my god, my social feeds are blowing up! We are officially legendary!",
    "We did it! Absolute cinematic history. Academy Awards, here we come!",
    "An unforgettable journey. Thank you for believing in my vision!",
  ],
};

export const FundMoviePanel: React.FC<FundMoviePanelProps> = ({ hustle }) => {
  const { pl, executeHustle, setActiveHustleView, setShowMinigame } = useGameStore();

  const [panelState, setPanelState] = useState<'selection' | 'production' | 'outcome'>('selection');
  const [selectedCelebrity, setSelectedCelebrity] = useState<any | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isProducing, setIsProducing] = useState(false);

  // Synchronous double-dispatch guard
  const greenlightClickedRef = useRef(false);

  // Outcome data stored after greenlight
  const [outcomeData, setOutcomeData] = useState<{
    rating: 'BLOCKBUSTER' | 'SMASH HIT' | 'AVERAGE RUN' | 'CRITICAL FLOP';
    review: string;
    quote: string;
    multiplier: number;
    cashReturned: number;
    cloutEarned: number;
    auraEarned: number;
    success: boolean;
  } | null>(null);

  const levelData = hustle.levels?.[0] || { cost: 100000000, yieldClout: 300, yieldAura: 150 };
  const totalCost = levelData.cost;

  // Generate three title choices based on selected celebrity name
  const generatedTitles = useMemo(() => {
    if (!selectedCelebrity) return [];
    const name = selectedCelebrity.name;
    return [
      `The Rise of ${name}`,
      `${name} in: Galaxy Odyssey`,
      `Midnight Shadows starring ${name}`
    ];
  }, [selectedCelebrity]);

  // Set the first generated title as default when a celebrity is selected
  const handleSelectCelebrity = (celeb: any) => {
    setSelectedCelebrity(celeb);
    const defaultTitle = `The Rise of ${celeb.name}`;
    setMovieTitle(defaultTitle);
    setCustomTitle('');
    greenlightClickedRef.current = false;
    setPanelState('production');
  };

  const handleGreenlight = () => {
    if (!selectedCelebrity || greenlightClickedRef.current) return;

    // Set guard immediately and synchronously to block rapid click double-dispatches
    greenlightClickedRef.current = true;
    setIsProducing(true);

    setTimeout(() => {
      const score = selectedCelebrity.relationshipScore || 0;
      const roll = Math.random();

      // Math for movie outcomes: relationship reduces flop chance and increases blockbuster/hit chances
      const flopChance = Math.max(0.02, 0.35 - (score / 300));
      const blockbusterChance = Math.min(0.50, 0.10 + (score / 250));

      let rating: 'BLOCKBUSTER' | 'SMASH HIT' | 'AVERAGE RUN' | 'CRITICAL FLOP';
      let baseMultiplier = 1.0;

      if (roll < flopChance) {
        rating = 'CRITICAL FLOP';
        baseMultiplier = 0.2;
      } else if (roll > 1 - blockbusterChance) {
        rating = 'BLOCKBUSTER';
        baseMultiplier = 4.5;
      } else if (roll < flopChance + 0.35) {
        rating = 'AVERAGE RUN';
        baseMultiplier = 1.0;
      } else {
        rating = 'SMASH HIT';
        baseMultiplier = 2.0;
      }

      // Celebrity relationship level acts as a further performance scaling multiplier
      const celebrityMultiplier = 0.8 + (score / 100) * 1.2;
      const finalMultiplier = baseMultiplier * celebrityMultiplier;

      // Execute hustle directly in Zustand store
      const result = executeHustle(hustle.id, finalMultiplier);

      const state = useGameStore.getState();
      const bioUpdate = Bio.recordMovieCasting(
        state.pl,
        selectedCelebrity.name,
        movieTitle || customTitle || 'The Mystery Film',
        rating
      );
      if (bioUpdate) {
        state.updatePl({
          biography: [...(state.pl.biography || []), bioUpdate.entry],
          recordedBioKeys: [...(state.pl.recordedBioKeys || []), bioUpdate.key!]
        });
      }

      // Extract generated quotes/reviews
      const ratingKey = rating === 'CRITICAL FLOP' ? 'flop' :
                        rating === 'AVERAGE RUN' ? 'average' :
                        rating === 'SMASH HIT' ? 'hit' : 'blockbuster';

      const reviews = REVIEW_TEMPLATES[ratingKey];
      const quotes = CELEB_QUOTES[ratingKey];

      const chosenReview = reviews[Math.floor(Math.random() * reviews.length)];
      const chosenQuote = quotes[Math.floor(Math.random() * quotes.length)];

      setOutcomeData({
        rating,
        review: chosenReview,
        quote: chosenQuote,
        multiplier: finalMultiplier,
        cashReturned: result.yieldCash || 0,
        cloutEarned: result.yieldClout || 0,
        auraEarned: result.yieldAura || 0,
        success: result.success
      });

      setIsProducing(false);
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
                CAST & DIRECT YOUR MAGNUM OPUS
              </p>
            </div>
          </div>

          <div className="text-slate-400 text-xs leading-relaxed uppercase font-bold tracking-wide border-l-4 border-purple-500 pl-3">
            To produce a high-budget film, select a signed star from your Rolodex. Their disposition and chemistry significantly boost box office returns and mitigate commercial disasters.
          </div>

          {currentRolodex.length === 0 ? (
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-800 space-y-6 text-center">
              <div className="text-5xl animate-pulse">📭</div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm uppercase tracking-tight">Casting Board is Empty</h4>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                  You don't have any signed talent in your Rolodex. Sign talent via Boutique Talent Agency (Corporate tier) first to cast them in your films, or proceed with standard public casting.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setShowMinigame(true)}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.35)] text-xs tracking-widest border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
                >
                  Proceed with Standard Casting
                </button>
                <button
                  onClick={() => setActiveHustleView(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold uppercase rounded-xl transition-all text-[10px] tracking-wider"
                >
                  Close Casting Room
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  SELECT LEAD ACTOR ({currentRolodex.length} SIGNED)
                </label>
                <button
                  onClick={() => setShowMinigame(true)}
                  className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-wider"
                >
                  Use Generic Casting Instead
                </button>
              </div>

              <RosterSelectList
                roster={currentRolodex}
                onSelect={handleSelectCelebrity}
                renderCard={(celeb, handleSelect) => {
                  const score = celeb.relationshipScore || 0;
                  let perkText = "Difficult to work with. High flop risk.";
                  let perkColor = "text-red-400";

                  if (score >= 90) {
                    perkText = "Full synergy! Flop risk minimized, outstanding returns guaranteed.";
                    perkColor = "text-yellow-400";
                  } else if (score >= 70) {
                    perkText = "Extremely professional. Decreased flop chance & yield boost.";
                    perkColor = "text-emerald-400";
                  } else if (score >= 40) {
                    perkText = "Cooperative actor. Standard box office outcomes.";
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
                          {celeb.characterId && getCharacterCallbackLine(pl, celeb.characterId) && (
                            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                              💡 {getCharacterCallbackLine(pl, celeb.characterId)}
                            </p>
                          )}
                          <p className={`text-[9px] uppercase font-bold tracking-wider ${perkColor}`}>
                            {perkText}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest">
                          RELATIONSHIP
                        </span>
                        <div className="w-20">
                          <ProgressBar value={score} max={100} colorClass={score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-blue-500' : 'bg-red-500'} />
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

      {panelState === 'production' && selectedCelebrity && (
        <div className="space-y-6 relative z-10">
          {isProducing ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 bg-slate-950 rounded-xl border border-slate-800 animate-pulse" data-testid="filming-progress">
              <div className="text-7xl animate-bounce" data-testid="filming-celebrity-avatar">{selectedCelebrity.avatar || '👑'}</div>
              <div className="text-center space-y-1">
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">NOW FILMING ON SET</p>
                <h4 className="text-white font-black text-lg uppercase tracking-tight" data-testid="filming-celebrity-name">STARRING {selectedCelebrity.name.toUpperCase()}</h4>
                <p className="text-[9px] text-slate-500 font-mono">SCENE 12, TAKE 1 — ROLL CAMERA 🎥</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    greenlightClickedRef.current = false;
                    setPanelState('selection');
                  }}
                  className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-wider"
                >
                  ← BACK
                </button>
                <div className="w-px h-4 bg-slate-800" />
                <h4 className="text-sm font-black text-purple-400 uppercase tracking-wider">
                  PRE-PRODUCTION SCREEN
                </h4>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="text-4xl">{selectedCelebrity.avatar || '👑'}</div>
                <div className="text-left space-y-1">
                  <span className="block text-[8px] text-purple-400 font-black uppercase tracking-widest">
                    CAST LEAD ROLE
                  </span>
                  <h5 className="text-white font-black text-lg">{selectedCelebrity.name}</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-black uppercase">Affinity:</span>
                    <span className="text-emerald-400 font-mono text-xs font-black">{selectedCelebrity.relationshipScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-left">
                  SELECT THE FILM TITLE
                </label>
                <div className="grid gap-2">
                  {generatedTitles.map((title) => (
                    <button
                      key={title}
                      onClick={() => {
                        setMovieTitle(title);
                        setCustomTitle('');
                      }}
                      className={`p-3 text-left rounded-xl text-xs font-black border-2 transition-all uppercase ${
                        movieTitle === title && !customTitle
                          ? 'bg-purple-950/80 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 text-left">
                  <span className="text-[9px] text-slate-500 font-black uppercase">OR DEFINE A CUSTOM TITLE:</span>
                  <input
                    type="text"
                    placeholder="Enter movie masterpiece title..."
                    value={customTitle}
                    onChange={(e) => {
                      setCustomTitle(e.target.value);
                      setMovieTitle(e.target.value);
                    }}
                    className="w-full bg-slate-950 text-white font-bold text-xs uppercase p-3 rounded-xl border-2 border-slate-800 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase">Production Budget</span>
                  <span className="text-red-400">${totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase">Estimated Casting Multiplier</span>
                  <span className="text-emerald-400">
                    {(0.8 + (selectedCelebrity.relationshipScore / 100) * 1.2).toFixed(2)}x
                  </span>
                </div>
              </div>

              <button
                onClick={handleGreenlight}
                disabled={isProducing}
                className={`w-full py-4 text-white font-black uppercase rounded-xl transition-all border-b-4 text-sm tracking-widest flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 border-purple-800 active:border-b-0 active:translate-y-1 shadow-[0_0_25px_rgba(147,51,234,0.4)]`}
              >
                <span>🎬 GREENLIGHT BLOCKBUSTER</span>
              </button>
            </>
          )}
        </div>
      )}

      {panelState === 'outcome' && outcomeData && selectedCelebrity && (
        <div className="space-y-6 relative z-10 text-center">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
              OFFICIAL FILM RELEASE
            </span>
            <h4 className="text-white font-black text-xl uppercase tracking-tight italic">
              "{movieTitle || customTitle || 'The Mystery Film'}"
            </h4>
            <div className="text-xs text-slate-400 uppercase font-black flex items-center justify-center gap-1.5" data-testid="outcome-celebrity-info">
              <span>Starring</span>
              <span className="text-white bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span data-testid="outcome-celebrity-avatar">{selectedCelebrity.avatar || '👑'}</span>
                <span className="font-bold" data-testid="outcome-celebrity-name">{selectedCelebrity.name}</span>
              </span>
            </div>
          </div>

          {/* Glowing Animated Rating Badge */}
          <div className="py-4">
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], rotate: [-1, 1, -1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className={`inline-block px-8 py-3 rounded-2xl font-black text-xl italic tracking-tighter uppercase border-2 shadow-2xl ${
                outcomeData.rating === 'BLOCKBUSTER'
                  ? 'bg-yellow-950/80 border-yellow-500 text-yellow-400 shadow-[0_0_35px_rgba(234,179,8,0.35)]'
                  : outcomeData.rating === 'SMASH HIT'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
                  : outcomeData.rating === 'AVERAGE RUN'
                  ? 'bg-blue-950/80 border-blue-500 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)]'
                  : 'bg-red-950/80 border-red-500 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
              }`}
            >
              {outcomeData.rating}
            </motion.div>
          </div>

          <div className="grid gap-4 text-left">
            {/* Critic Review */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
              <span className="absolute -top-2 left-4 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[7px] text-slate-500 font-black uppercase">
                THE HOLLYWOOD BULLETIN
              </span>
              <p className="text-slate-300 font-serif italic text-xs leading-relaxed pt-1">
                "{outcomeData.review}"
              </p>
            </div>

            {/* Celeb Reaction */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
              <span className="absolute -top-2 left-4 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[7px] text-purple-400 font-black uppercase">
                {selectedCelebrity.name} ({selectedCelebrity.avatar})
              </span>
              <p className="text-slate-300 text-xs italic font-bold leading-relaxed pt-1">
                "{outcomeData.quote}"
              </p>
            </div>
          </div>

          {/* Production Financial Report */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-left">
            <span className="block text-[8px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-800 pb-1">
              FINANCIAL STATEMENT
            </span>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase">Investment Capital</span>
              <span className="text-slate-300">-${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500 uppercase">Box Office Returns</span>
              <span className={outcomeData.cashReturned >= totalCost ? 'text-emerald-400' : 'text-red-400'}>
                +${outcomeData.cashReturned.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-800">
              <span className="text-slate-500 uppercase font-black">Net Cash Change</span>
              <span className={`font-mono font-black ${outcomeData.cashReturned >= totalCost ? 'text-emerald-400' : 'text-red-400'}`}>
                {(outcomeData.cashReturned - totalCost) >= 0 ? '+' : ''}
                ${(outcomeData.cashReturned - totalCost).toLocaleString()}
              </span>
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
            COLLECT BOX OFFICE RETURNS
          </button>
        </div>
      )}
    </div>
  );
};
