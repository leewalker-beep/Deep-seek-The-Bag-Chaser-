import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CABINET_ROLES, EXECUTIVE_ORDERS } from '../engine/presidentEngine';
import { motion } from 'framer-motion';

export const PresidentDashboard: React.FC = () => {
  const { pl, issueExecutiveOrder, appointCabinetMember, resolveCrisis, advancePresidentialMonth } = useGameStore();

  const approvalColor = pl.approvalRating > 60 ? 'text-emerald-400' : pl.approvalRating > 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">THE OVAL OFFICE</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">United States of America</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${approvalColor}`}>{pl.approvalRating}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Approval Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Term Progress</div>
            <div className="text-sm font-bold text-white">
              {pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth} / 48 Months
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-1000"
                style={{ width: `${((pl.isSecondTerm ? pl.presidentMonth - 48 : pl.presidentMonth) / 48) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Status</div>
            <div className="text-sm font-bold text-blue-400">{pl.isSecondTerm ? 'Second Term' : 'First Term'}</div>
          </div>
        </div>
      </div>

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
              className="bg-red-950/20 border border-red-500/40 rounded-xl p-4"
            >
              <h3 className="text-sm font-bold text-red-400">{crisis.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{crisis.description}</p>
              <button
                onClick={() => resolveCrisis(crisis.id)}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-lg transition-all"
              >
                Resolve Crisis
              </button>
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
              <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">{role.role}</div>
                {appointee ? (
                  <div>
                    <div className="text-xs font-bold text-white">{appointee.name}</div>
                    <div className="text-[8px] text-emerald-400 font-bold">+{appointee.bonus.value}% {appointee.bonus.type}</div>
                  </div>
                ) : (
                  <button
                    onClick={() => appointCabinetMember({
                      id: role.id,
                      name: 'Advisor ' + Math.floor(Math.random() * 100),
                      role: role.role,
                      bonus: { type: role.bonusType, value: 10 }
                    })}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + Appoint
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Orders */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">EXECUTIVE ORDERS</h2>
        <div className="space-y-2">
          {EXECUTIVE_ORDERS.map(order => (
            <button
              key={order.id}
              onClick={() => issueExecutiveOrder(order.id)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-4 text-left transition-all active:scale-[0.98] group"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{order.name}</h3>
                <div className="text-[10px] font-bold text-emerald-400">+{order.impact.approval}% Appr</div>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">{order.description}</p>
              <div className="flex gap-2">
                {order.cost.cash && <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">-${(order.cost.cash/1000000).toFixed(1)}M</span>}
                {order.cost.clout && <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">-{order.cost.clout} Clout</span>}
                {order.cost.aura && <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">-{order.cost.aura} Aura</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next Month Button */}
      <button
        onClick={() => advancePresidentialMonth()}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 z-40"
      >
        Advance Month
      </button>
    </div>
  );
};
