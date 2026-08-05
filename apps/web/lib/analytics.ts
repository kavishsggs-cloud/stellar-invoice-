export type AnalyticsEvent = 
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'contract_invocation'
  | 'feedback_submitted'
  | 'invoice_created'
  | 'invoice_paid'
  | string;

export interface EventPayload {
  event: AnalyticsEvent;
  wallet?: string;
  contractId?: string;
  txHash?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
  [key: string]: unknown;
}

export const logAnalyticsEvent = (event: AnalyticsEvent, payload: Omit<EventPayload, 'event' | 'timestamp'> = {}) => {
  const fullPayload: EventPayload = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const existingLogs = JSON.parse(localStorage.getItem('stellar_analytics_events') || '[]');
    existingLogs.push(fullPayload);
    localStorage.setItem('stellar_analytics_events', JSON.stringify(existingLogs));
    console.log(`[ANALYTICS_EVENT: ${event}]`, fullPayload);
  }

  return fullPayload;
};

export const trackEvent = (eventName: string, metadata: Record<string, unknown> = {}) => {
  return logAnalyticsEvent(eventName, { metadata });
};

export const getAnalyticsEvents = (): EventPayload[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('stellar_analytics_events') || '[]');
};

