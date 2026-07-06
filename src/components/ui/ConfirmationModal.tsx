import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isHighStakes?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Proceed',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isHighStakes = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-sm bg-slate-900 border-2 rounded-2xl p-6 shadow-2xl ${
              isHighStakes ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-700'
            }`}
          >
            {isHighStakes && (
              <div className="mb-4 flex justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
            )}

            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight text-center ${
              isHighStakes ? 'text-red-500' : 'text-white'
            }`}>
              {title}
            </h3>

            <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 ${
                  isHighStakes
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}
              >
                {confirmLabel}
              </button>

              <button
                onClick={onCancel}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-black uppercase tracking-widest text-sm transition-all"
              >
                {cancelLabel}
              </button>
            </div>

            {isHighStakes && (
              <p className="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">
                Warning: Large capital expenditure detected.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
