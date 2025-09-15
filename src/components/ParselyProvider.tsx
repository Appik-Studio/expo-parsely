import React, { createContext, useCallback, useContext, useEffect } from 'react'

import type { ActivityDetectionConfig, ParselyProviderProps, TrackingContextValue } from '../ExpoParsely.types'
import ExpoParsely from '../ExpoParselyModule'
import { HeartbeatDebugProvider } from './HeartbeatDebugOverlay'
import { HeartbeatTouchBoundary } from './HeartbeatTouchBoundary'
import { useReanimatedHeartbeat } from '../hooks/useReanimatedHeartbeat'

const isDev = __DEV__

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
  // Initialize Parse.ly SDK
  useEffect(() => {
    if (autoInitialize && siteId) {
      try {
        ExpoParsely.init(siteId)
        if (isDev) {
          console.log('🔵 [Parse.ly] Parse.ly initialized successfully', { siteId })
        }
      } catch (error) {
        console.error('Failed to initialize Parse.ly:', error)
      }
    }
  }, [autoInitialize, siteId])

  // Initialize heartbeat tracking
  const { startHeartbeat, stopHeartbeat, isActive } = useReanimatedHeartbeat(heartbeatConfig)

  // Start heartbeat when provider mounts
  useEffect(() => {
    startHeartbeat()
    return () => {
      stopHeartbeat().catch(error => {
        if (isDev) console.error('Failed to stop heartbeat on cleanup:', error)
      })
    }
  }, [startHeartbeat, stopHeartbeat])

  // Tracking functionality
  const trackPageView = useCallback((context?: Partial<Record<string, any>>) => {
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
      if (isDev) console.error('ParselyProvider trackPageView failed:', error)
    }
  }, [])

  const trackingContextValue: TrackingContextValue = {
    trackPageView,
    isActive
  }

  const enableHeartbeats = heartbeatConfig.enableHeartbeats ?? true

  const content = enableHeartbeats ? <HeartbeatTouchBoundary>{children}</HeartbeatTouchBoundary> : <>{children}</>

  return (
    <TrackingContext.Provider value={trackingContextValue}>
      <HeartbeatDebugProvider>{content}</HeartbeatDebugProvider>
    </TrackingContext.Provider>
  )
}

export default ParselyProvider
