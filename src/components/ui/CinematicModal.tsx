import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  title?: string;
  subtitle?: string;
  accentColor?: string; // tailwind class like 'emerald', 'blue', 'red', 'yellow'
}

export const CinematicModal: React.FC<CinematicModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'md',
  title,
  subtitle,
  accentColor = 'blue',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const accentBorderColors: Record<string, string> = {
    blue: 'border-blue-500/50',
    emerald: 'border-emerald-500/50',
    red: 'border-red-500/50',
    yellow: 'border-yellow-500/50',
    amber: 'border-amber-500/50',
    slate: 'border-slate-500/50',
  };

  const accentShadows: Record<string, string> = {
    blue: 'shadow-[0_0_50px_rgba(59,130,246,0.2)]',
    emerald: 'shadow-[0_0_50px_rgba(16,185,129,0.2)]',
    red: 'shadow-[0_0_50px_rgba(239,68,68,0.2)]',
    yellow: 'shadow-[0_0_50px_rgba(234,179,8,0.2)]',
    amber: 'shadow-[0_0_50px_rgba(245,158,11,0.2)]',
    slate: 'shadow-[0_0_50px_rgba(100,116,139,0.2)]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-slate-900 border-2 ${accentBorderColors[accentColor]} rounded-[2.5rem] overflow-hidden ${accentShadows[accentColor]} flex flex-col max-h-[90vh]`}
          >
            {/* Header / Title Area */}
            {(title || subtitle) && (
              <div className="px-8 pt-8 pb-4 text-center">
                {subtitle && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-[10px] font-black uppercase tracking-[0.4em] mb-1 ${
                      accentColor === 'emerald' ? 'text-emerald-500' :
                      accentColor === 'blue' ? 'text-blue-500' :
                      accentColor === 'red' ? 'text-red-500' :
                      accentColor === 'yellow' ? 'text-yellow-500' :
                      accentColor === 'amber' ? 'text-amber-500' :
                      'text-slate-500'
                    }`}
                  >
                    {subtitle}
                  </motion.div>
                )}
                {title && (
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-white uppercase tracking-tighter italic"
                  >
                    {title}
                  </motion.h2>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 pt-4">
                {children}
              </div>
            </div>

            {/* Decorative Footer */}
            <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800/50 text-center shrink-0">
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Bag Chaser Cinematic Engine</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
