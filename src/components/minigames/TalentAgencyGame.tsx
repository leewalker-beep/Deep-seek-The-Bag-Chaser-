import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ConcentrationMatch } from './ConcentrationMatch';
import { CHARACTERS } from '../../config/characters';

interface TalentAgencyGameProps {
  onComplete: (result: { success: boolean; multiplier: number; celebrity?: any }) => void;
  level?: number;
}

const CREATOR_POOL = [
  { name: "Slam-Dunk Marcus", avatar: "🏀", bio: "High-school basketball captain with a 40-inch vertical." },
  { name: "Vlog Titan Jenny", avatar: "📹", bio: "Unfiltered suburban makeup & drama YouTuber." },
  { name: "Skate-King Tony", avatar: "🛹", bio: "Local halfpipe legend with a massive TikTok following." },
  { name: "Lil Spitfire", avatar: "🎤", bio: "16-year-old rapid-fire freestyle bedroom rapper." },
  { name: "Gamer-Girl Chloe", avatar: "🎮", bio: "Semi-pro speedrunner who stream-rages with charisma." },
  { name: "Heavy-Lifter Dan", avatar: "🏋️‍♂️", bio: "17-year-old strongman competitor who eats raw eggs." },
  { name: "Speed-Demon Sarah", avatar: "🏃‍♀️", bio: "State record-holding track sprinter with huge endorsement buzz." },
  { name: "Ninja Kai", avatar: "🥋", bio: "Tricking and parkour artist who flips off rooftops." },
  { name: "Glam-Queen Sasha", avatar: "💄", bio: "Aspiring high-fashion model who does street-style shoots." },
  { name: "DJ Bass-Drop", avatar: "🎧", bio: "Part-time school DJ producing bass-boosted mashups." },
];

export const TalentAgencyGame: React.FC<TalentAgencyGameProps> = ({
  onComplete,
  level = 1,
}) => {
  const [signedTalent, setSignedTalent] = useState<any | null>(null);

  // Grid sizing: levels 1-2 = 12 cards (6 pairs), levels 3-4 = 16 cards (8 pairs), level 5+ = 20 cards (10 pairs)
  const pairsCount = useMemo(() => {
    if (level <= 2) return 6;
    if (level <= 4) return 8;
    return 10;
  }, [level]);

  // Selected sub-pool for this specific game round
  const gamePool = useMemo(() => {
    // Shuffle pool and slice pairsCount
    const shuffled = [...CREATOR_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, pairsCount);
  }, [pairsCount]);

  // Map gamePool to a format ConcentrationMatch can use
  const cardSet = useMemo(() => {
    return gamePool.map((creator) => ({
      id: creator.name,
      label: creator.name,
      image: creator.avatar,
    }));
  }, [gamePool]);

  const handleMatchComplete = (
    isWin: boolean,
    _multiplier: number,
    timeLeft: number,
    mismatches: number
  ) => {
    let celebrityToSign: any = null;

    if (isWin) {
      // Select a random creator from the current game round's pool to sign
      const randomCreator = gamePool[Math.floor(Math.random() * gamePool.length)];
      // Calculate starting relationshipScore (capped at 100, min 10)
      const calculatedScore = Math.max(
        10,
        Math.min(100, Math.floor(50 + timeLeft * 1.5 - mismatches * 4))
      );

      const lowerName = randomCreator.name.toLowerCase();
      const matchingChar = CHARACTERS.find(c =>
        lowerName.includes(c.name.split(' ')[0].toLowerCase()) ||
        (c.nickname && lowerName.includes(c.nickname.toLowerCase()))
      );

      celebrityToSign = {
        id: `cel_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        characterId: matchingChar?.id,
        name: randomCreator.name,
        avatar: randomCreator.avatar,
        relationshipScore: calculatedScore,
        isUnlocked: true,
      };

      setSignedTalent(celebrityToSign);
    }

    return {
      success: isWin,
      celebrity: celebrityToSign,
    };
  };

  const renderGameOverOverlay = (
    isWin: boolean,
    _multiplier: number,
    mismatches: number,
    pairsCount: number,
    _timeLeft: number,
    extraData?: any
  ) => {
    const talent = extraData?.celebrity || signedTalent;
    const success = extraData?.success ?? isWin;

    return (
      <div className="flex flex-col items-center justify-center text-center">
        {success ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <motion.div
              initial={{ scale: 0.5, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="text-6xl animate-bounce"
            >
              ✨{talent?.avatar || '👑'}✨
            </motion.div>
            <div className="text-xl font-black text-white italic uppercase tracking-tighter">
              AUDITIONS COMPLETE!
            </div>
            <div className="text-purple-400 font-bold text-xs uppercase tracking-wider">
              Signed: <span className="text-white font-black">{talent?.name}</span>
            </div>
            <div className="text-slate-400 font-mono text-[10px] uppercase">
              Starting Rel: <span className="text-emerald-400 font-black">{talent?.relationshipScore}/100</span>
            </div>
            <div className="text-slate-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-slate-900 border border-slate-800 rounded-full mt-2">
              RATING: {mismatches <= pairsCount - 2 ? 'EXCELLENT RECRUIT' : mismatches <= pairsCount + 2 ? 'GOOD RECRUIT' : 'STANDARD CONTRACT'}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="text-6xl">
              📉
            </div>
            <div className="text-xl font-black text-white italic uppercase tracking-tighter">
              RECRUITMENT TERMINATED
            </div>
            <p className="text-red-400 text-[9px] font-black uppercase tracking-widest">
              TIME LIMIT EXPIRED
            </p>
            <p className="text-slate-500 text-[8px] font-bold uppercase tracking-wider leading-relaxed max-w-[200px]">
              Scouts got tired of waiting. Retrying is recommended for optimal contract placement.
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleConcentrationComplete = (multiplier: number, extraData?: any) => {
    onComplete({
      success: extraData?.success ?? false,
      multiplier,
      celebrity: extraData?.celebrity || undefined,
    });
  };

  return (
    <ConcentrationMatch
      onComplete={handleConcentrationComplete}
      level={level}
      tier="CORPORATE"
      cardSet={cardSet}
      theme="purple"
      title="TALENT RECRUIT"
      subtitle='"GUESS WHO?" AUDITION MATRIX'
      description='Flipping audition files to match creator faces. Clear the roster board before scouts leave. Fewer mismatches signs top-tier talent with high starting relationships!'
      startBtnText="START RECRUITMENT"
      icon="🎭"
      cardBackIcon="🎭"
      delayMs={2500}
      onMatchComplete={handleMatchComplete}
      renderOverlay={renderGameOverOverlay}
    />
  );
};
