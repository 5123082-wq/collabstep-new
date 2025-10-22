export type TelemetryPayload = Record<string, unknown> | undefined;

export function trackEvent(event: string, payload?: TelemetryPayload): void {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[telemetry]', event, payload ?? {});
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[telemetry] failed to log event', err);
  }
}
