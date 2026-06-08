import React, { useState, useRef } from 'react';

interface SwipeOrderProps {
  onComplete: (multiplier: number) => void;
}

export const SwipeOrder: React.FC<SwipeOrderProps> = ({ onComplete }) => {
  const [order, setOrder] = useState({ id: 1, item: 'Luxury Watch', destination: 'Tokyo' });
  const [count, setCount] = useState(0);
  const touchStart = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    startTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const currentX = e.targetTouches[0].clientX;
      setOffset(currentX - touchStart.current);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart.current !== null && startTime.current !== null) {
      const duration = Date.now() - startTime.current;
      const distance = offset;

      if (Math.abs(distance) > 100) {
        // Speed bonus: faster swipe = higher multiplier
        // Base multiplier is 1.0, max is 2.0 for extremely fast swipes
        const speed = Math.abs(distance) / duration;
        const multiplier = Math.min(2.0, 1.0 + speed * 0.5);

        if (count >= 4) {
          onComplete(multiplier);
        } else {
          setCount(c => c + 1);
          setOrder({
            id: count + 2,
            item: ['Designer Bag', 'Vintage Camera', 'Rare Sneaker', 'High-end Drone'][count % 4],
            destination: ['London', 'New York', 'Paris', 'Berlin'][count % 4]
          });
          setOffset(0);
        }
      } else {
        setOffset(0);
      }
    }
    touchStart.current = null;
    startTime.current = null;
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none overflow-hidden h-64 flex flex-col justify-center items-center relative">
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-4">
        SWIPE RIGHT TO SHIP ({count}/5)
      </div>

      <div
        className="w-48 h-32 bg-slate-800 rounded-xl border border-slate-700 flex flex-col justify-center items-center shadow-2xl transition-transform duration-75"
        style={{ transform: `translateX(${offset}px) rotate(${offset * 0.1}deg)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="text-2xl mb-1">📦</div>
        <div className="font-bold text-white text-sm">{order.item}</div>
        <div className="text-[10px] text-slate-400">To: {order.destination}</div>
      </div>

      <div className="absolute inset-x-0 bottom-4 flex justify-between px-8 text-[8px] font-black text-slate-600 uppercase">
        <span>REJECT</span>
        <span>SHIP</span>
      </div>

      <div className="mt-4 text-[10px] text-emerald-400 font-mono animate-pulse">
        SWIPE FAST FOR BONUS PROFIT
      </div>
    </div>
  );
};
