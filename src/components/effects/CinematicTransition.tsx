import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { type HeroArtwork } from '../../config/heroArtwork';

interface CinematicTransitionProps {
  artwork: HeroArtwork;
  onComplete: () => void;
}

const ADVISOR_CONGRATULATIONS: Record<string, string> = {
  MUD: "Back to the grind. But this time, you have the lineage of giants.",
  STREET: "You've survived the mud, kid. Now let's see if you can claim the block.",
  STARTUP: "Incorporated and legitimate. Welcome to the real game. Make the numbers speak.",
  CORPORATE: "Suit up. We're playing with real leverage now. Institutional power is yours.",
  ELITE: "Sovereign wealth. You're entering a select club. Guard your neck; it's thin up here.",
  MOGUL: "A true empire. You've conquered commerce. Now, the ultimate seat of power beckons.",
  PRESIDENT: "Mr. President. Commander-in-Chief. You've reached the absolute peak of power.",
  LEGEND: "You've broken past the mortal grid. The sandbox is yours to reshape as you see fit."
};

const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Play a lovely major triad chord/rising chime
    const playNote = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    // Play sweet rising chime chord
    playNote(523.25, 0, 1.0);      // C5
    playNote(659.25, 0.15, 1.0);   // E5
    playNote(783.99, 0.3, 1.0);    // G5
    playNote(1046.50, 0.45, 1.2);  // C6
  } catch (e) {
    console.warn("Audio chime play failed:", e);
  }
};

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({ artwork, onComplete }) => {
  const isTier = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'LEGEND', 'PRESIDENT'].includes(artwork.id);
  const congratulatoryLine = ADVISOR_CONGRATULATIONS[artwork.id];

  useEffect(() => {
    if (isTier) {
      playChime();
    }
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete, isTier]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
      style={{ pointerEvents: 'auto' }} // Explicitly block input
    >
      {/* Background Hero Image with Hardware Accelerated Ken Burns Effect */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1.0, opacity: 0.4 }}
        transition={{ duration: 3.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${artwork.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
        }}
      />

      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Content Container */}
      <div className="relative z-[10] text-center px-6 max-w-lg space-y-6 flex flex-col items-center justify-center">
        {/* Giant Background Title Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 0.1, scale: 1.2, y: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="absolute inset-0 -z-10 flex items-center justify-center whitespace-nowrap select-none pointer-events-none"
        >
          <span className="text-[12rem] font-black text-white uppercase tracking-tighter opacity-10">
            {artwork.title}
          </span>
        </motion.div>

        <div className="space-y-1 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2"
            style={{ color: artwork.color }}
          >
            {artwork.subtitle}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-7xl font-black text-white uppercase tracking-tighter italic"
          >
            {artwork.title}
          </motion.h2>

          <motion.div
             initial={{ width: 0 }}
             animate={{ width: '100%' }}
             transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
             className="h-1 bg-white/20 mt-4 mx-auto"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="space-y-5 flex flex-col items-center"
        >
          <p className="text-slate-400 italic text-lg font-medium max-w-sm mx-auto leading-relaxed">
            "{artwork.quote}"
          </p>

          {isTier && congratulatoryLine && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl max-w-sm mx-auto space-y-1.5 shadow-2xl backdrop-blur-sm"
            >
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block">
                🧠 Advisor Message
              </span>
              <p className="text-xs font-semibold text-slate-200 uppercase tracking-wide leading-relaxed">
                "{congratulatoryLine}"
              </p>
            </motion.div>
          )}

          {/* Decorative Progress/Timer Line */}
          <div className="w-48 h-1 bg-slate-800 mx-auto rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.8, ease: "linear" }}
              className="h-full"
              style={{ backgroundColor: artwork.color }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
