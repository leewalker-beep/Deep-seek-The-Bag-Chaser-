import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Product {
  id: number;
  name: string;
  isReal: boolean;
  timeLimit: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Designer Hoodie', isReal: true, timeLimit: 1.5 },
  { id: 2, name: 'Sus Hoodie', isReal: false, timeLimit: 1.5 },
  { id: 3, name: 'Official Watch', isReal: true, timeLimit: 1.5 },
  { id: 4, name: 'Faux Gold Watch', isReal: false, timeLimit: 1.5 },
  { id: 5, name: 'Brand Sneakers', isReal: true, timeLimit: 1.5 },
  { id: 6, name: 'Snookers', isReal: false, timeLimit: 1.5 },
  { id: 7, name: 'Luxury Bag', isReal: true, timeLimit: 1.5 },
  { id: 8, name: 'Pleather Bag', isReal: false, timeLimit: 1.5 },
  { id: 9, name: 'Premium Tech', isReal: true, timeLimit: 1.5 },
  { id: 10, name: 'Knockoff Tablet', isReal: false, timeLimit: 1.5 },
];

interface SwipeAuthenticProps {
  onComplete: (multiplier: number) => void;
}

export const SwipeAuthentic: React.FC<SwipeAuthenticProps> = ({ onComplete }) => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1.5);
  const [gameActive, setGameActive] = useState(true);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const [shuffledProducts] = useState(() => {
    return [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, 8);
  });

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;
    let multiplier = 1.0;
    if (accuracy >= 0.9) multiplier = 3.0;
    else if (accuracy >= 0.7) multiplier = 2.0;
    else if (accuracy >= 0.5) multiplier = 1.5;
    else multiplier = 0.8;

    window.setTimeout(() => onComplete(multiplier), 1000);
  }, [score, total, onComplete]);

  const handleTimeout = useCallback(() => {
    setResult('wrong');
    setTotal(prev => prev + 1);
    window.setTimeout(() => setProductIndex(prev => prev + 1), 500);
  }, []);

  useEffect(() => {
    if (productIndex < shuffledProducts.length && gameActive) {
      const product = shuffledProducts[productIndex];
      setCurrentProduct(product);
      setTimeLeft(product.timeLimit);
      setResult(null);
      setOffset(0);

      if (timerRef.current) window.clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, product.timeLimit - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          handleTimeout();
        }
      }, 50);
    } else if (productIndex >= shuffledProducts.length && gameActive) {
      endGame();
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [productIndex, shuffledProducts, gameActive, handleTimeout, endGame]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!gameActive || !currentProduct || result !== null) return;
    if (timerRef.current) window.clearInterval(timerRef.current);

    const isCorrect = (direction === 'right' && currentProduct.isReal) || (direction === 'left' && !currentProduct.isReal);
    if (isCorrect) {
      setScore(prev => prev + 1);
      setResult('correct');
    } else {
      setResult('wrong');
    }
    setTotal(prev => prev + 1);
    window.setTimeout(() => setProductIndex(prev => prev + 1), 400);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const currentX = e.targetTouches[0].clientX;
      setOffset(Math.min(Math.max(currentX - touchStart.current, -100), 100));
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 50) handleSwipe('right');
    else if (diff < -50) handleSwipe('left');
    else setOffset(0);
    touchStart.current = null;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-8 text-center w-full">
        <div className="text-[10px] text-purple-400 uppercase font-black tracking-widest">STREET AUTHENTICATOR</div>
        <div className="text-2xl font-black text-white">REAL VS FAKE</div>
        <div className="text-emerald-400 font-bold mt-1">SUCCESS: {score}/{shuffledProducts.length}</div>
      </div>

      {currentProduct && gameActive && (
        <div
          className={`w-full max-w-sm bg-slate-900 rounded-3xl p-10 text-center border-4 transition-all duration-200 ${
            result === 'correct' ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' :
            result === 'wrong' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
            'border-slate-800'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: `translateX(${offset}px) rotate(${offset * 0.05}deg)` }}
        >
          <div className="text-5xl mb-4">📦</div>
          <div className="text-2xl font-black text-white mb-2 uppercase">{currentProduct.name}</div>
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-50" style={{ width: `${(timeLeft / currentProduct.timeLimit) * 100}%` }} />
          </div>
        </div>
      )}

      {!gameActive && (
        <div className="text-center">
          <div className="text-4xl mb-4">{score >= 6 ? '💎' : '📉'}</div>
          <div className="text-2xl font-black text-white">BATCH INSPECTED</div>
          <div className="text-purple-400 font-bold">Accuracy: {Math.round((score/shuffledProducts.length)*100)}%</div>
        </div>
      )}

      {gameActive && (
        <div className="absolute bottom-12 flex justify-between w-full max-w-xs px-4">
          <div className="text-center opacity-50">
            <div className="text-3xl">⬅️</div>
            <div className="text-[10px] text-red-500 font-black">FAKE</div>
          </div>
          <div className="text-center opacity-50">
            <div className="text-3xl">➡️</div>
            <div className="text-[10px] text-emerald-500 font-black">REAL</div>
          </div>
        </div>
      )}
    </div>
  );
};
