import React, { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CABINET_ROLES, EXECUTIVE_ORDERS, generateCandidatePool } from '../engine/presidentEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { PresidentialNewsTicker } from './PresidentialNewsTicker';
import { ConfirmationModal } from './ui/ConfirmationModal';
import type { CabinetMember, ExecutiveOrder, PresidentCrisis, PresidentialActivity } from '../types/game';
import { CabinetAppointmentModal } from './presidency/CabinetAppointmentModal';
import { PRESIDENTIAL_ACTIVITIES } from '../config/presidencyActivities';
import { StrategicMeetingModal } from './presidency/StrategicMeetingModal';
import { WorldReactionFeed } from './WorldReactionFeed';

const PAGE_TITLES = [
  'THE OVAL',
  'TREASURY',
  'CABINET',
  'CRISES & ORDERS',
  'ACTIONS',
  'INTELLIGENCE',
  'ADVANCE MONTH'
];

export const PresidentDashboard: React.FC = () => {
  const {
    pl,
    issueExecutiveOrder,
    appointCabinetMember,
    fireCabinetMember,
    resolveCrisis,
    advancePresidentialMonth
  } = useGameStore();

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const totalPages = 7;
  const [showPhoneFeed, setShowPhoneFeed] = useState(false);
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
  const [activeActivity, setActiveActivity] = useState<PresidentialActivity | null>(null);
  const [pendingAppointment, setPendingAppointment] = useState<{ roleId: string; candidates: CabinetMember[] } | null>(null);

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

  const renderPage = (index: number) => {
    switch (index) {
      case 0: // THE OVAL
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-950/80 border border-blue-500/30 rounded-2xl text-[10px] text-slate-300 leading-relaxed uppercase tracking-tight">
              <span className="font-black text-white block mb-1">🏛️ President's Strategic Overview</span>
              Welcome to the Situation Room. You have transitioned from a corporate titan to the leader of the free world.
              Your mandate is to balance GDP growth, control inflation, manage the national debt, and sustain public approval above the critical <span className="text-red-400 font-bold">50% threshold</span>.
            </div>

            <PresidentialNewsTicker headlines={headlines} />

            {pl.presidentMonth === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-900/20 border-2 border-blue-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <div className="text-8xl font-black italic select-none">USA</div>
                </div>
                <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-2">INAUGURATION DAY</div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">The People's Choice</h2>
                <p className="text-blue-200 font-serif italic text-sm leading-relaxed relative z-10">
                  "You came from <span className="text-white font-black underline decoration-blue-500/50">{pl.prePresidencyTier || 'MOGUL'}</span>,
                  mastered <span className="text-white font-black">{pl.masteredHustles.length}</span> hustles,
                  and now the nation answers to you."
                </p>
              </motion.div>
            )}

            <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 rounded-[2rem] p-8 shadow-2xl relative z-10">
              <div className="text-center mb-8">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-2 leading-none">NATIONAL MANDATE</div>
                <div className={`text-7xl font-black italic tracking-tighter ${approvalColor}`}>{pl.approvalRating}%</div>
                <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-3">Approval Rating</div>
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
                    style={{ width: `${((pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth) / 48) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // TREASURY
        return (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
              <span className="font-black text-white block mb-1">💰 Federal Treasury</span>
              <span className="font-bold text-white">What is this?</span> Your administration's operating budget.
              <br />
              <span className="font-bold text-white">Why are you here?</span> Administration costs, strategic choices, and emergency crisis responses draw cash directly from the Treasury. If this reaches zero, national stability collapses.
              <br />
              <span className="font-bold text-white">What should I do next?</span> If the Treasury is critical or depleted, liquidate your personal business empire wealth below to inject emergency capital into the Treasury!
            </div>

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
            <div className="p-4 bg-slate-950 border border-blue-500/30 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
              <span className="font-black text-white block mb-1">🤝 Presidential Cabinet</span>
              <span className="font-bold text-white">What is this?</span> Your network of elite national advisers and policy directors.
              <br />
              <span className="font-bold text-white">Why are you here?</span> Cabinet appointees provide monthly economic buffs (boosting GDP or lowering inflation/debt) and specific choice-based multipliers for Strategic Meetings. If their loyalty falls too low (<span className="text-red-400">below 30%</span>), they may trigger critical cabinet leak crises.
              <br />
              <span className="font-bold text-white">What should I do next?</span> Appoint competent leaders into vacant roles below. Keep their loyalty elevated through actions, or fire low-loyalty leaders before they sabotage you.
            </div>

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
                        <div className="text-[8px] text-emerald-400 font-bold tracking-widest uppercase mb-1">
                          +{appointee.isTrustedAlly ? appointee.bonus.value * 2 : appointee.bonus.value}% {appointee.bonus.type}
                          {appointee.isTrustedAlly && ' 🤝'}
                        </div>
                        <div className="text-[7px] text-slate-500 uppercase font-black mb-2">
                          {appointee.previousCareer}
                          {appointee.politicalAlignment && ` • ${appointee.politicalAlignment}`}
                        </div>

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
                        onClick={() => setPendingAppointment({
                          roleId: role.id,
                          candidates: generateCandidatePool(role.id, pl)
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
            <div className="p-4 bg-slate-950 border border-red-500/30 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
              <span className="font-black text-white block mb-1">📢 Crises & Executive Orders</span>
              <span className="font-bold text-white">What is this?</span> Emergency situations requiring intervention, alongside executive powers you can command.
              <br />
              <span className="font-bold text-white">Why are you here?</span> Active crises decay your national metrics and approval rating every month they remain unresolved. Executive Orders allow you to directly boost approval at a cash or clout cost.
              <br />
              <span className="font-bold text-white">What should I do next?</span> Instantly authorize federal responses to resolve active crises, or issue Executive Orders to stabilize national sentiment!
            </div>

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
          <div className="space-y-4">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">Presidential Agenda</div>
            <div className="grid grid-cols-1 gap-3">
              {PRESIDENTIAL_ACTIVITIES.map(action => (
                <button
                  key={action.id}
                  onClick={() => setActiveActivity(action)}
                  className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 text-left active:scale-95 transition-all hover:border-blue-500/40 flex items-center gap-4 group"
                >
                  <div className="text-3xl bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-blue-900/30 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">{action.category}</div>
                    </div>
                    <div className="text-sm font-black text-white uppercase tracking-tight">{action.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-serif italic line-clamp-1">"{action.description}"</div>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </button>
              ))}
            </div>
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="p-4 bg-slate-950 border border-blue-500/30 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight w-full">
              <span className="font-black text-white block mb-1">📅 Advance Month Checklist</span>
              <span className="font-bold text-white">What happens next?</span> Advancing the month updates economic cycles (GDP, inflation, national debt), processes Cabinet loyalty gains/losses, triggers automatic news ticker diary logs, and potentially spawns reactive crises or narrative events.
              <br />
              <span className="font-bold text-white">Why?</span> To simulate a dynamic presidency. Each step checks your active leadership against national parameters.
              <br />
              <span className="font-bold text-white">What should I do next?</span> Verify that approval ratings are strong, crises are fully resolved, and the Treasury has healthy liquidity before advancing!
            </div>

            <div className="text-center">
              <div className="text-5xl font-black text-white text-center">
                MONTH {displayMonth} OF 48
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
               <div
                className="bg-blue-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${(displayMonth / 48) * 100}%` }}
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
        <div className="w-[85vw] h-[85vw] max-w-[800px] max-h-[800px] border-[5vw] md:border-[40px] border-white rounded-full flex items-center justify-center">
          <div className="text-[40vw] md:text-[400px] font-black leading-none">E</div>
        </div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Page indicator */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h1 className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">
            {page === 0 ? 'THE OVAL OFFICE' : PAGE_TITLES[page]}
          </h1>
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
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowPhoneFeed(true)}
              className="text-[9px] bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-indigo-500/20 flex items-center gap-1 shadow-md shadow-indigo-950/40"
            >
              📱 FEED
            </button>
            <div className="text-[10px] text-slate-600 font-bold">
              {page + 1}/{totalPages}
            </div>
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

      {activeActivity && (
        <StrategicMeetingModal
          activity={activeActivity}
          onClose={() => setActiveActivity(null)}
        />
      )}

      <ConfirmationModal
        isOpen={!!pendingOrder}
        title="Confirm Executive Action"
        message={`Are you sure you want to issue the ${pendingOrder?.name}? This will use your administration's resources and have a permanent impact on your legacy.`}
        onConfirm={confirmOrder}
        onCancel={() => setPendingOrder(null)}
        confirmLabel="Authorize Order"
      />

      <CabinetAppointmentModal
        isOpen={!!pendingAppointment}
        onClose={() => setPendingAppointment(null)}
        roleName={CABINET_ROLES.find(r => r.id === pendingAppointment?.roleId)?.role || ''}
        candidates={pendingAppointment?.candidates || []}
        onSelect={(member) => {
          appointCabinetMember({ ...member, id: pendingAppointment!.roleId });
          setPendingAppointment(null);
        }}
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

      {showPhoneFeed && (
        <WorldReactionFeed onClose={() => setShowPhoneFeed(false)} />
      )}
    </div>
  );
};
