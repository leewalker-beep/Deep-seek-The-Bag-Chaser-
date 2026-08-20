import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { type HeroArtwork } from '../../config/heroArtwork';
import { useGameStore } from '../../store/gameStore';
import { BACKGROUND_CATEGORIES } from '../../config/backgrounds';
import { analyzeBehavior } from '../../utils/personalityAnalyzer';
import { type PlayerStats } from '../../types/game';
import { detectIdentityEvolution } from '../../utils/identitySystem';
import {
  ADVISOR_CONGRATULATIONS,
  PLAYSTYLE_QUOTES,
  type PlaystyleQuote,
  determinePlaystyle,
  calculateTransitionDuration,
  generateDynamicChapterIntro,
} from '../../utils/cinematicUtils';

export { PLAYSTYLE_QUOTES, type PlaystyleQuote, determinePlaystyle, calculateTransitionDuration, generateDynamicChapterIntro };

interface CinematicTransitionProps {
  artwork: HeroArtwork;
  onComplete: () => void;
}
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

  // 1. Starter & Origin Block
  const startChunk = `From your origins as a ${originName} working as a ${backgroundVariationName}, you have completely rewritten your destiny, ${name}.`;

  // 2. First Hustle & Most Played Hustle
  let firstHustleName = "";
  if (pl.actionLog && pl.actionLog.length > 0) {
    const firstHustleAction = [...pl.actionLog].sort((a, b) => a.timestamp - b.timestamp).find(act => act.hustleId && act.hustleId !== 'r_sleep' && act.hustleId !== 'power_nap');
    if (firstHustleAction) {
      firstHustleName = firstHustleAction.hustleName;
    }
  }

  let mostPlayedHustleName = "";
  if (pl.hustlePlays && Object.keys(pl.hustlePlays).length > 0) {
    const sorted = Object.entries(pl.hustlePlays).sort((a, b) => b[1] - a[1]);
    const favoriteId = sorted[0]?.[0];
    if (favoriteId) {
      const action = pl.actionLog?.find(a => a.hustleId === favoriteId);
      mostPlayedHustleName = action ? action.hustleName : favoriteId.replace(/_/g, ' ').toUpperCase();
    }
  }

  let climbChunk = "";
  if (firstHustleName && mostPlayedHustleName && firstHustleName !== mostPlayedHustleName) {
    climbChunk = ` Starting out with ${firstHustleName}, you went on to make ${mostPlayedHustleName} your trademark engine of growth.`;
  } else if (mostPlayedHustleName) {
    climbChunk = ` You built your momentum by mastering ${mostPlayedHustleName}, paving the way with absolute focus.`;
  }

  // 3. Businesses Built & Passives
  const businesses: string[] = [];
  if (pl.hustleLevels) {
    if ((pl.hustleLevels['sw'] || 0) > 0) businesses.push("Streetwear Fashion Brand");
    if ((pl.hustleLevels['audio'] || 0) > 0) businesses.push("Audio & Record Label");
    if ((pl.hustleLevels['saas_mvp'] || 0) > 0) businesses.push("SaaS Platform");
    if ((pl.hustleLevels['real_estate_empire'] || 0) > 0 || pl.rentalCount > 0) businesses.push("Real Estate Holding");
    if ((pl.hustleLevels['h_global_conglomerate'] || 0) > 0) businesses.push("Global Conglomerate");
    if ((pl.hustleLevels['venture_capital'] || 0) > 0) businesses.push("Venture Capital Fund");
  }

  let businessChunk = "";
  if (businesses.length > 0) {
    const businessList = businesses.slice(0, 2).join(" and ");
    businessChunk = ` Turning ideas into massive assets like your ${businessList}, you shifted from a simple worker to an empire builder.`;
  }

  // 4. Playstyle Recognition & Identity Trajectory
  const playstyleInfo = determinePlaystyle(pl);
  const identityTrajectory = detectIdentityEvolution(pl);
  const playstyleChunk = ` ${playstyleInfo.narration} ${identityTrajectory}`;

  // 5. Emotional Callbacks (Rare and meaningful)
  const callbacks: string[] = [];

  const isLowIncomeOrigin = pl.categoryId === 'street_kid' || pl.categoryId === 'immigrant' || pl.categoryId === 'debt_bound';
  if (isLowIncomeOrigin && (tier === 'STREET' || tier === 'STARTUP' || tier === 'CORPORATE')) {
    callbacks.push("I remember when your biggest concern was paying next week's rent.");
  }

  const ranVending = (pl.hustleLevels?.['r_vending'] || 0) > 0 || (pl.vendingCount && pl.vendingCount > 0);
  if (ranVending && (tier === 'STARTUP' || tier === 'CORPORATE' || tier === 'ELITE')) {
    callbacks.push("It wasn't long ago you celebrated your very first vending machine.");
  }

  const ranRentals = pl.rentalCount > 0 || pl.rentPortfolioCount > 0 || (pl.hustleLevels?.['real_estate_empire'] || 0) > 0;
  if (ranRentals && (tier === 'ELITE' || tier === 'MOGUL')) {
    callbacks.push("Years ago you questioned whether buying that first property was the right decision.");
  }

  const isControversial = (pl.scandalCount && pl.scandalCount > 0) || (pl.arrestCount && pl.arrestCount > 0) || pl.heat > 50 || pl.narrativeFlags?.publicReputation === 'The Controversial Tycoon';
  if (isControversial && (tier === 'CORPORATE' || tier === 'ELITE' || tier === 'MOGUL' || tier === 'PRESIDENT')) {
    callbacks.push("The newspapers once doubted your vision.");
  }

  let selectedCallback = "";
  if (callbacks.length > 0) {
    const idx = (pl.month || 1) % callbacks.length;
    selectedCallback = callbacks[idx];
  }

  const callbackChunk = selectedCallback ? ` ${selectedCallback}` : "";

  // 6. Comebacks (Greatest Comeback)
  let comebackChunk = "";
  if (pl.masteredHustles?.includes('the_phoenix') || pl.unlockedAchievements?.includes('COMEBACK_MILLIONAIRE') || pl.unlockedAchievements?.includes('COMEBACK_BILLIONAIRE')) {
    comebackChunk = " When setbacks threatened to bury you, you rose like a phoenix, turning near-ruin into your greatest comeback.";
  }

  // 7. Political / Allies / Specialization Chunks
  let legacyChunk = "";
  const specLabel = pl.activeSpecializationId ? pl.activeSpecializationId.replace(/_/g, ' ').toUpperCase() : "";
  const cabinetSize = pl.cabinet ? Object.keys(pl.cabinet).length : 0;
  const allyCount = (pl.rivals || []).filter(r => r.status === 'ally').length;

  if (tier === 'PRESIDENT') {
    legacyChunk = ` Today, Commander-in-Chief ${name}, backed by a hand-picked cabinet of ${cabinetSize} and your specialized ${specLabel || "POLITICAL"} leadership, the national stage is yours.`;
  } else if (allyCount > 0) {
    legacyChunk = ` Backed by a specialized path in ${specLabel || "finance"} and with ${allyCount} recruited former rival allies standing by your side, your grip on the city is unbreakable.`;
  } else if (specLabel) {
    legacyChunk = ` Stepping forward as a specialized ${specLabel}, your name commands immediate respect in every boardroom.`;
  }

  // Combine into highly personalized, adaptive narrative
  return `${startChunk}${climbChunk}${businessChunk}${playstyleChunk}${callbackChunk}${comebackChunk}${legacyChunk}`.trim();
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
  const updatePl = useGameStore(state => state.updatePl);

  const isTier = ['MUD', 'STREET', 'STARTUP', 'CORPORATE', 'ELITE', 'MOGUL', 'LEGEND', 'PRESIDENT', 'OPEN'].includes(artwork.id);

  const playstyle = useMemo(() => determinePlaystyle(pl), [pl]);

  const quotesList = useMemo(() => {
    return PLAYSTYLE_QUOTES[playstyle.id] || PLAYSTYLE_QUOTES.steady_builder;
  }, [playstyle]);

  const selectedQuote = useMemo(() => {
    if (!pl) return { id: 'default', text: artwork.quote, author: "" };

    const shownFlags = pl.narrativeFlags || {};
    const unshown = quotesList.find(q => !shownFlags[`quote_shown_${q.id}`]);

    if (unshown) return unshown;

    const idx = (pl.month || 0) % quotesList.length;
    return quotesList[idx];
  }, [pl, quotesList, artwork.quote]);

  const congratulatoryLine = isTier
    ? generateDynamicChapterIntro(pl, artwork.id)
    : ADVISOR_CONGRATULATIONS[artwork.id];

  const activeQuoteText = isTier ? selectedQuote.text : artwork.quote;

  const dynamicDuration = useMemo(() => {
    return calculateTransitionDuration(congratulatoryLine, activeQuoteText);
  }, [congratulatoryLine, activeQuoteText]);

  const startTimeRef = useRef<number>(Date.now());
  const completedRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = () => {
    if (completedRef.current) return;
    // 400ms grace period to prevent accidental skip from rapid taps during transition fade-in
    if (Date.now() - startTimeRef.current < 400) return;

    completedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onComplete();
  };

  useEffect(() => {
    if (isTier) {
      playChime();
    }
    startTimeRef.current = Date.now();
    completedRef.current = false;

    timerRef.current = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, dynamicDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [onComplete, isTier, dynamicDuration]);

  useEffect(() => {
    if (isTier && selectedQuote && selectedQuote.id !== 'default' && pl && updatePl) {
      const shownKey = `quote_shown_${selectedQuote.id}`;
      if (!pl.narrativeFlags?.[shownKey]) {
        updatePl({
          narrativeFlags: {
            ...(pl.narrativeFlags || {}),
            [shownKey]: true
          }
        });
      }
    }
  }, [isTier, selectedQuote, pl, updatePl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleDismiss}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{ pointerEvents: 'auto' }}
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
            "{isTier ? selectedQuote.text : artwork.quote}"
          </p>

          {isTier && selectedQuote.author && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] -mt-2"
            >
              — {selectedQuote.author}
            </motion.p>
          )}

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

          {/* Decorative Progress/Timer Line & Tap Indicator */}
          <div className="space-y-2">
            <div className="w-48 h-1 bg-slate-800 mx-auto rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: Math.max(0.1, dynamicDuration / 1000 - 0.2), ease: "linear" }}
                className="h-full"
                style={{ backgroundColor: artwork.color }}
              />
            </div>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block opacity-70">
              Tap anywhere to skip
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
