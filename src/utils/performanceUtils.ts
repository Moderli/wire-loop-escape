// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  updateTime: number;
  totalTime: number;
  frameDrops: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  minFPS: number;
  maxMemoryMB: number;
  maxRenderTimeMS: number;
  maxUpdateTimeMS: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private lastFrameTime = 0;
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 60;
  private frameDropCount = 0;
  private isMonitoring = false;
  private rafId: number | null = null;
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];

  private constructor() {
    this.thresholds = {
      minFPS: 30,
      maxMemoryMB: 512,
      maxRenderTimeMS: 16,
      maxUpdateTimeMS: 8
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.lastFPSUpdate = this.lastFrameTime;
    this.frameCount = 0;
    
    console.log('Performance monitoring started');
    this.monitorFrame();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    console.log('Performance monitoring stopped');
  }

  private monitorFrame() {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.frameCount++;
    
    // Update FPS every second
    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = (this.frameCount * 1000) / (now - this.lastFPSUpdate);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
      
      // Check for frame drops
      if (this.currentFPS < this.thresholds.minFPS) {
        this.frameDropCount++;
      }
    }

    // Collect metrics
    const metrics: PerformanceMetrics = {
      fps: this.currentFPS,
      memoryUsage: this.getMemoryUsage(),
      renderTime: frameTime,
      updateTime: this.getUpdateTime(),
      totalTime: now,
      frameDrops: this.frameDropCount,
      timestamp: now
    };

    // Store metrics (keep last 100 frames)
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(metrics));

    // Check for performance issues
    this.checkPerformanceThresholds(metrics);

    this.lastFrameTime = now;
    this.rafId = requestAnimationFrame(() => this.monitorFrame());
  }

  private getMemoryUsage(): number {
    try {
      const nav = navigator as any;
      if (nav.memory) {
        return nav.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private getUpdateTime(): number {
    // This would need to be implemented by the game engine
    // For now, estimate based on frame time
    return this.lastFrameTime * 0.3; // Rough estimate
  }

  private checkPerformanceThresholds(metrics: PerformanceMetrics) {
    let issues: string[] = [];

    if (metrics.fps < this.thresholds.minFPS) {
      issues.push(`Low FPS: ${metrics.fps.toFixed(1)}`);
    }

    if (metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      issues.push(`High memory usage: ${metrics.memoryUsage.toFixed(1)}MB`);
    }

    if (metrics.renderTime > this.thresholds.maxRenderTimeMS) {
      issues.push(`Slow render: ${metrics.renderTime.toFixed(1)}ms`);
    }

    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues.join(', '));
      this.triggerOptimizations();
    }
  }

  private triggerOptimizations() {
    // Emit optimization suggestions
    console.log('Triggering performance optimizations');
    
    // Could implement automatic optimizations here:
    // - Reduce particle count
    // - Lower rendering quality
    // - Reduce animation complexity
    // - Increase garbage collection frequency
  }

  getAverageMetrics(samples = 30): Partial<PerformanceMetrics> {
    const recentMetrics = this.metrics.slice(-samples);
    if (recentMetrics.length === 0) return {};

    const sum = recentMetrics.reduce((acc, metrics) => ({
      fps: acc.fps + metrics.fps,
      memoryUsage: acc.memoryUsage + metrics.memoryUsage,
      renderTime: acc.renderTime + metrics.renderTime,
      updateTime: acc.updateTime + metrics.updateTime,
      frameDrops: acc.frameDrops + metrics.frameDrops
    }), { fps: 0, memoryUsage: 0, renderTime: 0, updateTime: 0, frameDrops: 0 });

    const count = recentMetrics.length;
    return {
      fps: sum.fps / count,
      memoryUsage: sum.memoryUsage / count,
      renderTime: sum.renderTime / count,
      updateTime: sum.updateTime / count,
      frameDrops: sum.frameDrops
    };
  }

  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  setThresholds(thresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  getCurrentFPS(): number {
    return this.currentFPS;
  }

  getFrameDropCount(): number {
    return this.frameDropCount;
  }

  clearMetrics() {
    this.metrics = [];
    this.frameDropCount = 0;
  }

  destroy() {
    this.stopMonitoring();
    this.listeners = [];
    this.metrics = [];
  }
}

// Memory management utilities
export class MemoryManager {
  private static allocatedObjects = new Set<any>();
  private static cleanupTasks: Array<() => void> = [];

  static trackObject(obj: any, cleanupFn?: () => void) {
    this.allocatedObjects.add(obj);
    if (cleanupFn) {
      this.cleanupTasks.push(cleanupFn);
    }
  }

  static untrackObject(obj: any) {
    this.allocatedObjects.delete(obj);
  }

  static forceCleanup() {
    console.log(`Cleaning up ${this.cleanupTasks.length} tracked objects`);
    
    this.cleanupTasks.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    this.cleanupTasks = [];
    this.allocatedObjects.clear();

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  static getTrackedObjectCount(): number {
    return this.allocatedObjects.size;
  }

  static addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }
}

// Resource loading optimization
export class ResourceOptimizer {
  private static imageCache = new Map<string, HTMLImageElement>();
  private static audioCache = new Map<string, HTMLAudioElement>();

  static async preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  static async preloadAudio(url: string): Promise<HTMLAudioElement> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.audioCache.set(url, audio);
        resolve(audio);
      };
      audio.onerror = reject;
      audio.src = url;
    });
  }

  static clearCache() {
    this.imageCache.clear();
    this.audioCache.clear();
  }

  static getCacheSize(): { images: number; audio: number } {
    return {
      images: this.imageCache.size,
      audio: this.audioCache.size
    };
  }
}

// Timeout and interval tracking
export class TimeoutManager {
  private static activeTimeouts = new Map<number, NodeJS.Timeout>();
  private static activeIntervals = new Map<number, NodeJS.Timeout>();
  private static timeoutCounter = 0;

  static setTimeout(callback: () => void, delay: number): number {
    const id = ++this.timeoutCounter;
    const timeoutId = setTimeout(() => {
      this.activeTimeouts.delete(id);
      callback();
    }, delay);
    
    this.activeTimeouts.set(id, timeoutId);
    return id;
  }

  static setInterval(callback: () => void, delay: number): number {
    const id = ++this.timeoutCounter;
    const intervalId = setInterval(callback, delay);
    
    this.activeIntervals.set(id, intervalId);
    return id;
  }

  static clearTimeout(id: number) {
    const timeoutId = this.activeTimeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activeTimeouts.delete(id);
    }
  }

  static clearInterval(id: number) {
    const intervalId = this.activeIntervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeIntervals.delete(id);
    }
  }

  static clearAll() {
    console.log(`Clearing ${this.activeTimeouts.size} timeouts and ${this.activeIntervals.size} intervals`);
    
    this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
    this.activeIntervals.forEach(interval => clearInterval(interval));
    
    this.activeTimeouts.clear();
    this.activeIntervals.clear();
  }

  static getActiveCount(): { timeouts: number; intervals: number } {
    return {
      timeouts: this.activeTimeouts.size,
      intervals: this.activeIntervals.size
    };
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance(); 