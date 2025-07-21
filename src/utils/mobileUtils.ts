// Mobile utilities for handling edge cases and optimizations

export interface MobileCapabilities {
  hasTouch: boolean;
  hasOrientationAPI: boolean;
  hasFullscreenAPI: boolean;
  hasVisibilityAPI: boolean;
  supportsVibration: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  screenSize: 'small' | 'medium' | 'large';
  deviceType: 'phone' | 'tablet' | 'desktop';
}

export interface DevicePerformance {
  memoryLevel: 'low' | 'medium' | 'high';
  cpuLevel: 'low' | 'medium' | 'high';
  batteryLevel?: number;
  isLowPowerMode: boolean;
  connectionType: 'slow' | 'fast' | 'offline';
}

export class MobileManager {
  private static instance: MobileManager;
  private capabilities: MobileCapabilities;
  private performance: DevicePerformance;
  private orientationListeners: Array<(orientation: string) => void> = [];
  private visibilityListeners: Array<(visible: boolean) => void> = [];

  private constructor() {
    this.capabilities = this.detectCapabilities();
    this.performance = this.assessPerformance();
    this.setupEventListeners();
  }

  static getInstance(): MobileManager {
    if (!MobileManager.instance) {
      MobileManager.instance = new MobileManager();
    }
    return MobileManager.instance;
  }

  private detectCapabilities(): MobileCapabilities {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;

    // Screen size detection
    const screenWidth = Math.max(window.screen.width, window.screen.height);
    let screenSize: 'small' | 'medium' | 'large' = 'medium';
    if (screenWidth < 768) screenSize = 'small';
    else if (screenWidth > 1024) screenSize = 'large';

    // Device type detection
    let deviceType: 'phone' | 'tablet' | 'desktop' = 'desktop';
    if (screenWidth < 768) deviceType = 'phone';
    else if (screenWidth < 1024 && ('ontouchstart' in window)) deviceType = 'tablet';

    return {
      hasTouch: 'ontouchstart' in window,
      hasOrientationAPI: 'orientation' in screen,
      hasFullscreenAPI: 'requestFullscreen' in document.documentElement,
      hasVisibilityAPI: 'visibilityState' in document,
      supportsVibration: 'vibrate' in navigator,
      isIOS,
      isAndroid,
      isPWA,
      screenSize,
      deviceType
    };
  }

  private assessPerformance(): DevicePerformance {
    const nav = navigator as any;
    
    // Memory assessment
    let memoryLevel: 'low' | 'medium' | 'high' = 'medium';
    if (nav.deviceMemory) {
      if (nav.deviceMemory <= 2) memoryLevel = 'low';
      else if (nav.deviceMemory >= 8) memoryLevel = 'high';
    }

    // CPU assessment (rough estimate)
    let cpuLevel: 'low' | 'medium' | 'high' = 'medium';
    if (nav.hardwareConcurrency) {
      if (nav.hardwareConcurrency <= 2) cpuLevel = 'low';
      else if (nav.hardwareConcurrency >= 8) cpuLevel = 'high';
    }

    // Battery level
    let batteryLevel: number | undefined;
    let isLowPowerMode = false;
    
    // Connection assessment
    let connectionType: 'slow' | 'fast' | 'offline' = 'fast';
    if (nav.connection) {
      const effectiveType = nav.connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionType = 'slow';
      }
    }
    if (!navigator.onLine) {
      connectionType = 'offline';
    }

