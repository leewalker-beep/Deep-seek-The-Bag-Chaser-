import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface PresidentialCampaignProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const PresidentialCampaign: React.FC<PresidentialCampaignProps> = ({
    onComplete,
    level = 1,
    tier = 'MUD'
}) => {
  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  const [hype, setHype] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * timerFactor);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const intensityRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [feedback, setFeedback] = useState<'shake' | null>(null);

  useEffect(() => {
    if (!gameActive) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          endGame();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive]);

  const requestPermission = async () => {
    const DeviceMotion = (window.DeviceMotionEvent as unknown) as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceMotion.requestPermission === 'function') {
      try {
        const response = await DeviceMotion.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setGameActive(true);
          window.addEventListener('devicemotion', handleMotion);
        } else {
          setPermissionGranted(false);
          setGameActive(true);
        }
      } catch {
        setPermissionGranted(false);
        setGameActive(true);
      }
    } else {
      if (window.DeviceMotionEvent) {
         setPermissionGranted(true);
         setGameActive(true);
         window.addEventListener('devicemotion', handleMotion);
      } else {
         setPermissionGranted(false);
         setGameActive(true);
      }
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!gameActive) return;
    const accel = event.acceleration;
    if (!accel) return;

    const total = Math.sqrt((accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2);
    // Threshold increases with scaling
    const threshold = 12 + scaling * 2;
    if (total > threshold) {
        intensityRef.current = Math.min(4, total / threshold);
        // Hype building scales inversely with scaling difficulty
        setHype(prev => Math.min(100, prev + (intensityRef.current * (1.5 / scaling))));
        setFeedback('shake');
        setTimeout(() => setFeedback(null), 100);
        if (navigator.vibrate) navigator.vibrate(5);
    }
  };

  const finalMultiplier = useMemo(() => {
      return 1.0 + (hype / 100) * (3.0 + scaling);
  }, [hype, scaling]);

  const endGame = () => {
    setGameActive(false);
    window.removeEventListener('devicemotion', handleMotion);
    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(finalMultiplier), 1500);
  };

  const getHypeColor = () => {
    if (hype >= 90) return 'text-purple-400';
    if (hype >= 70) return 'text-yellow-400';
    if (hype >= 40) return 'text-blue-400';
    return 'text-slate-500';
  };

  return (
    <div className={`fixed inset-0 transition-colors duration-200 flex flex-col items-center justify-center p-8 z-[100] ${
        feedback ? 'bg-purple-950/20' : 'bg-slate-950'
    }`}>
      <div className="absolute top-12 text-center w-full px-8">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">PRESIDENTIAL CAMPAIGN <span className="text-xs">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2 mt-1">
             <motion.span animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-purple-500">📱</motion.span>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">SHAKE TO BUILD MASSIVE HYPE</p>
        </div>
      </div>

      {!gameActive && timeLeft > (10 * timerFactor - 0.5) && (
        <div className="flex flex-col gap-4 z-20">
          <button
            onClick={requestPermission}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.3)] border-b-4 border-purple-800"
          >
            ACTIVATE SENSORS
          </button>
          <button
            onClick={() => {
                setPermissionGranted(false);
                setGameActive(true);
            }}
            className="text-[10px] text-slate-500 underline font-black uppercase tracking-widest"
          >
            Manual Mode (Slider)
          </button>
        </div>
      )}

      {gameActive && (
        <div className="flex flex-col items-center gap-10 w-full max-w-sm">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">HYPE INTENSITY</div>
            <motion.div
                animate={{ scale: feedback ? 1.2 : 1, rotate: feedback ? [0, 5, -5, 0] : 0 }}
                className={`text-7xl font-black italic tracking-tighter font-mono ${getHypeColor()} drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]`}
            >
                {Math.floor(hype)}%
            </motion.div>
          </div>

          <div className="w-full">
              <ProgressBar
                value={hype}
                max={100}
                colorClass={hype >= 90 ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-blue-500'}
              />
              <div className="flex justify-between mt-2">
                  <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">LOW VIBE</div>
                  <div className="text-[8px] text-purple-400 font-black uppercase tracking-widest">PEAK VIRAL</div>
              </div>
          </div>

          <div className="text-center bg-slate-900/50 p-4 rounded-2xl border-2 border-slate-800 w-full">
            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">CAMPAIGN WINDOW</div>
            <div className={`text-3xl font-black font-mono ${timeLeft < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft.toFixed(1)}s
            </div>
          </div>

          {permissionGranted === false && (
              <div className="w-full space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hype}
                    onChange={(e) => {
                        setHype(parseInt(e.target.value));
                        if (navigator.vibrate) navigator.vibrate(5);
                    }}
                    className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-600 border border-slate-700"
                  />
                  <button
                    onClick={endGame}
                    className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl border-b-4 border-purple-800 uppercase italic"
                  >
                      END CAMPAIGN
                  </button>
              </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {!gameActive && timeLeft < (10 * timerFactor - 0.5) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-30 p-8 text-center"
          >
            <div className="text-8xl mb-6">📈</div>
            <h3 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">CAMPAIGN CONCLUDED</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                {hype >= 90 ? 'A new era of political dominance.' :
                 hype >= 60 ? 'Significant public interest secured.' :
                 'A forgettable election cycle.'}
            </p>
            <div className="text-purple-400 text-4xl font-black font-mono mt-8 italic">
                {finalMultiplier.toFixed(2)}X MULTIPLIER
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 w-full max-w-xs text-center opacity-30 pointer-events-none">
        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
            PRESIDENTIAL PROTOCOL • HIGH-INTENSITY PUBLICITY
        </p>
      </div>
    </div>
  );
};
