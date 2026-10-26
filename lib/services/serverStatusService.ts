'use client';

type StatusListener = (isDown: boolean) => void;

class ServerStatusService {
  private isDown: boolean = false;
  private listeners: Set<StatusListener> = new Set();
  private healthCheckInterval: any = null;
  private consecutiveFailures: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // Periodic background check if marked down
      window.addEventListener('online', () => this.checkHealth());
      window.addEventListener('offline', () => this.setDown(true));
    }
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isDown);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getIsDown(): boolean {
    return this.isDown;
  }

  public setDown(down: boolean) {
    if (this.isDown !== down) {
      this.isDown = down;
      this.listeners.forEach((fn) => fn(this.isDown));

      if (down && !this.healthCheckInterval && typeof window !== 'undefined') {
        // Poll every 8 seconds to automatically recover when server restarts
        this.healthCheckInterval = setInterval(() => {
          this.checkHealth();
        }, 8000);
      } else if (!down && this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
    }
  }

  public reportError(error: any, statusCode?: number) {
    // If status code is 502, 503, 504, or network connection failed
    const isNetworkError =
      error?.name === 'TypeError' ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('Network') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('connection') ||
      statusCode === 502 ||
      statusCode === 503 ||
      statusCode === 504;

    if (isNetworkError) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 1) {
        this.setDown(true);
      }
    }
  }

  public reportSuccess() {
    this.consecutiveFailures = 0;
    if (this.isDown) {
      this.setDown(false);
    }
  }

  public async checkHealth(): Promise<boolean> {
    if (typeof window === 'undefined') return true;

    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const rootUrl = rawUrl.replace(/\/api\/?$/, '');
      const healthUrl = `${rootUrl}/health`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(healthUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        this.consecutiveFailures = 0;
        this.setDown(false);
        return true;
      } else {
        this.setDown(true);
        return false;
      }
    } catch (err) {
      this.setDown(true);
      return false;
    }
  }
}

export const serverStatusService = new ServerStatusService();
