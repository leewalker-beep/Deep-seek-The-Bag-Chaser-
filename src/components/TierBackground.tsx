import React, { useMemo } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface TierBackgroundProps extends HTMLMotionProps<'div'> {
  tier: string;
}

const TierBackground: React.FC<TierBackgroundProps> = ({ tier, ...motionProps }) => {
  const styles = useMemo(() => {
    switch (tier) {
      case 'MUD':
        return {
          background: 'linear-gradient(180deg, #0a0805 0%, #1a1208 60%, #0d0a05 100%)',
          blobs: ['bg-amber-950/10', 'bg-stone-900/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.15]">
              <pattern id="mud-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="20" r="1" fill="#2a1f0a" />
                <circle cx="45" cy="15" r="1.5" fill="#2a1f0a" />
                <circle cx="75" cy="40" r="1" fill="#2a1f0a" />
                <circle cx="20" cy="70" r="2" fill="#2a1f0a" />
                <circle cx="60" cy="85" r="1" fill="#2a1f0a" />
                <circle cx="90" cy="60" r="1.5" fill="#2a1f0a" />
                <circle cx="30" cy="35" r="1" fill="#2a1f0a" />
                <circle cx="55" cy="55" r="1" fill="#2a1f0a" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#mud-pattern)" />
            </svg>
          ),
        };
      case 'STREET':
        return {
          background: 'linear-gradient(180deg, #080a10 0%, #0f1520 60%, #080a10 100%)',
          blobs: ['bg-slate-800/10', 'bg-blue-950/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.20]">
              <pattern id="street-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2030" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#street-grid)" />
            </svg>
          ),
        };
      case 'STARTUP':
        return {
          background: 'linear-gradient(135deg, #080d14 0%, #0a1020 50%, #060810 100%)',
          blobs: ['bg-blue-900/10', 'bg-cyan-950/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.15]">
              <pattern id="startup-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="#1a3050" />
                <circle cx="50" cy="50" r="1.5" fill="#1a3050" />
                <path d="M 10 10 L 50 50" stroke="#1a3050" strokeWidth="0.5" />
                <circle cx="50" cy="10" r="1" fill="#1a3050" />
                <path d="M 50 10 L 50 50" stroke="#1a3050" strokeWidth="0.5" strokeDasharray="2 2" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#startup-dots)" />
            </svg>
          ),
        };
      case 'CORPORATE':
        return {
          background: 'linear-gradient(180deg, #08080f 0%, #0d0d1a 60%, #080810 100%)',
          blobs: ['bg-slate-700/10', 'bg-indigo-950/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.20]">
              <pattern id="corp-lines" x="0" y="0" width="100" height="8" patternUnits="userSpaceOnUse">
                <line x1="0" y1="4" x2="100" y2="4" stroke="#1a1a2a" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#corp-lines)" />
            </svg>
          ),
        };
      case 'ELITE':
        return {
          background: 'linear-gradient(135deg, #0a0810 0%, #120a1a 50%, #0a0810 100%)',
          blobs: ['bg-purple-900/10', 'bg-slate-800/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.15]">
              <pattern id="elite-hatch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="#1a0f28" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#elite-hatch)" />
            </svg>
          ),
        };
      case 'MOGUL':
        return {
          background: 'linear-gradient(180deg, #0d0a05 0%, #1a1205 50%, #0a0800 100%)',
          blobs: ['bg-amber-900/10', 'bg-yellow-950/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.10]">
              <filter id="marble-filter">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="1" />
                <feColorMatrix type="matrix" values="1 0 0 0 0.8 0 1 0 0 0.6 0 0 1 0 0.2 0 0 0 0.5 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#marble-filter)" />
            </svg>
          ),
        };
      case 'PRESIDENT': {
        const stars = [...Array(20)].map(() => ({
          cx: `${Math.random() * 100}%`,
          cy: `${Math.random() * 100}%`,
          r: 1 + Math.random()
        }));
        return {
          background: 'linear-gradient(180deg, #05080d 0%, #080d18 50%, #050810 100%)',
          blobs: ['bg-blue-900/10', 'bg-indigo-900/10'],
          overlay: (
            <svg width="100%" height="100%" className="opacity-[0.30]">
              {stars.map((star, idx) => (
                <circle
                  key={idx}
                  cx={star.cx}
                  cy={star.cy}
                  r={star.r}
                  fill="white"
                />
              ))}
            </svg>
          ),
        };
      }
      case 'OPEN':
        return {
          background: 'linear-gradient(135deg, #0a0514 0%, #140520 50%, #0a0514 100%)',
          blobs: ['bg-emerald-900/10', 'bg-purple-900/10'],
          overlay: (
            <div className="absolute inset-0 overflow-hidden opacity-[0.08] pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500 blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 blur-[100px] animate-pulse" />
              <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-600 blur-[130px] opacity-50" />
            </div>
          ),
        };
      default:
        return {
          background: '#000',
          blobs: [],
          overlay: null,
        };
    }
  }, [tier]);

  return (
    <motion.div
      {...motionProps}
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      style={{ background: styles.background, ...motionProps.style }}
    >
      {/* Blurred Blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${styles.blobs[0] || ''}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${styles.blobs[1] || ''}`} />

      {/* SVG Pattern/Overlay */}
      <div className="absolute inset-0">
        {styles.overlay}
      </div>
    </motion.div>
  );
};

export default TierBackground;
