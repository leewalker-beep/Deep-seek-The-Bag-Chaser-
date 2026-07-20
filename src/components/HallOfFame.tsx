import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import type { HallOfFameEntry } from '../types/game';
import { getHallOfFameEntries, getBestRun } from '../utils/hallOfFame';
import { ENDINGS } from '../config/endings';
import { DEATH_MESSAGES } from '../config/deathMessages';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';
import { ShareCard } from './ShareCard';

interface HallOfFameProps {
  onNewRun: () => void;
}

import { useGameStore } from '../store/gameStore';
import { HERO_ARTWORK } from '../config/heroArtwork';

export const HallOfFame: React.FC<HallOfFameProps> = ({ onNewRun: _onNewRun }) => {
  const { triggerTransition } = useGameStore();

  React.useEffect(() => {
    triggerTransition(HERO_ARTWORK.HALL_OF_FAME);
  }, [triggerTransition]);
  const [activeTab, setActiveTab] = useState<'BEST' | 'ALL' | 'ENDINGS'>('BEST');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [sharingRun, setSharingRun] = useState<HallOfFameEntry | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => getHallOfFameEntries(), []);
  const bestRun = useMemo(() => getBestRun(), []);
  const unlockedEndings = useMemo(() => {
    const runEndings = entries.map(e => e.ending);
    let savedEndings = [];
    if (typeof window !== 'undefined') {
      try {
        savedEndings = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');
      } catch (e) {
        savedEndings = [];
      }
    }
    // Return unique combination of both
    return Array.from(new Set([...runEndings, ...savedEndings]));
  }, [entries]);

  const handleShare = async (run: HallOfFameEntry | null) => {
    if (!run || sharing) return;

    setSharing(true);
    setSharingRun(run);

    // Give React a frame to render the ShareCard in the portal
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (!cardRef.current) throw new Error('Card ref not found');

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSharing(false);
          return;
        }

        const fileName = `bagchaser-${run.playerName || 'run'}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });
        const ending = ENDINGS.find(e => e.title === run.ending);

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Bag Chaser Run',
              text: `${run.playerName || 'A player'} — ${ending?.title || 'Legend'}. Can you beat ${run.legacyScore.toLocaleString()} legacy?`
            });
          } catch (shareErr) {
            // User cancelled or share failed, fallback to download
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
          }
        } else {
          // Fallback: download the image
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
        }
        setSharing(false);
        setSharingRun(null);
      }, 'image/png');
    } catch (err) {
      console.error('Share failed:', err);
      setSharing(false);
      setSharingRun(null);
    }
  };

  const renderBestRun = () => {
    if (!bestRun) return <div className="text-center py-12 text-slate-500">No runs recorded yet.</div>;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="p-6 bg-slate-950 border border-yellow-500/30 rounded-2xl text-center shadow-[0_0_20px_rgba(234,179,8,0.1)]">
          <div className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-widest mb-1">Single Highest Legacy Score</div>
          <div className="text-5xl font-black text-yellow-400 tabular-nums mb-2">
            {bestRun.legacyScore.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400 font-medium">"{bestRun.ending}"</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Final Tier" value={bestRun.tier} colorClass="text-purple-400" />
          <StatCard label="Final Bag" value={`$${bestRun.finalBag.toLocaleString()}`} colorClass="text-emerald-400" />
          <StatCard label="Months" value={bestRun.month} icon="📅" />
          <StatCard label="Death Badge" value={bestRun.deathBadge || 'N/A'} icon="💀" />
        </div>

        {bestRun.blueprint && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left space-y-2 mt-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">ADVISOR BLUEPRINT</span>
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${
                    bestRun.blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                    bestRun.blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                    bestRun.blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308'
                  }15`,
                  color:
                    bestRun.blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                    bestRun.blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                    bestRun.blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308',
                  borderColor: `${
                    bestRun.blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                    bestRun.blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                    bestRun.blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308'
                  }40`
                }}
              >
                {bestRun.blueprint.primaryColor} ({bestRun.blueprint.dominantPersona})
              </span>
            </div>

            {bestRun.blueprint.headlineSynthesis && (
              <p className="text-[10px] text-slate-300 italic leading-relaxed">
                "{bestRun.blueprint.headlineSynthesis}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div>
                PACE: <span className="text-white font-mono">{bestRun.blueprint.paceLabel}</span>
              </div>
              <div>
                ORIENTATION: <span className="text-white font-mono">{bestRun.blueprint.orientationLabel}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <BaseButton
            variant="secondary"
            onClick={() => handleShare(bestRun)}
            className="w-full py-4 text-lg"
            disabled={sharing}
          >
            {sharing ? 'CREATING CARD...' : 'SHARE BEST RUN'}
          </BaseButton>
        </div>
      </motion.div>
    );
  };

  const renderAllRuns = () => {
    if (entries.length === 0) return <div className="text-center py-12 text-slate-500">No runs recorded yet.</div>;

    const mostRecentRun = entries[entries.length - 1];
    const reversedEntries = [...entries].reverse();

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {reversedEntries.map((run, rIndex) => {
            const originalIndex = entries.length - 1 - rIndex;
            return (
              <div
                key={run.runId}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedRunId(expandedRunId === run.runId ? null : run.runId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900 transition-colors"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Run #{originalIndex + 1}</span>
                    <span className="text-sm font-bold text-white">{run.tier} Tier</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">{run.legacyScore.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-600 font-medium">{new Date(run.date).toLocaleDateString()}</div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedRunId === run.runId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 border-t border-slate-900/50 pt-3"
                    >
                      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                        <div className="text-slate-500 uppercase font-bold">Final Bag:</div>
                        <div className="text-slate-300 text-right">${run.finalBag.toLocaleString()}</div>
                        <div className="text-slate-500 uppercase font-bold">Ending:</div>
                        <div className="text-slate-300 text-right">{run.ending}</div>
                        <div className="text-slate-500 uppercase font-bold">Duration:</div>
                        <div className="text-slate-300 text-right">{run.month} Months</div>
                        <div className="text-slate-500 uppercase font-bold">Badge:</div>
                        <div className="text-slate-300 text-right">{run.deathBadge || 'N/A'}</div>
                      </div>

                      {run.blueprint && (
                        <div className="mb-4 bg-slate-900/30 border border-slate-800 p-3 rounded-xl text-left space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">ADVISOR BLUEPRINT</span>
                            <span
                              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: `${
                                  run.blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                                  run.blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                                  run.blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308'
                                }15`,
                                color:
                                  run.blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                                  run.blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                                  run.blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308',
                                borderColor: `${
                                  run.blueprint.primaryColor === 'CRIMSON' ? '#Ef4444' :
                                  run.blueprint.primaryColor === 'COBALT' ? '#3b82f6' :
                                  run.blueprint.primaryColor === 'VIOLET' ? '#8b5cf6' : '#eab308'
                                }40`
                              }}
                            >
                               {run.blueprint.primaryColor} ({run.blueprint.dominantPersona})
                            </span>
                          </div>

                          {run.blueprint.headlineSynthesis && (
                            <p className="text-[10px] text-slate-300 italic leading-relaxed">
                              "{run.blueprint.headlineSynthesis}"
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                            <div>
                              PACE: <span className="text-white font-mono">{run.blueprint.paceLabel}</span>
                            </div>
                            <div>
                              ORIENTATION: <span className="text-white font-mono">{run.blueprint.orientationLabel}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {run.biography && run.biography.length > 0 && (
                        <div className="mb-4 space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                           <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-2">Life Story</div>
                           {run.biography.map((line, idx) => (
                             <div key={idx} className="text-[9px] text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                               {line}
                             </div>
                           ))}
                        </div>
                      )}

                      <BaseButton
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(run);
                        }}
                        className="w-full py-2 text-[10px]"
                        disabled={sharing}
                      >
                        {sharing && sharingRun?.runId === run.runId ? 'CREATING CARD...' : 'SHARE THIS RUN'}
                      </BaseButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <BaseButton
            variant="secondary"
            onClick={() => handleShare(mostRecentRun)}
            className="w-full py-3 text-sm"
            disabled={sharing}
          >
            {sharing && sharingRun?.runId === mostRecentRun?.runId ? 'CREATING CARD...' : 'SHARE LATEST RUN'}
          </BaseButton>
        </div>
      </div>
    );
  };

  const renderEndings = () => {
    const mostRecentRun = entries[entries.length - 1];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {ENDINGS.map((ending) => {
            const isUnlocked = unlockedEndings.includes(ending.title);
            return (
              <div
                key={ending.id}
                className={`p-3 rounded-xl border text-center transition-all min-h-[100px] flex flex-col justify-center ${
                  isUnlocked
                    ? 'bg-slate-900 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                    : 'bg-slate-900/20 border-slate-800/40 grayscale-0 opacity-100 blur-0'
                }`}
              >
                <div className={`mb-1 ${isUnlocked ? 'text-4xl' : 'text-4xl text-slate-600 font-black'}`}>
                  {isUnlocked ? ending.emoji : '?'}
                </div>
                <div className={`text-[10px] font-black uppercase tracking-tight mb-1 ${isUnlocked ? 'text-purple-400' : 'text-slate-600'}`}>
                  {isUnlocked ? ending.title : '???'}
                </div>
                <p className={`text-[9px] leading-tight ${isUnlocked ? 'text-slate-400' : 'text-slate-700 text-xs'}`}>
                  {isUnlocked ? ending.description : 'Complete a run to unlock'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <BaseButton
            variant="secondary"
            onClick={() => handleShare(mostRecentRun)}
            className="w-full py-3 text-sm"
            disabled={sharing}
          >
             {sharing ? 'CREATING CARD...' : 'SHARE RUN CARD'}
          </BaseButton>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950 flex flex-col items-center p-4 overflow-y-auto">
      {/* Hidden ShareCard for html2canvas capture */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
        {sharingRun && (
          <ShareCard
            ref={cardRef}
            playerName={sharingRun.playerName || 'Anonymous'}
            avatarId={sharingRun.avatarId || 'av_m1'}
            tier={sharingRun.tier}
            finalBag={sharingRun.finalBag}
            legacyScore={sharingRun.legacyScore}
            months={sharingRun.month}
            endingTitle={sharingRun.ending}
            endingEmoji={ENDINGS.find(e => e.title === sharingRun.ending)?.emoji || '💀'}
            deathMessage={DEATH_MESSAGES[sharingRun.lastHustle || '']?.message || 'The streets claimed another one.'}
            deathBadge={sharingRun.deathBadge || DEATH_MESSAGES[sharingRun.lastHustle || '']?.badge || 'UNKNOWN'}
            blueprint={sharingRun.blueprint}
          />
        )}
      </div>

      <div className="w-full max-w-lg bg-slate-900 border-2 border-purple-500/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col min-h-[90vh]">
        {/* Header */}
        <div className="p-8 pb-4 text-center border-b border-slate-800/50">
          <div className="text-[10px] text-purple-500 font-black uppercase tracking-[0.4em] mb-1">RECORD OF LEGACY</div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">Hall of Fame</h2>
        </div>

        <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-2xl text-[10px] text-slate-400 leading-relaxed uppercase tracking-tight m-4">
          <span className="font-black text-white block mb-1">🎭 The Permanent Ledger</span>
          <span className="font-bold text-white">What is this?</span> Your persistent scoreboard cataloging all finished lifetimes.
          <br />
          <span className="font-bold text-white">Why are you here?</span> Review your highest-scoring character runs, view completed timeline histories, inspect the endings gallery, or download visual brag cards to share your score with others!
          <br />
          <span className="font-bold text-white">What should I do next?</span> Explore the tabs below, or select "START NEW RUN" to launch your next meta-progression cycle in the Legacy Shop!
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30">
          {(['BEST', 'ALL', 'ENDINGS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {tab === 'BEST' && '🏆 Best'}
              {tab === 'ALL' && '📜 History'}
              {tab === 'ENDINGS' && '🎭 Endings'}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabHall"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'BEST' && renderBestRun()}
              {activeTab === 'ALL' && renderAllRuns()}
              {activeTab === 'ENDINGS' && renderEndings()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-950/50 border-t border-slate-800/50 text-center">
          <button
            onClick={() => useGameStore.setState({ ph: 'LEGACY_SHOP' })}
            className="w-full py-5 bg-purple-600 text-white font-black text-lg rounded-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:bg-purple-500 transition-all active:scale-95 mb-4"
          >
            START NEW RUN
          </button>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Bag Chaser Eternal Records</p>
        </div>
      </div>
    </div>
  );
};
