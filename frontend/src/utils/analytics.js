const ANALYTICS_STORAGE_KEY = 'finsight_analytics_events';
const UTM_STORAGE_KEY = 'finsight_utm_params';
const CONSENT_STORAGE_KEY = 'finsight_cookie_consent';
const MAX_STORED_EVENTS = 100;

export function captureUTMParams() {
  if (typeof window === 'undefined') return {};
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];
    const captured = {};

    utmKeys.forEach((key) => {
      const val = urlParams.get(key);
      if (val) captured[key] = val.slice(0, 100);
    });

    if (Object.keys(captured).length > 0) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
      return captured;
    }

    const saved = sessionStorage.getItem(UTM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function getCookieConsent() {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) || 'undecided';
  } catch {
    return 'undecided';
  }
}

export function setCookieConsent(preference) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, preference);
    trackEvent('cookie_consent_updated', { preference });
  } catch {
    // Ignore storage errors
  }
}

export function trackEvent(eventName, properties = {}) {
  try {
    const consent = getCookieConsent();
    if (consent === 'essential' && eventName !== 'cookie_consent_updated') {
      return;
    }

    const utm = captureUTMParams();
    const event = {
      event: eventName,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
      ...utm,
      ...properties,
    };

    const existing = JSON.parse(sessionStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
    const updated = [...existing.slice(-(MAX_STORED_EVENTS - 1)), event];
    sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, event);
    }
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible(eventName, { props: event });
    }
  } catch {
    // Ignore storage quota or serialization errors
  }
}

export function trackPageView(pathname) {
  trackEvent('page_view', { page: pathname });
}
