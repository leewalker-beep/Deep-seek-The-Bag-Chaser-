import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface MemeCoinPumpProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
  title?: string;
  instruction?: string;
  icon?: string;
  scoreLabel?: string;
  accentColor?: string;
}

export const calculateVolatilePump = (currentPrice: number, hype: number, volatility: number) => {
  const anomalySeed = Math.random();
  let anomalyMultiplier = 1.0;
  let statusBanner = "";

  if (anomalySeed < 0.03) {
    anomalyMultiplier = 0.4;
    statusBanner = "🚨 FUD RUG PULL EXPLOIT ACTIVATED!";
  } else if (anomalySeed > 0.97) {
    anomalyMultiplier = 2.2;
    statusBanner = "🚀 WHALE PUMP INBOUND! PRICE PARABOLIC!";
  }

  const underlyingChange = (hype / 22) - 1 + (Math.random() - 0.5) * volatility;
  const targetPrice = Math.max(0.05, (currentPrice + (currentPrice * underlyingChange * 0.1)) * anomalyMultiplier);

  return { targetPrice, statusBanner };
};

export const MemeCoinPump: React.FC<MemeCoinPumpProps> = ({
  onComplete,
  level = 1,
  tier = 'MUD',
  title = "MEME COIN PUMP",
  instruction = "SHAKE PHONE TO PUMP HYPE!",
  icon = "⛏️",
  scoreLabel = "PRICE",
  accentColor = "yellow"
}) => {
  const [hype, setHype] = useState(10);
  const [price, setPrice] = useState(1.0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isDumped, setIsDumped] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Difficulty scaling: decay and volatility increase with difficulty
  const decayRate = (0.5 + (level - 1) * 0.4) * Math.sqrt(scaling);
  const volatility = (0.05 + (level - 1) * 0.02) * scaling;

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (e) {
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (isDumped) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;
      const total = Math.abs(acceleration.x || 0) + Math.abs(acceleration.y || 0) + Math.abs(acceleration.z || 0);
      if (total > 15) {
        setHype(prev => Math.min(100, prev + 2));
        if (navigator.vibrate) navigator.vibrate(10);
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleDump();
          return 0;
        }
        return prev - 0.1;
      });

      setHype(prev => Math.max(0, prev - decayRate));

      setPrice(prev => {
        const change = (hype / 20) - 1 + (Math.random() - 0.5) * volatility;
        const next = Math.max(0.1, prev + (prev * change * 0.1));
        setHistory(h => [...h, next].slice(-20));
        return next;
      });
    }, 100);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearInterval(timer);
    };
  }, [isDumped, hype, decayRate, volatility]);

  const handleDump = () => {
    if (isDumped) return;
    setIsDumped(true);
    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => onComplete(price), 1500);
  };

  const colorMap: Record<string, string> = {
    amber: 'text-amber-500 bg-amber-500 bg-amber-600',
    purple: 'text-purple-500 bg-purple-500 bg-purple-600',
    blue: 'text-blue-500 bg-blue-500 bg-blue-600',
    emerald: 'text-emerald-500 bg-emerald-500 bg-emerald-600',
    yellow: 'text-yellow-500 bg-yellow-500 bg-yellow-600',
  };

  const colors = colorMap[accentColor] || colorMap.yellow;
  const [cText, cBg, cBtn] = colors.split(' ');

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center touch-none select-none p-4 z-[100]">
      <div className="absolute top-12 text-center w-full px-8">
        <h2 className={`text-4xl font-black ${cText} italic tracking-tighter uppercase drop-shadow-lg`}>{icon} {title} <span className="text-white text-sm">L{level}</span></h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{instruction}</p>
      </div>

      <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-8 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-8">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-black uppercase">{scoreLabel}</span>
                <span className="text-5xl font-black text-emerald-400 font-mono tracking-tighter">${price.toFixed(2)}</span>
            </div>
            <div className="text-right">
                <span className="text-[10px] text-slate-500 font-black uppercase">HYPE</span>
                <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
                    <motion.div className={`h-full ${cBg}`} animate={{ width: `${hype}%` }} />
                </div>
            </div>
        </div>

        {/* Mini Chart */}
        <div className="h-32 w-full flex items-end gap-1 mb-8 opacity-40">
            {history.map((p, i) => (
                <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${Math.min(100, (p / Math.max(...history)) * 100)}%` }} />
            ))}
        </div>

        {!permissionGranted && permissionGranted !== false && (
            <button onClick={requestPermission} className={`w-full py-4 ${cBtn} text-white font-black rounded-xl mb-4`}>ENABLE SHAKE SENSORS</button>
        )}

        <button
          onPointerDown={() => setHype(prev => Math.min(100, prev + 4))}
          className="w-full py-4 bg-slate-800 text-white font-black rounded-xl mb-4 uppercase tracking-widest active:scale-95 transition-all border-b-4 border-slate-950"
        >
          MANUAL PUMP
        </button>

        <button
          onClick={handleDump}
          className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-2xl shadow-lg shadow-red-900/20 active:scale-95 transition-all border-b-8 border-red-900 uppercase tracking-tighter italic"
        >
          DUMP NOW!
        </button>

        <div className="mt-6 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <span>RUG PULL IN: {timeLeft.toFixed(1)}s</span>
            <span>VOLATILITY: {volatility.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
