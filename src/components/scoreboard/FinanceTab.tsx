import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';

export const FinanceTab: React.FC = () => {
  const { pl, takeLoan, repayLoan } = useGameStore();

  return (
    <motion.div
      key="finance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Intro / Financial Health */}
      <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
        <span className="font-black text-emerald-400 block mb-1">🏦 Strategic Financing</span>
        Debt is an accelerator when used on high-ROI assets, and a liability when mismanaged. Standard active loans are capped to a maximum of 3 concurrent accounts.
      </div>

      {/* Active Liabilities */}
      <div className="space-y-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Your Active Liabilities</div>

        {(!pl.financialDebts || pl.financialDebts.length === 0) ? (
          <EmptyState
            message="You are completely debt-free. Outstanding liabilities: $0"
            className="bg-slate-950/30 text-slate-500 text-xs rounded-3xl"
          />
        ) : (
          <div className="space-y-2">
            {pl.financialDebts.map((debt) => {
              const remainingCost = debt.monthlyPayment * debt.remainingTerm;
              return (
                <div key={debt.id} className="p-4 bg-slate-950 border border-slate-800/60 hover:border-red-500/20 rounded-2xl flex items-center justify-between transition-all">
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-tight">{debt.loanType} LOAN</div>
                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">
                      Principal: ${debt.principal.toLocaleString()} • Rate: {Math.round(debt.interestRate * 100)}% • {debt.remainingTerm} Months Left
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">MONTHLY</div>
                      <div className="text-[11px] font-mono font-black text-red-400 font-semibold">
                        -${debt.monthlyPayment.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => repayLoan(debt.id)}
                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 hover:text-white text-[8px] font-black uppercase rounded-lg transition-colors"
                      title={`Pay off early for $${remainingCost.toLocaleString()}`}
                    >
                      Pay Early
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Products */}
      <div className="space-y-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Financial Products (Optional)</div>
        <div className="space-y-2">
          {[
            { type: 'STUDENT' as const, name: 'Student Loan', desc: 'Education and early setup', principal: 15000, rate: 0.04, term: 24, minTier: 'MUD' },
            { type: 'EMERGENCY' as const, name: 'Emergency Loan', desc: 'Crucial liquidity squeezes', principal: 10000, rate: 0.15, term: 6, minTier: 'MUD' },
            { type: 'EQUIPMENT' as const, name: 'Equipment Finance', desc: 'Accelerate machinery/infrastructure', principal: 75000, rate: 0.08, term: 18, minTier: 'STREET' },
            { type: 'BUSINESS' as const, name: 'Business Loan', desc: 'Scale operational cash flow', principal: 500000, rate: 0.06, term: 36, minTier: 'STARTUP' },
            { type: 'MORTGAGE' as const, name: 'Property Mortgage', desc: 'Real Estate acquisition leverage', principal: 2500000, rate: 0.05, term: 60, minTier: 'CORPORATE' }
          ].map((prod) => {
            const tierHierarchy = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'PRESIDENT', 'OPEN'];
            const isUnlocked = tierHierarchy.indexOf(pl.currentTier) >= tierHierarchy.indexOf(prod.minTier);
            const activeLoansCount = pl.financialDebts?.length || 0;
            const hasSpace = activeLoansCount < 3;
            const canTake = isUnlocked && hasSpace;

            return (
              <div key={prod.type} className={`p-4 bg-slate-950 border rounded-2xl flex items-center justify-between transition-all ${
                isUnlocked ? 'border-slate-800/60 hover:border-emerald-500/20' : 'border-slate-900/50 opacity-40'
              }`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{prod.name}</span>
                    {!isUnlocked && (
                      <span className="text-[7px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider">
                        Locks at {prod.minTier}
                      </span>
                    )}
                  </div>
                  <div className="text-[8px] text-slate-400 font-medium uppercase tracking-tight mt-0.5">{prod.desc}</div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                    {Math.round(prod.rate * 100)}% Interest • {prod.term} Months Term
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Available</div>
                    <div className="text-xs font-mono font-black text-emerald-400">
                      ${prod.principal.toLocaleString()}
                    </div>
                  </div>
                  <button
                    disabled={!canTake}
                    onClick={() => takeLoan(prod.type)}
                    className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg border transition-all ${
                      canTake
                        ? 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-400 hover:text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    Take Loan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
