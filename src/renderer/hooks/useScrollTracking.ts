import { useEffect, useRef, useCallback, useState } from 'react';
import { createScrollTracker, ScrollTracker, ScrollTrackingOptions } from '../services/survey/scrollTrackingService';

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

  // Create scroll tracker
  const createTracker = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.destroy();
    }

    trackerRef.current = createScrollTracker(trackingOptions);

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
  }, [trackingOptions]); // Only depend on trackingOptions, not callbacks

  // Start tracking
  const startTracking = useCallback(() => {
    if (!trackerRef.current) {
      createTracker();
    }

    if (trackerRef.current) {
      trackerRef.current.startTracking();
      setState(prev => ({ ...prev, isTracking: true }));
    }
  }, []); // No dependencies needed since we use refs

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.stopTracking();
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, []);

  // Reset tracking state
  const resetTracking = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.reset();
      setState({
        turn6Reached: false,
        endReached: false,
        isTracking: state.isTracking
      });
    }
  }, [state.isTracking]);

  // Manually trigger turn 6
  const triggerTurn6 = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.triggerTurn6();
    }
  }, []);

  // Manually trigger end reached
  const triggerEnd = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.triggerEnd();
    }
  }, []);

  // Track message visibility
  const trackMessageVisibility = useCallback((messageIndex: number) => {
    if (trackerRef.current) {
      trackerRef.current.trackMessageVisibility(messageIndex);
    }
  }, []);

  // Track conversation end
  const trackConversationEnd = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.trackConversationEnd();
    }
  }, []);

  // Get current tracking state
  const getTrackingState = useCallback(() => {
    if (trackerRef.current) {
      return trackerRef.current.getState();
    }
    return null;
  }, []);

  // Initialize tracking
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
  }, [autoStart]); // Remove createTracker dependency

  // Auto-start tracking when tracker is created
  useEffect(() => {
    if (trackerRef.current && autoStart) {
      startTracking();
    }
  }, [autoStart]); // Remove startTracking dependency

  return {
    // State
    ...state,
    
    // Actions
    startTracking,
    stopTracking,
    resetTracking,
    triggerTurn6,
    triggerEnd,
    
    // Tracking functions
    trackMessageVisibility,
    trackConversationEnd,
    
    // Utility
    getTrackingState,
    
    // Tracker reference (for advanced usage)
    tracker: trackerRef.current
  };
};
