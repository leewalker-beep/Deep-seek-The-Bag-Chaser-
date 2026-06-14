import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SequenceRecallProps {
  onComplete: (multiplier: number) => void;
}

export const SequenceRecall: React.FC<SequenceRecallProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIndex, setShowIndex] = useState(-1);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('Watch the sequence');

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
        const timer = setTimeout(() => setShowIndex(showIndex + 1), 600);
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
    if (isPlaying) return;

    const nextInput = [...userInput, index];
    setUserInput(nextInput);

    if (index !== sequence[userInput.length]) {
      // Failed
      setMessage('WRONG SEQUENCE!');
      const multiplier = Math.max(0.5, 0.5 + (round - 1) * 0.5);
      setTimeout(() => onComplete(multiplier), 1000);
      return;
    }

    if (nextInput.length === sequence.length) {
      if (round >= 3) {
        setMessage('PERFECT RECALL!');
        setTimeout(() => onComplete(3.0), 1000);
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
    <div className="bg-slate-900 p-8 rounded-3xl border border-blue-400/30 shadow-2xl text-center">
      <h2 className="text-2xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">SEQUENCE RECALL</h2>
      <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-bold">{message}</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[240px] mx-auto mb-8">
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
              onClick={() => handleInput(i)}
              animate={isActive ? { scale: 1.1, filter: 'brightness(1.5)' } : { scale: 1, filter: 'brightness(1)' }}
              className={`aspect-square rounded-2xl ${isActive ? colors[i] + ' ' + shadowColors[i] + ' shadow-xl' : 'bg-slate-800'} transition-all active:scale-95`}
            />
          );
        })}
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${round > i ? 'bg-blue-500' : 'bg-slate-800 border border-slate-700'}`} />
        ))}
      </div>
    </div>
  );
};
