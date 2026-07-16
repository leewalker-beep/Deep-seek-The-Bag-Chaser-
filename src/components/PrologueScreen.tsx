import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';
import { PLAYER_AVATARS } from '../config/avatars';
import Avatar from './Avatar';
import { useGameStore } from '../store/gameStore';
import { LEGACY_UPGRADES } from '../config/legacyUpgrades';

interface PrologueScreenProps {
  onStart: (
    name: string,
    backgroundId: string,
    categoryId: string,
    variationId: string,
    avatarId: string,
    prologueStats?: {
      bag: number;
      clout: number;
      aura: number;
      biography: string[];
      recordedBioKeys: string[];
      hustlePlays: Record<string, number>;
      totalHustlesCompleted: number;
      actionLog: any[];
    }
  ) => void;
}

const GrainOverlay = () => (
  <>
    <style>{`
      @keyframes noise-anim {
        0% { transform: translate(0,0) }
        10% { transform: translate(-5%,-5%) }
        20% { transform: translate(-10%,5%) }
        30% { transform: translate(5%,-10%) }
        40% { transform: translate(-5%,15%) }
        50% { transform: translate(-10%,5%) }
        60% { transform: translate(15%,0) }
        70% { transform: translate(0,10%) }
        80% { transform: translate(-15%,0) }
        90% { transform: translate(10%,5%) }
        100% { transform: translate(5%,0) }
      }
    `}</style>
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      <div
        className="absolute inset-[-200%] opacity-[0.25] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          animation: 'noise-anim 0.2s infinite steps(1)',
        }}
      />
    </div>
  </>
);

