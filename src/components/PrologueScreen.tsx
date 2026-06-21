import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BACKGROUND_CATEGORIES, type Background, type BackgroundCategory } from '../config/backgrounds';

interface PrologueScreenProps {
  onStart: (name: string, backgroundId: string, categoryId: string, variationId: string) => void;
}

const SILHOUETTES = [
  { id: 1, icon: '📦', speed: 45, delay: 0, direction: 'ltr', bottom: '10%' },
  { id: 2, icon: '🚲', speed: 35, delay: 15, direction: 'rtl', bottom: '25%' },
  { id: 3, icon: '💰', speed: 55, delay: 5, direction: 'ltr', bottom: '15%' },
  { id: 4, icon: '🛒', speed: 40, delay: 25, direction: 'rtl', bottom: '20%' },
  { id: 5, icon: '🚶', speed: 50, delay: 10, direction: 'ltr', bottom: '5%' },
];

const THEMES: Record<string, { bg: string, glow: string }> = {
  industrial: { bg: 'bg-zinc-900', glow: 'shadow-zinc-500/20' },
  neon: { bg: 'bg-slate-900', glow: 'shadow-cyan-500/30' },
  gritty: { bg: 'bg-stone-950', glow: 'shadow-orange-900/20' },
  studio: { bg: 'bg-neutral-900', glow: 'shadow-purple-500/20' },
  tech: { bg: 'bg-gray-950', glow: 'shadow-emerald-500/20' },
};

export const PrologueScreen: React.FC<PrologueScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [revealedVariation, setRevealedVariation] = useState<Background | null>(null);
  const [revealedCategory, setRevealedCategory] = useState<BackgroundCategory | null>(null);

  const handleReveal = () => {
    if (name.trim() && selectedCatId) {
      const category = BACKGROUND_CATEGORIES.find(c => c.id === selectedCatId);
      if (category) {
        const variations = category.variations;
        const randomVar = variations[Math.floor(Math.random() * variations.length)];
        setRevealedVariation(randomVar);
        setRevealedCategory(category);
      }
    }
  };

  const handleFinalStart = () => {
    if (name.trim() && revealedVariation && revealedCategory) {
      onStart(name.trim().toUpperCase(), revealedVariation.id, revealedCategory.id, revealedVariation.id);
    }
  };

  const categories = [
    { id: 'street_kid', icon: '🏙️', name: 'Street Kid', desc: 'You grew up with nothing. Every dollar feels like survival.' },
    { id: 'dropout', icon: '🎓', name: 'The Dropout', desc: 'You left school early to chase money. You have something to prove.' },
    { id: 'benefactor', icon: '🏛️', name: 'The Benefactor', desc: 'A head start from those who came before. You carry their legacy.' },
  ];

  if (revealedVariation && revealedCategory) {
    const theme = THEMES[revealedVariation.backgroundStyle] || THEMES.gritty;

    return (
      <div className={`relative min-h-screen w-full ${theme.bg} overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#4ade80]/30`}>
        {/* Subtle Grain Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] z-[1] mix-blend-overlay"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-8"
        >
          {/* Category Label */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400"
          >
            {revealedCategory.name}
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.4 }}
            className={`text-8xl md:text-9xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] ${theme.glow}`}
          >
            {revealedVariation.icon}
          </motion.div>

          {/* Variation Name */}
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {revealedVariation.name}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[#4ade80] italic text-sm md:text-base font-medium tracking-wide"
            >
              "{revealedVariation.flavorText}"
            </motion.p>
          </div>

          {/* Flavor Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xs"
          >
            {revealedVariation.flavor}
          </motion.p>

          {/* Starting Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-3 gap-4 w-full pt-4"
          >
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Bag</span>
              <span className="text-emerald-400 font-black text-lg">${revealedVariation.starterBag.toLocaleString()}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Clout</span>
              <span className="text-blue-400 font-black text-lg">{revealedVariation.starterClout}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Aura</span>
              <span className="text-purple-400 font-black text-lg">{revealedVariation.starterAura}</span>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={handleFinalStart}
            className="w-full mt-8 py-6 rounded-2xl bg-[#4ade80] text-[#050505] font-black uppercase tracking-[0.4em] text-xl transition-all duration-700 shadow-2xl shadow-[#4ade80]/20 active:scale-[0.97] hover:brightness-110"
          >
            Enter the World
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#4ade80]/30">
      {/* Cinematic Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#050505] z-0" />

      {/* Subtle Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-[1] mix-blend-overlay"
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-12 md:space-y-16 mb-24">

        {/* Title & Tagline */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          >
            BAG CHASER
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="text-slate-400 italic text-sm md:text-lg font-light tracking-widest uppercase opacity-70"
          >
            Escape the mud. Build the empire. Don't lose your soul.
          </motion.p>
        </div>

        {/* Interaction Form */}
        <div className="w-full space-y-10">

          {/* Identity Field */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="space-y-4"
          >
            <label className="block text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black opacity-50">
              Your story begins here.
            </label>
            <input
              type="text"
              placeholder="Enter your alias."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-center text-white text-xl focus:outline-none focus:border-white/20 transition-all placeholder:text-slate-800 font-bold tracking-tight"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && selectedCatId) {
                  handleReveal();
                }
              }}
            />
          </motion.div>

          {/* Category Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="space-y-4"
          >
            <label className="block text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black opacity-50">
              Who are you?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`flex items-center p-5 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${
                    selectedCatId === cat.id
                      ? 'border-white/40 bg-white/[0.05]'
                      : 'border-white/[0.05] bg-white/[0.01] hover:border-white/10'
                  }`}
                  style={{ minHeight: '96px' }}
                >
                  <span className="text-4xl mr-5 group-hover:scale-110 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0">{cat.icon}</span>
                  <div className="text-left flex-1">
                    <span className="block text-white font-black uppercase text-xs tracking-[0.15em] mb-1">{cat.name}</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-[240px]">
                      {cat.desc}
                    </p>
                  </div>
                  {selectedCatId === cat.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white/80 ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Primary Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="w-full pt-4"
        >
          <button
            onClick={handleReveal}
            disabled={!name.trim() || !selectedCatId}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xl transition-all duration-700 shadow-2xl min-h-[72px] ${
              name.trim() && selectedCatId
                ? 'bg-[#4ade80] text-[#050505] shadow-[#4ade80]/20 active:scale-[0.97] hover:brightness-110'
                : 'bg-white/5 text-slate-800 cursor-not-allowed border border-white/5'
            }`}
          >
            Begin the Grind
          </button>
        </motion.div>
      </div>

      {/* Cinematic Silhouettes (The Grind) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none z-[5] overflow-hidden select-none">
        {SILHOUETTES.map((s) => (
          <motion.div
            key={s.id}
            initial={{ x: s.direction === 'ltr' ? '-20vw' : '120vw', opacity: 0 }}
            animate={{
              x: s.direction === 'ltr' ? '120vw' : '-20vw',
              opacity: [0, 0.3, 0.3, 0]
            }}
            transition={{
              duration: s.speed,
              repeat: Infinity,
              delay: s.delay,
              ease: "linear",
              times: [0, 0.1, 0.9, 1]
            }}
            className="absolute text-7xl md:text-9xl brightness-0 filter grayscale invert-[0.1]"
            style={{
              bottom: s.bottom,
              color: '#1a1a1a',
              opacity: 0.1,
            }}
          >
            {s.icon}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
