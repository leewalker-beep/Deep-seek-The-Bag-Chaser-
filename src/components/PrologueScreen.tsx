import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKGROUND_CATEGORIES } from '../config/backgrounds';

interface PrologueScreenProps {
  onStart: (name: string, backgroundId: string, categoryId: string, variationId: string) => void;
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

// --- Local Minigame Components ---

const StreetKidTrial: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked' | 'too-soon'>('waiting');
  const [reactions, setReactions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const finishedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            onComplete(reactions);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete, reactions]);

  useEffect(() => {
    if (gameState === 'waiting' && timeLeft > 0) {
      const waitTime = 1000 + Math.random() * 2000;
      const timeout = setTimeout(() => {
        setGameState('ready');
      }, waitTime);
      return () => clearTimeout(timeout);
    }
  }, [gameState, timeLeft]);

  const handleClick = () => {
    if (gameState === 'waiting') {
      setGameState('too-soon');
      setTimeout(() => setGameState('waiting'), 500);
    } else if (gameState === 'ready') {
      setReactions(prev => prev + 1);
      setGameState('clicked');
      setTimeout(() => setGameState('waiting'), 500);
    }
  };

  return (
    <div onMouseDown={handleClick} className={`w-full h-96 flex flex-col items-center justify-center cursor-pointer rounded-3xl transition-colors duration-200 border-8 ${
      gameState === 'ready' ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-900 border-slate-800'
    }`}>
       <div className="text-white text-center pointer-events-none">
          <div className="text-6xl mb-4">{gameState === 'ready' ? '⚡' : '🛑'}</div>
          <div className="text-xl font-black uppercase tracking-widest">
            {gameState === 'ready' ? 'TAP NOW!' : 'WAIT...'}
          </div>
          <div className="mt-8 text-4xl font-mono font-black">{timeLeft.toFixed(1)}s</div>
       </div>
    </div>
  );
};

