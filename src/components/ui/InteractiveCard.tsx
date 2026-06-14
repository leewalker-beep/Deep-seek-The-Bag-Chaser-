import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InteractiveCardProps extends HTMLMotionProps<'div'> {
  onClick?: () => void;
  isActive?: boolean;
  isLocked?: boolean;
  glowColor?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className,
  onClick,
  isActive,
  isLocked,
  glowColor = 'rgba(16,185,129,0.2)',
  ...props
}) => {
  return (
    <motion.div
      whileHover={onClick && !isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick && !isLocked ? { scale: 0.98 } : {}}
      onClick={isLocked ? undefined : onClick}
      className={cn(
        'relative bg-slate-900 border transition-all duration-300 rounded-2xl overflow-hidden',
        onClick && !isLocked ? 'cursor-pointer' : 'cursor-default',
        isActive
          ? 'border-emerald-500 shadow-[0_0_20px_var(--glow-color)]'
          : 'border-slate-800 hover:border-slate-700',
        isLocked && 'opacity-60 grayscale contrast-75',
        className
      )}
      style={{ '--glow-color': glowColor } as any}
      {...props}
    >
      {isLocked && (
        <>
          <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-[1px]" />
          <div className="absolute top-2 right-2 z-20 text-lg">🔒</div>
        </>
      )}
      {children as React.ReactNode}
    </motion.div>
  );
};
