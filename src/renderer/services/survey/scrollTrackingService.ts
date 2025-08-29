export interface ScrollTracker {
  trackMessageVisibility: (messageIndex: number) => void;
  onTurn6Reached: (callback: () => void) => void;
  onEndReached: (callback: () => void) => void;
  startTracking: () => void;
  stopTracking: () => void;
  reset: () => void;
  destroy: () => void;
  setMessageCount: (count: number) => void;
  getState: () => any;
}

export interface ScrollTrackingOptions {
  turn6Threshold?: number; // Number of messages to trigger turn 6 survey
}

export class ScrollTrackingService implements ScrollTracker {
  private turn6Callbacks: (() => void)[] = [];
  private endCallbacks: (() => void)[] = [];
  private turn6Reached = false;
  private endReached = false;
  private options: Required<ScrollTrackingOptions>;
  private messageCount = 0;
  private currentMessageIndex = 0;

  constructor(options: ScrollTrackingOptions = {}) {
    this.options = {
      turn6Threshold: options.turn6Threshold || 6,
    };
  }

  /**
   * Set the total message count for turn 6 detection
   */
  setMessageCount(count: number): void {
    this.messageCount = count;
    console.log(`🎯 Scroll tracking: Set message count to ${count}`);
  }

  /**
   * Track message visibility using message index
   */
  trackMessageVisibility(messageIndex: number): void {
    this.currentMessageIndex = messageIndex;
    
    // Check if we've reached turn 6 threshold
    if (!this.turn6Reached && this.messageCount > 0 && messageIndex >= this.options.turn6Threshold) {
      console.log(`🎯 Scroll tracking: Turn 6 threshold reached (${messageIndex}/${this.messageCount})`);
      this.triggerTurn6();
    }
    
    // Check if we've reached the end (last message is visible)
    if (!this.endReached && this.messageCount > 0 && messageIndex >= this.messageCount - 1) {
      console.log(`🎯 Scroll tracking: End reached (${messageIndex}/${this.messageCount})`);
      this.triggerEnd();
    }
  }

  /**
   * Register callback for turn 6 reached
   */
  onTurn6Reached(callback: () => void): void {
    this.turn6Callbacks.push(callback);
  }

  /**
   * Register callback for end reached
   */
  onEndReached(callback: () => void): void {
    this.endCallbacks.push(callback);
  }

  /**
   * Start tracking (no-op since we only track message visibility)
   */
  startTracking(): void {
    console.log('🎯 Scroll tracking: Started tracking message visibility');
  }

  /**
   * Stop tracking (no-op since we only track message visibility)
   */
  stopTracking(): void {
    console.log('🎯 Scroll tracking: Stopped tracking message visibility');
  }

  /**
   * Reset tracking state
   */
  reset(): void {
    this.turn6Reached = false;
    this.endReached = false;
    this.currentMessageIndex = 0;
    console.log('🔄 Scroll tracking: Reset tracking state');
  }

  /**
   * Manually trigger turn 6
   */
  triggerTurn6(): void {
    if (this.turn6Reached) return;
    
    this.turn6Reached = true;
    this.turn6Callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in turn 6 callback:', error);
      }
    });
  }

  /**
   * Manually trigger end reached
   */
  triggerEnd(): void {
    if (this.endReached) return;
    
    this.endReached = true;
    this.endCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in end reached callback:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.turn6Callbacks = [];
    this.endCallbacks = [];
    console.log('🎯 Scroll tracking: Destroyed');
  }

  /**
   * Get current tracking state
   */
  getState() {
    return {
      turn6Reached: this.turn6Reached,
      endReached: this.endReached,
      currentMessageIndex: this.currentMessageIndex,
      messageCount: this.messageCount,
      options: this.options
    };
  }
}

// Factory function to create scroll tracker
export const createScrollTracker = (options?: ScrollTrackingOptions): ScrollTracker => {
  return new ScrollTrackingService(options);
};
