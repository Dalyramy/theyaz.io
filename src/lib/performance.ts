// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track page load performance
  trackPageLoad(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.set('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.metrics.set('loadComplete', navigation.loadEventEnd - navigation.loadEventStart);
        this.metrics.set('firstPaint', this.getFirstPaint());
        this.metrics.set('largestContentfulPaint', this.getLargestContentfulPaint());
      }
    }
  }

  // Track component render time
  trackComponentRender(componentName: string, startTime: number): void {
    const renderTime = performance.now() - startTime;
    this.metrics.set(`${componentName}_render`, renderTime);
    
    // Log slow renders
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  // Track API call performance
  trackApiCall(endpoint: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.metrics.set(`api_${endpoint}`, duration);
    
    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  // Get performance report
  getReport(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Send metrics to analytics (if configured)
  sendMetrics(): void {
    const report = this.getReport();
    // You can send this to your analytics service
    console.log('Performance Report:', report);
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lcp = lcpEntries[lcpEntries.length - 1];
    return lcp ? lcp.startTime : 0;
  }
}

// Hook for tracking component performance
export const usePerformanceTracking = (componentName: string) => {
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.trackComponentRender(componentName, startTime.current);
  });
};

// Hook for tracking API calls
export const useApiPerformanceTracking = () => {
  return (endpoint: string, apiCall: () => Promise<any>) => {
    const startTime = performance.now();
    return apiCall().finally(() => {
      const monitor = PerformanceMonitor.getInstance();
      monitor.trackApiCall(endpoint, startTime);
    });
  };
}; 