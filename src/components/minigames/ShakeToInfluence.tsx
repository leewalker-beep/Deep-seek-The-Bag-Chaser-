import React, { useState, useEffect, useRef } from 'react';

interface ShakeToInfluenceProps {
  onComplete: (multiplier: number) => void;
}

export const ShakeToInfluence: React.FC<ShakeToInfluenceProps> = ({ onComplete }) => {
  const [maxAccel, setMaxAccel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isCapturing, setIsCapturing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const timerRef = useRef<number | null>(null);
  const captureTimerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish(1.0); // Default to gentle on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (captureTimerRef.current) clearInterval(captureTimerRef.current);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startCapture();
        } else {
          setPermissionGranted(false);
        }
      } catch (err) {
        console.error(err);
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
      startCapture();
    }
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const accel = event.acceleration;
    if (!accel) return;

    const totalAccel = Math.sqrt(
      (accel.x || 0) ** 2 +
      (accel.y || 0) ** 2 +
      (accel.z || 0) ** 2
    );

    setMaxAccel((prev) => Math.max(prev, totalAccel));
  };

  const startCapture = () => {
    setIsCapturing(true);
    setMaxAccel(0);
    window.addEventListener('devicemotion', handleMotion);

    captureTimerRef.current = window.setTimeout(() => {
      stopCapture();
    }, 2000);
  };

  const stopCapture = () => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsCapturing(false);
  };

  const handleFinish = (manualMultiplier?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let finalMultiplier = manualMultiplier;
    if (finalMultiplier === undefined) {
      if (maxAccel < 10) finalMultiplier = 1.0;
      else if (maxAccel < 20) finalMultiplier = 2.0;
      else if (maxAccel < 30) finalMultiplier = 3.0;
      else finalMultiplier = 4.0;
    }

    onComplete(finalMultiplier);
  };

  const getIntensityLabel = () => {
    if (maxAccel < 10) return { label: 'GENTLE', color: 'text-blue-400' };
    if (maxAccel < 20) return { label: 'MEDIUM', color: 'text-emerald-400' };
    if (maxAccel < 30) return { label: 'HARD', color: 'text-orange-400' };
    return { label: 'VIOLENT', color: 'text-red-500 font-black animate-pulse' };
  };

  const { label, color } = getIntensityLabel();

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none min-h-[350px] flex flex-col justify-center items-center relative">
      <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500">
        TIMEOUT: {timeLeft}s
      </div>

      <div className="text-[10px] text-slate-500 uppercase font-bold mb-4">
        SHAKE TO INFLUENCE POLICY
      </div>

      {!permissionGranted && permissionGranted !== false && (
        <button
          onClick={requestPermission}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold mb-4 transition-all active:scale-95 shadow-lg"
        >
          START SENSORS
        </button>
      )}

      {permissionGranted === false && (
        <div className="text-red-400 text-xs mb-4 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          Sensor access denied or not available. Use buttons below.
        </div>
      )}

      {permissionGranted === true && (
        <div className="flex flex-col items-center gap-6 w-full">
          <div className={`text-6xl transition-transform duration-75 ${isCapturing ? 'animate-bounce scale-110' : ''}`}>
            🤝
          </div>

          <div className="space-y-1">
            <div className={`text-xl font-black ${color}`}>
              {label}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Peak Accel: {maxAccel.toFixed(1)} m/s²
            </div>
          </div>

          <div className="w-full max-w-[200px] bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${maxAccel > 30 ? 'bg-red-500' : maxAccel > 20 ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, (maxAccel / 40) * 100)}%` }}
            />
          </div>

          {!isCapturing ? (
            <button
              onClick={startCapture}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-xl"
            >
              {maxAccel > 0 ? 'RE-RECORD SHAKE' : 'RECORD SHAKE'}
            </button>
          ) : (
            <div className="w-full py-4 bg-slate-800 text-emerald-400 font-black rounded-xl border border-emerald-500/50 animate-pulse">
              SHAKING...
            </div>
          )}

          {maxAccel > 0 && !isCapturing && (
             <button
              onClick={() => handleFinish()}
              className="w-full py-4 bg-white text-slate-900 rounded-xl font-black transition-all active:scale-95 hover:bg-slate-200"
            >
              SUBMIT INFLUENCE
            </button>
          )}
        </div>
      )}

      {/* Show manual override if sensors not activated or not producing results */}
      {(permissionGranted === false || !permissionGranted || (permissionGranted === true && !isCapturing && maxAccel === 0)) && (
        <div className="w-full space-y-4">
          <div className="text-[10px] text-slate-500 uppercase font-mono mb-2">Manual Override</div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={() => handleFinish(1.0)} className="p-4 bg-slate-800 rounded-xl text-[10px] font-black border border-blue-500/30 text-blue-400 active:scale-95 transition-all">GENTLE</button>
            <button onClick={() => handleFinish(2.0)} className="p-4 bg-slate-800 rounded-xl text-[10px] font-black border border-emerald-500/30 text-emerald-400 active:scale-95 transition-all">MEDIUM</button>
            <button onClick={() => handleFinish(3.0)} className="p-4 bg-slate-800 rounded-xl text-[10px] font-black border border-orange-500/30 text-orange-400 active:scale-95 transition-all">HARD</button>
            <button onClick={() => handleFinish(4.0)} className="p-4 bg-slate-800 rounded-xl text-[10px] font-black border border-red-500/30 text-red-500 active:scale-95 transition-all">VIOLENT</button>
          </div>
        </div>
      )}

      <div className="mt-8 text-[10px] text-slate-500 italic max-w-[220px] leading-relaxed">
        "A gentle nudge or a violent shove—how far are you willing to go?"
      </div>
    </div>
  );
};
