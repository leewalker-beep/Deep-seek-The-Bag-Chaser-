import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface MarketPredictorProps {
  onComplete: (multiplier: number) => void;
  playerBid: number;
  rivalBid: number;
  onOutbid: (amount: number) => void;
  level?: number;
  tier?: Tier;
}

export const MarketPredictor: React.FC<MarketPredictorProps> = ({
  onComplete,
  playerBid: initialPlayerBid,
  rivalBid: initialRivalBid,
  onOutbid,
  level = 1,
  tier = 'MUD'
}) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [marketValue, setMarketValue] = useState(initialPlayerBid * 1.5);
  const [currentRivalBid, setCurrentRivalBid] = useState(initialRivalBid);
  const [currentPlayerBid, setCurrentPlayerBid] = useState(initialPlayerBid);
  const [gameState, setGameState] = useState<'PLAYING' | 'ENDED'>('PLAYING');
  const [feedback, setFeedback] = useState<'bid' | 'rival' | null>(null);

  const timerRef = useRef<number | null>(null);
  const marketRef = useRef<number | null>(null);
  const rivalRef = useRef<number | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Fluctuating market value
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    marketRef.current = window.setInterval(() => {
      // More volatility at higher scaling
      setMarketValue(prev => {
        const volatility = 0.15 * scaling;
        const change = (Math.random() - 0.45) * (initialPlayerBid * volatility);
        return Math.max(initialPlayerBid * 0.5, prev + change);
      });
    }, 400);

    return () => {
      if (marketRef.current) window.clearInterval(marketRef.current);
    };
  }, [gameState, initialPlayerBid]);

  // AI Rival Bidding Logic
  const playerBidRef = useRef(currentPlayerBid);
  useEffect(() => { playerBidRef.current = currentPlayerBid; }, [currentPlayerBid]);

  const rivalBidRef = useRef(currentRivalBid);
  useEffect(() => { rivalBidRef.current = currentRivalBid; }, [currentRivalBid]);

  const marketValueRef = useRef(marketValue);
  useEffect(() => { marketValueRef.current = marketValue; }, [marketValue]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    rivalRef.current = window.setInterval(() => {
      // Rival aggressive at high scaling
      const outbidChance = 0.3 + (scaling * 0.1);
      if (playerBidRef.current >= rivalBidRef.current && Math.random() < outbidChance) {
        const outbidAmount = playerBidRef.current + (initialPlayerBid * (0.05 + scaling * 0.03));
        if (outbidAmount < marketValueRef.current * (1.1 + scaling * 0.1)) {
          setCurrentRivalBid(outbidAmount);
          onOutbid(outbidAmount);
          setFeedback('rival');
          setTimeout(() => setFeedback(null), 300);
          if (navigator.vibrate) navigator.vibrate([30, 20]);
        }
      }
    }, 1800);

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
  const finalMultiplier = useMemo(() => {
      const won = currentPlayerBid > currentRivalBid;
      const overpaid = currentPlayerBid > marketValue;

      if (!won) return 0.5;

      let base = overpaid ? 1.2 : 2.5;
      return (base + scaling * 0.5);
  }, [currentPlayerBid, currentRivalBid, marketValue, scaling]);

  useEffect(() => {
    if (gameState === 'ENDED') {
      if (navigator.vibrate) {
          const won = currentPlayerBid > currentRivalBid;
          navigator.vibrate(won ? 100 : 50);
      }

      const timer = window.setTimeout(() => {
        onComplete(finalMultiplier);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, onComplete, finalMultiplier, currentPlayerBid, currentRivalBid]);

  const handleBid = (amount: number) => {
    if (gameState !== 'PLAYING') return;
    setCurrentPlayerBid(prev => prev + amount);
    setFeedback('bid');
    setTimeout(() => setFeedback(null), 200);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-200 bg-slate-950 flex flex-col items-center justify-center p-4 z-[100] font-mono ${
        feedback === 'bid' ? 'bg-emerald-950/20' : feedback === 'rival' ? 'bg-red-950/20' : 'bg-slate-950'
    }`}>
      <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 animate-pulse" />

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">MOGUL TIER AUCTION</div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">BIDDING WAR</h2>
          </div>
          <div className={`text-3xl font-black font-mono px-3 py-1 rounded-xl border-2 transition-colors duration-300 ${
              timeLeft < 4 ? 'text-red-500 border-red-500/50 bg-red-500/10 animate-pulse' : 'text-slate-400 border-slate-800'
          }`}>
            {timeLeft}s
          </div>
        </div>

        {/* Market Value Display */}
        <div className="bg-black/60 border-2 border-slate-800 rounded-2xl p-8 mb-8 text-center relative overflow-hidden group">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">TARGET ASSET VALUE</div>
          <motion.div
            key={marketValue}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] font-mono"
          >
            ${Math.floor(marketValue).toLocaleString()}
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500/20">
              <motion.div
                className="h-full bg-blue-500"
                animate={{ x: [-100, 400] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                style={{ width: '100px' }}
              />
          </div>
        </div>

        {/* Bids Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border-2 transition-all duration-300 relative ${currentPlayerBid > currentRivalBid ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-800 bg-black/40'}`}>
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">YOUR BID</div>
            <div className={`text-xl font-black font-mono ${currentPlayerBid > currentRivalBid ? 'text-emerald-400' : 'text-white'}`}>
                ${currentPlayerBid.toLocaleString()}
            </div>
            {currentPlayerBid > marketValue && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -top-2 -right-2 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase"
              >
                  Overpaying
              </motion.div>
            )}
          </div>

          <div className={`p-5 rounded-2xl border-2 transition-all duration-300 relative ${currentRivalBid >= currentPlayerBid ? 'border-red-500 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-800 bg-black/40'}`}>
            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">RIVAL BID</div>
            <div className={`text-xl font-black font-mono ${currentRivalBid >= currentPlayerBid ? 'text-red-400' : 'text-white'}`}>
                ${currentRivalBid.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {gameState === 'PLAYING' ? (
          <div className="grid grid-cols-3 gap-3">
            {[0.05, 0.1, 0.25].map(mult => (
              <button
                key={mult}
                onPointerDown={() => handleBid(initialPlayerBid * mult)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-90 text-white py-4 rounded-xl font-black text-xs transition-all border-b-4 border-slate-950 uppercase tracking-tighter"
              >
                +{(mult * 100)}%
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className={`text-3xl font-black uppercase italic tracking-tighter ${currentPlayerBid > currentRivalBid ? 'text-emerald-400' : 'text-red-500'}`}>
              {currentPlayerBid > currentRivalBid ? (currentPlayerBid > marketValue ? 'WON (OVERPAID)' : 'AUCTION VICTORY!') : 'OUTBID!'}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 text-[10px] text-slate-600 text-center font-black uppercase tracking-[0.2em] max-w-xs leading-relaxed opacity-50">
        BEAT THE RIVAL'S BID WITHOUT OVERPAYING<br/>
        CLOSEST TO ASSET VALUE WINS MAX YIELD
      </div>
    </div>
  );
};
