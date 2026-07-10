import { useState, useCallback } from 'react';

export const useGlowShake = () => {
  const [shake, setShake] = useState(false);

  const triggerGlowShake = useCallback((intensity: number = 5) => {
    setShake(true);
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(Math.min(100, intensity * 15));
    }
    setTimeout(() => setShake(false), 300);
  }, []);

  return {
    shake,
    triggerGlowShake,
    shakeClassName: shake ? 'transform scale-105 duration-75 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''
  };
};
