import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopUpFrenzyMinigameProps {
  onComplete: (multiplier: number) => void;
  scaling: number;
}

interface Customer {
  id: string;
  name: string;
  item: 'Red Tee' | 'Blue Tee' | 'Red Hoodie' | 'Blue Hoodie';
  size: 'S' | 'M' | 'L';
  patience: number; // 0 to 100
}

const SKU_LIST: ('Red Tee' | 'Blue Tee' | 'Red Hoodie' | 'Blue Hoodie')[] = [
  'Red Tee',
  'Blue Tee',
  'Red Hoodie',
  'Blue Hoodie',
];

const CUSTOMER_NAMES = ['Aiden', 'Sophia', 'Kai', 'Chloe', 'Zane', 'Luna', 'Tyler', 'Mia'];

export const PopUpFrenzyMinigame: React.FC<PopUpFrenzyMinigameProps> = ({ onComplete, scaling }) => {
  // Timer Factor: higher difficulty = faster countdown
  const timerFactor = Math.max(0.4, 1.1 - (scaling - 1) * 0.25);
  const totalDuration = Number((15 * timerFactor).toFixed(1));

  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [score, setScore] = useState(0);
  const [customersServed, setCustomersServed] = useState(0);
  const [customersWalked, setCustomersWalked] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  // Stock per SKU
  const [stocks, setStocks] = useState<Record<string, number>>({
    'Red Tee': 3,
    'Blue Tee': 3,
    'Red Hoodie': 3,
    'Blue Hoodie': 3,
  });

  // Active Queue
  const [queue, setQueue] = useState<Customer[]>([]);
  const customerIdCounter = useRef(0);

  // Generate a random customer
  const createCustomer = (): Customer => {
    customerIdCounter.current += 1;
    const randomName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
    const randomItem = SKU_LIST[Math.floor(Math.random() * SKU_LIST.length)];
    const randomSize = (['S', 'M', 'L'] as const)[Math.floor(Math.random() * 3)];

    return {
      id: `c_${customerIdCounter.current}`,
      name: `${randomName} #${customerIdCounter.current}`,
      item: randomItem,
      size: randomSize,
      patience: 100,
    };
  };

  // Initial Queue setup
  useEffect(() => {
    setQueue([createCustomer(), createCustomer()]);
  }, []);

  // Main game tick: overall game timer & patience depletion
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      // Shave game time
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          handleEndGame();
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });

      // Deplete customer patience
      setQueue((prevQueue) => {
        const updated = prevQueue
          .map((cust) => ({
            ...cust,
            patience: cust.patience - 8 * (1 / timerFactor), // patience drains faster on high difficulty
          }))
          .filter((cust) => {
            if (cust.patience <= 0) {
              setCustomersWalked((w) => w + 1);
              if (navigator.vibrate) navigator.vibrate([40, 40]);
              return false; // Customer walks!
            }
            return true;
          });

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameActive, timerFactor]);

  // Spawn new customers if queue length < 3
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      setQueue((prevQueue) => {
        if (prevQueue.length < 3) {
          return [...prevQueue, createCustomer()];
        }
        return prevQueue;
      });
    }, 2500 * timerFactor); // Spawns faster at high difficulty

    return () => clearInterval(spawnInterval);
  }, [gameActive, timerFactor]);

  const handleServe = (sku: 'Red Tee' | 'Blue Tee' | 'Red Hoodie' | 'Blue Hoodie') => {
    if (!gameActive || queue.length === 0) return;

    const activeCust = queue[0];
    const isTargetItem = activeCust.item === sku;
    const isTargetInStock = stocks[activeCust.item] > 0;

    if (isTargetInStock) {
      if (isTargetItem) {
        // Correct Item served!
        setStocks((prev) => ({ ...prev, [sku]: prev[sku] - 1 }));
        setScore((s) => s + 100);
        setCustomersServed((c) => c + 1);
        setQueue((prev) => prev.slice(1)); // Dequeue

        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        // Wrong item tapped while the correct item is still in stock!
        // Show a quick penalty
        setQueue((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[0].patience = Math.max(0, updated[0].patience - 25);
          return updated;
        });
        if (navigator.vibrate) navigator.vibrate([50, 20]);
      }
    } else {
      // The target item is OUT OF STOCK.
      // Tapping ANY other item with stock > 0 redirects to a substitute!
      if (stocks[sku] > 0) {
        setStocks((prev) => ({ ...prev, [sku]: prev[sku] - 1 }));
        setScore((s) => s + 60); // slightly fewer points for substitute
        setCustomersServed((c) => c + 1);
        setQueue((prev) => prev.slice(1)); // Dequeue

        if (navigator.vibrate) navigator.vibrate(40);
      }
    }
  };

  const handleEndGame = () => {
    setGameActive(false);

    // Map score/served to final multiplier (0.5 to 3.0)
    let baseMult = 0.5;
    if (customersServed >= 8) baseMult = 3.0;
    else if (customersServed >= 6) baseMult = 2.2;
    else if (customersServed >= 4) baseMult = 1.5;
    else if (customersServed >= 2) baseMult = 1.0;
    else baseMult = 0.5;

    // Apply difficulty scaling factor
    const finalMult = Math.max(0.5, Math.min(3.0, baseMult * (0.8 + scaling * 0.2)));

    setTimeout(() => {
      onComplete(finalMult);
    }, 1500);
  };

  const getEmojiForItem = (item: string) => {
    return item.includes('Hoodie') ? '🧥' : '👕';
  };

  return (
    <div className="p-4 bg-slate-950 text-white rounded-3xl border-2 border-slate-800 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
      {/* Top HUD */}
      <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-2">
        <div>
          <h3 className="text-lg font-black text-indigo-400 tracking-tight italic">POP-UP TOUR: RUSH SERVICE</h3>
          <div className="flex gap-4 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
            <span>Served: <strong className="text-white font-mono">{customersServed}</strong></span>
            <span>Walked: <strong className="text-red-500 font-mono">{customersWalked}</strong></span>
            <span>Hype Score: <strong className="text-indigo-400 font-mono">{score}</strong></span>
          </div>
        </div>
        <div className={`text-xs font-mono font-black px-2.5 py-1 rounded-full border ${
          timeLeft < 4.0 ? 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
        }`}>
          ⏱️ {timeLeft.toFixed(1)}s
        </div>
      </div>

      {/* Main Customers Queue area */}
      <div className="flex-1 flex flex-col justify-center my-4">
        <AnimatePresence mode="popLayout">
          {queue.length > 0 ? (
            <div className="space-y-4">
              {/* Active Customer Details */}
              <motion.div
                key={queue[0].id}
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, x: -100 }}
                className="bg-slate-900/90 border-2 border-indigo-900/40 p-4 rounded-2xl shadow-xl relative"
              >
                <div className="absolute top-2 right-3 text-[8px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                  ACTIVE CUSTOMER
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getEmojiForItem(queue[0].item)}</span>
                  <div className="flex-1">
                    <div className="text-xs font-black text-slate-100">{queue[0].name}</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      wants: <span className="text-amber-400 uppercase">{queue[0].size} {queue[0].item}</span>
                    </div>

                    {/* Stock Alert helper */}
                    {stocks[queue[0].item] === 0 && (
                      <div className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider mt-1 animate-pulse">
                        ⚠️ Requested item is OUT OF STOCK! Redirect to any substitute SKU!
                      </div>
                    )}
                  </div>
                </div>

                {/* Patience Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mb-1">
                    <span>Patience</span>
                    <span className={queue[0].patience < 40 ? 'text-red-500' : 'text-slate-400'}>
                      {Math.ceil(queue[0].patience)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        queue[0].patience < 35 ? 'bg-red-500' : queue[0].patience < 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${queue[0].patience}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Customers lined up behind them */}
              {queue.length > 1 && (
                <div className="flex gap-2 justify-center pt-2">
                  {queue.slice(1).map((cust, idx) => (
                    <div
                      key={cust.id}
                      className="bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-1.5 text-center text-[9px] text-slate-400 font-bold shrink-0"
                    >
                      <span>Line #{idx + 1}: </span>
                      <strong className="text-slate-300 uppercase">{cust.item.split(' ')[0]} {getEmojiForItem(cust.item)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
              Waiting for next Customer...
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* SKU Stocks & Tap Serve Controls */}
      <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-900">
        <div className="text-[9px] text-slate-500 font-black uppercase tracking-wider text-center">
          STORE INVENTORY / TAP TO SERVE
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SKU_LIST.map((sku) => {
            const stock = stocks[sku];
            const isOutOfStock = stock === 0;

            return (
              <button
                key={sku}
                onClick={() => handleServe(sku)}
                disabled={!gameActive || queue.length === 0}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all active:scale-95 ${
                  isOutOfStock
                    ? 'bg-red-950/10 border-red-900/30 text-red-700 cursor-not-allowed'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{getEmojiForItem(sku)}</span>
                  <span className="text-[10px] font-black uppercase text-slate-100">{sku}</span>
                </div>
                <div className={`text-[8px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                  isOutOfStock ? 'bg-red-900/20 text-red-500' : 'bg-slate-900 text-slate-400'
                }`}>
                  {isOutOfStock ? 'OUT OF STOCK' : `Stock: ${stock}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