const DropoutTrial: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [words, setWords] = useState<{ id: number, text: string, isGood: boolean, x: number, y: number, speed: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const nextId = useRef(0);
  const finishedRef = useRef(false);

  const GOOD_WORDS = ['VIRAL', 'TRENDING', 'EPIC', 'MUST-READ', 'SHOCKING'];
  const BAD_WORDS = ['BORING', 'LAME', 'OLD', 'REPOST', 'AD'];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            onComplete(score);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete, score]);

  useEffect(() => {
    const spawnTimer = setInterval(() => {
      const isGood = Math.random() > 0.3;
      const text = isGood ? GOOD_WORDS[Math.floor(Math.random() * GOOD_WORDS.length)] : BAD_WORDS[Math.floor(Math.random() * BAD_WORDS.length)];
      setWords(prev => [...prev, {
        id: nextId.current++,
        text,
        isGood,
        x: 10 + Math.random() * 80,
        y: 100,
        speed: 1.5 + Math.random() * 2
      }]);
    }, 600);
    return () => clearInterval(spawnTimer);
  }, []);

  useEffect(() => {
    const moveTimer = setInterval(() => {
      setWords(prev => prev.map(w => ({ ...w, y: w.y - w.speed })).filter(w => w.y > -10));
    }, 20);
    return () => clearInterval(moveTimer);
  }, []);

  const handleTap = (id: number, isGood: boolean) => {
    if (isGood) setScore(s => s + 1);
    else setScore(s => Math.max(0, s - 2));
    setWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="w-full h-96 bg-slate-900 rounded-3xl border-4 border-blue-400/30 relative overflow-hidden">
      <div className="absolute top-4 right-4 text-white font-mono font-black">{timeLeft.toFixed(1)}s</div>
      <AnimatePresence>
        {words.map(w => (
          <motion.button
            key={w.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onPointerDown={() => handleTap(w.id, w.isGood)}
            className={`absolute px-4 py-2 rounded-xl text-[10px] font-black ${w.isGood ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white'}`}
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
  const [current, setCurrent] = useState(Math.floor(Math.random() * 13));
  const [next, setNext] = useState(Math.floor(Math.random() * 13));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [rounds, setRounds] = useState(0);
  const finishedRef = useRef(false);

  const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1 || rounds >= 8) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            onComplete(score);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete, score, rounds]);

  const handleGuess = (higher: boolean) => {
    const correct = (higher && next >= current) || (!higher && next <= current);
    if (correct) setScore(s => s + 1);
    setCurrent(next);
    setNext(Math.floor(Math.random() * 13));
    setRounds(r => r + 1);
  };

  return (
    <div className="w-full h-96 bg-slate-900 rounded-3xl border-4 border-yellow-600 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="absolute top-4 right-4 text-white font-mono font-black">{timeLeft.toFixed(1)}s</div>
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">CURRENT DATA</div>
        <div className="text-6xl font-black text-white bg-white/5 w-24 h-32 flex items-center justify-center rounded-2xl border-2 border-white/10">
          {VALUES[current]}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button onClick={() => handleGuess(true)} className="bg-emerald-600 py-4 rounded-xl font-black text-white uppercase tracking-widest text-xs">Higher</button>
        <button onClick={() => handleGuess(false)} className="bg-red-600 py-4 rounded-xl font-black text-white uppercase tracking-widest text-xs">Lower</button>
      </div>
      <div className="text-[10px] text-slate-500 font-black uppercase">Round {rounds}/8</div>
    </div>
  );
};

// --- Main Component ---

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  const [screen, setScreen] = useState<number>(1);
  const [name, setName] = useState('');
  const [scores, setScores] = useState<{ street: number, dropout: number, benefactor: number }>({ street: 0, dropout: 0, benefactor: 0 });

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);

  const suggestedCategory = useMemo(() => {
    const { street, dropout, benefactor } = scores;
    if (street >= dropout && street >= benefactor) return 'street_kid';
    if (dropout >= benefactor) return 'dropout';
    return 'benefactor';
  }, [scores]);

  const winningCategory = BACKGROUND_CATEGORIES.find(c => c.id === (selectedCatId || suggestedCategory));
  const suggestedVariation = winningCategory?.variations[0];
  const activeVariation = winningCategory?.variations.find(v => v.id === selectedVarId) || suggestedVariation;

  const handleMinigameComplete = (category: keyof typeof scores, score: number) => {
    setScores(prev => ({ ...prev, [category]: score }));
    setScreen(prev => prev + 1);
  };

  const handleFinalStart = () => {
    if (name.trim() && activeVariation && winningCategory) {
      onStart(name.trim().toUpperCase(), activeVariation.id, winningCategory.id, activeVariation.id);
    }
  };

  const grainOverlay = (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.05] z-[1] mix-blend-overlay"
      style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}
    />
  );

  // Screen 1: TITLE
  if (screen === 1) {
    return (
      <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center p-6 font-sans">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#050505] z-0" />
        {grainOverlay}
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black text-white tracking-tighter">BAG CHASER</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 italic text-sm md:text-lg font-light tracking-widest uppercase opacity-70">
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
      { id: 'street', name: 'THE STREET KID', flavour: 'Survive on instinct. The city doesn\'t wait.', component: StreetKidTrial },
      { id: 'dropout', name: 'THE DROPOUT', flavour: 'You\'ve always known the right thing to say.', component: DropoutTrial },
      { id: 'benefactor', name: 'THE BENEFACTOR', flavour: 'Every decision is a calculated risk.', component: BenefactorTrial },
    ];
    const t = trials[screen - 2];
    return (
      <div className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        {grainOverlay}
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-2">TRIAL {screen - 1} OF 3</div>
            <h2 className="text-3xl font-black text-white uppercase">{t.name}</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium italic">"{t.flavour}"</p>
          </div>
          <t.component onComplete={(s) => handleMinigameComplete(t.id as any, s)} />
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

    return (
      <div className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        {grainOverlay}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-12 z-10">
          <div className="space-y-4">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">YOUR DESTINY IS SEALED</div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="text-9xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {activeVariation?.icon}
            </motion.div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter">{winningCategory?.name}</h2>
            <p className="text-[#4ade80] italic font-medium">"{destinyLines[winningCategory?.id || 'street_kid']}"</p>
          </div>

          {!selectedCatId ? (
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
              <div>
                <div className="text-[8px] text-slate-500 font-black uppercase mb-1">STREET</div>
                <div className="text-white font-mono font-black">{scores.street}</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500 font-black uppercase mb-1">DROPOUT</div>
                <div className="text-white font-mono font-black">{scores.dropout}</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500 font-black uppercase mb-1">BENEFACTOR</div>
                <div className="text-white font-mono font-black">{scores.benefactor}</div>
              </div>
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
            <button onClick={() => setScreen(6)} className="w-full py-6 bg-[#4ade80] text-black font-black uppercase tracking-widest rounded-2xl text-xl shadow-2xl">
              This is me →
            </button>
            <button onClick={() => setSelectedCatId(selectedCatId ? null : suggestedCategory)} className="w-full py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              {selectedCatId ? 'Back to suggested' : 'Override'}
            </button>
          </div>

          {selectedCatId && (
            <div className="flex justify-center gap-2">
               {BACKGROUND_CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setSelectedCatId(c.id); setSelectedVarId(c.variations[0].id); }} className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${selectedCatId === c.id ? 'bg-white text-black border-white' : 'text-slate-500 border-white/10'}`}>
                    {c.name}
                  </button>
               ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Screen 6: ALIAS + CONFIRM
  if (screen === 6) {
    const theme = THEMES[activeVariation?.backgroundStyle || 'gritty'];
    return (
      <div className={`relative min-h-screen w-full ${theme.bg} overflow-hidden flex flex-col items-center justify-center p-6 text-center`}>
        {grainOverlay}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-12 z-10">
          <div className="flex flex-col items-center gap-2">
             <div className="text-4xl">{activeVariation?.icon}</div>
             <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">{activeVariation?.name}</div>
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
                disabled={!name.trim()}
                onClick={handleFinalStart}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xl transition-all ${name.trim() ? 'bg-[#4ade80] text-black shadow-2xl shadow-[#4ade80]/20' : 'bg-white/5 text-slate-800 cursor-not-allowed'}`}
             >
                Enter the World
             </button>
             {activeVariation?.originBonus && (
                <p className="mt-4 text-[10px] text-[#4ade80] font-black uppercase tracking-widest">
                  Bonus: {activeVariation.originBonus.description}
                </p>
             )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
