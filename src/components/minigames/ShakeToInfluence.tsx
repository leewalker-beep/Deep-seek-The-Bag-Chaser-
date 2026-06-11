import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ShakeToInfluenceProps {
  onComplete: (multiplier: number) => void;
}

export const ShakeToInfluence: React.FC<ShakeToInfluenceProps> = ({ onComplete }) => {
  const [currentIntensity, setCurrentIntensity] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isInZone, setIsInZone] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(true);

  const targetMin = 2.5;
  const targetMax = 3.5;

  const holdTimerRef = useRef<number | null>(null);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const accel = event.acceleration;
    if (!accel) return;

    const totalAccel = Math.sqrt(
      (accel.x || 0) ** 2 +
      (accel.y || 0) ** 2 +
      (accel.z || 0) ** 2
    );

    let intensity: number;
    if (totalAccel < 5) intensity = 1;
    else if (totalAccel < 12) intensity = 2;
    else if (totalAccel < 20) intensity = 3;
    else intensity = 4;

    setCurrentIntensity(intensity);
    setIsInZone(intensity >= targetMin && intensity <= targetMax);
  }, [targetMin, targetMax]);

  const endGame = useCallback((finalHoldTime: number) => {
    setGameActive(false);
    window.removeEventListener('devicemotion', handleMotion);

    let multiplier = 0.5;
    if (finalHoldTime >= 15) multiplier = 4.0;
    else if (finalHoldTime >= 10) multiplier = 3.0;
    else if (finalHoldTime >= 7) multiplier = 2.0;
    else if (finalHoldTime >= 3) multiplier = 1.0;
    else multiplier = 0.5;

    setTimeout(() => {
      onComplete(multiplier);
    }, 500);
  }, [handleMotion, onComplete]);

  useEffect(() => {
    if (!gameActive) return;

    if (isInZone) {
      if (holdTimerRef.current) return;
      holdTimerRef.current = window.setInterval(() => {
        setHoldTime(prev => {
          const next = prev + 0.1;
          if (next >= 15) {
            endGame(next);
          }
          return next;
        });
      }, 100);
    } else {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current as number);
        holdTimerRef.current = null;
      }
    }

    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current as number);
        holdTimerRef.current = null;
      }
    };
  }, [isInZone, gameActive, endGame]);

  // Ensure listener is removed on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  const startCapture = useCallback(() => {
    window.addEventListener('devicemotion', handleMotion);
  }, [handleMotion]);

  const requestPermission = async () => {
    const DeviceMotion = (window.DeviceMotionEvent as unknown) as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DeviceMotion.requestPermission === 'function') {
      try {
        const response = await DeviceMotion.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startCapture();
        } else {
          setPermissionGranted(false);
        }
      } catch {
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
      startCapture();
    }
  };

  const getIntensityLabel = () => {
    if (currentIntensity === 1) return { label: 'GENTLE', color: 'text-blue-400' };
    if (currentIntensity === 2) return { label: 'MEDIUM', color: 'text-emerald-400' };
    if (currentIntensity === 3) return { label: 'STRONG', color: 'text-yellow-400' };
    return { label: 'VIOLENT', color: 'text-red-500' };
  };

  const { label, color } = getIntensityLabel();

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-black text-white mb-1">LOBBYING FIRM</h2>
        <p className="text-[10px] text-slate-500 uppercase">SHAKE TO INFLUENCE POLICY</p>
      </div>

      {!permissionGranted && permissionGranted !== false && (
        <button onClick={requestPermission} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
          ACTIVATE SENSORS
        </button>
      )}

      {permissionGranted === true && (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase">TARGET LEVEL</div>
            <div className="text-5xl font-black text-yellow-400">3</div>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-[8px] text-slate-500 mb-1">
              <span>GENTLE</span><span>MEDIUM</span><span>STRONG</span><span>VIOLENT</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div className={`w-1/4 h-full ${currentIntensity >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
              <div className={`w-1/4 h-full ${currentIntensity >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              <div className={`w-1/4 h-full ${currentIntensity >= 3 ? 'bg-yellow-500' : 'bg-slate-700'}`} />
              <div className={`w-1/4 h-full ${currentIntensity >= 4 ? 'bg-red-500' : 'bg-slate-700'}`} />
            </div>
            <div className="text-center mt-2">
              <span className={`text-sm font-bold ${color}`}>{label}</span>
            </div>
          </div>

          <div className={`text-center p-3 rounded-xl ${isInZone ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-800/50'}`}>
            <div className="text-[10px] text-slate-400 uppercase">SHAKE AS LONG AS YOU CAN</div>
            <div className={`text-3xl font-mono font-bold ${isInZone ? 'text-emerald-400' : 'text-slate-500'}`}>
              {holdTime.toFixed(1)}s
            </div>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-slate-800">
            <div className="text-[8px] text-slate-600 text-center mb-2">MANUAL TEST MODE</div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => { setIsInZone(true); setCurrentIntensity(3); }} className="p-2 bg-slate-800 rounded text-[10px]">SET LEVEL 3</button>
              <button onClick={() => endGame(holdTime)} className="p-2 bg-emerald-600 rounded text-[10px] font-bold">FINISH</button>
            </div>
          </div>
        </div>
      )}

      {(permissionGranted === false || (!permissionGranted && permissionGranted !== null)) && (
        <div className="w-full max-w-sm space-y-4">
          <div className="text-[10px] text-slate-500 text-center">Manual Override</div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setCurrentIntensity(1); setIsInZone(false); }} className="p-4 bg-slate-800 rounded-xl text-[10px]">GENTLE</button>
            <button onClick={() => { setCurrentIntensity(2); setIsInZone(false); }} className="p-4 bg-slate-800 rounded-xl text-[10px]">MEDIUM</button>
            <button onClick={() => { setCurrentIntensity(3); setIsInZone(true); }} className="p-4 bg-emerald-800 rounded-xl text-[10px] text-emerald-300">STRONG (TARGET)</button>
            <button onClick={() => { setCurrentIntensity(4); setIsInZone(false); }} className="p-4 bg-slate-800 rounded-xl text-[10px]">VIOLENT</button>
          </div>
          <button onClick={() => endGame(holdTime)} className="w-full py-3 bg-emerald-600 rounded-xl font-bold">COMPLETE</button>
        </div>
      )}

      <div className="absolute bottom-8 text-center">
        <p className="text-[8px] text-slate-600">Maintain LEVEL 3 as long as you can. Longer = better rewards.</p>
      </div>
    </div>
  );
};
