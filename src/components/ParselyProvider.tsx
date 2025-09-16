import React, { createContext, useCallback, useContext, useEffect } from 'react'

import type { ActivityDetectionConfig, ParselyProviderProps, TrackingContextValue } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { createDebugLogger, DebugLoggerContext } from '../utils/debugLogger'
import { heartbeatManager } from '../utils/HeartbeatManager'
import { HeartbeatDebugProvider } from './HeartbeatDebugOverlay'
import { HeartbeatTouchBoundary } from './HeartbeatTouchBoundary'

// Default activity detection configuration
const DEFAULT_ACTIVITY_DETECTION_CONFIG: ActivityDetectionConfig = {
  touchThrottleMs: 100,
  scrollThrottleMs: 1000,
  scrollThreshold: 5
}

const TrackingContext = createContext<TrackingContextValue | null>(null)

export const useTrackingContext = () => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider')
  }
  return context
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
  enableDebugLogging = __DEV__,
  heartbeatConfig = {
    enableHeartbeats: true,
    secondsBetweenHeartbeats: 150, // Parse.ly standard: 150 seconds
    activeTimeout: 5, // Parse.ly standard: 5 seconds
    onHeartbeat: undefined, // Optional Parse.ly callback
    videoPlaying: false // Parse.ly video tracking
  },
  activityDetectionConfig = DEFAULT_ACTIVITY_DETECTION_CONFIG
}) => {
  // Create debug logger instance
  const debugLogger = createDebugLogger(enableDebugLogging)

  // Initialize Parse.ly SDK
  useEffect(() => {
    if (autoInitialize && siteId) {
      try {
        ExpoParsely.init(siteId)
        debugLogger.success('🔵 [Parse.ly]', 'Parse.ly initialized successfully', { siteId })
      } catch (error) {
        debugLogger.error('🔵 [Parse.ly]', 'Failed to initialize Parse.ly:', error)
      }
    }
  }, [autoInitialize, siteId, debugLogger])

  useEffect(() => {
    heartbeatManager.updateConfig(heartbeatConfig)
    heartbeatManager.start()
    return () => heartbeatManager.stop()
  }, [])

  const recordActivity = useCallback(() => {
    heartbeatManager.recordActivity()
  }, [])

  // Tracking functionality
  const trackPageView = useCallback(
    (context?: Partial<Record<string, any>>) => {
      try {
        if (context?.url) {
          ExpoParsely.trackPageView(context.url, {
            metadata: {
              section: context.section || 'Unknown',
              title: context.title || ''
            }
          })
        }
      } catch (error) {
        debugLogger.error('🔵 [Parse.ly]', 'ParselyProvider trackPageView failed:', error)
      }
    },
    [debugLogger]
  )

  const trackingContextValue: TrackingContextValue = {
    trackPageView,
    isActive: true,
    recordActivity
  }

  const enableHeartbeats = heartbeatConfig.enableHeartbeats ?? true

  const content = enableHeartbeats ? <HeartbeatTouchBoundary>{children}</HeartbeatTouchBoundary> : <>{children}</>

  return (
    <DebugLoggerContext.Provider value={{ enableDebugLogging }}>
      <TrackingContext.Provider value={trackingContextValue}>
        <HeartbeatDebugProvider>{content}</HeartbeatDebugProvider>
      </TrackingContext.Provider>
    </DebugLoggerContext.Provider>
  )
}

export default ParselyProvider
