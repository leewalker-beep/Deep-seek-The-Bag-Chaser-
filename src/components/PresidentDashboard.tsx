import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CABINET_ROLES, EXECUTIVE_ORDERS } from '../engine/presidentEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { PresidentialNewsTicker } from './PresidentialNewsTicker';
import { ConfirmationModal } from './ui/ConfirmationModal';
import type { ExecutiveOrder, PresidentCrisis } from '../types/game';
import { StateOfTheUnion } from './presidency/StateOfTheUnion';
import { DebatePrep } from './presidency/DebatePrep';
import { NegotiateTreaty } from './presidency/NegotiateTreaty';
import { CrisisRiskAssessment } from './presidency/CrisisRiskAssessment';
import { GOTV } from './presidency/GOTV';
import { LegislativeAgenda } from './presidency/LegislativeAgenda';

export const PresidentDashboard: React.FC = () => {
  const {
    pl,
    issueExecutiveOrder,
    appointCabinetMember,
    fireCabinetMember,
    resolveCrisis,
    advancePresidentialMonth,
    updatePresidentialStat,
    addTickerMessage
  } = useGameStore();
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'DIARY' | 'POLLING' | 'SOTU' | 'ACTIONS'>('MANAGEMENT');
  const [pendingOrder, setPendingOrder] = useState<ExecutiveOrder | null>(null);
  const [pendingCrisis, setPendingCrisis] = useState<PresidentCrisis | null>(null);
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);

  const approvalColor = pl.approvalRating > 60 ? 'text-emerald-400' : pl.approvalRating > 40 ? 'text-yellow-400' : 'text-red-400';

  const headlines = pl.presidentialDiary.slice(0, 5).map(d => d.event);

  const techHustles = ['techFlip'];
  const housingHustles = ['real_estate_empire'];
  const mediaHustles = ['media_empire'];

  const hasTechMastery = pl.masteredHustles.some(h => techHustles.includes(h));
  const hasHousingMastery = pl.masteredHustles.some(h => housingHustles.includes(h));
  const hasMediaMastery = pl.masteredHustles.some(h => mediaHustles.includes(h));

  const handleInvest = (amount: number) => {
    useGameStore.getState().investPersonalFunds(amount);
  };

  const handleOrderClick = (order: ExecutiveOrder) => {
    setPendingOrder(order);
  };

  const confirmOrder = () => {
    if (pendingOrder) {
      issueExecutiveOrder(pendingOrder.id);
      setPendingOrder(null);
    }
  };

  const confirmCrisis = () => {
    if (pendingCrisis) {
      resolveCrisis(pendingCrisis.id);
      setPendingCrisis(null);
    }
  };

  if (activeMinigame === 'StateOfTheUnion') {
    return <StateOfTheUnion onComplete={(mult) => {
      const gain = Math.floor(mult * 8);
      updatePresidentialStat('approvalRating', gain);
      addTickerMessage(`State of the Union: +${gain}% Approval`, 'text-emerald-400 font-bold');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'DebatePrep') {
    return <DebatePrep onComplete={(mult) => {
      const appGain = Math.floor(mult * 5);
      const conGain = Math.floor(mult * 5);
      updatePresidentialStat('approvalRating', appGain);
      updatePresidentialStat('congressSupport', conGain);
      addTickerMessage(`Debate Prep: +${appGain}% Approval, +${conGain} Congress Support`, 'text-blue-400');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'NegotiateTreaty') {
    return <NegotiateTreaty onComplete={(mult) => {
      const relGain = Math.floor(mult * 10);
      const peaceGain = Math.floor(mult * 5);
      updatePresidentialStat('foreignRelations', relGain);
      updatePresidentialStat('worldPeace', peaceGain);
      addTickerMessage(`Treaty Negotiated: +${relGain} Foreign Relations, +${peaceGain} World Peace`, 'text-purple-400');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'CrisisRiskAssessment') {
    return <CrisisRiskAssessment onComplete={(mult) => {
      const impact = Math.floor(mult * 5);
      updatePresidentialStat('approvalRating', impact);
      addTickerMessage(`Crisis assessed. Impact: ${impact}% Approval`, 'text-orange-400');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'GOTV') {
    return <GOTV onComplete={(mult) => {
      const turnGain = Math.floor(mult * 10);
      const appGain = Math.floor(mult * 3);
      updatePresidentialStat('voterTurnout', turnGain);
      updatePresidentialStat('approvalRating', appGain);
      addTickerMessage(`GOTV Efforts: +${turnGain} Voter Turnout, +${appGain}% Approval`, 'text-emerald-400');
      setActiveMinigame(null);
    }} />;
  }

  if (activeMinigame === 'LegislativeAgenda') {
    return <LegislativeAgenda onComplete={(mult) => {
      const conGain = Math.floor(mult * 10);
      const appGain = Math.floor(mult * 5);
      updatePresidentialStat('congressSupport', conGain);
      updatePresidentialStat('approvalRating', appGain);
      addTickerMessage(`Agenda pushed: +${conGain} Congress Support, +${appGain}% Approval`, 'text-blue-400');
      setActiveMinigame(null);
    }} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden z-0">
        <div className="w-[800px] h-[800px] border-[40px] border-white rounded-full flex items-center justify-center">
          <div className="text-[400px] font-black">E</div>
        </div>
      </div>

      <PresidentialNewsTicker headlines={headlines} />

      {/* Career Trace */}
      {pl.presidentMonth === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/40 border border-blue-400/50 rounded-2xl p-6 shadow-2xl relative z-10"
        >
          <h2 className="text-xl font-serif font-black text-white uppercase tracking-tighter mb-2">The People's Choice</h2>
          <p className="text-blue-200 font-serif italic leading-relaxed">
            "You came from <span className="text-white font-black">{pl.prePresidencyTier || 'MOGUL'}</span>,
            mastered <span className="text-white font-black">{pl.masteredHustles.length}</span> hustles,
            crushed <span className="text-white font-black">{pl.crushedRivals.length}</span> rivals,
            and now you're President."
          </p>
        </motion.div>
      )}

      {/* Header Stats */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-serif font-black tracking-tighter text-white">THE OVAL OFFICE</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">United States of America</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-serif font-black ${approvalColor}`}>{pl.approvalRating}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">National Approval</div>
          </div>
        </div>

        {pl.presidentialMarketControl && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex justify-between items-center animate-pulse">
            <div>
              <div className="text-[8px] text-orange-500 font-black uppercase tracking-widest">Market Intervention Active</div>
              <div className="text-xs font-serif font-black text-white uppercase">{pl.presidentialMarketControl.type.replace('_', ' ')}</div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-slate-500 font-bold uppercase">Stability Duration</div>
              <div className="text-xs font-black text-orange-400">{pl.presidentialMarketControl.monthsRemaining} Months</div>
            </div>
          </div>
        )}

        {/* Macro Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-6 pt-4 border-t border-slate-800">
          <div className="text-center p-2 bg-slate-800/40 rounded-xl">
            <div className="text-[8px] text-slate-500 font-bold uppercase">GDP Growth</div>
            <div className={`text-lg font-serif font-black ${pl.gdp >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pl.gdp >= 100 ? '+' : ''}{(pl.gdp - 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-2 bg-slate-800/40 rounded-xl">
            <div className="text-[8px] text-slate-500 font-bold uppercase">Inflation</div>
            <div className={`text-lg font-serif font-black ${pl.inflation < 3 ? 'text-emerald-400' : pl.inflation < 5 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`}>
              {pl.inflation.toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-2 bg-slate-800/40 rounded-xl">
            <div className="text-[8px] text-slate-500 font-bold uppercase">National Debt</div>
            <div className={`text-lg font-serif font-black ${pl.nationalDebt < 60 ? 'text-emerald-400' : pl.nationalDebt < 80 ? 'text-yellow-400' : 'text-red-500'}`}>
              {pl.nationalDebt.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Economic Warnings */}
        <AnimatePresence>
          {pl.approvalFloor > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] text-emerald-400 font-black uppercase text-center">
              🛡️ POPULAR MANDATE: Approval Floor at {pl.approvalFloor}%
            </motion.div>
          )}
          {pl.scandalRiskBonus > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] text-red-400 font-black uppercase text-center animate-pulse">
              ⚠️ PAST GHOSTS: Scandal Risk +{Math.round(pl.scandalRiskBonus * 100)}%
            </motion.div>
          )}
          {pl.inflation > 5 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] text-red-400 font-black uppercase text-center animate-pulse">
              ⚠️ CRITICAL INFLATION: Approval decaying -2%/mo
            </motion.div>
          )}
          {pl.nationalDebt > 80 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-[9px] text-orange-400 font-black uppercase text-center animate-pulse">
              ⚠️ HIGH DEBT: National instability risk +10%
            </motion.div>
          )}
          {pl.gdp < 80 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[9px] text-blue-300 font-black uppercase text-center animate-pulse">
              ⚠️ STAGNANT ECONOMY: Tax policies 50% less effective
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Term Progress</div>
            <div className="text-sm font-bold text-white font-serif">
              Month {pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth} of 48
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${((pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth) / 48) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Status</div>
            <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">{pl.isSecondTerm ? 'Second Term' : 'First Term'}</div>
          </div>
        </div>

        {/* Federal Budget & Investment */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Federal Treasury</div>
              <div className={`text-xl font-mono font-black ${pl.federalBudget > 0 ? 'text-emerald-400' : 'text-red-500 animate-pulse'}`}>
                ${(pl.federalBudget / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="flex gap-2">
               <button
                onClick={() => handleInvest(5000000)}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-lg text-[8px] font-black uppercase text-emerald-400 transition-all active:scale-95"
               >
                 Invest $5M
               </button>
               <button
                onClick={() => handleInvest(50000000)}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-lg text-[8px] font-black uppercase text-emerald-400 transition-all active:scale-95"
               >
                 Invest $50M
               </button>
            </div>
          </div>
          <div className="text-[8px] text-slate-500 italic">
            Administration costs and crises draw from the Federal Treasury. Invest personal wealth to prevent bankruptcy.
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 relative z-10">
        {['MANAGEMENT', 'ACTIONS', 'POLLING', 'SOTU', 'DIARY'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all border ${
              activeTab === tab
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'MANAGEMENT' && (
          <motion.div
            key="mgmt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 relative z-10"
          >
            {/* Crises Section */}
            {pl.activeCrises.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="animate-pulse">⚠️</span> NATIONAL EMERGENCIES
                </h2>
                {pl.activeCrises.map(crisis => (
                  <motion.div
                    key={crisis.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-red-950/20 border border-red-500/40 rounded-xl p-4 shadow-lg shadow-red-900/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-red-400 uppercase tracking-tight">{crisis.name}</h3>
                      {crisis.monthsRemaining !== undefined && (
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded ${crisis.monthsRemaining <= 1 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-red-400'}`}>
                          {crisis.monthsRemaining} MONTHS REMAINING
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mb-4 font-serif leading-relaxed italic">"{crisis.description}"</p>
                    <div className="flex gap-4 items-center">
                      <button
                        onClick={() => setPendingCrisis(crisis)}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-lg shadow-red-900/20 active:scale-95"
                      >
                        Authorize Federal Response
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Cabinet Section */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">THE CABINET</h2>
              <div className="grid grid-cols-2 gap-3">
                {CABINET_ROLES.map(role => {
                  const appointee = pl.cabinet[role.id];
                  return (
                    <div key={role.id} className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[8px] text-slate-500 font-bold uppercase">{role.role}</div>
                        {appointee && (
                          <button
                            onClick={() => fireCabinetMember(role.id)}
                            className="text-[8px] font-black text-red-500 hover:text-red-400 uppercase"
                          >
                            Fire
                          </button>
                        )}
                      </div>
                      {appointee ? (
                        <div>
                          <div className="text-xs font-bold text-white">{appointee.name}</div>
                          <div className="text-[8px] text-emerald-400 font-bold tracking-widest uppercase mb-2">+{appointee.bonus.value}% {appointee.bonus.type}</div>

                          {/* Loyalty Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[7px] font-black uppercase">
                              <span className="text-slate-500">Loyalty</span>
                              <span className={appointee.loyalty > 60 ? 'text-emerald-400' : appointee.loyalty > 40 ? 'text-yellow-400' : 'text-red-400 animate-pulse'}>
                                {appointee.loyalty}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${appointee.loyalty > 60 ? 'bg-emerald-500' : appointee.loyalty > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${appointee.loyalty}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => appointCabinetMember({
                            id: role.id,
                            name: 'Advisor ' + Math.floor(Math.random() * 100),
                            role: role.role,
                            loyalty: 70,
                            bonus: { type: role.bonusType, value: 10 }
                          })}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                        >
                          + Appoint
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Journey Bonuses Section */}
            {(hasTechMastery || hasHousingMastery || hasMediaMastery) && (
              <div className="space-y-3">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">JOURNEY DISCOUNTS</h2>
                <div className="grid grid-cols-3 gap-2">
                  {hasTechMastery && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-2 text-center">
                      <div className="text-[7px] text-blue-400 font-black uppercase">Tech Policies</div>
                      <div className="text-xs font-black text-white">-10% COST</div>
                    </div>
                  )}
                  {hasHousingMastery && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-2 text-center">
                      <div className="text-[7px] text-emerald-400 font-black uppercase">Housing Policies</div>
                      <div className="text-xs font-black text-white">-10% COST</div>
                    </div>
                  )}
                  {hasMediaMastery && (
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-2 text-center">
                      <div className="text-[7px] text-purple-400 font-black uppercase">Media Policies</div>
                      <div className="text-xs font-black text-white">-10% COST</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Executive Orders */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">EXECUTIVE ORDERS</h2>
              <div className="space-y-3">
                {EXECUTIVE_ORDERS.map(order => (
                  <button
                    key={order.id}
                    onClick={() => handleOrderClick(order)}
                    className="w-full bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all active:scale-[0.99] group shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-md font-serif font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{order.name}</h3>
                      <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+{order.impact.approval}% PROJ. APPR</div>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 font-serif italic leading-snug">"{order.description}"</p>

                    {/* Advisor Quote */}
                    <div className="mb-4 pl-3 border-l-2 border-slate-700">
                      <div className="text-[8px] text-slate-500 font-black uppercase mb-1">
                        {order.id === 'tax_cut' || order.id === 'deregulation' ? 'Treasury Sec' :
                         order.id === 'healthcare' ? 'Press Sec' :
                         order.id === 'infrastructure' ? 'State Sec' : 'Chief Advisor'} Input:
                      </div>
                      <p className="text-[10px] text-slate-500 font-serif italic">
                        "{order.quotes?.[order.id === 'tax_cut' || order.id === 'deregulation' ? 'treasury' :
                                      order.id === 'healthcare' ? 'press' :
                                      order.id === 'infrastructure' ? 'state' : ''] ||
                          order.quotes?.treasury || "We should proceed with caution, Mr. President."}"
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {order.cost.cash && <span className="text-[9px] font-black bg-slate-800 px-2 py-1 rounded text-slate-300">INVEST: ${(order.cost.cash/1000000).toFixed(1)}M</span>}
                      {order.cost.clout && (
                        <span className={`text-[9px] font-black bg-slate-800 px-2 py-1 rounded ${pl.congressSupport < 50 ? 'text-red-400' : 'text-slate-300'}`}>
                          CLOUT: {Math.floor(order.cost.clout * (1 + (100 - pl.congressSupport) / 100))}
                          {pl.congressSupport < 50 && ' ⚠️'}
                        </span>
                      )}
                      {order.cost.aura && <span className="text-[9px] font-black bg-slate-800 px-2 py-1 rounded text-slate-300">AURA: {order.cost.aura}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'POLLING' && (
          <motion.div
            key="polling"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 relative z-10"
          >
            {/* New Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Electoral Votes</div>
                  <div className="text-xl font-serif font-black text-blue-400">{pl.electoralVotes}</div>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Voter Turnout</div>
                  <div className="text-xl font-serif font-black text-emerald-400">{pl.voterTurnout}%</div>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Foreign Relations</div>
                  <div className="text-xl font-serif font-black text-purple-400">{pl.foreignRelations}</div>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">World Peace</div>
                  <div className="text-xl font-serif font-black text-yellow-400">{pl.worldPeace}</div>
               </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">REGIONAL APPROVAL</h2>
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 grid grid-cols-2 gap-6 shadow-xl">
                {Object.entries(pl.regionalApproval || {}).map(([region, score]) => (
                  <div key={region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{region}</span>
                      <span className={`text-xs font-black ${score > 60 ? 'text-emerald-400' : score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        className={`h-full ${score > 60 ? 'bg-emerald-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">DEMOGRAPHIC APPROVAL</h2>
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                {Object.entries(pl.demographicApproval).map(([group, score]) => (
                  <div key={group} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{group}</span>
                      <span className={`text-sm font-black ${score > 60 ? 'text-emerald-400' : score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        className={`h-full ${score > 60 ? 'bg-emerald-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'SOTU' && (
          <motion.div
            key="sotu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">STATE OF THE UNION</h2>
            <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 bg-blue-900/20 border-b border-slate-800">
                <h3 className="text-lg font-serif font-black text-white uppercase tracking-tight">Economic Summary</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Biannual Performance Tracking</p>
              </div>
              <div className="p-0">
                {pl.sotuHistory?.length === 0 ? (
                  <div className="p-12 text-center text-slate-600 font-serif italic">
                    First economic summary scheduled for Month 6.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {[...(pl.sotuHistory || [])].reverse().map((report, idx) => (
                      <div key={idx} className="p-6 hover:bg-slate-800/30 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Month {report.month}</span>
                          <span className={`text-lg font-serif font-black ${report.approval > 50 ? 'text-emerald-400' : 'text-red-400'}`}>{report.approval}% Approval</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase">GDP</div>
                            <div className="text-sm font-mono text-white">{report.gdp.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase">Inflation</div>
                            <div className="text-sm font-mono text-white">{report.inflation.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase">Debt</div>
                            <div className="text-sm font-mono text-white">{report.debt.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ACTIONS' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">PRESIDENTIAL ACTIONS</h2>
            <div className="grid grid-cols-2 gap-3">
               {[
                 { id: 'StateOfTheUnion', label: 'State of the Union', icon: '🏛️' },
                 { id: 'DebatePrep', label: 'Debate Prep', icon: '🎤' },
                 { id: 'NegotiateTreaty', label: 'Negotiate Treaty', icon: '🤝' },
                 { id: 'CrisisRiskAssessment', label: 'Risk Assessment', icon: '🎯' },
                 { id: 'GOTV', label: 'Get Out The Vote', icon: '🗳️' },
                 { id: 'LegislativeAgenda', label: 'Push Agenda', icon: '📜' }
               ].map((action) => (
                 <button
                   key={action.id}
                   onClick={() => setActiveMinigame(action.id)}
                   className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:border-blue-500 transition-all active:scale-95 shadow-xl"
                 >
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <div className="text-[10px] font-black text-white uppercase tracking-tighter">{action.label}</div>
                 </button>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'DIARY' && (
          <motion.div
            key="diary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10"
          >
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">PRESIDENTIAL DIARY</h2>
            <div className="space-y-4">
              {pl.presidentialDiary.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600 font-serif italic">
                  No records yet. History awaits your decisions.
                </div>
              ) : (
                pl.presidentialDiary.map((entry) => (
                  <div key={entry.id} className="relative pl-6 border-l-2 border-slate-800 py-2">
                    <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-4 shadow-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Month {entry.month}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                          entry.type === 'ORDER' ? 'bg-emerald-900/30 text-emerald-400' :
                          entry.type === 'CRISIS' ? 'bg-red-900/30 text-red-400' :
                          'bg-blue-900/30 text-blue-400'
                        }`}>
                          {entry.type}
                        </span>
                      </div>
                      <h4 className="text-xs font-serif font-black text-white uppercase mb-2">{entry.event}</h4>
                      <p className="text-[10px] text-slate-400 font-serif leading-relaxed italic">"{entry.outcome}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Month Button */}
      <button
        onClick={() => advancePresidentialMonth()}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md py-5 bg-blue-700 hover:bg-blue-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-900/40 border border-blue-400/30 transition-all active:scale-95 z-40 group"
      >
        <span className="relative z-10">Conclude Month</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      </button>

      <ConfirmationModal
        isOpen={!!pendingOrder}
        title="Confirm Executive Action"
        message={`Are you sure you want to issue the ${pendingOrder?.name}? This will use your administration's resources and have a permanent impact on your legacy.`}
        onConfirm={confirmOrder}
        onCancel={() => setPendingOrder(null)}
        confirmLabel="Authorize Order"
      />

      <ConfirmationModal
        isOpen={!!pendingCrisis}
        title="Resolve National Crisis"
        message={`Confirm the mobilization of federal resources to address the ${pendingCrisis?.name}. Failure to act could lead to total instability.`}
        onConfirm={confirmCrisis}
        onCancel={() => setPendingCrisis(null)}
        confirmLabel="Mobilize Resources"
        isHighStakes
      />
    </div>
  );
};
