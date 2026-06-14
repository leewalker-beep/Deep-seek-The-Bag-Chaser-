import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled || !content) return children;

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setTimeout(() => setIsVisible(false), 2000)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-2xl text-[10px] text-white font-medium pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-slate-900" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-700 -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
