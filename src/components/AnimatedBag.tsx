import React, { useEffect, useState, useRef } from 'react';

interface AnimatedBagProps {
  value: number;
  isWin?: boolean;
  isLoss?: boolean;
  isJackpot?: boolean;
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedBag: React.FC<AnimatedBagProps> = ({
  value,
  isWin = false,
  isLoss = false,
  isJackpot = false,
  duration = 800,
  onComplete
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (prevValueRef.current === value || animatingRef.current) return;

    const startValue = prevValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;
    const steps = isJackpot ? 20 : 12;
    const stepTime = duration / steps;

    let currentStep = 0;
    animatingRef.current = true;

    const intermediates: number[] = [];
    for (let i = 1; i <= steps; i++) {
      let progress = i / steps;
      progress = 1 - Math.pow(1 - progress, 3);
      let intermediate;
      if (isJackpot) {
        const chaos = Math.random() * Math.abs(diff) * 0.5;
        intermediate = startValue + (diff * progress) + (Math.random() > 0.5 ? chaos : -chaos);
      } else {
        intermediate = startValue + (diff * progress);
      }
      intermediates.push(Math.max(0, Math.floor(intermediate)));
    }

    const interval = setInterval(() => {
      if (currentStep < steps) {
        setDisplayValue(intermediates[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        setDisplayValue(endValue);
        animatingRef.current = false;
        prevValueRef.current = endValue;
        if (onComplete) onComplete();
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [value, isJackpot, duration, onComplete]);

  const getColorClass = () => {
    if (isJackpot) return 'text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]';
    if (isWin) return 'text-emerald-400';
    if (isLoss) return 'text-red-400';
    return 'text-white';
  };

  return (
    <span className={`font-mono font-bold transition-colors duration-200 ${getColorClass()}`}>
      ${displayValue.toLocaleString()}
    </span>
  );
};
