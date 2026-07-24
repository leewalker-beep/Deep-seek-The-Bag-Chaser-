import React, { useState, useEffect } from 'react';

export const ConcertJam: React.FC<{
  level: number;
  onComplete: (win: boolean) => void;
  performingArtists?: Array<{ name: string; avatar?: string }>;
}> = ({ level, onComplete, performingArtists }) => {
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState(50);
  const [playerPos, setPlayerPos] = useState(50);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    // Target moves back and forth
    const interval = setInterval(() => {
      setTargetPos(Math.floor(Math.random() * 80) + 10);
    }, Math.max(400, 1000 - level * 100));
    return () => clearInterval(interval);
  }, [level]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score >= 15);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [timeLeft, score]);

  const handleJam = () => {
    const diff = Math.abs(playerPos - targetPos);
    if (diff < 15) {
      setScore(s => s + 3);
    } else if (diff < 30) {
      setScore(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 2));
    }
  };

  return (
    <div className="flex flex-col items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 text-center text-white font-mono select-none">
      <div className="w-full flex justify-between text-[9px] text-zinc-400">
        <span>🎸 CONCERT JAM ARENA</span>
        <span>HYPING: {score}/15 PTS</span>
        <span className="text-red-400 font-bold">{timeLeft.toFixed(1)}s</span>
      </div>

      {performingArtists && performingArtists.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center py-1.5 px-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50 w-full" data-testid="concert-jam-artists">
          {performingArtists.map((artist, idx) => (
            <span key={idx} className="text-[10px] font-bold text-purple-400 bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1" data-testid={`artist-${artist.name}`}>
              <span>{artist.avatar || '🎤'}</span>
              <span>{artist.name}</span>
            </span>
          ))}
        </div>
      )}

      <p className="text-[11px] font-medium text-slate-200">Align with the beat tracker: Move slider and TAP!</p>

      <div className="w-full bg-zinc-900 h-8 rounded-lg relative overflow-hidden border border-zinc-800">
        {/* Target Indicator */}
        <div
          className="absolute h-full w-8 bg-purple-500/40 border-l border-r border-purple-400 flex items-center justify-center text-xs"
          style={{ left: `${targetPos}%`, transform: 'translateX(-50%)' }}
        >
          🎵
        </div>
        {/* Player Indicator */}
        <div
          className="absolute h-full w-2 bg-emerald-400 shadow-glow"
          style={{ left: `${playerPos}%`, transform: 'translateX(-50%)' }}
        />
      </div>

      <input
        type="range"
        min="5"
        max="95"
        value={playerPos}
        onChange={(e) => setPlayerPos(Number(e.target.value))}
        className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
      />

      <button
        onClick={handleJam}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 rounded-xl font-bold uppercase tracking-wider text-[11px] active:scale-95 transition-transform"
      >
        💥 HIT THE BEAT
      </button>
    </div>
  );
};
