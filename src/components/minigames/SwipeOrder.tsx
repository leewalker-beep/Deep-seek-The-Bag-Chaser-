import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SwipeItem {
  id: number;
  name: string;
  type: 'real' | 'fake' | 'random';
  timeLimit: number;
}

const PRODUCTS: SwipeItem[] = [
  // Level 1 - Streetwear (Obvious)
  { id: 1, name: 'NIKE', type: 'real', timeLimit: 1.5 },
  { id: 2, name: 'NAH-KE', type: 'fake', timeLimit: 1.5 },
  { id: 3, name: 'ADIDAS', type: 'real', timeLimit: 1.5 },
  { id: 4, name: 'ADIDONT', type: 'fake', timeLimit: 1.5 },
  { id: 5, name: 'OFF-WHITE', type: 'real', timeLimit: 1.5 },
  { id: 6, name: 'ON-WHITE', type: 'fake', timeLimit: 1.5 },
  { id: 7, name: 'JORDAN', type: 'real', timeLimit: 1.5 },
  { id: 8, name: 'JORDOWN', type: 'fake', timeLimit: 1.5 },
  { id: 9, name: 'SUPREME', type: 'real', timeLimit: 1.5 },
  { id: 10, name: 'SO PREME', type: 'fake', timeLimit: 1.5 },
  { id: 11, name: 'VANS', type: 'real', timeLimit: 1.5 },
  { id: 12, name: 'VANS?', type: 'random', timeLimit: 1.5 },
  { id: 13, name: 'YEEZY', type: 'real', timeLimit: 1.5 },
  { id: 14, name: 'JEEZY', type: 'fake', timeLimit: 1.5 },
  { id: 15, name: 'BAPE', type: 'real', timeLimit: 1.5 },
  { id: 16, name: 'BAPÉ', type: 'fake', timeLimit: 1.5 },
  { id: 17, name: 'PALACE', type: 'real', timeLimit: 1.5 },
  { id: 18, name: 'PLACE', type: 'fake', timeLimit: 1.5 },
  { id: 19, name: 'FEAR OF GOD', type: 'real', timeLimit: 1.5 },
  { id: 20, name: 'FEAR OF DOG', type: 'fake', timeLimit: 1.5 },

  // Level 2 - Mid-Luxury (Obvious + Random)
  { id: 21, name: 'GUCCI', type: 'real', timeLimit: 1.5 },
  { id: 22, name: 'GOOCHI', type: 'fake', timeLimit: 1.5 },
  { id: 23, name: 'LOUIS VUITTON', type: 'real', timeLimit: 1.5 },
  { id: 24, name: 'LOUIS OUITION', type: 'fake', timeLimit: 1.5 },
  { id: 25, name: 'RAY-BAN', type: 'real', timeLimit: 1.5 },
  { id: 26, name: 'BAN RAY', type: 'fake', timeLimit: 1.5 },
  { id: 27, name: 'BURBERRY', type: 'real', timeLimit: 1.5 },
  { id: 28, name: 'BLUEBERRY', type: 'fake', timeLimit: 1.5 },
  { id: 29, name: 'VERSACE', type: 'real', timeLimit: 1.5 },
  { id: 30, name: 'VER-SLAY', type: 'fake', timeLimit: 1.5 },
  { id: 31, name: 'PRADA?', type: 'random', timeLimit: 1.5 },
  { id: 32, name: 'FENDI?', type: 'random', timeLimit: 1.5 },
  { id: 33, name: 'CELINE?', type: 'random', timeLimit: 1.5 },
  { id: 34, name: 'GIVENCHY?', type: 'random', timeLimit: 1.5 },
  { id: 35, name: 'LOEWE?', type: 'random', timeLimit: 1.5 },

  // Level 3 - Ultra-Luxury (Obvious + Random)
  { id: 36, name: 'ROLEX', type: 'real', timeLimit: 1.5 },
  { id: 37, name: 'ROLL-X', type: 'fake', timeLimit: 1.5 },
  { id: 38, name: 'AUDEMARS PIGUET', type: 'real', timeLimit: 1.5 },
  { id: 39, name: 'AUDEMARS PIG', type: 'fake', timeLimit: 1.5 },
  { id: 40, name: 'PATEK PHILIPPE', type: 'real', timeLimit: 1.5 },
  { id: 41, name: 'PATEK PHILLIP', type: 'fake', timeLimit: 1.5 },
  { id: 42, name: 'RICHARD MILLE', type: 'real', timeLimit: 1.5 },
  { id: 43, name: 'RICHARD MILL', type: 'fake', timeLimit: 1.5 },
  { id: 44, name: 'HERMÈS', type: 'real', timeLimit: 1.5 },
  { id: 45, name: 'HER-MESS', type: 'fake', timeLimit: 1.5 },
  { id: 46, name: 'BUGATTI?', type: 'random', timeLimit: 1.5 },
  { id: 47, name: 'ROLLS-ROYCE?', type: 'random', timeLimit: 1.5 },
  { id: 48, name: 'HUBLOT?', type: 'random', timeLimit: 1.5 },
  { id: 49, name: 'CARTI-NO?', type: 'random', timeLimit: 1.5 },
  { id: 50, name: 'GRAFF?', type: 'random', timeLimit: 1.5 },
];

interface SwipeOrderProps {
  onComplete: (multiplier: number) => void;
  title?: string;
  instruction?: string;
  leftLabel?: string;
  rightLabel?: string;
  icon?: string;
  items?: SwipeItem[];
}

