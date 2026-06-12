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
  const targetValueRef = useRef(value);
  const currentDisplayValueRef = useRef(value);
  const onCompleteRef = useRef(onComplete);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Only start a new animation if the value prop has actually changed
    if (targetValueRef.current === value) return;

    const startValue = currentDisplayValueRef.current;
    const endValue = value;
    targetValueRef.current = value;

    const diff = endValue - startValue;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      let currentValue: number;
      if (isJackpot && progress < 1) {
        // Jackpot chaos: add some jitter to the intermediate values
        const chaos = Math.random() * Math.abs(diff) * 0.2;
        currentValue = startValue + (diff * easedProgress) + (Math.random() > 0.5 ? chaos : -chaos);
      } else {
        currentValue = startValue + (diff * easedProgress);
      }

      const finalValue = progress === 1 ? endValue : Math.max(0, Math.floor(currentValue));
      setDisplayValue(finalValue);
      currentDisplayValueRef.current = finalValue;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        if (onCompleteRef.current) onCompleteRef.current();
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, isJackpot, duration]);

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
