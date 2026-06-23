import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BeatSequenceProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const BeatSequence: React.FC<BeatSequenceProps> = ({ onComplete, level = 1 }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [failed, setFailed] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'fail' | null>(null);

  // Difficulty scaling
  const totalRounds = 2 + level;
  const baseLength = 1 + level; // Level 1: 2, Level 2: 3, Level 3: 4
  const sequenceGrowth = 2; // Level 3 will go 4 -> 6 -> 8 -> 10 -> 12

  useEffect(() => {
    startNewRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewRound = (currentRound: number) => {
    const length = baseLength + (currentRound - 1) * sequenceGrowth;
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setUserSequence([]);
    displaySequence(newSequence);
  };

  const displaySequence = async (seq: number[]) => {
    setIsDisplaying(true);
    // Display speed scales with level
    const displaySpeed = Math.max(200, 500 - (level - 1) * 100);
    const pauseSpeed = Math.max(50, 150 - (level - 1) * 30);

    for (const num of seq) {
      setActiveButton(num);
      if (navigator.vibrate) navigator.vibrate(20);
      await new Promise(resolve => setTimeout(resolve, displaySpeed));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, pauseSpeed));
    }
    setIsDisplaying(false);
  };

  const handleButtonClick = (index: number) => {
    if (isDisplaying || failed) return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      setFailed(true);
      setFeedback('fail');
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      return;
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
        setTimeout(() => startNewRound(round + 1), 500);
      }
    }
  };

  if (failed) {
    return (
      <div className="h-[450px] w-full bg-slate-950 border-4 border-red-600 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔇</div>
        <h2 className="text-3xl font-black text-red-500 mb-2 italic tracking-tighter uppercase">RHYTHM LOST</h2>
        <p className="text-slate-400 mb-8 font-bold uppercase tracking-widest text-[10px]">FAILED AT ROUND {round} OF {totalRounds}</p>
        <button
          onClick={() => {
            let multiplier = 0.5;
            if (round > 3) multiplier = 2.0;
            else if (round > 1) multiplier = 1.2;
            onComplete(multiplier);
          }}
          className="px-10 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase tracking-tighter border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          CUT THE TRACK
        </button>
      </div>
    );
  }

  return (
    <div className={`h-[450px] w-full bg-slate-950 border-4 transition-colors duration-200 rounded-3xl flex flex-col items-center justify-center p-6 ${
        feedback === 'hit' ? 'border-emerald-500' :
        isDisplaying ? 'border-purple-500' : 'border-purple-900/50'
    }`}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-purple-400 italic tracking-tighter uppercase">BEAT SEQUENCE <span className="text-white text-sm">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Sample {round} / {totalRounds}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
        {[0, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick(num)}
            className={`h-28 rounded-2xl transition-all duration-100 relative ${
              activeButton === num
                ? 'bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] border-t-2 border-purple-300'
                : 'bg-slate-900 border-2 border-slate-800 hover:border-purple-500/30'
            } ${isDisplaying ? 'cursor-default' : 'cursor-pointer active:bg-purple-600'}`}
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
          <div key={i} className={`w-10 h-1.5 rounded-full transition-colors duration-300 ${i < round - 1 ? 'bg-emerald-500' : i === round - 1 ? 'bg-purple-500 animate-pulse' : 'bg-slate-800'}`} />
        ))}
      </div>
      <p className="mt-4 text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
        {isDisplaying ? (
            <>
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🎧</motion.span>
                <span>MEMORIZING SEQUENCE...</span>
            </>
        ) : (
            <>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>🎹</motion.span>
                <span>LAY THE BEAT ({sequence.length} NOTES)</span>
            </>
        )}
      </p>
    </div>
  );
};
