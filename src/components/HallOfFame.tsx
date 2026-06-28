import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HallOfFameEntry } from '../types/game';
import { getHallOfFameEntries, getBestRun } from '../utils/hallOfFame';
import { ENDINGS } from '../config/endings';
import { BaseButton } from './ui/BaseButton';
import { StatCard } from './ui/StatCard';

interface HallOfFameProps {
  onNewRun: () => void;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({ onNewRun }) => {
  const [activeTab, setActiveTab] = useState<'BEST' | 'ALL' | 'ENDINGS'>('BEST');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleShare = async (run: HallOfFameEntry | null, shareId: string) => {
    if (!run) return;

    const shareText = `I just finished a run of Bag Chaser! Hit ${run.tier} tier with $${run.finalBag.toLocaleString()} bag. Legacy score: ${run.legacyScore.toLocaleString()}. Can you beat me?`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'Bag Chaser Run',
          text: shareText,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(shareId);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(shareId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (clipErr) {
        console.error('Clipboard fallback failed:', clipErr);
      }
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
          <BaseButton variant="secondary" onClick={() => handleShare(bestRun, 'best')} className="w-full py-4 text-lg">
            {copiedId === 'best' ? 'COPIED!' : 'SHARE BEST RUN'}
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
                          handleShare(run, run.runId);
                        }}
                        className="w-full py-2 text-[10px]"
                      >
                        {copiedId === run.runId ? 'COPIED!' : 'SHARE THIS RUN'}
                      </BaseButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <BaseButton variant="secondary" onClick={() => handleShare(mostRecentRun, 'latest')} className="w-full py-3 text-sm">
            {copiedId === 'latest' ? 'COPIED!' : 'SHARE LATEST RUN'}
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
          <BaseButton variant="secondary" onClick={() => handleShare(mostRecentRun, 'collection')} className="w-full py-3 text-sm">
            {copiedId === 'collection' ? 'COPIED!' : 'SHARE COLLECTION STATS'}
          </BaseButton>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950 flex flex-col items-center p-4 overflow-y-auto">
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
          <BaseButton variant="primary" onClick={onNewRun} className="w-full py-4 text-xl">
            NEW RUN
          </BaseButton>
        </div>
      </div>
    </div>
  );
};
