import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Product {
  id: number;
  name: string;
  isReal: boolean;
  timeLimit: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Nike Air Max', isReal: true, timeLimit: 1.5 },
  { id: 2, name: 'Nake Air Max', isReal: false, timeLimit: 1.5 },
  { id: 3, name: 'Supreme Box Logo', isReal: true, timeLimit: 1.5 },
  { id: 4, name: 'Suprme Box Logo', isReal: false, timeLimit: 1.5 },
  { id: 5, name: 'Rolex Submariner', isReal: true, timeLimit: 1.5 },
  { id: 6, name: 'Rolax Submariner', isReal: false, timeLimit: 1.5 },
  { id: 7, name: 'Louis Vuitton Bag', isReal: true, timeLimit: 1.5 },
  { id: 8, name: 'Louis Vuitton Bag (Fake)', isReal: false, timeLimit: 1.5 },
  { id: 9, name: 'Apple iPhone 15', isReal: true, timeLimit: 1.5 },
  { id: 10, name: 'Apple iPhone 15 Pro (Fake)', isReal: false, timeLimit: 1.5 },
  { id: 11, name: 'Adidas Yeezy', isReal: true, timeLimit: 1.5 },
  { id: 12, name: 'Adidas Yezy', isReal: false, timeLimit: 1.5 },
  { id: 13, name: 'Gucci Belt', isReal: true, timeLimit: 1.5 },
  { id: 14, name: 'Guci Belt', isReal: false, timeLimit: 1.5 },
  { id: 15, name: 'PS5 Console', isReal: true, timeLimit: 1.5 },
  { id: 16, name: 'PS5 Pro (Fake)', isReal: false, timeLimit: 1.5 },
];

interface SwipeOrderProps {
  onComplete: (multiplier: number) => void;
}

export const SwipeOrder: React.FC<SwipeOrderProps> = ({ onComplete }) => {
  const [shuffledProducts, setShuffledProducts] = useState<Product[]>([]);
  const [productIndex, setProductIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1.5);
  const [gameActive, setGameActive] = useState(true);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;

    let multiplier = 0.5;
    if (accuracy >= 0.9) multiplier = 5.0;
    else if (accuracy >= 0.7) multiplier = 2.5;
    else if (accuracy >= 0.5) multiplier = 1.5;
    else if (accuracy >= 0.3) multiplier = 1.0;
    else multiplier = 0.7;

    window.setTimeout(() => {
      onComplete(multiplier);
    }, 1000);
  }, [score, total, onComplete]);

  const handleNext = useCallback(() => {
    setResult(null);
    setOffset(0);
    setProductIndex(prev => prev + 1);
  }, []);

  const handleTimeout = useCallback(() => {
    setResult('wrong');
    setTotal(prev => prev + 1);
    window.setTimeout(() => {
      handleNext();
    }, 500);
  }, [handleNext]);

  // Shuffle on mount
  useEffect(() => {
    const shuffled = [...PRODUCTS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, 10);
    setShuffledProducts(selected);
    setTimeLeft(selected[0].timeLimit);
  }, []);

  // Per-product effect
  useEffect(() => {
    if (shuffledProducts.length === 0) return;

    if (productIndex < shuffledProducts.length && gameActive) {
      const product = shuffledProducts[productIndex];

      setTimeLeft(product.timeLimit);

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

      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    } else if (productIndex >= shuffledProducts.length && gameActive) {
      endGame();
    }
  }, [productIndex, shuffledProducts, gameActive, handleTimeout, endGame]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentProduct = shuffledProducts[productIndex];
    if (!gameActive || !currentProduct || result !== null) return;

    if (timerRef.current) window.clearInterval(timerRef.current);

    const isCorrect = (direction === 'right' && currentProduct.isReal) ||
                      (direction === 'left' && !currentProduct.isReal);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setResult('correct');
    } else {
      setResult('wrong');
    }

    setTotal(prev => prev + 1);

    window.setTimeout(() => {
      handleNext();
    }, 400);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const currentX = e.targetTouches[0].clientX;
      setOffset(currentX - touchStart.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStart.current;

    if (diff > 50) {
      handleSwipe('right');
    } else if (diff < -50) {
      handleSwipe('left');
    } else {
      setOffset(0);
    }
    touchStart.current = null;
  };

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      {/* Header */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <div className="text-[10px] text-slate-500 uppercase font-bold">Dropshipping</div>
        <div className="text-2xl font-black text-white">Sort the Goods</div>
        <div className="flex justify-center gap-8 mt-2">
          <div className="text-center">
            <div className="text-[8px] text-slate-500">SCORE</div>
            <div className="text-xl font-bold text-emerald-400">{score}/{total}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500">ACCURACY</div>
            <div className="text-xl font-bold text-blue-400">{accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Product Card */}
      {shuffledProducts[productIndex] && gameActive && (
        <div
          className={`w-full max-w-sm bg-slate-900 rounded-2xl p-8 text-center border-2 transition-all duration-200 ${
            result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
            result === 'wrong' ? 'border-red-500 bg-red-500/10' :
            'border-slate-800'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: `translateX(${offset}px) rotate(${offset * 0.1}deg)` }}
        >
          <div className="text-6xl mb-4">📦</div>
          <div className="text-2xl font-black text-white mb-2">{shuffledProducts[productIndex].name}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Swipe RIGHT for REAL • Swipe LEFT for FAKE</div>

          {/* Timer Bar */}
          <div className="mt-6 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-50"
              style={{ width: `${(timeLeft / (shuffledProducts[productIndex]?.timeLimit || 1.5)) * 100}%` }}
            />
          </div>
          <div className="text-[8px] text-slate-600 mt-1">{timeLeft.toFixed(1)}s</div>
        </div>
      )}

      {/* Result Summary */}
      {!gameActive && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="text-4xl mb-2">{accuracy >= 70 ? '🎉' : accuracy >= 50 ? '👍' : '😅'}</div>
          <div className="text-xl font-black text-white">{accuracy}% Accuracy</div>
          <div className="text-[10px] text-slate-400 mt-2">
            {accuracy >= 90 ? 'PERFECT! 5x Profit' :
             accuracy >= 70 ? 'Great! 2.5x Profit' :
             accuracy >= 50 ? 'Good! 1.5x Profit' :
             accuracy >= 30 ? 'Passable. 1x (Break Even)' :
             'Tough Run. 0.7x (Small Loss)'}
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameActive && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl">⬅️</div>
              <div className="text-[8px] text-red-400 uppercase font-bold">FAKE</div>
            </div>
            <div className="text-center">
              <div className="text-3xl">➡️</div>
              <div className="text-[8px] text-emerald-400 uppercase font-bold">REAL</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
