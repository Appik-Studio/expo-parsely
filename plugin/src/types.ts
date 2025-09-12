export interface ExpoParselyPluginProps {
  siteId?: string
  flushInterval?: number
  dryRun?: boolean
  autoInitialize?: boolean
  autoWrap?: boolean
  enableNavigationTracking?: boolean
  enableScreenTracking?: boolean
  heartbeatConfig?: {
    enableHeartbeats?: boolean
    inactivityThresholdMs?: number
    intervalMs?: number
    maxDurationMs?: number
  }
  activityDetectionConfig?: {
    enableTouchDetection?: boolean
    enableScrollDetection?: boolean
    touchThrottleMs?: number
    scrollThrottleMs?: number
    scrollThreshold?: number
  }
}
