// Debounce function for high-frequency events
export const debounce = <T extends (...args: never[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = <T extends (...args: never[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const createAdvancementWorker = () => {
  const workerCode = `
    self.onmessage = function(e) {
      const { pl, currentMarket, configs } = e.data;
      let calculationImpact = 1.0;
      if (pl.activeWorldEvent) {
        calculationImpact = 1.35;
      }
      const processedYields = Math.floor(e.data.baseIncome * calculationImpact);
      self.postMessage({ processedYields });
    };
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

export const runParallelMonthUpdate = (stateData: any, onWorkerFinished: (result: any) => void) => {
  const blobCode = `
    self.onmessage = function(e) {
      const data = e.data;
      const result = Math.floor(data.income * data.mult);
      self.postMessage(result);
    };
  `;
  const blob = new Blob([blobCode], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));
  worker.postMessage(stateData);
  worker.onmessage = (e) => {
    onWorkerFinished(e.data);
    worker.terminate();
  };
};
