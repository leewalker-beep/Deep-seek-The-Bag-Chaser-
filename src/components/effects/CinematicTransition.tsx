import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { type HeroArtwork } from '../../config/heroArtwork';
import { useGameStore } from '../../store/gameStore';
import { BACKGROUND_CATEGORIES } from '../../config/backgrounds';
import { analyzeBehavior } from '../../utils/personalityAnalyzer';
import { type PlayerStats } from '../../types/game';

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

export function generateDynamicChapterIntro(pl: PlayerStats, tier: string): string {
  if (!pl) return "Welcome to the next level of the grind.";

  const name = pl.name || "CHASER";

  // Find Origin Category Name and Variation Name
  let originName = "humble origins";
  let backgroundVariationName = "Hustler";

  const cat = BACKGROUND_CATEGORIES.find(c => c.id === pl.categoryId);
  if (cat) {
    originName = cat.name;
    const variation = cat.variations.find(v => v.id === pl.variationId);
    if (variation) {
      backgroundVariationName = variation.name;
    }
  }

  // Determine Public Reputation
  const publicReputation = (pl.narrativeFlags?.publicReputation as string) || "The Hustler";

  // Analyze playstyle via behavior
  const behavior = analyzeBehavior(pl);

  // Playstyle classification criteria
  const isCrimeBoss = publicReputation === 'The Crime Boss' || (pl.arrestCount && pl.arrestCount > 0) || pl.heat > 75;
  const isCharitable = publicReputation === 'The Philanthropist' || (pl.hustleLevels?.['philanthropy_empire'] || 0) > 0;
  const isInvestor = publicReputation === 'The Investor' || publicReputation === 'The Billionaire' || (pl.lastPassiveBreakdown?.finalTotal && pl.lastPassiveBreakdown.finalTotal > 50000) || pl.rentalCount > 0;
  const isRiskTaker = publicReputation === 'The Controversial Tycoon' || behavior.riskCadenceRatio > 0.4 || pl.heat > 60;

  let playstyleQuote = "Every block of this city was fought for. Every deal was earned.";

  if (isCrimeBoss) {
    playstyleQuote = "They respect you... or they fear you.";
  } else if (isRiskTaker) {
    playstyleQuote = "The city whispers your name. Some call you reckless. Others call you fearless.";
  } else if (isInvestor) {
    playstyleQuote = "Your empire wasn't built overnight. Every decision was calculated.";
  } else if (isCharitable) {
    playstyleQuote = "Success gave you influence. You chose to lift others.";
  }

  // Major choices and milestones strings
  const majorChoices: string[] = [];

  // Specialization
  if (pl.activeSpecializationId) {
    const specLabel = pl.activeSpecializationId.replace(/_/g, ' ').toUpperCase();
    majorChoices.push(`forging ahead as a specialized ${specLabel}`);
  }

  // Recruited rivals
  const recruitedRivalsCount = (pl.rivals || []).filter(r => r.status === 'ally').length;
  if (recruitedRivalsCount > 0) {
    majorChoices.push(`with ${recruitedRivalsCount} recruited former rival allies standing by your side`);
  }

  // Cabinet
  const cabinetSize = Object.keys(pl.cabinet || {}).length;
  if (cabinetSize > 0) {
    majorChoices.push(`backed by a hand-picked federal cabinet of ${cabinetSize} members`);
  }

  // Venture Capital Backed Founders
  const foundersCount = (pl.foundersBacked || []).length;
  if (foundersCount > 0) {
    majorChoices.push(`backing ${foundersCount} founders you believed in`);
  }

  // Record Label
  const artistsCount = (pl.artists || []).length;
  if (artistsCount > 0) {
    majorChoices.push(`managing a talent roster of ${artistsCount} signed artists`);
  }

  // Let's build the final text!
  let choicesText = "";
  if (majorChoices.length > 0) {
    choicesText = " Now, " + majorChoices.join(" and ") + ", you step onto the global stage.";
  }

  // Tier-specific narrative acknowledgment
  let tierAcknowledge = "";
  if (tier === 'STREET') {
    tierAcknowledge = `You survived the mud of the blocks, ${name}. As ${publicReputation}, your trajectory from a ${backgroundVariationName} is undeniable.`;
  } else if (tier === 'STARTUP') {
    tierAcknowledge = `Incorporation is complete, ${name}. From your ${originName} beginnings, you are turning ideas into systemic leverage.`;
  } else if (tier === 'CORPORATE') {
    tierAcknowledge = `Welcome to institutional power, ${name}. No longer just a ${backgroundVariationName}, you are playing the ultimate leverage game.`;
  } else if (tier === 'ELITE') {
    tierAcknowledge = `Sovereign wealth is yours, ${name}. The shadows of your ${originName} start are a lifetime away; protect your neck.`;
  } else if (tier === 'MOGUL') {
    tierAcknowledge = `A true global titan has risen, ${name}. Your diverse commercial holdings have reshaped the marketplace.`;
  } else if (tier === 'PRESIDENT') {
    tierAcknowledge = `Hail to the Chief, ${name}. From your beginnings as a ${backgroundVariationName}, you now command the executive fate of the nation.`;
  } else if (tier === 'OPEN' || tier === 'LEGEND') {
    tierAcknowledge = `You have transitioned past the mortal grid, ${name}. Your footprint as ${publicReputation} is permanently etched into the city's legend.`;
  } else {
    tierAcknowledge = `Back to the grind, ${name}. Your story as a ${backgroundVariationName} with ${originName} continues to unfold.`;
  }

  return `${tierAcknowledge} "${playstyleQuote}"${choicesText}`;
}

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
  const pl = useGameStore(state => state.pl);
  const isTier = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'LEGEND', 'PRESIDENT'].includes(artwork.id);
  const congratulatoryLine = isTier
    ? generateDynamicChapterIntro(pl, artwork.id)
    : ADVISOR_CONGRATULATIONS[artwork.id];

  useEffect(() => {
    if (isTier) {
      playChime();
    }
    const timer = setTimeout(onComplete, 4000);
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
              <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                "{congratulatoryLine}"
              </p>
            </motion.div>
          )}

          {/* Decorative Progress/Timer Line */}
          <div className="w-48 h-1 bg-slate-800 mx-auto rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.8, ease: "linear" }}
              className="h-full"
              style={{ backgroundColor: artwork.color }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
