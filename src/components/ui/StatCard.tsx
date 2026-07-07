import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  label,
  value,
  icon,
  trend,
  colorClass = 'text-white',
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-3 rounded-xl flex flex-col justify-between',
        className
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        {icon && <span className="text-xs opacity-50">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-lg font-black font-mono tracking-tighter', colorClass)}>
          {value}
        </span>
        {trend && (
          <span className={cn('text-[10px] font-bold',
            trend === 'up' ? 'text-emerald-400' :
            trend === 'down' ? 'text-red-400' : 'text-slate-500'
          )}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
          </span>
        )}
      </div>
    </motion.div>
  );
});
