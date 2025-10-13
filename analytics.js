// Simple analytics tracking for waitlist events
// Replace with Google Analytics, Plausible, or your preferred analytics service

class Analytics {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('imzad_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('imzad_session_id', sessionId);
    }
    return sessionId;
  }

  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      page: window.location.pathname,
      language: document.documentElement.lang || 'en',
      ...properties
    };

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Analytics]', event);
    }

    // TODO: Send to your analytics service
    // Example for Google Analytics:
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', eventName, properties);
    // }

    // Example for Plausible:
    // if (typeof plausible !== 'undefined') {
    //   plausible(eventName, { props: properties });
    // }
  }

  // Predefined events
  pageView() {
    this.track('page_view', {
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }

  waitlistModalOpened(trigger) {
    this.track('waitlist_modal_opened', { trigger });
  }

  waitlistModalClosed(reason) {
    this.track('waitlist_modal_closed', { reason });
  }

  waitlistFormStarted() {
    this.track('waitlist_form_started');
  }

  waitlistFormSubmitted(userType, contactMethod, language) {
    this.track('waitlist_form_submitted', {
      userType,
      contactMethod,
      language
    });
  }

  waitlistFormError(error) {
    this.track('waitlist_form_error', { error });
  }

  contactMethodToggled(method) {
    this.track('contact_method_toggled', { method });
  }

  languageSwitched(from, to) {
    this.track('language_switched', { from, to });
  }
}

// Initialize analytics
const analytics = new Analytics();

// Track page view on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => analytics.pageView());
} else {
  analytics.pageView();
}

// Export for use in other scripts
window.imzadAnalytics = analytics;

