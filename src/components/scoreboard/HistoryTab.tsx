import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';

export const HistoryTab: React.FC = () => {
  const { pl } = useGameStore();

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {!pl.actionLog || pl.actionLog.length === 0 ? (
        <EmptyState message="No transactions recorded yet." className="text-slate-700 text-xs bg-slate-950/30" />
      ) : (
        <ScrollableList maxHeight="max-h-[320px]">
          <div className="space-y-2 pb-8 flex flex-col">
             {pl.actionLog.slice(0, 20).map((log) => (
               <div key={log.id} className="p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl flex justify-between items-center shrink-0">
                 <div>
                   <div className="text-[10px] font-bold text-white uppercase">{log.hustleName}</div>
                   <div className="text-[8px] text-slate-500">{log.branchName || 'Standard'}</div>
                 </div>
                 <div className={`text-xs font-mono font-bold ${log.netCash >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                   {log.netCash >= 0 ? '+' : ''}${log.netCash.toLocaleString()}
                 </div>
               </div>
             ))}
          </div>
        </ScrollableList>
      )}
    </motion.div>
  );
};
