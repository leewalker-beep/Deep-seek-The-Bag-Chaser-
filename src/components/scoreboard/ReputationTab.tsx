import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { getReputationDetails } from '../../engine/reputationEngine';

export const ReputationTab: React.FC = () => {
  const { pl } = useGameStore();

  const currentRepName = pl.narrativeFlags?.publicReputation as string || "The Hustler";
  const repDetails = getReputationDetails(currentRepName);
  const candidate = pl.narrativeFlags?.reputationCandidate as string;
  const sustainedMonths = pl.narrativeFlags?.reputationSustainedMonths as number || 0;

  const charityScore = Math.min(100, Math.round(
    (pl.aura * 0.4) +
    ((pl.philanthropyDonation || 0) > 100000 ? 30 : 0) +
    ((pl.hustleLevels?.['philanthropy_empire'] || 0) > 0 ? 30 : 0)
  ));

  const crimeScore = Math.min(100, Math.round(
    (pl.heat * 0.5) +
    (Math.min(30, (pl.arrestCount || 0) * 10)) +
    ((pl.hustleLevels?.['r_ghost_mode'] || 0) > 0 ? 10 : 0) +
    ((pl.hustleLevels?.['r_scrap'] || 0) > 0 ? 10 : 0)
  ));

  const commerceScore = Math.min(100, Math.round(
    (Object.keys(pl.hustleLevels || {}).length * 8) +
    ((pl.rentalCount || 0) * 6) +
    (pl.bag > 1000000 ? 30 : 10)
  ));

  const socialScore = Math.min(100, Math.round(
    (pl.clout / 12) +
    ((pl.artists || []).length * 12)
  ));

  return (
    <motion.div
      key="reputation"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="space-y-5">
        {/* Persona Contributing Vectors Tracker */}
        <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-2xl space-y-3">
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex justify-between items-center">
            <span>📊 Persona Contributing Vectors</span>
            <span className="text-[7px] text-slate-500 lowercase font-medium">real-time factors</span>
          </h4>
          <div className="space-y-2">
            {/* Charity Vector */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                <span className="text-emerald-400">🕊️ Charity & Philanthropy</span>
                <span className="text-slate-400">{charityScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${charityScore}%` }} />
              </div>
            </div>

            {/* Crime Vector */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                <span className="text-red-400">⚖️ Crime & Underworld Activity</span>
                <span className="text-slate-400">{crimeScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${crimeScore}%` }} />
              </div>
            </div>

            {/* Social/Celebrity Vector */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                <span className="text-blue-400">👑 Social Clout & Celebrity</span>
                <span className="text-slate-400">{socialScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${socialScore}%` }} />
              </div>
            </div>

            {/* Commerce/Mogul Vector */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                <span className="text-yellow-400">🏢 Commerce & Mogul Leverage</span>
                <span className="text-slate-400">{commerceScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${commerceScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Title Card */}
        <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden text-center shadow-lg">
          <div className="absolute top-2 right-2 bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-black tracking-widest text-emerald-400 px-2 py-0.5 rounded uppercase">
            Active Profile
          </div>
          <span className="text-4xl block mb-2 animate-pulse">🏆</span>
          <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">
            {repDetails.name}
          </h3>
          <p className="text-[10px] text-slate-300 uppercase tracking-tight font-medium max-w-sm mx-auto leading-relaxed pt-1">
            {repDetails.earnedHow}
          </p>
        </div>

        {/* Shifting perception helper */}
        {candidate && (
          <div className="p-4 bg-yellow-950/15 border border-yellow-500/25 rounded-2xl space-y-2">
            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest block">
              ⚡ Public Perception Shifting
            </span>
            <p className="text-[10px] text-slate-300 uppercase tracking-tight font-medium leading-relaxed">
              Sustained trend noticed: Public focus is shifting towards <strong className="text-yellow-400">"{candidate}"</strong>.
            </p>
            <div className="flex items-center gap-2.5">
              <div className="h-2 flex-1 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: `${(sustainedMonths / 3) * 100}%` }} />
              </div>
              <span className="text-[8px] font-mono font-bold text-yellow-400 uppercase shrink-0">{sustainedMonths}/3 Months</span>
            </div>
          </div>
        )}

        {/* Contributing Factors */}
        <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
            Contributing Factors
          </h4>
          <ul className="space-y-1.5 pl-1">
            {repDetails.contributingFactors.map((factor, idx) => (
              <li key={idx} className="text-[10px] text-slate-300 uppercase tracking-tight font-medium flex items-start gap-2">
                <span className="text-indigo-400 shrink-0">⚡</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Positives & Negatives */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Positives */}
          <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-2xl space-y-2.5">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-500/10 pb-1.5">
              <span>✅</span> Positive Effects
            </h4>
            <ul className="space-y-1.5">
              {repDetails.positives.map((pos, idx) => (
                <li key={idx} className="text-[9px] text-slate-300 uppercase tracking-tight font-semibold leading-normal">
                  • {pos}
                </li>
              ))}
            </ul>
          </div>

          {/* Negatives */}
          <div className="p-4 bg-red-950/10 border border-red-500/20 rounded-2xl space-y-2.5">
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-red-500/10 pb-1.5">
              <span>❌</span> Negative Effects
            </h4>
            <ul className="space-y-1.5">
              {repDetails.negatives.map((neg, idx) => (
                <li key={idx} className="text-[9px] text-slate-300 uppercase tracking-tight font-semibold leading-normal">
                  • {neg}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
