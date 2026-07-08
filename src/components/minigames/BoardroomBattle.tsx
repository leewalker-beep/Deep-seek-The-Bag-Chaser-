import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface BoardroomBattleProps {
  onComplete: (multiplier: number) => void;
  playerBid: number;
  rivalBid: number;
  onOutbid: (amount: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instruction?: string;
  icon?: string;
  scoreLabel?: string;
  accentColor?: string;
}

export const BoardroomBattle: React.FC<BoardroomBattleProps> = ({
  onComplete,
  playerBid: initialPlayerBid,
  rivalBid: initialRivalBid,
  onOutbid,
  level = 1,
  tier = 'MUD',
  title = "Hostile Takeover",
  instruction = "NEGOTIATION POWER",
  icon = "💼",
  scoreLabel = "BID",
  accentColor = "blue"
}) => {
  const [timeLeft, setTimeLeft] = useState(12);
  const [currentPlayerBid, setCurrentPlayerBid] = useState(initialPlayerBid);
  const [currentRivalBid, setCurrentRivalBid] = useState(initialRivalBid);
  const [playerPower, setPlayerPower] = useState(0); // 0 to 100
  const [gameState, setGameState] = useState<'PLAYING' | 'ENDED'>('PLAYING');
  const [feedback, setFeedback] = useState<'bid' | 'rival' | null>(null);

  const timerRef = useRef<number | null>(null);
  const rivalRef = useRef<number | null>(null);
  const decayRef = useRef<number | null>(null);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // AI Rival Logic
  const playerBidRef = useRef(currentPlayerBid);
  useEffect(() => { playerBidRef.current = currentPlayerBid; }, [currentPlayerBid]);

  const rivalBidRef = useRef(currentRivalBid);
  useEffect(() => { rivalBidRef.current = currentRivalBid; }, [currentRivalBid]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    rivalRef.current = window.setInterval(() => {
      // Rival outbids more frequently at higher scaling
      const outbidChance = 0.3 + (scaling * 0.1);
      if (playerBidRef.current >= rivalBidRef.current && Math.random() < outbidChance) {
        const outbidAmount = playerBidRef.current + (initialPlayerBid * (0.05 + scaling * 0.05));
        setCurrentRivalBid(outbidAmount);
        onOutbid(outbidAmount);
        setFeedback('rival');
        setTimeout(() => setFeedback(null), 300);
        if (navigator.vibrate) navigator.vibrate([30, 20]);
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
      // Faster decay at higher scaling
      setPlayerPower(prev => Math.max(0, prev - (2.0 * scaling)));
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
  const finalMultiplier = useMemo(() => {
      const won = currentPlayerBid > currentRivalBid;
      if (!won) return 0.5;
      // Multiplier increases with scaling and time left
      return (1.5 + scaling * 0.5) * (1 + (timeLeft / 20));
  }, [currentPlayerBid, currentRivalBid, scaling, timeLeft]);

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

  const handleTap = () => {
    if (gameState !== 'PLAYING') return;

    setPlayerPower(prev => {
      const next = Math.min(100, prev + 12);
      if (navigator.vibrate) navigator.vibrate(10);
      if (next >= 100) {
        setCurrentPlayerBid(curr => curr + (initialPlayerBid * 0.15));
        setFeedback('bid');
        setTimeout(() => setFeedback(null), 300);
        if (navigator.vibrate) navigator.vibrate(40);
        return 0;
      }
      return next;
    });
  };

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 from-blue-600 bg-blue-600 border-blue-900 to-blue-600',
    emerald: 'text-emerald-400 from-emerald-600 bg-emerald-600 border-emerald-900 to-emerald-600',
    purple: 'text-purple-400 from-purple-600 bg-purple-600 border-purple-900 to-purple-600',
    amber: 'text-amber-400 from-amber-600 bg-amber-600 border-amber-900 to-amber-600',
  };

  const colors = colorMap[accentColor] || colorMap.blue;
  const [cText, cFrom, cBtn, cBtnBorder, cTo] = colors.split(' ');

  return (
    <div className={`fixed inset-0 transition-colors duration-200 bg-slate-950 flex flex-col items-center justify-center p-4 z-[100] font-mono ${
        feedback === 'bid' ? 'bg-emerald-950/20' : feedback === 'rival' ? 'bg-red-950/20' : 'bg-slate-950'
    }`}>
      <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cFrom} via-purple-600 ${cTo} animate-pulse`} />

        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">ELITE TIER OPERATIONS</div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{title}</h2>
          </div>
          <div className={`text-3xl font-black font-mono px-3 py-1 rounded-xl border-2 transition-colors duration-300 ${
              timeLeft < 4 ? 'text-red-500 border-red-500/50 bg-red-500/10 animate-pulse' : 'text-slate-400 border-slate-800'
          }`}>
            {timeLeft}s
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-10 gap-6">
          <div className={`text-center transition-all duration-300 ${feedback === 'bid' ? 'scale-110' : ''}`}>
            <div className="text-5xl mb-3">{icon}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">{scoreLabel}</div>
            <div className={`text-lg font-black font-mono transition-colors duration-300 ${currentPlayerBid > currentRivalBid ? 'text-emerald-400' : 'text-white'}`}>
                ${currentPlayerBid.toLocaleString()}
            </div>
          </div>

          <div className="text-2xl font-black text-slate-800 italic">VS</div>

          <div className={`text-center transition-all duration-300 ${feedback === 'rival' ? 'scale-110' : ''}`}>
            <div className="text-5xl mb-3">🧛</div>
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">RIVAL</div>
            <div className={`text-lg font-black font-mono transition-colors duration-300 ${currentRivalBid > currentPlayerBid ? 'text-red-400' : 'text-white'}`}>
                ${currentRivalBid.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{instruction}</div>
            <div className={`text-sm font-black ${cText} font-mono`}>{Math.floor(playerPower)}%</div>
          </div>
          <div className="h-5 bg-slate-950 rounded-full border-2 border-slate-800 overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className={`h-full bg-gradient-to-r ${cFrom} via-cyan-400 to-emerald-500 rounded-full`}
              initial={{ width: '0%' }}
              animate={{ width: `${playerPower}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          </div>
        </div>

        {gameState === 'PLAYING' ? (
          <button
            onPointerDown={handleTap}
            className={`w-full ${cBtn} hover:opacity-90 active:scale-95 py-8 rounded-2xl border-b-8 ${cBtnBorder} transition-all group`}
          >
            <div className="text-2xl font-black text-white uppercase italic tracking-tighter group-active:translate-y-1">
              DOMINATE
            </div>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className={`text-4xl font-black uppercase italic tracking-tighter ${currentPlayerBid > currentRivalBid ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}>
              {currentPlayerBid > currentRivalBid ? 'BOARD SECURED' : 'TAKEOVER FAILED'}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 text-[10px] text-slate-600 text-center font-black uppercase tracking-[0.2em] max-w-xs leading-relaxed opacity-50">
        MASH THE BUTTON TO BUILD INFLUENCE<br/>
        FILL THE METER TO AUTOMATICALLY RAISE BID
      </div>
    </div>
  );
};
