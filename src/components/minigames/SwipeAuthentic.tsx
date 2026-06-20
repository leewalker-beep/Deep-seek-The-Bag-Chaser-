import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const timerRef = useRef<any>(null);

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
    if (!gameActive || result !== null) return;
    setResult('wrong');
    setTotal(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate([30, 30]);
    window.setTimeout(() => setProductIndex(prev => prev + 1), 500);
  }, [gameActive, result]);

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
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
    setTotal(prev => prev + 1);
    window.setTimeout(() => setProductIndex(prev => prev + 1), 400);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - touchStart.current;
      // Visual offset with dampening
      setOffset(diff * 0.8);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;

    // Sensitivity Tuning: Card must move > 50% of viewport width to register
    const threshold = window.innerWidth * 0.5; // 50% threshold for "clean" feel

    if (diff > threshold) handleSwipe('right');
    else if (diff < -threshold) handleSwipe('left');
    else setOffset(0);

    touchStart.current = null;
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-300 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
      result === 'correct' ? 'bg-emerald-950/20' : result === 'wrong' ? 'bg-red-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center w-full px-8 z-10">
        <h2 className="text-2xl font-black text-purple-400 uppercase tracking-widest italic drop-shadow-lg">STREET AUTHENTICATOR</h2>
        <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">VERIFIED BATCH: {score}/{shuffledProducts.length}</div>
      </div>

      <AnimatePresence mode="wait">
        {currentProduct && gameActive && (
          <motion.div
            key={productIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                x: offset,
                rotate: offset * 0.05,
                transition: { type: 'spring', damping: 20, stiffness: 200 }
            }}
            exit={{
                x: offset > 0 ? 800 : -800,
                opacity: 0,
                transition: { duration: 0.3, ease: 'easeIn' }
            }}
            className={`w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl p-10 text-center border-4 transition-colors duration-200 shadow-2xl flex flex-col items-center justify-center relative ${
              result === 'correct' ? 'border-emerald-500' :
              result === 'wrong' ? 'border-red-500' :
              'border-slate-800'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="text-8xl mb-8 drop-shadow-2xl">📦</div>
            <div className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter">{currentProduct.name}</div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
              <motion.div
                className={`h-full ${timeLeft < 0.5 ? 'bg-red-500' : 'bg-purple-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / currentProduct.timeLimit) * 100}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">INSPECTION WINDOW</div>

            {/* Swipe Indicators on card */}
            <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 opacity-20 pointer-events-none">
                <div className="text-red-500 font-black">FAKE</div>
                <div className="text-emerald-500 font-black">REAL</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!gameActive && (
        <div className="text-center animate-in zoom-in duration-300">
          <div className="text-8xl mb-6">{score >= 6 ? '💎' : '📉'}</div>
          <div className="text-4xl font-black text-white uppercase italic tracking-tighter">BATCH PROCESSED</div>
          <div className="text-purple-400 font-black text-2xl mt-4 font-mono">ACCURACY: {Math.round((score/shuffledProducts.length)*100)}%</div>
        </div>
      )}

      {gameActive && (
        <div className="absolute bottom-12 flex justify-between w-full max-w-xs px-8 z-10">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <motion.div animate={{ x: [-10, 0, -10] }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">⬅️</motion.div>
            <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">SUSPECT</div>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-40">
            <motion.div animate={{ x: [10, 0, 10] }} transition={{ repeat: Infinity, duration: 1 }} className="text-5xl">➡️</motion.div>
            <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">AUTHENTIC</div>
          </div>
        </div>
      )}
    </div>
  );
};
