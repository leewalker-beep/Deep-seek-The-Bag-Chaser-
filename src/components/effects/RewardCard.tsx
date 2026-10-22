import React, { useState, useEffect } from 'react';
import { showConfetti } from './Confetti';

interface RewardCardProps {
  title: string;
  subtitle: string;
  stats: { label: string; value: string | number; colorClass?: string }[];
  isRare?: boolean;
  score?: number;
  whatHappened?: string;
  whyItHappened?: string[];
  whatNext?: { message: string; actionLabel?: string; route?: string };
  onDismiss: () => void;
  onNavigateNext?: (route: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  title,
  subtitle,
  stats,
  isRare,
  score,
  whatHappened,
  whyItHappened,
  whatNext,
  onDismiss,
  onNavigateNext,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onDismiss}>
      <div
        className={`w-full max-w-md bg-slate-900 border-2 ${isRare ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-slate-700'} rounded-3xl p-6 transform transition-all duration-500 animate-in zoom-in-95`}
        onClick={e => e.stopPropagation()}
      >
        {/* Section 1: WHAT DID I DO? */}
        <div className="text-center mb-5 pb-4 border-b border-slate-800">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            1. WHAT DID I DO?
          </div>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${isRare ? 'text-yellow-500' : 'text-slate-400'}`}>
            {subtitle}
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">
            {title}
          </h2>
          {typeof score === 'number' && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-[10px] font-mono font-bold text-emerald-400">
              <span>Minigame Score:</span>
              <span className="text-white font-black">{Math.round(score)}%</span>
            </div>
          )}
        </div>

        {/* Section 2: WHAT HAPPENED? */}
        <div className="mb-5 space-y-2">
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
            2. WHAT HAPPENED?
          </div>
          {whatHappened && (
            <p className="text-xs font-semibold text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-2">
              {whatHappened}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {displayStats.map((stat, i) => {
              const numVal = typeof stat.value === 'number' ? stat.current : 0;
              const isPositive = numVal > 0;
              const isNegative = numVal < 0;
              const formattedVal = typeof stat.value === 'number'
                ? `${isPositive ? '+' : ''}${numVal.toLocaleString()}`
                : stat.current;

              return (
                <div key={i} className="flex flex-col justify-between bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  <span className={`text-base font-mono font-black mt-0.5 ${stat.colorClass || (isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-white')}`}>
                    {formattedVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: WHY DID IT HAPPEN? */}
        {whyItHappened && whyItHappened.length > 0 && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
              3. WHY DID IT HAPPEN?
            </div>
            {whyItHappened.map((line, idx) => (
              <div key={idx} className="text-[10px] text-slate-300 font-medium flex items-start gap-1.5">
                <span className="text-emerald-400">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}

        {/* Section 4: WHAT CAN I DO NEXT? */}
        {whatNext && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">
              4. WHAT CAN I DO NEXT?
            </div>
            <p className="text-xs text-slate-200 font-semibold leading-tight">
              {whatNext.message}
            </p>
            {whatNext.actionLabel && whatNext.route && onNavigateNext && (
              <button
                onClick={() => {
                  onDismiss();
                  onNavigateNext(whatNext.route!);
                }}
                className="w-full mt-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                {whatNext.actionLabel} →
              </button>
            )}
          </div>
        )}

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 min-h-[48px] ${
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
