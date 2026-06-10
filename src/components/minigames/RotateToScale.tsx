import React, { useState, useEffect, useRef } from 'react';

interface RotateToScaleProps {
  onComplete: (multiplier: number) => void;
}

export const RotateToScale: React.FC<RotateToScaleProps> = ({ onComplete }) => {
  const [angle, setAngle] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setPermissionGranted(false);
        }
      } catch (err) {
        console.error(err);
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // gamma is left-to-right tilt in degrees [-90, 90]
    // beta is front-to-back tilt [-180, 180]
    // We'll use gamma for a steering-wheel style rotation or beta for a 'scale' feel
    // Let's use absolute gamma and map it to 0-180 territory expansion
    let val = event.gamma || 0;
    // Map -90..90 to 0..180
    val = val + 90;
    setAngle(val);
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete(angle);
  };

  const getTierInfo = () => {
    if (angle < 45) return { territories: '1-2', cost: '$5M', risk: '5%', color: 'text-emerald-400' };
    if (angle < 90) return { territories: '3-5', cost: '$10M', risk: '15%', color: 'text-blue-400' };
    if (angle < 135) return { territories: '6-8', cost: '$20M', risk: '30%', color: 'text-orange-400' };
    return { territories: '9-10', cost: '$40M', risk: '50%', color: 'text-red-500 font-black animate-pulse' };
  };

  const info = getTierInfo();

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center select-none touch-none min-h-[450px] flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500">
        TIMEOUT: {timeLeft}s
      </div>

      <div className="text-[10px] text-slate-500 uppercase font-bold mb-6">
        ROTATE PHONE TO SCALE GLOBALLY
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Compass/Rotation UI */}
        <div
          className="absolute inset-0 border-4 border-slate-800 rounded-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="w-1 h-24 bg-gradient-to-t from-transparent via-emerald-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          <div className="absolute top-0 w-3 h-3 bg-white rounded-full shadow-lg" />
        </div>

        <div className="z-10 bg-slate-950 w-24 h-24 rounded-full border-2 border-slate-800 flex flex-col items-center justify-center shadow-2xl">
          <span className="text-2xl font-black text-white">{Math.floor(angle)}°</span>
          <span className="text-[8px] text-slate-500 uppercase font-bold">Rotation</span>
        </div>
      </div>

      <div className="w-full bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase mb-1">Territories</div>
            <div className={`text-xs font-bold ${info.color}`}>{info.territories}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase mb-1">Launch Cost</div>
            <div className="text-xs font-bold text-white">{info.cost}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase mb-1">Risk Factor</div>
            <div className="text-xs font-bold text-red-400">{info.risk}</div>
          </div>
        </div>

        {!permissionGranted && (
          <button
            onClick={requestPermission}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg text-xs"
          >
            ACTIVATE GYRO
          </button>
        )}

        <div className="w-full">
            <input
              type="range"
              min="0"
              max="180"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
        </div>

        <button
          onClick={handleFinish}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest text-xs"
        >
          LOCK IN SCALE
        </button>
      </div>

      <div className="mt-6 text-[10px] text-slate-500 italic max-w-[240px]">
        "The wider the expansion, the greater the reward... and the steeper the risk of total collapse."
      </div>
    </div>
  );
};
