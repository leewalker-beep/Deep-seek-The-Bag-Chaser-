import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BlackjackProps {
  onComplete: (multiplier: number) => void;
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

export const Blackjack: React.FC<BlackjackProps> = ({ onComplete }) => {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'DEALING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'ENDED'>('DEALING');
  const [message, setMessage] = useState('');

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

      if (calculateScore([p1, p2]) === 21) {
        setGameState('DEALER_TURN');
      }
    }, 1000);
  }, []);

  const hit = () => {
    if (gameState !== 'PLAYER_TURN') return;
    const newHand = [...playerHand, getRandomCard()];
    setPlayerHand(newHand);
    if (calculateScore(newHand) >= 21) {
      setGameState('DEALER_TURN');
    }
  };

  const stand = () => {
    if (gameState !== 'PLAYER_TURN') return;
    setGameState('DEALER_TURN');
  };

  useEffect(() => {
    if (gameState === 'DEALER_TURN') {
      const pScore = calculateScore(playerHand);
      if (pScore > 21) {
        setGameState('ENDED');
        setMessage('BUST! YOU LOSE');
        return;
      }

      const runDealer = async () => {
        let currentDealerHand = [...dealerHand];
        while (calculateScore(currentDealerHand) < 17) {
          await new Promise(r => setTimeout(r, 800));
          currentDealerHand = [...currentDealerHand, getRandomCard()];
          setDealerHand(currentDealerHand);
        }
        setGameState('ENDED');

        const dScore = calculateScore(currentDealerHand);
        if (dScore > 21) setMessage('DEALER BUST! YOU WIN');
        else if (dScore < pScore) setMessage('YOU WIN!');
        else if (dScore > pScore) setMessage('DEALER WINS');
        else setMessage('PUSH (DRAW)');
      };
      runDealer();
    }
  }, [gameState]);

  const handleComplete = () => {
    const pScore = calculateScore(playerHand);
    const dScore = calculateScore(dealerHand);
    let multiplier = 1.0;

    if (pScore > 21) multiplier = 0.5;
    else if (dScore > 21) multiplier = 4.0;
    else if (pScore === 21 && playerHand.length === 2) multiplier = 5.0; // Blackjack
    else if (pScore > dScore) multiplier = 3.0;
    else if (pScore === dScore) multiplier = 1.5;
    else multiplier = 0.8;

    onComplete(multiplier);
  };

  const CardView = ({ card, hidden }: { card: Card; hidden?: boolean }) => (
    <motion.div
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      className={`w-16 h-24 rounded-lg flex flex-col items-center justify-center text-lg font-bold shadow-md ${hidden ? 'bg-blue-800' : 'bg-white text-black'}`}
    >
      {!hidden ? (
        <>
          <div>{card.label}</div>
          <div className="text-2xl">{card.suit}</div>
        </>
      ) : (
        <div className="text-white">?</div>
      )}
    </motion.div>
  );

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl text-center max-w-sm mx-auto font-mono">
      <h2 className="text-2xl font-black text-yellow-500 mb-4 uppercase tracking-tighter">Blackjack 21</h2>

      {/* Dealer Hand */}
      <div className="mb-6">
        <div className="text-[10px] text-slate-500 uppercase mb-2">Dealer Hand ({gameState === 'ENDED' || gameState === 'DEALER_TURN' ? calculateScore(dealerHand) : '?'})</div>
        <div className="flex justify-center gap-2 h-24">
          {dealerHand.map((card, i) => (
            <CardView key={i} card={card} hidden={i === 1 && gameState === 'PLAYER_TURN'} />
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
        <div className="flex justify-center gap-2 h-24 mb-2">
          {playerHand.map((card, i) => (
            <CardView key={i} card={card} />
          ))}
        </div>
        <div className="text-[10px] text-slate-500 uppercase">Your Hand ({calculateScore(playerHand)})</div>
      </motion.div>

      {gameState === 'PLAYER_TURN' && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={hit} className="bg-emerald-600 py-4 rounded-xl font-black text-white active:scale-95 shadow-lg">HIT</button>
          <button onClick={stand} className="bg-slate-700 py-4 rounded-xl font-black text-white active:scale-95 shadow-lg">STAND</button>
        </div>
      )}

      {gameState === 'ENDED' && (
        <div className="animate-in zoom-in">
          <div className="text-xl font-black text-white mb-4 uppercase">{message}</div>
          <button
            onClick={handleComplete}
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black shadow-[0_5px_0_rgb(161,98,7)] active:translate-y-1 transition-all"
          >
            COLLECT WINNINGS
          </button>
        </div>
      )}

      <p className="mt-4 text-[8px] text-slate-500 uppercase tracking-widest">
        {gameState === 'PLAYER_TURN' ? 'Tap to Hit • Swipe down to Stand' : 'Dealers hit on 16 • Stand on 17'}
      </p>
    </div>
  );
};
