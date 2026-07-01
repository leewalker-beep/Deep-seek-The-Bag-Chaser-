import React, { useState, useRef } from 'react';
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

const PAGE_TITLES = [
  'THE OVAL',
  'TREASURY',
  'CABINET',
  'CRISES & ORDERS',
  'ACTIONS',
  'INTELLIGENCE',
  'ADVANCE MONTH'
];

const PRESIDENTIAL_ACTIONS = [
  { id: 'StateOfTheUnion', emoji: '🎙️',
    title: 'State of the Union',
    description: 'Address the nation',
    reward: '+8% Approval' },
  { id: 'DebatePrep', emoji: '🤝',
    title: 'Debate Prep',
    description: 'Sharpen your arguments',
    reward: '+5% Approval, +5 Congress' },
  { id: 'NegotiateTreaty', emoji: '🌐',
    title: 'Negotiate Treaty',
    description: 'Strengthen foreign ties',
    reward: '+10 Relations, +5 Peace' },
  { id: 'CrisisRiskAssessment', emoji: '🛡️',
    title: 'Risk Assessment',
    description: 'Get ahead of threats',
    reward: '+5% Approval' },
  { id: 'GOTV', emoji: '🗳️',
    title: 'GOTV Drive',
    description: 'Mobilise your base',
    reward: '+10 Turnout, +3% Approval' },
  { id: 'LegislativeAgenda', emoji: '📋',
    title: 'Legislative Push',
    description: 'Move your agenda',
    reward: '+10 Congress, +5% Approval' },
];

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

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const totalPages = 7;
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goTo = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setDirection(newPage > page ? 1 : -1);
    setPage(newPage);
  };

  const [pendingOrder, setPendingOrder] = useState<ExecutiveOrder | null>(null);
  const [pendingCrisis, setPendingCrisis] = useState<PresidentCrisis | null>(null);
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);

  const approvalColor = pl.approvalRating > 60 ? 'text-emerald-400' : pl.approvalRating > 40 ? 'text-yellow-400' : 'text-red-400';

  const headlines = pl.presidentialDiary.slice(0, 5).map(d => d.event);

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

  const renderPage = (index: number) => {
    switch (index) {
      case 0: // THE OVAL
        return (
          <div className="space-y-6">
            <PresidentialNewsTicker headlines={headlines} />

            {pl.presidentMonth === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-900/40 border border-blue-400/50 rounded-2xl p-6 shadow-2xl"
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

            <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative z-10">
              <div className="text-center mb-6">
                <div className={`text-6xl font-serif font-black ${approvalColor}`}>{pl.approvalRating}%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">National Approval Rating</div>
              </div>

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

              <AnimatePresence>
                {pl.approvalFloor > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] text-emerald-400 font-black uppercase text-center">
                    🛡️ POPULAR MANDATE: Approval Floor at {pl.approvalFloor}%
                  </motion.div>
                )}
                {pl.scandalRiskBonus > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] text-red-400 font-black uppercase text-center animate-pulse">
                    ⚠️ PAST GHOSTS: Scandal Risk +{Math.round(pl.scandalRiskBonus * 100)}%
                  </motion.div>
                )}
                {pl.inflation > 5 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] text-red-400 font-black uppercase text-center animate-pulse">
                    ⚠️ CRITICAL INFLATION: Approval decaying -2%/mo
                  </motion.div>
                )}
                {pl.nationalDebt > 80 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-[9px] text-orange-400 font-black uppercase text-center animate-pulse">
                    ⚠️ HIGH DEBT: National instability risk +10%
                  </motion.div>
                )}
                {pl.gdp < 80 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[9px] text-blue-300 font-black uppercase text-center animate-pulse">
                    ⚠️ STAGNANT ECONOMY: Tax policies 50% less effective
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Term Progress</div>
                  <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{pl.isSecondTerm ? 'Second Term' : 'First Term'}</div>
                </div>
                <div className="text-sm font-bold text-white font-serif mb-2">
                  Month {pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth} of 48
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${Math.min(100, ((pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth) / 48) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // TREASURY
        return (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative z-10">
              <div className={`text-5xl font-black font-mono mb-2 ${pl.federalBudget > 0 ? 'text-emerald-400' : 'text-red-500 animate-pulse'}`}>
                ${(pl.federalBudget / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-8">Federal Treasury</div>

              {pl.presidentialMarketControl && (
                <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-[8px] text-orange-500 font-black uppercase tracking-widest">Market Intervention Active</div>
                    <div className="text-sm font-serif font-black text-white uppercase">{pl.presidentialMarketControl.type.replace('_', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-slate-500 font-bold uppercase">Stability</div>
                    <div className="text-sm font-black text-orange-400">{pl.presidentialMarketControl.monthsRemaining} Months</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => handleInvest(5000000)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                  INVEST $5M FROM PERSONAL BAG
                </button>
                <button
                  onClick={() => handleInvest(50000000)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                  INVEST $50M FROM PERSONAL BAG
                </button>
              </div>

              <p className="mt-6 text-[10px] text-slate-500 italic leading-relaxed">
                Administration costs and national crises draw directly from the Federal Treasury.
                If the treasury hits zero, national stability will collapse. Use your personal
                wealth to keep the country afloat.
              </p>
            </div>
          </div>
        );
      case 2: // CABINET
        const appointedCount = Object.values(pl.cabinet).filter(Boolean).length;
        return (
          <div className="space-y-4">
             <div className="text-xs text-slate-500 font-black uppercase mb-3 tracking-widest">
              THE CABINET — {appointedCount}/{CABINET_ROLES.length} FILLED
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CABINET_ROLES.map(role => {
                const appointee = pl.cabinet[role.id];
                return (
                  <div key={role.id} className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start mb-2">
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
                        <div className="text-sm font-bold text-white mb-1">{appointee.name}</div>
                        <div className="text-[8px] text-emerald-400 font-bold tracking-widest uppercase mb-3">+{appointee.bonus.value}% {appointee.bonus.type}</div>

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
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest py-2"
                      >
                        + Appoint
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 3: // CRISES & ORDERS
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ACTIVE CRISES</h2>
              {pl.activeCrises.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-8 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-emerald-400 font-black uppercase tracking-widest text-xs">No Active Crises</div>
                </div>
              ) : (
                pl.activeCrises.map(crisis => (
                  <motion.div
                    key={crisis.id}
                    className="bg-red-950/20 border border-red-500/40 rounded-2xl p-5 shadow-lg shadow-red-900/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-red-400 uppercase">{crisis.name}</h3>
                      {crisis.monthsRemaining !== undefined && (
                        <div className={`text-[10px] font-black px-2 py-0.5 rounded ${crisis.monthsRemaining <= 1 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-red-400'}`}>
                          {crisis.monthsRemaining} MO
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mb-4 font-serif italic">"{crisis.description}"</p>
                    <button
                      onClick={() => setPendingCrisis(crisis)}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
                    >
                      Authorize Federal Response
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 my-8 relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-950 px-3 text-[9px] text-slate-600 font-black uppercase tracking-widest">
                EXECUTIVE ORDERS
              </span>
            </div>

            <div className="space-y-3">
              {EXECUTIVE_ORDERS.map(order => (
                <button
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-black text-white group-hover:text-blue-400 uppercase tracking-tight">{order.name}</h3>
                    <div className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">+{order.impact.approval}% APPR</div>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-4 font-serif italic leading-snug">"{order.description}"</p>

                  <div className="flex gap-2">
                    {order.cost.cash && <span className="text-[8px] font-black bg-slate-800 px-2 py-1 rounded text-slate-400">${(order.cost.cash/1_000_000).toFixed(1)}M</span>}
                    {order.cost.clout && (
                      <span className={`text-[8px] font-black bg-slate-800 px-2 py-1 rounded ${pl.congressSupport < 50 ? 'text-red-400' : 'text-slate-400'}`}>
                        CLOUT: {Math.floor(order.cost.clout * (1 + (100 - pl.congressSupport) / 100))}
                        {pl.congressSupport < 50 && ' ⚠️'}
                      </span>
                    )}
                    {order.cost.aura && <span className="text-[8px] font-black bg-slate-800 px-2 py-1 rounded text-slate-400">AURA: {order.cost.aura}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 4: // ACTIONS
        return (
          <div className="grid grid-cols-2 gap-3">
            {PRESIDENTIAL_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => setActiveMinigame(action.id)}
                className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-left active:scale-95 transition-all hover:border-blue-500/40"
              >
                <div className="text-2xl mb-2">{action.emoji}</div>
                <div className="text-xs font-black text-white uppercase tracking-tight">{action.title}</div>
                <div className="text-[9px] text-slate-500 mt-1">{action.description}</div>
                <div className="text-[9px] text-blue-400 font-black uppercase mt-2">
                  {action.reward}
                </div>
              </button>
            ))}
          </div>
        );
      case 5: // INTELLIGENCE
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Public Approval', value: pl.approvalRating, color: 'bg-blue-500' },
                { label: 'Congress Support', value: pl.congressSupport, color: 'bg-emerald-500' },
                { label: 'Foreign Relations', value: pl.foreignRelations, color: 'bg-purple-500' },
                { label: 'Voter Turnout', value: pl.voterTurnout, color: 'bg-orange-500' },
                { label: 'World Peace', value: pl.worldPeace, color: 'bg-yellow-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-sm font-black text-white">{stat.value}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      className={`h-full ${stat.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PRESIDENTIAL DIARY</h2>
              {pl.presidentialDiary.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600 font-serif italic">
                  No records yet. History awaits your decisions.
                </div>
              ) : (
                pl.presidentialDiary.slice(-5).reverse().map(entry => (
                  <div key={entry.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                    <div className="flex justify-between text-[8px] font-black mb-1">
                      <span className="text-blue-400">MONTH {entry.month}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        entry.type === 'ORDER' ? 'bg-emerald-900/30 text-emerald-400' :
                        entry.type === 'CRISIS' ? 'bg-red-900/30 text-red-400' :
                        'bg-blue-900/30 text-blue-400'
                      }`}>
                        {entry.type}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-white uppercase">{entry.event}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 6: // ADVANCE MONTH
        const unresolvedCrises = pl.activeCrises.length;
        const budgetHealthy = pl.federalBudget > 20_000_000;
        const displayMonth = pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth;

        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center">
              <div className="text-5xl font-black text-white text-center">
                MONTH {displayMonth} OF 48
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
               <div
                className="bg-blue-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${Math.min(100, (displayMonth / 48) * 100)}%` }}
              />
            </div>

            <div className="w-full space-y-2 py-4">
              <div className={`flex justify-between items-center text-sm ${pl.approvalRating >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>• Approval: {pl.approvalRating}%</span>
                <span className="text-[10px] uppercase font-black">{pl.approvalRating >= 50 ? 'ABOVE 50% THRESHOLD' : 'BELOW 50% THRESHOLD'}</span>
              </div>
              <div className={`flex justify-between items-center text-sm ${budgetHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>• Treasury: ${(pl.federalBudget/1_000_000).toFixed(1)}M</span>
                <span className="text-[10px] uppercase font-black">{budgetHealthy ? 'HEALTHY' : 'AT RISK'}</span>
              </div>
              <div className={`flex justify-between items-center text-sm ${unresolvedCrises === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>• Active Crises: {unresolvedCrises}</span>
                <span className="text-[10px] uppercase font-black">{unresolvedCrises === 0 ? 'NONE' : `${unresolvedCrises} UNRESOLVED`}</span>
              </div>
            </div>

            <div className="w-full pt-4">
              <button
                onClick={advancePresidentialMonth}
                className="w-full py-6 bg-blue-600
                hover:bg-blue-500 active:scale-95
                rounded-2xl font-black text-xl text-white
                uppercase tracking-widest transition-all
                shadow-2xl shadow-blue-900/40
                border border-blue-400/30"
              >
                ADVANCE MONTH →
              </button>
              <div className="text-[10px] text-slate-600 text-center mt-3">
                Swipe left to review before advancing
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-slate-950 text-white p-6 pb-32 overflow-hidden"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goTo(page + 1);
          else goTo(page - 1);
        }
      }}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Background Decorative Element */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden z-0">
        <div className="w-[800px] h-[800px] border-[40px] border-white rounded-full flex items-center justify-center">
          <div className="text-[400px] font-black">E</div>
        </div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Page indicator */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {PAGE_TITLES[page]}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all ${
                  i === page
                    ? 'w-4 h-2 bg-blue-400'
                    : 'w-2 h-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] text-slate-600 font-bold">
            {page + 1}/{totalPages}
          </div>
        </div>

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage(page)}
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next Buttons */}
        <div className="flex justify-between mt-6 relative z-10">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 font-black text-sm disabled:opacity-20 active:scale-95 transition-all"
          >
            ← PREV
          </button>
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages - 1}
            className="px-6 py-3 rounded-xl border border-blue-600/40 text-blue-400 font-black text-sm disabled:opacity-20 active:scale-95 transition-all"
          >
            NEXT →
          </button>
        </div>
      </div>

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
