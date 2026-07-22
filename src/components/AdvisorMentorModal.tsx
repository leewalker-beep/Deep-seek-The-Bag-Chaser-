import React from 'react';
import { motion } from 'framer-motion';

export interface AdvisorMentorModalProps {
  title: string;
  subtitle: string;
  bullets?: string[];
  ctaLabel?: string;
  quote?: { text: string; author: string } | null;
  onClose: () => void;
  onTakeMeThere?: () => void;
}

export const AdvisorMentorModal: React.FC<AdvisorMentorModalProps> = ({
  title,
  subtitle,
  bullets = [],
  ctaLabel = 'Take me there',
  quote,
  onClose,
  onTakeMeThere,
}) => {
  return (
    <div className="fixed inset-0 z-[1100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col"
      >
        {/* Header decoration */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        <div className="p-6 space-y-5">
          {/* Mentor Profile Avatar & Info */}
          <div className="flex items-center gap-3">
            <span className="text-4xl bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
              🧠
            </span>
            <div>
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block">
                Strategic Advisor
              </span>
              <h3 className="text-base font-black text-white uppercase tracking-tight leading-none mt-0.5">
                Mentor Advice
              </h3>
            </div>
          </div>

          {/* Inspirational Quote Card */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/5 border-l-4 border-emerald-400 rounded-r-2xl space-y-1.5"
            >
              <p className="text-xs text-emerald-200 font-serif italic leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-[10px] text-emerald-400 font-mono font-bold text-right uppercase tracking-wider">
                — {quote.author}
              </p>
            </motion.div>
          )}

          {/* Main Context Card */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter leading-snug">
              {title}
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Bullet points focus */}
          {bullets.length > 0 && (
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2.5 shadow-md">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">
                Focus Areas / Guidance:
              </span>
              <ul className="space-y-2">
                {bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="text-[11px] text-slate-200 font-medium uppercase tracking-tight leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-emerald-400 font-bold shrink-0 text-xs">
                      •
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {onTakeMeThere && (
              <button
                onClick={onTakeMeThere}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                {ctaLabel}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 border border-slate-700/30 cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
