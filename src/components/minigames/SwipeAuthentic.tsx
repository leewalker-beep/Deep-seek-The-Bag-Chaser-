import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  isReal: boolean;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Designer Hoodie', isReal: true },
  { id: 2, name: 'Sus Hoodie', isReal: false },
  { id: 3, name: 'Official Watch', isReal: true },
  { id: 4, name: 'Faux Gold Watch', isReal: false },
  { id: 5, name: 'Brand Sneakers', isReal: true },
  { id: 6, name: 'Snookers', isReal: false },
  { id: 7, name: 'Luxury Bag', isReal: true },
  { id: 8, name: 'Pleather Bag', isReal: false },
  { id: 9, name: 'Premium Tech', isReal: true },
  { id: 10, name: 'Knockoff Tablet', isReal: false },
  { id: 11, name: 'Fine Silk Scarf', isReal: true },
  { id: 12, name: 'Synthetic Scarf', isReal: false },
];

interface SwipeAuthenticProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

export const SwipeAuthentic: React.FC<SwipeAuthenticProps> = ({ onComplete, level = 1 }) => {
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

  // Difficulty scaling
  const timePerProduct = Math.max(0.5, 1.5 - (level - 1) * 0.3);
  const productsToInspect = 10 + (level * 5);
  const swipeThreshold = 100; // Require >50% of card width for registration

  const [shuffledProducts] = useState(() => {
    let base = [...PRODUCTS].sort(() => Math.random() - 0.5);
    while (base.length < productsToInspect) {
        base = [...base, ...[...PRODUCTS].sort(() => Math.random() - 0.5)];
    }
    return base.slice(0, productsToInspect);
  });

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;
    let multiplier = 0.5;
    if (accuracy >= 0.9) multiplier = 4.0;
    else if (accuracy >= 0.7) multiplier = 2.5;
    else if (accuracy >= 0.5) multiplier = 1.2;

    window.setTimeout(() => onComplete(multiplier), 1000);
  }, [score, total, onComplete]);

  const handleTimeout = useCallback(() => {
    setResult('wrong');
    setTotal(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate([30, 30]);
    window.setTimeout(() => setProductIndex(prev => prev + 1), 500);
  }, []);

  useEffect(() => {
    if (productIndex < shuffledProducts.length && gameActive) {
      const product = shuffledProducts[productIndex];
      setCurrentProduct(product);
      setTimeLeft(timePerProduct);
      setResult(null);
      setOffset(0);

      if (timerRef.current) window.clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, timePerProduct - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          handleTimeout();
        }
      }, 30);
    } else if (productIndex >= shuffledProducts.length && gameActive) {
      endGame();
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [productIndex, shuffledProducts, gameActive, handleTimeout, endGame, timePerProduct]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!gameActive || !currentProduct || result !== null) return;
    if (timerRef.current) window.clearInterval(timerRef.current);

    const isCorrect = (direction === 'right' && currentProduct.isReal) || (direction === 'left' && !currentProduct.isReal);
    if (isCorrect) {
      setScore(prev => prev + 1);
      setResult('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTotal(prev => prev + 1);
    window.setTimeout(() => setProductIndex(prev => prev + 1), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const currentX = e.targetTouches[0].clientX;
      setOffset(currentX - touchStart.current);
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > swipeThreshold) handleSwipe('right');
    else if (diff < -swipeThreshold) handleSwipe('left');
    else setOffset(0);
    touchStart.current = null;
  };

  // Mouse fallbacks for testing
  const handleMouseDown = (e: React.MouseEvent) => { touchStart.current = e.clientX; };
  const handleMouseMove = (e: React.MouseEvent) => {
      if (touchStart.current !== null) setOffset(e.clientX - touchStart.current);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (touchStart.current === null) return;
    const diff = e.clientX - touchStart.current;
    if (diff > swipeThreshold) handleSwipe('right');
    else if (diff < -swipeThreshold) handleSwipe('left');
    else setOffset(0);
    touchStart.current = null;
  };

  return (
    <div
        className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
            result === 'correct' ? 'bg-emerald-950/40' : result === 'wrong' ? 'bg-red-950/40' : 'bg-slate-950'
        }`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-12 text-center w-full px-8 z-10">
        <h2 className="text-3xl font-black text-purple-400 uppercase tracking-tighter italic">AUTHENTICATOR <span className="text-white text-sm">L{level}</span></h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">VERIFIED BATCH: {score}/{productsToInspect}</div>
      </div>

      <AnimatePresence mode="wait">
        {currentProduct && gameActive && (
          <motion.div
            key={productIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: offset, rotate: offset * 0.08 }}
            exit={{ x: offset > 0 ? 500 : -500, opacity: 0, rotate: offset * 0.1 }}
            className={`w-full max-w-sm aspect-[4/5] bg-slate-900 rounded-[2rem] p-8 text-center border-8 transition-colors duration-200 shadow-2xl relative flex flex-col items-center justify-center ${
              result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
              result === 'wrong' ? 'border-red-500 bg-red-500/10' :
              'border-slate-800'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            {offset > 40 && (
                <div className="absolute top-8 right-8 font-black text-emerald-400 text-2xl rotate-12 border-4 border-emerald-400 px-4 py-1 rounded-xl">REAL</div>
            )}
            {offset < -40 && (
                <div className="absolute top-8 left-8 font-black text-red-400 text-2xl -rotate-12 border-4 border-red-400 px-4 py-1 rounded-xl">FAKE</div>
            )}

            <div className="text-8xl mb-6 drop-shadow-2xl">📦</div>
            <div className="text-3xl font-black text-white mb-6 uppercase italic tracking-tighter leading-tight">{currentProduct.name}</div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / timePerProduct) * 100}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-600 font-mono font-black uppercase">{timeLeft.toFixed(2)}s REMAINING</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!gameActive && (
        <div className="text-center animate-in zoom-in duration-300 z-10">
          <div className="text-8xl mb-4 drop-shadow-2xl">{score/productsToInspect >= 0.8 ? '🏆' : '📉'}</div>
          <div className="text-4xl font-black text-white uppercase italic tracking-tighter">BATCH INSPECTED</div>
          <div className="text-purple-400 font-black text-2xl mt-2 font-mono uppercase tracking-widest">ACCURACY: {Math.round((score/productsToInspect)*100)}%</div>
        </div>
      )}

      {gameActive && (
        <div className="absolute bottom-12 flex justify-between w-full max-w-sm px-10">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="text-4xl">⬅️</div>
            <div className="text-xs text-red-500 font-black uppercase tracking-widest">SWIPE FAKE</div>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="text-4xl">➡️</div>
            <div className="text-xs text-emerald-500 font-black uppercase tracking-widest">SWIPE REAL</div>
          </div>
        </div>
      )}
    </div>
  );
};
