import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BoardroomBattleProps {
  onComplete: (multiplier: number) => void;
  playerBid: number;
  rivalBid: number;
  onOutbid: (amount: number) => void;
}

export const BoardroomBattle: React.FC<BoardroomBattleProps> = ({
  onComplete,
  playerBid: initialPlayerBid,
  rivalBid: initialRivalBid,
  onOutbid
}) => {
  const [timeLeft, setTimeLeft] = useState(12);
  const [currentPlayerBid, setCurrentPlayerBid] = useState(initialPlayerBid);
  const [currentRivalBid, setCurrentRivalBid] = useState(initialRivalBid);
  const [playerPower, setPlayerPower] = useState(0); // 0 to 100
  const [gameState, setGameState] = useState<'PLAYING' | 'ENDED'>('PLAYING');

  const timerRef = useRef<number | null>(null);
  const rivalRef = useRef<number | null>(null);
  const decayRef = useRef<number | null>(null);

  // AI Rival Logic - FIXED: Using functional updates and refs to avoid interval churn
  const playerBidRef = useRef(currentPlayerBid);
  useEffect(() => { playerBidRef.current = currentPlayerBid; }, [currentPlayerBid]);

  const rivalBidRef = useRef(currentRivalBid);
  useEffect(() => { rivalBidRef.current = currentRivalBid; }, [currentRivalBid]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    rivalRef.current = window.setInterval(() => {
      if (playerBidRef.current >= rivalBidRef.current && Math.random() < 0.4) {
        const outbidAmount = playerBidRef.current + (initialPlayerBid * 0.1);
        setCurrentRivalBid(outbidAmount);
        onOutbid(outbidAmount);
      }
    }, 1500);

    return () => {
      if (rivalRef.current) window.clearInterval(rivalRef.current);
    };
  }, [gameState, initialPlayerBid, onOutbid]);

  // Power Decay Logic
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    decayRef.current = window.setInterval(() => {
      setPlayerPower(prev => Math.max(0, prev - 2.5));
    }, 100);

    return () => {
      if (decayRef.current) window.clearInterval(decayRef.current);
    };
  }, [gameState]);

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
      const won = currentPlayerBid > currentRivalBid;
      let multiplier = won ? 4.0 : 0.5;

      const timer = window.setTimeout(() => {
        onComplete(multiplier);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState, currentPlayerBid, currentRivalBid, onComplete]);

  const handleTap = () => {
    if (gameState !== 'PLAYING') return;

    setPlayerPower(prev => {
      const next = Math.min(100, prev + 8);
      if (next >= 100) {
        // Power full! Auto-bid
        setCurrentPlayerBid(curr => curr + (initialPlayerBid * 0.15));
        return 0; // Reset power
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-[100] font-mono">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        {/* Boardroom background effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" />

        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Boardroom Battle</div>
            <div className="text-2xl font-black text-white">Hostile Takeover</div>
          </div>
          <div className={`text-3xl font-black ${timeLeft < 4 ? 'text-red-500 animate-bounce' : 'text-slate-400'}`}>
            {timeLeft}s
          </div>
        </div>

        {/* Rival Battle Visual */}
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">💼</div>
            <div className="text-[8px] text-slate-500 uppercase font-bold mb-1">Your Bid</div>
            <div className="text-lg font-black text-white truncate">${currentPlayerBid.toLocaleString()}</div>
          </div>
          <div className="text-2xl font-black text-slate-700">VS</div>
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">🧛</div>
            <div className="text-[8px] text-slate-500 uppercase font-bold mb-1">Rival Bid</div>
            <div className="text-lg font-black text-white truncate">${currentRivalBid.toLocaleString()}</div>
          </div>
        </div>

        {/* Power Meter */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Influence Power</div>
            <div className="text-xs font-black text-blue-400">{Math.floor(playerPower)}%</div>
          </div>
          <div className="h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${playerPower}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>
          <div className="text-[8px] text-slate-600 mt-2 text-center uppercase tracking-tighter">
            Tap rapidly to build influence and increase your bid
          </div>
        </div>

        {/* Tap Button */}
        {gameState === 'PLAYING' ? (
          <button
            onPointerDown={handleTap}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-90 py-8 rounded-2xl border-b-4 border-blue-800 transition-all group"
          >
            <div className="text-xl font-black text-white uppercase tracking-widest group-active:translate-y-1">
              DOMINATE
            </div>
          </button>
        ) : (
          <div className="text-center py-8">
            <div className={`text-3xl font-black uppercase italic ${currentPlayerBid > currentRivalBid ? 'text-emerald-400' : 'text-red-500'}`}>
              {currentPlayerBid > currentRivalBid ? 'Board Secured' : 'Takeover Failed'}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-[10px] text-slate-500 text-center uppercase tracking-widest max-w-xs leading-relaxed">
        Hammer the button to build influence. Every time the meter fills, you'll automatically raise your bid.
      </div>
    </div>
  );
};
