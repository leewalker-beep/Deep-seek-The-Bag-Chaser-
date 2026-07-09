import React, { useState, useEffect, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { getScalingMultiplier } from '../../utils/difficulty';
import type { Tier } from '../../types/game';

interface DiceCrapsProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: Tier;
}

type Bet = 'PASS' | 'DONT_PASS' | 'SEVEN' | 'SNAKE_EYES' | 'BOXCARS';

export const DiceCraps: React.FC<DiceCrapsProps> = ({ onComplete, level = 1, tier = 'MUD' }) => {
  const [dice, setDice] = useState([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [point, setPoint] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'win' | 'lose' | 'point' | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [gameActive, setGameActive] = useState(false);

  // Centralized Scaling
  const scaling = getScalingMultiplier(level, tier);

  // Difficulty scaling: Higher levels increase the payouts for harder bets
  const bonusMultiplier = useMemo(() => 0.8 + scaling * 0.4, [scaling]);

  const controls1 = useAnimation();
  const controls2 = useAnimation();

  const requestPermission = async () => {
    const startAction = () => {
        setPermissionGranted(true);
        setGameActive(true);
    };

    if (typeof ((window.DeviceOrientationEvent as unknown) as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const response = await ((window.DeviceOrientationEvent as unknown) as { requestPermission?: () => Promise<string> }).requestPermission();
        if (response === 'granted') {
          startAction();
        } else {
          setPermissionGranted(false);
          setGameActive(true);
        }
      } catch {
        setPermissionGranted(false);
        setGameActive(true);
      }
    } else {
      startAction();
    }
  };

  useEffect(() => {
    if (!gameActive || permissionGranted === false) return;

    let lastShake = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      if (isRolling || !selectedBet || result !== null) return;
      const accel = e.accelerationIncludingGravity;
      if (!accel) return;
      const total = Math.sqrt((accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2);
      if (total > 25 && Date.now() - lastShake > 1000) {
        lastShake = Date.now();
        rollDice();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isRolling, selectedBet, result, gameActive, permissionGranted]);

  const rollDice = async () => {
    if (isRolling || !selectedBet || result !== null) return;

    setIsRolling(true);
    setMessage('ROLLING...');
    setOutcome(null);
    if (navigator.vibrate) navigator.vibrate(20);

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;

    const rollAnimation = (controls: import('framer-motion').AnimationControls) => controls.start({
      rotate: [0, 90, 180, 270, 360, 450, 540],
      x: [0, -40, 40, -20, 20, 0],
      y: [0, -80, 0, -40, 0],
      transition: { duration: 0.8, ease: "easeOut" }
    });

    await Promise.all([rollAnimation(controls1), rollAnimation(controls2)]);

    setDice([d1, d2]);
    setIsRolling(false);

    handleOutcome(total);
  };

  const handleOutcome = (total: number) => {
    let multiplier = 0.5;
    let ended = false;
    let currentOutcome: 'win' | 'lose' | 'point' | null = null;

    if (selectedBet === 'PASS') {
      if (point === null) {
        if ([7, 11].includes(total)) {
          multiplier = 2.0 * bonusMultiplier;
          setMessage('WINNER! 7/11');
          currentOutcome = 'win';
          ended = true;
        } else if ([2, 3, 12].includes(total)) {
          multiplier = 0.3;
          setMessage('CRAPS! LOSER');
          currentOutcome = 'lose';
          ended = true;
        } else {
          setPoint(total);
          setMessage(`POINT IS ${total}`);
          currentOutcome = 'point';
        }
      } else {
        if (total === point) {
          multiplier = 3.0 * bonusMultiplier;
          setMessage('HIT THE POINT! WIN');
          currentOutcome = 'win';
          ended = true;
        } else if (total === 7) {
          multiplier = 0.2;
          setMessage('SEVEN OUT! LOSE');
          currentOutcome = 'lose';
          ended = true;
        }
      }
    } else if (selectedBet === 'SEVEN') {
      if (total === 7) { multiplier = 5.0 * bonusMultiplier; setMessage('BIG RED! WIN'); currentOutcome = 'win'; }
      else { multiplier = 0.1; setMessage('NOT A SEVEN'); currentOutcome = 'lose'; }
      ended = true;
    } else if (selectedBet === 'SNAKE_EYES') {
      if (total === 2) { multiplier = 30.0 * bonusMultiplier; setMessage('SNAKE EYES! JACKPOT'); currentOutcome = 'win'; }
      else { multiplier = 0.0; setMessage('FAIL'); currentOutcome = 'lose'; }
      ended = true;
    } else if (selectedBet === 'BOXCARS') {
      if (total === 12) { multiplier = 30.0 * bonusMultiplier; setMessage('BOXCARS! JACKPOT'); currentOutcome = 'win'; }
      else { multiplier = 0.0; setMessage('FAIL'); currentOutcome = 'lose'; }
      ended = true;
    } else if (selectedBet === 'DONT_PASS') {
        if (point === null) {
            if ([2, 3].includes(total)) { multiplier = 2.0 * bonusMultiplier; setMessage('WINNER'); currentOutcome = 'win'; ended = true; }
            else if ([7, 11].includes(total)) { multiplier = 0.3; setMessage('LOSER'); currentOutcome = 'lose'; ended = true; }
            else if (total === 12) { multiplier = 1.0; setMessage('PUSH'); currentOutcome = 'point'; ended = true; }
            else { setPoint(total); setMessage(`POINT IS ${total}`); currentOutcome = 'point'; }
        } else {
            if (total === 7) { multiplier = 3.0 * bonusMultiplier; setMessage('WIN'); currentOutcome = 'win'; ended = true; }
            else if (total === point) { multiplier = 0.2; setMessage('LOSE'); currentOutcome = 'lose'; ended = true; }
        }
    }

    setOutcome(currentOutcome);
    if (currentOutcome === 'win') {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else if (currentOutcome === 'lose') {
        if (navigator.vibrate) navigator.vibrate(50);
    } else if (currentOutcome === 'point') {
        if (navigator.vibrate) navigator.vibrate(20);
    }

    if (ended) {
      setResult(multiplier);
      setTimeout(() => onComplete(multiplier), 2000);
    }
  };

  const Die = ({ value, controls }: { value: number; controls: import('framer-motion').AnimationControls }) => (
    <motion.div
      animate={controls}
      className="w-24 h-24 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center border-4 border-slate-200 relative p-5"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full h-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
           const dot = (
             value === 1 && i === 5 ||
             value === 2 && (i === 1 || i === 9) ||
             value === 3 && (i === 1 || i === 5 || i === 9) ||
             value === 4 && (i === 1 || i === 3 || i === 7 || i === 9) ||
             value === 5 && (i === 1 || i === 3 || i === 5 || i === 7 || i === 9) ||
             value === 6 && (i === 1 || i === 3 || i === 4 || i === 6 || i === 7 || i === 9)
           );
           return <motion.div
                    key={i}
                    animate={dot ? { scale: [0, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
                    className={`rounded-full bg-black w-full h-full shadow-inner`}
                  />;
        })}
      </div>
    </motion.div>
  );

  return (
    <div className={`transition-colors duration-500 bg-slate-950 p-6 rounded-[2rem] border-4 shadow-2xl text-center max-w-sm mx-auto font-mono relative overflow-hidden ${
        outcome === 'win' ? 'border-emerald-500 bg-emerald-950/20' :
        outcome === 'lose' ? 'border-red-500 bg-red-950/20' :
        outcome === 'point' ? 'border-blue-500 bg-blue-950/20' :
        'border-yellow-600'
    }`}>
      {!gameActive && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6">
          <button
            onClick={requestPermission}
            className="w-full px-8 py-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-black text-lg transition-all active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.4)] border-b-8 border-yellow-700 mb-6"
          >
            ACTIVATE MOTION
          </button>
          <button
            onClick={() => {
                setPermissionGranted(false);
                setGameActive(true);
            }}
            className="text-[10px] text-slate-500 underline font-black uppercase tracking-widest"
          >
            Manual Mode (Click/Tap)
          </button>
        </div>
      )}
      <h2 className="text-2xl font-black text-yellow-500 mb-2 uppercase tracking-tighter italic">CRYPTO MINING <span className="text-white text-xs">L{level}</span></h2>
      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-8 text-center">YIELD MULTIPLIER: {bonusMultiplier.toFixed(1)}x</p>

      <div className="flex justify-center gap-10 mb-10 h-32 items-center">
        <Die value={dice[0]} controls={controls1} />
        <Die value={dice[1]} controls={controls2} />
      </div>

      <div className="h-16 flex items-center justify-center mb-6">
        <AnimatePresence mode="wait">
            <motion.div
                key={message}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-2xl font-black uppercase italic tracking-tighter ${
                    outcome === 'win' ? 'text-emerald-400' :
                    outcome === 'lose' ? 'text-red-400' :
                    outcome === 'point' ? 'text-blue-400' :
                    'text-white'
                }`}
            >
                {message || 'CHOOSE A STRATEGY'}
            </motion.div>
        </AnimatePresence>
      </div>

      {point !== null && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 py-2 rounded-xl">
              <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">ACTIVE HASH POINT</div>
              <div className="text-3xl font-black text-white font-mono">{point}</div>
          </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { id: 'PASS', label: `PASS (${(2 * bonusMultiplier).toFixed(1)}x)`, color: 'bg-emerald-600' },
          { id: 'DONT_PASS', label: `DON'T PASS (${(2 * bonusMultiplier).toFixed(1)}x)`, color: 'bg-red-600' },
          { id: 'SEVEN', label: `ANY 7 (${(5 * bonusMultiplier).toFixed(1)}x)`, color: 'bg-blue-600' },
          { id: 'SNAKE_EYES', label: `EYES (${(30 * bonusMultiplier).toFixed(1)}x)`, color: 'bg-slate-800' },
        ].map(bet => (
          <button
            key={bet.id}
            onClick={() => !isRolling && !result && setSelectedBet(bet.id as Bet)}
            disabled={isRolling || !!result}
            className={`py-4 rounded-xl font-black border-2 transition-all active:scale-95 text-[10px] uppercase tracking-tighter ${
                selectedBet === bet.id ?
                'border-white ' + bet.color + ' shadow-[0_0_15px_rgba(255,255,255,0.3)]' :
                'bg-slate-900 border-slate-800 text-slate-500 hover:border-white/20'
            }`}
          >
            {bet.label}
          </button>
        ))}
      </div>

      <button
        onClick={rollDice}
        disabled={!selectedBet || isRolling || result !== null}
        className={`w-full py-5 rounded-2xl font-black transition-all active:scale-95 border-b-8 ${
            !selectedBet || isRolling || result !== null ?
            'bg-slate-800 text-slate-600 border-slate-950' :
            'bg-yellow-500 text-black border-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
        } uppercase italic tracking-tighter text-xl`}
      >
        {isRolling ? 'MINING...' : result !== null ? 'HASH SECURED' : 'INITIATE HASH'}
      </button>

      <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
        <div className="h-px bg-slate-800 flex-1" />
        <div className="flex flex-col items-center gap-1">
             <motion.div animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-xl">📱</motion.div>
             <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">SHAKE TO HASH</p>
        </div>
        <div className="h-px bg-slate-800 flex-1" />
      </div>
    </div>
  );
};
