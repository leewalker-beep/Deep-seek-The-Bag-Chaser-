import React from 'react';
import type { TickerMessage, Tier } from '../types/game';
import { PROGRESSION_ORDER } from '../config/tiers';

interface NewsTickerProps {
  news: (string | TickerMessage)[];
  currentTier: Tier;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news, currentTier }) => {
  const filteredNews = news.filter(msg => {
    if (typeof msg === 'string') return true;
    if (!msg.tier) return true;

    const msgTierIdx = PROGRESSION_ORDER.indexOf(msg.tier);
    const currentTierIdx = PROGRESSION_ORDER.indexOf(currentTier);

    if (msgTierIdx === -1 || currentTierIdx === -1) return true;

    return Math.abs(msgTierIdx - currentTierIdx) <= 2;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 z-50">
      <div className="max-w-md mx-auto">
        {filteredNews.slice(0, 4).map((msg, i) => {
          const isObject = typeof msg === 'object';
          const text = isObject ? msg.text : msg;
          const colorClass = isObject ? msg.colorClass : 'text-slate-400';

          return (
            <div key={i} className={`text-[9px] font-mono truncate ${colorClass}`}>
              <span className="text-slate-600">[{i + 1}]</span> {text}
            </div>
          );
        })}
        {news.length === 0 && (
          <div className="text-[9px] font-mono text-slate-600 text-center">System ready...</div>
        )}
      </div>
    </div>
  );
};
