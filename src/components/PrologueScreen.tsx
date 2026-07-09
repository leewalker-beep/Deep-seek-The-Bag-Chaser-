import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';
import { PLAYER_AVATARS } from '../config/avatars';
import Avatar from './Avatar';

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
        className="absolute inset-[-200%] opacity-[0.35] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          animation: 'noise-anim 0.2s infinite steps(1)',
        }}
      />
    </div>
  </>
);

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  // State machine: 'opening' | 'ch1_intro' | 'ch1_game' | 'ch1_results' | 'ch2_choice' | 'ch3_upgrade' | 'ch4_intro' | 'ch4_game' | 'ch4_results' | 'ch5_future' | 'character_select'
  const [phase, setPh] = useState<
    | 'opening'
    | 'ch1_intro'
    | 'ch1_game'
    | 'ch1_results'
    | 'ch2_choice'
    | 'ch3_upgrade'
    | 'ch4_intro'
    | 'ch4_game'
    | 'ch4_results'
    | 'ch5_future'
    | 'character_select'
  >('opening');

  // Cinematic lines for Screen 1
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

  // Prologue state values
  const [prologueCash, setPrologueCash] = useState(0);
  const [prologueClout, setPrologueClout] = useState(0);
  const [prologueAura, setPrologueAura] = useState(0);
  const [prologueBiography, setPrologueBiography] = useState<string[]>([]);
  const [prologueBioKeys, setPrologueBioKeys] = useState<string[]>([]);
  const [prologueHustlePlays, setPrologueHustlePlays] = useState<Record<string, number>>({});
  const [prologueTotalHustles, setPrologueTotalHustles] = useState(0);
  const [prologueActionLog, setPrologueActionLog] = useState<any[]>([]);

  // Upgrade option selected in Chapter 3
  const [activeUpgrade, setActiveUpgrade] = useState<'gloves' | 'magnet' | null>(null);

  // Floating text feedback for minigames
  const [floatingTexts, setFloatingTexts] = useState<
    { id: number; text: string; x: number; y: number; color?: string }[]
  >([]);
  const nextFloatingId = useRef(0);

  const addFloatingText = (text: string, x: number, y: number, color?: string) => {
    const id = nextFloatingId.current++;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  // Chapter 1 Mini-Game: Copper Salvage tapping (5 seconds)
  const [ch1TimeLeft, setCh1TimeLeft] = useState(5.0);
  const [ch1Score, setCh1Score] = useState(0);
  const ch1ActiveRef = useRef(false);

  useEffect(() => {
    if (phase === 'ch1_game') {
      setCh1Score(0);
      setCh1TimeLeft(5.0);
      ch1ActiveRef.current = true;
      const interval = setInterval(() => {
        setCh1TimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            ch1ActiveRef.current = false;
            // Record Chapter 1
            const earned = ch1Score * 15;
            const guaranteedEarned = Math.max(200, earned);
            setPrologueCash(guaranteedEarned);
            setPrologueTotalHustles(t => t + 1);
            setPrologueHustlePlays(p => ({ ...p, r_scrap: (p.r_scrap || 0) + 1 }));
            setPrologueActionLog(log => [
              ...log,
              {
                month: 0,
                tier: 'MUD',
                hustleId: 'r_scrap',
                hustleName: 'Scrap Metal',
                level: 1,
                branchId: 'l1',
                branchName: 'Scavenger',
                cost: 0,
                yieldCash: guaranteedEarned,
                yieldClout: 0,
                yieldAura: 0,
                netCash: guaranteedEarned,
                success: true,
              },
            ]);
            setPh('ch1_results');
            return 0;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase, ch1Score]);

  const handleCh1Tap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ch1ActiveRef.current) return;
    setCh1Score(s => s + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addFloatingText('+$15', x, y, 'text-emerald-400');
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  // Chapter 2 Choice details
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const handleCh2Choice = (choice: 'share' | 'ignore' | 'threaten') => {
    setSelectedChoiceId(choice);
    let cashChange = 0;
    let cloutChange = 0;
    let auraChange = 0;
    let bioEntry = '';
    let bioKey = '';

    if (choice === 'share') {
      cashChange = -50;
      cloutChange = 10;
      auraChange = 10;
      bioEntry = 'Shared your first earnings to buy food for a hungry neighborhood kid, earning early respect on the block.';
      bioKey = 'prologue_shared_food';
    } else if (choice === 'ignore') {
      cashChange = 0;
      cloutChange = 0;
      auraChange = -5;
      bioEntry = 'Walked past a hungry kid, holding tightly to your hard-earned copper. Survival comes first.';
      bioKey = 'prologue_survival_first';
    } else {
      cashChange = 0;
      cloutChange = 15;
      auraChange = -10;
      bioEntry = 'Aggressively chased off a local kid trying to ask for cash, earning a cold, feared reputation early.';
      bioKey = 'prologue_feared_start';
    }

    setPrologueCash(c => Math.max(0, c + cashChange));
    setPrologueClout(c => c + cloutChange);
    setPrologueAura(a => a + auraChange);
    setPrologueBiography(b => [...b, bioEntry]);
    setPrologueBioKeys(k => [...k, bioKey]);
    setPrologueActionLog(log => [
      ...log,
      {
        month: 0,
        tier: 'MUD',
        hustleId: 'reflection_choice',
        hustleName: 'First Choice',
        level: 1,
        branchId: choice,
        branchName: choice === 'share' ? 'Share Wealth' : choice === 'ignore' ? 'Keep Capital' : 'Feared Instinct',
        cost: Math.abs(Math.min(0, cashChange)),
        yieldCash: 0,
        yieldClout: cloutChange,
        yieldAura: auraChange,
        netCash: cashChange,
        success: true,
      },
    ]);

    setTimeout(() => {
      setPh('ch3_upgrade');
    }, 1500);
  };

  // Chapter 3 Upgrade logic
  const handleCh3Upgrade = (upgrade: 'gloves' | 'magnet') => {
    const cost = upgrade === 'gloves' ? 100 : 150;
    if (prologueCash < cost) return; // fail-safe

    setPrologueCash(c => c - cost);
    setActiveUpgrade(upgrade);
    setPrologueBiography(b => [
      ...b,
      `Invested early cash in a professional tool (${upgrade === 'gloves' ? 'Heavy Gloves' : 'Industrial Sweep Magnet'}) to scale productivity.`,
    ]);
    setPh('ch4_intro');
  };

  // Chapter 4 Mini-Game: Sorting gold from debris (8 seconds)
  const [ch4TimeLeft, setCh4TimeLeft] = useState(8.0);
  const [ch4Score, setCh4Score] = useState(0);
  const [ch4Items, setCh4Items] = useState<{ id: number; type: 'gold' | 'rust'; x: number; y: number; speed: number }[]>([]);
  const ch4ActiveRef = useRef(false);
  const nextItemId = useRef(0);

  useEffect(() => {
    if (phase === 'ch4_game') {
      setCh4Score(0);
      setCh4TimeLeft(8.0);
      setCh4Items([]);
      ch4ActiveRef.current = true;

      // Timer
      const interval = setInterval(() => {
        setCh4TimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            ch4ActiveRef.current = false;
            // Calculate yield: gold has 40 base yield. Multiplied by tool upgrade!
            const multiplier = activeUpgrade === 'magnet' ? 2.0 : activeUpgrade === 'gloves' ? 1.5 : 1.0;
            const earned = Math.round(ch4Score * 40 * multiplier);

            setPrologueCash(c => c + earned);
            setPrologueTotalHustles(t => t + 1);
            setPrologueHustlePlays(p => ({ ...p, r_scrap: (p.r_scrap || 0) + 1 }));
            setPrologueActionLog(log => [
              ...log,
              {
                month: 0,
                tier: 'MUD',
                hustleId: 'r_scrap_metals',
                hustleName: 'Precious Sorting',
                level: 2,
                branchId: 'l2',
                branchName: 'Precious Salvage',
                cost: 0,
                yieldCash: earned,
                yieldClout: 5,
                yieldAura: 2,
                netCash: earned,
                success: true,
              },
            ]);
            setPrologueClout(c => c + 5);
            setPrologueAura(a => a + 2);

            setPh('ch4_results');
            return 0;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }, 100);

      // Spawning loop
      const spawnInterval = setInterval(() => {
        if (!ch4ActiveRef.current) return;
        const isGold = Math.random() > 0.4;
        setCh4Items(prev => [
          ...prev,
          {
            id: nextItemId.current++,
            type: isGold ? 'gold' : 'rust',
            x: -20,
            y: 30 + Math.random() * 50,
            speed: 3 + Math.random() * 4,
          },
        ]);
      }, 600);

      // Animation frame loop for item movement
      let animationFrameId: number;
      const updateMovement = () => {
        if (ch4ActiveRef.current) {
          setCh4Items(prev =>
            prev
              .map(item => ({ ...item, x: item.x + item.speed }))
              .filter(item => item.x < 110)
          );
          animationFrameId = requestAnimationFrame(updateMovement);
        }
      };
      animationFrameId = requestAnimationFrame(updateMovement);

      return () => {
        clearInterval(interval);
        clearInterval(spawnInterval);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [phase, ch4Score, activeUpgrade]);

  const handleCh4TapItem = (id: number, type: 'gold' | 'rust', e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ch4ActiveRef.current) return;
    e.stopPropagation();

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 150;
    const y = rect ? e.clientY - rect.top : 150;

    const multiplier = activeUpgrade === 'magnet' ? 2.0 : activeUpgrade === 'gloves' ? 1.5 : 1.0;

    if (type === 'gold') {
      setCh4Score(s => s + 1);
      const val = Math.round(40 * multiplier);
      addFloatingText(`+$${val}`, x, y, 'text-yellow-400');
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      addFloatingText('Debris! -0', x, y, 'text-red-500');
      if (navigator.vibrate) navigator.vibrate([15, 15]);
    }
    setCh4Items(prev => prev.filter(item => item.id !== id));
  };

  // Chapter 5 Cinematic Future montage controls
  const [futureIndex, setFutureIndex] = useState(0);
  const futureCards = [
    {
      title: '🏗️ Build Local Businesses',
      desc: 'Invest in real assets. Scale from manual labor to street-side taco stands, automatic vending machines, and local institution delis.',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: '📈 Trade High-Stakes Markets',
      desc: 'Command complex portfolios. Allocate capital into venture capital rounds, real estate trusts, and highly leveraged private equity buyouts.',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400',
    },
    {
      title: '💎 Command Elite Luxury',
      desc: 'Dazzle the rivals with absolute flex. Acquire heavy luxury items: designer watches, hypercars, massive penthouses, and private islands.',
      color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
    {
      title: '⚔️ Destroy Hostile Rivals',
      desc: 'Competitors will challenge you at every tier. Counter-bid, launch hostile corporate sabotage, or trigger deep retaliations.',
      color: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400',
    },
    {
      title: '🏛️ Claim the Oval Office',
      desc: 'Appoint candidate archetypes to your Cabinet, direct military generals, pass economy-shifting bills, and manage geopolitical crises.',
      color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/30 text-yellow-400',
    },
    {
      title: '🏆 Carve a Legends History',
      desc: 'Every milestone, failure, arrest, and choice writes your biography. Ensure your story finishes at the top of the permanent Hall of Fame.',
      color: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/30 text-indigo-400',
    },
  ];

  useEffect(() => {
    if (phase === 'ch5_future') {
      const interval = setInterval(() => {
        setFutureIndex(prev => {
          if (prev >= futureCards.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Character selection states
  const [selectedCatId, setSelectedCatId] = useState('street_kid');
  const [selectedVarId, setSelectedVarId] = useState('sk_delivery');
  const [selectedAvatarId, setSelectedAvatarId] = useState('av_m1');
  const [playerName, setPlayerName] = useState('');

  const filteredCategories = useMemo(() => {
    return BACKGROUND_CATEGORIES.filter(c => c.id !== 'legacy'); // Hide legacy by default
  }, []);

  const activeCategory = useMemo(() => {
    return BACKGROUND_CATEGORIES.find(c => c.id === selectedCatId) || BACKGROUND_CATEGORIES[0];
  }, [selectedCatId]);

  const activeVariation = useMemo(() => {
    return activeCategory.variations.find(v => v.id === selectedVarId) || activeCategory.variations[0];
  }, [activeCategory, selectedVarId]);

  // Handle default variation update when category changes
  const handleSelectCategory = (catId: string) => {
    setSelectedCatId(catId);
    const cat = BACKGROUND_CATEGORIES.find(c => c.id === catId);
    if (cat && cat.variations.length > 0) {
      setSelectedVarId(cat.variations[0].id);
    }
  };

  const handleEnterWorld = () => {
    if (playerName.trim().length < 2) return;
    onStart(
      playerName.trim().toUpperCase(),
      activeVariation.id,
      activeCategory.id,
      activeVariation.id,
      selectedAvatarId,
      {
        bag: prologueCash,
        clout: prologueClout,
        aura: prologueAura,
        biography: [
          `Left behind the shadows of your old life to make something of yourself.`,
          ...prologueBiography,
        ],
        recordedBioKeys: ['prologue_origin', ...prologueBioKeys],
        hustlePlays: prologueHustlePlays,
        totalHustlesCompleted: prologueTotalHustles,
        actionLog: prologueActionLog,
      }
    );
  };

  // Cinematic sequence handler
  useEffect(() => {
    if (phase === 'opening') {
      const timer = setInterval(() => {
        setCinematicIndex(prev => {
          if (prev >= cinematicLines.length - 1) {
            clearInterval(timer);
            setTimeout(() => {
              setPh('ch1_intro');
            }, 3000);
            return prev;
          }
          return prev + 1;
        });
      }, 3200);
      return () => clearInterval(timer);
    }
  }, [phase]);

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-hidden select-none bg-slate-950 text-white"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0d0d1a 0%, #030308 100%)',
      }}
    >
      <GrainOverlay />

      <AnimatePresence mode="wait">
        {/* PHASE: OPENING CINEMATIC */}
        {phase === 'opening' && (
          <motion.div
            key="opening"
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
              <p className="text-slate-500 text-[10px] tracking-[0.4em] uppercase font-black">
                Prologue – Origin
              </p>
              <h1
                className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight max-w-md mx-auto"
                style={{
                  textShadow: '0 0 40px rgba(255,255,255,0.1)',
                }}
              >
                {cinematicLines[cinematicIndex].text}
              </h1>
            </motion.div>

            {/* Skipping button to speed up testing */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              whileHover={{ opacity: 0.8 }}
              onClick={() => setPh('ch1_intro')}
              className="text-[9px] uppercase tracking-widest text-slate-500 font-bold hover:text-white transition-all pt-12"
            >
              Skip Prologue →
            </motion.button>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 1 INTRO */}
        {phase === 'ch1_intro' && (
          <motion.div
            key="ch1_intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center max-w-md space-y-8 z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="space-y-2">
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Chapter 1
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">The First Hustle</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                You begin in the mud. No reputation. No cash. No influence.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                A scrap copper heap sits in front of you. Work fast and salvage as much as possible before the yard owner returns!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 space-y-1">
              <div className="font-bold text-slate-200">How to play:</div>
              <div>Tap or click rapidly on the scrap heap pile.</div>
              <div>Each tap salvages copper and awards <span className="text-emerald-400 font-bold">+$15</span>.</div>
            </div>

            <button
              onClick={() => setPh('ch1_game')}
              className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-emerald-500/10"
            >
              Start Scraping →
            </button>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 1 GAMEPLAY */}
        {phase === 'ch1_game' && (
          <motion.div
            key="ch1_game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm flex flex-col items-center justify-center space-y-8 z-10"
          >
            <div className="w-full flex justify-between items-center px-2">
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                  FIRST CASH
                </span>
                <div className="text-3xl font-mono font-black text-emerald-400">
                  ${ch1Score * 15}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                  TIME LEFT
                </span>
                <div className="text-3xl font-mono font-black text-white">{ch1TimeLeft.toFixed(1)}s</div>
              </div>
            </div>

            <div
              onPointerDown={handleCh1Tap}
              className="w-full h-80 relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-500/20 bg-gradient-to-b from-slate-900/40 to-slate-950/80 cursor-pointer overflow-hidden active:scale-[0.98] transition-transform shadow-2xl"
              style={{ touchAction: 'none' }}
            >
              {/* Central wire heap node */}
              <div className="w-32 h-32 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-6xl shadow-inner relative z-10 animate-pulse">
                🏗️
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
              </div>

              <div className="mt-6 text-center z-10">
                <p className="text-xs text-emerald-400 font-black tracking-widest uppercase animate-bounce">
                  TAP THE PILE RAPIDLY!
                </p>
                <p className="text-[10px] text-slate-500 uppercase mt-1">
                  Every tap gathers copper wire
                </p>
              </div>

              {/* Taps count badge */}
              <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-[10px] font-black text-emerald-400">
                {ch1Score} Taps
              </div>

              {/* Render local floating texts */}
              {floatingTexts.map(f => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 1, scale: 1, y: f.y }}
                  animate={{ opacity: 0, scale: 1.4, y: f.y - 60 }}
                  transition={{ duration: 0.6 }}
                  className={`absolute font-mono font-black text-lg pointer-events-none select-none ${f.color || 'text-emerald-400'}`}
                  style={{ left: f.x }}
                >
                  {f.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 1 RESULTS */}
        {phase === 'ch1_results' && (
          <motion.div
            key="ch1_results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center max-w-md space-y-8 z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="space-y-3">
              <div className="text-4xl">💰</div>
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Success
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Haul Secured!</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                The yard owner didn't catch you. You successfully sorted and sold the copper wire scrap pile.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">
                  Total Taps
                </span>
                <span className="text-white font-black text-2xl">{ch1Score}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">
                  First Cash Earned
                </span>
                <span className="text-emerald-400 font-black text-2xl">${prologueCash}</span>
              </div>
            </div>

            <button
              onClick={() => setPh('ch2_choice')}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
            >
              Continue →
            </button>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 2 FIRST CHOICE */}
        {phase === 'ch2_choice' && (
          <motion.div
            key="ch2_choice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-md space-y-8 z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md text-left"
          >
            <div className="text-center space-y-2">
              <span className="text-[10px] text-blue-400 tracking-[0.3em] font-black uppercase">
                Chapter 2
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-center">First Choice</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                With a pocket full of fresh dollar bills, you walk down a dark avenue. A young local kid looks up at you with wide eyes.
              </p>
              <p className="text-slate-200 text-sm font-medium italic p-4 rounded-2xl bg-white/[0.02] border-l-4 border-blue-400">
                "Yo, share a couple of bucks? I haven't eaten a single thing in two days..."
              </p>
            </div>

            <div className="space-y-3">
              {/* Choice 1: Share food */}
              <button
                disabled={selectedChoiceId !== null}
                onClick={() => handleCh2Choice('share')}
                className={`w-full p-5 rounded-2xl text-left border transition-all ${
                  selectedChoiceId === 'share'
                    ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500'
                    : selectedChoiceId !== null
                    ? 'opacity-40 border-white/5 bg-transparent'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">A. Buy them a hot meal</span>
                  <span className="text-xs font-mono font-black text-red-400">-$50</span>
                </div>
                <div className="text-xs text-slate-400">
                  Earn early respect and build your aura on the block. (+10 Clout, +10 Aura)
                </div>
              </button>

              {/* Choice 2: Ignore */}
              <button
                disabled={selectedChoiceId !== null}
                onClick={() => handleCh2Choice('ignore')}
                className={`w-full p-5 rounded-2xl text-left border transition-all ${
                  selectedChoiceId === 'ignore'
                    ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
                    : selectedChoiceId !== null
                    ? 'opacity-40 border-white/5 bg-transparent'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">B. Ignore and walk past</span>
                  <span className="text-xs font-mono font-black text-emerald-400">-$0</span>
                </div>
                <div className="text-xs text-slate-400">
                  Keep every single dime. Survival takes absolute priority. (-5 Aura)
                </div>
              </button>

              {/* Choice 3: Threaten */}
              <button
                disabled={selectedChoiceId !== null}
                onClick={() => handleCh2Choice('threaten')}
                className={`w-full p-5 rounded-2xl text-left border transition-all ${
                  selectedChoiceId === 'threaten'
                    ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500'
                    : selectedChoiceId !== null
                    ? 'opacity-40 border-white/5 bg-transparent'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white text-sm">C. Threaten them to back off</span>
                  <span className="text-xs font-mono font-black text-emerald-400">-$0</span>
                </div>
                <div className="text-xs text-slate-400">
                  Project strength and dominance, but draw local heat. (+15 Clout, -10 Aura, +10 Heat)
                </div>
              </button>
            </div>

            {selectedChoiceId && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center font-bold text-xs text-blue-400 tracking-wider uppercase animate-pulse"
              >
                ✓ Decision recorded. Your choices shape your destiny.
              </motion.div>
            )}
          </motion.div>
        )}

        {/* PHASE: CHAPTER 3 UPGRADE */}
        {phase === 'ch3_upgrade' && (
          <motion.div
            key="ch3_upgrade"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center max-w-md space-y-8 z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="space-y-2">
              <span className="text-[10px] text-purple-400 tracking-[0.3em] font-black uppercase">
                Chapter 3
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">The First Upgrade</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Raw hands and raw street experience. To scale, you must invest in yourself.
              </p>
              <p className="text-slate-400 text-xs italic">
                Choose a professional tool. This is the key to unlocking massive multipliers on future payouts!
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex justify-between items-center font-mono">
              <span className="text-xs uppercase text-slate-500 font-black">Your Current Funds</span>
              <span className="text-emerald-400 text-2xl font-black">${prologueCash}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option A: Heavy-Duty Gloves */}
              <button
                disabled={prologueCash < 100}
                onClick={() => handleCh3Upgrade('gloves')}
                className={`p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                  prologueCash < 100
                    ? 'opacity-30 border-white/5 cursor-not-allowed bg-transparent'
                    : 'bg-white/[0.02] border-white/5 hover:border-purple-500/40 hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-black text-sm text-white">🧤 Heavy-Duty Work Gloves</div>
                  <div className="text-xs text-slate-400">
                    Provides grip and safety. Grants <span className="text-purple-400 font-bold">1.5x Yields</span> in Chapter 4.
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-red-400 font-mono">-$100</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Cost</div>
                </div>
              </button>

              {/* Option B: Industrial Sweep Magnet */}
              <button
                disabled={prologueCash < 150}
                onClick={() => handleCh3Upgrade('magnet')}
                className={`p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                  prologueCash < 150
                    ? 'opacity-30 border-white/5 cursor-not-allowed bg-transparent'
                    : 'bg-white/[0.02] border-white/5 hover:border-purple-500/40 hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-black text-sm text-white">🧲 Industrial Sweep Magnet</div>
                  <div className="text-xs text-slate-400">
                    Attracts high-value alloys. Grants <span className="text-purple-400 font-bold">2.0x Yields</span> in Chapter 4.
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-red-400 font-mono">-$150</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Cost</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 4 INTRO */}
        {phase === 'ch4_intro' && (
          <motion.div
            key="ch4_intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center max-w-md space-y-8 z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="space-y-2">
              <span className="text-[10px] text-amber-400 tracking-[0.3em] font-black uppercase">
                Chapter 4
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Second Hustle: Precious Sorting</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Skill and investments create massive wealth.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                You've accessed a container of premium electrical scraps. High-value Gold and Rust Debris items will roll by.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-xs">
              <div className="space-y-1">
                <div className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">Active Tool</div>
                <div className="text-purple-400 font-black text-sm">
                  {activeUpgrade === 'magnet' ? '🧲 SWEEP MAGNET' : '🧤 WORK GLOVES'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">Cash Multiplier</div>
                <div className="text-emerald-400 font-black text-sm">
                  {activeUpgrade === 'magnet' ? '2.0x Active' : '1.5x Active'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 space-y-1">
              <div className="font-bold text-slate-200 text-center">How to play:</div>
              <div>Items fly rapidly from left to right.</div>
              <div>Tap **only** the Gold items <span className="text-yellow-400 font-bold">(🌟/💰)</span>.</div>
              <div>Avoid tapping the rusty junk items.</div>
            </div>

            <button
              onClick={() => setPh('ch4_game')}
              className="w-full py-5 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-amber-500/10"
            >
              Start Sorting →
            </button>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 4 GAMEPLAY */}
        {phase === 'ch4_game' && (
          <motion.div
            key="ch4_game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm flex flex-col items-center justify-center space-y-6 z-10"
          >
            <div className="w-full flex justify-between items-center px-2">
              <div className="text-left">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                  GOLD FOUND
                </span>
                <div className="text-3xl font-mono font-black text-yellow-400">
                  {ch4Score} <span className="text-xs text-slate-500">Gold</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                  TIME LEFT
                </span>
                <div className="text-3xl font-mono font-black text-white">{ch4TimeLeft.toFixed(1)}s</div>
              </div>
            </div>

            <div className="w-full h-80 relative rounded-3xl border-2 border-dashed border-amber-500/20 bg-gradient-to-b from-slate-900/40 to-slate-950/80 overflow-hidden shadow-2xl">
              {/* Conveyor Belt Guideline */}
              <div className="absolute top-[50%] left-0 right-0 h-1 bg-slate-800 border-b border-dashed border-white/5 transform translate-y-[-50%]" />

              <AnimatePresence>
                {ch4Items.map(item => (
                  <button
                    key={item.id}
                    onPointerDown={(e) => handleCh4TapItem(item.id, item.type, e)}
                    className="absolute w-12 h-12 flex items-center justify-center text-3xl focus:outline-none select-none transition-transform active:scale-[0.8] pointer-events-auto"
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20,
                    }}
                  >
                    {item.type === 'gold' ? (Math.random() > 0.5 ? '🌟' : '💰') : (Math.random() > 0.5 ? '🧱' : '🔩')}
                  </button>
                ))}
              </AnimatePresence>

              {/* Multiplier Badge */}
              <div className="absolute bottom-4 left-4 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-wider">
                ⚡ Tool Yield: {activeUpgrade === 'magnet' ? '2.0x' : '1.5x'}
              </div>

              {/* Render local floating texts */}
              {floatingTexts.map(f => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 1, scale: 1, y: f.y }}
                  animate={{ opacity: 0, scale: 1.4, y: f.y - 60 }}
                  transition={{ duration: 0.6 }}
                  className={`absolute font-mono font-black text-lg pointer-events-none select-none ${f.color || 'text-yellow-400'}`}
                  style={{ left: f.x }}
                >
                  {f.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 4 RESULTS */}
        {phase === 'ch4_results' && (
          <motion.div
            key="ch4_results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center max-w-md space-y-8 z-10 p-8 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md"
          >
            <div className="space-y-3">
              <div className="text-4xl">🌟</div>
              <span className="text-[10px] text-amber-400 tracking-[0.3em] font-black uppercase">
                Hustle complete
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Sorting Complete!</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Skill meets technology. Your investment in professional gear generated high-purity yields!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">
                  Gold Harvested
                </span>
                <span className="text-white font-black text-2xl">{ch4Score}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">
                  Cash Flow Earned
                </span>
                <span className="text-emerald-400 font-black text-2xl">
                  ${Math.round(ch4Score * 40 * (activeUpgrade === 'magnet' ? 2.0 : activeUpgrade === 'gloves' ? 1.5 : 1.0))}
                </span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">
                Prologue Wallet Balance
              </span>
              <span className="text-emerald-400 font-black text-3xl font-mono">${prologueCash}</span>
            </div>

            <button
              onClick={() => setPh('ch5_future')}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
            >
              See the Future →
            </button>
          </motion.div>
        )}

        {/* PHASE: CHAPTER 5 FUTURE MONTAGE */}
        {phase === 'ch5_future' && (
          <motion.div
            key="ch5_future"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md space-y-8 z-10 flex flex-col items-center justify-center px-4"
          >
            <div className="text-center space-y-1.5">
              <span className="text-[10px] text-pink-400 tracking-[0.3em] font-black uppercase">
                Chapter 5
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">A Glimpse of the Future</h2>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                Escape the mud. Build your legacy. Write your story.
              </p>
            </div>

            <div className="relative w-full h-44 overflow-hidden rounded-3xl border border-white/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={futureIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-b p-6 flex flex-col justify-center space-y-2 text-left rounded-3xl border ${futureCards[futureIndex].color}`}
                >
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    {futureCards[futureIndex].title}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {futureCards[futureIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stepper Dots */}
            <div className="flex gap-2 justify-center">
              {futureCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === futureIndex ? 'bg-pink-400 w-6' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="text-center pt-4 space-y-4">
              <p className="text-xl md:text-2xl font-black italic tracking-wide text-white uppercase tracking-tighter animate-pulse">
                "Every legend begins somewhere."
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
                How far will your life go?
              </p>
            </div>

            <button
              onClick={() => setPh('character_select')}
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-pink-500/10"
            >
              Shape Your Identity →
            </button>
          </motion.div>
        )}

        {/* PHASE: CHARACTER SELECTION */}
        {phase === 'character_select' && (
          <motion.div
            key="character_select"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg space-y-6 z-10 p-4 md:p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md overflow-y-auto max-h-[90vh] custom-scrollbar animate-in"
          >
            <div className="text-center space-y-1">
              <span className="text-[10px] text-emerald-400 tracking-[0.3em] font-black uppercase">
                Final Step
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter animate-pulse">Shape Your Story</h2>
              <p className="text-slate-400 text-xs">
                Select your origin. This background defines your initial starting conditions.
              </p>
            </div>

            {/* Origin Category Grid */}
            <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-bottom duration-300">
              {filteredCategories.map(cat => {
                let badgeColor = 'bg-slate-800 text-slate-400';
                let diffLabel = 'Medium';
                if (cat.id === 'street_kid') {
                  badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  diffLabel = 'Hard';
                } else if (cat.id === 'dropout') {
                  badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  diffLabel = 'Medium';
                } else if (cat.id === 'benefactor') {
                  badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  diffLabel = 'Easy';
                }

                const isSelected = selectedCatId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-3 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white ring-2 ring-white/20'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="font-black text-xs text-white truncate uppercase mb-1">
                      {cat.name}
                    </div>
                    <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded border uppercase font-black ${badgeColor}`}>
                      {diffLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expanded Category Description, Strengths, Weaknesses, Bonuses */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 text-left">
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                  Origin Context
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeCategory.description}
                </p>
              </div>

              {/* Strengths & Weaknesses badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="block text-[8px] uppercase tracking-widest text-emerald-500 font-black">
                    Strengths
                  </span>
                  <div className="text-[10px] text-slate-200 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-lg leading-relaxed">
                    {selectedCatId === 'street_kid' && 'Sharp survival grit. +15% Cash from street level operations.'}
                    {selectedCatId === 'dropout' && 'Highly adaptable and charismatic. +20% Clout across early tiers.'}
                    {selectedCatId === 'benefactor' && 'Elite family headstart. +15% Aura at Corporate levels.'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="block text-[8px] uppercase tracking-widest text-red-400 font-black">
                    Weaknesses
                  </span>
                  <div className="text-[10px] text-slate-200 bg-red-500/5 border border-red-500/10 px-2.5 py-1.5 rounded-lg leading-relaxed">
                    {selectedCatId === 'street_kid' && 'Extremely scarce starting capital. High grind index.'}
                    {selectedCatId === 'dropout' && 'Under relentless scrutiny. Highly competitive landscape.'}
                    {selectedCatId === 'benefactor' && 'Higher rent & overhead. Lacks street survival instincts.'}
                  </div>
                </div>
              </div>

              {/* Variation selector within category */}
              <div className="space-y-2">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                  Select Specific Variation
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {activeCategory.variations.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVarId(v.id)}
                      className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        selectedVarId === v.id
                          ? 'bg-white/5 border-white/20'
                          : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{v.icon}</span>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-black text-white uppercase">{v.name}</span>
                          <span className="block text-[10px] text-slate-400 line-clamp-1">{v.flavor}</span>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap font-mono text-emerald-400 text-xs font-bold">
                        +${v.starterBag.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Choose Face Selector: Sleek layout with names beneath portraits removed */}
            <div className="space-y-2 text-left">
              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                Select Your Face
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PLAYER_AVATARS.map(av => {
                  const isSelected = selectedAvatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      onClick={() => setSelectedAvatarId(av.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-500/20 ring-2 ring-emerald-500'
                          : 'bg-slate-900/60 ring-1 ring-slate-700/50 hover:bg-slate-800/40'
                      }`}
                    >
                      <Avatar avatarId={av.id} size={48} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What they call you */}
            <div className="space-y-2 text-left">
              <label className="text-[8px] uppercase tracking-widest text-slate-500 font-black">
                Enter Your Alias
              </label>
              <input
                type="text"
                placeholder="What do they call you on the block?"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={16}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-center text-white text-lg focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-800 font-bold tracking-tight"
              />
            </div>

            {/* PROLOGUE ACCUMULATED BONUSES PREVIEW */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-2">
              <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-black">
                ✓ Prologue Stats Secured
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Prologue Cash Earned:</span>
                <span className="font-mono font-black text-emerald-400">+${prologueCash}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">First Choice Decision logged:</span>
                <span className="font-mono font-bold text-slate-300">Biography Saved</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                This cash and biography history will carry directly into your real Month 1 game.
              </div>
            </div>

            {/* FINAL ENTER WORLD ACTION */}
            <div className="pt-2">
              <button
                disabled={playerName.trim().length < 2}
                onClick={handleEnterWorld}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all ${
                  playerName.trim().length >= 2
                    ? 'bg-[#4ade80] text-black shadow-2xl shadow-[#4ade80]/20 hover:scale-[1.01]'
                    : 'bg-white/5 text-slate-700 cursor-not-allowed'
                }`}
              >
                Enter Month 1: Start Your Legacy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
