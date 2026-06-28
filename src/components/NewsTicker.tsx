import React from 'react';
import { motion } from 'framer-motion';
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

  const deduped = filteredNews.filter((msg, i) => {
    const currentText = typeof msg === 'string' ? msg : msg.text;
    if (i === 0) return true;
    const prevMsg = filteredNews[i - 1];
    const prevText = typeof prevMsg === 'string' ? prevMsg : (prevMsg as TickerMessage).text;
    return currentText !== prevText;
  }).map(msg => typeof msg === 'string' ? { text: msg } : msg);

  if (deduped.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 py-1.5 z-50">
        <div className="text-[10px] font-mono text-slate-600 text-center uppercase tracking-widest">System ready...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full overflow-hidden border-t border-slate-800 bg-slate-950/80 py-1.5">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: Math.max(deduped.length * 6, 20),
            ease: 'linear',
            repeat: Infinity
          }}
        >
          {[...deduped, ...deduped].map((msg, i) => (
            <span
              key={i}
              className={`text-xs shrink-0 ${msg.colorClass || 'text-slate-400'}`}
            >
              {msg.text}
              <span className="mx-4 text-slate-700">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
