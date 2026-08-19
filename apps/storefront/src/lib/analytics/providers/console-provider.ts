import { AnalyticsProvider } from "./analytics-provider.interface"
import { AnalyticsEvent, AnalyticsEventType } from "../analytics-types"

export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  name = "Console Logger"

  trackEvent<T extends AnalyticsEventType>(event: AnalyticsEvent<T>): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`📊 [Analytics Event: ${event.event}]`, event.payload)
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(`👤 [Analytics Identify: ${userId}]`, traits)
    }
  }
}
