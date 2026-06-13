import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';
import { BaseButton } from '../ui/BaseButton';
import { ProgressBar } from '../ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CONSTANTS } from '../../config/gameConstants';

interface PresidentCampaignPanelProps {
  hustle: Hustle;
}

export const PresidentCampaignPanel: React.FC<PresidentCampaignPanelProps> = ({ hustle }) => {
  const { pl, setCampaignStage, setCampaignPlatform, setCampaignVP, setCampaignDelegates, executeHustle, setActiveHustleView, addTickerMessage } = useGameStore();
  const stage = pl.campaignStage || 1;
  const platform = pl.campaignPlatform || 'economy';
  const vp = pl.campaignVP || '';
  const delegates = pl.campaignDelegates || 0;

  const [isCasting, setIsCasting] = useState(false);

  const handleStageComplete = (multiplier: number = 1.0) => {
    setIsCasting(true);
    setTimeout(() => {
      const result = executeHustle(hustle.id, multiplier);
      setIsCasting(false);
      if (result.success) {
        if (stage < 7) {
          setCampaignStage(stage + 1);
        } else {
          setActiveHustleView(null);
        }
      }
    }, 1000);
  };

  const renderStage = () => {
    switch(stage) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-lg font-black text-white mb-2">Stage 1: Launch Platform</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">The message you launch today will define your entire run. Choose wisely.</p>
              <div className="grid gap-3">
                {[
                  { id: 'economy', label: 'Economy Focus', desc: '+200 Clout, +100 Aura', color: 'border-emerald-500/30' },
                  { id: 'healthcare', label: 'Healthcare Focus', desc: '+100 Clout, +200 Aura', color: 'border-blue-500/30' },
                  { id: 'foreign', label: 'Foreign Policy', desc: '+150 Clout, +150 Aura', color: 'border-purple-500/30' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCampaignPlatform(p.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all ${platform === p.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="font-bold text-sm text-white">{p.label}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <BaseButton isLoading={isCasting} onClick={() => handleStageComplete()} className="w-full py-4 text-lg">ANNOUNCE CANDIDACY</BaseButton>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-lg font-black text-white mb-2">Stage 2: Running Mate</h3>
              <p className="text-slate-400 text-xs mb-4">A Vice President can shore up your weaknesses or double down on your strengths.</p>
              <div className="grid gap-3">
                {[
                  { id: 'senator', name: 'Senator Williams', desc: '+300 Clout, -10 Heat', sub: 'The Establishment Choice' },
                  { id: 'governor', name: 'Gov. Martinez', desc: '+200 Clout, +200 Aura', sub: 'The People\'s Champion' },
                  { id: 'ceo', name: 'CEO Chen', desc: '+400 Clout, +20 Heat', sub: 'The Disruptor' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setCampaignVP(v.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${vp === v.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="font-bold text-sm text-white">{v.name}</div>
                    <div className="text-[9px] text-blue-400 uppercase font-black">{v.sub}</div>
                    <div className="text-[8px] text-slate-500 mt-1">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <BaseButton isLoading={isCasting} onClick={() => handleStageComplete()} disabled={!vp} className="w-full py-4 text-lg">CONFIRM RUNNING MATE</BaseButton>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
              <h3 className="text-lg font-black text-white mb-2">Stage 3: Primary Battle</h3>
              <div className="my-6">
                <ProgressBar value={delegates} max={GAME_CONSTANTS.NOMINATION_DELEGATES_REQUIRED} label="Delegates Secured" showValue />
                <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Need {GAME_CONSTANTS.NOMINATION_DELEGATES_REQUIRED.toLocaleString()} to clinch nomination</div>
              </div>
              <BaseButton
                isLoading={isCasting}
                onClick={() => {
                  const gain = 400 + Math.floor(Math.random() * 200);
                  setCampaignDelegates(Math.min(GAME_CONSTANTS.NOMINATION_DELEGATES_REQUIRED, delegates + gain));
                  if (delegates + gain >= GAME_CONSTANTS.NOMINATION_DELEGATES_REQUIRED) {
                    addTickerMessage("NOMINATION CLINCHED!", "text-yellow-400 font-black");
                    handleStageComplete(1.5);
                  } else {
                    addTickerMessage(`Won Primary: +${gain} delegates`, "text-emerald-400");
                  }
                }}
                className="w-full py-4"
              >
                {delegates >= GAME_CONSTANTS.NOMINATION_DELEGATES_REQUIRED ? "GOTO CONVENTION" : "BATTLE IN NEXT STATE"}
              </BaseButton>
            </div>
          </motion.div>
        );
      default:
        return (
          <div className="space-y-4 text-center py-8">
            <div className="text-4xl mb-4">🗳️</div>
            <h3 className="text-xl font-black text-white">Stage {stage}: The Final Push</h3>
            <p className="text-slate-400 text-sm px-6">You've come too far to lose now. Mobilize the base and secure the future.</p>
            <BaseButton isLoading={isCasting} onClick={() => handleStageComplete(stage * 0.5)} className="w-full py-4 text-xl">EXECUTE STAGE</BaseButton>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-white to-red-600" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{hustle.icon}</div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{hustle.name}</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Campaign Trail</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
          <div className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-white border border-slate-700 uppercase">
            Stage {stage}/7
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <div key={stage}>
          {renderStage()}
        </div>
      </AnimatePresence>
    </div>
  );
};
