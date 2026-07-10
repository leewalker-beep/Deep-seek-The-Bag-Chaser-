import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type {
  GameEvent,
  HustleCompletedMetadata,
  PropertyPurchasedMetadata,
  BusinessPurchasedMetadata,
  PromotionEarnedMetadata,
  EconomicEventMetadata,
  ReflectionMetadata,
  LawPassedMetadata,
  CrisisResolvedMetadata,
  CabinetAppointedMetadata,
  RivalDefeatedMetadata,
  SpecialEventMetadata,
  PassiveSource
} from '../types/game';

export const TheReceipts: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const pl = useGameStore(state => state.pl);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [expandedLedger, setExpandedLedger] = useState<string | null>(null);

  const events = pl.events || [];

  const filteredEvents = filterType === 'ALL'
    ? events
    : events.filter(e => {
        if (filterType === 'HUSTLES' && e.type === 'HUSTLE_COMPLETED') return true;
        if (filterType === 'GOVERNMENT' && ['LAW_PASSED', 'CRISIS_RESOLVED', 'CABINET_APPOINTED'].includes(e.type)) return true;
        return e.type === filterType;
      });

  // Calculate stats from events
  const totalProfit = events
    .filter(e => e.type === 'HUSTLE_COMPLETED')
    .reduce((sum, e) => {
        const m = e.metadata as HustleCompletedMetadata;
        return sum + (m.profit || 0);
    }, 0);

  const houseFlips = events.filter(e => {
    if (e.type !== 'PROPERTY_PURCHASED') return false;
    const m = e.metadata as PropertyPurchasedMetadata;
    return m.branchId === 'l2a';
  }).length;

  const vendingCount = events.filter(e => {
    if (e.type !== 'BUSINESS_PURCHASED') return false;
    const m = e.metadata as BusinessPurchasedMetadata;
    return m.assetId === 'vending';
  }).length;

  const renderEvent = (event: GameEvent) => {
    const { playerStats, timestamp } = event;
    const dateStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (event.type) {
      case 'HUSTLE_COMPLETED': {
        const metadata = event.metadata as HustleCompletedMetadata;
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
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 font-mono text-[9px]">
              <div className={`${metadata.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                CASH: {metadata.profit >= 0 ? '+' : ''}${metadata.profit.toLocaleString()}
              </div>
              {metadata.rentDeducted && metadata.rentDeducted > 0 && (
                <div className="text-red-500">
                  RENT: -${metadata.rentDeducted.toLocaleString()}
                </div>
              )}
              {metadata.passiveIncomeTotal && metadata.passiveIncomeTotal > 0 && (
                <div className="text-emerald-500 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    MONTHLY PASSIVE TOTAL: +${metadata.passiveIncomeTotal.toLocaleString()}
                    {metadata.passiveBreakdown && (
                      <button
                        onClick={() => setExpandedLedger(expandedLedger === event.id ? null : event.id)}
                        className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-[8px] font-black rounded border border-emerald-500/30 transition-colors uppercase"
                      >
                        {expandedLedger === event.id ? 'Hide Ledger' : 'View Ledger'}
                      </button>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-600">your total passive income per month</div>
                </div>
              )}
              {metadata.passiveAdded && metadata.passiveAdded > 0 && (
                <div className="text-blue-400 font-bold">
                  ADDED PASSIVE: +${metadata.passiveAdded.toLocaleString()}
                </div>
              )}
              {metadata.yieldClout !== 0 && (
                <div className="text-blue-400">
                  CLOUT: {metadata.yieldClout > 0 ? '+' : ''}{metadata.yieldClout}
                </div>
              )}
              {metadata.yieldAura !== 0 && (
                <div className="text-purple-400">
                  AURA: {metadata.yieldAura > 0 ? '+' : ''}{metadata.yieldAura}
                </div>
              )}
              {metadata.mentalHit !== 0 && (
                <div className={metadata.mentalHit > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  MENTAL: {metadata.mentalHit > 0 ? '+' : ''}{metadata.mentalHit}%
                </div>
              )}
              {metadata.heatHit !== 0 && (
                <div className="text-orange-400">
                  HEAT: {metadata.heatHit > 0 ? '+' : ''}{metadata.heatHit}%
                </div>
              )}
            </div>

            {expandedLedger === event.id && metadata.passiveBreakdown && (
              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-emerald-500/20 animate-in slide-in-from-top-2 duration-200">
                <div className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest mb-2 flex justify-between">
                    <span>Imperial Ledger</span>
                    <span>ROI Breakdown</span>
                </div>
                <div className="space-y-1">
                    {metadata.passiveBreakdown.sources.map((src: PassiveSource) => (
                        <div key={src.id} className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1 h-1 rounded-full ${
                                    src.category === 'BUSINESS' ? 'bg-blue-400' :
                                    src.category === 'REAL_ESTATE' ? 'bg-emerald-400' :
                                    src.category === 'FLEX' ? 'bg-purple-400' : 'bg-yellow-400'
                                }`} />
                                <span className="text-slate-300 uppercase font-bold tracking-tighter">
                                    {src.name}
                                    {src.count && src.count > 1 && <span className="text-slate-600 ml-1">x{src.count}</span>}
                                </span>
                            </div>
                            <span className="font-mono text-emerald-400">+${src.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold italic">
                        <span>Base Yield:</span>
                        <span>${metadata.passiveBreakdown.baseTotal.toLocaleString()}</span>
                    </div>
                    {metadata.passiveBreakdown.multipliers.legacy > 1 && (
                        <div className="flex justify-between text-[9px] text-amber-500 font-bold">
                            <span>Legacy Bonus:</span>
                            <span>x{metadata.passiveBreakdown.multipliers.legacy.toFixed(3)}</span>
                        </div>
                    )}
                    {metadata.passiveBreakdown.multipliers.market !== 1 && (
                        <div className="flex justify-between text-[9px] text-blue-400 font-bold">
                            <span>Market Impact:</span>
                            <span>x{metadata.passiveBreakdown.multipliers.market.toFixed(2)}</span>
                        </div>
                    )}
                    {metadata.passiveBreakdown.multipliers.specialization > 1 && (
                        <div className="flex justify-between text-[9px] text-emerald-400 font-bold">
                            <span>Spec. Synergy:</span>
                            <span>x{metadata.passiveBreakdown.multipliers.specialization.toFixed(2)}</span>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'PROMOTION_EARNED': {
        const metadata = event.metadata as PromotionEarnedMetadata;
        return (
          <div key={event.id} className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
            <div className="text-[10px] text-purple-400 font-black mb-1 uppercase tracking-widest">RANK UP</div>
            <div className="font-black text-white text-lg italic">
              {metadata.from} → {metadata.to}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">Institutional Fee: ${metadata.fee.toLocaleString()}</div>
          </div>
        );
      }
      case 'BUSINESS_PURCHASED': {
        const metadata = event.metadata as BusinessPurchasedMetadata;
        return (
          <div key={event.id} className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
            <div className="text-[10px] text-blue-400 font-black mb-1 uppercase tracking-widest">ASSET ACQUIRED</div>
            <div className="font-bold text-white capitalize">{metadata.assetId.replace('_', ' ')}</div>
            <div className="text-[9px] text-red-400">-${metadata.cost.toLocaleString()}</div>
          </div>
        );
      }
      case 'PROPERTY_PURCHASED': {
        const metadata = event.metadata as PropertyPurchasedMetadata;
        return (
          <div key={event.id} className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-[10px] text-emerald-400 font-black mb-1 uppercase tracking-widest">REAL ESTATE</div>
            <div className="font-bold text-white">{metadata.branchName || metadata.type || 'Property'}</div>
            <div className="text-[9px] text-red-400">-${metadata.cost.toLocaleString()}</div>
          </div>
        );
      }
      case 'SPECIAL_EVENT': {
        const metadata = event.metadata as SpecialEventMetadata;
        return (
          <div key={event.id} className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
            <div className="text-[10px] text-yellow-400 font-black mb-1 uppercase tracking-widest">MILESTONE</div>
            <div className="font-bold text-white">
                {'achievementName' in metadata ? metadata.achievementName : ('hustleName' in metadata ? metadata.hustleName : 'Achieved')}
            </div>
            <div className="text-[9px] text-slate-400 mt-1 capitalize">{metadata.type.toLowerCase().replace('_', ' ')}</div>
          </div>
        );
      }
      case 'RIVAL_DEFEATED': {
        const metadata = event.metadata as RivalDefeatedMetadata;
        return (
          <div key={event.id} className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
            <div className="text-[10px] text-red-400 font-black mb-1 uppercase tracking-widest">RIVAL SMOKED</div>
            <div className="font-bold text-white">{metadata.rivalName} defeated</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[9px]">
              {metadata.bid != null && (
                <div className="text-slate-400">Their bid: ${metadata.bid.toLocaleString()}</div>
              )}
              {metadata.bonus != null && (
                <div className="text-emerald-400">Bonus: +${metadata.bonus.toLocaleString()}</div>
              )}
            </div>
          </div>
        );
      }
      case 'ECONOMIC_EVENT': {
        const metadata = event.metadata as EconomicEventMetadata;
        return (
          <div key={event.id} className="bg-slate-800 rounded-lg p-2 border border-slate-700 text-center">
            <div className="text-[9px] text-slate-500 uppercase font-black">MARKET SHIFT</div>
            <div className="text-xs font-bold text-white">→ {metadata.to}</div>
          </div>
        );
      }
      case 'REFLECTION': {
        const metadata = event.metadata as ReflectionMetadata;
        return (
          <div key={event.id} className="bg-emerald-900/10 rounded-lg p-4 border-l-4 border-emerald-500 italic">
            <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">PERSONAL REFLECTION</div>
            <p className="text-white text-sm font-serif leading-relaxed">
              "{metadata.text || metadata.choiceLabel}"
            </p>
            <div className="text-[8px] text-slate-500 mt-2 font-mono uppercase">
              {metadata.eventId ? `Event: ${metadata.eventId.replace(/_/g, ' ')}` : `Month ${metadata.month} • ${metadata.tier} Tier`}
            </div>
          </div>
        );
      }
      case 'LAW_PASSED': {
        const metadata = event.metadata as LawPassedMetadata;
        return (
          <div key={event.id} className="bg-blue-900/40 rounded-lg p-3 border border-blue-400/50 shadow-lg shadow-blue-900/20">
            <div className="flex justify-between items-start mb-1">
              <div className="text-[10px] text-blue-300 font-black uppercase tracking-tighter">EXECUTIVE ORDER</div>
              <span className="text-[10px] text-emerald-400 font-bold">+{metadata.approvalImpact}% APPR</span>
            </div>
            <div className="font-serif text-white text-lg italic leading-tight mb-2 underline decoration-blue-500/30">
              {metadata.name}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px]">
              <div className="text-red-400">TREASURY: -${(metadata.cost/1000000).toFixed(1)}M</div>
              <div className="text-blue-400">CLOUT: -{metadata.cloutCost}</div>
            </div>
          </div>
        );
      }
      case 'CRISIS_RESOLVED': {
        const metadata = event.metadata as CrisisResolvedMetadata;
        return (
          <div key={event.id} className="bg-emerald-900/40 rounded-lg p-3 border border-emerald-400/50 shadow-lg shadow-emerald-900/20">
            <div className="text-[10px] text-emerald-300 font-black uppercase tracking-tighter mb-1">CRISIS RESOLVED</div>
            <div className="font-black text-white text-md uppercase tracking-tight">
              {metadata.name}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px]">
              <div className="text-red-400">TREASURY: -${(metadata.cost/1000000).toFixed(1)}M</div>
              <div className="text-blue-400 text-right">ACTION: SUCCESS</div>
            </div>
          </div>
        );
      }
      case 'CABINET_APPOINTED': {
        const metadata = event.metadata as CabinetAppointedMetadata;
        return (
          <div key={event.id} className="bg-slate-800 rounded-lg p-3 border border-slate-600">
            <div className="text-[10px] text-slate-400 font-black uppercase mb-1">CABINET APPOINTMENT</div>
            <div className="font-bold text-white text-sm uppercase">{metadata.role}</div>
            <div className="text-xs text-slate-300 italic">"I appoint {metadata.name} to this office."</div>
          </div>
        );
      }
      default:
        return (
          <div key={event.id} className="bg-slate-900/50 rounded-lg p-2 border border-slate-800">
             <div className="text-[8px] text-slate-600 font-black uppercase">{event.type}</div>
             <div className="text-[10px] text-slate-400 italic">{JSON.stringify(event.metadata)}</div>
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
    { label: 'REFLECTIONS', value: 'REFLECTION' },
    { label: 'GOVERNMENT', value: 'GOVERNMENT' },
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
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilterType(btn.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border select-none ${
                filterType === btn.value
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
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
