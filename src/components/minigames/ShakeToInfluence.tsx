import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PourTheWineProps {
  onComplete: (multiplier: number) => void;
}

export const ShakeToInfluence: React.FC<PourTheWineProps> = ({ onComplete }) => {
  const [fillLevel, setFillLevel] = useState(0);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'ENDED'>('IDLE');
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'success' | 'fail' | 'spill' | null>(null);

  const gameActiveRef = useRef(false);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!gameActiveRef.current) return;

    // Beta is front-to-back tilt (-180 to 180)
    const beta = event.beta || 0;
    // Normalize: -90 (upright) to 0 (pouring)
    // Map to 0-100 fill level
    let rawFill = (beta + 90) / 90 * 100;
    rawFill = Math.max(0, Math.min(125, rawFill));
    setFillLevel(rawFill);

    if (rawFill > 105 && navigator.vibrate) navigator.vibrate(5);
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  const requestPermission = async () => {
    const DeviceOrientation = (window.DeviceOrientationEvent as unknown) as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setGameState('PLAYING');
          gameActiveRef.current = true;
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setPermissionGranted(false);
        }
      } catch {
        setPermissionGranted(false);
      }
    } else {
      if (window.DeviceOrientationEvent) {
         setPermissionGranted(true);
         setGameState('PLAYING');
         gameActiveRef.current = true;
         window.addEventListener('deviceorientation', handleOrientation);
      } else {
         setPermissionGranted(false);
      }
    }
  };

  const stopPouring = () => {
    if (gameState !== 'PLAYING') return;
    setGameState('ENDED');
    gameActiveRef.current = false;
    window.removeEventListener('deviceorientation', handleOrientation);

    let multiplier = 0.5;
    let currentFeedback: 'success' | 'fail' | 'spill' = 'fail';

    if (fillLevel > 110) {
      multiplier = 0.3;
      currentFeedback = 'spill';
    } else if (fillLevel >= 95 && fillLevel <= 105) {
      multiplier = 4.0;
      currentFeedback = 'success';
    } else if (fillLevel >= 85) {
      multiplier = 3.0;
      currentFeedback = 'success';
    } else if (fillLevel >= 70) {
      multiplier = 2.0;
      currentFeedback = 'fail';
    } else if (fillLevel >= 50) {
      multiplier = 1.0;
      currentFeedback = 'fail';
    } else {
      multiplier = 0.5;
      currentFeedback = 'fail';
    }

    setResult(multiplier);
    setFeedback(currentFeedback);
    if (navigator.vibrate) navigator.vibrate(currentFeedback === 'success' ? 100 : 50);

    setTimeout(() => {
      onComplete(multiplier);
    }, 2000);
  };

  const getFillColor = () => {
    if (fillLevel > 110) return 'bg-red-600';
    if (fillLevel >= 95 && fillLevel <= 105) return 'bg-emerald-500';
    if (fillLevel >= 85) return 'bg-red-500';
    return 'bg-red-400';
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-500 flex flex-col items-center justify-center touch-none select-none p-4 z-[100] ${
        feedback === 'success' ? 'bg-emerald-950/20' : feedback === 'spill' ? 'bg-red-950/40' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center w-full px-8">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">LOBBYING DINNER</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-red-500">🍷</motion.span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">INFLUENCE THE ROOM • POUR THE WINE</p>
        </div>
      </div>

      {!permissionGranted && permissionGranted !== false && gameState === 'IDLE' && (
        <div className="flex flex-col gap-4 z-20">
          <button
            onClick={requestPermission}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] border-b-4 border-blue-800"
          >
            ACTIVATE TILT SENSORS
          </button>
          <button
            onClick={() => {
                setPermissionGranted(false);
                setGameState('PLAYING');
                gameActiveRef.current = true;
            }}
            className="text-[10px] text-slate-500 underline font-black uppercase tracking-widest"
          >
            Manual Mode (Slider)
          </button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="flex flex-col items-center gap-10 w-full max-w-sm z-10">
          {/* Wine Glass */}
          <div className="relative w-56 h-72">
            <div className="absolute inset-0 border-8 border-slate-700 rounded-b-[120px] rounded-t-xl overflow-hidden bg-slate-900/50 shadow-2xl backdrop-blur-sm">
              <motion.div
                className={`absolute bottom-0 left-0 right-0 transition-colors duration-300 ${getFillColor()}`}
                animate={{ height: `${Math.min(100, fillLevel)}%` }}
              />

              {/* Bubbles */}
              <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        animate={{ y: [300, -100], x: [0, Math.sin(i) * 20] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                        style={{ left: `${20 + i * 15}%`, bottom: 0 }}
                      />
                  ))}
              </div>
            </div>

            {/* Target Zone */}
            <div className="absolute top-[8%] left-0 right-0 h-4 flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-20" />
                <div className="absolute bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-300 shadow-lg">
                    PERFECT FILL
                </div>
            </div>

            <div className="absolute -bottom-10 left-0 right-0 text-center">
              <div className={`text-4xl font-black font-mono italic tracking-tighter ${fillLevel > 110 ? 'text-red-500' : fillLevel >= 95 ? 'text-emerald-400' : 'text-white'}`}>
                {Math.floor(fillLevel)}%
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 mt-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {permissionGranted ? 'TILT PHONE FORWARD TO POUR' : 'USE SLIDER TO POUR'}
            </p>
            {fillLevel > 110 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-red-500 text-xs font-black uppercase tracking-tighter bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20"
              >
                ⚠️ SPILLING! ⚠️
              </motion.div>
            )}
          </div>

          {permissionGranted === false && (
              <input
                type="range"
                min="0"
                max="125"
                value={fillLevel}
                onChange={(e) => setFillLevel(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-600 border border-slate-700"
              />
          )}

          <button
            onPointerDown={stopPouring}
            className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.3)] border-b-8 border-red-800 uppercase italic tracking-widest text-xl"
          >
            SERVE THE WINE
          </button>
        </div>
      )}

      <AnimatePresence>
        {result && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-8 text-center"
            >
                <div className="text-8xl mb-6">
                    {feedback === 'success' ? '🥂' : feedback === 'spill' ? '🧹' : '📉'}
                </div>
                <h3 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">
                    {feedback === 'success' ? 'DEAL SECURED' : feedback === 'spill' ? 'MESSY SERVICE' : 'POOR INFLUENCE'}
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                    {feedback === 'success' ? 'The senator is impressed.' :
                     feedback === 'spill' ? 'You ruined a $5,000 suit.' :
                     'A very forgettable evening.'}
                </p>
                <div className="text-emerald-500 text-4xl font-black font-mono mt-8 italic">
                    {result.toFixed(2)}X MULTIPLIER
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 w-full max-w-xs text-center opacity-30 pointer-events-none">
        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
            MOGUL TIER PRIVATE DINING • PRECISION POUR PROTOCOL
        </p>
      </div>
    </div>
  );
};
