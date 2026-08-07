import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface PatternMemoryProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instruction?: string;
}

export const PatternMemory: React.FC<PatternMemoryProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title = "ENCRYPTION SEQUENCE",
  instruction = "WATCH CLOSELY..."
}) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [failed, setFailed] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  const totalRounds = useMemo(() => Math.min(6, 4 + Math.floor(level / 2)), [level]);
  const baseSequenceLength = useMemo(() => 2 + Math.floor(scaling * 0.5), [scaling]);

  useEffect(() => {
    startNewRound(1);
  }, []);

  const startNewRound = (currentRound: number) => {
    const newSequence = Array.from({ length: currentRound + baseSequenceLength }, () => Math.floor(Math.random() * 4));
    setSequence(newSequence);
    setUserSequence([]);
    displaySequence(newSequence);
  };

  const displaySequence = async (seq: number[]) => {
    setIsDisplaying(true);
    const displayTime = Math.max(150, 600 * timerFactor);
    const pauseTime = Math.max(50, 200 * timerFactor);

    for (const num of seq) {
      setActiveButton(num);
      if (navigator.vibrate) navigator.vibrate(20);
      await new Promise(resolve => setTimeout(resolve, displayTime));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, pauseTime));
    }
    setIsDisplaying(false);
  };

  const handleButtonClick = (index: number) => {
    if (isDisplaying || failed) return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      setFailed(true);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      return;
    }

    setFeedback('hit');
    if (navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => setFeedback(null), 100);

    if (newUserSequence.length === sequence.length) {
      if (round === totalRounds) {
        if (navigator.vibrate) navigator.vibrate(100);
        // Reward scaled by level
        setTimeout(() => onComplete(3.0 + scaling), 500);
      } else {
        setRound(prev => prev + 1);
        setTimeout(() => startNewRound(round + 1), 500);
      }
    }
  };

  if (failed) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-red-500 mb-2 tracking-tighter uppercase italic">SYSTEM FAILURE</h2>
        <p className="text-slate-400 mb-6 font-bold text-xs uppercase tracking-widest">Memory corrupted at round {round}</p>
        <button
          onClick={() => {
            let multiplier = 0.5;
            if (round >= 3) multiplier = 1.5;
            else if (round >= 2) multiplier = 1.0;
            onComplete(multiplier);
          }}
          className="px-10 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          ACCEPT LOSS
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full transition-colors duration-200 flex flex-col items-center justify-center p-2 ${
        isDisplaying ? 'bg-blue-950/10' : feedback ? 'bg-emerald-950/10' : 'bg-transparent'
    }`}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-blue-400 italic tracking-tighter uppercase">{title} <span className="text-xs text-white">L{level}</span></h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1">ROUND {round} / {totalRounds}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[260px]">
        {[0, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(num)}
            className={`h-28 rounded-2xl transition-all duration-200 relative ${
              activeButton === num
                ? 'bg-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.6)] border-t-2 border-blue-200'
                : 'bg-slate-900 border-2 border-slate-800'
            } ${isDisplaying ? 'cursor-default' : 'cursor-pointer active:bg-blue-600'}`}
          >
             {activeButton === num && (
                <motion.div
                    className="absolute inset-0 bg-blue-300/20 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        {[...Array(totalRounds)].map((_, i) => (
          <div key={i} className={`w-10 h-1.5 rounded-full transition-colors duration-300 ${i < round - 1 ? 'bg-emerald-500' : i === round - 1 ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
        ))}
      </div>

      <p className="mt-4 text-[10px] text-slate-500 text-center uppercase font-black tracking-widest flex items-center gap-2">
        {isDisplaying ? (
            <>
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>📡</motion.span>
                <span>{instruction}</span>
            </>
        ) : (
            <>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>⚡</motion.span>
                <span>REPEAT PATTERN</span>
            </>
        )}
      </p>
    </div>
  );
};
