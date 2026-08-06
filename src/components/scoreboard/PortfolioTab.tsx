import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';

export const PortfolioTab: React.FC = () => {
  const { pl } = useGameStore();

  return (
    <motion.div
      key="portfolio"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Total Earning Power HUD */}
      <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-3 opacity-10">
              <div className="text-6xl uppercase font-black italic tracking-tighter text-white rotate-12">EMPIRE</div>
          </div>
          <div className="relative z-10">
              <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Total Earning Power</div>
              <div className="text-4xl font-black text-white font-mono tracking-tighter">
                  ${(pl.lastPassiveBreakdown?.finalTotal || 0).toLocaleString()}
                  <span className="text-lg text-slate-500 font-normal"> / mo</span>
              </div>
              <div className="mt-4 flex gap-4">
                  <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Base Value</span>
                      <span className="text-xs font-mono text-slate-300">${(pl.lastPassiveBreakdown?.baseTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Active Multipliers</span>
                      <span className="text-xs font-mono text-emerald-400">
                          x{((pl.lastPassiveBreakdown?.finalTotal || 1) / (pl.lastPassiveBreakdown?.baseTotal || 1)).toFixed(2)}
                      </span>
                  </div>
              </div>
          </div>
      </div>

      {/* Asset Attribution */}
      <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Streams</h3>
              <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Source Contribution</span>
          </div>

          {!pl.lastPassiveBreakdown || pl.lastPassiveBreakdown.sources.length === 0 ? (
              <EmptyState
                message="No passive assets acquired yet. Build your first revenue stream."
                className="bg-slate-950/30 text-slate-700 text-xs rounded-3xl"
              />
          ) : (
              <ScrollableList maxHeight="max-h-[260px]" fadeColor="from-slate-900">
                  <div className="space-y-2 pb-8">
                      {pl.lastPassiveBreakdown.sources
                          .sort((a, b) => b.amount - a.amount)
                          .map((src, idx) => (
                              <div key={src.id} className="group p-4 bg-slate-950 border border-slate-800/50 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                                          idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500 border border-slate-800'
                                      }`}>
                                          {idx + 1}
                                      </div>
                                      <div>
                                          <div className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                              {src.name}
                                          </div>
                                          <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                                              {src.category} {src.count ? `• ${src.count} Units` : ''}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-xs font-mono font-black text-emerald-400">
                                          +${src.amount.toLocaleString()}
                                      </div>
                                      <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">
                                          {((src.amount / pl.lastPassiveBreakdown!.baseTotal) * 100).toFixed(0)}% SHARE
                                      </div>
                                  </div>
                              </div>
                          ))
                      }
                  </div>
              </ScrollableList>
          )}
      </div>

      {/* Specialization Impact Card */}
      {pl.activeSpecializationId && (
          <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.1em]">Specialization Synergy</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Your <span className="text-white font-black">{pl.activeSpecializationId.toUpperCase()}</span> perk is amplifying all passive yields by <span className="text-emerald-400 font-black">
                      +{Math.round(((pl.lastPassiveBreakdown?.multipliers.specialization || 1) - 1) * 100)}%
                  </span>.
              </div>
          </div>
      )}
    </motion.div>
  );
};
