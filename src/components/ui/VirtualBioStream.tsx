import React, { useState } from 'react';

interface VirtualBioStreamProps {
  items: string[];
}

export const VirtualBioStream: React.FC<VirtualBioStreamProps> = ({ items }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 400;
  const itemHeight = 40;

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(items.length, startIndex + visibleItemsCount);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className="overflow-y-auto relative bg-zinc-950 border border-zinc-800 rounded-lg w-full"
      style={{ height: `${containerHeight}px` }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: `${totalHeight}px`, width: '100%' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }} className="absolute top-0 left-0 right-0 flex flex-col">
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: `${itemHeight}px` }}
              className="p-2 text-xs border-b border-zinc-900 truncate text-slate-300 font-mono flex items-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
