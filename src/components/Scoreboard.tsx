import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface ScoreboardProps {
  onClose: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ onClose }) => {
  const { pl } = useGameStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'endings'>('stats');

  const totalProfit = pl.actionLog?.reduce((sum, a) => sum + a.netCash, 0) || 0;
  const totalHustles = pl.actionLog?.length || 0;
  const successRate = totalHustles > 0 ? Math.round((pl.actionLog?.filter(a => a.success).length || 0) / totalHustles * 100) : 0;

  const endingsUnlocked = JSON.parse(localStorage.getItem('bag-chaser-endings') || '[]');

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-emerald-400">📊 SCOREBOARD</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl">✕</button>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'stats' ? 'bg-emerald-600' : 'bg-slate-800'}`}>STATS</button>
          <button onClick={() => setActiveTab('badges')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'badges' ? 'bg-emerald-600' : 'bg-slate-800'}`}>DEATH BADGES</button>
          <button onClick={() => setActiveTab('endings')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'endings' ? 'bg-emerald-600' : 'bg-slate-800'}`}>ENDINGS</button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-3">
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="text-[10px] text-slate-500">LIFETIME PROFIT</div>
              <div className="text-2xl font-bold text-emerald-400">${totalProfit.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-[10px] text-slate-500">HUSTLES</div>
                <div className="text-xl font-bold text-white">{totalHustles}</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-[10px] text-slate-500">SUCCESS RATE</div>
                <div className="text-xl font-bold text-blue-400">{successRate}%</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-[10px] text-slate-500">HIGHEST TIER</div>
                <div className="text-xl font-bold text-purple-400">{pl.currentTier}</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-[10px] text-slate-500">LEGACY SCORE</div>
                <div className="text-xl font-bold text-yellow-400">{pl.legacyPoints || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 mb-4">Death Badges Collected</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-lg">💀</div>
                <div className="text-[8px] text-slate-400">BONE CRUSHER</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-lg">💀</div>
                <div className="text-[8px] text-slate-400">ROAD KILL</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-lg">💀</div>
                <div className="text-[8px] text-slate-400">RATIO'D</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-lg">💀</div>
                <div className="text-[8px] text-slate-400">DEAD AIR</div>
              </div>
            </div>
            <div className="text-center text-[10px] text-slate-600 mt-4">More badges unlock as you die in new ways</div>
          </div>
        )}

        {activeTab === 'endings' && (
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 mb-4">Endings Unlocked: {endingsUnlocked.length}/16</div>
            <div className="space-y-2">
              {endingsUnlocked.map((ending: string, i: number) => (
                <div key={i} className="bg-slate-800 rounded-lg p-2 text-center">
                  <div className="text-xs text-emerald-400">🏆 {ending}</div>
                </div>
              ))}
              {endingsUnlocked.length === 0 && (
                <div className="text-center text-slate-600 py-4">Complete the game to unlock endings</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
