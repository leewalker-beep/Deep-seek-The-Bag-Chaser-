// Safari compatibility polyfills
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const safeRequestAnimationFrame = (callback: () => void): void => {
  if (isSafari()) {
    setTimeout(callback, 16);
  } else if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16);
  }
};

export const safeDeviceOrientation = (callback: (event: DeviceOrientationEvent) => void): (() => void) => {
  const handler = (event: DeviceOrientationEvent) => {
    safeRequestAnimationFrame(() => callback(event));
  };
  window.addEventListener('deviceorientation', handler);
  return () => window.removeEventListener('deviceorientation', handler);
};

export const safeDeviceMotion = (callback: (event: DeviceMotionEvent) => void): (() => void) => {
  const handler = (event: DeviceMotionEvent) => {
    safeRequestAnimationFrame(() => callback(event));
  };
  window.addEventListener('devicemotion', handler);
  return () => window.removeEventListener('devicemotion', handler);
};
