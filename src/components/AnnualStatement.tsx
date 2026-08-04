import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { compileAnnualReview, type AnnualReviewData } from '../utils/annualReviewCompiler';
import { evaluateIdentityDimensions } from '../utils/identitySystem';

interface Props {
  onDismiss: () => void;
}

function playChime(freq = 440, type: OscillatorType = 'sine', duration = 0.6) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Smooth fade out
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore autoplay blocks safely
  }
}

export const AnnualStatement: React.FC<Props> = ({ onDismiss }) => {
  const { pl, setActiveTab, updatePl } = useGameStore();
  const [slideIndex, setSlideIndex] = useState(0);

  // Parse or compile review data once
  const review: AnnualReviewData = (() => {
    if (pl.narrativeFlags?.lastAnnualReviewData) {
      try {
        return JSON.parse(pl.narrativeFlags.lastAnnualReviewData as string);
      } catch (e) {
        // Fallback to active compilation
      }
    }
    return compileAnnualReview(pl);
  })();

  const currentDimensions = evaluateIdentityDimensions(pl);
  let startDimensions = currentDimensions;
  if (pl.narrativeFlags?.year_start_dimensions) {
    try {
      startDimensions = JSON.parse(pl.narrativeFlags.year_start_dimensions as string);
    } catch (e) {
      // fallback
    }
  }

  // Sound effects on slide change
  useEffect(() => {
    if (slideIndex === 0) {
      playChime(220, 'triangle', 0.8); // Low warm pad
    } else if (slideIndex === 1) {
      playChime(523.25, 'sine', 0.5); // Warm gold standard (C5)
    } else if (slideIndex === 2) {
      playChime(293.66, 'sawtooth', 0.4); // Cost buzz (D4)
    } else if (slideIndex === 3) {
      playChime(440, 'triangle', 0.8); // Dramatic bells (A4)
    } else if (slideIndex === 6) {
      playChime(659.25, 'sine', 0.6); // Identity bells (E5)
    } else if (slideIndex === 7) {
      playChime(392, 'triangle', 0.8); // Mentorship reflection (G4)
    } else if (slideIndex === 8) {
      playChime(587.33, 'sine', 0.7); // Final emotional wrap (D5)
    } else {
      playChime(349.23, 'sine', 0.4); // Standard transition (F4)
    }
  }, [slideIndex]);

  // Navigate directly to a scoreboard tab
  const handleSystemNavigate = (subTab: string) => {
    const nextStartDimensions = evaluateIdentityDimensions(pl);
    const updatedFlags = {
      ...(pl.narrativeFlags || {}),
      year_start_bag: pl.bag,
      year_start_clout: pl.clout,
      year_start_aura: pl.aura,
      year_start_tier: pl.currentTier,
      year_start_reputation: (pl.narrativeFlags?.publicReputation as string) || 'The Hustler',
      year_start_dimensions: JSON.stringify(nextStartDimensions),
      target_scoreboard_tab: subTab,
      annualPassiveEarned: 0,
      annualPassiveSpent: 0,
    };

    updatePl({
      pendingAnnualStatement: false,
      annualCashEarned: 0,
      annualCashSpent: 0,
      annualHustlesRun: 0,
      narrativeFlags: updatedFlags,
    });
    setActiveTab('SCOREBOARD');
  };

  const handleFullDismiss = () => {
    onDismiss();
  };

  // Dimensions labels mapped
  const dimNames = {
    compassion: 'Compassion',
    integrity: 'Integrity',
    ambition: 'Ambition',
    patience: 'Patience',
    riskTaking: 'Risk-taking',
    leadership: 'Leadership',
    fameSeeking: 'Fame-seeking',
    resilience: 'Resilience'
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto no-scrollbar">
      {/* Cinematic Film Grain & Scanning Lines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[length:100%_4px,_6px_100%]" />

      <div className="max-w-4xl w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col min-h-[550px] max-h-[90vh]">
        {/* Paper texture background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

        {/* Top Header - Shows Progress */}
        <div className="relative z-10 px-6 pt-6 pb-4 flex justify-between items-center border-b border-slate-800/40 bg-slate-950/20">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">
              YEAR {review.yearNumber} DOCUMENTARY REVIEW
            </span>
            <h2 className="text-sm font-bold text-slate-400 tracking-tight">
              OPERATOR: <span className="text-emerald-400 font-mono font-black">{pl.name?.toUpperCase()}</span>
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-[9px] font-black border border-emerald-500/30 text-emerald-400 uppercase tracking-widest bg-emerald-950/20 font-mono">
              {pl.currentTier}
            </span>
            {slideIndex < 8 && (
              <button
                onClick={() => setSlideIndex(8)}
                className="text-[9px] text-slate-500 hover:text-white uppercase tracking-widest font-black transition-colors"
              >
                Skip to Summary ➔
              </button>
            )}
          </div>
        </div>

        {/* Progress bar indicator */}
        <div className="h-[2px] w-full bg-slate-850 relative z-10">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-lg shadow-emerald-500/50"
            style={{ width: `${((slideIndex + 1) / 9) * 100}%` }}
          />
        </div>

        {/* Main Cinematic Content Area */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto no-scrollbar relative z-10 flex flex-col justify-center">

          {/* Slide 0: Chapter Cover */}
          {slideIndex === 0 && (
            <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
              <div className="text-emerald-500/80 text-xs font-black tracking-[0.4em] uppercase font-mono">
                CHAPTER {review.yearNumber} INTRO
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                "{review.chapterTitle}"
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 mx-auto rounded-full" />
              <p className="text-slate-400 text-sm md:text-base leading-relaxed italic">
                The city watched closely. Decisions made over the past twelve months have forged a powerful trajectory, shaping a name that echoes in high-society lounges and executive boardrooms alike.
              </p>
            </div>
          )}

          {/* Slide 1: Growth & Progress */}
          {slideIndex === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📈</span>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest font-mono">Growth & Progress</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">The Ledger of Ambition</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Net Worth Shift</div>
                  <div className={`text-2xl font-mono font-black mt-1 ${review.netWorthChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {review.netWorthChange >= 0 ? '+' : ''}${review.netWorthChange.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Active Hustle Income</div>
                  <div className="text-2xl font-mono font-black text-white mt-1">
                    +${review.activeIncome.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Passive Asset Yield</div>
                  <div className="text-2xl font-mono font-black text-emerald-400/95 mt-1">
                    +${review.passiveIncome.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Best Investment</div>
                  <div className="text-sm font-bold text-slate-300 mt-1 truncate">
                    {review.bestInvestment}
                  </div>
                </div>
              </div>

              <div className="bg-emerald-950/10 rounded-2xl p-4 border border-emerald-500/10 mt-2">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold mb-1">Financial Milestone</div>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-serif">
                  {review.financialTurningPoint}
                </p>
              </div>
            </div>
          )}

          {/* Slide 2: The Cost */}
          {slideIndex === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">⚖️</span>
                <span className="text-rose-500 text-xs font-black uppercase tracking-widest font-mono">The Cost</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">The Toll of Supremacy</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-serif italic">
                No empire is built for free. Behind every digit in your vault lies a calculation of stress, exposure, and structural sacrifice.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Mental Strain</div>
                  <div className="text-2xl font-mono font-black text-rose-400 mt-1">
                    {review.totalMentalHit} MH
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Mental exhaustion incurred</p>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Street Exposure</div>
                  <div className="text-2xl font-mono font-black text-amber-500 mt-1">
                    +{review.totalHeatHit}%
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Heat accumulated from ops</p>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Upkeeps & Rent</div>
                  <div className="text-2xl font-mono font-black text-white mt-1">
                    ${review.totalUpkeepPaid.toLocaleString()}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Total upkeeps and obligations</p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: The Defining Moment */}
          {slideIndex === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full text-center">
              <div className="flex justify-center items-center space-x-3 mb-2">
                <span className="text-2xl">🔥</span>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest font-mono">The Defining Moment</span>
              </div>
              <h3 className="text-xs text-slate-500 uppercase tracking-[0.3em] font-mono">The Anchor Event of the Year</h3>
              <div className="bg-slate-950/60 rounded-3xl p-6 border-2 border-emerald-500/20 shadow-2xl relative overflow-hidden py-10 max-w-xl mx-auto">
                <div className="absolute right-0 top-0 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono px-3 py-1.5 uppercase tracking-widest font-black rounded-bl-xl border-l border-b border-emerald-500/10">
                  Defining Moment
                </div>
                <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">
                  "{review.definingMomentTitle}"
                </h2>
                <div className="w-12 h-[2px] bg-emerald-500 mx-auto my-4" />
                <p className="text-slate-300 text-sm font-serif leading-relaxed italic">
                  {review.definingMomentDescription}
                </p>
              </div>
            </div>
          )}

          {/* Slide 4: Public & Relations */}
          {slideIndex === 4 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🤝</span>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest font-mono">Public & Relations</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Aura, Clout & Alliances</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Persona</div>
                  <div className="text-sm font-black text-yellow-400 mt-1 font-mono">
                    {review.endReputation}
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Clout Shift</div>
                  <div className={`text-lg font-mono font-black mt-1 ${review.cloutChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {review.cloutChange >= 0 ? '+' : ''}{review.cloutChange.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Aura Shift</div>
                  <div className={`text-lg font-mono font-black mt-1 ${review.auraChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {review.auraChange >= 0 ? '+' : ''}{review.auraChange.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 space-y-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Media Coverage Tone</div>
                  <p className="text-sm font-medium text-white font-serif mt-1">"{review.mediaTone}"</p>
                </div>
                <div className="h-px bg-slate-800/50 my-2" />
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Public Perception</div>
                  <p className="text-xs text-slate-300 font-serif mt-1">{review.publicPerception}</p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 5: World Story */}
          {slideIndex === 5 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🌍</span>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest font-mono">World Story</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">The Tides of History</h3>

              <div className="bg-slate-950/60 rounded-2xl p-4 border border-red-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-red-600/10 text-red-500 text-[8px] font-mono px-3 py-1 uppercase tracking-widest font-black rounded-bl-xl border-l border-b border-red-500/10">
                  Breaking
                </div>
                <div className="text-[9px] text-red-400 uppercase tracking-widest font-bold font-mono mb-2">Newspaper Headline</div>
                <p className="text-lg font-serif font-black text-white leading-tight uppercase tracking-tight">
                  "{review.biggestHeadline}"
                </p>
              </div>

              <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Major World Event Impact</div>
                <p className="text-xs text-slate-300 font-serif leading-relaxed">
                  {review.majorWorldEvents[0]}
                </p>
              </div>
            </div>
          )}

          {/* Slide 6: Identity Summary */}
          {slideIndex === 6 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🧠</span>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest font-mono">Identity Story</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Character Synthesis: <span className="text-emerald-400">{review.identityArchetype}</span>
              </h3>

              <p className="text-sm font-medium text-slate-300 italic font-serif leading-relaxed bg-slate-950/30 p-4 border border-slate-800/40 rounded-2xl">
                "{review.identitySummary}"
              </p>

              {/* Slider display */}
              <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/50 space-y-4">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Non-visible Behavioral Dimensions</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(dimNames).map(([key, label]) => {
                    const cVal = currentDimensions[key as keyof typeof currentDimensions] || 0;
                    const sVal = startDimensions[key as keyof typeof startDimensions] || 0;
                    const diff = cVal - sVal;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-white font-bold">
                            {cVal}
                            {diff !== 0 && (
                              <span className={`text-[9px] ml-1.5 ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ({diff > 0 ? '+' : ''}{diff})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-[4px] bg-slate-800 rounded-full relative overflow-hidden">
                          <div
                            className="h-full bg-slate-600 rounded-full"
                            style={{ width: `${sVal}%` }}
                          />
                          <div
                            className={`absolute top-0 h-full rounded-full ${diff >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{
                              left: `${Math.min(sVal, cVal)}%`,
                              width: `${Math.abs(diff)}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Slide 7: Advisor Reflection & Legacy */}
          {slideIndex === 7 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">♟️</span>
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest font-mono">Advisor & Legacy</span>
              </div>

              {/* Advisor section */}
              <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex space-x-4">
                <div className="text-3xl mt-1 select-none">🧔</div>
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">Strategic Advisor Mentor</div>
                  <p className="text-sm font-serif font-medium text-slate-200 leading-relaxed mt-2 italic">
                    {review.advisorReflection}
                  </p>
                </div>
              </div>

              {/* Legacy Section */}
              <div className="bg-emerald-950/10 rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
                <div className="text-[9px] text-emerald-400 uppercase tracking-widest font-black font-mono">Multi-Generational Legacy</div>
                <p className="text-sm font-serif font-extrabold text-white leading-relaxed mt-2">
                  {review.legacyMoment}
                </p>
              </div>
            </div>
          )}

          {/* Slide 8: Media Montage, Emotional Signature, & Choices */}
          {slideIndex === 8 && (
            <div className="space-y-6 max-w-2xl mx-auto w-full py-2">
              <div className="text-center space-y-4">
                <div className="text-emerald-500 text-xs font-black uppercase tracking-[0.3em] font-mono">SUMMARY SCREEN</div>
                <h3 className="text-3xl font-black text-white tracking-tight uppercase">Year {review.yearNumber} Chapter Documented</h3>

                {/* Renders the bold Emotional Signature block beautifully */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 rounded-3xl p-5 border border-emerald-500/20 max-w-lg mx-auto shadow-xl">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono block mb-1">Emotional Signature of the Year</span>
                  <p className="text-lg md:text-xl font-serif font-black text-emerald-300 leading-tight">
                    "{review.emotionalSignature}"
                  </p>
                </div>

                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your life story is being written into the ledger. Explore your expanded biography or continue your relentless pursuit of power.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                <button
                  onClick={handleFullDismiss}
                  className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-2xl shadow-lg transition-all transform active:scale-95 text-xs font-black uppercase tracking-wider text-center col-span-2 md:col-span-1 shadow-emerald-500/10"
                >
                  Continue Year {review.yearNumber + 1} ➔
                </button>
                <button
                  onClick={() => handleSystemNavigate('biography')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-white transition-all transform active:scale-95 text-xs font-black uppercase tracking-wider text-center"
                >
                  📖 Open Biography
                </button>
                <button
                  onClick={() => handleSystemNavigate('history')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-white transition-all transform active:scale-95 text-xs font-black uppercase tracking-wider text-center"
                >
                  ⏳ Open History
                </button>
                <button
                  onClick={() => handleSystemNavigate('reputation')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-white transition-all transform active:scale-95 text-xs font-black uppercase tracking-wider text-center"
                >
                  📢 Open Reputation
                </button>
                <button
                  onClick={() => handleSystemNavigate('empire')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-white transition-all transform active:scale-95 text-xs font-black uppercase tracking-wider text-center"
                >
                  🏰 Open Empire
                </button>
                <button
                  onClick={() => handleSystemNavigate('history')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-white transition-all transform active:scale-95 text-xs font-black uppercase tracking-wider text-center"
                >
                  🎯 Defining Moments
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="relative z-10 px-6 py-4 border-t border-slate-800/40 bg-slate-950/40 flex justify-between items-center">
          <button
            onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
            disabled={slideIndex === 0}
            className={`px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              slideIndex === 0 ? 'opacity-20 pointer-events-none' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            ◀ Back
          </button>

          <div className="flex space-x-1.5">
            {Array.from({ length: 9 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  slideIndex === idx ? 'bg-emerald-500 scale-125 shadow-md shadow-emerald-500/50' : 'bg-slate-750 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {slideIndex < 8 ? (
            <button
              onClick={() => setSlideIndex(prev => Math.min(8, prev + 1))}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
            >
              Next Slide ▶
            </button>
          ) : (
            <button
              onClick={handleFullDismiss}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              Dismiss ➔
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
