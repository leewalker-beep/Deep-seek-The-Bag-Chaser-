import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { PresidentialActivity, PresidentialActivityChoice } from '../../types/game';
import { Activity, Shield, Users, CheckCircle2 } from 'lucide-react';

interface StrategicMeetingModalProps {
  activity: PresidentialActivity;
  onClose: () => void;
}

type Stage = 'BRIEFING' | 'CHOICE' | 'EXECUTION' | 'RESULTS';

export const StrategicMeetingModal: React.FC<StrategicMeetingModalProps> = ({ activity, onClose }) => {
  const { pl, resolvePresidentialActivity } = useGameStore();
  const [stage, setStage] = useState<Stage>('BRIEFING');
  const [selectedChoice, setSelectedChoice] = useState<PresidentialActivityChoice | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [outcome, setOutcome] = useState<any>(null);

  // Auto-advance execution
  useEffect(() => {
    if (stage === 'EXECUTION') {
      const interval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            handleResolution();
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleResolution = () => {
    if (!selectedChoice) return;
    const result = resolvePresidentialActivity(activity.id, selectedChoice.id, 1.0); // Assuming 1.0 performance for now
    setOutcome(result);
    setStage('RESULTS');
  };

  const checkRequirement = (choice: PresidentialActivityChoice) => {
    if (!choice.requirement) return true;
    const { type, value } = choice.requirement.stat;
    switch (type) {
      case 'aura': return pl.aura >= value;
      case 'clout': return pl.clout >= value;
      case 'relations': return pl.foreignRelations >= value;
      default: return true;
    }
  };

  const getCabinetBonus = (choice: PresidentialActivityChoice) => {
    if (!choice.cabinetBonus) return null;
    const appointee = pl.cabinet[choice.cabinetBonus.roleId];
    if (!appointee) return null;
    return {
      name: appointee.name,
      message: choice.cabinetBonus.message,
      multiplier: appointee.isTrustedAlly ? choice.cabinetBonus.multiplier + 0.5 : choice.cabinetBonus.multiplier
    };
  };

  const renderBriefing = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-center"
    >
      <div className="w-24 h-24 bg-blue-500/10 border-2 border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-5xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        {activity.icon}
      </div>
      <div>
        <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-2">Presidential Briefing</div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{activity.title}</h2>
      </div>
      <p className="text-slate-300 font-serif italic text-lg leading-relaxed px-4">
        "{activity.description}"
      </p>
      <button
        onClick={() => setStage('CHOICE')}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-900/20"
      >
        COMMENCE STRATEGY SESSION →
      </button>
    </motion.div>
  );

  const renderChoice = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">SELECT STRATEGIC DIRECTION</div>

      {activity.choices.map(choice => {
        const isAvailable = checkRequirement(choice);
        const bonus = getCabinetBonus(choice);

        return (
          <button
            key={choice.id}
            disabled={!isAvailable}
            onClick={() => setSelectedChoice(choice)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
              selectedChoice?.id === choice.id
                ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                : isAvailable
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950 border-slate-900 opacity-50 grayscale cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-black uppercase ${selectedChoice?.id === choice.id ? 'text-blue-400' : 'text-white'}`}>
                {choice.label}
              </h3>
              {!isAvailable && (
                <div className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">
                  REQ: {choice.requirement?.stat.value} {choice.requirement?.stat.type}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-serif italic mb-3 leading-snug">"{choice.description}"</p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(choice.impact).map(([key, val]) => {
                if (typeof val !== 'number' || val === 0) return null;
                const isPos = val > 0;
                // Simplify key names for display
                const label = key === 'federalBudget' ? 'Budget' : key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <span key={key} className={`text-[7px] font-black px-1.5 py-0.5 rounded ${isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isPos ? '+' : ''}{key === 'federalBudget' ? `$${(val/1000000).toFixed(0)}M` : val}{key === 'approval' || key === 'inflation' || key === 'debt' ? '%' : ''} {label}
                  </span>
                );
              })}
            </div>

            {bonus && (
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <div className="text-[8px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1">
                  <Users size={8} /> CABINET BONUS: {bonus.name}
                </div>
                <div className="text-[8px] text-slate-500 italic mt-0.5">{bonus.message} (x{bonus.multiplier.toFixed(1)} Impact)</div>
              </div>
            )}
          </button>
        );
      })}

      <div className="pt-4">
        <button
          disabled={!selectedChoice}
          onClick={() => setStage('EXECUTION')}
          className={`w-full py-4 font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl ${
            selectedChoice
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          EXECUTE COMMAND →
        </button>
      </div>
    </motion.div>
  );

  const renderExecution = () => (
    <div className="space-y-8 text-center py-12">
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
        <motion.div
          className="absolute inset-0 border-4 border-blue-500 rounded-full"
          style={{
            clipPath: `polygon(50% 50%, -50% -50%, ${executionProgress > 25 ? '150% -50%' : executionProgress * 4 + '% -50%'}, ${executionProgress > 50 ? '150% 150%' : (executionProgress-25) * 4 + 150 + '% 150%'}, ${executionProgress > 75 ? '-50% 150%' : (executionProgress-50) * 4 - 50 + '% 150%'}, -50% -50%)`,
            rotate: '0deg'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
           <Activity className="text-blue-500 animate-pulse" size={48} />
        </div>
      </div>

      <div>
        <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-2">Simulating Outcomes</div>
        <h3 className="text-xl font-black text-white uppercase italic">Executing {selectedChoice?.label}</h3>
      </div>

      <div className="max-w-xs mx-auto">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${executionProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
          <span>Processing Data</span>
          <span>{executionProgress}%</span>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!outcome) return null;
    const { impacts, diaryEntry } = outcome;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mb-1">Strategic Victory</div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Resolution Complete</h2>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
           <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-3">HISTORICAL RECORD</div>
           <p className="text-sm text-slate-200 font-serif italic leading-relaxed">
             "{diaryEntry}"
           </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(impacts).map(([key, val]) => {
            if (typeof val !== 'number' || val === 0) return null;
            const isPos = val > 0;
            const label = key === 'federalBudget' ? 'Budget' : key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">{label}</div>
                <div className={`text-lg font-black ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPos ? '+' : ''}{key === 'federalBudget' ? `$${(val/1000000).toFixed(1)}M` : val}{key === 'approval' || key === 'inflation' || key === 'debt' ? '%' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {pl.presidentMonth > 36 && (
          <div className="text-[9px] text-orange-400 font-black uppercase text-center bg-orange-500/10 border border-orange-500/30 py-2 rounded-lg animate-pulse">
            ⚠️ Lame Duck Period: Diminished Returns Applied
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl"
        >
          CLOSE BRIEFING
        </button>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield size={120} />
        </div>

        <AnimatePresence mode="wait">
          {stage === 'BRIEFING' && renderBriefing()}
          {stage === 'CHOICE' && renderChoice()}
          {stage === 'EXECUTION' && renderExecution()}
          {stage === 'RESULTS' && renderResults()}
        </AnimatePresence>
      </div>
    </div>
  );
};
