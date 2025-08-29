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

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Navigation started for route: ${route}`);
    }
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Navigation completed for route: ${route} in ${duration.toFixed(2)}ms`);
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎨 Render completed for route: ${route} in ${renderDuration.toFixed(2)}ms (total: ${totalDuration.toFixed(2)}ms)`);
      }
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
