import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeatSequenceProps {
  level?: number;
  onComplete: (multiplier: number) => void;
}

export const BeatSequence: React.FC<BeatSequenceProps> = ({ level = 1, onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [failed, setFailed] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'fail' | null>(null);

  // Scaling: Sequence length grows from 4 (L1) to 12 (L5)
  // We'll use 3 rounds per level.
  const totalRounds = 3;

  useEffect(() => {
    startNewRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewRound = (currentRound: number) => {
    // Sequence length stays consistent per level for learning: L1: 4 notes -> L5: 12 notes
    const length = 4 + (level - 1) * 2;

    if (currentRound === 1) {
        const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 4));
        setSequence(newSeq);
        setUserSequence([]);
        setAttempts(0);
        displaySequence(newSeq);
    } else {
        setUserSequence([]);
        setAttempts(0);
        displaySequence(sequence);
    }
  };

  const displaySequence = async (seq: number[]) => {
    setIsDisplaying(true);
    // Add small delay before start
    await new Promise(resolve => setTimeout(resolve, 800));

    for (const num of seq) {
      setActiveButton(num);
      if (navigator.vibrate) navigator.vibrate(20);
      // Speed scales slightly with level
      const speed = Math.max(200, 500 - (level * 40));
      await new Promise(resolve => setTimeout(resolve, speed));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    setIsDisplaying(false);
  };

  const handleButtonClick = (index: number) => {
    if (isDisplaying || failed) return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      // User failed the sequence
      if (attempts < 2) {
          // Allow up to 3 tries per round (0, 1, 2)
          setAttempts(prev => prev + 1);
          setFeedback('fail');
          setUserSequence([]);
          if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
          setTimeout(() => {
              setFeedback(null);
              displaySequence(sequence);
          }, 800);
          return;
      } else {
          setFailed(true);
          setFeedback('fail');
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          return;
      }
    }

    setFeedback('hit');
    if (navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => setFeedback(null), 150);

    if (newUserSequence.length === sequence.length) {
      if (round === totalRounds) {
        if (navigator.vibrate) navigator.vibrate(100);
        setTimeout(() => onComplete(4.0), 500);
      } else {
        setRound(prev => prev + 1);
        setTimeout(() => startNewRound(round + 1), 800);
      }
    }
  };

  if (failed) {
    return (
      <div className="h-[450px] w-full bg-slate-950 border-4 border-red-600 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
        <div className="text-7xl mb-6">🔇</div>
        <h2 className="text-3xl font-black text-red-500 mb-2 italic tracking-tighter">MIX REJECTED</h2>
        <p className="text-slate-400 mb-10 font-bold uppercase tracking-widest text-xs leading-relaxed">
            Sequence too complex for your current setup.<br/>Lost at sample {round}.
        </p>
        <button
          onClick={() => {
            let multiplier = 0.5;
            if (round === 2) multiplier = 1.2;
            else if (round === 3) multiplier = 2.0;
            onComplete(multiplier);
          }}
          className="w-full py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all uppercase tracking-tighter border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          CUT THE TRACK
        </button>
      </div>
    );
  }

  return (
    <div className={`h-[450px] w-full bg-slate-950 border-4 transition-colors duration-300 rounded-3xl flex flex-col items-center justify-center p-6 ${
        feedback === 'hit' ? 'border-emerald-500' :
        feedback === 'fail' ? 'border-red-500' :
        isDisplaying ? 'border-purple-500' : 'border-purple-900/50'
    }`}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-purple-400 italic tracking-tighter uppercase">STUDIO SESSION</h2>
        <div className="flex flex-col items-center gap-1 mt-1">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Sample {round} / {totalRounds} • Sequence: {sequence.length}</p>
            {attempts > 0 && <p className="text-[8px] text-red-500 font-bold uppercase tracking-widest">Retry {attempts}/3</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[260px]">
        {[0, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.95 }}
            onPointerDown={() => handleButtonClick(num)}
            className={`h-24 rounded-2xl transition-all duration-100 relative ${
              activeButton === num
                ? 'bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.7)] border-t-2 border-purple-300'
                : 'bg-slate-900 border-2 border-slate-800 hover:border-purple-500/30'
            } ${isDisplaying ? 'cursor-default pointer-events-none' : 'cursor-pointer active:bg-purple-600'}`}
          >
            <div className={`w-3 h-3 rounded-full mx-auto transition-colors duration-200 ${activeButton === num ? 'bg-white' : 'bg-slate-700'}`} />
            {activeButton === num && (
                <motion.div
                    layoutId="glow"
                    className="absolute inset-0 bg-purple-400/20 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        {[...Array(totalRounds)].map((_, i) => (
          <div key={i} className={`w-12 h-1.5 rounded-full transition-colors duration-300 ${i < round - 1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : i === round - 1 ? 'bg-purple-500 animate-pulse' : 'bg-slate-800'}`} />
        ))}
      </div>

      <div className="mt-6 h-4">
        <AnimatePresence mode="wait">
            {isDisplaying ? (
                <motion.p
                    key="mem"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] text-purple-400 font-black uppercase tracking-widest flex items-center gap-2"
                >
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🎧</motion.span>
                    <span>MONITORING MIX...</span>
                </motion.p>
            ) : (
                <motion.p
                    key="lay"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2"
                >
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>🎹</motion.span>
                    <span>LAY THE TRACK</span>
                </motion.p>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};
