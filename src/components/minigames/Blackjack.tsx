import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlackjackProps {
  onComplete: (multiplier: number) => void;
  level?: number;
}

interface Card {
  suit: string;
  label: string;
  value: number;
}

const SUITS = ['♠️', '♥️', '♣️', '♦️'];
const LABELS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const getCardValue = (label: string): number => {
  if (['J', 'Q', 'K'].includes(label)) return 10;
  if (label === 'A') return 11;
  return parseInt(label);
};

const getRandomCard = (): Card => {
  const label = LABELS[Math.floor(Math.random() * LABELS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { label, suit, value: getCardValue(label) };
};

const calculateScore = (hand: Card[]): number => {
  let score = hand.reduce((acc, card) => acc + card.value, 0);
  let aces = hand.filter(c => c.label === 'A').length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

export const Blackjack: React.FC<BlackjackProps> = ({ onComplete, level = 1 }) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'DEALING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'ENDED'>('DEALING');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<'win' | 'lose' | 'draw' | null>(null);

  // Difficulty scaling: House pays more at higher levels, but plays smarter?
  const winMultiplier = 3.0 + (level - 1) * 0.5;
  const blackjackMultiplier = 5.0 + (level - 1) * 1.0;

  useEffect(() => {
    // Initial deal
    const p1 = getRandomCard();
    const d1 = getRandomCard();
    const p2 = getRandomCard();
    const d2 = getRandomCard();

    setTimeout(() => {
      setPlayerHand([p1, p2]);
      setDealerHand([d1, d2]);
      setGameState('PLAYER_TURN');
      if (navigator.vibrate) navigator.vibrate([20, 20]);

      if (calculateScore([p1, p2]) === 21) {
        setGameState('DEALER_TURN');
      }
    }, 1000);
  }, []);

  const hit = () => {
    if (gameState !== 'PLAYER_TURN') return;
    const newHand = [...playerHand, getRandomCard()];
    setPlayerHand(newHand);
    if (navigator.vibrate) navigator.vibrate(20);
    if (calculateScore(newHand) >= 21) {
      setGameState('DEALER_TURN');
    }
  };

  const stand = () => {
    if (gameState !== 'PLAYER_TURN') return;
    setGameState('DEALER_TURN');
    if (navigator.vibrate) navigator.vibrate(10);
  };

  useEffect(() => {
    if (gameState === 'DEALER_TURN') {
      const pScore = calculateScore(playerHand);
      if (pScore > 21) {
        setGameState('ENDED');
        setMessage('BUST! YOU LOSE');
        setFeedback('lose');
        if (navigator.vibrate) navigator.vibrate(50);
        return;
      }

      const runDealer = async () => {
        let currentDealerHand = [...dealerHand];
        const dealerStopAt = level >= 3 ? 18 : 17; // Smarter dealer at L3+

        while (calculateScore(currentDealerHand) < dealerStopAt) {
          await new Promise(r => setTimeout(r, 800));
          currentDealerHand = [...currentDealerHand, getRandomCard()];
          setDealerHand(currentDealerHand);
          if (navigator.vibrate) navigator.vibrate(10);
        }
        setGameState('ENDED');

        const dScore = calculateScore(currentDealerHand);
        if (dScore > 21) {
            setMessage('DEALER BUST! YOU WIN');
            setFeedback('win');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else if (dScore < pScore) {
            setMessage('YOU WIN!');
            setFeedback('win');
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else if (dScore > pScore) {
            setMessage('DEALER WINS');
            setFeedback('lose');
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            setMessage('PUSH (DRAW)');
            setFeedback('draw');
            if (navigator.vibrate) navigator.vibrate(30);
        }
      };
      runDealer();
    }
  }, [gameState, playerHand, dealerHand, level]);

  const handleComplete = () => {
    const pScore = calculateScore(playerHand);
    const dScore = calculateScore(dealerHand);
    let multiplier = 1.0;

    if (pScore > 21) multiplier = 0.5;
    else if (dScore > 21) multiplier = winMultiplier;
    else if (pScore === 21 && playerHand.length === 2) multiplier = blackjackMultiplier;
    else if (pScore > dScore) multiplier = winMultiplier;
    else if (pScore === dScore) multiplier = 1.5;
    else multiplier = 0.8;

    onComplete(multiplier);
  };

  const CardView = ({ card, hidden, index }: { card: Card; hidden?: boolean; index: number }) => (
    <motion.div
      initial={{ scale: 0, rotateY: 180, x: 100 }}
      animate={{ scale: 1, rotateY: 0, x: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', damping: 15 }}
      className={`w-16 h-24 rounded-xl flex flex-col items-center justify-between py-2 text-lg font-black shadow-xl border-2 transition-colors duration-300 ${
          hidden ? 'bg-slate-800 border-slate-700' : 'bg-white text-black border-slate-200'
      }`}
    >
      {!hidden ? (
        <>
          <div className="text-left w-full px-2 leading-none text-xs">{card.label}</div>
          <div className="text-3xl">{card.suit}</div>
          <div className="text-right w-full px-2 leading-none text-xs rotate-180">{card.label}</div>
        </>
      ) : (
        <div className="text-slate-600 text-3xl h-full flex items-center justify-center">?</div>
      )}
    </motion.div>
  );

  return (
    <div className={`transition-colors duration-500 bg-slate-950 p-6 rounded-[2rem] border-4 shadow-2xl text-center max-w-sm mx-auto font-mono ${
        feedback === 'win' ? 'border-emerald-500 bg-emerald-950/20' :
        feedback === 'lose' ? 'border-red-500 bg-red-950/20' :
        feedback === 'draw' ? 'border-blue-500 bg-blue-950/20' :
        'border-yellow-600'
    }`}>
      <h2 className="text-2xl font-black text-yellow-500 mb-2 uppercase tracking-tighter italic">VA AGENCY <span className="text-white text-xs">L{level}</span></h2>
      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-6">WIN PAYOUT: {winMultiplier.toFixed(1)}x</p>

      {/* Dealer Hand */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 px-4">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">DEALER</span>
            <span className="text-[10px] font-black font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {gameState === 'ENDED' || gameState === 'DEALER_TURN' ? calculateScore(dealerHand) : '??'}
            </span>
        </div>
        <div className="flex justify-center gap-2 h-24">
          {dealerHand.map((card, i) => (
            <CardView key={i} index={i} card={card} hidden={i === 1 && gameState === 'PLAYER_TURN'} />
          ))}
        </div>
      </div>

      {/* Player Hand */}
      <motion.div
        className="mb-8"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => {
          if (gameState === 'PLAYER_TURN' && info.offset.y > 50) stand();
        }}
      >
        <div className="flex justify-between items-center mb-2 px-4">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">PLAYER</span>
            <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border transition-colors duration-300 ${
                calculateScore(playerHand) > 21 ? 'bg-red-900 border-red-500 text-white' :
                calculateScore(playerHand) === 21 ? 'bg-emerald-900 border-emerald-500 text-white' :
                'bg-slate-800 border-slate-700 text-white'
            }`}>
                {calculateScore(playerHand)}
            </span>
        </div>
        <div className="flex justify-center gap-2 h-24 mb-4">
          {playerHand.map((card, i) => (
            <CardView key={i} index={i} card={card} />
          ))}
        </div>
      </motion.div>

      {gameState === 'PLAYER_TURN' && (
        <div className="grid grid-cols-2 gap-4 mb-2">
          <button onClick={hit} className="bg-emerald-600 py-5 rounded-2xl font-black text-white active:scale-95 shadow-[0_5px_0_rgb(6,95,70)] border-t border-white/20 uppercase tracking-widest">HIT</button>
          <button onClick={stand} className="bg-slate-700 py-5 rounded-2xl font-black text-white active:scale-95 shadow-[0_5px_0_rgb(31,41,55)] border-t border-white/20 uppercase tracking-widest">STAND</button>
        </div>
      )}

      <AnimatePresence>
        {gameState === 'ENDED' && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
            >
            <div className={`text-2xl font-black mb-4 uppercase italic tracking-tighter drop-shadow-lg ${
                feedback === 'win' ? 'text-emerald-400' :
                feedback === 'lose' ? 'text-red-400' :
                'text-blue-400'
            }`}>
                {message}
            </div>
            <button
                onClick={handleComplete}
                className="w-full bg-yellow-500 text-black py-5 rounded-2xl font-black shadow-[0_6px_0_rgb(161,98,7)] active:translate-y-1 transition-all uppercase italic tracking-tighter text-xl border-t border-white/20"
            >
                COLLECT PAYOUT
            </button>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-col items-center gap-2 opacity-50">
        <p className="text-[8px] text-slate-500 uppercase font-black tracking-[0.2em]">
            {gameState === 'PLAYER_TURN' ? 'TAP TO HIT • SWIPE DOWN TO STAND' : 'DEALER IS DRAWING...'}
        </p>
        <div className="h-px bg-slate-800 w-full" />
      </div>
    </div>
  );
};
