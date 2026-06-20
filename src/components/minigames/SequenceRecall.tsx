import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SequenceRecallProps {
  onComplete: (multiplier: number) => void; level?: number;
  title?: string;
  instruction?: string;
}

export const SequenceRecall: React.FC<SequenceRecallProps> = ({
  onComplete,
  title = "SEQUENCE RECALL",
  instruction = "Watch closely..."
}) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIndex, setShowIndex] = useState(-1);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('Watch the sequence');
  const [feedback, setFeedback] = useState<'hit' | 'fail' | null>(null);

  const startRound = (r: number) => {
    const newSeq = Array.from({ length: r + 2 }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserInput([]);
    setIsPlaying(true);
    setShowIndex(-1);
    setMessage('Watch closely...');
  };

  useEffect(() => {
    if (isPlaying) {
      if (showIndex < sequence.length - 1) {
        const timer = setTimeout(() => {
            setShowIndex(showIndex + 1);
            if (navigator.vibrate) navigator.vibrate(20);
        }, 600);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsPlaying(false);
          setShowIndex(-1);
          setMessage('Repeat the sequence!');
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, showIndex, sequence]);

  const handleInput = (index: number) => {
    if (isPlaying || feedback) return;

    const nextInput = [...userInput, index];
    setUserInput(nextInput);

    if (index !== sequence[userInput.length]) {
      // Failed
      setFeedback('fail');
      setMessage('WRONG SEQUENCE!');
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

      let multiplier = 0.5;
      if (round === 2) multiplier = 1.5;
      else if (round === 3) multiplier = 2.5;

      setTimeout(() => onComplete(multiplier), 1000);
      return;
    }

    setFeedback('hit');
    if (navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => setFeedback(null), 150);

    if (nextInput.length === sequence.length) {
      if (round >= 3) {
        setMessage('PERFECT RECALL!');
        if (navigator.vibrate) navigator.vibrate(100);
        setTimeout(() => onComplete(4.0), 1000);
      } else {
        setMessage('GOOD! Next level...');
        setTimeout(() => {
          setRound(round + 1);
          startRound(round + 1);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    startRound(1);
  }, []);

  return (
    <div className={`transition-colors duration-200 bg-slate-900 p-8 rounded-3xl border-4 shadow-2xl text-center max-w-sm w-full mx-auto ${
        feedback === 'hit' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'fail' ? 'border-red-500 bg-red-950/20' :
        'border-blue-400/30'
    }`}>
      <h2 className="text-2xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">{title}</h2>
      <div className="flex flex-col items-center gap-1 mb-8">
        <p className={`text-[10px] uppercase tracking-widest font-black transition-colors duration-200 ${isPlaying ? 'text-blue-500' : 'text-emerald-500'}`}>
            {isPlaying ? instruction : message}
        </p>
        <div className="flex gap-2">
            {[1, 2, 3].map((r) => (
                <div key={r} className={`w-10 h-1.5 rounded-full transition-colors duration-300 ${round > r ? 'bg-emerald-500' : round === r ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[260px] mx-auto mb-8">
        {[0, 1, 2, 3].map((i) => {
          const isActive = isPlaying && sequence[showIndex] === i;
          const colors = [
            'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'
          ];
          const shadowColors = [
            'shadow-blue-500/50', 'shadow-emerald-500/50', 'shadow-amber-500/50', 'shadow-purple-500/50'
          ];

          return (
            <motion.button
              key={i}
              whileTap={!isPlaying ? { scale: 0.9 } : {}}
              onClick={() => handleInput(i)}
              animate={isActive ? { scale: 1.1, filter: 'brightness(1.5)' } : { scale: 1, filter: 'brightness(1)' }}
              className={`aspect-square rounded-2xl relative transition-all shadow-lg border-t-2 border-white/10 ${
                isActive ? colors[i] + ' ' + shadowColors[i] : 'bg-slate-800 border-slate-700'
              } ${isPlaying ? 'cursor-default' : 'cursor-pointer active:brightness-150'}`}
            >
                {!isPlaying && userInput.includes(i) && userInput[userInput.length-1] === i && feedback === 'hit' && (
                    <motion.div className={`absolute inset-0 rounded-2xl ${colors[i]} opacity-30`} />
                )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-500 opacity-50">
        {isPlaying ? (
            <>
                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>🎧</motion.span>
                <span className="text-[10px] font-black uppercase tracking-widest">MEMORIZING...</span>
            </>
        ) : (
            <>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>⚡</motion.span>
                <span className="text-[10px] font-black uppercase tracking-widest">TAP THE SEQUENCE</span>
            </>
        )}
      </div>
    </div>
  );
};
