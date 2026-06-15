import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BeatSequenceProps {
  onComplete: (multiplier: number) => void;
}

export const BeatSequence: React.FC<BeatSequenceProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [failed, setFailed] = useState(false);

  const totalRounds = 4;

  useEffect(() => {
    startNewRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewRound = (currentRound: number) => {
    const newSequence = Array.from({ length: currentRound + 2 }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setUserSequence([]);
    displaySequence(newSequence);
  };

  const displaySequence = async (seq: number[]) => {
    setIsDisplaying(true);
    for (const num of seq) {
      setActiveButton(num);
      await new Promise(resolve => setTimeout(resolve, 500));
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
      setFailed(true);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      if (round === totalRounds) {
        onComplete(3.0);
      } else {
        setRound(prev => prev + 1);
        setTimeout(() => startNewRound(round + 1), 500);
      }
    }
  };

  if (failed) {
    return (
      <div className="h-[400px] w-full bg-slate-950 border-4 border-red-600 rounded-3xl flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-black text-red-500 mb-2 italic">OFF BEAT</h2>
        <p className="text-slate-400 mb-8 font-bold uppercase tracking-widest text-xs">Rhythm lost at round {round}</p>
        <button
          onClick={() => onComplete(0.5)}
          className="px-10 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase tracking-tighter"
        >
          CUT THE TRACK
        </button>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-slate-950 border-4 border-purple-900 rounded-3xl flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-purple-400 italic">BEAT SEQUENCE</h2>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Sample {round} / {totalRounds}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[260px]">
        {[0, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleButtonClick(num)}
            className={`h-28 rounded-xl transition-all duration-100 ${
              activeButton === num
                ? 'bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)] border-t-2 border-purple-300'
                : 'bg-slate-900 border-2 border-slate-800'
            } ${isDisplaying ? 'cursor-default' : 'cursor-pointer active:bg-purple-600'}`}
          >
            <div className={`w-2 h-2 rounded-full mx-auto ${activeButton === num ? 'bg-white' : 'bg-slate-700'}`} />
          </motion.button>
        ))}
      </div>

      <div className="mt-8 flex gap-1">
        {[...Array(totalRounds)].map((_, i) => (
          <div key={i} className={`w-12 h-1 rounded-full ${i < round ? 'bg-purple-500' : 'bg-slate-800'}`} />
        ))}
      </div>
      <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        {isDisplaying ? 'Memorizing...' : 'Lay the beat'}
      </p>
    </div>
  );
};
