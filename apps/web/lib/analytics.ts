// A simple analytics mock for MVP.
// In a real application, you would initialize PostHog, Mixpanel, or Google Analytics here.

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // Mock event tracking for now
  console.log(`[Analytics] ${eventName}`, properties || {});
};
