import React from 'react';
import { type AvatarDef, PLAYER_AVATARS } from
  '../config/avatars';

interface AvatarProps {
  avatarId: string;
  size?: number;
  className?: string;
  ring?: string;
}

const AvatarSVG: React.FC<{
  def: AvatarDef; size: number
}> = ({ def, size }) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.38; // face radius

  // Hair paths based on style
  const hairPaths: Record<string, React.ReactNode> = {
    short: (
      <ellipse cx={cx} cy={cy - r * 0.6}
        rx={r * 0.95} ry={r * 0.55}
        fill={def.hairColor} />
    ),
    fade: (
      <>
        <ellipse cx={cx} cy={cy - r * 0.5}
          rx={r * 0.95} ry={r * 0.5}
          fill={def.hairColor} />
        <rect x={cx - r * 0.95}
          y={cy - r * 0.2}
          width={r * 0.15} height={r * 0.4}
          fill={def.hairColor} rx={2} />
        <rect x={cx + r * 0.8}
          y={cy - r * 0.2}
          width={r * 0.15} height={r * 0.4}
          fill={def.hairColor} rx={2} />
      </>
    ),
    locs: (
      <>
        <ellipse cx={cx} cy={cy - r * 0.6}
          rx={r * 0.95} ry={r * 0.55}
          fill={def.hairColor} />
        {[-3,-1.5,0,1.5,3].map((offset, i) => (
          <rect key={i}
            x={cx + offset * r * 0.18 - r * 0.06}
            y={cy + r * 0.3}
            width={r * 0.1}
            height={r * 0.4 + i * r * 0.05}
            fill={def.hairColor} rx={4} />
        ))}
      </>
    ),
    long: (
      <>
        <ellipse cx={cx} cy={cy - r * 0.6}
          rx={r * 0.95} ry={r * 0.55}
          fill={def.hairColor} />
        <rect x={cx - r * 0.9} y={cy - r * 0.3}
          width={r * 0.2} height={r * 0.9}
          fill={def.hairColor} rx={4} />
        <rect x={cx + r * 0.7} y={cy - r * 0.3}
          width={r * 0.2} height={r * 0.9}
          fill={def.hairColor} rx={4} />
      </>
    ),
    bun: (
      <>
        <ellipse cx={cx} cy={cy - r * 0.6}
          rx={r * 0.95} ry={r * 0.4}
          fill={def.hairColor} />
        <circle cx={cx} cy={cy - r * 1.05}
          r={r * 0.3} fill={def.hairColor} />
      </>
    ),
    natural: (
      <ellipse cx={cx} cy={cy - r * 0.5}
        rx={r * 1.1} ry={r * 0.75}
        fill={def.hairColor} />
    ),
  };

  // Feature elements
  const featureEl: Record<string, React.ReactNode> = {
    beard: (
      <ellipse cx={cx} cy={cy + r * 0.55}
        rx={r * 0.55} ry={r * 0.22}
        fill={def.hairColor} opacity={0.85} />
    ),
    glasses: (
      <g stroke="#94a3b8" strokeWidth={s * 0.018}
         fill="none">
        <circle cx={cx - r * 0.3}
          cy={cy - r * 0.05} r={r * 0.22} />
        <circle cx={cx + r * 0.3}
          cy={cy - r * 0.05} r={r * 0.22} />
        <line x1={cx - r * 0.08}
          y1={cy - r * 0.05}
          x2={cx + r * 0.08}
          y2={cy - r * 0.05} />
      </g>
    ),
    earring: (
      <>
        <circle cx={cx - r * 0.92} cy={cy + r * 0.1}
          r={r * 0.07} fill="#f59e0b" />
        <circle cx={cx + r * 0.92} cy={cy + r * 0.1}
          r={r * 0.07} fill="#f59e0b" />
      </>
    ),
    none: <></>,
  };

  return (
    <svg width={s} height={s}
      viewBox={`0 0 ${s} ${s}`}
      xmlns="http://www.w3.org/2000/svg">

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={cx}
        fill="#1e293b" />

      {/* Hair (behind face) */}
      {hairPaths[def.hairStyle]}

      {/* Face */}
      <ellipse cx={cx} cy={cy + r * 0.05}
        rx={r * 0.82} ry={r * 0.92}
        fill={def.skinTone} />

      {/* Eyes */}
      <circle cx={cx - r * 0.28}
        cy={cy - r * 0.08} r={r * 0.1}
        fill="#1a0a00" />
      <circle cx={cx + r * 0.28}
        cy={cy - r * 0.08} r={r * 0.1}
        fill="#1a0a00" />

      {/* Eye whites */}
      <circle cx={cx - r * 0.25}
        cy={cy - r * 0.1} r={r * 0.04}
        fill="white" opacity={0.6} />
      <circle cx={cx + r * 0.25}
        cy={cy - r * 0.1} r={r * 0.04}
        fill="white" opacity={0.6} />

      {/* Nose */}
      <ellipse cx={cx} cy={cy + r * 0.18}
        rx={r * 0.1} ry={r * 0.07}
        fill={def.skinTone}
        stroke="#00000030"
        strokeWidth={s * 0.012} />

      {/* Mouth */}
      <path
        d={`M ${cx - r * 0.22} ${cy + r * 0.4}
            Q ${cx} ${cy + r * 0.55}
            ${cx + r * 0.22} ${cy + r * 0.4}`}
        stroke="#00000040"
        strokeWidth={s * 0.018}
        fill="none"
        strokeLinecap="round" />

      {/* Feature overlay */}
      {featureEl[def.feature]}

      {/* Hair front layer (overlap face top) */}
      <ellipse cx={cx} cy={cy - r * 0.88}
        rx={r * 0.85} ry={r * 0.2}
        fill={def.hairColor} />
    </svg>
  );
};

const Avatar: React.FC<AvatarProps> = ({
  avatarId, size = 40, className = '', ring
}) => {
  const def = PLAYER_AVATARS.find(
    a => a.id === avatarId
  ) || PLAYER_AVATARS[0];

  return (
    <div
      className={`rounded-full overflow-hidden
        shrink-0 bg-slate-800 relative
        ${ring ? `ring-2 ${ring}` : ''}
        ${className}`}
      style={{ width: size, height: size,
               minWidth: size, minHeight: size }}
    >
      {/* Background/Placeholder */}
      <div className="absolute inset-0 bg-slate-900 animate-pulse opacity-50" />

      <div className="relative z-10 w-full h-full">
        <AvatarSVG def={def} size={size} />
      </div>
    </div>
  );
};

export default Avatar;
