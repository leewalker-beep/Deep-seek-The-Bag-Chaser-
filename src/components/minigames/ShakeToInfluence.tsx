import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PourTheWineProps {
  onComplete: (multiplier: number) => void;
}

export const ShakeToInfluence: React.FC<PourTheWineProps> = ({ onComplete }) => {
  const [fillLevel, setFillLevel] = useState(0);
  const [, setGameActive] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const gameActiveRef = useRef(true);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!gameActiveRef.current) return;

    // Beta is front-to-back tilt (-180 to 180)
    // Map to 0-100 fill level
    const beta = event.beta || 0;
    // Normalize: 0 to 90 degrees = 0% to 100% fill
    let rawFill = (beta + 90) / 180 * 100;
    rawFill = Math.max(0, Math.min(120, rawFill));
    setFillLevel(rawFill);
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
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setPermissionGranted(false);
        }
      } catch {
        setPermissionGranted(false);
      }
    } else {
      // Check if we actually have orientation data (desktop vs mobile)
      // On desktop, we want to show the fallback
      if (window.DeviceOrientationEvent) {
         setPermissionGranted(true);
         window.addEventListener('deviceorientation', handleOrientation);
      } else {
         setPermissionGranted(false);
      }
    }
  };

  const stopPouring = () => {
    setGameActive(false);
    gameActiveRef.current = false;
    window.removeEventListener('deviceorientation', handleOrientation);

    let multiplier = 0.5;

    if (fillLevel > 105) {
      multiplier = 0.3;
    } else if (fillLevel >= 95) {
      multiplier = 4.0;
    } else if (fillLevel >= 85) {
      multiplier = 3.0;
    } else if (fillLevel >= 70) {
      multiplier = 2.0;
    } else if (fillLevel >= 50) {
      multiplier = 1.0;
    } else {
      multiplier = 0.5;
    }

    setResult(multiplier);

    setTimeout(() => {
      onComplete(multiplier);
    }, 1500);
  };

  const getFillColor = () => {
    if (fillLevel > 105) return 'bg-red-700';
    if (fillLevel >= 95) return 'bg-red-600';
    if (fillLevel >= 85) return 'bg-red-500';
    if (fillLevel >= 70) return 'bg-red-400';
    return 'bg-red-300';
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-black text-white mb-1">LOBBYING FIRM</h2>
        <p className="text-[10px] text-slate-500 uppercase">POUR THE WINE</p>
      </div>

      {!permissionGranted && permissionGranted !== false && (
        <div className="flex flex-col gap-4">
          <button
            onClick={requestPermission}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg"
          >
            ACTIVATE TILT SENSORS
          </button>
          <button
            onClick={() => setPermissionGranted(false)}
            className="text-[10px] text-slate-500 underline uppercase tracking-widest"
          >
            Use manual control
          </button>
        </div>
      )}

      {permissionGranted === false && (
        <div className="text-red-400 text-xs mb-4 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          Sensor access denied or unavailable. Use manual slider below.
        </div>
      )}

      {permissionGranted === true && !result && (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          {/* Wine Glass */}
          <div className="relative w-48 h-64">
            <div className="absolute inset-0 border-4 border-slate-600 rounded-b-[100px] rounded-t-md overflow-hidden bg-slate-900">
              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-100 ${getFillColor()}`}
                style={{ height: `${Math.min(100, fillLevel)}%` }}
              />
            </div>
            {/* Target Line */}
            <div className="absolute top-[5%] left-0 right-0 h-0.5 bg-emerald-400/50 border-t border-emerald-400">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-[8px] text-emerald-400 whitespace-nowrap">
                PERFECT LINE
              </div>
            </div>
            {/* Fill Percentage */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <span className={`text-xl font-mono font-bold ${fillLevel > 105 ? 'text-red-500' : fillLevel >= 95 ? 'text-emerald-400' : 'text-white'}`}>
                {Math.floor(fillLevel)}%
              </span>
            </div>
          </div>

          {/* Over-pour Warning */}
          {fillLevel > 105 && (
            <div className="text-red-500 text-xs font-bold animate-pulse">
              ⚠️ TOO MUCH! WINE SPILLING! ⚠️
            </div>
          )}

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-400">Tilt phone forward to pour</p>
            <p className="text-[10px] text-slate-600">Stop at the green line for perfect pour</p>
          </div>

          {/* Done Button */}
          <button
            onClick={stopPouring}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95 shadow-xl"
          >
            SERVE THE WINE
          </button>
        </div>
      )}

      {/* Manual Fallback */}
      {(permissionGranted === false || (!permissionGranted && permissionGranted !== null)) && !result && (
        <div className="w-full max-w-sm space-y-6">
          <div className="relative w-48 h-64 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-600 rounded-b-[100px] rounded-t-md overflow-hidden bg-slate-900">
              <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-100 ${getFillColor()}`}
                style={{ height: `${Math.min(100, fillLevel)}%` }}
              />
            </div>
            <div className="absolute top-[5%] left-0 right-0 h-0.5 bg-emerald-400/50" />
          </div>
          <input
            type="range"
            min="0"
            max="120"
            value={fillLevel}
            onChange={(e) => setFillLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <button
            onClick={stopPouring}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all active:scale-95"
          >
            SERVE THE WINE
          </button>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-4">
            {result >= 4 ? '🍷✨' : result >= 2 ? '🍷' : '💀'}
          </div>
          <h3 className="text-2xl font-black text-white mb-2">WINE SERVED</h3>
          <p className="text-slate-400 text-sm">
            {result >= 4 ? 'Perfect pour! Maximum influence gained.' :
             result >= 2 ? 'Good pour. Influence secured.' :
             result >= 1 ? 'Decent. Break even.' :
             'Weak pour. No influence today.'}
          </p>
        </div>
      )}

      <div className="absolute bottom-8 text-center">
        <p className="text-[8px] text-slate-600 max-w-xs">
          Tilt phone forward to pour wine. Stop exactly at the green line.
        </p>
      </div>
    </div>
  );
};
