import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PatternMemoryProps {
  onComplete: (multiplier: number) => void;
}

export const PatternMemory: React.FC<PatternMemoryProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [failed, setFailed] = useState(false);

  const totalRounds = 4;

  useEffect(() => {
    startNewRound(1);
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
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, 200));
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
      <div className="h-[400px] w-full bg-slate-950 border-4 border-red-900 rounded-3xl flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-black text-red-500 mb-4">SYSTEM FAILURE</h2>
        <p className="text-slate-400 mb-8">Memory corrupted at round {round}</p>
        <button
          onClick={() => onComplete(0.5)}
          className="px-8 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-500 transition-colors"
        >
          ACCEPT LOSS
        </button>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-slate-950 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-blue-400">ENCRYPTION SEQUENCE</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Round {round} / {totalRounds}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[240px]">
        {[0, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(num)}
            className={`h-24 rounded-2xl transition-all duration-200 ${
              activeButton === num
                ? 'bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)]'
                : 'bg-slate-800 hover:bg-slate-700'
            } ${isDisplaying ? 'cursor-default' : 'cursor-pointer'}`}
          />
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-500 text-center uppercase">
        {isDisplaying ? 'Watch closely...' : 'Repeat the pattern'}
      </p>
    </div>
  );
};
