import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Coordinate {
  target: number;
  completed: boolean;
}

interface RotateToScaleProps {
  onComplete: (multiplier: number) => void;
  level: number;
}

export const RotateToScale: React.FC<RotateToScaleProps> = ({ onComplete, level }) => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

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

  // Number of coordinates based on level
  const getCoordinateCount = useCallback(() => {
    return level * 2;
  }, [level]);

  // Generate random coordinates
  useEffect(() => {
    const count = getCoordinateCount();
    const newCoords: Coordinate[] = [];
    for (let i = 0; i < count; i++) {
      newCoords.push({
        target: Math.floor(Math.random() * 180) + 1, // 1-180 degrees
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

    const finalMultiplier = performanceBase * level;
    setResult(finalMultiplier);

    setTimeout(() => {
      onComplete(finalMultiplier);
    }, 1500);
  }, [level, onComplete]);

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
    }
  }, [currentIndex, getCoordinateCount, endGame]);

  useEffect(() => {
    if (!gameActive) return;

    if (isHolding) {
      if (holdTimerRef.current) return;
      holdTimerRef.current = setInterval(() => {
        setHoldTime(prev => {
          const next = prev + 0.1;
          if (next >= 3) {
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
  }, [isHolding, gameActive, completeCoordinate]);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const { currentIndex: cIdx, coordinates: coords, gameActive: active } = stateRef.current;
    if (!active) return;

    const gamma = event.gamma || 0;
    let angle = gamma + 90;
    angle = Math.max(0, Math.min(180, angle));
    setCurrentAngle(angle);

    const currentTarget = coords[cIdx]?.target;
    if (currentTarget && Math.abs(angle - currentTarget) <= 5) {
      setIsHolding(true);
    } else {
      setIsHolding(prev => {
        if (prev) setHoldTime(0);
        return false;
      });
    }
  }, []);

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

  const getProgress = () => {
    const completed = coordinates.filter(c => c.completed).length;
    return `${completed}/${coordinates.length}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-black text-white mb-1">GLOBAL FRANCHISE</h2>
        <p className="text-[10px] text-slate-500 uppercase">ROTATE TO EXPAND</p>
        <div className="text-xs font-mono text-red-500 mt-1">TIME LEFT: {timeLeft}s</div>
      </div>

      {!permissionGranted && permissionGranted !== false && (
        <div className="flex flex-col gap-3">
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg"
          >
            ACTIVATE ROTATION SENSORS
          </button>
          <button
            onClick={() => setPermissionGranted(false)}
            className="text-[10px] text-slate-500 uppercase underline"
          >
            Manual Mode (Desktop)
          </button>
        </div>
      )}

      {permissionGranted === false && (
        <div className="text-red-400 text-xs mb-4 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          Sensor access denied. Use manual dial below.
        </div>
      )}

      {permissionGranted === true && !result && (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase">TARGET ANGLE</div>
            <div className="text-5xl font-black text-yellow-400">
              {coordinates[currentIndex]?.target}°
            </div>
          </div>

          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase">CURRENT ANGLE</div>
            <div className={`text-3xl font-mono font-bold ${isHolding ? 'text-emerald-400' : 'text-white'}`}>
              {Math.floor(currentAngle)}°
            </div>
          </div>

          <div className="relative w-40 h-40">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
            <div
              className="absolute top-1/2 left-1/2 w-1 h-16 bg-emerald-500 origin-bottom transition-transform duration-100"
              style={{ transform: `translateX(-50%) rotate(${currentAngle}deg)`, transformOrigin: 'center center' }}
            />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          </div>

          {isHolding && (
            <div className="w-full">
              <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                <span>HOLDING...</span>
                <span>{holdTime.toFixed(1)} / 3.0 sec</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${(holdTime / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase">TERRITORIES</div>
            <div className="text-xl font-bold text-emerald-400">{getProgress()}</div>
          </div>
        </div>
      )}

      {(permissionGranted === false || (!permissionGranted && permissionGranted !== null)) && !result && (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase">TARGET ANGLE</div>
            <div className="text-5xl font-black text-yellow-400">
              {coordinates[currentIndex]?.target}°
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="180"
            value={currentAngle}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setCurrentAngle(val);
              const currentTarget = coordinates[currentIndex]?.target;
              if (currentTarget && Math.abs(val - currentTarget) <= 5) {
                setIsHolding(true);
              } else {
                setIsHolding(false);
              }
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="text-center text-3xl font-mono font-bold text-white">
            {Math.floor(currentAngle)}°
          </div>

          {isHolding && (
            <div className="w-full">
              <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                <span>HOLDING...</span>
                <span>{holdTime.toFixed(1)} / 3.0 sec</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${(holdTime / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400">
            Territories: {getProgress()}
          </div>
        </div>
      )}

      {result && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-4">
            {result / level >= 0.8 ? '🌍✨' : result / level >= 0.6 ? '🌍' : '💀'}
          </div>
          <h3 className="text-2xl font-black text-white mb-2">EXPANSION COMPLETE</h3>
          <p className="text-slate-400 text-sm">
            {result / level >= 0.8 ? 'Global dominance achieved!' :
             result / level >= 0.6 ? 'Successful expansion.' :
             'Expansion failed. Try again.'}
          </p>
          <p className="text-emerald-400 text-lg font-bold mt-2">
            {result.toFixed(1)}x Multiplier
          </p>
        </div>
      )}

      <div className="absolute bottom-8 text-center">
        <p className="text-[8px] text-slate-600 max-w-xs">
          Rotate phone to match target angle. Hold for 3 seconds to capture territory.
        </p>
      </div>
    </div>
  );
};
