import { useRef, useLayoutEffect } from 'react';
import { isSafari, safeRequestAnimationFrame } from '../utils/safariPolyfill';

export const useSafariCompatible = <T extends (...args: never[]) => void>(callback: T): T => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const wrappedCallback = ((...args: Parameters<T>) => {
    if (isSafari()) {
      safeRequestAnimationFrame(() => callbackRef.current(...args));
    } else {
      callbackRef.current(...args);
    }
  }) as T;

  return wrappedCallback;
};
