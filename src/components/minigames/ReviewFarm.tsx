import React, { useState, useEffect } from 'react';

export const ReviewFarm: React.FC<{ level: number; onComplete: (win: boolean) => void }> = ({ level, onComplete }) => {
  const [reviewText, setReviewText] = useState('');
  const [isClient, setIsClient] = useState(true);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);

  const pullReview = () => {
    const isTargetClient = Math.random() > 0.5;
    setIsClient(isTargetClient);
    setReviewText(isTargetClient
      ? (Math.random() > 0.5 ? "⭐⭐⭐⭐⭐ Absolutely immaculate service, highly recommend!" : "⭐ Terrible experience, completely ruined my day.")
      : (Math.random() > 0.5 ? "⭐⭐⭐⭐⭐ The competitor shop has flawless quality." : "⭐ Completely unprofessional scam artists.")
    );
    setRounds(r => r + 1);
  };

  useEffect(() => { pullReview(); }, []);

  const handleAction = (approveReview: boolean) => {
    const isPositiveReview = reviewText.includes("⭐⭐⭐⭐⭐");
    const earnedPoint = isClient
      ? (approveReview === isPositiveReview)
      : (approveReview !== isPositiveReview);

    let nextScore = score;
    if (earnedPoint) {
      nextScore = score + 1;
      setScore(nextScore);
    }

    if (rounds >= 5 + level) {
      onComplete(nextScore >= 4);
    } else {
      pullReview();
    }
  };

  return (
    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 text-center text-xs font-mono text-white select-none">
      <div className="w-full flex justify-between text-[9px] text-zinc-500">
        <span>🧼 REPUTATION LAUNDRY OPERATION</span>
        <span>ROUND: {rounds}/{5 + level}</span>
      </div>
      <p className="text-[10px] text-purple-400 uppercase font-black">Target Entity: <span className="text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{isClient ? "OUR CLIENT" : "COMPETITOR RIVAL"}</span></p>
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg italic text-[11px] text-slate-300 min-h-12 flex items-center justify-center">"{reviewText}"</div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => handleAction(true)} className="p-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded font-bold transition-colors">POST SUBMISSION</button>
        <button onClick={() => handleAction(false)} className="p-2 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded font-bold transition-colors">FLAG / REJECT</button>
      </div>
    </div>
  );
};
