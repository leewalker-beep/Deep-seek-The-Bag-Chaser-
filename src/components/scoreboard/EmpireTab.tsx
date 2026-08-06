import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { EmptyState } from '../ui/EmptyState';
import { ScrollableList } from '../ui/ScrollableList';
import { HUSTLES } from '../../config/hustles/base';
import { FLEX_ASSETS } from '../../config/flexAssets';

export const EmpireTab: React.FC = () => {
  const { pl } = useGameStore();

  // Active Businesses Elements calculation
  const activeBusinessesElements: React.ReactNode[] = [];

  Object.keys(HUSTLES).forEach(hId => {
    const level = pl.hustleLevels[hId] || 0;
    const branchId = pl.hustleBranchIds[hId];
    if (level === 0 && !branchId) return;

    const hustle = HUSTLES[hId];
    let details = '';
    let passiveYieldAmount = 0;

    if (hustle.branches && branchId) {
      const branch = hustle.branches[branchId];
      details = `Branch: ${branch?.name || branchId}`;
      passiveYieldAmount = branch?.passiveYield || 0;
    } else if (hustle.levels) {
      const lvlData = hustle.levels.find(l => l.level === level);
      details = `Level: ${level}`;
      passiveYieldAmount = lvlData?.passiveYield || 0;
    }

    let countModifier = 1;
    if (hId === 'r_vending') countModifier = pl.vendingCount || 0;
    else if (hId === 'r_labor' && branchId === 'l2b') countModifier = pl.rentPortfolioCount || 1;

    const totalPassiveYield = passiveYieldAmount * countModifier;

    activeBusinessesElements.push(
      <div key={hId} className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{hustle.icon}</span>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">
              {hustle.name}
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
              {details} {countModifier > 1 ? `• ${countModifier} Units` : ''}
            </div>
          </div>
        </div>
        <div className="text-right">
          {totalPassiveYield > 0 ? (
            <div className="text-[11px] font-mono font-black text-emerald-400">
              +${totalPassiveYield.toLocaleString()}/mo
            </div>
          ) : (
            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
              Active Cash Focus
            </div>
          )}
        </div>
      </div>
    );
  });

  if (pl.vendingCount > 0 && !pl.hustleLevels['r_vending']) {
    activeBusinessesElements.push(
      <div key="explicit_vending" className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🥤</span>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">
              Vending Machines
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
              {pl.vendingCount} Units Owned
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono font-black text-emerald-400">
            +${(pl.vendingCount * 150).toLocaleString()}/mo
          </div>
        </div>
      </div>
    );
  }

  if (pl.artists && pl.artists.length > 0) {
    activeBusinessesElements.push(
      <div key="signed_artists" className="p-3.5 bg-slate-950 border border-slate-800/60 rounded-2xl space-y-2 shrink-0">
        <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
          🎙️ Signed Artists (Music Production)
        </div>
        <div className="space-y-1.5">
          {pl.artists.map(artist => (
            <div key={artist.id} className="flex justify-between items-center text-[10px] bg-slate-900/50 p-2 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{artist.avatar || '🎙️'}</span>
                <span className="text-slate-300 font-bold uppercase tracking-tight">{artist.name} ({artist.tier})</span>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono font-black text-emerald-400">
                  +${artist.monthlyRevenue.toLocaleString()}/mo
                </div>
                <div className="text-[7px] text-red-400 uppercase font-black">
                  Retainer: -${artist.monthlyRetainer.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Real Estate Portfolio Elements calculation
  const realEstateElements: React.ReactNode[] = [];

  if (pl.rentPortfolioCount > 0) {
    realEstateElements.push(
      <div key="rent_portfolio" className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <div>
            <div className="text-[10px] font-black text-white uppercase tracking-tight">
              Rent Portfolio
            </div>
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
              {pl.rentPortfolioCount} Residential Units
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono font-black text-emerald-400">
            +${(pl.rentPortfolioCount * 500).toLocaleString()}/mo
          </div>
        </div>
      </div>
    );
  }

  if (pl.rentalCount > 0) {
    realEstateElements.push(
      <div key="real_estate_empire" className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-tight">
                Real Estate Empire
              </div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                {pl.rentalCount} properties owned ({pl.realEstateType})
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono font-black text-emerald-400">
              +${(pl.rentalCount * 50000).toLocaleString()}/mo (est)
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[8px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-900 pt-2">
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-600 block text-[7px] font-black">Leverage</span>
            <span className="text-white font-mono">{pl.realEstateLeverage}%</span>
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-600 block text-[7px] font-black">Strategy</span>
            <span className="text-white">{pl.realEstateStrategy}</span>
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/50">
            <span className="text-slate-600 block text-[7px] font-black">Market Cycle</span>
            <span className="text-emerald-400">{pl.marketCycle?.realEstate}</span>
          </div>
        </div>
      </div>
    );
  }

  // Flex Assets Elements calculation
  const flexAssetElements: React.ReactNode[] = [];

  FLEX_ASSETS.forEach(asset => {
    const count = pl.flexAssets[asset.id] || 0;
    if (count > 0) {
      const assetPassive = asset.passiveYield * count;
      flexAssetElements.push(
        <div key={asset.id} className="p-3.5 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{asset.icon}</span>
            <div>
              <div className="text-[10px] font-black text-white uppercase tracking-tight">
                {asset.name}
              </div>
              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                {count} owned
              </div>
            </div>
          </div>
          <div className="text-right">
            {assetPassive > 0 ? (
              <div className="text-[11px] font-mono font-black text-emerald-400">
                +${assetPassive.toLocaleString()}/mo
              </div>
            ) : (
              <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                Prestige Asset
              </div>
            )}
          </div>
        </div>
      );
    }
  });

  return (
    <motion.div
      key="empire"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Total Net Passive Income & Cash Summary */}
      <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/20 rounded-3xl relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-3 opacity-10">
              <div className="text-6xl uppercase font-black italic tracking-tighter text-white rotate-12">EMPIRE</div>
          </div>
          <div className="relative z-10">
              <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Empire Value Summary</div>
              <div className="text-3xl font-black text-white font-mono tracking-tighter">
                  ${pl.bag.toLocaleString()}
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Liquid Cash Capital</div>
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between gap-4">
                  <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Active Businesses</span>
                      <span className="text-sm font-mono font-black text-white">
                          {Object.keys(pl.hustleLevels || {}).filter(hId => (pl.hustleLevels[hId] || 0) > 0 || pl.hustleBranchIds[hId]).length} Active
                      </span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Real Estate Holdings</span>
                      <span className="text-sm font-mono font-black text-emerald-400">
                          {((pl.rentalCount || 0) + (pl.rentPortfolioCount || 0))} Properties
                      </span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Total Monthly Yield</span>
                      <span className="text-sm font-mono font-black text-emerald-400">
                          +${(pl.lastPassiveBreakdown?.finalTotal || 0).toLocaleString()}/mo
                      </span>
                  </div>
              </div>
          </div>
      </div>

      {/* ACTIVE BUSINESSES SECTION */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Businesses</h3>
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Venture List</span>
        </div>

        {activeBusinessesElements.length === 0 ? (
          <EmptyState
            message="No active businesses owned. Build your first venture."
            className="text-slate-700 text-xs bg-slate-950/30"
          />
        ) : (
          <ScrollableList maxHeight="max-h-[250px]">
            <div className="space-y-2 pb-8 flex flex-col">
              {activeBusinessesElements}
            </div>
          </ScrollableList>
        )}
      </div>

      {/* REAL ESTATE HOLDINGS SECTION */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real Estate Portfolio</h3>
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Property Holdings</span>
        </div>

        {realEstateElements.length === 0 ? (
          <EmptyState
            message="No Real Estate holdings in your portfolio."
            className="text-slate-700 text-[9px] uppercase font-black bg-slate-950/30"
            paddingClass="py-6"
          />
        ) : (
          <ScrollableList maxHeight="max-h-[220px]">
            <div className="space-y-2 pb-8 flex flex-col">
              {realEstateElements}
            </div>
          </ScrollableList>
        )}
      </div>

      {/* PASSIVE HOLDINGS / FLEX ASSETS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Flex Assets & Capital holdings</h3>
          <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter italic">Sovereign Assets</span>
        </div>

        {flexAssetElements.length === 0 ? (
          <EmptyState
            message="No Flex Assets purchased yet. Build your prestige."
            className="text-slate-700 text-[9px] uppercase font-black bg-slate-950/30"
            paddingClass="py-6"
          />
        ) : (
          <ScrollableList maxHeight="max-h-[220px]">
            <div className="space-y-2 pb-8 flex flex-col">
              {flexAssetElements}
            </div>
          </ScrollableList>
        )}
      </div>
    </motion.div>
  );
};
