import React, { useState, useEffect } from 'react';
import { showConfetti } from './Confetti';

interface RewardCardProps {
  title: string;
  subtitle: string;
  stats: { label: string; value: string | number; colorClass?: string }[];
  isRare?: boolean;
  onDismiss: () => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  title,
  subtitle,
  stats,
  isRare,
  onDismiss,
}) => {
  const [displayStats, setDisplayStats] = useState<any[]>(stats.map(s => ({ ...s, current: 0 })));

  useEffect(() => {
    if (isRare) {
      showConfetti();
    }
  }, [isRare]);

  useEffect(() => {
    const timers = stats.map((stat, i) => {
      if (typeof stat.value === 'number') {
        const duration = 1000;
        const steps = 30;
        const increment = stat.value / steps;
        let current = 0;

        return setInterval(() => {
          current += increment;
          if (current >= (stat.value as number)) {
            current = stat.value as number;
            clearInterval(timers[i]!);
          }
          setDisplayStats(prev => {
            const next = [...prev];
            next[i].current = Math.floor(current);
            return next;
          });
        }, duration / steps);
      } else {
        setDisplayStats(prev => {
          const next = [...prev];
          next[i].current = stat.value;
          return next;
        });
        return null;
      }
    });

    return () => timers.forEach(t => t && clearInterval(t));
  }, [stats]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onDismiss}>
      <div
        className={`w-full max-w-md bg-slate-900 border-2 ${isRare ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-slate-700'} rounded-3xl p-6 mb-8 transform transition-all duration-500 animate-in slide-in-from-bottom-full`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isRare ? 'text-yellow-500' : 'text-slate-500'}`}>
            {subtitle}
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">
            {title}
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          {displayStats.map((stat, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <span className={`text-xl font-mono font-black ${stat.colorClass || 'text-white'}`}>
                {typeof stat.value === 'number' ? (
                  <>
                    {stat.value > 1000 ? '$' : ''}{stat.current.toLocaleString()}
                  </>
                ) : (
                  stat.current
                )}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onDismiss}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
            isRare
              ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-900/20'
              : 'bg-white hover:bg-slate-200 text-black'
          }`}
        >
          Collect Rewards
        </button>
      </div>

      {isRare && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(234,179,8,0.1)_0%,transparent_70%)] animate-pulse" />
        </div>
      )}
    </div>
  );
};
