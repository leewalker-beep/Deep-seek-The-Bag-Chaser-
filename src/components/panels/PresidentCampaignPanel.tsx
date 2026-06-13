import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Hustle } from '../../config/hustles/base';

interface PresidentCampaignPanelProps {
  hustle: Hustle;
}

export const PresidentCampaignPanel: React.FC<PresidentCampaignPanelProps> = ({ hustle }) => {
  const { pl, setCampaignStage, setCampaignPlatform, setCampaignVP, setCampaignDelegates, executeHustle, setActiveHustleView } = useGameStore();
  const stage = pl.campaignStage || 1;
  const platform = pl.campaignPlatform || 'economy';
  const vp = pl.campaignVP || '';

  const handleStageComplete = (multiplier: number = 1.0) => {
    const result = executeHustle(hustle.id, multiplier);
    if (result.success) {
      if (stage < 7) {
        setCampaignStage(stage + 1);
      } else {
        setActiveHustleView(null);
      }
    }
  };

  const renderStage = () => {
    switch(stage) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 1: Announcement</h3>
            <p className="text-slate-400 text-sm">Choose your campaign platform</p>
            <div className="grid gap-3">
              <button onClick={() => setCampaignPlatform('economy')} className={`p-4 rounded-xl border-2 ${platform === 'economy' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                <div className="font-bold text-white">Economy Focus</div>
                <div className="text-[10px] text-slate-400">+200 Clout, +100 Aura</div>
              </button>
              <button onClick={() => setCampaignPlatform('healthcare')} className={`p-4 rounded-xl border-2 ${platform === 'healthcare' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                <div className="font-bold text-white">Healthcare Focus</div>
                <div className="text-[10px] text-slate-400">+100 Clout, +200 Aura</div>
              </button>
              <button onClick={() => setCampaignPlatform('foreign')} className={`p-4 rounded-xl border-2 ${platform === 'foreign' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                <div className="font-bold text-white">Foreign Policy Focus</div>
                <div className="text-[10px] text-slate-400">+150 Clout, +150 Aura</div>
              </button>
            </div>
            <button onClick={() => handleStageComplete()} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">LAUNCH CAMPAIGN</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 2: Choose Running Mate</h3>
            <div className="grid gap-3">
              <button onClick={() => setCampaignVP('senator')} className="p-4 rounded-xl border-2 border-slate-800">
                <div className="font-bold text-white">Senator Williams</div>
                <div className="text-[10px] text-slate-400">+300 Clout, -10 Heat</div>
              </button>
              <button onClick={() => setCampaignVP('governor')} className="p-4 rounded-xl border-2 border-slate-800">
                <div className="font-bold text-white">Governor Martinez</div>
                <div className="text-[10px] text-slate-400">+200 Clout, +200 Aura</div>
              </button>
              <button onClick={() => setCampaignVP('ceo')} className="p-4 rounded-xl border-2 border-slate-800">
                <div className="font-bold text-white">CEO Chen</div>
                <div className="text-[10px] text-slate-400">+400 Clout, +20 Heat</div>
              </button>
            </div>
            <button onClick={() => handleStageComplete()} disabled={!vp} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl disabled:opacity-50">SELECT RUNNING MATE</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 3: Primary Battle</h3>
            <p className="text-slate-400 text-sm">Delegates won: {pl.campaignDelegates || 0}/1991</p>
            <button onClick={() => { setCampaignDelegates((pl.campaignDelegates || 0) + 100); handleStageComplete(1.5); }} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">WIN PRIMARY</button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 4: Convention Speech</h3>
            <button onClick={() => handleStageComplete(2.0)} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">DELIVER SPEECH</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 5: General Election</h3>
            <button onClick={() => handleStageComplete(2.5)} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">RUN ELECTION</button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 6: Presidential Debates</h3>
            <button onClick={() => handleStageComplete(3.0)} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl">DEBATE</button>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white">Stage 7: Election Night</h3>
            <button onClick={() => handleStageComplete(5.0)} className="w-full py-4 bg-yellow-600 text-white font-black rounded-xl">WIN THE PRESIDENCY</button>
          </div>
        );
      default:
        return <div>Campaign complete!</div>;
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{hustle.icon}</div>
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic">{hustle.name}</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Stage {stage} of 7</p>
        </div>
      </div>
      {renderStage()}
    </div>
  );
};
