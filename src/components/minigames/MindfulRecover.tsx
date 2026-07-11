import React, { useState, useEffect } from 'react';

export const MindfulRecover: React.FC<{ onComplete: (success: boolean) => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'INHALE' | 'EXHALE'>('INHALE');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 1) {
          setStage(s => s === 'INHALE' ? 'EXHALE' : 'INHALE');
          return 0;
        }
        return p + 0.05;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center select-none">
      <p className="text-xs font-mono uppercase text-blue-400 tracking-widest transition-all duration-500">
        {stage === 'INHALE' ? '😮💨 Breathe In...' : '😌 Breathe Out...'}
      </p>

      {/* Therapeutic Breathing Circle */}
      <div className="w-32 h-32 flex items-center justify-center bg-zinc-950 rounded-full border border-zinc-800 relative">
        <div
          className="bg-blue-500/20 rounded-full transition-all duration-300 ease-out"
          style={{
            width: stage === 'INHALE' ? `${progress * 100}%` : `${(1 - progress) * 100}%`,
            height: stage === 'INHALE' ? `${progress * 100}%` : `${(1 - progress) * 100}%`,
          }}
        />
      </div>

      <button
        onClick={() => onComplete(true)}
        className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors"
      >
        Finish Breathing Session (Pure Bonus)
      </button>
    </div>
  );
};
