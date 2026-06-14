import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface DiceCrapsProps {
  onComplete: (multiplier: number) => void;
}

type Bet = 'PASS' | 'DONT_PASS' | 'SEVEN' | 'SNAKE_EYES' | 'BOXCARS';

export const DiceCraps: React.FC<DiceCrapsProps> = ({ onComplete }) => {
  const [dice, setDice] = useState([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [point, setPoint] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const controls1 = useAnimation();
  const controls2 = useAnimation();

  useEffect(() => {
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
  }, [isRolling, selectedBet, result]);

  const rollDice = async () => {
    if (isRolling || !selectedBet || result !== null) return;

    setIsRolling(true);
    setMessage('');

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;

    const rollAnimation = (controls: any) => controls.start({
      rotate: [0, 90, 180, 270, 360, 450, 540],
      x: [0, -20, 20, -10, 10, 0],
      y: [0, -50, 0, -30, 0],
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

    if (selectedBet === 'PASS') {
      if (point === null) {
        if ([7, 11].includes(total)) {
          multiplier = 2.0;
          setMessage('WINNER! 7/11');
          ended = true;
        } else if ([2, 3, 12].includes(total)) {
          multiplier = 0.3;
          setMessage('CRAPS! LOSER');
          ended = true;
        } else {
          setPoint(total);
          setMessage(`POINT IS ${total}`);
        }
      } else {
        if (total === point) {
          multiplier = 3.0;
          setMessage('HIT THE POINT! WIN');
          ended = true;
        } else if (total === 7) {
          multiplier = 0.2;
          setMessage('SEVEN OUT! LOSE');
          ended = true;
        }
      }
    } else if (selectedBet === 'SEVEN') {
      if (total === 7) { multiplier = 5.0; setMessage('BIG RED! WIN'); }
      else { multiplier = 0.1; setMessage('NOT A SEVEN'); }
      ended = true;
    } else if (selectedBet === 'SNAKE_EYES') {
      if (total === 2) { multiplier = 30.0; setMessage('SNAKE EYES! JACKPOT'); }
      else { multiplier = 0.0; setMessage('FAIL'); }
      ended = true;
    } else if (selectedBet === 'BOXCARS') {
      if (total === 12) { multiplier = 30.0; setMessage('BOXCARS! JACKPOT'); }
      else { multiplier = 0.0; setMessage('FAIL'); }
      ended = true;
    } else if (selectedBet === 'DONT_PASS') {
        if (point === null) {
            if ([2, 3].includes(total)) { multiplier = 2.0; setMessage('WINNER'); ended = true; }
            else if ([7, 11].includes(total)) { multiplier = 0.3; setMessage('LOSER'); ended = true; }
            else if (total === 12) { multiplier = 1.0; setMessage('PUSH'); ended = true; }
            else { setPoint(total); setMessage(`POINT IS ${total}`); }
        } else {
            if (total === 7) { multiplier = 3.0; setMessage('WIN'); ended = true; }
            else if (total === point) { multiplier = 0.2; setMessage('LOSE'); ended = true; }
        }
    }

    if (ended) {
      setResult(multiplier);
      setTimeout(() => onComplete(multiplier), 2000);
    }
  };

  const Die = ({ value, controls }: { value: number; controls: any }) => (
    <motion.div
      animate={controls}
      className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-2 border-slate-200 relative p-4"
    >
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
           const dot = (
             value === 1 && i === 5 ||
             value === 2 && (i === 1 || i === 9) ||
             value === 3 && (i === 1 || i === 5 || i === 9) ||
             value === 4 && (i === 1 || i === 3 || i === 7 || i === 9) ||
             value === 5 && (i === 1 || i === 3 || i === 5 || i === 7 || i === 9) ||
             value === 6 && (i === 1 || i === 3 || i === 4 || i === 6 || i === 7 || i === 9)
           );
           return <div key={i} className={`rounded-full ${dot ? 'bg-black' : 'bg-transparent'} w-full h-full`} />;
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl text-center max-w-sm mx-auto font-mono">
      <h2 className="text-2xl font-black text-yellow-500 mb-6 uppercase tracking-tighter">Dice / Craps</h2>

      <div className="flex justify-center gap-8 mb-8 h-32 items-center">
        <Die value={dice[0]} controls={controls1} />
        <Die value={dice[1]} controls={controls2} />
      </div>

      <div className="mb-6 h-8 text-xl font-black text-white uppercase italic">
        {message}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { id: 'PASS', label: 'PASS LINE (2x)', color: 'bg-emerald-600' },
          { id: 'DONT_PASS', label: "DON'T PASS (2x)", color: 'bg-red-600' },
          { id: 'SEVEN', label: 'ANY 7 (5x)', color: 'bg-blue-600' },
          { id: 'SNAKE_EYES', label: 'EYES (30x)', color: 'bg-slate-800' },
        ].map(bet => (
          <button
            key={bet.id}
            onClick={() => !isRolling && !result && setSelectedBet(bet.id as Bet)}
            className={`py-3 rounded-lg font-bold border-2 transition-all text-[10px] ${selectedBet === bet.id ? 'border-white scale-105 ' + bet.color : 'bg-slate-900 border-slate-700 text-slate-500'}`}
          >
            {bet.label}
          </button>
        ))}
      </div>

      <button
        onClick={rollDice}
        disabled={!selectedBet || isRolling || result !== null}
        className={`w-full py-4 rounded-xl font-black transition-all ${!selectedBet || isRolling || result !== null ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 text-black shadow-[0_5px_0_rgb(161,98,7)] active:translate-y-1'}`}
      >
        {isRolling ? 'ROLLING...' : result !== null ? 'DONE' : 'ROLL DICE'}
      </button>

      <p className="mt-4 text-[8px] text-slate-500 uppercase tracking-widest">Shake device to roll • Good luck</p>
    </div>
  );
};
