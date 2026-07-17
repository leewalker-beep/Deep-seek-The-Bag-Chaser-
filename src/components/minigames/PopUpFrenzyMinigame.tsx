import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopUpFrenzyMinigameProps {
  onComplete: (multiplier: number) => void;
  scaling: number;
}

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
const ITEMS = ['Hoodie', 'Tee', 'Pants', 'Hat', 'Shoes', 'Jacket'];
const MODIFIERS = ['Distressed', 'Acid-wash', 'Cyberpunk', 'Vintage', 'Reflective', 'Oversized'];

interface Order {
  color: string;
  item: string;
  modifier?: string;
}

interface ProductCard {
  id: string;
  color: string;
  item: string;
  modifier?: string;
}

export const PopUpFrenzyMinigame: React.FC<PopUpFrenzyMinigameProps> = ({ onComplete, scaling }) => {
  const [timeLeft, setTimeLeft] = useState(12.0);
  const [score, setScore] = useState(0);
  const [customersServed, setCustomersServed] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cards, setCards] = useState<ProductCard[]>([]);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<number | null>(null);

  // Generate a random order based on number of customers already served
  const generateOrder = (index: number): Order => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    if (index >= 2) {
      // Add a modifier from customer 3 onward
      const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
      return { color, item, modifier };
    }

    return { color, item };
  };

  // Generate 4 cards (1 correct, 3 near-misses)
  const generateCardsForOrder = (order: Order): ProductCard[] => {
    const correct: ProductCard = {
      id: 'correct',
      color: order.color,
      item: order.item,
      modifier: order.modifier
    };

    // Card 2: Same item, different color, same/random modifier
    const wrongColor = COLORS.filter(c => c !== order.color)[Math.floor(Math.random() * (COLORS.length - 1))];
    const card2: ProductCard = {
      id: 'wrong_color',
      color: wrongColor,
      item: order.item,
      modifier: order.modifier
    };

    // Card 3: Same color, different item, same/random modifier
    const wrongItem = ITEMS.filter(i => i !== order.item)[Math.floor(Math.random() * (ITEMS.length - 1))];
    const card3: ProductCard = {
      id: 'wrong_item',
      color: order.color,
      item: wrongItem,
      modifier: order.modifier
    };

    // Card 4: Different modifier (if active) OR different both
    let card4: ProductCard;
    if (order.modifier) {
      const wrongMod = MODIFIERS.filter(m => m !== order.modifier)[Math.floor(Math.random() * (MODIFIERS.length - 1))];
      card4 = {
        id: 'wrong_modifier',
        color: order.color,
        item: order.item,
        modifier: wrongMod
      };
    } else {
      const wrongColor2 = COLORS.filter(c => c !== order.color && c !== wrongColor)[Math.floor(Math.random() * (COLORS.length - 2))];
      const wrongItem2 = ITEMS.filter(i => i !== order.item && i !== wrongItem)[Math.floor(Math.random() * (ITEMS.length - 2))];
      card4 = {
        id: 'wrong_both',
        color: wrongColor2,
        item: wrongItem2
      };
    }

    // Shuffle the cards
    const list = [correct, card2, card3, card4];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    return list;
  };

  // Start the timer loop
  useEffect(() => {
    // Generate initial order
    const firstOrder = generateOrder(0);
    setCurrentOrder(firstOrder);
    setCards(generateCardsForOrder(firstOrder));

    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.05) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameActive(false);
          return 0;
        }
        return Number((t - 0.05).toFixed(2));
      });
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle final completion multiplier mapping when game is not active anymore
  useEffect(() => {
    if (!gameActive) {
      // Threshold mapping:
      // Served 12+ = 3.0x multiplier
      // Served 8-11 = 2.0x multiplier
      // Served 5-7 = 1.2x multiplier
      // Served 3-4 = 0.8x multiplier
      // Served <3 = 0.5x multiplier
      // Scale further based on general multiplier utilities
      let baseMult = 0.5;
      if (customersServed >= 12) baseMult = 3.0;
      else if (customersServed >= 8) baseMult = 2.0;
      else if (customersServed >= 5) baseMult = 1.2;
      else if (customersServed >= 3) baseMult = 0.8;
      else baseMult = 0.5;

      const finalMultiplier = Math.max(0.5, Math.min(3.0, baseMult * (0.8 + scaling * 0.2)));

      setTimeout(() => {
        onComplete(finalMultiplier);
      }, 1500);
    }
  }, [gameActive, customersServed, scaling, onComplete]);

  const handleSelectCard = (card: ProductCard) => {
    if (!gameActive || !currentOrder) return;

    const isMatch =
      card.color === currentOrder.color &&
      card.item === currentOrder.item &&
      card.modifier === currentOrder.modifier;

    if (isMatch) {
      setFeedback('correct');
      setScore(s => s + 100);
      setCustomersServed(c => c + 1);
      setTimeLeft(t => Math.min(15.0, t + 1.0)); // capped at 15s max to prevent infinite runs

      if (navigator.vibrate) navigator.vibrate(20);

      setTimeout(() => {
        setFeedback(null);
        const nextIdx = customersServed + 1;
        const nextOrder = generateOrder(nextIdx);
        setCurrentOrder(nextOrder);
        setCards(generateCardsForOrder(nextOrder));
      }, 300);
    } else {
      setFeedback('wrong');
      setScore(s => Math.max(0, s - 25));
      setTimeLeft(t => Math.max(0, t - 0.5));

      if (navigator.vibrate) navigator.vibrate([30, 30]);

      setTimeout(() => {
        setFeedback(null);
      }, 300);
    }
  };

  const getEmojiForCard = (item: string) => {
    switch (item) {
      case 'Hoodie': return '🧥';
      case 'Tee': return '👕';
      case 'Pants': return '👖';
      case 'Hat': return '🧢';
      case 'Shoes': return '👟';
      case 'Jacket': return '🧥';
      default: return '🛍️';
    }
  };

  const getColorClass = (colorName: string) => {
    switch (colorName) {
      case 'Red': return 'bg-red-500';
      case 'Blue': return 'bg-blue-500';
      case 'Green': return 'bg-green-500';
      case 'Yellow': return 'bg-yellow-400 text-slate-950';
      case 'Purple': return 'bg-purple-500';
      case 'Orange': return 'bg-orange-500';
      default: return 'bg-slate-700';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-white rounded-3xl border-2 border-slate-800 relative overflow-hidden min-h-[450px]">
      <div className="absolute top-4 right-4 text-xs font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
        ⏱️ {timeLeft.toFixed(1)}s
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-indigo-400 tracking-tight italic">POP-UP TOUR</h3>
        <div className="flex justify-center gap-8 mt-2">
          <div className="text-center">
            <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block">SERVED</span>
            <span className="text-white text-sm font-black font-mono">{customersServed}</span>
          </div>
          <div className="text-center">
            <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block">HYPE SCORE</span>
            <span className="text-blue-400 text-sm font-black font-mono">{score}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameActive && currentOrder ? (
          <motion.div
            key={customersServed}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* Customer Demand Bubble */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-center shadow-lg relative mb-6">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-widest block mb-1">Hypebeast Request:</span>
              <div className="text-lg font-black tracking-tight text-white flex flex-col items-center gap-1">
                {currentOrder.modifier && (
                  <span className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded font-black uppercase tracking-wider mb-1 animate-pulse">
                    ⚡ {currentOrder.modifier}
                  </span>
                )}
                <span>
                  {currentOrder.color} {currentOrder.item}
                </span>
              </div>
            </div>

            {/* Grid of Options */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {cards.map((card, i) => (
                <button
                  key={`${card.color}-${card.item}-${card.modifier || ''}-${i}`}
                  onClick={() => handleSelectCard(card)}
                  className={`relative flex flex-col items-center bg-slate-900 border-2 border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-md transition-all active:scale-95 ${
                    feedback === 'correct' && card.id === 'correct' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''
                  }`}
                >
                  <div className="text-4xl mb-2 filter drop-shadow">
                    {getEmojiForCard(card.item)}
                  </div>

                  <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-xs font-black uppercase text-slate-100">{card.item}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${getColorClass(card.color)}`}>
                      {card.color}
                    </span>
                    {card.modifier && (
                      <span className="text-[8px] text-slate-400 uppercase font-black tracking-tight">{card.modifier}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">🚚</span>
            <h4 className="text-2xl font-black text-emerald-400 italic">TOUR STOP COMPLETE</h4>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Served {customersServed} Customers</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
