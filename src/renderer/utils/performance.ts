/**
 * Performance monitoring utilities for navigation and routing
 */

interface PerformanceMetrics {
  navigationStart: number;
  navigationEnd: number;
  renderStart: number;
  renderEnd: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start measuring navigation performance
   */
  startNavigation(route: string): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.metrics.set(route, {
      navigationStart: startTime,
      navigationEnd: 0,
      renderStart: 0,
      renderEnd: 0,
    });

    console.log(`🚀 Navigation started: ${route}`);
  }

  /**
   * Mark navigation completion
   */
  endNavigation(route: string): void {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(route);
    if (metric) {
      metric.navigationEnd = performance.now();
      const duration = metric.navigationEnd - metric.navigationStart;
      
      if (duration > 100) {
        console.warn(`⚠️ Slow navigation detected: ${route} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ Navigation completed: ${route} in ${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Start measuring render performance
   */
  startRender(route: string): void {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(route);
    if (metric) {
      metric.renderStart = performance.now();
    }
  }

  /**
   * Mark render completion
   */
  endRender(route: string): void {
    if (!this.isEnabled) return;

    const metric = this.metrics.get(route);
    if (metric) {
      metric.renderEnd = performance.now();
      const renderDuration = metric.renderEnd - metric.renderStart;
      const totalDuration = metric.renderEnd - metric.navigationStart;
      
      console.log(`🎨 Render completed: ${route} in ${renderDuration.toFixed(2)}ms (total: ${totalDuration.toFixed(2)}ms)`);
    }
  }

  /**
   * Get performance summary for a route
   */
  getMetrics(route: string): PerformanceMetrics | undefined {
    return this.metrics.get(route);
  }

  /**
   * Clear metrics for a route
   */
  clearMetrics(route: string): void {
    this.metrics.delete(route);
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 */
export const usePerformanceMonitor = (route: string) => {
  React.useEffect(() => {
    performanceMonitor.startRender(route);
    
    return () => {
      performanceMonitor.endRender(route);
    };
  }, [route]);
};

/**
 * Utility to measure function execution time
 */
export const measureExecutionTime = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name} executed in ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle utility for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
