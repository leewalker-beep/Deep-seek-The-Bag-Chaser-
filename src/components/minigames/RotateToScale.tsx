import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier, getTimerFactor } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface Coordinate {
  target: number;
  completed: boolean;
}

interface RotateToScaleProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

export const RotateToScale: React.FC<RotateToScaleProps> = ({
    onComplete,
    level = 1,
    tier = 'MUD'
}) => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    const needsPermission = typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    return !needsPermission ? true : null;
  });
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    if (permissionGranted !== null && !result) {
      setGameActive(true);
    }
  }, [permissionGranted, result]);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);
  const timerFactor = getTimerFactor(level, tier);

  const [timeLeft, setTimeLeft] = useState(Math.ceil(30 * timerFactor));

  const holdTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Refs to avoid stale closures in event listener
  const stateRef = useRef({
    currentIndex,
    coordinates,
    isHolding,
    gameActive
  });

  useEffect(() => {
    stateRef.current = { currentIndex, coordinates, isHolding, gameActive };
  }, [currentIndex, coordinates, isHolding, gameActive]);

  const targetHoldTime = useMemo(() => Math.max(1.0, 3.0 * (1 / scaling)), [scaling]);

  // Number of coordinates based on level
  const getCoordinateCount = useCallback(() => {
    return Math.min(10, 2 + level);
  }, [level]);

  // Generate random coordinates
  useEffect(() => {
    const count = getCoordinateCount();
    const newCoords: Coordinate[] = [];
    for (let i = 0; i < count; i++) {
      newCoords.push({
        target: Math.floor(Math.random() * 160) + 10, // 10-170 degrees for safety
        completed: false,
      });
    }
    setCoordinates(newCoords);
  }, [getCoordinateCount]);

  const endGame = useCallback((finalCoordinates: Coordinate[]) => {
    setGameActive(false);

    const completedCount = finalCoordinates.filter(c => c.completed).length;
    const totalCount = finalCoordinates.length;
    const successRate = completedCount / totalCount;

    let performanceBase;
    if (successRate >= 1) performanceBase = 1.0;
    else if (successRate >= 0.8) performanceBase = 0.8;
    else if (successRate >= 0.6) performanceBase = 0.6;
    else performanceBase = 0.3;

    const finalMultiplier = performanceBase * (1.5 + scaling * 0.5);
    setResult(finalMultiplier);

    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      onComplete(finalMultiplier);
    }, 1500);
  }, [scaling, onComplete]);

  // Countdown timer
  useEffect(() => {
    if (gameActive && !result) {
      countdownTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            endGame(stateRef.current.coordinates);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [gameActive, result, endGame]);

  const completeCoordinate = useCallback(() => {
    setCoordinates(prev => {
      const updated = [...prev];
      updated[currentIndex].completed = true;

      // Check if this was the last one
      if (currentIndex + 1 >= updated.length) {
        endGame(updated);
      }

      return updated;
    });

    if (currentIndex + 1 < getCoordinateCount()) {
      setCurrentIndex(prev => prev + 1);
      setIsHolding(false);
      setHoldTime(0);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  }, [currentIndex, getCoordinateCount, endGame]);

  useEffect(() => {
    if (!gameActive) return;

    if (isHolding) {
      if (holdTimerRef.current) return;
      holdTimerRef.current = setInterval(() => {
        setHoldTime(prev => {
          const next = prev + 0.1;
          if (next >= targetHoldTime) {
            if (holdTimerRef.current) {
                clearInterval(holdTimerRef.current);
                holdTimerRef.current = null;
            }
            completeCoordinate();
            return 0;
          }
          return next;
        });
      }, 100) as unknown as number;
    } else {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }

    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [isHolding, gameActive, completeCoordinate, targetHoldTime]);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { currentIndex: cIdx, coordinates: coords, gameActive: active } = stateRef.current;
    if (!active) return;

    const gamma = event.gamma || 0;
    let angle = gamma + 90;
    angle = Math.max(0, Math.min(180, angle));
    setCurrentAngle(angle);

    const currentTarget = coords[cIdx]?.target;
    // Window of precision decreases with scaling
    const precision = Math.max(2, 8 / scaling);

    if (currentTarget && Math.abs(angle - currentTarget) <= precision) {
      setIsHolding(true);
      if (Math.abs(angle - currentTarget) <= 2 && navigator.vibrate) navigator.vibrate(5);
    } else {
      setIsHolding(prev => {
        if (prev) setHoldTime(0);
        return false;
      });
    }
  }, [scaling]);

  useEffect(() => {
    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted, handleOrientation]);

  const requestPermission = async () => {
    const DeviceOrientation = (window.DeviceOrientationEvent as unknown) as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch {
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  if (permissionGranted === null) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-[110] flex flex-col items-center justify-center p-8 text-center select-none touch-none">
           <div className="text-8xl mb-6">📱</div>
           <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">TILT TO PLAY</h2>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">This game uses your phone's motion sensor</p>

           <button
             onPointerDown={requestPermission}
             className="w-full max-w-xs px-8 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)] border-b-8 border-emerald-800 mb-6"
           >
             ENABLE MOTION SENSOR
           </button>

           <button
             onPointerDown={() => setPermissionGranted(false)}
             className="text-slate-500 font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-slate-300 transition-colors"
           >
             Use slider instead
           </button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 transition-colors duration-300 flex flex-col items-center justify-center select-none p-4 z-[100] ${
        isHolding ? 'bg-emerald-950/20' : 'bg-slate-950'
    } ${permissionGranted === true ? 'touch-none' : ''}`}>
      <div className="absolute top-12 text-center w-full px-8">
        {permissionGranted === false && !result && (
          <div className="text-xs text-emerald-400 font-black uppercase tracking-widest text-center mb-2">
            DRAG THE SLIDER TO MATCH THE TARGET ANGLE
          </div>
        )}
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">GLOBAL FRANCHISE <span className="text-xs">L{level}</span></h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <motion.span animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-emerald-500">🌍</motion.span>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ROTATE TO EXPAND TERRITORY</p>
        </div>
      </div>

      {!result && (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm z-10">
          <div className="flex justify-between w-full px-4">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">TARGET</div>
                <div className="text-5xl font-black text-yellow-400 font-mono tracking-tighter">
                {coordinates[currentIndex]?.target}°
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">CURRENT</div>
                <div className={`text-5xl font-black font-mono tracking-tighter transition-colors duration-200 ${isHolding ? 'text-emerald-400' : 'text-white'}`}>
                {Math.floor(currentAngle)}°
                </div>
              </div>
          </div>

          <div className="relative w-56 h-56 flex items-center justify-center">
            <div className="absolute inset-0 border-8 border-slate-900 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" />
            <div className="absolute inset-4 border-2 border-slate-800 rounded-full border-dashed opacity-30" />

            {/* Target Marker */}
            <div
                className="absolute w-2 h-10 bg-yellow-400/40 rounded-full origin-bottom transition-transform duration-300"
                style={{ top: '10%', left: '50%', transform: `translateX(-50%) rotate(${coordinates[currentIndex]?.target - 90}deg)`, transformOrigin: 'bottom center' }}
            />

            {/* Needle */}
            <motion.div
              className="absolute top-[15%] left-1/2 w-1.5 h-20 bg-emerald-500 origin-bottom shadow-[0_0_15px_rgba(16,185,129,0.5)] rounded-full"
              animate={{ rotate: currentAngle - 90 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              style={{ transformOrigin: 'bottom center' }}
            />
            <div className="w-6 h-6 bg-white rounded-full z-20 shadow-xl border-4 border-slate-900" />
          </div>

          {permissionGranted === false && (
              <div className="w-full">
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={currentAngle}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentAngle(val);
                    const currentTarget = coordinates[currentIndex]?.target;
                    const precision = Math.max(2, 8 / scaling);
                    if (currentTarget && Math.abs(val - currentTarget) <= precision) {
                      setIsHolding(true);
                    } else {
                      setIsHolding(false);
                    }
                  }}
                  className="w-full h-8 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 border border-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
          )}

          <div className="w-full px-6">
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">
                <span>{isHolding ? 'LOCKING IN...' : 'ALIGN THE NEEDLE'}</span>
                <span className="font-mono">{holdTime.toFixed(1)}s / {targetHoldTime.toFixed(1)}s</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  animate={{ width: `${(holdTime / targetHoldTime) * 100}%` }}
                />
              </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">TERRITORIES SECURED</div>
            <div className="flex gap-2 justify-center">
                {coordinates.map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-colors duration-300 ${c.completed ? 'bg-emerald-500' : i === currentIndex ? 'bg-yellow-400 animate-pulse' : 'bg-slate-800 border border-slate-700'}`} />
                ))}
            </div>
          </div>
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
                {result / (1.5 + scaling * 0.5) >= 0.8 ? '🌎' : result / (1.5 + scaling * 0.5) >= 0.6 ? '🏙️' : '🏚️'}
            </div>
            <h3 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">EXPANSION COMPLETE</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                {result / (1.5 + scaling * 0.5) >= 0.8 ? 'Global dominance achieved!' :
                result / (1.5 + scaling * 0.5) >= 0.6 ? 'Strategic territories secured.' :
                'Market entry failed.'}
            </p>
            <div className="text-emerald-500 text-3xl font-black font-mono mt-6 italic">
                {result.toFixed(2)}X YIELD
            </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 w-full max-w-xs text-center opacity-30 pointer-events-none">
        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
          {permissionGranted ? 'Tilt phone to match target angle' : 'Use slider to match target angle'}<br/>
          Hold position for {targetHoldTime.toFixed(1)}s to capture territory
        </p>
      </div>

      <div className="absolute top-12 right-6">
        <div className="text-red-500 font-black font-mono text-xl bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            {timeLeft}s
        </div>
      </div>
    </div>
  );
};
