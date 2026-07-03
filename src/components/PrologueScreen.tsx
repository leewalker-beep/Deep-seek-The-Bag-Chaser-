import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';
import { useGameStore } from '../store/gameStore';
import { PLAYER_AVATARS } from '../config/avatars';
import { HERO_ARTWORK } from '../config/heroArtwork';
import Avatar from './Avatar';
import { getHallOfFameEntries } from '../utils/hallOfFame';

interface PrologueScreenProps {
  onStart: (name: string, backgroundId: string, categoryId: string, variationId: string, avatarId: string) => void;
}

const SILHOUETTES = [
  { id: 1, icon: '📦', speed: 45, delay: 0, direction: 'ltr', bottom: '10%' },
  { id: 2, icon: '🚲', speed: 35, delay: 15, direction: 'rtl', bottom: '25%' },
  { id: 3, icon: '💰', speed: 55, delay: 5, direction: 'ltr', bottom: '15%' },
  { id: 4, icon: '🛒', speed: 40, delay: 25, direction: 'rtl', bottom: '20%' },
  { id: 5, icon: '🚶', speed: 50, delay: 10, direction: 'ltr', bottom: '5%' },
];

const THEMES: Record<string, { bg: string, glow: string }> = {
  industrial: { bg: 'bg-zinc-900', glow: 'shadow-zinc-500/20' },
  neon: { bg: 'bg-slate-900', glow: 'shadow-cyan-500/30' },
  gritty: { bg: 'bg-stone-950', glow: 'shadow-orange-900/20' },
  studio: { bg: 'bg-neutral-900', glow: 'shadow-purple-500/20' },
  tech: { bg: 'bg-gray-950', glow: 'shadow-emerald-500/20' },
};

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
        className="absolute inset-[-200%] opacity-[0.4] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          animation: 'noise-anim 0.2s infinite steps(1)',
        }}
      />
    </div>
  </>
);

// --- Local Minigame Components ---

const StreetKidTrial: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'instruction' | 'countdown' | 'playing'>('instruction');
  const [phaseTimer, setPhaseTimer] = useState(2);
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked' | 'too-soon'>('waiting');
  const [reactions, setReactions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase === 'instruction') {
      const timer = setTimeout(() => {
        setPhase('countdown');
        setPhaseTimer(3);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (phase === 'countdown') {
      const timer = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const onCompleteRef = useRef(onComplete);
  const reactionsRef = useRef(reactions);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    reactionsRef.current = reactions;
  }, [onComplete, reactions]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            onCompleteRef.current(reactionsRef.current);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && gameState === 'waiting' && timeLeft > 0) {
      const waitTime = 500 + Math.random() * 1000;
      const timeout = setTimeout(() => {
        setGameState('ready');
      }, waitTime);
      return () => clearTimeout(timeout);
    }
  }, [gameState, phase]);

  const handleClick = () => {
    if (phase !== 'playing') return;
    if (gameState === 'waiting') {
      setGameState('too-soon');
      setTimeout(() => setGameState('waiting'), 300);
    } else if (gameState === 'ready') {
      setReactions(prev => prev + 1);
      setGameState('clicked');
      setTimeout(() => setGameState('waiting'), 300);
    }
  };

  return (
    <div
      onPointerDown={handleClick}
      style={{ touchAction: 'none' }}
      className={`w-full h-96 flex flex-col items-center justify-center cursor-pointer rounded-3xl transition-colors duration-200 border-8 ${
        phase === 'playing' && gameState === 'ready' ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-900 border-slate-800'
      }`}
    >
       <div className="text-white text-center pointer-events-none">
          {phase === 'instruction' && (
            <div className="text-xl font-black uppercase tracking-widest leading-tight p-8">
              Tap the button the moment it lights up
            </div>
          )}
          {phase === 'countdown' && (
            <motion.div
              key={phaseTimer}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-black text-emerald-400"
              style={{ fontSize: '120px', fontWeight: 900 }}
            >
              {Math.ceil(phaseTimer)}
            </motion.div>
          )}
          {phase === 'playing' && (
            <>
              <div className="text-6xl mb-4">{gameState === 'ready' ? '⚡' : '🛑'}</div>
              <div className="text-xl font-black uppercase tracking-widest">
                {gameState === 'ready' ? 'TAP NOW!' : 'WAIT...'}
              </div>
              <div className="mt-8 text-4xl font-mono font-black">{timeLeft.toFixed(1)}s</div>
            </>
          )}
       </div>
    </div>
  );
};

