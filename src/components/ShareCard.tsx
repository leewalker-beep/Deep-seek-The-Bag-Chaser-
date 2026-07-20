import { forwardRef } from 'react';
import Avatar from './Avatar';

interface ShareCardProps {
  playerName: string;
  avatarId: string;
  tier: string;
  finalBag: number;
  legacyScore: number;
  months: number;
  endingTitle: string;
  endingEmoji: string;
  deathMessage: string;
  deathBadge: string;
  originBonus?: string;
  blueprint?: {
    primaryColor: 'CRIMSON' | 'GOLD' | 'COBALT' | 'VIOLET';
    dominantPersona: string;
    paceSeconds: number;
    paceLabel: string;
    adviceRatio: number;
    setbackRatio: number;
    riskCadenceRatio: number;
    orientationLabel: string;
    headlineSynthesis?: string;
  };
}

const formatBag = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

const formatLegacy = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n.toLocaleString()}`;
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>((props, ref) => {
  const {
    playerName,
    avatarId,
    tier,
    finalBag,
    legacyScore,
    months,
    endingTitle,
    endingEmoji,
    deathMessage,
    deathBadge,
    blueprint
  } = props;

  return (
    <div
      ref={ref}
      style={{
        width: '390px',
        height: '700px',
        background: 'linear-gradient(160deg, #0a0a0f 0%, #0f0a1a 50%, #0a0f0a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="flex flex-col p-8 font-sans"
    >
      {/* Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Blobs */}
      <div className="absolute top-0 right-0 bg-purple-900/30 w-64 h-64 blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 bg-emerald-900/20 w-48 h-48 blur-3xl -ml-10 -mb-10" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* GAME BRAND */}
        <div className="text-center">
          <div className="text-xs font-black tracking-[0.3em] text-emerald-400">BAG CHASER</div>
          <div className="text-[10px] text-slate-500 tracking-widest mt-0.5">HUSTLE OR DIE</div>
        </div>

        <div className="border-t border-slate-800 w-full mt-2 mb-4" />

        {/* PLAYER ALIAS */}
        <div className="text-center mt-4">
          <h1
            className="text-5xl font-black text-white uppercase tracking-tight"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}
          >
            {playerName}
          </h1>

          <div className="flex justify-center mt-3">
            <Avatar
              avatarId={avatarId}
              size={80}
              ring="ring-emerald-500/40"
              className="shadow-2xl"
            />
          </div>

          <div className="text-xl font-black text-amber-400 uppercase tracking-wider mt-1">
            {endingEmoji} {endingTitle}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/30">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">EARNED</div>
            <div className="text-emerald-400 text-2xl font-black">{formatBag(finalBag)}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/30">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">LEGACY</div>
            <div className="text-white text-2xl font-black">{formatLegacy(legacyScore)}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/30">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">SURVIVED</div>
            <div className="text-slate-300 text-xl font-black">{months} months</div>
          </div>
        </div>

        {/* TIER JOURNEY */}
        <div className="mt-2 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
            Started in MUD · Reached <span className="text-slate-300">{tier}</span> tier
          </div>
        </div>

        {/* BLUEPRINT SUB-PANEL */}
        {blueprint && (
          <div className="mt-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-left flex flex-col gap-1">
            <div className="flex justify-between items-center border-b border-slate-850 pb-1">
              <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-black">ADVISOR BLUEPRINT</span>
              <span
                className="text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: `${
                    blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                    blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                    blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308'
                  }15`,
                  color:
                    blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                    blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                    blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308',
                  borderColor: `${
                    blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                    blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                    blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308'
                  }40`
                }}
              >
                {blueprint.primaryColor} ({blueprint.dominantPersona})
              </span>
            </div>

            {blueprint.headlineSynthesis && (
              <p className="text-[8.5px] text-slate-300 leading-normal italic font-serif">
                "{blueprint.headlineSynthesis}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-400 mt-0.5">
              <div>
                PACE: <span className="text-white font-mono">{blueprint.paceLabel}</span>
              </div>
              <div>
                ORIENTATION: <span className="text-white font-mono">{blueprint.orientationLabel}</span>
              </div>
            </div>
          </div>
        )}

        {/* DEATH CARD */}
        <div className="mt-3 w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest">💀 CAUSE OF DEATH</div>
          <div className="text-base font-bold text-white leading-snug mt-2 italic">
            "{deathMessage}"
          </div>

          <div className="mt-4 flex justify-end">
            <div className="bg-red-950/60 border border-red-800/40 rounded-full px-3 py-1 text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
              <span>☠️</span> {deathBadge}
            </div>
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="mt-auto pt-8 text-center">
          <div className="text-xs text-slate-600 uppercase tracking-widest font-bold">
            Can you do better?
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold tracking-wider">
            bagchaser.app
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
