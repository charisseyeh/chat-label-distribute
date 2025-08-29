import { useCallback, useRef, useEffect } from 'react';
import { useState } from 'react';

/**
 * Hook for debouncing function calls to improve performance
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook for throttling function calls to improve performance
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  const inThrottleRef = useRef(false);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    [callback, limit]
  ) as T;

  return throttledCallback;
};

/**
 * Hook for optimizing expensive calculations with requestAnimationFrame
 */
export const useRAF = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const rafRef = useRef<number>();

  const rafCallback = useCallback(
    (...args: Parameters<T>) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    },
    [callback]
  ) as T;

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return rafCallback;
};

/**
 * Hook for optimizing state updates with batching
 */
export const useBatchedState = <T>(
  initialState: T
): [T, (updater: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState(initialState);
  const batchRef = useRef<T[]>([]);
  const isBatchingRef = useRef(false);

  const setBatchedState = useCallback((updater: T | ((prev: T) => T)) => {
    if (isBatchingRef.current) {
      batchRef.current.push(updater);
    } else {
      isBatchingRef.current = true;
      
      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        const finalState = batchRef.current.reduce((current, update) => {
          if (typeof update === 'function') {
            return (update as (prev: T) => T)(current);
          }
          return update;
        }, state);
        
        setState(finalState);
        batchRef.current = [];
        isBatchingRef.current = false;
      });
    }
  }, [state]);

  return [state, setBatchedState];
};

/**
 * Hook for optimizing expensive operations with worker-like behavior
 */
export const useWorker = <T extends (...args: any[]) => any>(
  workerFunction: T,
  dependencies: any[] = []
): T => {
  const workerRef = useRef<Worker | null>(null);
  const messageQueueRef = useRef<Array<{ id: string; args: Parameters<T> }>>([]);
  const callbacksRef = useRef<Map<string, (result: any) => void>>(new Map());

  const workerCallback = useCallback(
    (...args: Parameters<T>) => {
      return new Promise((resolve) => {
        const id = Math.random().toString(36).substr(2, 9);
        
        // Store callback
        callbacksRef.current.set(id, resolve);
        
        // Add to message queue
        messageQueueRef.current.push({ id, args });
        
        // Process queue on next tick
        setTimeout(() => {
          if (messageQueueRef.current.length > 0) {
            const message = messageQueueRef.current.shift();
            if (message) {
              // Execute in next tick to avoid blocking
              setTimeout(() => {
                try {
                  const result = workerFunction(...message.args);
                  const callback = callbacksRef.current.get(message.id);
                  if (callback) {
                    callback(result);
                    callbacksRef.current.delete(message.id);
                  }
                } catch (error) {
                  console.error('Worker function error:', error);
                  const callback = callbacksRef.current.get(message.id);
                  if (callback) {
                    callback(null);
                    callbacksRef.current.delete(message.id);
                  }
                }
              }, 0);
            }
          }
        }, 0);
      });
    },
    [workerFunction, ...dependencies]
  ) as T;

  useEffect(() => {
    return () => {
      // Cleanup
      callbacksRef.current.clear();
      messageQueueRef.current = [];
    };
  }, []);

  return workerCallback;
};

/**
 * Hook for optimizing list rendering with virtualization hints
 */
export const useVirtualizationHint = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(window.scrollY / itemHeight));
  const endIndex = Math.min(itemCount - 1, startIndex + visibleItemCount);

  return {
    startIndex,
    endIndex,
    visibleItemCount,
    shouldVirtualize: itemCount > visibleItemCount * 2,
    totalHeight: itemCount * itemHeight,
  };
};

/**
 * Hook for optimizing scroll performance
 */
export const useScrollOptimization = (options: {
  throttleMs?: number;
  passive?: boolean;
} = {}) => {
  const { throttleMs = 16, passive = true } = options;
  const scrollHandlerRef = useRef<((event: Event) => void) | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const setScrollHandler = useCallback((handler: (event: Event) => void) => {
    scrollHandlerRef.current = handler;
  }, []);

  const attachScrollListener = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    
    if (scrollHandlerRef.current) {
      element.addEventListener('scroll', scrollHandlerRef.current, { passive });
    }
  }, [passive]);

  const detachScrollListener = useCallback(() => {
    if (elementRef.current && scrollHandlerRef.current) {
      elementRef.current.removeEventListener('scroll', scrollHandlerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      detachScrollListener();
    };
  }, [detachScrollListener]);

  return {
    setScrollHandler,
    attachScrollListener,
    detachScrollListener,
  };
};
