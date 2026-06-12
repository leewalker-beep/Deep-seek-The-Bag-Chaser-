import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MarketPredictorProps {
  onComplete: (multiplier: number) => void;
  playerBid: number;
  rivalBid: number;
  onOutbid: (amount: number) => void;
}

export const MarketPredictor: React.FC<MarketPredictorProps> = ({
  onComplete,
  playerBid: initialPlayerBid,
  rivalBid: initialRivalBid,
  onOutbid
}) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [marketValue, setMarketValue] = useState(initialPlayerBid * 1.5);
  const [currentRivalBid, setCurrentRivalBid] = useState(initialRivalBid);
  const [currentPlayerBid, setCurrentPlayerBid] = useState(initialPlayerBid);
  const [gameState, setGameState] = useState<'PLAYING' | 'ENDED'>('PLAYING');

  const timerRef = useRef<number | null>(null);
  const marketRef = useRef<number | null>(null);
  const rivalRef = useRef<number | null>(null);

  // Fluctuating market value
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    marketRef.current = window.setInterval(() => {
      setMarketValue(prev => {
        const change = (Math.random() - 0.45) * (initialPlayerBid * 0.1);
        return Math.max(initialPlayerBid * 0.5, prev + change);
      });
    }, 500);

    return () => {
      if (marketRef.current) window.clearInterval(marketRef.current);
    };
  }, [gameState, initialPlayerBid]);

  // AI Rival Bidding Logic - FIXED: Using functional updates and refs to avoid interval churn
  const playerBidRef = useRef(currentPlayerBid);
  useEffect(() => { playerBidRef.current = currentPlayerBid; }, [currentPlayerBid]);

  const rivalBidRef = useRef(currentRivalBid);
  useEffect(() => { rivalBidRef.current = currentRivalBid; }, [currentRivalBid]);

  const marketValueRef = useRef(marketValue);
  useEffect(() => { marketValueRef.current = marketValue; }, [marketValue]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    rivalRef.current = window.setInterval(() => {
      if (playerBidRef.current >= rivalBidRef.current && Math.random() < 0.3) {
        const outbidAmount = playerBidRef.current + (initialPlayerBid * 0.05);
        if (outbidAmount < marketValueRef.current * 1.2) {
          setCurrentRivalBid(outbidAmount);
          onOutbid(outbidAmount);
        }
      }
    }, 2000);

    return () => {
      if (rivalRef.current) window.clearInterval(rivalRef.current);
    };
  }, [gameState, initialPlayerBid, onOutbid]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ENDED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle game end
  useEffect(() => {
    if (gameState === 'ENDED') {
      let multiplier = 1.0;

      const won = currentPlayerBid > currentRivalBid;
      const overpaid = currentPlayerBid > marketValue;

      if (won) {
        if (overpaid) {
          multiplier = 1.5; // Won but overpaid
        } else {
          multiplier = 4.0; // Perfect win
        }
      } else {
        multiplier = 0.5; // Lost to rival
      }

      const timer = window.setTimeout(() => {
        onComplete(multiplier);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentPlayerBid, currentRivalBid, marketValue, onComplete]);

  const handleBid = (amount: number) => {
    if (gameState !== 'PLAYING') return;
    setCurrentPlayerBid(prev => prev + amount);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-[100] font-mono">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        {/* Background Pulse */}
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Market Predictor</div>
            <div className="text-2xl font-black text-white">Bidding War</div>
          </div>
          <div className={`text-3xl font-black ${timeLeft < 4 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`}>
            {timeLeft}s
          </div>
        </div>

        {/* Market Value Display */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-6 text-center">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Target Asset Value</div>
          <motion.div
            key={marketValue}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black text-blue-400"
          >
            ${Math.floor(marketValue).toLocaleString()}
          </motion.div>
        </div>

        {/* Bids Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-xl border-2 transition-all ${currentPlayerBid > currentRivalBid ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}>
            <div className="text-[8px] text-slate-500 uppercase mb-1">Your Bid</div>
            <div className="text-xl font-bold text-white">${currentPlayerBid.toLocaleString()}</div>
            {currentPlayerBid > marketValue && (
              <div className="text-[8px] text-red-500 font-bold mt-1 uppercase">Overpaying!</div>
            )}
          </div>
          <div className={`p-4 rounded-xl border-2 transition-all ${currentRivalBid >= currentPlayerBid ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-950'}`}>
            <div className="text-[8px] text-slate-500 uppercase mb-1">Rival Bid</div>
            <div className="text-xl font-bold text-white">${currentRivalBid.toLocaleString()}</div>
          </div>
        </div>

        {/* Action Buttons */}
        {gameState === 'PLAYING' ? (
          <div className="grid grid-cols-3 gap-2">
            {[0.05, 0.1, 0.25].map(mult => (
              <button
                key={mult}
                onClick={() => handleBid(initialPlayerBid * mult)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white py-3 rounded-lg font-bold text-xs transition-all border border-slate-700"
              >
                +{(mult * 100)}%
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className={`text-2xl font-black uppercase italic ${currentPlayerBid > currentRivalBid ? 'text-emerald-400' : 'text-red-500'}`}>
              {currentPlayerBid > currentRivalBid ? (currentPlayerBid > marketValue ? 'Won (Overpaid)' : 'Victory!') : 'Outbid!'}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-[10px] text-slate-500 text-center uppercase tracking-widest max-w-xs">
        Win by outbidding the rival while staying as close to the target asset value as possible.
      </div>
    </div>
  );
};
