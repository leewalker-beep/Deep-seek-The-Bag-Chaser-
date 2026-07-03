import React from 'react';
import { motion } from 'framer-motion';
import Avatar from '../Avatar';

interface PortraitCardProps {
  avatarId?: string; // Made optional to support image/icon fallbacks
  name: string;
  subtitle?: string;
  flavorText?: string;
  variant?: 'player' | 'npc' | 'rival' | 'president' | 'newspaper';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  role?: string; // Support for dynamic role labels
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  image?: string; // Support for emoji or icon string fallbacks
}

export const PortraitCard: React.FC<PortraitCardProps> = ({
  avatarId,
  name,
  subtitle,
  flavorText,
  variant = 'npc',
  size = 'md',
  className = '',
  role,
  rarity,
  image,
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const variantStyles = {
    player: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    npc: 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    rival: 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    president: 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    newspaper: 'border-slate-400/50 shadow-none grayscale',
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative rounded-2xl border-2 overflow-hidden bg-slate-800 ${sizeClasses[size]} ${variantStyles[variant]} mb-4 flex items-center justify-center`}
      >
        {avatarId ? (
          <Avatar avatarId={avatarId} />
        ) : (
          <div className="text-4xl">{image || '👤'}</div>
        )}

        {/* Placeholder overlay for future generated artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />

        {rarity && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-black bg-slate-950/80 border border-white/10 text-white uppercase tracking-widest">
            {rarity}
          </div>
        )}
      </motion.div>

      <div className="space-y-1 px-4">
        <h3 className={`font-black uppercase tracking-tighter italic ${size === 'xl' ? 'text-3xl' : 'text-xl'} text-white`}>
          {name}
        </h3>
        {(subtitle || role) && (
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">
            {role || subtitle}
          </p>
        )}
        {flavorText && (
          <p className="text-xs text-slate-400 italic leading-snug mt-2 max-w-[240px] mx-auto">
            "{flavorText}"
          </p>
        )}
      </div>
    </div>
  );
};
