import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Topic {
  id: number;
  label: string;
  isViral: boolean;
}

const TOPICS: Topic[] = [
  { id: 1, label: 'Lofi Beats to Study To', isViral: true },
  { id: 2, label: 'Boring Meeting', isViral: false },
  { id: 3, label: 'ASMR Slime Cutting', isViral: true },
  { id: 4, label: 'Tax Returns Tutorial', isViral: false },
  { id: 5, label: 'Extreme Ironing', isViral: true },
  { id: 6, label: 'Watching Paint Dry', isViral: false },
  { id: 7, label: '100 Layers of Lipstick', isViral: true },
  { id: 8, label: 'How to Organize Socks', isViral: false },
  { id: 9, label: 'Dancing Cat in a Hat', isViral: true },
  { id: 10, label: 'Dusting the Shelves', isViral: false },
];

interface SwipeUpViralProps {
  onComplete: (multiplier: number) => void;
}

export const SwipeUpViral: React.FC<SwipeUpViralProps> = ({ onComplete }) => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [topicIndex, setTopicIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const touchStart = useRef<number | null>(null);

  const [shuffledTopics] = useState(() => {
    const shuffled = [...TOPICS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8);
  });

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;
    let multiplier = 0.5;
    if (accuracy >= 0.8) multiplier = 3.0;
    else if (accuracy >= 0.6) multiplier = 2.0;
    else if (accuracy >= 0.4) multiplier = 1.2;
    else multiplier = 0.8;

    setTimeout(() => onComplete(multiplier), 800);
  }, [score, total, onComplete]);

  useEffect(() => {
    if (topicIndex < shuffledTopics.length && gameActive) {
      setCurrentTopic(shuffledTopics[topicIndex]);
      setResult(null);
      setOffsetY(0);
    } else if (topicIndex >= shuffledTopics.length && gameActive) {
      endGame();
    }
  }, [topicIndex, shuffledTopics, gameActive, endGame]);

  const handleAction = (isSwipedUp: boolean) => {
    if (!gameActive || !currentTopic || result !== null) return;

    const isCorrect = (isSwipedUp && currentTopic.isViral) || (!isSwipedUp && !currentTopic.isViral);
    if (isCorrect) {
      setScore(s => s + 1);
      setResult('correct');
    } else {
      setResult('wrong');
    }
    setTotal(t => t + 1);

    setTimeout(() => {
      setTopicIndex(i => i + 1);
    }, 400);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const diff = e.targetTouches[0].clientY - touchStart.current;
      setOffsetY(Math.min(0, Math.max(diff, -150)));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStart.current;
    if (diff < -50) {
      handleAction(true);
    } else {
      setOffsetY(0);
    }
    touchStart.current = null;
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-purple-500/30 text-center select-none touch-none h-80 flex flex-col justify-center items-center relative overflow-hidden">
      <div className="text-[10px] text-purple-400 font-bold uppercase mb-4 tracking-widest">
        GO VIRAL ({score}/{total})
      </div>

      {currentTopic && gameActive && (
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => !currentTopic.isViral && handleAction(false)}
          className={`w-full max-w-[200px] aspect-video bg-slate-800 rounded-xl border-2 flex flex-col items-center justify-center p-4 transition-all ${
            result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
            result === 'wrong' ? 'border-red-500 bg-red-500/10' :
            'border-slate-700'
          }`}
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          <div className="text-4xl mb-2">{currentTopic.isViral ? '🔥' : '📄'}</div>
          <div className="text-xs font-bold text-white">{currentTopic.label}</div>
        </div>
      )}

      <div className="mt-8 text-[10px] text-slate-500 uppercase font-mono">
        Swipe UP to POST Viral • Tap to SKIP Boring
      </div>

      {!gameActive && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center z-10">
          <div className="text-2xl font-black text-white italic">FEED UPDATED</div>
        </div>
      )}
    </div>
  );
};
