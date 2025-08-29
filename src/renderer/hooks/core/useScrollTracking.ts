import { useEffect, useRef, useCallback, useState } from 'react';
import { createScrollTracker, ScrollTracker, ScrollTrackingOptions } from '../../services/survey/scrollTrackingService';

export interface UseScrollTrackingOptions extends ScrollTrackingOptions {
  autoStart?: boolean;
  onTurn6Reached?: () => void;
  onEndReached?: () => void;
}

export interface ScrollTrackingState {
  turn6Reached: boolean;
  endReached: boolean;
  isTracking: boolean;
}

export const useScrollTracking = (options: UseScrollTrackingOptions = {}) => {
  const {
    autoStart = true,
    onTurn6Reached,
    onEndReached,
    ...trackingOptions
  } = options;

  const trackerRef = useRef<ScrollTracker | null>(null);
  const callbacksRef = useRef({ onTurn6Reached, onEndReached });
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onTurn6Reached, onEndReached };
  }, [onTurn6Reached, onEndReached]);

  const [state, setState] = useState<ScrollTrackingState>({
    turn6Reached: false,
    endReached: false,
    isTracking: false
  });

  // Memoize tracking options to prevent unnecessary recreations
  const memoizedTrackingOptions = useRef(trackingOptions);
  
  // Create scroll tracker - memoized with no dependencies
  const createTracker = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.destroy();
    }

    trackerRef.current = createScrollTracker(memoizedTrackingOptions.current);

    // Register callbacks using ref to avoid dependency issues
    if (callbacksRef.current.onTurn6Reached) {
      trackerRef.current.onTurn6Reached(() => {
        setState(prev => ({ ...prev, turn6Reached: true }));
        callbacksRef.current.onTurn6Reached?.();
      });
    }

    if (callbacksRef.current.onEndReached) {
      trackerRef.current.onEndReached(() => {
        setState(prev => ({ ...prev, endReached: true }));
        callbacksRef.current.onEndReached?.();
      });
    }

    return trackerRef.current;
  }, []); // No dependencies needed since we use refs

  // Start tracking - memoized with no dependencies
  const startTracking = useCallback(() => {
    if (!trackerRef.current) {
      createTracker();
    }

    if (trackerRef.current) {
      trackerRef.current.startTracking();
      setState(prev => ({ ...prev, isTracking: true }));
    }
  }, []); // No dependencies needed since we use refs

  // Stop tracking - memoized with no dependencies
  const stopTracking = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.stopTracking();
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, []); // No dependencies needed since we use refs

  // Reset tracking state - memoized with no dependencies
  const resetTracking = useCallback(() => {
    console.log('🔄 useScrollTracking: Resetting tracking state');
    if (trackerRef.current) {
      trackerRef.current.reset();
      setState(prev => ({
        turn6Reached: false,
        endReached: false,
        isTracking: prev.isTracking // Preserve current tracking state
      }));
    }
  }, []); // No dependencies needed since we use refs

  // Track message visibility - memoized with no dependencies
  const trackMessageVisibility = useCallback((messageIndex: number) => {
    if (trackerRef.current) {
      trackerRef.current.trackMessageVisibility(messageIndex);
    }
  }, []); // No dependencies needed since we use refs

  // Set message count - memoized with no dependencies
  const setMessageCount = useCallback((count: number) => {
    if (trackerRef.current) {
      trackerRef.current.setMessageCount(count);
    }
  }, []); // No dependencies needed since we use refs

  // Get current tracking state - memoized with no dependencies
  const getTrackingState = useCallback(() => {
    if (trackerRef.current) {
      return trackerRef.current.getState();
    }
    return null;
  }, []); // No dependencies needed since we use refs

  // Initialize tracking - only run once on mount
  useEffect(() => {
    if (autoStart) {
      createTracker();
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.destroy();
        trackerRef.current = null;
      }
    };
  }, []); // Only run once

  // Auto-start tracking when tracker is created - only run once
  useEffect(() => {
    if (trackerRef.current && autoStart) {
      startTracking();
    }
  }, []); // Only run once

  return {
    // State
    ...state,
    
    // Actions - all memoized and stable
    startTracking,
    stopTracking,
    resetTracking,
    
    // Tracking functions - all memoized and stable
    trackMessageVisibility,
    setMessageCount,
    
    // Utility - memoized and stable
    getTrackingState,
    
    // Tracker reference (for advanced usage)
    tracker: trackerRef.current
  };
};
