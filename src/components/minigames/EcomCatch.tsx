import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface EcomCatchProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const EcomCatch: React.FC<EcomCatchProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [items, setItems] = useState<{ id: number; icon: string; name: string; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState<'catch' | 'miss' | null>(null);
  const nextId = useRef(0);

  const TIERED_PRODUCTS = [
    // Level 1 - knockoffs
    { icon: '👟', name: 'Nuke Sneakers', minLevel: 1 },
    { icon: '👕', name: 'Adibas Tee', minLevel: 1 },
    { icon: '📱', name: 'Samesung Phone', minLevel: 1 },
    { icon: '👜', name: 'LB Bag', minLevel: 1 },
    // Level 2 - mid range real
    { icon: '🎧', name: 'AirPots', minLevel: 2 },
    { icon: '⌚', name: 'Casio G', minLevel: 2 },
    { icon: '👟', name: 'Nike SB', minLevel: 2 },
    { icon: '💻', name: 'Lenovo X1', minLevel: 2 },
    // Level 3 - high end
    { icon: '⌚', name: 'Ralex Watch', minLevel: 3 },
    { icon: '👜', name: 'Luton Bag', minLevel: 3 },
    { icon: '💎', name: 'Diamondique', minLevel: 3 },
    { icon: '🕶️', name: 'Versage Frames', minLevel: 3 },
    // Level 4+ - ultra luxury
    { icon: '⌚', name: 'Rolex Daytona', minLevel: 4 },
    { icon: '👜', name: 'Birkin Bag', minLevel: 4 },
    { icon: '💎', name: 'VVS Chain', minLevel: 4 },
    { icon: '🛥️', name: 'Yacht Share', minLevel: 4 },
  ];

  const availableProducts = TIERED_PRODUCTS.filter(
    p => p.minLevel <= level
  );

  // Level 2 target state
  const [level2Target] = useState<{ icon: string; name: string } | null>(() => {
    if (level === 2) {
      const filtered = TIERED_PRODUCTS.filter(p => p.minLevel <= level);
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
    return null;
  });

  // Level 3 list state
  const [level3List, setLevel3List] = useState<{ icon: string; name: string; caught: boolean }[]>(() => {
    if (level >= 3) {
      const filtered = TIERED_PRODUCTS.filter(p => p.minLevel <= level);
      // Shuffle and pick 3 unique products
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3).map(p => ({ icon: p.icon, name: p.name, caught: false }));
    }
    return [];
  });

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const spawnRate = Math.max(150, (700 - (level - 1) * 80) / spawnFactor);
  const fallSpeed = (2 + (level - 1) * 0.5) * Math.sqrt(scaling);

  // Quota for Level 1 & 2 vs 3
  const targetScore = level >= 3 ? 3 : (level === 2 ? Math.floor(10 * spawnFactor) : Math.floor((50 + (level - 1) * 10) * spawnFactor));
  const maxMissed = Math.max(3, (12 - (level - 1)) / Math.sqrt(scaling));

  useEffect(() => {
    if (!gameActive) return;

    const spawner = setInterval(() => {
      let product;
      if (level >= 3 && Math.random() < 0.5) {
        // skew spawns to ensure required items drop
        const uncaught = level3List.filter(item => !item.caught);
        const sourceList = uncaught.length > 0 ? uncaught : level3List;
        const targetSample = sourceList[Math.floor(Math.random() * sourceList.length)];
        product = TIERED_PRODUCTS.find(p => p.name === targetSample.name) || availableProducts[0];
      } else if (level === 2 && level2Target && Math.random() < 0.4) {
        // skew spawns for target
        product = level2Target;
      } else {
        product = availableProducts[
          Math.floor(Math.random() * availableProducts.length)
        ];
      }

      setItems(prev => [...prev, {
        id: nextId.current++,
        icon: product.icon,
        name: product.name,
        x: Math.random() * 60 + 20, // Centered drop positioning (20% to 80%) to avoid edges
        y: -10
      }]);
    }, spawnRate);

    return () => clearInterval(spawner);
  }, [gameActive, spawnRate, level, level2Target, level3List]);

  useEffect(() => {
    if (!gameActive) return;

    const gravity = setInterval(() => {
      setItems(prev => {
        const next = prev.map(item => ({ ...item, y: item.y + fallSpeed }));

        // Count missed items
        const out = next.filter(item => item.y > 105);
        if (out.length > 0) {
          let newlyMissed = 0;
          out.forEach(item => {
            if (level === 1) {
              // Any item falling is a miss
              newlyMissed++;
            } else if (level === 2) {
              // Only correct target falling counts as a miss
              if (level2Target && item.name === level2Target.name) {
                newlyMissed++;
              }
            } else if (level >= 3) {
              // Only required listed items not yet caught falling counts as a miss
              const listItem = level3List.find(li => li.name === item.name);
              if (listItem && !listItem.caught) {
                newlyMissed++;
              }
            }
          });

          if (newlyMissed > 0) {
            setMissed(m => m + newlyMissed);
            setFeedback('miss');
            setTimeout(() => setFeedback(null), 200);
            if (navigator.vibrate) navigator.vibrate([30, 30]);
          }
        }

        return next.filter(item => item.y <= 105);
      });
    }, 30);

    return () => clearInterval(gravity);
  }, [gameActive, fallSpeed, level, level2Target, level3List]);

  const handleCatch = (id: number) => {
    if (!gameActive) return;

    const caughtItem = items.find(i => i.id === id);
    if (!caughtItem) return;

    if (level === 1) {
      setScore(s => s + 1);
      setFeedback('catch');
      setTimeout(() => setFeedback(null), 100);
      if (navigator.vibrate) navigator.vibrate(20);
    } else if (level === 2) {
      if (level2Target && caughtItem.name === level2Target.name) {
        setScore(s => s + 1);
        setFeedback('catch');
        setTimeout(() => setFeedback(null), 100);
        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        // Catching a wrong item increments missed/maxMissed
        setMissed(m => m + 1);
        setFeedback('miss');
        setTimeout(() => setFeedback(null), 200);
        if (navigator.vibrate) navigator.vibrate([30, 30]);
      }
    } else if (level >= 3) {
      const listItemIndex = level3List.findIndex(li => li.name === caughtItem.name);
      if (listItemIndex !== -1) {
        // Tapped a listed item
        const updatedList = [...level3List];
        if (!updatedList[listItemIndex].caught) {
          updatedList[listItemIndex].caught = true;
          setLevel3List(updatedList);
          setScore(s => s + 1);
          setFeedback('catch');
          setTimeout(() => setFeedback(null), 100);
          if (navigator.vibrate) navigator.vibrate(20);
        } else {
          // Duplicate catch of already completed items is neutral
          setFeedback('catch');
          setTimeout(() => setFeedback(null), 100);
        }
      } else {
        // Caught a distractor item counts as a miss!
        setMissed(m => m + 1);
        setFeedback('miss');
        setTimeout(() => setFeedback(null), 200);
        if (navigator.vibrate) navigator.vibrate([30, 30]);
      }
    }

    setItems(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    if (missed >= maxMissed || score >= targetScore) {
      setGameActive(false);
      let multiplier = 0.5;
      if (score >= targetScore * 0.8) multiplier = 4.0;
      else if (score >= targetScore * 0.5) multiplier = 2.5;
      else if (score >= targetScore * 0.2) multiplier = 1.2;

      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => onComplete(multiplier), 1000);
    }
  }, [missed, score, targetScore, maxMissed, onComplete]);

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback === 'catch' ? 'bg-emerald-950/40' : feedback === 'miss' ? 'bg-red-950/40' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center pointer-events-none w-full px-8 z-20 flex flex-col items-center">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">E-COM BRAND <span className="text-emerald-500 text-sm">L{level}</span></h2>

        {/* Dynamic target instruction subtitle per level */}
        {level === 1 && (
          <div className="flex items-center justify-center gap-2 mt-1">
              <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-emerald-400 font-black">⬆️</motion.span>
              <p className="text-slate-300 text-xs font-black uppercase tracking-widest">TAP ANY ITEM TO FULFILL!</p>
          </div>
        )}

        {level === 2 && level2Target && (
          <div className="mt-2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-xl flex items-center gap-2.5 shadow-lg pointer-events-auto">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TARGET:</span>
            <span className="text-2xl">{level2Target.icon}</span>
            <span className="text-[10px] font-black text-white uppercase tracking-wide">{level2Target.name}</span>
          </div>
        )}

        {level >= 3 && level3List.length > 0 && (
          <div className="mt-2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-xl flex flex-col items-center gap-1 shadow-lg pointer-events-auto">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">COLLECTION CHECKLIST:</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {level3List.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all ${
                  item.caught
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 line-through opacity-60'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[8px] uppercase tracking-tight">{item.name}</span>
                  <span>{item.caught ? '✅' : '⏳'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-12 justify-center mt-4 font-mono font-black text-3xl tabular-nums drop-shadow-xl">
          <div className="text-emerald-400 flex flex-col items-center">
              <span className="text-[10px] text-slate-500">{level >= 3 ? 'CAUGHT' : 'ORDERS'}</span>
              {score}
          </div>
          <div className="text-red-500 flex flex-col items-center">
              <span className="text-[10px] text-slate-500">MISSED</span>
              {missed}/{Math.floor(maxMissed)}
          </div>
        </div>
      </div>

      <div className="relative w-full h-full overflow-hidden border-x-8 border-slate-900 bg-slate-900/10">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <AnimatePresence>
          {items.map(item => (
            <motion.button
              key={item.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2.5, opacity: 0 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleCatch(item.id)}
              className="absolute p-4 drop-shadow-2xl active:scale-125 transition-transform flex flex-col items-center"
              style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="text-6xl">{item.icon}</div>
              <div className="text-[8px] text-slate-400 font-bold text-center leading-tight mt-0.5">
                {item.name}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-[320px] px-6 z-20">
        <ProgressBar
          value={score}
          max={targetScore}
          label=""
          colorClass="bg-emerald-500"
        />
        <div className="mt-2 flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-widest">
            <span>Quota: {targetScore}</span>
            <span>Speed: {fallSpeed.toFixed(1)}x</span>
        </div>
      </div>

      <AnimatePresence>
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-[110] p-6"
          >
            <div className="text-8xl mb-6 drop-shadow-2xl">{score >= targetScore ? '🚚' : '📉'}</div>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">SHIPMENT READY</div>
            <div className="text-emerald-400 font-black font-mono text-2xl mt-2 uppercase tracking-widest">{score} {level >= 3 ? 'REQUIRED ITEMS' : 'ORDERS'} FULFILLED</div>
            <div className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-6 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                {score >= targetScore ? 'PERFECT FULFILLMENT' : score >= targetScore * 0.5 ? 'VOLUME HANDLED' : 'PARTIAL SHIPMENT'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
