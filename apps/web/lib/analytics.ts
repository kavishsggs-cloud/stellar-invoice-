// A simple analytics mock for MVP.
// In a real application, you would initialize PostHog, Mixpanel, or Google Analytics here.

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Mock event tracking for now
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] ${eventName}`, properties || {});
  }
};
