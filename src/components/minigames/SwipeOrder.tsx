import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

export interface SwipeItem {
  id: number;
  name: string;
  type: 'real' | 'fake' | 'random';
  timeLimit: number;
}

export interface EnrichedSwipeItem extends SwipeItem {
  isRealResolved: boolean;
  price: string;
  seller: string;
  serial: string;
  verifiedStatus: 'unverified' | 'authentic' | 'scam';
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

export const calculateDropshippingGrade = (
  accuracy: number,
  tokensUsed: number
): 'Chargeback Hell' | 'Niche Store' | 'Viral Scaler' | 'E-Com Kingpin' => {
  if (accuracy >= 0.90 && tokensUsed === 0) {
    return 'E-Com Kingpin';
  }
  if (accuracy >= 0.75) {
    return 'Viral Scaler';
  }
  if (accuracy >= 0.50) {
    return 'Niche Store';
  }
  return 'Chargeback Hell';
};

interface SwipeOrderProps {
  onComplete: (multiplier: number) => void;
  title?: string;
  instruction?: string;
  leftLabel?: string;
  rightLabel?: string;
  icon?: string;
  items?: SwipeItem[];
  level?: number;
  tier?: Tier;
}

export const SwipeOrder: React.FC<SwipeOrderProps> = ({
  onComplete,
  title = "SORT THE GOODS",
  instruction = "QUALITY CONTROL",
  leftLabel = "FAKE",
  rightLabel = "REAL",
  icon = "📦",
  items = PRODUCTS,
  level = 1,
  tier = 'MUD'
}) => {
  const [backlog, setBacklog] = useState<EnrichedSwipeItem[]>([]);
  const [shuffledPointer, setShuffledPointer] = useState(0);

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [backlogOverflowCount, setBacklogOverflowCount] = useState(0);

  const [gameActive, setGameActive] = useState(true);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  // Verify Tokens State
  const maxTokens = useMemo(() => Math.max(1, 4 - level), [level]);
  const [tokensLeft, setTokensLeft] = useState(maxTokens);
  const [tokensUsed, setTokensUsed] = useState(0);

  const touchStart = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Centralized Scaling & Timer Factor
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  const maxBacklogCapacity = 6;
  const spawnRate = (5 - level * 0.8) * timerFactor; // scales with level and timer factor

  const timeLimit = useMemo(() => Math.max(0.4, 2.2 * timerFactor), [timerFactor]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Limit orders pool size
  const productsToInspect = useMemo(() => Math.min(25, 8 + (level * 2) + Math.floor(scaling * 2)), [level, scaling]);

  // Shuffle products once at start
  const shuffledProducts = useMemo(() => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, productsToInspect);
  }, [items, productsToInspect]);

  // Helper to generate enriched product attributes (Subtle Tells)
  const enrichItem = useCallback((item: SwipeItem): EnrichedSwipeItem => {
    const isRealResolved = item.type === 'real' ? true :
                         item.type === 'fake' ? false :
                         Math.random() < 0.5;

    let price = '';
    let seller = '';
    let serial = '';

    const basePrice = 100 + (item.id * 15) + (level * 100);

    // Subtle price ending, seller status, serial tells
    if (isRealResolved) {
      const cents = Math.random() < 0.5 ? '.00' : '.95';
      price = `$${basePrice.toLocaleString()}${cents}`;
      seller = Math.random() < 0.5 ? 'Authorized Boutique' : 'Verified Logistics Hub';
      serial = `SN-${item.id}42-OK`;
    } else {
      const cents = Math.random() < 0.5 ? '.99' : '.98';
      price = `$${basePrice.toLocaleString()}${cents}`;
      seller = Math.random() < 0.5 ? 'Gray Market Liquidator' : 'Unverified Merchant';
      if (Math.random() < 0.4) {
        seller = 'Verified  Partner'; // Double-space typo
      }
      serial = `SN-${item.id}42-FK`;
    }

    return {
      ...item,
      isRealResolved,
      price,
      seller,
      serial,
      verifiedStatus: 'unverified'
    };
  }, [level]);