const DropoutTrial: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'instruction' | 'countdown' | 'playing'>('instruction');
  const [phaseTimer, setPhaseTimer] = useState(2);
  const [words, setWords] = useState<{ id: number, text: string, isGood: boolean, x: number, y: number, speed: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const nextId = useRef(0);
  const finishedRef = useRef(false);

  const onCompleteRef = useRef(onComplete);
  const scoreRef = useRef(score);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    scoreRef.current = score;
  }, [onComplete, score]);

  const GOOD_WORDS = ['CASH', 'PROFIT', 'BAG', 'CRYPTO', 'DEAL'];
  const BAD_WORDS = ['TAXES', 'LOAN', 'SCAM', 'DEBT', 'LOSS'];

  useEffect(() => {
    if (phase === 'instruction') {
      const timer = setTimeout(() => {
        setPhase('countdown');
        setPhaseTimer(3);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (phase === 'countdown') {
      const timer = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            onCompleteRef.current(scoreRef.current);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const spawnTimer = setInterval(() => {
      const isGood = Math.random() > 0.3;
      const text = isGood ? GOOD_WORDS[Math.floor(Math.random() * GOOD_WORDS.length)] : BAD_WORDS[Math.floor(Math.random() * BAD_WORDS.length)];
      setWords(prev => [...prev, {
        id: nextId.current++,
        text,
        isGood,
        x: 15 + Math.random() * 70,
        y: 100,
        speed: 0.4 + Math.random() * 0.2
      }]);
    }, 1500);
    return () => clearInterval(spawnTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const moveTimer = setInterval(() => {
      setWords(prev => prev.map(w => ({ ...w, y: w.y - w.speed })).filter(w => w.y > -10));
    }, 20);
    return () => clearInterval(moveTimer);
  }, [phase]);

  const handleTap = (id: number, isGood: boolean) => {
    if (isGood) setScore(s => s + 1);
    else setScore(s => Math.max(0, s - 2));
    setWords(prev => prev.filter(w => w.id !== id));
  };

  if (phase === 'instruction') {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-900 rounded-3xl border-8 border-slate-800 p-8 pointer-events-none">
        <div className="text-white text-xl font-black uppercase tracking-widest leading-tight">
          Tap only the money words
        </div>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-900 rounded-3xl border-8 border-slate-800 pointer-events-none">
        <motion.div
          key={phaseTimer}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-black text-blue-400"
          style={{ fontSize: '120px', fontWeight: 900 }}
        >
          {Math.ceil(phaseTimer)}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ touchAction: 'none' }} className="w-full h-96 bg-slate-900 rounded-3xl border-4 border-blue-400/30 relative overflow-hidden">
      <div className="absolute top-4 right-4 text-white font-mono font-black">{timeLeft.toFixed(1)}s</div>
      <AnimatePresence>
        {words.map(w => (
          <motion.button
            key={w.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onPointerDown={() => handleTap(w.id, w.isGood)}
            className={`absolute px-5 py-3 min-w-[100px] min-h-[44px] rounded-xl text-lg font-black ${w.isGood ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'}`}
            style={{ left: `${w.x}%`, top: `${w.y}%`, transform: 'translateX(-50%)' }}
          >
            {w.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

const BenefactorTrial: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'instruction' | 'countdown' | 'playing'>('instruction');
  const [phaseTimer, setPhaseTimer] = useState(2);
  const [current, setCurrent] = useState(Math.floor(Math.random() * 13));
  const [next, setNext] = useState(Math.floor(Math.random() * 13));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [rounds, setRounds] = useState(0);
  const finishedRef = useRef(false);

  const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  useEffect(() => {
    if (phase === 'instruction') {
      const timer = setTimeout(() => {
        setPhase('countdown');
        setPhaseTimer(3);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (phase === 'countdown') {
      const timer = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const onCompleteRef = useRef(onComplete);
  const scoreRef = useRef(score);
  const roundsRef = useRef(rounds);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    scoreRef.current = score;
    roundsRef.current = rounds;
  }, [onComplete, score, rounds]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1 || roundsRef.current >= 12) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            onCompleteRef.current(scoreRef.current);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  const handleGuess = (higher: boolean) => {
    const correct = (higher && next >= current) || (!higher && next <= current);
    if (correct) setScore(s => s + 1);
    setCurrent(next);
    setNext(Math.floor(Math.random() * 13));
    setRounds(r => r + 1);
  };

  if (phase === 'instruction') {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-900 rounded-3xl border-8 border-slate-800 p-8 text-center pointer-events-none">
        <div className="text-white text-xl font-black uppercase tracking-widest leading-tight">
          Will the next number be higher or lower?
        </div>
      </div>
    );
  }

  if (phase === 'countdown') {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-slate-900 rounded-3xl border-8 border-slate-800 pointer-events-none">
        <motion.div
          key={phaseTimer}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-black text-amber-400"
          style={{ fontSize: '120px', fontWeight: 900 }}
        >
          {Math.ceil(phaseTimer)}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ touchAction: 'none' }} className="w-full h-96 bg-slate-900 rounded-3xl border-4 border-yellow-600 flex flex-col items-center justify-center p-6 space-y-8 relative">
      <div className="absolute top-4 right-4 text-white font-mono font-black">{timeLeft.toFixed(1)}s</div>
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">CURRENT DATA</div>
        <div className="text-6xl font-black text-white bg-white/5 w-24 h-32 flex items-center justify-center rounded-2xl border-2 border-white/10">
          {VALUES[current]}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button onPointerDown={() => handleGuess(true)} className="bg-emerald-600 py-6 rounded-xl font-black text-white uppercase tracking-widest text-xs min-h-[44px]">Higher</button>
        <button onPointerDown={() => handleGuess(false)} className="bg-red-600 py-6 rounded-xl font-black text-white uppercase tracking-widest text-xs min-h-[44px]">Lower</button>
      </div>
      <div className="text-[10px] text-slate-500 font-black uppercase">Round {rounds}/12</div>
    </div>
  );
};

// --- Main Component ---

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  const [screen, setScreen] = useState<number>(1);
  const [name, setName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('av_m1');
  const [scores, setScores] = useState<{ street: number, dropout: number, benefactor: number }>({ street: 0, dropout: 0, benefactor: 0 });

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);

  const suggestedCategory = useMemo(() => {
    const STREET_MAX = 12;
    const DROPOUT_MAX = 20;
    const BENEFACTOR_MAX = 12;

    const s = scores.street / STREET_MAX;
    const d = scores.dropout / DROPOUT_MAX;
    const b = scores.benefactor / BENEFACTOR_MAX;

    // Tiebreak: Street Kid -> Dropout -> Benefactor
    if (s >= d && s >= b) return 'street_kid';
    if (d >= b) return 'dropout';
    return 'benefactor';
  }, [scores]);

  const { unlockedLegacyUpgradeIds } = useGameStore();

  const filteredCategories = useMemo(() => {
    return BACKGROUND_CATEGORIES.filter(cat => {
      if (cat.id === 'legacy') {
        return unlockedLegacyUpgradeIds.includes('unique_origin_chosen');
      }
      return true;
    });
  }, [unlockedLegacyUpgradeIds]);

  const winningCategory = filteredCategories.find(c => c.id === (selectedCatId || suggestedCategory));
  const suggestedVariation = winningCategory?.variations[0];
  const activeVariation = winningCategory?.variations.find(v => v.id === selectedVarId) || suggestedVariation;

  const handleMinigameComplete = (category: keyof typeof scores, score: number) => {
    setScores(prev => ({ ...prev, [category]: score }));
    setScreen(prev => prev + 1);
  };

  const { triggerTransition } = useGameStore();

  const handleFinalStart = () => {
    const trimmedName = name.trim();
    if (trimmedName.length >= 2 && activeVariation && winningCategory) {
      triggerTransition(HERO_ARTWORK.NEW_RUN);
      setTimeout(() => {
        onStart(trimmedName.toUpperCase(), activeVariation.id, winningCategory.id, activeVariation.id, selectedAvatarId);
      }, 500); // Small delay to let transition start
    }
  };

  // Screen 1: TITLE
  if (screen === 1) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-6 font-sans"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #1a1a2e 0%, #0a0a0f 70%)' }}
      >
        <GrainOverlay />

        {/* Background Blobs */}
        <div className="absolute top-[-5%] left-[-10%] w-64 h-64 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-80 h-80 rounded-full bg-purple-900/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-12">
          {(() => {
            const entries = getHallOfFameEntries();
            const biographies = entries.flatMap(e => e.biography || []);
            if (biographies.length === 0) return null;
            const randomBio = biographies[Math.floor(Math.random() * biographies.length)];
            return (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/40 border border-white/5 backdrop-blur-sm p-4 rounded-2xl max-w-xs"
              >
                <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Echoes of a Past Life</div>
                <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed uppercase tracking-tighter">
                  "{randomBio}"
                </p>
              </motion.div>
            );
          })()}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-white tracking-tighter"
              style={{ textShadow: '0 0 80px rgba(255,255,255,0.15)' }}
            >
              BAG CHASER
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 italic text-sm md:text-lg font-light tracking-widest uppercase">
              Escape the mud. Build the empire. Don't lose your soul.
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col items-center space-y-6">
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">Three trials. One path. No do-overs.</p>
            <button onClick={() => setScreen(2)} className="px-8 py-4 bg-[#4ade80] text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-[#4ade80]/20 hover:scale-105 transition-transform">
              Find out who you are →
            </button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-[5] overflow-hidden">
          {SILHOUETTES.map((s) => (
            <motion.div key={s.id} initial={{ x: s.direction === 'ltr' ? '-20vw' : '120vw', opacity: 0 }} animate={{ x: s.direction === 'ltr' ? '120vw' : '-20vw', opacity: [0, 0.3, 0.3, 0] }} transition={{ duration: s.speed, repeat: Infinity, delay: s.delay, ease: "linear", times: [0, 0.1, 0.9, 1] }} className="absolute text-7xl md:text-9xl brightness-0 filter grayscale invert-[0.1]" style={{ bottom: s.bottom, color: '#1a1a1a', opacity: 0.1 }}>
              {s.icon}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Screens 2-4: TRIALS
  if (screen >= 2 && screen <= 4) {
    const trials = [
      {
        id: 'street',
        name: 'THE STREET KID',
        flavour: 'Survive on instinct. The city doesn\'t wait.',
        component: StreetKidTrial,
        bg: 'linear-gradient(135deg, #0a1a12 0%, #0a0a0f 100%)',
        accent: 'text-emerald-400',
        border: '1px solid rgba(16,185,129,0.3)',
        shadow: '0 0 40px rgba(16,185,129,0.1)',
        blob: 'bg-emerald-500/15'
      },
      {
        id: 'dropout',
        name: 'THE DROPOUT',
        flavour: 'You\'ve always known the right thing to say.',
        component: DropoutTrial,
        bg: 'linear-gradient(135deg, #0a0f1a 0%, #0a0a0f 100%)',
        accent: 'text-blue-400',
        border: '1px solid rgba(59,130,246,0.3)',
        shadow: '0 0 40px rgba(59,130,246,0.1)',
        blob: 'bg-blue-500/15'
      },
      {
        id: 'benefactor',
        name: 'THE BENEFACTOR',
        flavour: 'Every decision is a calculated risk.',
        component: BenefactorTrial,
        bg: 'linear-gradient(135deg, #1a140a 0%, #0a0a0f 100%)',
        accent: 'text-amber-400',
        border: '1px solid rgba(245,158,11,0.3)',
        shadow: '0 0 40px rgba(245,158,11,0.1)',
        blob: 'bg-amber-500/15'
      },
    ];
    const t = trials[screen - 2];
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center"
        style={{ background: t.bg }}
      >
        <GrainOverlay />
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div>
            <div className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60 ${t.accent}`}>
              TRIAL {screen - 1} OF 3
            </div>
            <h2 className={`text-3xl font-black uppercase ${t.accent}`}>{t.name}</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium italic">"{t.flavour}"</p>
          </div>

          <div className="relative">
            {/* Centered color blob behind the box */}
            <div className={`absolute inset-0 m-auto w-48 h-48 rounded-full blur-3xl pointer-events-none ${t.blob}`} />

            <div className="relative z-10 rounded-3xl overflow-hidden"
              style={{ border: t.border, boxShadow: t.shadow }}
            >
              <t.component onComplete={(s) => handleMinigameComplete(t.id as any, s)} />
            </div>
          </div>

          <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">Score recorded silently</div>
        </div>
      </div>
    );
  }

  // Screen 5: REVEAL
  if (screen === 5) {
    const destinyLines: Record<string, string> = {
      street_kid: "The streets built you. Own it.",
      dropout: "The crowd already knows your name.",
      benefactor: "The money always finds its way to you.",
    };

    const bonusLines: Record<string, string> = {
      street_kid: "Your instincts earned you +15% cash on street hustles",
      dropout: "Your charisma earns you +20% clout through corporate tier",
      benefactor: "Your smarts earn you +15% aura at corporate and elite tiers",
    };

    const STREET_MAX = 12;
    const DROPOUT_MAX = 20;
    const BENEFACTOR_MAX = 12;

    const stats = [
      { label: "Street Instinct", score: scores.street, max: STREET_MAX, color: 'bg-emerald-500' },
      { label: "Street Charisma", score: scores.dropout, max: DROPOUT_MAX, color: 'bg-blue-500' },
      { label: "Street Smarts", score: scores.benefactor, max: BENEFACTOR_MAX, color: 'bg-amber-500' },
    ];

    const originStyles: Record<string, { bg: string, accent: string, button: string }> = {
      street_kid: {
        bg: 'linear-gradient(135deg, #0a1a12 0%, #0a0a0f 100%)',
        accent: 'text-emerald-400',
        button: 'bg-emerald-500 shadow-emerald-500/20'
      },
      dropout: {
        bg: 'linear-gradient(135deg, #0a0f1a 0%, #0a0a0f 100%)',
        accent: 'text-blue-400',
        button: 'bg-blue-500 shadow-blue-500/20'
      },
      benefactor: {
        bg: 'linear-gradient(135deg, #1a140a 0%, #0a0a0f 100%)',
        accent: 'text-amber-400',
        button: 'bg-amber-500 shadow-amber-500/20'
      },
    };

    const style = originStyles[winningCategory?.id || 'street_kid'];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center"
        style={{ background: style.bg }}
      >
        <GrainOverlay />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-12 z-10">
          <div className="space-y-4">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">YOUR DESTINY IS SEALED</div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-9xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {activeVariation?.icon}
            </motion.div>
            <motion.h2
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl font-black text-white uppercase tracking-tighter"
            >
              {winningCategory?.name}
            </motion.h2>
            <p className={`${style.accent} italic font-medium`}>"{destinyLines[winningCategory?.id || 'street_kid']}"</p>
            <div className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2 max-w-[200px] mx-auto leading-relaxed">
              {bonusLines[winningCategory?.id || 'street_kid']}
            </div>
          </div>

          {!selectedCatId ? (
            <div className="space-y-4 py-4 border-y border-white/5">
              {stats.map((s, idx) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase mb-1">
                    <span>{s.label}</span>
                    <span>{Math.round((s.score / s.max) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (s.score / s.max) * 100)}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + idx * 0.2, ease: "easeOut" }}
                      className={`h-full ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="grid grid-cols-1 gap-2">
                {winningCategory?.variations.map(v => (
                   <button key={v.id} onClick={() => setSelectedVarId(v.id)} className={`p-4 rounded-xl border text-left transition-all ${selectedVarId === v.id ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-3">
                         <span className="text-2xl">{v.icon}</span>
                         <span className="text-xs font-black text-white uppercase">{v.name}</span>
                      </div>
                   </button>
                ))}
             </div>
          )}

          <div className="space-y-3">
            <button onClick={() => setScreen(6)} className={`w-full py-6 text-black font-black uppercase tracking-widest rounded-2xl text-xl shadow-2xl ${style.button}`}>
              This is me →
            </button>
            <button onClick={() => setSelectedCatId(selectedCatId ? null : suggestedCategory)} className="w-full py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              {selectedCatId ? 'Back to suggested' : 'Override'}
            </button>
          </div>

          {selectedCatId && (
            <div className="flex justify-center gap-2">
               {filteredCategories.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCatId(c.id); setSelectedVarId(c.variations[0].id); }} className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${selectedCatId === c.id ? 'bg-white text-black border-white' : 'text-slate-500 border-white/10'}`}>
                    {c.name}
                  </button>
               ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Screen 6: ALIAS + CONFIRM
  if (screen === 6) {
    const theme = THEMES[activeVariation?.backgroundStyle || 'gritty'];
    return (
      <div className={`relative min-h-screen w-full ${theme.bg} overflow-hidden flex flex-col items-center justify-center p-6 text-center`}>
        <GrainOverlay />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-12 z-10">
          <div className="flex flex-col items-center gap-2">
             <div className="text-4xl">{activeVariation?.icon}</div>
             <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">{activeVariation?.name}</div>
          </div>

          <div className="mb-6">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center mb-3">
              CHOOSE YOUR FACE
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PLAYER_AVATARS.map(av => (
                <button
                  key={av.id}
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 ${
                    selectedAvatarId === av.id
                      ? 'bg-emerald-500/20 ring-2 ring-emerald-500'
                      : 'bg-slate-900/60 ring-1 ring-slate-700/50'
                  }`}
                >
                  <Avatar avatarId={av.id} size={52} />
                  <span className="text-[9px] text-slate-400 font-bold">
                    {av.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">What do they call you?</label>
             <input
              type="text"
              placeholder="Enter your alias"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-center text-white text-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-800 font-bold tracking-tight"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Bag</span>
              <span className="text-emerald-400 font-black text-sm">${activeVariation?.starterBag.toLocaleString()}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Clout</span>
              <span className="text-blue-400 font-black text-sm">{activeVariation?.starterClout}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Aura</span>
              <span className="text-purple-400 font-black text-sm">{activeVariation?.starterAura}</span>
            </div>
          </div>

          <div className="pt-8">
             <button
                disabled={name.trim().length < 2}
                onClick={handleFinalStart}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xl transition-all ${name.trim().length >= 2 ? 'bg-[#4ade80] text-black shadow-2xl shadow-[#4ade80]/20' : 'bg-white/5 text-slate-800 cursor-not-allowed'}`}
             >
                Enter the World
             </button>
             {activeVariation?.originBonus && (
                <p className="mt-4 text-[10px] text-[#4ade80] font-black italic tracking-widest">
                  {activeVariation.originBonus.description}
                </p>
             )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
