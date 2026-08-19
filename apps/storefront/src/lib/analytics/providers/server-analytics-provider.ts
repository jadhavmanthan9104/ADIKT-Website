import { AnalyticsProvider } from "./analytics-provider.interface"
import { AnalyticsEvent, AnalyticsEventType } from "../analytics-types"

export class ServerAnalyticsProvider implements AnalyticsProvider {
  name = "Server Telemetry Pipeline"

  trackEvent<T extends AnalyticsEventType>(event: AnalyticsEvent<T>): void {
    if (typeof window === "undefined") return

    try {
      const payloadString = JSON.stringify(event)

      // Use navigator.sendBeacon when available for non-blocking beaconing (e.g. during page unload)
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payloadString], { type: "application/json" })
        const sent = navigator.sendBeacon("/api/analytics/events", blob)
        if (sent) return
      }

      // Async fetch fallback
      fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadString,
        keepalive: true,
      }).catch(() => {
        // Silently swallow client tracking network errors
      })
    } catch {}
  }
}
