import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface SweepItem {
  id: number;
  top: number; // percentage (0-100)
  left: number; // percentage (0-100)
  isRare: boolean;
  emoji: string;
}

interface AttachedItem {
  id: number;
  offsetX: number; // pixel offset from magnet center
  offsetY: number; // pixel offset from magnet center
  isRare: boolean;
  emoji: string;
}

interface FallingItem {
  id: number;
  emoji: string;
  left: number; // horizontal starting percentage
  top: number;  // vertical starting percentage
}

interface MagneticSweepProps {
  onComplete: (res: { multiplier: number; isRare: boolean }) => void;
  level?: number;
  tier?: Tier;
  itemEmojis?: string[];
  rareEmoji?: string;
  title?: string;
  instruction?: string;
  scoreLabel?: string;
  rareLabel?: string;
  icon?: string;
}

export const MagneticSweep: React.FC<MagneticSweepProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  itemEmojis = ['🔩', '⚙️', '🖇️', '📎', '🔑'],
  rareEmoji = '⭐',
  scoreLabel = "SCRAP SECURED",
  rareLabel = "RARE FIND!",
  icon = "🧲"
}) => {
  const [items, setItems] = useState<SweepItem[]>([]);
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([]);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [magnetPos, setMagnetPos] = useState({ x: 50, y: 40 });
  const [isRareFound, setIsRareFound] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const itemId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const targetScore = Math.floor((12 + (level - 1) * 3) * spawnFactor);
  const spawnRate = Math.max(180, (500 - (level - 1) * 80) / spawnFactor);
  const itemLifespan = Math.max(1500, (4000 - (level - 1) * 500) / Math.sqrt(scaling));

  // Handle pointer/touch drag updates
  const updatePosition = useCallback((x: number, y: number) => {
    if (!gameActive) return;
    setMagnetPos({ x, y });

    // Proximity check: if any loose item is close to the magnet, attract it!
    setItems(prev => {
      const remaining: SweepItem[] = [];
      const newlyAttached: AttachedItem[] = [];

      prev.forEach(item => {
        const dx = item.left - x;
        const dy = item.top - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Within attraction distance (approx 12% of play area dimensions)
        if (dist < 12) {
          if (item.isRare) {
            setIsRareFound(true);
          }
          newlyAttached.push({
            id: item.id,
            // Give it a small random offset on the magnet so items don't overlap perfectly
            offsetX: (Math.random() - 0.5) * 40,
            offsetY: (Math.random() - 0.5) * 40,
            isRare: item.isRare,
            emoji: item.emoji
          });
        } else {
          remaining.push(item);
        }
      });

      if (newlyAttached.length > 0) {
        setAttachedItems(curr => [...curr, ...newlyAttached]);
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
      }

      return remaining;
    });
  }, [gameActive]);

  // Handle deposits when dragging magnet over the hopper (bottom of screen)
  useEffect(() => {
    if (magnetPos.y >= 75 && attachedItems.length > 0 && gameActive) {
      setIsDepositing(true);

      // Calculate score value
      let pointsGained = 0;
      const newFalling: FallingItem[] = [];

      attachedItems.forEach(item => {
        pointsGained += item.isRare ? 5 : 1;

        // Spawn falling items from the release coordinate
        newFalling.push({
          id: item.id,
          emoji: item.emoji,
          left: magnetPos.x + (item.offsetX / (playAreaRef.current?.clientWidth || 300)) * 100,
          top: magnetPos.y + (item.offsetY / (playAreaRef.current?.clientHeight || 400)) * 100
        });
      });

      setCollected(c => c + pointsGained);
      setFallingItems(curr => [...curr, ...newFalling]);
      setAttachedItems([]);

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Reset deposit feedback flash
      setTimeout(() => {
        setIsDepositing(false);
      }, 500);
    }
  }, [magnetPos, attachedItems, gameActive]);

  // Initialize intro and start delays
  useEffect(() => {
    const startDelay = setTimeout(() => {
      setHasStarted(true);
    }, 500);
    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowInstruction(false);
      setGameActive(true);
    }, 1500);
    return () => clearTimeout(introTimer);
  }, []);

  // Main game loops: Spawning & Timing
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setGameActive(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    const spawner = setInterval(() => {
      setItems(prev => {
        // Prevent overcrowding loose items
        if (prev.length > 8 + level) return prev;
        const isRare = Math.random() < (0.04 + level * 0.015);
        const newItem = {
          id: itemId.current++,
          top: Math.random() * 55 + 15, // keep items in upper/middle yard, away from hopper
          left: Math.random() * 80 + 10,
          isRare,
          emoji: isRare ? rareEmoji : itemEmojis[Math.floor(Math.random() * itemEmojis.length)]
        };

        // Autoremove if not collected
        setTimeout(() => {
          setItems(curr => curr.filter(i => i.id !== newItem.id));
        }, itemLifespan);

        return [...prev, newItem];
      });
    }, spawnRate);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [gameActive, spawnRate, itemLifespan, level, itemEmojis, rareEmoji]);

  // Clean up finished falling item animations
  useEffect(() => {
    if (fallingItems.length > 0) {
      const cleanup = setTimeout(() => {
        setFallingItems([]);
      }, 800);
      return () => clearTimeout(cleanup);
    }
  }, [fallingItems]);

  // Game complete evaluation
  useEffect(() => {
    if (!gameActive && hasStarted) {
      let multiplier = 0.5;
      if (collected >= targetScore) multiplier = 3.5;
      else if (collected >= targetScore * 0.6) multiplier = 2.0;
      else if (collected >= targetScore * 0.3) multiplier = 1.0;

      onComplete({ multiplier, isRare: isRareFound });
    }
  }, [gameActive, hasStarted, collected, targetScore, onComplete, isRareFound]);

  return (
    <div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none z-[100]"
    >
      {/* Top Header UI */}
      <div className="absolute top-12 text-center w-full z-20">
        <h2 className="text-3xl font-black text-slate-400 italic tracking-tighter uppercase">
          SCRAPYARD MAGNETIC SWEEP <span className="text-white text-xs">L{level}</span>
        </h2>
        <div className="mt-2 text-emerald-400 font-mono font-black text-2xl">
          {scoreLabel}: {collected} / {targetScore}
        </div>
      </div>

      {/* Main Play Area */}
      <div
        ref={playAreaRef}
        onPointerMove={(e) => {
          if (!playAreaRef.current) return;
          const rect = playAreaRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          updatePosition(x, y);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          if (!playAreaRef.current) return;
          const rect = playAreaRef.current.getBoundingClientRect();
          const x = ((touch.clientX - rect.left) / rect.width) * 100;
          const y = ((touch.clientY - rect.top) / rect.height) * 100;
          updatePosition(x, y);
        }}
        className="relative w-full h-full bg-slate-950 overflow-hidden border-x-4 border-slate-900"
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* Intro Instructions Overlay */}
        {showInstruction && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/40 backdrop-blur-sm">
            <div className="text-center p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
              <div className="text-5xl mb-3 animate-bounce">🧲</div>
              <div className="text-emerald-400 font-black text-sm uppercase tracking-widest">
                SWEEP THE YARD
              </div>
              <div className="text-white text-xs mt-2 max-w-xs">
                Drag the magnet to attract metal scrap, then drag to the <strong>RECYCLING HOPPER</strong> at the bottom to deposit!
              </div>
            </div>
          </div>
        )}

        {/* Loose Scrap Metal Items */}
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-12 h-12 flex items-center justify-center text-3xl z-10 pointer-events-none"
              style={{
                position: 'absolute',
                top: `${item.top}%`,
                left: `${item.left}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {item.emoji}
              {item.isRare && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Falling Deposited Items (Visual candy) */}
        {fallingItems.map(item => (
          <motion.div
            key={`fall-${item.id}`}
            initial={{ left: `${item.left}%`, top: `${item.top}%`, opacity: 1, scale: 1 }}
            animate={{ top: '88%', opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className="absolute w-12 h-12 flex items-center justify-center text-3xl z-20 pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Magnet and Attached Cluster */}
        <motion.div
          className="absolute w-20 h-20 flex items-center justify-center text-5xl z-30 pointer-events-none drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          animate={{ left: `${magnetPos.x}%`, top: `${magnetPos.y}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {icon}

          {/* Magnetic Aura Pulse */}
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -inset-4 border-2 border-red-500/40 rounded-full"
          />

          {/* Attached items visually clinging to the magnet */}
          {attachedItems.map(item => (
            <motion.div
              key={item.id}
              className="absolute text-2xl z-25 pointer-events-none drop-shadow-md"
              style={{
                left: `calc(50% + ${item.offsetX}px)`,
                top: `calc(50% + ${item.offsetY}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </motion.div>

        {/* Recycling Hopper / Scrap Bin (The deposit zone) */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[22%] border-t-4 transition-all duration-300 z-10 flex flex-col items-center justify-center ${
            isDepositing
              ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
              : attachedItems.length > 0
                ? 'bg-slate-900/80 border-blue-500/50 hover:bg-slate-900 animate-pulse'
                : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="absolute top-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            Recycling Hopper
          </div>
          <div className="text-center">
            <span className="text-3xl">📥</span>
            <div className={`font-black text-xs uppercase tracking-widest mt-1 ${
              isDepositing
                ? 'text-emerald-400'
                : attachedItems.length > 0
                  ? 'text-blue-400'
                  : 'text-slate-500'
            }`}>
              {isDepositing
                ? 'RECYCLING...'
                : attachedItems.length > 0
                  ? `DEPOSIT ${attachedItems.length} ITEMS!`
                  : 'DRAG LOADED MAGNET HERE'}
            </div>
          </div>
        </div>
      </div>

      {/* Battery/Time Left Slider */}
      <div className="absolute bottom-12 w-full max-w-[300px] px-8 z-20">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CRANE BATTERY</span>
          <span className="text-white font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            animate={{ width: `${(timeLeft / 10) * 100}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        {isRareFound && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 text-center text-yellow-400 font-black text-[10px] uppercase tracking-[0.3em]"
          >
            ✨ {rareLabel} ✨
          </motion.div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
    </div>
  );
};
