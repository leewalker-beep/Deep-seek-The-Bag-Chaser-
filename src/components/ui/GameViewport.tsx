import React, { useState } from 'react';

interface GameViewportProps {
  title: string;
  level?: number;
  onExit?: () => void;
  children: React.ReactNode;
  containerClassName?: string;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  title,
  level,
  onExit,
  children,
  containerClassName = '',
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <div className={`fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] pb-safe pt-safe px-4 overflow-hidden ${containerClassName}`}>
      <div className="w-full max-w-md bg-zinc-950 rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl border border-zinc-800 relative min-h-[500px]">
        {/* Consistent Immersive Header */}
        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-orange-400 mb-3 border-b border-zinc-800 pb-2">
          <span className="truncate max-w-[200px] uppercase tracking-wider">🎮 {title} {level !== undefined ? `L${level}` : ''}</span>
          {onExit && (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-red-400 hover:text-red-300 transition-colors uppercase font-black"
              title="Quit game"
            >
              ✕ Quit
            </button>
          )}
        </div>

        {/* Play Area / Child component */}
        <div className="flex-1 flex flex-col justify-center overflow-y-auto relative no-scrollbar min-h-0 w-full">
          {children}
        </div>

        {/* Exit Confirmation Overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 flex items-center justify-center z-[250] bg-black/95 backdrop-blur-sm rounded-xl">
            <div className="text-center p-6">
              <div className="text-4xl mb-3">🚨</div>
              <div className="text-orange-500 font-black text-sm uppercase tracking-widest">
                QUIT MINIGAME?
              </div>
              <p className="text-zinc-400 text-xs mt-2 max-w-xs leading-relaxed font-sans">
                Are you sure you want to quit? Your current run will end and yield basic default rewards.
              </p>
              <div className="flex justify-center gap-3 mt-5">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2 rounded bg-zinc-800 text-white font-mono font-bold text-xs border border-zinc-700"
                >
                  Keep Playing
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    if (onExit) onExit();
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white font-mono font-bold text-xs"
                >
                  Yes, Quit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
