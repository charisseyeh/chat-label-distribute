export interface ScrollTracker {
  trackMessageVisibility: (messageIndex: number) => void;
  trackConversationEnd: () => void;
  onTurn6Reached: (callback: () => void) => void;
  onEndReached: (callback: () => void) => void;
  destroy: () => void;
}

export interface ScrollTrackingOptions {
  turn6Threshold?: number; // Number of messages to trigger turn 6 survey
  endThreshold?: number; // Distance from bottom to trigger end survey
  throttleMs?: number; // Throttle scroll events
}

export class ScrollTrackingService implements ScrollTracker {
  private turn6Callbacks: (() => void)[] = [];
  private endCallbacks: (() => void)[] = [];
  private turn6Reached = false;
  private endReached = false;
  private options: Required<ScrollTrackingOptions>;
  private scrollThrottle: number | null = null;
  private scrollElement: Element | null = null;
  private messageCount = 0;
  private currentMessageIndex = 0;

  constructor(options: ScrollTrackingOptions = {}) {
    this.options = {
      turn6Threshold: options.turn6Threshold || 6,
      endThreshold: options.endThreshold || 100,
      throttleMs: options.throttleMs || 100
    };
  }

  /**
   * Set the total message count for turn 6 detection
   */
  setMessageCount(count: number): void {
    this.messageCount = count;
  }

  /**
   * Track message visibility using message index
   */
  trackMessageVisibility(messageIndex: number): void {
    this.currentMessageIndex = messageIndex;
    
    // Don't automatically trigger turn 6 based on message count
    // Instead, wait for actual scroll events to determine when to show sections
    // Removed excessive logging
  }

  /**
   * Track conversation end using scroll position
   */
  trackConversationEnd(): void {
    if (this.endReached) return;

    const scrollElement = this.getScrollElement();
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= this.options.endThreshold) {
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
   * Start tracking scroll events
   */
  startTracking(): void {
    const scrollElement = this.getScrollElement();
    if (!scrollElement) {
      console.warn('⚠️ Scroll tracking: No scrollable element found');
      return;
    }

    this.scrollElement = scrollElement;

    // Throttled scroll handler
    const handleScroll = () => {
      if (this.scrollThrottle) return;

      this.scrollThrottle = window.setTimeout(() => {
        this.trackConversationEnd();
        this.scrollThrottle = null;
      }, this.options.throttleMs);
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    // Store reference for cleanup
    (scrollElement as any)._scrollHandler = handleScroll;
  }

  /**
   * Stop tracking scroll events
   */
  stopTracking(): void {
    if (!this.scrollElement) return;

    const handler = (this.scrollElement as any)._scrollHandler;
    if (handler) {
      this.scrollElement.removeEventListener('scroll', handler);
      delete (this.scrollElement as any)._scrollHandler;
    }

    if (this.scrollThrottle) {
      clearTimeout(this.scrollThrottle);
      this.scrollThrottle = null;
    }

    // Removed excessive logging
  }

  /**
   * Reset tracking state
   */
  reset(): void {
    this.turn6Reached = false;
    this.endReached = false;
    this.currentMessageIndex = 0;
    // Removed excessive logging
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
   * Get the scrollable element
   */
  private getScrollElement(): Element | null {
    // Try to find the main scrollable container in the conversation viewer
    const selectors = [
      'main', // Main content area
      '.overflow-auto', // Tailwind overflow class
      '[class*="overflow"]', // Any element with overflow
      '.conversation-container',
      '.messages-container'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (this.isScrollable(element)) {
          return element;
        }
      }
    }

    // Fallback to window
    return null;
  }

  /**
   * Check if element is scrollable
   */
  private isScrollable(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const overflow = style.overflow + style.overflowY + style.overflowX;
    const hasOverflow = overflow.includes('auto') || overflow.includes('scroll');
    const hasHeight = element.scrollHeight > element.clientHeight;
    
    return hasOverflow && hasHeight;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopTracking();
    this.scrollElement = null;
    this.turn6Callbacks = [];
    this.endCallbacks = [];
    // Removed excessive logging
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