  // Handle Verify Action
  const handleVerify = () => {
    if (!gameActive || tokensLeft <= 0 || backlog.length === 0) return;
    const activeItem = backlog[0];
    if (activeItem.verifiedStatus !== 'unverified') return;

    setTokensLeft(prev => prev - 1);
    setTokensUsed(prev => prev + 1);

    setBacklog(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        verifiedStatus: updated[0].isRealResolved ? 'authentic' : 'scam'
      };
      return updated;
    });

    if (navigator.vibrate) navigator.vibrate(25);
  };

  // Populate first 2 orders at start
  useEffect(() => {
    if (shuffledProducts.length > 0 && backlog.length === 0 && shuffledPointer === 0) {
      const initialItems: EnrichedSwipeItem[] = [];
      const numToPopulate = Math.min(2, shuffledProducts.length);
      for (let i = 0; i < numToPopulate; i++) {
        initialItems.push(enrichItem(shuffledProducts[i]));
      }
      setBacklog(initialItems);
      setShuffledPointer(numToPopulate);
    }
  }, [shuffledProducts, enrichItem, backlog.length, shuffledPointer]);

  // End Game Resolution
  const endGame = useCallback((finalScore: number, finalTotal: number) => {
    setGameActive(false);
    const accuracy = finalTotal > 0 ? finalScore / finalTotal : 0;

    let baseMultiplier = 0.7;
    if (accuracy >= 0.9) baseMultiplier = 3.5;
    else if (accuracy >= 0.7) baseMultiplier = 2.0;
    else if (accuracy >= 0.5) baseMultiplier = 1.2;
    else if (accuracy >= 0.3) baseMultiplier = 0.8;
    else baseMultiplier = 0.5;

    // Adjust based on game difficulty scaling
    const multiplier = baseMultiplier * (0.8 + scaling * 0.2);

    window.setTimeout(() => {
      onComplete(multiplier);
    }, 2000);
  }, [onComplete, scaling]);

  // Timeout handler for active order
  const handleTimeout = useCallback(() => {
    if (!gameActive || backlog.length === 0) return;
    setResult('wrong');
    setTotal(prev => prev + 1);

    if (navigator.vibrate) navigator.vibrate([30, 30]);

    window.setTimeout(() => {
      setBacklog(prev => {
        const nextBacklog = prev.slice(1);
        if (nextBacklog.length === 0 && shuffledPointer >= shuffledProducts.length) {
          endGame(score, total + 1);
        }
        return nextBacklog;
      });
      setResult(null);
    }, 500);
  }, [gameActive, backlog.length, shuffledPointer, shuffledProducts.length, score, total, endGame]);

  // Spawn backlog orders periodically
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      setShuffledPointer(pointer => {
        if (pointer >= shuffledProducts.length) {
          clearInterval(spawnInterval);
          return pointer;
        }

        const nextItem = enrichItem(shuffledProducts[pointer]);

        setBacklog(prevBacklog => {
          if (prevBacklog.length >= maxBacklogCapacity) {
            // BACKLOG OVERFLOW PENALTY!
            setBacklogOverflowCount(o => o + 1);
            setTotal(t => t + 1); // Discard counts as a resolution (missed)

            if (navigator.vibrate) navigator.vibrate([40, 20, 40]);

            // Discard oldest active order, push the new one
            return [...prevBacklog.slice(1), nextItem];
          } else {
            return [...prevBacklog, nextItem];
          }
        });

        return pointer + 1;
      });
    }, spawnRate * 1000);

    return () => clearInterval(spawnInterval);
  }, [gameActive, spawnRate, shuffledProducts, enrichItem]);

  // Game active timer tracking
  useEffect(() => {
    if (backlog.length > 0 && gameActive) {
      setTimeLeft(timeLimit);
      setResult(null);
      setOffset(0);

      if (timerRef.current) window.clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          handleTimeout();
        }
      }, 50);
    } else if (backlog.length === 0 && shuffledPointer >= shuffledProducts.length && gameActive) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      endGame(score, total);
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [backlog.length, shuffledPointer, shuffledProducts.length, gameActive, handleTimeout, timeLimit, score, total, endGame]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!gameActive || backlog.length === 0 || result !== null) return;

    if (timerRef.current) window.clearInterval(timerRef.current);

    const activeItem = backlog[0];
    const isCorrect = (direction === 'right' && activeItem.isRealResolved) ||
                      (direction === 'left' && !activeItem.isRealResolved);

    let nextScore = score;
    if (isCorrect) {
      nextScore = score + 1;
      setScore(prev => prev + 1);
      setResult('correct');
      if (navigator.vibrate) navigator.vibrate(20);
    } else {
      setResult('wrong');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }

    const nextTotal = total + 1;
    setTotal(prev => prev + 1);

    window.setTimeout(() => {
      setBacklog(prev => {
        const nextBacklog = prev.slice(1);
        if (nextBacklog.length === 0 && shuffledPointer >= shuffledProducts.length) {
          endGame(nextScore, nextTotal);
        }
        return nextBacklog;
      });
      setResult(null);
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

  const activeItem = backlog[0];
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = calculateDropshippingGrade(total > 0 ? score / total : 0, tokensUsed);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      {/* Top HUD */}
      <div className="absolute top-4 left-0 right-0 text-center">
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{instruction}</div>
        <div className="text-2xl font-black text-white italic uppercase">{title} <span className="text-emerald-500 text-xs">L{level}</span></div>
        <div className="flex justify-center gap-8 mt-2">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase">PROCESSED</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{score}/{total}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase">ACCURACY</div>
            <div className="text-lg font-bold text-blue-400 font-mono">{accuracy}%</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-bold uppercase">VERIFY TOKENS</div>
            <div className={`text-lg font-bold font-mono ${tokensLeft > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
              {'🎟️'.repeat(tokensLeft) || '❌'} ({tokensLeft}/{maxTokens})
            </div>
          </div>
        </div>

        {/* Backlog visible queue indicator */}
        <div className="mt-2 max-w-xs mx-auto">
          <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase mb-0.5">
            <span>Backlog Queue</span>
            <span className={backlog.length >= maxBacklogCapacity - 1 ? 'text-red-500 font-black animate-pulse' : 'text-slate-400'}>
              {backlog.length}/{maxBacklogCapacity} {backlog.length >= maxBacklogCapacity ? '(OVERFLOWING!)' : ''}
            </span>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-full flex gap-0.5 overflow-hidden p-0.5">
            {Array.from({ length: maxBacklogCapacity }).map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-full rounded-sm transition-colors duration-200 ${
                  idx < backlog.length
                    ? backlog.length >= maxBacklogCapacity - 1
                      ? 'bg-red-500'
                      : 'bg-indigo-500'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          {backlogOverflowCount > 0 && (
            <div className="text-[8px] text-red-500 font-bold uppercase tracking-wider mt-0.5">
              ⚠️ {backlogOverflowCount} order(s) lost to backlog overflow!
            </div>
          )}
        </div>
      </div>

      {/* Main Order Card */}
      <div className="relative w-full max-w-sm flex justify-center items-center h-[360px] mt-12">
        <AnimatePresence mode="wait">
          {activeItem && gameActive && (
            <motion.div
              key={activeItem.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: offset, rotate: offset * 0.1 }}
              exit={{ x: offset > 0 ? 300 : -300, opacity: 0, scale: 0.5 }}
              className={`w-full bg-slate-900 rounded-3xl p-6 text-center border-4 shadow-2xl transition-colors duration-200 relative ${
                result === 'correct' ? 'border-emerald-500 bg-emerald-500/10' :
                result === 'wrong' ? 'border-red-500 bg-red-500/10' :
                'border-slate-800'
              }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Verification Status Overlay Badge */}
              {activeItem.verifiedStatus !== 'unverified' && (
                <div className={`absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider z-10 border ${
                  activeItem.verifiedStatus === 'authentic'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {activeItem.verifiedStatus === 'authentic' ? '✅ VERIFIED AUTHENTIC' : '❌ VERIFIED SCAM'}
                </div>
              )}

              <div className="text-5xl mt-2 mb-4 filter drop-shadow-xl">{icon}</div>
              <div data-testid="active-brand-name" className="text-2xl font-black text-white mb-1 tracking-tighter uppercase">{activeItem.name}</div>

              {/* Enhanced Order Details for Level 2 & 3 (Subtle Tells) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-4 space-y-1 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px]">Price:</span>
                  <span className="font-mono text-slate-200 font-black">{activeItem.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px]">Seller:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[160px]">{activeItem.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[9px]">Serial:</span>
                  <span className="font-mono text-slate-200 font-bold">{activeItem.serial}</span>
                </div>
              </div>

              {/* Verification Button inside Card */}
              {activeItem.verifiedStatus === 'unverified' && (
                <button
                  onClick={handleVerify}
                  disabled={tokensLeft <= 0}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all mb-4 ${
                    tokensLeft > 0
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  🔍 Verify Order ({tokensLeft} Left)
                </button>
              )}

              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">
                Swipe <span className="text-emerald-500">RIGHT</span> for {rightLabel}<br/>
                Swipe <span className="text-red-500">LEFT</span> for {leftLabel}
              </div>

              <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                  transition={{ ease: "linear", duration: 0.05 }}
                />
              </div>
              <div className="text-[8px] text-slate-600 mt-1 font-mono font-bold tracking-widest">{timeLeft.toFixed(2)}s</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Graded Outcome Screen */}
      {!gameActive && (
        <div className="text-center animate-in fade-in zoom-in duration-500 bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full mx-4 relative z-[110]">
          <div className="text-6xl mb-4">📦</div>
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">FULFILLMENT SUMMARY</div>

          <div className="text-3xl font-black text-white tracking-tighter mb-1 uppercase italic">{grade}</div>
          <div className={`text-[10px] font-black uppercase tracking-widest mb-6 ${
            grade === 'E-Com Kingpin' ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' :
            grade === 'Viral Scaler' ? 'text-emerald-400' :
            grade === 'Niche Store' ? 'text-blue-400' :
            'text-red-500'
          }`}>
            {grade === 'E-Com Kingpin' ? 'PERFECT SCISSOR-CLEAN OPERATION!' :
             grade === 'Viral Scaler' ? 'Excellent Scaling Capacity!' :
             grade === 'Niche Store' ? 'Steady Niche Delivery.' :
             'High Refund & Chargeback Rates.'}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Processed Score:</span>
              <span className="font-mono text-white font-bold">{score}/{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Fulfillment Accuracy:</span>
              <span className="font-mono text-blue-400 font-bold">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Verify Tokens Used:</span>
              <span className="font-mono text-amber-400 font-bold">{tokensUsed} / {maxTokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase text-[9px] font-bold">Backlog Overflows:</span>
              <span className={`font-mono font-bold ${backlogOverflowCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {backlogOverflowCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Swipe Directions HUD */}
      {gameActive && backlog.length > 0 && (
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-1 opacity-40">
               <motion.div animate={{ x: [-5, 0, -5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl">⬅️</motion.div>
               <span className="text-[10px] font-black text-red-500 uppercase">{leftLabel}</span>
            </div>
            <button
              onClick={() => handleSwipe('left')}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95"
            >
              Reject
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95"
            >
              Approve
            </button>
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
