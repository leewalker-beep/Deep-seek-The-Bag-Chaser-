import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseButton } from './ui/BaseButton';

interface TutorialExplanationPopupProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

export const TutorialExplanationPopup: React.FC<TutorialExplanationPopupProps> = ({
  isOpen,
  title,
  content,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl"
          >
            <div className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
              Insight Unlocked
            </div>
            <h2 className="text-2xl font-black mb-4 tracking-tight text-white">{title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {content}
            </p>
            <BaseButton onClick={onClose} className="w-full h-14 text-base">
              Understood
            </BaseButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
