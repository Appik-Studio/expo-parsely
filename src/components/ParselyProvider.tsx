import React from 'react'

import { TrackingProvider } from '../contexts/TrackingContext'
import { useNavigationTracking } from '../hooks/useNavigationTracking'

interface ParselyProviderProps {
  children: React.ReactNode
  /** Site ID for Parse.ly */
  siteId?: string
  /** Whether to auto-initialize Parse.ly SDK */
  autoInitialize?: boolean
  /** Flush interval for Parse.ly */
  flushInterval?: number
  /** Whether to run in dry-run mode */
  dryRun?: boolean
  /** Heartbeat configuration */
  heartbeatConfig?: {
    enableHeartbeats?: boolean
    inactivityThresholdMs?: number
    intervalMs?: number
    maxDurationMs?: number
  }
  /** Activity detection configuration */
  activityDetectionConfig?: {
    enableTouchDetection?: boolean
    enableScrollDetection?: boolean
    touchThrottleMs?: number
    scrollThrottleMs?: number
    scrollThreshold?: number
  }
  /** Navigation tracking configuration */
  navigationTracking?: {
    enabled?: boolean
    trackPageViews?: boolean
    trackScreens?: boolean
    urlPrefix?: string
    screenNameFormatter?: (pathname: string, params?: Record<string, any>) => string
  }
  /** Whether to enable debug logging */
  enableDebugLogging?: boolean
}

/**
 * Comprehensive Parse.ly provider that wraps the entire app
 * with tracking functionality, automatic initialization, and navigation tracking
 */
export const ParselyProvider: React.FC<ParselyProviderProps> = ({
  children,
  siteId,
  autoInitialize = true,
  flushInterval = 150,
  dryRun = false,
  heartbeatConfig = {
    enableHeartbeats: true,
    inactivityThresholdMs: 30000,
    intervalMs: 10000,
    maxDurationMs: 7200000 // 2 hours
  },
  activityDetectionConfig = {
    enableTouchDetection: true,
    enableScrollDetection: true,
    touchThrottleMs: 100,
    scrollThrottleMs: 1000,
    scrollThreshold: 5
  },
  navigationTracking = {
    enabled: true,
    trackPageViews: true,
    trackScreens: true
  },
  enableDebugLogging = false
}) => {
  return (
    <TrackingProvider
      autoInitialize={autoInitialize}
      siteId={siteId}
      flushInterval={flushInterval}
      dryRun={dryRun}
      heartbeatConfig={heartbeatConfig}
      activityDetectionConfig={activityDetectionConfig}
      enableDebugLogging={enableDebugLogging}>
      <NavigationTrackingWrapper navigationTracking={navigationTracking} debug={enableDebugLogging}>
        {children}
      </NavigationTrackingWrapper>
    </TrackingProvider>
  )
}

/**
 * Internal component to handle navigation tracking
 */
const NavigationTrackingWrapper: React.FC<{
  children: React.ReactNode
  navigationTracking: ParselyProviderProps['navigationTracking']
  debug: boolean
}> = ({ children, navigationTracking, debug }) => {
  // Use navigation tracking if enabled
  useNavigationTracking({
    ...navigationTracking,
    debug
  })

  return <>{children}</>
}

export default ParselyProvider
