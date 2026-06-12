import React, { useState, useEffect, useRef } from 'react';

interface ShakeForHypeProps {
  onComplete: (multiplier: number) => void;
}

export const ShakeForHype: React.FC<ShakeForHypeProps> = ({ onComplete }) => {
  const [hype, setHype] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const intensityRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!permissionGranted) return;

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
  }, [permissionGranted]);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('devicemotion', handleMotion);
        } else {
          setPermissionGranted(false);
        }
      } catch {
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const accel = event.acceleration;
    if (!accel) return;

    const total = Math.sqrt((accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2);
    intensityRef.current = Math.min(4, total / 5);
    setHype(prev => Math.min(100, prev + intensityRef.current));
  };

  const endGame = () => {
    window.removeEventListener('devicemotion', handleMotion);
    const multiplier = 0.5 + (hype / 100) * 2.5;
    onComplete(multiplier);
  };

  const getHypeColor = () => {
    if (hype >= 80) return 'text-purple-400';
    if (hype >= 50) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-[100]">
      <h2 className="text-2xl font-black text-white mb-2">FIGHT PROMOTER</h2>
      <p className="text-[10px] text-slate-500 mb-6">SHAKE TO BUILD HYPE!</p>

      {!permissionGranted && permissionGranted !== false && (
        <button onClick={requestPermission} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
          ACTIVATE SENSORS
        </button>
      )}

      {permissionGranted === true && (
        <>
          <div className="text-center mb-8">
            <div className="text-[10px] text-slate-500 uppercase">HYPE LEVEL</div>
            <div className={`text-6xl font-black ${getHypeColor()}`}>{Math.floor(hype)}%</div>
          </div>

          <div className="w-full max-w-sm h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100" style={{ width: `${hype}%` }} />
          </div>

          <div className="text-center text-[10px] text-slate-500">TIME LEFT: {timeLeft.toFixed(1)}s</div>
        </>
      )}

      {(permissionGranted === false || (permissionGranted === null && typeof (DeviceMotionEvent as any).requestPermission !== 'function')) && (
        <div className="w-full max-w-sm">
          <input type="range" min="0" max="100" value={hype} onChange={(e) => setHype(parseInt(e.target.value))} className="w-full" />
          <button onClick={endGame} className="w-full mt-4 py-4 bg-purple-600 text-white font-black rounded-xl">COMPLETE</button>
        </div>
      )}
    </div>
  );
};
