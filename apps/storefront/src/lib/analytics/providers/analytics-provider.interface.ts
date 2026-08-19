import { AnalyticsEvent, AnalyticsEventType } from "../analytics-types"

export interface AnalyticsProvider {
  name: string
  trackEvent<T extends AnalyticsEventType>(event: AnalyticsEvent<T>): void | Promise<void>
  identify?(userId: string, traits?: Record<string, any>): void
}