export const SwipeOrder: React.FC<SwipeOrderProps> = ({
  onComplete,
  title = "SORT THE GOODS",
  instruction = "QUALITY CONTROL",
  leftLabel = "FAKE",
  rightLabel = "REAL",
  icon = "📦",
  items = PRODUCTS
}) => {
  const [currentProduct, setCurrentProduct] = useState<SwipeItem | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1.5);
  const [gameActive, setGameActive] = useState(true);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [isRealForRandom, setIsRealForRandom] = useState<Map<number, boolean>>(new Map());
  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Shuffle products at start
  const [shuffledProducts] = useState(() => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 10);
  });

  const endGame = useCallback(() => {
    setGameActive(false);
    const accuracy = total > 0 ? score / total : 0;

    let multiplier = 0.7;
    if (accuracy >= 0.9) multiplier = 5.0;
    else if (accuracy >= 0.7) multiplier = 2.5;
    else if (accuracy >= 0.5) multiplier = 1.5;
    else if (accuracy >= 0.3) multiplier = 1.0;
    else multiplier = 0.7;

    window.setTimeout(() => {
      onComplete(multiplier);
    }, 1000);
  }, [score, total, onComplete]);

  const handleTimeout = useCallback(() => {
    setResult('wrong');
    setTotal(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate([30, 30]);
    window.setTimeout(() => {
      setProductIndex(prev => prev + 1);
    }, 500);
  }, []);

  // For random products, pre-determine if they are real or fake for this session
  useEffect(() => {
    const randomMap = new Map<number, boolean>();
    shuffledProducts.forEach(product => {
      if (product.type === 'random') {
        randomMap.set(product.id, Math.random() < 0.5);
      }
    });
    setIsRealForRandom(randomMap);
  }, [shuffledProducts]);

  // Main game loop effect
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

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIndex, shuffledProducts]);

  const isProductReal = (product: SwipeItem): boolean => {
    if (product.type === 'real') return true;
    if (product.type === 'fake') return false;
    return isRealForRandom.get(product.id) ?? false;
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!gameActive || !currentProduct || result !== null) return;

    if (timerRef.current) window.clearInterval(timerRef.current);

    const isReal = isProductReal(currentProduct);
    const isCorrect = (direction === 'right' && isReal) || (direction === 'left' && !isReal);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setResult('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }

    setTotal(prev => prev + 1);

    window.setTimeout(() => {
      setProductIndex(prev => prev + 1);
    }, 400);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current !== null) {
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - touchStart.current;
      setOffset(Math.min(Math.max(diff, -100), 100));
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
      <div className="absolute top-8 left-0 right-0 text-center">
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{instruction}</div>
        <div className="text-2xl font-black text-white italic uppercase">{title}</div>
        <div className="flex justify-center gap-12 mt-4">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase">UNITS</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{score}/{total}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase">PRECISION</div>
            <div className="text-xl font-bold text-blue-400 font-mono">{accuracy}%</div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentProduct && gameActive && (
          <motion.div
            key={productIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: offset, rotate: offset * 0.1 }}
            exit={{ x: offset > 0 ? 300 : -300, opacity: 0, scale: 0.5 }}
            className={`w-full max-relative max-w-sm bg-slate-900 rounded-3xl p-10 text-center border-4 shadow-2xl transition-colors duration-200 ${
              result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
              result === 'wrong' ? 'border-red-500 bg-red-500/10' :
              'border-slate-800'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          <div className="text-7xl mb-6 filter drop-shadow-xl">{icon}</div>
            <div className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">{currentProduct.name}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-8">
            Swipe <span className="text-emerald-500">RIGHT</span> for {rightLabel}<br/>
            Swipe <span className="text-red-500">LEFT</span> for {leftLabel}
            </div>

            <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / currentProduct.timeLimit) * 100}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>
            <div className="text-[8px] text-slate-600 mt-2 font-mono font-bold tracking-widest">{timeLeft.toFixed(2)}s</div>
          </motion.div>
        )}
      </AnimatePresence>

      {!gameActive && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-4">{accuracy >= 70 ? '💰' : accuracy >= 50 ? '📦' : '❌'}</div>
          <div className="text-3xl font-black text-white mb-2">{accuracy}% ACCURACY</div>
          <div className={`text-xs font-bold uppercase tracking-widest ${accuracy >= 70 ? 'text-emerald-500' : 'text-slate-500'}`}>
            {accuracy >= 90 ? 'PERFECT SHIPMENT! 5x Yield' :
             accuracy >= 70 ? 'Excellent Fulfillment! 2.5x Yield' :
             accuracy >= 50 ? 'Standard Service. 1.5x Yield' :
             accuracy >= 30 ? 'High Refund Rate. 1x Yield' :
             'Logistics Failure. 0.7x Yield'}
          </div>
        </div>
      )}

      {gameActive && (
        <div className="absolute bottom-12 left-0 right-0 px-8">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-1 opacity-40">
               <motion.div animate={{ x: [-5, 0, -5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl">⬅️</motion.div>
               <span className="text-[10px] font-black text-red-500 uppercase">{leftLabel}</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
               <motion.div animate={{ x: [5, 0, 5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl">➡️</motion.div>
               <span className="text-[10px] font-black text-emerald-500 uppercase">{rightLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