const ORIGIN_DETAILS: Record<string, {
  shortDescription: string;
  advantages: string;
  disadvantages: string;
  mindset: string;
  playstyle: string;
}> = {
  street_kid: {
    shortDescription: "You grew up with nothing. Every dollar feels like survival.",
    advantages: "Sharp survival grit. +15% Cash from street level operations (MUD & STREET tiers). Reduced jail sentences & faster Heat cooling.",
    disadvantages: "Extremely scarce starting capital. High grind index, vulnerable to early stress & careless mistakes.",
    mindset: "Hunger, caution, and absolute determination. Survival is the only rule.",
    playstyle: "Great for players who want to build a gritty grassroots empire from the ground up, master active street-level hustles, and stay resilient under high heat."
  },
  dropout: {
    shortDescription: "You left school early to chase money. You have something to prove.",
    advantages: "Highly adaptable and charismatic. +20% Clout across early tiers (up to CORPORATE). Faster networking & artist scouting.",
    disadvantages: "Under relentless scrutiny. Highly competitive landscape. Prone to larger aura drops if public ventures fail.",
    mindset: "Rebel with a cause. Rejection of authority, driven by the pure thrill of the hustle.",
    playstyle: "Ideal for players focusing on tech startups, music production, media agencies, or any route heavily driven by clout, reputation, and public influence."
  },
  benefactor: {
    shortDescription: "A head start from those who came before. You carry their legacy.",
    advantages: "Elite family headstart. Start with substantial liquid capital. +15% Aura at Corporate levels and above (CORPORATE to MOGUL). Matching sector specialization yields +10%.",
    disadvantages: "Higher rent and maintenance overheads. Lacks street survival instincts, suffering higher stress penalty during street-level grinds.",
    mindset: "Entitlement, expectations, and the pressure of a name. Failure is not an option.",
    playstyle: "Perfect for players who want to bypass the early struggle, focus heavily on corporate buyouts, premium real estate trusts, high-finance lobbying, and political campaign dominance."
  },
  legacy: {
    shortDescription: "A legacy foretold. You are the one they were waiting for.",
    advantages: "A destiny realized. +10% cash across all tiers. Starts with massive starting capital, high clout, and aura.",
    disadvantages: "Massive target on your back. High-stakes rivals target you aggressively from Month 1.",
    mindset: "Absolute destiny. Born for greatness, carrying the weight of ancient or meta-prophecy.",
    playstyle: "Unlocked via permanent legacy. Use this to speedrun the entire progression from poverty to the presidency with overwhelming advantages."
  }
};

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  // Retrieve legacy from store to explain what carried forward
  const bankedLegacyPoints = useGameStore(state => state.bankedLegacyPoints || 0);
  const unlockedLegacyUpgradeIds = useGameStore(state => state.unlockedLegacyUpgradeIds || []);

  const unlockedUpgradesList = useMemo(() => {
    return LEGACY_UPGRADES.filter(up => unlockedLegacyUpgradeIds.includes(up.id));
  }, [unlockedLegacyUpgradeIds]);

  const hasChosenOriginUnlocked = unlockedLegacyUpgradeIds.includes('unique_origin_chosen');

  // Phases of Character Creation Flow:
  // 'welcome' | 'enter_name' | 'choose_avatar' | 'choose_origin' | 'opening_cinematic' | 'advisor_intro' | 'first_month'
  const [phase, setPh] = useState<
    | 'welcome'
    | 'enter_name'
    | 'choose_avatar'
    | 'choose_origin'
    | 'opening_cinematic'
    | 'advisor_intro'
    | 'first_month'
  >('welcome');

  // Character selection states
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('av_m1');
  const [selectedCatId, setSelectedCatId] = useState('street_kid');
  const [selectedVarId, setSelectedVarId] = useState('sk_delivery');

  // Cinematic lines for the Opening Cinematic step
  const [cinematicIndex, setCinematicIndex] = useState(0);
  const cinematicLines = [
    { text: 'Some people inherit wealth.', glow: 'shadow-emerald-500/20' },
    { text: 'You inherited nothing.', glow: 'shadow-red-500/20' },
    { text: 'No money. No reputation. No influence. No safety net.', glow: 'shadow-yellow-500/20' },
    { text: 'Every decision shapes your future.', glow: 'shadow-blue-500/20' },
    { text: 'Every life tells a different story.', glow: 'shadow-purple-500/20' },
    { text: 'You only get one life.', glow: 'shadow-pink-500/20' },
    { text: 'When your life ends, your legacy remains.', glow: 'shadow-white/20' },
  ];

  // Advisor dialogue tailored to Origin
  const advisorDialogue = useMemo(() => {
    if (selectedCatId === 'street_kid') {
      return {
        text: "Ah, another kid from the blocks. You've got the hunger and the scars to prove it. Survival in the mud is second nature to you, and those street hustles will pay out extra cash. But don't let the exhaustion break you before you even reach the high rise. Keep an eye on your Stress and Mental Health, and watch out for early careless mistakes. Let's make them pay for every tear.",
        highlight: "Street Hustles Yield Cash, but Exhaustion is Your Enemy."
      };
    } else if (selectedCatId === 'dropout') {
      return {
        text: "A dropout, huh? Rebellious, hungry, and refusing to follow their rules. I like it. Your charisma and Clout will open doors much faster in the music and startup scenes. But the spotlight burns bright, and rivals will be eager to expose you. Build your crowd, protect your reputation, and prove everyone who doubted you wrong.",
        highlight: "Clout and Networking Dominate, but Public Failure Drains Aura."
      };
    } else if (selectedCatId === 'benefactor') {
      return {
        text: "A benefactor's child. You were born with a golden spoon, but now you want to build a kingdom of your own design. You've got the capital and the early Aura to command boardrooms. But the streets are cold, and you lack the raw survival instincts. Do not underestimate the stress of the early grind. Leverage your wealth, buy passive assets, and let's dominate the political landscape.",
        highlight: "Sovereign Boardrooms and Capital, but Vulnerable to Early Stress."
      };
    } else {
      return {
        text: "The Chosen One has arrived. A destiny foretold, carrying the weight of ancient legacy. Your starting advantages are unmatched, but you have a massive target on your back. The rivals are ready. Step forward and claim your throne.",
        highlight: "Overwhelming Advantages, but Relentless Rival Bids."
      };
    }
  }, [selectedCatId]);

  // Handle cinematic lines autoplay
  useEffect(() => {
    if (phase === 'opening_cinematic') {
      setCinematicIndex(0);
      const timer = setInterval(() => {
        setCinematicIndex(prev => {
          if (prev >= cinematicLines.length - 1) {
            clearInterval(timer);
            setTimeout(() => {
              setPh('advisor_intro');
            }, 2500);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const filteredCategories = useMemo(() => {
    return BACKGROUND_CATEGORIES.filter(c => {
      if (c.id === 'legacy') return hasChosenOriginUnlocked;
      return true;
    });
  }, [hasChosenOriginUnlocked]);

  const activeCategory = useMemo(() => {
    return BACKGROUND_CATEGORIES.find(c => c.id === selectedCatId) || BACKGROUND_CATEGORIES[0];
  }, [selectedCatId]);

  const activeVariation = useMemo(() => {
    return activeCategory.variations.find(v => v.id === selectedVarId) || activeCategory.variations[0];
  }, [activeCategory, selectedVarId]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    const cat = BACKGROUND_CATEGORIES.find(c => c.id === catId);
    if (cat && cat.variations.length > 0) {
      setSelectedVarId(cat.variations[0].id);
    }
  };

  // Complete Character Creation
  const handleEnterWorld = () => {
    if (playerName.trim().length < 2) return;
    onStart(
      playerName.trim().toUpperCase(),
      activeVariation.id,
      activeCategory.id,
      activeVariation.id,
      selectedAvatarId,
      {
        bag: 0,
        clout: 0,
        aura: 0,
        biography: [
          `Left behind the shadows of your old life to make something of yourself.`
        ],
        recordedBioKeys: ['prologue_origin'],
        hustlePlays: {},
        totalHustlesCompleted: 0,
        actionLog: []
      }
    );
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-hidden select-none bg-slate-950 text-white"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0d0d1a 0%, #030308 100%)',
      }}
    >
      <GrainOverlay />

      <AnimatePresence mode="wait">

        {/* STEP 1: WELCOME SCREEN */}
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="text-center max-w-lg space-y-8 z-10 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 backdrop-blur-md relative"
          >
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-black tracking-[0.25em] text-center uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] font-mono italic">
                BAG CHASER
              </h1>
              <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase font-black">
                Systemic Life & Legacy Simulation
              </p>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
              Every decision shapes your story. Climb the social classes from poverty to command the Oval Office. Remember: you only get one life.
            </p>

            {/* PART 5 — Legacy Explanation */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Legacy Inheritance Status
                </span>
              </div>

              <div className="space-y-2 border-y border-white/5 py-3 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Banked Legacy Points:</span>
                  <span className="font-mono font-black text-yellow-400">{bankedLegacyPoints.toLocaleString()} LP</span>
                </div>
                {unlockedUpgradesList.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-500 uppercase font-black block">Active Permanent Perks:</span>
                    <div className="flex flex-wrap gap-1">
                      {unlockedUpgradesList.map(up => (
                        <span key={up.id} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                          {up.icon} {up.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No permanent stats unlocked yet. They will inherit from your next life ending.</p>
                )}
              </div>

              <div className="text-[10px] leading-relaxed text-slate-400 bg-white/[0.01] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-slate-200 block text-[9px] uppercase">What Carries Forward:</span>
                <p>• Permanent shop upgrades and active multiplier perks.</p>
                <span className="font-bold text-red-400 block text-[9px] uppercase mt-1">What is left behind:</span>
                <p>• Previous relationships, businesses, rivals, history, and ambitions.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setPh('enter_name')}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-emerald-500/10 text-sm"
              >
                Begin Journey →
              </button>

              {/* Maintain Playwright Skip button text mapping */}
              <button
                onClick={() => setPh('choose_origin')}
                className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest transition-colors block mx-auto py-2"
              >
                Skip Prologue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ENTER NAME */}
        {phase === 'enter_name' && (
          <motion.div
            key="enter_name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md space-y-8 z-10 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="text-center space-y-1">
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Identity Profile – Step 1
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Enter Your Name</h2>
              <p className="text-slate-400 text-xs">
                What do they call you on the city block?
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="ENTER NAME / ALIAS"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={16}
                className="w-full bg-slate-950/80 border-2 border-white/10 rounded-2xl px-6 py-5 text-center text-white text-xl focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700 font-mono font-bold tracking-wider uppercase"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPh('welcome')}
                className="w-1/3 py-4 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-700 transition-all text-xs"
              >
                Back
              </button>
              <button
                disabled={playerName.trim().length < 2}
                onClick={() => setPh('choose_avatar')}
                className={`flex-1 py-4 rounded-xl font-black uppercase tracking-wider transition-all text-xs ${
                  playerName.trim().length >= 2
                    ? 'bg-emerald-500 text-black hover:scale-[1.01] shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                Confirm Name →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: CHOOSE AVATAR / FACE */}
        {phase === 'choose_avatar' && (
          <motion.div
            key="choose_avatar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md space-y-8 z-10 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="text-center space-y-1">
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Identity Profile – Step 2
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Choose Face</h2>
              <p className="text-slate-400 text-xs">
                Select your character's facial profile portrait.
              </p>
            </div>

            {/* Grid of 8 Portraits */}
            <div className="grid grid-cols-4 gap-3">
              {PLAYER_AVATARS.map(av => {
                const isSelected = selectedAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatarId(av.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                        : 'bg-slate-950/60 border-2 border-transparent hover:bg-slate-900'
                    }`}
                  >
                    <Avatar avatarId={av.id} size={56} />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPh('enter_name')}
                className="w-1/3 py-4 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-700 transition-all text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setPh('choose_origin')}
                className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase tracking-wider rounded-xl hover:scale-[1.01] transition-all text-xs shadow-lg shadow-emerald-500/10"
              >
                Confirm Face →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: CHOOSE ORIGIN */}
        {phase === 'choose_origin' && (
          <motion.div
            key="choose_origin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl space-y-6 z-10 p-6 md:p-8 rounded-[2.5rem] bg-slate-900/60 border border-white/5 backdrop-blur-md max-h-[92vh] overflow-y-auto custom-scrollbar"
          >
            {/* Added standard locator header for smoke test mapping */}
            <div className="text-center space-y-1">
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Identity Profile – Step 3
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Shape Your Story</h2>
              <p className="text-slate-400 text-xs">
                Select your Origin background. This defines your starting variables, bonuses, and systemic conditions.
              </p>
            </div>

            {/* Main responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

              {/* Left Column: Origin Buttons Selection */}
              <div className="md:col-span-4 flex flex-col gap-2.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  Select Origin Path
                </span>
                {filteredCategories.map(cat => {
                  const isSelected = selectedCatId === cat.id;
                  let badgeText = "Medium";
                  let badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/25";

                  if (cat.id === 'street_kid') {
                    badgeText = "Hard";
                    badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/25";
                  } else if (cat.id === 'benefactor') {
                    badgeText = "Easy";
                    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                  } else if (cat.id === 'legacy') {
                    badgeText = "Special";
                    badgeStyle = "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
                  }

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/10'
                          : 'bg-slate-950/60 border-white/5 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="block text-sm font-black text-white uppercase">{cat.name}</span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                          {cat.description}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Detailed Presentation */}
              <div className="md:col-span-8 space-y-4">

                {/* PART 2 Expanded Details Presentation Card */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4 text-left">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                      Origin Presentation Profile
                    </span>
                    <h3 className="text-xl font-black uppercase text-emerald-400 mt-1">
                      {activeCategory.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Short Description</span>
                      <p className="text-slate-300 font-medium">
                        {ORIGIN_DETAILS[selectedCatId]?.shortDescription}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Starting Mindset</span>
                      <p className="text-slate-300 italic font-medium">
                        "{ORIGIN_DETAILS[selectedCatId]?.mindset}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-400">Advantages & Perks</span>
                      <p className="text-emerald-300 font-bold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                        {ORIGIN_DETAILS[selectedCatId]?.advantages}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-rose-400">Disadvantages & Risks</span>
                      <p className="text-rose-300 font-bold bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                        {ORIGIN_DETAILS[selectedCatId]?.disadvantages}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                    <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Long-Term Playstyle Hint</span>
                    <p className="text-slate-400 bg-white/[0.01] p-2.5 rounded-xl border border-white/5 font-medium">
                      {ORIGIN_DETAILS[selectedCatId]?.playstyle}
                    </p>
                  </div>
                </div>

                {/* Specific Variation Selector under details */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Select Specific Starter Specialization ({activeCategory.name})
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {activeCategory.variations.map(v => {
                      const isVarSelected = selectedVarId === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVarId(v.id)}
                          className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                            isVarSelected
                              ? 'bg-white/10 border-white/40 ring-1 ring-white/15'
                              : 'bg-slate-950/40 border-white/5 opacity-75 hover:opacity-100 hover:bg-slate-950/70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{v.icon}</span>
                            <div className="space-y-0.5">
                              <span className="block text-xs font-black text-white uppercase">{v.name}</span>
                              <span className="block text-[10px] text-slate-400 max-w-[400px] line-clamp-1">{v.flavor}</span>
                            </div>
                          </div>
                          <div className="text-right pl-4">
                            <span className="block text-xs font-mono font-black text-emerald-400">
                              +${v.starterBag.toLocaleString()}
                            </span>
                            <span className="text-[8px] uppercase font-bold text-slate-500">Starter Capital</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setPh('choose_avatar')}
                className="w-1/4 py-4 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-700 transition-all text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setPh('opening_cinematic')}
                className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase tracking-wider rounded-xl hover:scale-[1.01] transition-all text-xs shadow-lg shadow-emerald-500/10 text-center"
              >
                Confirm Origin & Proceed →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: OPENING CINEMATIC */}
        {phase === 'opening_cinematic' && (
          <motion.div
            key="opening_cinematic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center max-w-lg space-y-12 z-10 flex flex-col items-center justify-center h-full px-6"
          >
            <motion.div
              key={cinematicIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <div className="space-y-2 mb-6">
                <h1 className="text-4xl md:text-6xl font-black tracking-[0.25em] text-center uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] font-mono italic">
                  BAG CHASER
                </h1>
                <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase font-black">
                  A LEGEND IS BORN
                </p>
              </div>
              <h2
                className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight leading-tight max-w-md mx-auto text-slate-200"
                style={{
                  textShadow: '0 0 40px rgba(255,255,255,0.1)',
                }}
              >
                {cinematicLines[cinematicIndex].text}
              </h2>
            </motion.div>

            <button
              onClick={() => setPh('advisor_intro')}
              className="text-[9px] uppercase tracking-widest text-slate-500 font-black hover:text-white transition-all pt-12 animate-pulse"
            >
              Skip Cinematic →
            </button>
          </motion.div>
        )}

        {/* STEP 6: ADVISOR INTRODUCTION */}
        {phase === 'advisor_intro' && (
          <motion.div
            key="advisor_intro"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg space-y-6 z-10 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 backdrop-blur-md text-left"
          >
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
                🧠
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  SYSTEMIC STRATEGIC ADVISOR
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Briefing: {playerName}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed italic bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                "{advisorDialogue.text}"
              </p>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="block font-black text-emerald-400 uppercase tracking-wide mb-1">
                  Advisor Strategic Highlight
                </span>
                <span className="text-slate-200 font-medium">
                  {advisorDialogue.highlight}
                </span>
              </div>
            </div>

            <button
              onClick={() => setPh('first_month')}
              className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-emerald-500/10 text-sm text-center"
            >
              Acknowledge Briefing →
            </button>
          </motion.div>
        )}

        {/* STEP 7: FIRST MONTH */}
        {phase === 'first_month' && (
          <motion.div
            key="first_month"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-md space-y-8 z-10 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="space-y-2">
              <div className="text-5xl animate-bounce">🎬</div>
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Initialization Complete
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Your Life Begins</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                You are about to enter Month 1 of your life. Every month carries expenses, opportunities, and systemic interactions. Build your legacy wisely.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-left space-y-1.5 font-medium text-slate-300">
              <div className="text-white font-bold block mb-1">Initial Profile Summary:</div>
              <div>• Alias: <span className="font-mono text-emerald-400 font-bold">{playerName}</span></div>
              <div>• Origin Class: <span className="text-emerald-400 font-bold uppercase">{activeCategory.name}</span></div>
              <div>• Starter Job: <span className="text-slate-200 font-bold">{activeVariation.name}</span></div>
              <div>• Starter Funds: <span className="font-mono text-emerald-400 font-bold">${activeVariation.starterBag}</span></div>
            </div>

            <button
              onClick={handleEnterWorld}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-emerald-500/10 text-sm"
            >
              Enter Month 1: Start Game
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
