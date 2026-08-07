import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface BeatSequenceProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const BeatSequence: React.FC<BeatSequenceProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [nodes, setNodes] = useState<{ id: string; position: number; lane: number; targetValue: 'mic' | 'beat' }[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [failed, setFailed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null);

  const scaling = getScalingMultiplier(level, tier);
  const targetScore = 5 + (level * 3); // Level 1 only requires 8 hits now (down from 15)
  const speed = 1.5 + (level * 0.3) * Math.sqrt(scaling);

  // Keyboard references for visual press states
  const [activeLanes, setActiveLanes] = useState<Record<number, boolean>>({});

  // Inside your rhythmic node/beat spawner interval loop:
  const spawnBeatNodes = () => {
    // Level 1 spawns 1 drop at a time.
    // Level 2+ randomly schedules 2 to 3 multi-drops or tight successive notes.
    const dropCount = level === 1 ? 1 : Math.floor(Math.random() * 2) + 2; // yields 2 or 3 drops

    const newNodes: { id: string; position: number; lane: number; targetValue: 'mic' | 'beat' }[] = [];
    for (let i = 0; i < dropCount; i++) {
      newNodes.push({
        id: Math.random().toString(),
        position: 0, // start line
        lane: level === 1 ? 0 : Math.floor(Math.random() * 3), // spread across multi-lanes if supported
        targetValue: Math.random() > 0.5 ? 'mic' : 'beat'
      });
    }

    setNodes(prev => [...prev, ...newNodes]);
  };

  // Node movement loop
  useEffect(() => {
    if (failed || isCompleted) return;

    const moveInterval = setInterval(() => {
      setNodes(prev => {
        const next = prev.map(node => ({
          ...node,
          position: node.position + speed
        }));

        // Filter out missed nodes (went past 100)
        const missed = next.filter(node => node.position > 100);
        if (missed.length > 0) {
          setTotalAttempts(t => {
            const nextTotal = t + missed.length;
            if (nextTotal >= targetScore + 10) {
              setFailed(true);
            }
            return nextTotal;
          });
          setFeedback('miss');
          setTimeout(() => setFeedback(null), 200);
          if (navigator.vibrate) navigator.vibrate([30, 30]);
        }

        return next.filter(node => node.position <= 100);
      });
    }, 20);

    return () => clearInterval(moveInterval);
  }, [failed, isCompleted, speed, targetScore]);

  // Spawner interval
  useEffect(() => {
    if (failed || isCompleted) return;

    // Spawn every 1.5 to 1.0 seconds
    const intervalTime = Math.max(800, 1600 - (level * 200));
    const spawnInterval = setInterval(() => {
      spawnBeatNodes();
    }, intervalTime);

    return () => clearInterval(spawnInterval);
  }, [failed, isCompleted, level]);

  // Handle Lane Hits
  const handleHit = (laneIndex: number) => {
    if (failed || isCompleted) return;

    // Target range: position between 70% and 90%
    const targetRange = [70, 90];
    const laneNodes = nodes.filter(n => n.lane === laneIndex);
    const hitNode = laneNodes.find(n => n.position >= targetRange[0] && n.position <= targetRange[1]);

    const newTotal = totalAttempts + 1;
    let newScore = score;

    if (hitNode) {
      newScore = score + 1;
      setScore(newScore);
      setNodes(prev => prev.filter(n => n.id !== hitNode.id));
      setFeedback('hit');
      if (navigator.vibrate) navigator.vibrate(25);
    } else {
      setFeedback('miss');
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }

    setTotalAttempts(newTotal);
    setTimeout(() => setFeedback(null), 200);

    if (newScore >= targetScore) {
      setIsCompleted(true);
      const perfBase = 4.0; // max performance on success
      const multiplier = perfBase * (0.8 + scaling * 0.2);
      setTimeout(() => onComplete(multiplier), 600);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (failed || isCompleted) return;

      let lane = -1;
      if (level === 1) {
        if (e.key === 'a' || e.key === 's' || e.key === 'd' || e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          lane = 0;
        }
      } else {
        if (e.key === 'a' || e.key === 'ArrowLeft') lane = 0;
        else if (e.key === 's' || e.key === 'ArrowDown') lane = 1;
        else if (e.key === 'd' || e.key === 'ArrowRight') lane = 2;
      }

      if (lane !== -1) {
        e.preventDefault();
        setActiveLanes(prev => ({ ...prev, [lane]: true }));
        handleHit(lane);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let lane = -1;
      if (level === 1) {
        lane = 0;
      } else {
        if (e.key === 'a' || e.key === 'ArrowLeft') lane = 0;
        else if (e.key === 's' || e.key === 'ArrowDown') lane = 1;
        else if (e.key === 'd' || e.key === 'ArrowRight') lane = 2;
      }

      if (lane !== -1) {
        setActiveLanes(prev => ({ ...prev, [lane]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nodes, score, totalAttempts, failed, isCompleted, level]);

  // Handle Failure Quit
  const handleCutTrack = () => {
    const accuracy = totalAttempts > 0 ? score / totalAttempts : 0;
    let perfBase = 0.5;
    if (accuracy >= 0.8) perfBase = 2.5;
    else if (accuracy >= 0.5) perfBase = 1.2;

    const multiplier = perfBase * (0.8 + scaling * 0.2);
    onComplete(multiplier);
  };

  const laneCount = level === 1 ? 1 : 3;

  if (failed) {
    return (
      <div className="h-[450px] w-full bg-slate-950 border-4 border-red-600 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔇</div>
        <h2 className="text-3xl font-black text-red-500 mb-2 italic tracking-tighter uppercase">RHYTHM LOST</h2>
        <p className="text-slate-400 mb-8 font-bold uppercase tracking-widest text-[10px]">
          HIT {score} OF THE REQUIRED {targetScore}
        </p>
        <button
          onClick={handleCutTrack}
          className="px-10 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-500 transition-all uppercase tracking-tighter border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
        >
          CUT THE TRACK
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full transition-colors duration-200 flex flex-col items-center justify-between p-2 relative overflow-hidden ${
      feedback === 'hit' ? 'bg-emerald-950/10' :
      feedback === 'miss' ? 'bg-red-950/10' :
      'bg-transparent'
    }`}>

      {/* 1. HEADER SECTION (with clean padding-bottom, explicit block separation, and z-10) */}
      <div className="text-center flex flex-col items-center gap-1 mb-2 relative z-10">
        <h1 className="text-lg font-black italic tracking-wider text-blue-400">FLOW STATE L{level}</h1>
        <div className="bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800/60 text-[11px] font-mono text-slate-300">
          ⚡ TRACK PROFILE: <span className="text-emerald-400 font-bold">{score}</span> / <span className="text-slate-500">{targetScore}</span>
        </div>
      </div>

      {/* RHYTHM TRACKS BOARD */}
      <div className="w-full flex-1 max-h-[220px] bg-slate-900/80 rounded-2xl border border-slate-800 relative overflow-hidden flex shadow-inner">

        {/* Target Zone Line overlay */}
        <div
          className="absolute left-0 right-0 h-[30px] bg-blue-500/10 border-y border-blue-500/30 pointer-events-none z-10"
          style={{ top: '80%', transform: 'translateY(-50%)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-blue-400/40 uppercase tracking-widest">
            HIT ZONE
          </div>
        </div>

        {/* Lanes */}
        {Array.from({ length: laneCount }).map((_, laneIdx) => (
          <div
            key={laneIdx}
            onClick={() => handleHit(laneIdx)}
            className={`flex-1 h-full border-r border-slate-800 last:border-r-0 relative flex flex-col justify-end items-center cursor-pointer transition-colors duration-100 ${
              activeLanes[laneIdx] ? 'bg-blue-950/20' : 'hover:bg-slate-800/20'
            }`}
          >
            {/* Visual Lane label/key-hint */}
            <div className="absolute bottom-1 text-[8px] font-mono text-slate-600 font-bold">
              {level === 1 ? 'SPACE / ANY' : laneIdx === 0 ? 'A / ◄' : laneIdx === 1 ? 'S / ▼' : 'D / ►'}
            </div>

            {/* Nodes flowing in this lane */}
            {nodes
              .filter(n => n.lane === laneIdx)
              .map(node => (
                <motion.div
                  key={node.id}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-lg font-black border-2 shadow-lg ${
                    node.targetValue === 'mic'
                      ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/30'
                      : 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30'
                  }`}
                  style={{
                    top: `${node.position}%`,
                    transform: 'translateY(-50%)',
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  {node.targetValue === 'mic' ? '🎙️' : '🎵'}
                </motion.div>
              ))}
          </div>
        ))}
      </div>

      {/* INPUT TAP BUTTONS */}
      <div className="w-full flex gap-3 mt-4 z-10">
        {Array.from({ length: laneCount }).map((_, laneIdx) => (
          <button
            key={laneIdx}
            onTouchStart={() => handleHit(laneIdx)}
            onMouseDown={() => handleHit(laneIdx)}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider border-b-4 transition-all duration-700 active:translate-y-1 active:border-b-0 ${
              activeLanes[laneIdx]
                ? 'bg-blue-500 text-white border-blue-700'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-950'
            }`}
          >
            {level === 1 ? 'TAP BEAT' : laneIdx === 0 ? 'LEFT (A)' : laneIdx === 1 ? 'CENTER (S)' : 'RIGHT (D)'}
          </button>
        ))}
      </div>

      {/* FOOTER MESSAGE */}
      <div className="mt-2 text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5 z-10">
        {isCompleted ? (
          <span className="text-emerald-400 animate-pulse font-bold">🎯 MASTERPIECE RECORDED! RESOLVING...</span>
        ) : (
          <>
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>🎹</motion.span>
            <span>LAY THE BEAT ({targetScore} NOTES TO LOCK IN)</span>
          </>
        )}
      </div>

      {/* FEEDBACK OVERLAY */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            className={`absolute font-black text-5xl italic pointer-events-none z-30 ${
              feedback === 'hit' ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            }`}
            style={{ top: '45%' }}
          >
            {feedback === 'hit' ? 'PERFECT!' : 'MISS!'}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