    return {
      memoryLevel,
      cpuLevel,
      batteryLevel,
      isLowPowerMode,
      connectionType
    };
  }

  private setupEventListeners() {
    // Orientation change handling
    if (this.capabilities.hasOrientationAPI) {
      screen.orientation?.addEventListener('change', () => {
        const orientation = this.getOrientation();
        this.orientationListeners.forEach(listener => listener(orientation));
      });
    }

    // Fallback orientation detection
    window.addEventListener('resize', () => {
      const orientation = this.getOrientation();
      this.orientationListeners.forEach(listener => listener(orientation));
    });

    // Visibility API handling
    if (this.capabilities.hasVisibilityAPI) {
      document.addEventListener('visibilitychange', () => {
        const visible = !document.hidden;
        this.visibilityListeners.forEach(listener => listener(visible));
      });
    }

    // iOS-specific fixes
    if (this.capabilities.isIOS) {
      this.setupIOSFixes();
    }

    // Android-specific fixes
    if (this.capabilities.isAndroid) {
      this.setupAndroidFixes();
    }
  }

  private setupIOSFixes() {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      const content = viewport.getAttribute('content');
      if (content && !content.includes('user-scalable=no')) {
        viewport.setAttribute('content', content + ', user-scalable=no');
      }
    }

    // Handle iOS Safari address bar
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 500);
    });

    // Prevent elastic scrolling
    document.addEventListener('touchmove', (e) => {
      if ((e.target as Element).closest('.game-area')) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  private setupAndroidFixes() {
    // Handle Android soft keyboard
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        // Keyboard visibility detection
        const heightDiff = window.screen.height - window.visualViewport.height;
        const isKeyboardVisible = heightDiff > 150;
        
        if (isKeyboardVisible) {
          console.warn('Soft keyboard detected, may affect game area');
        }
      });
    }

    // Handle Android back button
    window.addEventListener('popstate', (e) => {
      // Could implement custom back button handling
    });
  }

  // Public API methods
  getCapabilities(): MobileCapabilities {
    return { ...this.capabilities };
  }

  getPerformance(): DevicePerformance {
    return { ...this.performance };
  }

  getOrientation(): string {
    if (this.capabilities.hasOrientationAPI && screen.orientation) {
      return screen.orientation.type;
    }
    
    // Fallback detection
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  requestFullscreen(element?: Element): Promise<void> {
    const target = element || document.documentElement;
    const elem = target as any;

    if (!this.capabilities.hasFullscreenAPI) {
      return Promise.reject(new Error('Fullscreen not supported'));
    }

    // Try different fullscreen methods
    const methods = [
      'requestFullscreen',
      'webkitRequestFullscreen',
      'mozRequestFullScreen',
      'msRequestFullscreen'
    ];

    for (const method of methods) {
      if (typeof elem[method] === 'function') {
        return elem[method]().catch((err: Error) => {
          console.warn(`Fullscreen method ${method} failed:`, err);
          throw err;
        });
      }
    }

    return Promise.reject(new Error('No fullscreen method available'));
  }

  preventZoom() {
    // Prevent pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  optimizeForPerformance(): {
    targetFPS: number;
    particleCount: number;
    effectQuality: 'low' | 'medium' | 'high';
    enableBlur: boolean;
  } {
    const { memoryLevel, cpuLevel, connectionType } = this.performance;
    
    let targetFPS = 60;
    let particleCount = 100;
    let effectQuality: 'low' | 'medium' | 'high' = 'high';
    let enableBlur = true;

    // Adjust based on performance
    if (memoryLevel === 'low' || cpuLevel === 'low') {
      targetFPS = 30;
      particleCount = 25;
      effectQuality = 'low';
      enableBlur = false;
    } else if (memoryLevel === 'medium' || cpuLevel === 'medium') {
      targetFPS = 45;
      particleCount = 50;
      effectQuality = 'medium';
    }

    // Adjust for slow connections
    if (connectionType === 'slow') {
      targetFPS = Math.min(targetFPS, 30);
      effectQuality = 'low';
    }

    return { targetFPS, particleCount, effectQuality, enableBlur };
  }

  vibrate(pattern: number | number[]) {
    if (this.capabilities.supportsVibration) {
      navigator.vibrate(pattern);
    }
  }

  onOrientationChange(callback: (orientation: string) => void) {
    this.orientationListeners.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.orientationListeners.indexOf(callback);
      if (index > -1) {
        this.orientationListeners.splice(index, 1);
      }
    };
  }

  onVisibilityChange(callback: (visible: boolean) => void) {
    this.visibilityListeners.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.visibilityListeners.indexOf(callback);
      if (index > -1) {
        this.visibilityListeners.splice(index, 1);
      }
    };
  }

  // Accessibility helpers
  isHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  isReducedMotionPreferred(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  isDarkModePreferred(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => void): number {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  // Cleanup
  destroy() {
    this.orientationListeners = [];
    this.visibilityListeners = [];
  }
}

export const mobileManager = MobileManager.getInstance(); 