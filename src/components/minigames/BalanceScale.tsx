import { useState, useEffect, useRef } from 'react';

interface BalanceScaleProps {
  onComplete: (multiplier: number) => void;
}

export const BalanceScale: React.FC<BalanceScaleProps> = ({ onComplete }) => {
  const [balance, setBalance] = useState(50); // 0 to 100, 50 is perfectly balanced
  const [timeLeft, setTimeLeft] = useState(10);
  const [failed, setFailed] = useState(false);
  const requestRef = useRef<number>(null);
  const driftRef = useRef(Math.random() > 0.5 ? 0.5 : -0.5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const animate = () => {
      setBalance(prev => {
        const newBalance = prev + driftRef.current;
        if (newBalance <= 0 || newBalance >= 100) {
          setFailed(true);
          return newBalance <= 0 ? 0 : 100;
        }
        // Increase drift over time
        driftRef.current += (prev - 50) * 0.005;
        return newBalance;
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(timer);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !failed) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      const score = 1 - Math.abs(50 - balance) / 50;
      onComplete(1.0 + score * 2.0);
    }
  }, [timeLeft, failed]);

  const handleCorrect = (amount: number) => {
    setBalance(prev => Math.max(0, Math.min(100, prev + amount)));
  };

  if (failed) {
    return (
      <div className="h-[400px] w-full bg-slate-950 border-4 border-red-900 rounded-3xl flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-black text-red-500 mb-4">MARKET CRASH</h2>
        <p className="text-slate-400 mb-8">You lost control of the assets</p>
        <button
          onClick={() => onComplete(0.2)}
          className="px-8 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-500 transition-colors"
        >
          LIQUIDATE
        </button>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-slate-900 border-4 border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-yellow-500 uppercase">Asset Balancing</h2>
        <div className="text-4xl font-black font-mono text-white mt-2">{timeLeft}s</div>
      </div>

      <div className="w-full h-4 bg-slate-800 rounded-full relative mb-12">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] transition-all duration-75"
          style={{ left: `${balance}%`, transform: 'translate(-50%, -50%)' }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/20 -translate-x-1/2" />
      </div>

      <div className="flex gap-4 w-full">
        <button
          onMouseDown={() => handleCorrect(-10)}
          className="flex-1 py-6 bg-slate-800 rounded-2xl active:bg-slate-700 active:scale-95 transition-all text-2xl"
        >
          ⬅️
        </button>
        <button
          onMouseDown={() => handleCorrect(10)}
          className="flex-1 py-6 bg-slate-800 rounded-2xl active:bg-slate-700 active:scale-95 transition-all text-2xl"
        >
          ➡️
        </button>
      </div>

      <p className="mt-8 text-xs text-slate-500 text-center uppercase font-bold">
        Keep the slider centered to maximize yield
      </p>
    </div>
  );
};
