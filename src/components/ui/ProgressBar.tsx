import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProgressBarProps {
  value: number;
  max?: number;
  colorClass?: string;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  colorClass = 'bg-emerald-500',
  className,
  showValue = false,
  label,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter text-slate-500">
        {label && <span>{label}</span>}
        {showValue && <span>{Math.floor(value)}%</span>}
      </div>
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full transition-colors duration-500', colorClass)}
        />
      </div>
    </div>
  );
};
