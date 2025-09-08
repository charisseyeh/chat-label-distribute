export interface ScrollTracker {
  trackMessageVisibility: (messageIndex: number, isVisible: boolean) => void;
  onTurn6Reached: (callback: () => void) => void;
  onEndReached: (callback: () => void) => void;
  startTracking: () => void;
  stopTracking: () => void;
  reset: () => void;
  destroy: () => void;
  setMessageCount: (count: number) => void;
  getState: () => any;
  getVisibleMessages: () => number[];
  setInitialVisibleMessages: (visibleIndices: number[]) => void;
  resetUserScrolled: () => void;
}

export interface ScrollTrackingOptions {
  turn6Threshold?: number; // Number of messages to trigger turn 6 survey
  intersectionThreshold?: number; // How much of a message needs to be visible (0-1)
}

export class ScrollTrackingService implements ScrollTracker {
  private turn6Callbacks: (() => void)[] = [];
  private endCallbacks: (() => void)[] = [];
  private turn6Reached = false;
  private endReached = false;
  private options: Required<ScrollTrackingOptions>;
  private messageCount = 0;
  private visibleMessages: Set<number> = new Set();
  private intersectionObserver: IntersectionObserver | null = null;
  private initialVisibleMessages: Set<number> = new Set();
  private hasUserScrolled = false;

  constructor(options: ScrollTrackingOptions = {}) {
    this.options = {
      turn6Threshold: options.turn6Threshold || 6,
      intersectionThreshold: options.intersectionThreshold || 0.1, // 10% of message visible
    };
  }

  /**
   * Set the total message count for turn 6 detection
   */
  setMessageCount(count: number): void {
    this.messageCount = count;
  }

  /**
   * Set the initially visible messages (on page load, before any scrolling)
   */
  setInitialVisibleMessages(visibleIndices: number[]): void {
    this.initialVisibleMessages.clear();
    visibleIndices.forEach(index => this.initialVisibleMessages.add(index));
  }

  /**
   * Track message visibility using message index and visibility state
   */
  trackMessageVisibility(messageIndex: number, isVisible: boolean): void {
    // Only track changes from the initial state, not the initial load
    if (!this.hasUserScrolled) {
      // This is the initial load - just store the initial state
      if (isVisible) {
        this.initialVisibleMessages.add(messageIndex);
      } else {
        this.initialVisibleMessages.delete(messageIndex);
      }
      return;
    }

    // User has scrolled - track actual visibility changes
    if (isVisible) {
      this.visibleMessages.add(messageIndex);
    } else {
      this.visibleMessages.delete(messageIndex);
    }
    
    // Get the highest visible message index (most recent visible message)
    const highestVisibleIndex = Math.max(...this.visibleMessages, -1);
    
    // Check if we've reached turn 6 threshold
    if (!this.turn6Reached && this.messageCount > 0 && highestVisibleIndex >= this.options.turn6Threshold) {
      this.triggerTurn6();
    }
    
    // Check if we've reached the end (last message is visible)
    if (!this.endReached && this.messageCount > 0 && highestVisibleIndex >= this.messageCount - 1) {
      this.triggerEnd();
    }
  }

  /**
   * Mark that the user has started scrolling (called on first scroll event)
   */
  markUserScrolled(): void {
    if (!this.hasUserScrolled) {
      this.hasUserScrolled = true;
      
      // Initialize visible messages with current intersection state
      this.visibleMessages.clear();
      this.initialVisibleMessages.forEach(index => this.visibleMessages.add(index));
    }
  }

  /**
   * Reset the user scrolled state (useful when switching conversations)
   */
  resetUserScrolled(): void {
    this.hasUserScrolled = false;
  }

  /**
   * Get array of currently visible message indices
   */
  getVisibleMessages(): number[] {
    return Array.from(this.visibleMessages).sort((a, b) => a - b);
  }

  /**
   * Set up intersection observer for message elements
   */
  setupIntersectionObserver(container: HTMLElement, scrollableContainer?: HTMLElement): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Use the scrollable container as root if provided, otherwise use viewport
    const root = scrollableContainer || null;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageIndex = parseInt(entry.target.getAttribute('data-message-index') || '0', 10);
          const isVisible = entry.isIntersecting;
          
          this.trackMessageVisibility(messageIndex, isVisible);
        });
      },
      {
        root: root, // Use scrollable container as root if provided
        rootMargin: '0px',
        threshold: this.options.intersectionThreshold,
      }
    );

    // Observe all message elements
    const messageElements = container.querySelectorAll('[data-message-index]');
    messageElements.forEach((element) => {
      this.intersectionObserver?.observe(element);
    });
    
    // Set up scroll listener to detect when user starts scrolling
    // Use the scrollable container if provided, otherwise fall back to window
    const targetContainer = scrollableContainer || window;
    const handleScroll = () => {
      this.markUserScrolled();
      // Remove scroll listener after first scroll
      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    // Reset user scrolled state when setting up new observer
    this.resetUserScrolled();
    
    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
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
   * Start tracking with intersection observer
   */
  startTracking(): void {
    // Tracking started
  }

  /**
   * Stop tracking
   */
  stopTracking(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  /**
   * Reset tracking state
   */
  reset(): void {
    this.turn6Reached = false;
    this.endReached = false;
    this.visibleMessages.clear();
    this.initialVisibleMessages.clear();
    this.hasUserScrolled = false;
    this.messageCount = 0;
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
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
    this.stopTracking();
    this.turn6Callbacks = [];
    this.endCallbacks = [];
    this.visibleMessages.clear();
    this.initialVisibleMessages.clear();
  }

  /**
   * Get current tracking state
   */
  getState() {
    return {
      turn6Reached: this.turn6Reached,
      endReached: this.endReached,
      visibleMessages: this.getVisibleMessages(),
      initialVisibleMessages: Array.from(this.initialVisibleMessages).sort((a, b) => a - b),
      hasUserScrolled: this.hasUserScrolled,
      messageCount: this.messageCount,
      options: this.options
    };
  }
}

// Factory function to create scroll tracker
export const createScrollTracker = (options?: ScrollTrackingOptions): ScrollTracker => {
  return new ScrollTrackingService(options);
};
