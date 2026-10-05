// ============================================================
// PERFORMANCE UTILITY — Adaptive FPS Detection & Optimization
// ============================================================

export interface PerformanceProfile {
  targetFPS: number;
  deviceRefreshRate: number;
  isHighRefresh: boolean;
  supportsGPU: boolean;
  isBatterySaver: boolean;
  isLowEnd: boolean;
  reducedMotion: boolean;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private profile: PerformanceProfile;
  private frameCount = 0;
  private lastCheck = 0;
  private currentFPS = 60;
  private rafId: number | null = null;
  private listeners: ((profile: PerformanceProfile) => void)[] = [];

  private constructor() {
    this.profile = {
      targetFPS: 60,
      deviceRefreshRate: 60,
      isHighRefresh: false,
      supportsGPU: true,
      isBatterySaver: false,
      isLowEnd: false,
      reducedMotion: false,
    };
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  // ==================== INITIALIZE ====================
  init() {
    if (typeof window === "undefined") return;

    // Detect refresh rate
    this.detectRefreshRate();

    // Detect reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.profile.reducedMotion = mq.matches;

    // Detect battery status
    this.detectBattery();

    // Detect device capabilities
    this.detectDevice();

    // Start FPS monitoring
    this.startFPSMonitor();
  }

  // ==================== DETECT REFRESH RATE ====================
  private detectRefreshRate() {
    // Modern approach: measure actual RAF intervals
    let lastTime = performance.now();
    let frames = 0;
    const measurements: number[] = [];

    const measure = () => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      if (delta > 5 && delta < 25) {
        measurements.push(delta);
      }

      frames++;

      if (frames < 30) {
        requestAnimationFrame(measure);
      } else {
        // Calculate median frame time
        measurements.sort((a, b) => a - b);
        const median = measurements[Math.floor(measurements.length / 2)] || 16.67;

        // Map to closest refresh rate
        const detectedRate = Math.round(1000 / median);

        if (detectedRate >= 200) this.profile.deviceRefreshRate = 240;
        else if (detectedRate >= 130) this.profile.deviceRefreshRate = 144;
        else if (detectedRate >= 100) this.profile.deviceRefreshRate = 120;
        else if (detectedRate >= 75) this.profile.deviceRefreshRate = 90;
        else this.profile.deviceRefreshRate = 60;

        // Set target FPS
        this.profile.targetFPS = this.profile.deviceRefreshRate;
        this.profile.isHighRefresh = this.profile.deviceRefreshRate > 60;

        // Notify listeners
        this.notifyListeners();
      }
    };

    requestAnimationFrame(measure);
  }

  // ==================== DETECT BATTERY ====================
  private async detectBattery() {
    if (typeof window === "undefined" || !("getBattery" in navigator)) return;

    try {
      const battery = await (navigator as any).getBattery();
      const checkBattery = () => {
        this.profile.isBatterySaver = battery.level < 0.2 && !battery.charging;

        // If low battery, downgrade FPS
        if (this.profile.isBatterySaver && this.profile.targetFPS > 60) {
          this.profile.targetFPS = 60;
          this.notifyListeners();
        }
      };

      checkBattery();
      battery.addEventListener("levelchange", checkBattery);
      battery.addEventListener("chargingchange", checkBattery);
    } catch (e) {
      // Battery API not supported
    }
  }

  // ==================== DETECT DEVICE ====================
  private detectDevice() {
    if (typeof window === "undefined") return;

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // Check device memory (if available)
    const memory = (navigator as any).deviceMemory || 4;

    // Low-end detection
    this.profile.isLowEnd = cores <= 4 || memory <= 4;

    // GPU detection
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      this.profile.supportsGPU = !!gl;
    } catch (e) {
      this.profile.supportsGPU = false;
    }

    // If low-end device, cap FPS at 60
    if (this.profile.isLowEnd && this.profile.targetFPS > 60) {
      this.profile.targetFPS = 60;
    }
  }

  // ==================== FPS MONITOR (Auto-Downgrade) ====================
  private startFPSMonitor() {
    let lastTime = performance.now();
    let frames = 0;
    let consecutiveSlowFrames = 0;

    const check = (currentTime: number) => {
      frames++;
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        this.currentFPS = (frames * 1000) / delta;

        // If FPS is significantly below target, downgrade
        if (this.currentFPS < this.profile.targetFPS * 0.85) {
          consecutiveSlowFrames++;

          if (consecutiveSlowFrames >= 3) {
            // Downgrade FPS
            const newTarget = this.profile.targetFPS > 120
              ? 120
              : this.profile.targetFPS > 90
              ? 90
              : this.profile.targetFPS > 60
              ? 60
              : 30;

            if (newTarget !== this.profile.targetFPS) {
              this.profile.targetFPS = newTarget;
              this.notifyListeners();
            }

            consecutiveSlowFrames = 0;
          }
        } else {
          consecutiveSlowFrames = 0;
        }

        frames = 0;
        lastTime = currentTime;
      }

      this.rafId = requestAnimationFrame(check);
    };

    this.rafId = requestAnimationFrame(check);
  }

  // ==================== LISTENERS ====================
  subscribe(listener: (profile: PerformanceProfile) => void) {
    this.listeners.push(listener);
    listener(this.profile);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.profile }));
  }

  // ==================== GETTERS ====================
  getProfile(): PerformanceProfile {
    return { ...this.profile };
  }

  getCurrentFPS(): number {
    return this.currentFPS;
  }

  // ==================== CLEANUP ====================
  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.listeners = [];
  }
}

export const performanceManager =
  typeof window !== "undefined"
    ? PerformanceManager.getInstance()
    : null;

// ==================== REACT HOOK ====================
export function usePerformance() {
  if (typeof window === "undefined") {
    return {
      targetFPS: 60,
      deviceRefreshRate: 60,
      isHighRefresh: false,
      supportsGPU: true,
      isBatterySaver: false,
      isLowEnd: false,
      reducedMotion: false,
    };
  }

  const { useState, useEffect } = require("react");
  const [profile, setProfile] = useState(performanceManager?.getProfile() || {
    targetFPS: 60,
    deviceRefreshRate: 60,
    isHighRefresh: false,
    supportsGPU: true,
    isBatterySaver: false,
    isLowEnd: false,
    reducedMotion: false,
  });

  useEffect(() => {
    if (!performanceManager) return;
    performanceManager.init();
    const unsubscribe = performanceManager.subscribe(setProfile);
    return unsubscribe;
  }, []);

  return profile;
}