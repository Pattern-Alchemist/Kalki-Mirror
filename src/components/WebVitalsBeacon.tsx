'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';

// =============================================================
// VOL. 2 #18 — Core Web Vitals RUM Beacon
// -------------------------------------------------------------
// Captures LCP, FID, CLS, INP, TTFB from the browser's
// PerformanceObserver + Navigation APIs. Fires ONE `web_vitals`
// event per session (via sessionStorage guard) with the metrics +
// the route + device type. The event lands in the existing
// AnalyticsEvent table (event = 'web_vitals', properties = JSON).
//
// This component is mounted once in the root layout. It's invisible
// (renders null) and never throws — perf tracking is advisory.
// =============================================================

interface VitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const SESSION_KEY = 'kalki_wv_sent';

// Rating thresholds per Google's Core Web Vitals (2024)
function rateMetric(name: VitalMetric['name'], value: number): VitalMetric['rating'] {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
  }
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const conn = (navigator as any).connection;
  if (!conn) return 'unknown';
  return conn.effectiveType || 'unknown';
}

export function WebVitalsBeacon() {
  const metricsRef = useRef<Partial<Record<VitalMetric['name'], number>>>({});
  const firedRef = useRef(false);

  useEffect(() => {
    // Guard: only fire once per session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch { /* ignore */ }

    const sendBeacon = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }

      const metrics = metricsRef.current;
      const vitalMetrics: VitalMetric[] = [];
      for (const [name, value] of Object.entries(metrics)) {
        if (typeof value === 'number') {
          vitalMetrics.push({
            name: name as VitalMetric['name'],
            value: Math.round(value * 100) / 100,
            rating: rateMetric(name as VitalMetric['name'], value),
          });
        }
      }
      if (vitalMetrics.length === 0) return;

      track('web_vitals', {
        properties: {
          metrics: vitalMetrics,
          path: window.location.pathname,
          device: getDeviceType(),
          connection: getConnectionType(),
        },
      });
    };

    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metricsRef.current.LCP = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch { /* unsupported */ }

    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metricsRef.current.CLS = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch { /* unsupported */ }

    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        if (firstInput) {
          metricsRef.current.FID = (firstInput as any).processingStart - firstInput.startTime;
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch { /* unsupported */ }

    // INP (Interaction to Next Paint) — modern replacement for FID
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          // INP = the worst (max) interaction delay
          const max = entries.reduce((max, e) => Math.max(max, (e as any).duration || 0), 0);
          metricsRef.current.INP = max;
        }
      });
      inpObserver.observe({ type: 'event', buffered: true });
    } catch { /* unsupported */ }

    // TTFB (Time to First Byte) — from Navigation API
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming;
        metricsRef.current.TTFB = nav.responseStart - nav.requestStart;
      }
    } catch { /* unsupported */ }

    // Fire on visibilitychange (when user leaves) OR after 8s (whichever first)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendBeacon();
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    const timeout = setTimeout(sendBeacon, 8_000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(timeout);
      // Final attempt on unmount
      sendBeacon();
    };
  }, []);

  return null;
}
