const ANALYTICS_STORAGE_KEY = 'finsight_analytics_events';
const MAX_STORED_EVENTS = 100;

export function trackEvent(eventName, properties = {}) {
  try {
    const event = {
      event: eventName,
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      ...properties,
    };

    const existing = JSON.parse(sessionStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
    const updated = [...existing.slice(-(MAX_STORED_EVENTS - 1)), event];
    sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, properties);
    }
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: properties });
    }
  } catch {
    // Ignore storage quota or serialization errors
  }
}

export function trackPageView(pathname) {
  trackEvent('page_view', { page: pathname });
}
