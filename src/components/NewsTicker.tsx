import React from 'react';
import type { TickerMessage } from '../types/game';

interface NewsTickerProps {
  news: (string | TickerMessage)[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 z-50">
      <div className="max-w-md mx-auto">
        {news.slice(0, 4).map((msg, i) => {
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
