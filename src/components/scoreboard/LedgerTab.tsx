import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';

export const LedgerTab: React.FC = () => {
  const { pl } = useGameStore();

  const events = pl.events || [];
  const totalProfitVal = events
    .filter(e => e.type === 'HUSTLE_COMPLETED')
    .reduce((sum, e) => {
      const m = e.metadata as any;
      return sum + (m.profit || 0);
    }, 0);

  const houseFlipsVal = events.filter(e => {
    if (e.type !== 'PROPERTY_PURCHASED') return false;
    const m = e.metadata as any;
    return m.branchId === 'l2a';
  }).length;

  const vendingCountVal = events.filter(e => {
    if (e.type !== 'BUSINESS_PURCHASED') return false;
    const m = e.metadata as any;
    return m.assetId === 'vending';
  }).length;

  return (
    <motion.div
      key="ledger"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight">
          <span className="font-black text-emerald-400 block mb-1">💸 The Financial Ledger</span>
          A transaction history of all cash flows, active hustle profits, passive earnings, and capital investments recorded throughout this life.
        </div>

        {/* Stats Grid */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[8px] text-slate-500 font-black uppercase">TOTAL PROFIT</div>
              <div className="text-sm font-black text-emerald-400 font-mono">${totalProfitVal.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[8px] text-slate-500 font-black uppercase">HOUSES FLIPPED</div>
              <div className="text-sm font-black text-white font-mono">{houseFlipsVal}</div>
            </div>
            <div>
              <div className="text-[8px] text-slate-500 font-black uppercase">VENDING UNITS</div>
              <div className="text-sm font-black text-white font-mono">{vendingCountVal}</div>
            </div>
          </div>
        </div>

        {/* Financial Records List */}
        <div className="space-y-2">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Imperial Audit Trail</div>
          {events.length === 0 ? (
            <EmptyState
              message="No transactions recorded yet."
              className="bg-slate-950/30 text-slate-700 text-xs rounded-3xl"
            />
          ) : (
            <ScrollableList maxHeight="max-h-[300px]" fadeColor="from-slate-900">
              <div className="space-y-2 pb-8 flex flex-col">
                {events.slice(0, 30).map((e) => {
                  const m = e.metadata as any;
                  let title = e.type.replace(/_/g, ' ');
                  let subtitle = '';
                  let valStr = '';
                  let isPositive = true;

                  if (e.type === 'HUSTLE_COMPLETED') {
                    title = m.hustleName || title;
                    subtitle = m.success ? 'Hustle Success' : 'Hustle Fail';
                    valStr = `${m.profit >= 0 ? '+' : ''}$${m.profit.toLocaleString()}`;
                    isPositive = m.profit >= 0;
                  } else if (e.type === 'BUSINESS_PURCHASED') {
                    title = `Acquired ${m.assetId?.replace('_', ' ')}`;
                    subtitle = 'Business Asset';
                    valStr = `-$${m.cost?.toLocaleString()}`;
                    isPositive = false;
                  } else if (e.type === 'PROPERTY_PURCHASED') {
                    title = `Acquired ${m.branchName || m.type || 'Property'}`;
                    subtitle = 'Real Estate';
                    valStr = `-$${m.cost?.toLocaleString()}`;
                    isPositive = false;
                  } else if (e.type === 'LAW_PASSED') {
                    title = `Order: ${m.name}`;
                    subtitle = 'Executive Decree';
                    valStr = `-$${m.cost?.toLocaleString()}`;
                    isPositive = false;
                  } else if (e.type === 'CRISIS_RESOLVED') {
                    title = `Resolved: ${m.name}`;
                    subtitle = 'National Security';
                    valStr = `-$${m.cost?.toLocaleString()}`;
                    isPositive = false;
                  } else if (m && typeof m.profit === 'number') {
                    valStr = `${m.profit >= 0 ? '+' : ''}$${m.profit.toLocaleString()}`;
                    isPositive = m.profit >= 0;
                  } else if (m && typeof m.cost === 'number') {
                    valStr = `-$${m.cost.toLocaleString()}`;
                    isPositive = false;
                  } else {
                    return null; // Skip non-financial events
                  }

                  return (
                    <div key={e.id} className="p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl flex justify-between items-center shrink-0">
                      <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-tight">{title}</div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{subtitle}</div>
                      </div>
                      <div className={`text-xs font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {valStr}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollableList>
          )}
        </div>
      </div>
    </motion.div>
  );
};
