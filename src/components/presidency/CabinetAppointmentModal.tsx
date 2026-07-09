import React from 'react';
import { CinematicModal } from '../ui/CinematicModal';
import { PortraitCard } from '../ui/PortraitCard';
import type { CabinetMember } from '../../types/game';
import { motion } from 'framer-motion';

interface CabinetAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CabinetMember[];
  onSelect: (member: CabinetMember) => void;
  roleName: string;
}

export const CabinetAppointmentModal: React.FC<CabinetAppointmentModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onSelect,
  roleName,
}) => {
  return (
    <CinematicModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cabinet Appointment"
      subtitle={`Select a candidate for ${roleName}`}
      accentColor="blue"
      maxWidth="2xl"
    >
      <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight m-4">
        <span className="font-black text-white block mb-1">👔 Cabinet Selection Metrics</span>
        • <span className="text-white font-bold">Competence:</span> Drives policy yield & strategic multiplier bonuses.
        <br />
        • <span className="text-white font-bold">Integrity:</span> Keeps scandals in check; lowers leakage risk.
        <br />
        • <span className="text-white font-bold">Popularity:</span> Provides direct boosts to presidential approval.
        <br />
        • <span className="text-white font-bold">Ambition:</span> Amplifies strategic drive but speeds up loyalty decay.
        <br />
        • <span className="text-white font-bold">Corruption Risk:</span> Chance of inducing heavy legal heat & public backlash crises.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {candidates.map((candidate, idx) => (
          <motion.div
            key={candidate.id + idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center hover:border-blue-500/50 transition-colors group cursor-pointer"
            onClick={() => onSelect(candidate)}
          >
            <PortraitCard
              avatarId={candidate.avatarId}
              name={candidate.name}
              role={candidate.previousCareer}
              size="lg"
              variant="npc"
              className="mb-4"
            />

            <div className="w-full space-y-4">
              <div className="text-[10px] text-slate-500 font-serif italic text-center leading-relaxed">
                "{candidate.bio}"
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StatBar label="Competence" value={candidate.competence ?? 50} color="bg-emerald-500" />
                <StatBar label="Integrity" value={candidate.integrity ?? 50} color="bg-blue-500" />
                <StatBar label="Popularity" value={candidate.popularity ?? 50} color="bg-orange-500" />
                <StatBar label="Ambition" value={candidate.ambition ?? 50} color="bg-purple-500" />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] text-slate-500 font-black uppercase">Corruption Risk</span>
                  <span className={`text-[8px] font-black ${(candidate.corruptionRisk ?? 0) > 50 ? 'text-red-400' : 'text-slate-400'}`}>
                    {candidate.corruptionRisk ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${(candidate.corruptionRisk ?? 0) > 50 ? 'bg-red-500' : 'bg-slate-600'}`}
                    style={{ width: `${candidate.corruptionRisk ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1 justify-center">
                {candidate.personalityTraits?.map(trait => (
                  <span key={trait} className="text-[7px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">
                    {trait}
                  </span>
                ))}
              </div>

              <button className="w-full py-3 bg-blue-600 group-hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-blue-900/20">
                APPOINT TO CABINET
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </CinematicModal>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-0.5">
      <span className="text-[7px] text-slate-500 font-bold uppercase">{label}</span>
      <span className="text-[7px] text-white font-black">{value}</span>
    </div>
    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);
