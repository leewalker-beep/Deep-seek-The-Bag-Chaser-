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

export const HallOfFame: React.FC<HallOfFameProps> = ({ onNewRun: _onNewRun }) => {
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
          />
        )}
      </div>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-2 text-center border-b border-slate-800/50">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white">Hall of Fame</h2>
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Legendary Status</div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {(['BEST', 'ALL', 'ENDINGS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[10px] font-black tracking-widest uppercase transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {tab === 'BEST' && '🏆 Best'}
              {tab === 'ALL' && '📜 All Runs'}
              {tab === 'ENDINGS' && '🎭 Endings'}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabHall"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'BEST' && renderBestRun()}
              {activeTab === 'ALL' && renderAllRuns()}
              {activeTab === 'ENDINGS' && renderEndings()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900/50 border-t border-slate-800">
          <BaseButton variant="primary" onClick={() => {
            // Instead of onNewRun which reloads the page, we go to LEGACY_SHOP
            useGameStore.setState({ ph: 'LEGACY_SHOP' });
          }} className="w-full py-4 text-xl">
            NEW RUN
          </BaseButton>
        </div>
      </div>
    </div>
  );
};
