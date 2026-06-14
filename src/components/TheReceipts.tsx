import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { GameEvent } from '../types/game';

export const TheReceipts: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const pl = useGameStore(state => state.pl);
  const [filterType, setFilterType] = useState<string>('ALL');

  const events = pl.events || [];

  const filteredEvents = filterType === 'ALL'
    ? events
    : events.filter(e => e.type === filterType || (filterType === 'HUSTLES' && e.type === 'HUSTLE_COMPLETED'));

  // Calculate stats from events
  const totalProfit = events
    .filter(e => e.type === 'HUSTLE_COMPLETED')
    .reduce((sum, e) => sum + (e.metadata.profit || 0), 0);

  const houseFlips = events.filter(e => e.type === 'PROPERTY_PURCHASED' && e.metadata.branchId === 'l2a').length;
  const vendingCount = events.filter(e => e.type === 'BUSINESS_PURCHASED' && e.metadata.assetId === 'vending').length;

  const renderEvent = (event: GameEvent) => {
    const { playerStats, metadata, timestamp } = event;
    const dateStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (event.type) {
      case 'HUSTLE_COMPLETED':
        return (
          <div key={event.id} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>{dateStr} • {playerStats.tier} tier</span>
              <span className={metadata.success ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                {metadata.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <div className="font-bold text-white">
              {metadata.hustleName}
            </div>
            <div className={`text-[10px] mt-1 font-mono ${metadata.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metadata.profit >= 0 ? '+' : ''}${metadata.profit.toLocaleString()}
            </div>
          </div>
        );
      case 'PROMOTION_EARNED':
        return (
          <div key={event.id} className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
            <div className="text-[10px] text-purple-400 font-black mb-1 uppercase tracking-widest">RANK UP</div>
            <div className="font-black text-white text-lg italic">
              {metadata.from} → {metadata.to}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">Institutional Fee: ${metadata.fee.toLocaleString()}</div>
          </div>
        );
      case 'BUSINESS_PURCHASED':
        return (
          <div key={event.id} className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
            <div className="text-[10px] text-blue-400 font-black mb-1 uppercase tracking-widest">ASSET ACQUIRED</div>
            <div className="font-bold text-white capitalize">{metadata.assetId.replace('_', ' ')}</div>
            <div className="text-[9px] text-red-400">-${metadata.cost.toLocaleString()}</div>
          </div>
        );
      case 'PROPERTY_PURCHASED':
        return (
          <div key={event.id} className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-[10px] text-emerald-400 font-black mb-1 uppercase tracking-widest">REAL ESTATE</div>
            <div className="font-bold text-white">{metadata.branchName || metadata.type || 'Property'}</div>
            <div className="text-[9px] text-red-400">-${metadata.cost.toLocaleString()}</div>
          </div>
        );
      case 'SPECIAL_EVENT':
        return (
          <div key={event.id} className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
            <div className="text-[10px] text-yellow-400 font-black mb-1 uppercase tracking-widest">MILESTONE</div>
            <div className="font-bold text-white">{metadata.achievementName || metadata.hustleName || 'Achieved'}</div>
            <div className="text-[9px] text-slate-400 mt-1 capitalize">{metadata.type.toLowerCase().replace('_', ' ')}</div>
          </div>
        );
      case 'RIVAL_DEFEATED':
        return (
          <div key={event.id} className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
            <div className="text-[10px] text-red-400 font-black mb-1 uppercase tracking-widest">RIVAL SMOKED</div>
            <div className="font-bold text-white">{metadata.rivalName} defeated</div>
            <div className="text-[9px] text-slate-400">Their bid: ${metadata.bid.toLocaleString()}</div>
          </div>
        );
      case 'ECONOMIC_EVENT':
        return (
          <div key={event.id} className="bg-slate-800 rounded-lg p-2 border border-slate-700 text-center">
            <div className="text-[9px] text-slate-500 uppercase font-black">MARKET SHIFT</div>
            <div className="text-xs font-bold text-white">→ {metadata.to}</div>
          </div>
        );
      default:
        return (
          <div key={event.id} className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
             <div className="text-[8px] text-slate-600 font-black uppercase">{event.type}</div>
             <div className="text-[10px] text-slate-400 italic">{JSON.stringify(metadata)}</div>
          </div>
        );
    }
  };

  const filterButtons = [
    { label: 'ALL', value: 'ALL' },
    { label: 'HUSTLES', value: 'HUSTLES' },
    { label: 'RANKS', value: 'PROMOTION_EARNED' },
    { label: 'ASSETS', value: 'BUSINESS_PURCHASED' },
    { label: 'MARKET', value: 'ECONOMIC_EVENT' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-emerald-400 italic">📋 THE RECEIPTS</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl">✕</button>
        </div>

        {/* Stats Summary */}
        <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase">TOTAL PROFIT</div>
              <div className="text-lg font-black text-emerald-400">${totalProfit.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase">HOUSES FLIPPED</div>
              <div className="text-lg font-black text-white">{houseFlips}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-black uppercase">VENDING</div>
              <div className="text-lg font-black text-white">{vendingCount}</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilterType(btn.value)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${
                filterType === btn.value ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">IMPERIAL RECORD</h3>
          {filteredEvents.length === 0 && (
            <div className="text-center text-slate-700 py-12 italic border-2 border-dashed border-slate-900 rounded-2xl">
              No records found. Keep grinding.
            </div>
          )}
          {filteredEvents.map(event => renderEvent(event))}
        </div>

        <div className="mt-12 text-center">
            <div className="text-[8px] text-slate-800 font-black uppercase tracking-widest">End of Record</div>
        </div>
      </div>
    </div>
  );
};
