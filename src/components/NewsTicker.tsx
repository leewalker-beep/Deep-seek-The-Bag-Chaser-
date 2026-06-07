import React from 'react';

interface NewsTickerProps {
  news: string[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 z-50">
      <div className="max-w-md mx-auto">
        {news.slice(0, 2).map((msg, i) => (
          <div key={i} className="text-[9px] font-mono text-slate-400 truncate">
            <span className="text-slate-600">[{i + 1}]</span> {msg}
          </div>
        ))}
        {news.length === 0 && (
          <div className="text-[9px] font-mono text-slate-600 text-center">System ready...</div>
        )}
      </div>
    </div>
  );
};
