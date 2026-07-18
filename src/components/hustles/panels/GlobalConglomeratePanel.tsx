import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/gameStore';
import type { Hustle } from '../../../config/hustles/base';
import type { RegionalExecutive } from '../../../types/game';
import { RosterSelectList } from '../../ui/RosterSelectList';
import { CONGLOMERATE_CANDIDATES } from '../../../config/conglomerateCandidates';
import { CinematicModal } from '../../ui/CinematicModal';

interface GlobalConglomeratePanelProps {
  hustle: Hustle;
}

export const GlobalConglomeratePanel: React.FC<GlobalConglomeratePanelProps> = ({ hustle }) => {
  const { pl, appointConglomerateCEO, fireConglomerateCEO, updatePl, executeHustle, setActiveHustleView } = useGameStore();

  const [activeAppointmentDivision, setActiveAppointmentDivision] = useState<string | null>(null);

  // Self-heal/initialize candidate pool if empty
  useEffect(() => {
    const currentCandidates = pl.conglomerateCandidates || [];
    const currentCEOs = pl.conglomerateCEOs || {};
    const appointedIds = Object.values(currentCEOs).map(c => c.id);

    if (currentCandidates.length === 0 && appointedIds.length === 0) {
      updatePl({
        conglomerateCandidates: [...CONGLOMERATE_CANDIDATES],
        conglomerateCEOs: {}
      });
    }
  }, [pl.conglomerateCandidates, pl.conglomerateCEOs, updatePl]);

  const ceos = pl.conglomerateCEOs || {};
  const candidates = pl.conglomerateCandidates || [];

  const divisions = [
    { id: 'na_tech', name: 'NA Technology', type: 'Technology & R&D' },
    { id: 'eu_mfg', name: 'EU Manufacturing', type: 'Industrial & Hardware' },
    { id: 'apac_retail', name: 'APAC Retail', type: 'Retail & E-Commerce' },
    { id: 'latam_log', name: 'LATAM Logistics', type: 'Supply Chain & Freight' }
  ];

  const currentLevel = pl.hustleLevels[hustle.id] || 1;
  const levelData = hustle.levels?.find(l => l.level === currentLevel) || {
    cost: 15000000,
    yieldCash: 30000000,
    yieldClout: 100,
    yieldAura: 80,
    passiveYield: 2500000
  };

  const handleAppointSelect = (candidate: RegionalExecutive) => {
    if (activeAppointmentDivision && appointConglomerateCEO) {
      appointConglomerateCEO(activeAppointmentDivision, candidate);
      setActiveAppointmentDivision(null);
    }
  };

  // Compute overall estimated metrics for the conglomerate
  let totalEstYield = 0;
  let totalEstPassive = 0;
  let averageCompetence = 0;
  let averageLoyalty = 0;
  let averageRisk = 0;
  let activeCEOCount = 0;

  divisions.forEach(div => {
    const ceo = ceos[div.id];
    const baseShare = levelData.yieldCash / 4;
    const basePassiveShare = (levelData.passiveYield || 0) / 4;
    let mult = 0.5;

    if (ceo) {
      const compMult = 0.5 + (ceo.competence / 100) * 1.0;
      const loyMult = 0.8 + (ceo.loyalty / 100) * 0.2;
      const riskMult = 1.0 + (ceo.riskTolerance / 100) * 0.5;
      mult = compMult * loyMult * riskMult;

      averageCompetence += ceo.competence;
      averageLoyalty += ceo.loyalty;
      averageRisk += ceo.riskTolerance;
      activeCEOCount++;
    }

    totalEstYield += Math.floor(baseShare * mult);
    totalEstPassive += Math.floor(basePassiveShare * mult);
  });

  if (activeCEOCount > 0) {
    averageCompetence = Math.round(averageCompetence / activeCEOCount);
    averageLoyalty = Math.round(averageLoyalty / activeCEOCount);
    averageRisk = Math.round(averageRisk / activeCEOCount);
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 max-w-[650px] mx-auto overflow-hidden relative shadow-2xl">
      {/* Visual Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-15 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{hustle.icon}</div>
          <div className="text-left">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-950/50 px-2 py-0.5 rounded">
              ELITE DIVISION BOARD
            </span>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mt-1">{hustle.name}</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{hustle.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-black uppercase">Operation Tier</span>
          <div className="text-xl font-extrabold text-purple-400">LEVEL {currentLevel}</div>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">EST. ACTIVE REV</span>
          <span className="text-emerald-400 font-mono text-sm font-black">${totalEstYield.toLocaleString()}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">EST. PASSIVE REV</span>
          <span className="text-blue-400 font-mono text-sm font-black">${totalEstPassive.toLocaleString()}/mo</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">AVG COMPETENCE</span>
          <span className="text-white font-mono text-sm font-black">{activeCEOCount > 0 ? `${averageCompetence}%` : 'N/A'}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
          <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">AVG RISK TOLERANCE</span>
          <span className="text-orange-400 font-mono text-sm font-black">{activeCEOCount > 0 ? `${averageRisk}%` : 'N/A'}</span>
        </div>
      </div>

      {/* Divisions Board */}
      <div className="space-y-4 relative z-10 text-left">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-purple-500 pl-2">
          REGIONAL OPERATIONS & DIVISIONAL LEADERS
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {divisions.map(div => {
            const ceo = ceos[div.id];

            // Division local stats
            const baseCash = levelData.yieldCash / 4;
            const basePassive = (levelData.passiveYield || 0) / 4;
            let divMult = 0.5;
            let finalCash = Math.floor(baseCash * divMult);
            let finalPassive = Math.floor(basePassive * divMult);
            let scandalChance = 0;

            if (ceo) {
              const compMult = 0.5 + (ceo.competence / 100) * 1.0;
              const loyMult = 0.8 + (ceo.loyalty / 100) * 0.2;
              const riskMult = 1.0 + (ceo.riskTolerance / 100) * 0.5;
              divMult = compMult * loyMult * riskMult;
              finalCash = Math.floor(baseCash * divMult);
              finalPassive = Math.floor(basePassive * divMult);
              scandalChance = Math.round((ceo.riskTolerance / 100) * 25);
            }

            return (
              <div
                key={div.id}
                className={`bg-slate-950 p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  ceo ? 'border-slate-800 hover:border-purple-500/30' : 'border-dashed border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Division Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="text-white font-black text-xs uppercase">{div.name}</h5>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{div.type}</span>
                    </div>
                    {ceo && (
                      <span className="text-[8px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase">
                        MULT: {divMult.toFixed(2)}x
                      </span>
                    )}
                  </div>

                  {ceo ? (
                    <div className="mt-3 flex gap-3">
                      <div className="text-3xl bg-slate-900 w-12 h-12 rounded-lg border border-slate-800 flex items-center justify-center">
                        {ceo.avatar || '👔'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-white font-black text-xs">{ceo.name}</div>
                        <p className="text-[8px] text-slate-500 leading-normal line-clamp-2 uppercase italic">{ceo.bio}</p>

                        <div className="grid grid-cols-3 gap-1.5 pt-2 pb-1">
                          <div className="min-w-0">
                            <span className="block text-[6px] text-slate-500 font-black uppercase tracking-tight truncate leading-none mb-1">COMPETENCE</span>
                            <span className="text-[10px] text-white font-mono font-black leading-none">{ceo.competence}%</span>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[6px] text-slate-500 font-black uppercase tracking-tight truncate leading-none mb-1">LOYALTY</span>
                            <span className="text-[10px] text-white font-mono font-black leading-none">{ceo.loyalty}%</span>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[6px] text-slate-500 font-black uppercase tracking-tight truncate leading-none mb-1">RISK TOL</span>
                            <span className="text-[10px] text-orange-400 font-mono font-black leading-none">{ceo.riskTolerance}%</span>
                          </div>
                        </div>

                        <div className="pt-2 grid grid-cols-2 gap-1 border-t border-slate-900 mt-2 text-[9px] font-bold">
                          <div className="text-emerald-400">Active: +${finalCash.toLocaleString()}</div>
                          <div className="text-blue-400">Passive: +${finalPassive.toLocaleString()}/mo</div>
                          {scandalChance > 0 && (
                            <div className="col-span-2 text-red-400 text-[8px] uppercase font-black">
                              ⚠️ Scandal Risk: {scandalChance}% / month
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="my-6 text-center text-slate-600">
                      <span className="block text-lg mb-1">🤖</span>
                      <p className="text-[9px] uppercase font-black tracking-widest">NO CHIEF EXECUTIVE APPOINTED</p>
                      <p className="text-[8px] uppercase text-slate-500 mt-0.5">Running at 50% baseline productivity</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setActiveAppointmentDivision(div.id)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg border border-slate-800 transition-all"
                  >
                    {ceo ? '🔄 SWAP CEO' : '👔 APPOINT CEO'}
                  </button>
                  {ceo && fireConglomerateCEO && (
                    <button
                      onClick={() => fireConglomerateCEO(div.id)}
                      className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/60 text-red-400 text-[9px] font-black uppercase rounded-lg border border-red-900/30 transition-all"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 pt-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-left text-xs font-bold">
          <div className="flex justify-between">
            <span className="text-slate-500 uppercase">Operational Expenses</span>
            <span className="text-red-400">-${levelData.cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 uppercase">Divisional Active Return</span>
            <span className="text-emerald-400">+${totalEstYield.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveHustleView(null)}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase rounded-xl transition-all text-xs tracking-wider"
          >
            CLOSE
          </button>
          <button
            onClick={() => {
              executeHustle(hustle.id);
              setActiveHustleView(null);
            }}
            className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded-xl transition-all border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 shadow-[0_0_20px_rgba(147,51,234,0.3)] text-xs tracking-widest"
          >
            💼 EXECUTE BOARD OPERATIONS
          </button>
        </div>
      </div>

      {/* Appointment Modal overlay */}
      <CinematicModal
        isOpen={activeAppointmentDivision !== null}
        onClose={() => setActiveAppointmentDivision(null)}
        title="Appoint Divisional CEO"
        subtitle={`Select a candidate to run ${divisions.find(d => d.id === activeAppointmentDivision)?.name || ''}`}
        accentColor="purple"
        maxWidth="xl"
      >
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl m-4 text-left space-y-1">
          <h5 className="text-[9px] text-white font-black uppercase tracking-widest"> divisional recruitment metrics</h5>
          <p className="text-[8px] text-slate-500 leading-relaxed uppercase">
            • <span className="text-slate-300 font-bold">Competence:</span> Drives active and passive revenue yields up to +50%.
            <br />
            • <span className="text-slate-300 font-bold">Loyalty:</span> Minimizes financial siphoning/embezzlement leaks (requires &gt;40 loyalty).
            <br />
            • <span className="text-slate-300 font-bold">Risk Tolerance:</span> Grants up to +50% yields, but raises monthly scandal risk (regulatory fines & Heat).
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold uppercase text-xs">
            No candidates currently available. Fire a CEO to return them to the recruitment pool!
          </div>
        ) : (
          <div className="p-4 max-h-[400px] overflow-y-auto">
            <RosterSelectList
              roster={candidates}
              onSelect={handleAppointSelect}
              layout="list"
              getDisplayProps={(cand) => ({
                name: cand.name,
                avatar: cand.avatar || '👔',
                subtitle: cand.bio,
                statLine: (
                  <div className="text-[10px] space-y-1 text-right">
                    <span className="block text-[8px] font-black text-slate-500 uppercase">KEY STATS</span>
                    <span className="text-emerald-400 font-bold">COMP: {cand.competence}%</span>
                    <span className="mx-2 text-slate-700">|</span>
                    <span className="text-blue-400 font-bold">LOYAL: {cand.loyalty}%</span>
                    <span className="mx-2 text-slate-700">|</span>
                    <span className="text-orange-400 font-bold">RISK: {cand.riskTolerance}%</span>
                  </div>
                )
              })}
            />
          </div>
        )}
      </CinematicModal>
    </div>
  );
};
