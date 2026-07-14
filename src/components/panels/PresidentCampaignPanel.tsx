import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';
import { getMasteryCount } from '../../utils/masteryUtils';
import { getElectionTitle } from '../../config/electionTitles';
import { BaseButton } from '../ui/BaseButton';
import { ProgressBar } from '../ui/ProgressBar';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_CONSTANTS } from '../../config/gameConstants';
import { PersuadeVoters } from '../campaign/PersuadeVoters';
import { SwingStateSweep } from '../campaign/SwingStateSweep';
import { CabinetApproval } from '../campaign/CabinetApproval';

interface PresidentCampaignPanelProps {
  hustle: Hustle;
}

export const PresidentCampaignPanel: React.FC<PresidentCampaignPanelProps> = ({ hustle }) => {
  const {
    pl,
    setCampaignStage,
    setCampaignPlatform,
    setCampaignVP,
    setCampaignDelegates,
    executeHustle,
    setActiveHustleView,
    addTickerMessage,
    setActiveTab,
    updatePresidentialStat,
    updateDemographicApproval
  } = useGameStore();
  const stage = pl.campaignStage || 1;
  const platform = pl.campaignPlatform || 'economy';
  const vp = pl.campaignVP || '';
  const delegates = pl.campaignDelegates || 0;

  const [isCasting, setIsCasting] = useState(false);
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [targetDemographic, setTargetDemographic] = useState('Latinos');

  const handleStageComplete = (multiplier: number = 1.0) => {
    setIsCasting(true);
    setTimeout(() => {
      const result = executeHustle(hustle.id, multiplier);
      setIsCasting(false);
      if (result.success) {
        if (stage < 7) {
          setCampaignStage(stage + 1);
        } else {
          setCampaignStage(8);
          if (pl.isReElectionPhase) {
            useGameStore.setState((state) => ({
              pl: {
                ...state.pl,
                isSecondTerm: true,
                isReElectionPhase: false,
                approvalRating: Math.max(0, Math.min(100, state.pl.approvalRating - 10))
              }
            }));
            addTickerMessage("RE-ELECTED! Four more years!", "text-yellow-400 font-black");
            useGameStore.getState().logEvent('ELECTION_WON', { term: 'SECOND' });
          }
          setActiveTab('PRESIDENCY');
          setActiveHustleView(null);
        }
      }
    }, 1000);
  };

  const hasCrimeHistory = (pl.arrestCount && pl.arrestCount > 0) || (pl.heat && pl.heat > 50);
  const campaignPenalty = hasCrimeHistory ? 0.75 : 1.0;

  if (activeMinigame === 'PersuadeVoters') {
    return <PersuadeVoters demographic={targetDemographic} onComplete={(mult) => {
      const gain = Math.floor(mult * 5 * campaignPenalty);
      updateDemographicApproval(targetDemographic, gain);
      addTickerMessage(`You won over key voters in the ${targetDemographic} community: +${gain}% Approval`, 'text-emerald-400');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'SwingStateSweep') {
    return <SwingStateSweep onComplete={(res: any) => {
      const votes = Math.floor(res.multiplier * 20 * campaignPenalty);
      updatePresidentialStat('electoralVotes', votes);
      addTickerMessage(`Swing State Sweep complete: +${votes} Electoral Votes`, 'text-blue-400 font-bold');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'CabinetApproval') {
    return <CabinetApproval onComplete={(mult) => {
      const gain = Math.floor(mult * 10);
      updatePresidentialStat('congressSupport', gain);
      addTickerMessage(`Cabinet Approval process: +${gain} Congress Support`, 'text-purple-400');
      setActiveMinigame(null);
    }} />;
  }

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
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                <h3 className="text-xs font-black text-blue-500 uppercase mb-2">Campaign Action</h3>
                <BaseButton onClick={() => setActiveMinigame('CabinetApproval')} className="w-full text-xs py-2">VET CABINET NOMINEES</BaseButton>
             </div>
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
                    onClick={() => {
                      setCampaignVP(v.id);
                      useGameStore.getState().logEvent('CABINET_APPOINTED', { type: 'RUNNING_MATE', vpName: v.name });
                    }}
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
                    useGameStore.getState().logEvent('PRIMARY_WON', { delegates: delegates + gain });
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
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-lg font-black text-white mb-2">Stage 4: Convention Speech</h3>
              <p className="text-slate-400 text-xs mb-4">The world is watching. Choose the tone of your keynote address.</p>
              <div className="grid gap-3">
                {[
                  { id: 'unifying', label: 'Unifying & Hopeful', desc: '+500 Aura, -50 Heat' },
                  { id: 'aggressive', label: 'Aggressive & Bold', desc: '+500 Clout, +30 Heat' },
                  { id: 'visionary', label: 'Future Visionary', desc: '+300 Clout, +300 Aura' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStageComplete(1.2)}
                    className="p-3 rounded-lg border border-slate-800 hover:border-blue-500 hover:bg-blue-500/10 text-left transition-all"
                  >
                    <div className="font-bold text-sm text-white">{s.label}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 flex gap-2">
                <BaseButton onClick={() => {
                  const dems = ['Latinos', 'Seniors', 'Veterans', 'Youth', 'Suburban', 'Rural', 'Urban'];
                  setTargetDemographic(dems[Math.floor(Math.random() * dems.length)]);
                  setActiveMinigame('PersuadeVoters');
                }} className="flex-1 text-[10px] py-2">PERSUADE VOTERS</BaseButton>
                <BaseButton onClick={() => setActiveMinigame('SwingStateSweep')} className="flex-1 text-[10px] py-2">SWING STATE SWEEP</BaseButton>
             </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
              <h3 className="text-lg font-black text-white mb-2">Stage 5: General Election Trail</h3>
              <p className="text-slate-400 text-xs mb-6">Barnstorming the swing states. Your Clout and Aura determine the momentum.</p>
              <div className="flex justify-around mb-6">
                <div>
                  <div className="text-[8px] text-slate-500 uppercase font-black">Momentum</div>
                  <div className="text-2xl font-black text-blue-400">{Math.floor((pl.clout + pl.aura) / 100)}%</div>
                </div>
                <div>
                  <div className="text-[8px] text-slate-500 uppercase font-black">Polls</div>
                  <div className="text-2xl font-black text-emerald-400">+{Math.floor(pl.aura / 200)} pts</div>
                </div>
              </div>
              <BaseButton isLoading={isCasting} onClick={() => handleStageComplete(2.0)} className="w-full py-4">FIGHT FOR EVERY VOTE</BaseButton>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
              <h3 className="text-lg font-black text-white mb-2">Stage 6: Presidential Debates</h3>
              <p className="text-slate-400 text-xs mb-6">One on one. No teleprompters. Only your wits and your record.</p>
              <div className="bg-slate-900 p-4 rounded-lg mb-6 border border-slate-800 text-left">
                <div className="text-[10px] text-blue-500 font-bold uppercase mb-2">Moderator:</div>
                <div className="text-xs italic text-slate-300">"Candidate, how do you respond to the allegations regarding your business ties?"</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <BaseButton onClick={() => handleStageComplete(1.5)} className="text-xs">DEFLECT & ATTACK</BaseButton>
                <BaseButton onClick={() => handleStageComplete(1.5)} className="text-xs">STATE THE FACTS</BaseButton>
              </div>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-slate-950 p-8 rounded-xl border-4 border-double border-red-600 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-red-600" />
               <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">ELECTION NIGHT</h3>
               <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">The results are coming in...</p>

               <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-xs font-bold">FLORIDA</span>
                    <span className="text-blue-500 font-black">CALLED</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-xs font-bold">OHIO</span>
                    <span className="text-blue-500 font-black">CALLED</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="text-xs font-bold">PENNSYLVANIA</span>
                    <span className="text-amber-500 font-black animate-pulse">TOO CLOSE TO CALL</span>
                  </div>
               </div>

               <BaseButton isLoading={isCasting} onClick={() => {
                 useGameStore.getState().logEvent('ELECTION_WON', { status: 'CLAIMED' });
                 handleStageComplete(5.0);
               }} className="w-full py-6 text-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)]">CLAIM VICTORY</BaseButton>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-white to-red-600" />

      {hasCrimeHistory && (
        <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-xl text-xs text-red-400 font-bold mb-4">
          ⚠️ CRIMINAL RECORD DETECTED: Due to your past arrests or high heat, voters are highly skeptical. Campaign persuasion and swing state gains are 25% less effective.
        </div>
      )}

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
            {pl.isReElectionPhase ? 'Re-election' : 'Stage'} {stage}/7
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <div key={stage}>
          {renderStage()}
        </div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 pt-6 border-t border-slate-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Candidate Profile</div>
            <div className="text-sm text-white font-bold italic">"{getElectionTitle(getMasteryCount(pl))}"</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Your mastery of {getMasteryCount(pl)} hustles makes you {getElectionTitle(getMasteryCount(pl)) === 'The Specialist' ? 'a' : ''} <span className="text-blue-400">{getElectionTitle(getMasteryCount(pl))}</span>.
            </div>
            <div className="text-[10px] text-emerald-400 font-black uppercase mt-1">Voters trust your expertise.</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Expertise Bonus</div>
            <div className="text-lg font-black text-emerald-400">+{Math.min(15, getMasteryCount(pl) * 1.5).toFixed(1)}%</div>
            <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">Approval per trail</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
