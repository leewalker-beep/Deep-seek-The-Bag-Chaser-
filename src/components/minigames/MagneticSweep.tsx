import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier, getSpawnFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface GridCell {
  id: number;
  row: number;
  col: number;
  state: 'hidden' | 'revealed' | 'hazard';
  itemEmoji: string | null;
  isRare: boolean;
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

const DEFAULT_ITEM_EMOJIS = ['🔩', '⚙️', '🖇️', '📎', '🔑'];

export const MagneticSweep: React.FC<MagneticSweepProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  itemEmojis = DEFAULT_ITEM_EMOJIS,
  rareEmoji = '⭐',
  scoreLabel = "SCRAP SECURED",
  rareLabel = "RARE FIND!",
  icon = "🧲"
}) => {
  // Stabilize itemEmojis using a string comparison of its elements
  const itemEmojisKey = itemEmojis.join(',');
  const stableItemEmojis = useMemo(() => {
    return itemEmojisKey.split(',');
  }, [itemEmojisKey]);

  // Game state
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [attachedItems, setAttachedItems] = useState<AttachedItem[]>([]);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);
  const [gameActive, setGameActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [magnetPos, setMagnetPos] = useState({ x: 50, y: 50 });
  const [isRareFound, setIsRareFound] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [craneStunned, setCraneStunned] = useState(0); // stun duration in ms
  const playAreaRef = useRef<HTMLDivElement>(null);
  const itemId = useRef(0);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const spawnFactor = getSpawnFactor(level, tier);

  // Difficulty scaling
  const targetScore = Math.floor((8 + (level - 1) * 3) * spawnFactor);

  // Initialize interactive grid cells (4x4 Scrapyard dig sites)
  const initializeGrid = useCallback(() => {
    const cells: GridCell[] = [];
    let cellId = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const roll = Math.random();
        let itemEmoji: string | null = null;
        let isRare = false;
        let state: 'hidden' | 'revealed' | 'hazard' = 'hidden';

        // 12% chance of containing hazard in later levels
        const isHazardCell = level >= 2 && roll < 0.12;

        if (isHazardCell) {
          state = 'hidden';
          itemEmoji = '💥';
        } else {
          const isItemCell = roll < 0.65;
          if (isItemCell) {
            isRare = Math.random() < (0.05 + level * 0.02);
            itemEmoji = isRare ? rareEmoji : stableItemEmojis[Math.floor(Math.random() * stableItemEmojis.length)];
          }
        }

        cells.push({
          id: cellId++,
          row: r,
          col: c,
          state,
          itemEmoji,
          isRare
        });
      }
    }
    setGrid(cells);
  }, [level, stableItemEmojis, rareEmoji]);

  // Dig/Excavate action when clicking a tile
  const handleDigCell = (id: number) => {
    if (!gameActive || craneStunned > 0) return;

    setGrid(prev =>
      prev.map(cell => {
        if (cell.id === id && cell.state === 'hidden') {
          if (cell.itemEmoji === '💥') {
            // Trigger hazard stun penalty
            setCraneStunned(1500);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            setTimeLeft(t => Math.max(0, t - 2)); // deduct battery time
            return { ...cell, state: 'hazard' };
          } else {
            // Revealed normal or rare scrap!
            if (navigator.vibrate) navigator.vibrate(20);
            return { ...cell, state: 'revealed' };
          }
        }
        return cell;
      })
    );
  };

  // Handle pointer/touch drag updates
  const updatePosition = useCallback((x: number, y: number) => {
    if (!gameActive || craneStunned > 0) return;

    // Clamp coordinates to play area boundaries (0-100)
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    setMagnetPos({ x: clampedX, y: clampedY });

    // Proximity check: if magnet sweeps over a revealed scrap tile, attract it!
    setGrid(prev => {
      let updated = false;
      const nextGrid = prev.map(cell => {
        if (cell.state === 'revealed' && cell.itemEmoji) {
          // Calculate grid cell center percentage
          const cellX = 12.5 + cell.col * 25;
          const cellY = 10 + cell.row * 15; // upper area

          const dx = cellX - clampedX;
          const dy = cellY - clampedY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Within attraction distance (increased slightly to 18 for improved accessibility and better alignment)
          if (dist < 18) {
            updated = true;
            if (cell.isRare) {
              setIsRareFound(true);
            }
            setAttachedItems(curr => [
              ...curr,
              {
                id: itemId.current++,
                offsetX: (Math.random() - 0.5) * 40,
                offsetY: (Math.random() - 0.5) * 40,
                isRare: cell.isRare,
                emoji: cell.itemEmoji || '🔩'
              }
            ]);
            if (navigator.vibrate) navigator.vibrate(15);
            return { ...cell, state: 'revealed', itemEmoji: null }; // remove item from tile
          }
        }
        return cell;
      });
      return updated ? nextGrid : prev;
    });
  }, [gameActive, craneStunned]);

  // Handle deposits when dragging magnet over the recycling hopper (bottom of screen)
  useEffect(() => {
    // Deposit threshold updated from >= 72 to >= 68 to align cleanly with layout constraints and prevent pointer mismatch at screen edges
    if (magnetPos.y >= 68 && attachedItems.length > 0 && gameActive && craneStunned === 0) {
      setIsDepositing(true);

      let pointsGained = 0;
      const newFalling: FallingItem[] = [];

      attachedItems.forEach(item => {
        pointsGained += item.isRare ? 5 : 1;
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

      if (navigator.vibrate) navigator.vibrate(100);

      // Reset deposit feedback
      const feedbackTimer = setTimeout(() => {
        setIsDepositing(false);
      }, 500);
      return () => clearTimeout(feedbackTimer);
    }
  }, [magnetPos, attachedItems, gameActive, craneStunned]);

  // Handle crane stun cooldown timer
  useEffect(() => {
    if (craneStunned > 0) {
      const stunTimer = setTimeout(() => {
        setCraneStunned(0);
      }, craneStunned);
      return () => clearTimeout(stunTimer);
    }
  }, [craneStunned]);

  // Initialize game delays
  useEffect(() => {
    setHasStarted(true);
    initializeGrid();
    const introTimer = setTimeout(() => {
      setShowInstruction(false);
      setGameActive(true);
    }, 1800);
    return () => clearTimeout(introTimer);
  }, [initializeGrid]);

  // Game timer loop
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

    return () => clearInterval(timer);
  }, [gameActive]);

  // Clean up falling items candy
  useEffect(() => {
    if (fallingItems.length > 0) {
      const cleanup = setTimeout(() => {
        setFallingItems([]);
      }, 600);
      return () => clearTimeout(cleanup);
    }
  }, [fallingItems]);

  // Game completion payout
  useEffect(() => {
    if (!gameActive && hasStarted && timeLeft <= 0) {
      // Standard multiplier standardized formula matching:
      // performanceBase * (0.8 + scaling * 0.2)
      // performanceBase is based on how close they are to targetScore
      const performanceBase = collected >= targetScore
        ? 3.0 + Math.min(1.0, (collected - targetScore) / 10)
        : collected >= targetScore * 0.6
        ? 2.0
        : collected >= targetScore * 0.3
        ? 1.0
        : 0.5;

      const finalMultiplier = performanceBase * (0.8 + scaling * 0.2);
      onComplete({ multiplier: finalMultiplier, isRare: isRareFound });
    }
  }, [gameActive, hasStarted, collected, targetScore, onComplete, isRareFound, scaling, timeLeft]);

  // Replenish dug/empty grid cells so they can keep playing and searching
  useEffect(() => {
    if (!gameActive) return;
    const revealedCount = grid.filter(c => c.state === 'revealed' || c.state === 'hazard').length;
    if (revealedCount >= 12) {
      // Regenerate grid so they can keep digging!
      initializeGrid();
    }
  }, [grid, gameActive, initializeGrid]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none z-[100]">
      {/* Top Header UI */}
      <div className="absolute top-12 text-center w-full z-20 px-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-400 italic tracking-tighter uppercase">
          SCRAPYARD RECOVERY <span className="text-emerald-500 font-bold">L{level}</span>
        </h2>
        <div className="mt-2 flex justify-center gap-6">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{scoreLabel}</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {collected} / {targetScore}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">LOADED</div>
            <div className="text-xl font-black text-blue-400 font-mono">
              {attachedItems.length} pcs
            </div>
          </div>
        </div>
      </div>

      {/* Main Play Area Grid & Crane Track */}
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
        className="relative w-full h-[62vh] max-h-[500px] bg-slate-900 border-y-4 border-slate-800 overflow-hidden"
      >
        {/* Scrapyard Dig Grid (Upper 65% of the screen) */}
        <div className="absolute inset-x-2 top-4 bottom-[28%] grid grid-cols-4 gap-2 p-1 z-10">
          {grid.map(cell => (
            <button
              key={cell.id}
              onClick={() => handleDigCell(cell.id)}
              disabled={!gameActive}
              className={`relative rounded-xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden ${
                cell.state === 'hidden'
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 active:scale-95 cursor-pointer'
                  : cell.state === 'hazard'
                  ? 'bg-red-950/40 border-red-500/50 cursor-default'
                  : 'bg-slate-950/80 border-slate-800 cursor-default'
              }`}
            >
              {cell.state === 'hidden' && (
                <div className="text-center pointer-events-none">
                  <span className="text-2xl opacity-60">🌫️</span>
                  <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5">DIG</div>
                </div>
              )}

              {cell.state === 'revealed' && cell.itemEmoji && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1.2, 1] }}
                  className="text-3xl relative pointer-events-none"
                >
                  {cell.itemEmoji}
                  {cell.isRare && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm"
                    />
                  )}
                </motion.div>
              )}

              {cell.state === 'revealed' && !cell.itemEmoji && (
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider pointer-events-none">EMPTY</span>
              )}

              {cell.state === 'hazard' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  className="text-2xl text-red-500 pointer-events-none"
                >
                  💥
                </motion.div>
              )}
            </button>
          ))}
        </div>

        {/* Falling Deposited Items candy */}
        {fallingItems.map(item => (
          <motion.div
            key={`fall-${item.id}`}
            initial={{ left: `${item.left}%`, top: `${item.top}%`, opacity: 1, scale: 1 }}
            animate={{ top: '85%', opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className="absolute w-12 h-12 flex items-center justify-center text-3xl z-20 pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Crane Magnet Cling cluster */}
        <motion.div
          className={`absolute w-16 h-16 flex items-center justify-center text-4xl z-30 pointer-events-none ${
            craneStunned > 0 ? 'opacity-40 grayscale animate-pulse' : 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          }`}
          animate={{ left: `${magnetPos.x}%`, top: `${magnetPos.y}%` }}
          transition={{ type: 'spring', damping: 22, stiffness: 250 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {icon}

          {/* Magnetic Pulse aura */}
          {gameActive && craneStunned === 0 && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
              className="absolute -inset-3 border border-red-500/40 rounded-full"
            />
          )}

          {/* Attached Scrap clinging */}
          {attachedItems.map(item => (
            <div
              key={item.id}
              className="absolute text-xl pointer-events-none drop-shadow"
              style={{
                left: `calc(50% + ${item.offsetX}px)`,
                top: `calc(50% + ${item.offsetY}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {item.emoji}
            </div>
          ))}
        </motion.div>

        {/* Recycling Hopper / Scrap Bin (Deposit corridor) */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[26%] border-t-4 transition-all duration-300 z-10 flex flex-col items-center justify-center pointer-events-none ${
            isDepositing
              ? 'bg-emerald-950 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]'
              : attachedItems.length > 0
              ? 'bg-slate-800 border-blue-500 animate-pulse'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <span className="text-2xl mb-1 pointer-events-none">{isDepositing ? '📥' : '🗑️'}</span>
          <div className={`font-black text-xs uppercase tracking-widest pointer-events-none ${
            isDepositing ? 'text-emerald-400' : attachedItems.length > 0 ? 'text-blue-400' : 'text-slate-500'
          }`}>
            {isDepositing
              ? 'RECYCLING...'
              : attachedItems.length > 0
              ? `DEPOSIT ${attachedItems.length} METALS!`
              : 'DRAG LOADED MAGNET HERE'}
          </div>
        </div>

        {/* Hazard Stun warning overlay */}
        {craneStunned > 0 && (
          <div className="absolute inset-0 bg-red-950/60 backdrop-blur-xs flex flex-col items-center justify-center z-40 pointer-events-none">
            <span className="text-4xl animate-bounce">⚠️</span>
            <div className="text-red-400 font-black text-lg italic uppercase tracking-wider mt-2">
              SYSTEM STALLED!
            </div>
            <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">
              CRANE OVERLOAD PENALTY
            </div>
          </div>
        )}

        {/* Instruction Intro overlay */}
        {showInstruction && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/60 backdrop-blur-sm">
            <div className="text-center p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="text-5xl mb-2 animate-bounce">⛏️</div>
              <div className="text-emerald-400 font-black text-sm uppercase tracking-widest">
                ACTIVE RECOVERY
              </div>
              <div className="text-white text-xs mt-2 max-w-xs leading-relaxed">
                1. Tap <strong>🌫️ (Dug Mounds)</strong> to excavate scrap.<br />
                2. Hover your <strong>🧲 Crane</strong> over scrap to secure it.<br />
                3. Drag load to the <strong>RECYCLING bin</strong> to earn points!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Battery indicator */}
      <div className="absolute bottom-12 w-full max-w-[300px] px-8 z-20">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CRANE BATTERY</span>
          <span className="text-white font-mono text-xl font-black">{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            animate={{ width: `${(timeLeft / 12) * 100}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        {isRareFound && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 text-center text-yellow-400 font-black text-[10px] uppercase tracking-[0.3em]"
          >
            ✨ {rareLabel} ✨
          </motion.div>
        )}
      </div>
    </div>
  );
};
